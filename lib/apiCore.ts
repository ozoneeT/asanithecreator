// Framework-agnostic API logic, shared by the Vercel functions in api/* and the
// dev middleware in vite.config.ts.
//
// Reads do NOT go through here — the portfolio fetches manifest.json straight
// from the R2 CDN. These endpoints only handle authenticated writes.

import {
  readConfig, checkStudioPassword, readManifest, writeManifest,
  presignPut, deleteKeys, newVideoId,
} from './r2Server';
import type { ManifestEntry, UploadTicket } from './videoTypes';

export interface ApiResult { status: number; body: unknown }

const UNAUTHORIZED: ApiResult = { status: 401, body: { error: 'Unauthorized' } };
const NOT_CONFIGURED: ApiResult = {
  status: 503,
  body: { error: 'Cloudflare R2 is not configured on the server.' },
};

const str = (v: unknown, max: number): string =>
  typeof v === 'string' ? v.trim().slice(0, max) : '';
const num = (v: unknown): number =>
  typeof v === 'number' && Number.isFinite(v) && v >= 0 ? v : 0;

/** Videos we are willing to serve. HEVC is excluded — Chrome and Firefox can't play it. */
const ALLOWED_TYPES = new Set(['video/mp4', 'video/webm']);

/** POST /api/studio-auth — validates the studio password and nothing else. */
export async function handleStudioAuth(password: string | undefined): Promise<ApiResult> {
  if (!checkStudioPassword(password)) return UNAUTHORIZED;
  const cfg = readConfig();
  return {
    status: 200,
    body: { ok: true, storageConfigured: cfg !== null, publicHost: cfg?.publicHost ?? null },
  };
}

/** GET /api/videos — the studio's library view. Public pages read the CDN directly. */
export async function handleVideos(password: string | undefined): Promise<ApiResult> {
  if (!checkStudioPassword(password)) return UNAUTHORIZED;
  const cfg = readConfig();
  if (!cfg) return NOT_CONFIGURED;
  try {
    const manifest = await readManifest(cfg);
    return { status: 200, body: { videos: manifest.videos, publicHost: cfg.publicHost } };
  } catch (err) {
    console.error('[api/videos]', err);
    return { status: 502, body: { error: 'Could not read the video library.' } };
  }
}

/** POST /api/upload-url — hands back presigned PUTs for one video + its poster. */
export async function handleUploadUrl(
  password: string | undefined,
  payload: Record<string, unknown>,
): Promise<ApiResult> {
  if (!checkStudioPassword(password)) return UNAUTHORIZED;
  const cfg = readConfig();
  if (!cfg) return NOT_CONFIGURED;

  const contentType = str(payload.contentType, 100);
  if (!ALLOWED_TYPES.has(contentType)) {
    return { status: 400, body: { error: `Unsupported video type: ${contentType || 'unknown'}.` } };
  }

  // Older Safari can't encode WebP on a canvas, so the client tells us what it
  // actually produced and we sign a matching key.
  const posterType = str(payload.posterContentType, 100) === 'image/jpeg' ? 'image/jpeg' : 'image/webp';

  const id = newVideoId();
  const ext = contentType === 'video/webm' ? 'webm' : 'mp4';
  const videoKey = `videos/${id}.${ext}`;
  const posterKey = `posters/${id}.${posterType === 'image/jpeg' ? 'jpg' : 'webp'}`;

  try {
    const [videoPutUrl, posterPutUrl] = await Promise.all([
      presignPut(cfg, videoKey, contentType),
      presignPut(cfg, posterKey, posterType),
    ]);
    const ticket: UploadTicket = { id, videoKey, posterKey, videoPutUrl, posterPutUrl };
    return { status: 200, body: ticket };
  } catch (err) {
    console.error('[api/upload-url]', err);
    return { status: 502, body: { error: 'Could not prepare the upload.' } };
  }
}

/**
 * POST /api/finalize — records an upload in manifest.json.
 * Called only after the browser has PUT both objects successfully, so the
 * manifest never advertises a video that isn't there.
 */
export async function handleFinalize(
  password: string | undefined,
  payload: Record<string, unknown>,
): Promise<ApiResult> {
  if (!checkStudioPassword(password)) return UNAUTHORIZED;
  const cfg = readConfig();
  if (!cfg) return NOT_CONFIGURED;

  const id = str(payload.id, 64);
  const title = str(payload.title, 200);
  const videoKey = str(payload.videoKey, 300);
  const posterKey = str(payload.posterKey, 300);
  if (!id || !title || !videoKey) {
    return { status: 400, body: { error: 'id, title and videoKey are required.' } };
  }

  const entry: ManifestEntry = {
    id, title, videoKey, posterKey,
    description: str(payload.description, 2000),
    tags: str(payload.tags, 500),
    contentType: str(payload.contentType, 100) || 'video/mp4',
    width: num(payload.width),
    height: num(payload.height),
    duration: num(payload.duration),
    uploadedAt: new Date().toISOString(),
  };

  try {
    const manifest = await readManifest(cfg);
    // Newest first, and replace rather than duplicate on a retried finalize.
    manifest.videos = [entry, ...manifest.videos.filter(v => v.id !== id)];
    await writeManifest(cfg, manifest);
    return { status: 200, body: { ok: true, video: entry } };
  } catch (err) {
    console.error('[api/finalize]', err);
    return { status: 502, body: { error: 'Upload saved, but the library index could not be updated.' } };
  }
}

/** POST /api/delete-video — removes the entry and its objects. Irreversible. */
export async function handleDeleteVideo(
  password: string | undefined,
  payload: Record<string, unknown>,
): Promise<ApiResult> {
  if (!checkStudioPassword(password)) return UNAUTHORIZED;
  const cfg = readConfig();
  if (!cfg) return NOT_CONFIGURED;

  const id = str(payload.id, 64);
  if (!id) return { status: 400, body: { error: 'id is required.' } };

  try {
    const manifest = await readManifest(cfg);
    const target = manifest.videos.find(v => v.id === id);
    if (!target) return { status: 404, body: { error: 'No such video.' } };

    // De-index first: a stale object costs storage, a stale index shows a
    // broken slide to visitors.
    manifest.videos = manifest.videos.filter(v => v.id !== id);
    await writeManifest(cfg, manifest);
    await deleteKeys(cfg, [target.videoKey, target.posterKey].filter(Boolean));

    return { status: 200, body: { deleted: id } };
  } catch (err) {
    console.error('[api/delete-video]', err);
    return { status: 502, body: { error: 'Could not delete the video.' } };
  }
}
