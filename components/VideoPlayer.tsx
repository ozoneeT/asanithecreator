import React, { useCallback, useEffect, useRef, useImperativeHandle, forwardRef } from 'react';

export interface VideoPlayerHandle {
  play(): void;
  pause(): void;
  setMuted(muted: boolean): void;
}

interface VideoPlayerProps {
  src: string;
  poster: string;
  active: boolean;
  muted: boolean;
  className?: string;
}

/**
 * Plain <video> playing an MP4 straight off the R2 CDN.
 *
 * This is the whole point of leaving Vimeo: no third-party iframe, no player
 * bundle, and for clips this short no HLS manifest round-trip either. The
 * browser range-requests the file and starts painting almost immediately.
 */
const VideoPlayer = forwardRef<VideoPlayerHandle, VideoPlayerProps>(
  ({ src, poster, active, muted, className }, ref) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    // Read inside event handlers, which outlive the render that created them.
    const activeRef = useRef(active);
    useEffect(() => { activeRef.current = active; }, [active]);

    /**
     * Calling play() while readyState is 0 leaves a promise that any teardown
     * rejects with AbortError — and in dev, StrictMode's remount does exactly
     * that, so the slide would stay frozen on its poster. Retrying from the
     * media's own readiness events makes autoplay independent of mount timing.
     */
    const tryPlay = useCallback(() => {
      const video = videoRef.current;
      if (!video || !activeRef.current) return;
      video.play().catch(() => {});
    }, []);

    useImperativeHandle(ref, () => ({
      play() { tryPlay(); },
      pause() { videoRef.current?.pause(); },
      setMuted(next: boolean) {
        const el = videoRef.current;
        if (el) { el.muted = next; el.volume = next ? 0 : 1; }
      },
    }), []);

    // ── Play only the slide in view ────────────────────────────
    useEffect(() => {
      const video = videoRef.current;
      if (!video) return;
      if (active) {
        tryPlay();
      } else {
        video.pause();
        // Rewind so a slide always restarts from the top when scrolled back to.
        if (video.currentTime > 0) video.currentTime = 0;
      }
    }, [active, tryPlay]);

    // ── Mute state is driven by the parent ─────────────────────
    useEffect(() => {
      const video = videoRef.current;
      if (!video) return;
      video.muted = muted;
      video.volume = muted ? 0 : 1;
    }, [muted]);

    return (
      <video
        ref={videoRef}
        src={src}
        poster={poster || undefined}
        className={className}
        // muted + playsInline are both required for autoplay on iOS.
        muted
        playsInline
        loop
        // Idle slides fetch headers only; the visible one buffers ahead.
        preload={active ? 'auto' : 'metadata'}
        onCanPlay={tryPlay}
        onLoadedData={tryPlay}
        disablePictureInPicture
        controls={false}
      />
    );
  },
);

VideoPlayer.displayName = 'VideoPlayer';
export default VideoPlayer;
