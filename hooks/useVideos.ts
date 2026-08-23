import { useEffect, useState } from 'react';
import type { PortfolioVideo, VideoManifest } from '../lib/videoTypes';
import { LEGACY_VIMEO_VIDEOS } from '../lib/legacyVimeo';

// Public CDN origin, e.g. videos.sydhustle.com. Safe to expose — it appears in
// every video URL anyway. A bare hostname is assumed to be https; an explicit
// scheme is honoured, which is what makes local testing against the dev server
// possible.
const RAW_HOST = (import.meta.env.VITE_R2_PUBLIC_HOST ?? '').replace(/\/+$/, '');
const PUBLIC_ORIGIN = RAW_HOST && !/^https?:\/\//.test(RAW_HOST) ? `https://${RAW_HOST}` : RAW_HOST;

export interface UseVideosResult {
  videos: PortfolioVideo[];
  loading: boolean;
  source: 'r2' | 'vimeo';
}

/**
 * Reads the library from manifest.json on the R2 CDN.
 *
 * Deliberately not routed through /api: the manifest is public and edge-cached,
 * so the portfolio costs zero serverless invocations to view. Falls back to the
 * hardcoded Vimeo list whenever R2 is unconfigured, unreachable, or empty, so
 * the page is never blank mid-migration.
 */
export function useVideos(): UseVideosResult {
  const [videos, setVideos] = useState<PortfolioVideo[]>(LEGACY_VIMEO_VIDEOS);
  const [source, setSource] = useState<'r2' | 'vimeo'>('vimeo');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!PUBLIC_ORIGIN) { setLoading(false); return; }

    const controller = new AbortController();
    const base = PUBLIC_ORIGIN;

    fetch(`${base}/manifest.json`, { signal: controller.signal })
      .then(res => (res.ok ? res.json() : Promise.reject(new Error(String(res.status)))))
      .then((manifest: VideoManifest) => {
        const mapped: PortfolioVideo[] = (manifest.videos ?? []).map(v => ({
          id: v.id,
          source: 'r2' as const,
          title: v.title,
          description: v.description,
          tags: v.tags,
          mp4Url: `${base}/${v.videoKey}`,
          posterUrl: v.posterKey ? `${base}/${v.posterKey}` : '',
          width: v.width,
          height: v.height,
          duration: v.duration,
        }));
        if (mapped.length > 0) {
          setVideos(mapped);
          setSource('r2');
        }
      })
      .catch(() => { /* keep the legacy list */ })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, []);

  return { videos, loading, source };
}
