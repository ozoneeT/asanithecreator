import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Heart, MessageCircle, Share2, Music, Volume2, VolumeX, Loader2, Film } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import VideoPlayer, { type VideoPlayerHandle } from './VideoPlayer';
import { useVideos } from '../hooks/useVideos';

const PortfolioPage: React.FC = () => {
  const navigate = useNavigate();
  const { videos, loading } = useVideos();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const [showUnmuteHint, setShowUnmuteHint] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const playerRefs = useRef<Map<number, VideoPlayerHandle>>(new Map());

  // Refs that are always current — safe to read inside async callbacks
  const isMutedRef = useRef(true);
  const currentIndexRef = useRef(0);

  useEffect(() => { currentIndexRef.current = currentIndex; }, [currentIndex]);

  // Reset only when the library's *contents* change, never on a mere new array
  // identity — a re-fetch returning the same videos would otherwise yank the
  // viewer back to the first slide.
  const signature = videos.map(v => v.id).join('|');
  const prevSignature = useRef(signature);
  useEffect(() => {
    if (prevSignature.current === signature) return;
    prevSignature.current = signature;
    setCurrentIndex(0);
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

  const registerPlayer = useCallback((index: number, handle: VideoPlayerHandle | null) => {
    if (handle) playerRefs.current.set(index, handle);
    else playerRefs.current.delete(index);
  }, []);

  // ── React to index changes ─────────────────────────────────
  useEffect(() => {
    // VideoPlayer starts and stops itself via its `active` prop; only the mute
    // state has to follow the viewer from slide to slide.
    playerRefs.current.get(currentIndex)?.setMuted(isMutedRef.current);

    if (!isMutedRef.current) {
      setShowUnmuteHint(true);
      const t = setTimeout(() => setShowUnmuteHint(false), 3000);
      return () => clearTimeout(t);
    }
  }, [currentIndex]);

  // ── Mute control ───────────────────────────────────────────
  const applyMuted = useCallback((next: boolean) => {
    setIsMuted(next);
    isMutedRef.current = next;
    setShowUnmuteHint(false);
    playerRefs.current.get(currentIndexRef.current)?.setMuted(next);
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

  const BackButton = (
    <button
      onClick={() => navigate(-1)}
      className="fixed top-6 left-6 md:top-8 md:left-8 z-[100] p-3 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-white hover:bg-white/10 transition-colors"
      aria-label="Go back"
    >
      <ChevronLeft className="w-6 h-6" />
    </button>
  );

  // ── Empty / loading states ─────────────────────────────────
  if (videos.length === 0) {
    return (
      <div className="h-[100dvh] w-full bg-black flex flex-col items-center justify-center text-center px-6">
        {BackButton}
        {loading ? (
          <Loader2 className="w-8 h-8 text-white/40 animate-spin" />
        ) : (
          <>
            <Film className="w-10 h-10 text-white/25 mb-5" />
            <h1 className="text-white text-xl font-bold serif mb-2">Nothing here yet</h1>
            <p className="text-white/45 text-sm max-w-xs">
              New work lands here as soon as it is uploaded.
            </p>
          </>
        )}
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className="h-[100dvh] w-full bg-black overflow-y-auto overflow-x-hidden snap-y snap-mandatory relative"
    >
      {BackButton}

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

        return (
          <div
            key={video.id}
            onClick={handleVideoTap}
            className="snap-start shrink-0 h-[100dvh] w-full relative flex items-center justify-center bg-black cursor-pointer"
          >
            {isNearby && (
              <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                <div className="w-full h-full relative flex items-center justify-center bg-black">
                  {video.posterUrl && (
                    // Vertical video leaves dead space on a wide screen. A blurred
                    // blow-up of the poster fills it instead of black bars.
                    <img
                      src={video.posterUrl}
                      alt=""
                      aria-hidden="true"
                      className="absolute inset-0 w-full h-full object-cover scale-110 blur-2xl opacity-40 z-0"
                    />
                  )}

                  <Loader2 className="absolute w-8 h-8 text-white/40 animate-spin z-0" />

                  {/* Full-bleed on a phone, centred column on desktop, never
                      stretched — the width cap lives in VideoPlayer. */}
                  <VideoPlayer
                    ref={handle => registerPlayer(index, handle)}
                    src={video.mp4Url}
                    poster={video.posterUrl}
                    active={isActiveVideo}
                    muted={isMuted}
                    aspectRatio={video.width && video.height ? video.width / video.height : undefined}
                    className="relative z-10 h-full w-full object-cover mx-auto pointer-events-none"
                  />
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
