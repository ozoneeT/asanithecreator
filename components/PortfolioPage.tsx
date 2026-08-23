import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Heart, MessageCircle, Share2, Music, Volume2, VolumeX, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type Player from '@vimeo/player';
import VideoPlayer, { type VideoPlayerHandle } from './VideoPlayer';
import { useVideos } from '../hooks/useVideos';

// Legacy Vimeo embed. Stable URL so the iframe never reloads;
// muted=1 is required for autoplay on iOS — we un-mute via the SDK.
const buildVimeoSrc = (videoId: string) =>
  `https://player.vimeo.com/video/${videoId}?loop=1&muted=1&controls=0&dnt=1&title=0&byline=0&portrait=0`;

const PortfolioPage: React.FC = () => {
  const navigate = useNavigate();
  const { videos } = useVideos();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const [showUnmuteHint, setShowUnmuteHint] = useState(false);
  // Vimeo slides only — Bunny slides use the <video poster> attribute instead.
  const [startedIndices, setStartedIndices] = useState<Set<number>>(() => new Set());

  const containerRef = useRef<HTMLDivElement>(null);
  const vimeoRefs = useRef<Map<number, Player>>(new Map());
  const playerRefs = useRef<Map<number, VideoPlayerHandle>>(new Map());

  // Refs that are always current — safe to read inside async callbacks
  const isMutedRef = useRef(true);
  const currentIndexRef = useRef(0);

  useEffect(() => { currentIndexRef.current = currentIndex; }, [currentIndex]);

  // Reset only when the library's *contents* change (the Vimeo fallback being
  // replaced by R2), never on a mere new array identity — a re-fetch returning
  // the same videos would otherwise yank the viewer back to the first slide.
  const signature = videos.map(v => v.id).join('|');
  const prevSignature = useRef(signature);
  useEffect(() => {
    if (prevSignature.current === signature) return;
    prevSignature.current = signature;
    setCurrentIndex(0);
    setStartedIndices(new Set());
    containerRef.current?.scrollTo({ top: 0 });
  }, [signature]);

  // ── Scroll detection ───────────────────────────────────────
  const handleScroll = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    // Measure against the container, not window.innerHeight: slides are sized in
    // dvh, and on mobile the two diverge as the address bar shows and hides.
    const slideHeight = el.clientHeight;
    if (slideHeight === 0) return;
    const idx = Math.round(el.scrollTop / slideHeight);
    if (idx !== currentIndexRef.current && idx >= 0 && idx < videos.length) {
      setCurrentIndex(idx);
    }
  }, [videos.length]);

  const applyUnmuteToVimeo = (player: Player) => {
    player.setMuted(false).catch(() => {});
    player.setVolume(1).catch(() => {});
  };

  // ── Attach the Vimeo SDK once an iframe loads ──────────────
  // Empty deps + refs only: onLoad fires once, so captured state would go stale.
  const onVimeoLoad = useCallback((iframe: HTMLIFrameElement, index: number) => {
    vimeoRefs.current.get(index)?.destroy().catch(() => {});

    // Fetched on demand so the Vimeo SDK disappears from the bundle entirely
    // once every video has moved to Bunny.
    void import('@vimeo/player').then(({ default: VimeoPlayer }) => {
      const player = new VimeoPlayer(iframe);
      vimeoRefs.current.set(index, player);

      // timeupdate (not 'play') — only fires once frames are actually moving,
      // so the poster stays up through the whole player boot.
      const markStarted = () => {
        setStartedIndices(prev => (prev.has(index) ? prev : new Set(prev).add(index)));
        player.off('timeupdate', markStarted);
      };
      player.on('timeupdate', markStarted);

      player.ready().then(() => {
        if (index === currentIndexRef.current) {
          player.play().catch(() => {});
          if (!isMutedRef.current) applyUnmuteToVimeo(player);
        }
      }).catch(() => {});
    });
  }, []);

  const registerPlayer = useCallback((index: number, handle: VideoPlayerHandle | null) => {
    if (handle) playerRefs.current.set(index, handle);
    else playerRefs.current.delete(index);
  }, []);

  // ── React to index changes ─────────────────────────────────
  useEffect(() => {
    vimeoRefs.current.forEach((player, idx) => {
      if (idx === currentIndex) {
        player.play().catch(() => {});
        if (!isMutedRef.current) applyUnmuteToVimeo(player);
      } else {
        player.pause().catch(() => {});
      }

      // Free memory for slides more than one step away
      if (Math.abs(idx - currentIndex) > 1) {
        player.destroy().catch(() => {});
        vimeoRefs.current.delete(idx);
        // Its iframe unmounts too, so show the poster again on re-entry.
        setStartedIndices(prev => {
          if (!prev.has(idx)) return prev;
          const next = new Set(prev);
          next.delete(idx);
          return next;
        });
      }
    });

    // VideoPlayer pauses itself via its `active` prop; only mute needs syncing.
    playerRefs.current.get(currentIndex)?.setMuted(isMutedRef.current);

    if (!isMutedRef.current) {
      setShowUnmuteHint(true);
      const t = setTimeout(() => setShowUnmuteHint(false), 3000);
      return () => clearTimeout(t);
    }
  }, [currentIndex]);

  // ── Mute control, applied to whichever player is active ────
  const applyMuted = useCallback((next: boolean) => {
    setIsMuted(next);
    isMutedRef.current = next;
    setShowUnmuteHint(false);

    const idx = currentIndexRef.current;
    playerRefs.current.get(idx)?.setMuted(next);
    const player = vimeoRefs.current.get(idx);
    if (player) {
      player.setMuted(next).catch(() => {});
      player.setVolume(next ? 0 : 1).catch(() => {});
    }
  }, []);

  const handleToggleMute = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    applyMuted(!isMutedRef.current);
  }, [applyMuted]);

  // Tapping the video unmutes — this counts as the user gesture iOS requires.
  const handleVideoTap = useCallback(() => {
    if (!isMutedRef.current) return;
    applyMuted(false);
  }, [applyMuted]);

  useEffect(() => {
    const vimeo = vimeoRefs.current;
    return () => {
      vimeo.forEach(p => p.destroy().catch(() => {}));
      vimeo.clear();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className="h-[100dvh] w-full bg-black overflow-y-auto overflow-x-hidden snap-y snap-mandatory relative"
    >
      <button
        onClick={() => navigate(-1)}
        className="fixed top-6 left-6 md:top-8 md:left-8 z-[100] p-3 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-white hover:bg-white/10 transition-colors"
        aria-label="Go back"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>

      <AnimatePresence>
        {showUnmuteHint && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            onClick={handleVideoTap}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[90] pointer-events-auto cursor-pointer"
          >
            <div className="flex items-center gap-2 bg-black/70 backdrop-blur-md text-white text-sm font-medium px-5 py-3 rounded-full border border-white/15 shadow-xl">
              <Volume2 className="w-4 h-4" />
              Tap to unmute
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {videos.map((video, index) => {
        const isActiveVideo = index === currentIndex;
        const isNearby = Math.abs(currentIndex - index) <= 1;
        const hasStarted = startedIndices.has(index);

        return (
          <div
            key={video.id}
            onClick={handleVideoTap}
            className="snap-start shrink-0 h-[100dvh] w-full relative flex items-center justify-center bg-black cursor-pointer"
          >
            {isNearby && (
              <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                <div className="w-full h-full relative flex items-center justify-center bg-zinc-900">
                  <div className="absolute flex flex-col items-center justify-center gap-3 z-0 pointer-events-none">
                    <Loader2 className="w-8 h-8 text-white/50 animate-spin" />
                    <span className="text-white/50 text-sm font-medium">Loading...</span>
                  </div>

                  {video.mp4Url ? (
                    // R2: native player. The poster attribute covers startup,
                    // so no separate overlay image is needed.
                    <VideoPlayer
                      ref={handle => registerPlayer(index, handle)}
                      src={video.mp4Url}
                      poster={video.posterUrl}
                      active={isActiveVideo}
                      muted={isMuted}
                      className="w-full h-full object-cover scale-[1.05] relative z-10 bg-transparent pointer-events-none"
                    />
                  ) : (
                    <>
                      <iframe
                        src={buildVimeoSrc(video.id)}
                        className="w-full h-full scale-[1.05] pointer-events-none relative z-10 bg-transparent"
                        allow="autoplay; fullscreen; picture-in-picture"
                        loading={index === 0 ? 'eager' : 'lazy'}
                        title={video.title}
                        onLoad={e => onVimeoLoad(e.currentTarget, index)}
                      />
                      {/* Poster paints instantly from our own origin, then fades
                          once the Vimeo player produces real frames. */}
                      <img
                        src={video.posterUrl}
                        alt=""
                        aria-hidden="true"
                        decoding="async"
                        fetchPriority={index === 0 ? 'high' : 'auto'}
                        onError={e => { e.currentTarget.style.display = 'none'; }}
                        className={`absolute inset-0 w-full h-full object-cover scale-[1.05] z-20 pointer-events-none transition-opacity duration-500 ${hasStarted ? 'opacity-0' : 'opacity-100'}`}
                      />
                    </>
                  )}
                </div>
              </div>
            )}

            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 pointer-events-none z-10" />

            <AnimatePresence>
              {isActiveVideo && (
                <motion.div
                  key={`ui-${video.id}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="absolute inset-0 pointer-events-none z-20 flex flex-col justify-end p-6 md:p-10"
                >
                  <div className="flex items-end justify-between w-full max-w-7xl mx-auto pb-8 md:pb-12">
                    <div className="flex-1 max-w-lg">
                      <h2 className="text-xl md:text-2xl font-bold text-white mb-2">{video.title}</h2>
                      {video.description && (
                        <p className="text-sm md:text-base text-white/80 line-clamp-2 md:line-clamp-none mb-1">
                          {video.description}
                        </p>
                      )}
                      {video.tags && <p className="text-xs text-white/50 mb-4">{video.tags}</p>}
                      <div className="flex items-center gap-2 text-white/90 text-sm bg-black/40 w-fit px-3 py-1.5 rounded-full backdrop-blur-md border border-white/10">
                        <Music className="w-4 h-4 animate-spin" style={{ animationDuration: '4s' }} />
                        <span className="truncate max-w-[150px]">Original Sound - Asani</span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-5 items-center ml-4 pointer-events-auto pb-4">
                      <button
                        onClick={handleToggleMute}
                        className="group flex flex-col items-center gap-1 hover:scale-110 transition-transform mb-2"
                        aria-label={isMuted ? 'Unmute' : 'Mute'}
                      >
                        <div className="p-3 md:p-4 rounded-full bg-black/40 backdrop-blur-md border border-white/10">
                          {isMuted
                            ? <VolumeX className="w-6 h-6 md:w-8 md:h-8 text-white" />
                            : <Volume2 className="w-6 h-6 md:w-8 md:h-8 text-white" />}
                        </div>
                      </button>

                      <button className="group flex flex-col items-center gap-1 hover:scale-110 transition-transform">
                        <div className="p-3 md:p-4 rounded-full bg-black/40 backdrop-blur-md border border-white/10">
                          <Heart className="w-6 h-6 md:w-8 md:h-8 text-white group-hover:text-red-500 transition-colors" />
                        </div>
                        <span className="text-white text-xs font-bold drop-shadow-md">4.2k</span>
                      </button>

                      <button className="group flex flex-col items-center gap-1 hover:scale-110 transition-transform">
                        <div className="p-3 md:p-4 rounded-full bg-black/40 backdrop-blur-md border border-white/10">
                          <MessageCircle className="w-6 h-6 md:w-8 md:h-8 text-white group-hover:text-[#bfff00] transition-colors" />
                        </div>
                        <span className="text-white text-xs font-bold drop-shadow-md">128</span>
                      </button>

                      <button className="group flex flex-col items-center gap-1 hover:scale-110 transition-transform">
                        <div className="p-3 md:p-4 rounded-full bg-black/40 backdrop-blur-md border border-white/10">
                          <Share2 className="w-6 h-6 md:w-8 md:h-8 text-white group-hover:text-[#7000FF] transition-colors" />
                        </div>
                        <span className="text-white text-xs font-bold drop-shadow-md">Share</span>
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
};

export default PortfolioPage;
