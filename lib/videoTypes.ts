// Shared video shapes. Every video is an MP4 on the R2 CDN, played by a
// native <video> element.

export type VideoSource = 'r2';

export interface PortfolioVideo {
  id: string;
  source: VideoSource;
  title: string;
  description: string;
  tags: string;
  /** Direct MP4 on the R2 CDN. */
  mp4Url: string;
  posterUrl: string;
  width: number;
  height: number;
  /** Seconds. */
  duration: number;
}

// ── manifest.json, stored in the bucket ─────────────────────

export interface ManifestEntry {
  id: string;
  title: string;
  description: string;
  tags: string;
  videoKey: string;
  posterKey: string;
  contentType: string;
  width: number;
  height: number;
  duration: number;
  uploadedAt: string;
}

export interface VideoManifest {
  version: 1;
  videos: ManifestEntry[];
}

// ── /api/upload-url response ────────────────────────────────

export interface UploadTicket {
  id: string;
  videoKey: string;
  posterKey: string;
  videoPutUrl: string;
  posterPutUrl: string;
}
