import { useEffect, useState } from 'react';
import type { PortfolioVideo, VideoManifest } from '../lib/videoTypes';
import { LOCAL_VIDEOS } from '../lib/localVideos';

// Public CDN origin, e.g. asani-cdn.sydhustle.com. Safe to expose — it appears
// in every video URL anyway. A bare hostname is assumed to be https; an explicit
// scheme is honoured, which is what makes local testing possible.
const RAW_HOST = (import.meta.env.VITE_R2_PUBLIC_HOST ?? '').replace(/\/+$/, '');
const PUBLIC_ORIGIN = RAW_HOST && !/^https?:\/\//.test(RAW_HOST) ? `https://${RAW_HOST}` : RAW_HOST;

export interface UseVideosResult {
  videos: PortfolioVideo[];
  /** True until the first response lands, so callers can hold the empty state. */
  loading: boolean;
}

/**
 * Reads the library from manifest.json on the R2 CDN.
 *
 * Deliberately not routed through /api: the manifest is public and edge-cached,
 * so viewing the portfolio costs zero serverless invocations.
 *
 * R2 always takes precedence. The bundled local reel only shows while R2 is
 * unconfigured, unreachable, or still empty — the moment the manifest lists a
 * video, these are replaced.
 */
export function useVideos(): UseVideosResult {
  const [videos, setVideos] = useState<PortfolioVideo[]>(LOCAL_VIDEOS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!PUBLIC_ORIGIN) { setLoading(false); return; }

    const controller = new AbortController();
    const base = PUBLIC_ORIGIN;

    fetch(`${base}/manifest.json`, { signal: controller.signal })
      .then(res => (res.ok ? res.json() : Promise.reject(new Error(String(res.status)))))
      .then((manifest: VideoManifest) => {
        const entries = manifest.videos ?? [];
        if (entries.length === 0) return;   // nothing uploaded yet — keep the local reel
        setVideos(entries.map(v => ({
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
        })));
      })
      .catch(err => {
        if (err?.name !== 'AbortError') console.error('[useVideos]', err);
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, []);

  return { videos, loading };
}
