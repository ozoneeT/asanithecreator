// Browser-side upload preparation: codec check, dimensions, and poster capture.
//
// The codec check matters more than it looks. iPhones record HEVC (H.265) by
// default, which Safari plays happily — so a phone-only "does it play?" test
// would pass and then break for every Chrome and Firefox visitor. We inspect the
// container bytes instead, which gives the same answer on every device.

export class UnsupportedCodecError extends Error {}

/** Media is immutable — each upload gets a fresh id, so it can cache forever. */
export const CACHE_CONTROL_IMMUTABLE = 'public, max-age=31536000, immutable';

export interface ProbedVideo {
  contentType: string;
  width: number;
  height: number;
  duration: number;
  posterBlob: Blob;
  posterContentType: string;
}

const MAX_BYTES = 500 * 1024 * 1024; // 500 MB — well past any sane vertical clip

/** Finds an ASCII fourcc in a byte buffer. */
function containsTag(bytes: Uint8Array, tag: string): boolean {
  const pattern = [...tag].map(c => c.charCodeAt(0));
  outer: for (let i = 0; i <= bytes.length - pattern.length; i++) {
    for (let j = 0; j < pattern.length; j++) {
      if (bytes[i + j] !== pattern[j]) continue outer;
    }
    return true;
  }
  return false;
}

/**
 * Scans the head and tail of the file for codec fourccs in the MP4 sample
 * description. Both ends are checked because recorded video often puts moov at
 * the end while exports put it at the front.
 */
async function detectCodec(file: File): Promise<'h264' | 'hevc' | 'unknown'> {
  const window = 2 * 1024 * 1024;
  const head = new Uint8Array(await file.slice(0, window).arrayBuffer());
  const tail = new Uint8Array(await file.slice(Math.max(0, file.size - window)).arrayBuffer());

  for (const chunk of [head, tail]) {
    if (containsTag(chunk, 'avc1') || containsTag(chunk, 'avc3')) return 'h264';
    if (containsTag(chunk, 'hvc1') || containsTag(chunk, 'hev1')) return 'hevc';
  }
  return 'unknown';
}

/** Loads the file into a detached <video> so we can read metadata and grab a frame. */
function loadVideoElement(url: string): Promise<HTMLVideoElement> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.preload = 'auto';
    video.muted = true;
    video.playsInline = true;
    video.crossOrigin = 'anonymous';
    video.onloadedmetadata = () => resolve(video);
    video.onerror = () => reject(new UnsupportedCodecError('This browser could not decode the video.'));
    video.src = url;
  });
}

/** Seeks to a frame with actual content — the very first frame is often black. */
function seekTo(video: HTMLVideoElement, time: number): Promise<void> {
  return new Promise(resolve => {
    const done = () => { video.removeEventListener('seeked', done); resolve(); };
    video.addEventListener('seeked', done);
    video.currentTime = time;
    // Some browsers never fire 'seeked' on a detached element; don't hang on it.
    setTimeout(done, 3000);
  });
}

async function capturePoster(video: HTMLVideoElement): Promise<{ blob: Blob; type: string }> {
  const targetWidth = 480;
  const scale = Math.min(1, targetWidth / (video.videoWidth || targetWidth));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round((video.videoWidth || targetWidth) * scale);
  canvas.height = Math.round((video.videoHeight || targetWidth) * scale);

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not create a canvas for the poster frame.');
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

  // WebP where the browser can encode it, JPEG otherwise (older Safari).
  const blob = await new Promise<Blob | null>(resolve =>
    canvas.toBlob(resolve, 'image/webp', 0.75),
  );
  if (blob && blob.type === 'image/webp') return { blob, type: 'image/webp' };

  const jpeg = await new Promise<Blob | null>(resolve =>
    canvas.toBlob(resolve, 'image/jpeg', 0.82),
  );
  if (!jpeg) throw new Error('Could not generate a poster frame.');
  return { blob: jpeg, type: 'image/jpeg' };
}

export async function probeVideo(file: File): Promise<ProbedVideo> {
  if (file.size > MAX_BYTES) {
    throw new UnsupportedCodecError(
      `That file is ${(file.size / 1024 / 1024).toFixed(0)} MB. Export a smaller version first.`,
    );
  }

  const codec = await detectCodec(file);
  if (codec === 'hevc') {
    throw new UnsupportedCodecError(
      'This video is HEVC (H.265), which Chrome and Firefox cannot play. ' +
      'On iPhone set Settings → Camera → Formats → Most Compatible, or re-export it as H.264.',
    );
  }

  // QuickTime .mov from an iPhone is an MP4-compatible container; serving it as
  // video/mp4 is what makes it play everywhere.
  const contentType = file.type === 'video/webm' ? 'video/webm' : 'video/mp4';

  const url = URL.createObjectURL(file);
  try {
    const video = await loadVideoElement(url);
    const duration = Number.isFinite(video.duration) ? video.duration : 0;
    await seekTo(video, Math.min(1, duration * 0.1));
    const poster = await capturePoster(video);

    return {
      contentType,
      width: video.videoWidth,
      height: video.videoHeight,
      duration,
      posterBlob: poster.blob,
      posterContentType: poster.type,
    };
  } finally {
    URL.revokeObjectURL(url);
  }
}

/** PUTs a blob to a presigned R2 URL, reporting progress. */
export function putToR2(
  url: string,
  blob: Blob,
  contentType: string,
  onProgress?: (fraction: number) => void,
): Promise<void> {
  return new Promise((resolve, reject) => {
    // XHR rather than fetch: fetch still has no upload progress events.
    const xhr = new XMLHttpRequest();
    xhr.open('PUT', url);
    xhr.setRequestHeader('Content-Type', contentType);
    // Must be sent explicitly. It is signed into the presigned URL but sits
    // outside SignedHeaders, so R2 only stores it if the browser sends it —
    // otherwise every upload lands with no cache headers at all.
    xhr.setRequestHeader('Cache-Control', CACHE_CONTROL_IMMUTABLE);
    xhr.upload.onprogress = e => {
      if (e.lengthComputable && onProgress) onProgress(e.loaded / e.total);
    };
    xhr.onload = () =>
      xhr.status >= 200 && xhr.status < 300
        ? resolve()
        : reject(new Error(`Upload failed (${xhr.status}). Check the bucket's CORS policy.`));
    xhr.onerror = () => reject(new Error('Upload failed. Check your connection and the bucket CORS policy.'));
    xhr.send(blob);
  });
}
