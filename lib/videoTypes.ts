// Shared video shapes.
//
// Provider-agnostic on purpose: R2 items carry a direct mp4Url and play in a
// native <video>; legacy Vimeo items have mp4Url === null and fall back to the
// Vimeo iframe. That lets both coexist while the library is being migrated.

export type VideoSource = 'r2' | 'vimeo';

export interface PortfolioVideo {
  id: string;
  source: VideoSource;
  title: string;
  description: string;
  tags: string;
  /** Direct MP4 on the R2 CDN — null for legacy Vimeo items. */
  mp4Url: string | null;
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
