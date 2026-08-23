
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Play, Pause, VolumeX, Volume2, ArrowUpRight } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { PORTFOLIO_ITEMS } from '../constants';

const VIDEO_SRC = '/Production_Studio.MP4';
const POSTER_SRC = '/production-studio-poster.jpg';
const AMBIENT_SRC = '/production-studio-ambient.jpg';

const DISCIPLINES = ['Brand', 'Lifestyle', 'Events', 'Social'];

interface VideoShowcaseProps {
  isActive?: boolean;
}

const VideoShowcase: React.FC<VideoShowcaseProps> = ({ isActive = false }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const progressRef = useRef<HTMLDivElement | null>(null);
  const isActiveRef = useRef(isActive);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [needsTap, setNeedsTap] = useState(false);

  const navigate = useNavigate();
  const reduceMotion = useReducedMotion();

  isActiveRef.current = isActive;

  // Stable ref callback — useCallback with [] runs ONLY on mount/unmount.
  // An inline arrow would re-run every render and reset el.muted = true.
  // iOS needs the muted / playsinline *attributes*, not just the properties.
  const setVideoRef = useCallback((el: HTMLVideoElement | null) => {
    videoRef.current = el;
    if (!el) return;
    el.setAttribute('muted', '');
    el.setAttribute('playsinline', '');
    el.setAttribute('webkit-playsinline', '');
    el.muted = true;
    el.defaultMuted = true;
  }, []);

  // Single place that tries to start playback and records whether it worked.
  const attemptPlay = useCallback(async () => {
    const video = videoRef.current;
    if (!video) return false;
    try {
      await video.play();
      setNeedsTap(false);
      return true;
    } catch {
      // Blocked (iOS Low Power Mode, data saver, strict autoplay policy).
      setNeedsTap(true);
      return false;
    }
  }, []);

  // Play / pause as the section enters and leaves view.
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (!isActive) {
      video.pause();
      return;
    }

    attemptPlay();

    // The first attempt can land before the file has any data — retry once
    // the browser says it is ready.
    const retry = () => { if (isActiveRef.current && videoRef.current?.paused) attemptPlay(); };
    video.addEventListener('loadeddata', retry);
    video.addEventListener('canplay', retry);
    return () => {
      video.removeEventListener('loadeddata', retry);
      video.removeEventListener('canplay', retry);
    };
  }, [isActive, attemptPlay]);

  // Autoplay policies unlock after the first user gesture anywhere on the page.
  // Visitors always scroll or tap before reaching this section, so this recovers
  // the browsers (mobile Safari especially) that refuse the very first play().
  useEffect(() => {
    const unlock = () => {
      if (isActiveRef.current && videoRef.current?.paused) attemptPlay();
    };
    const events: (keyof DocumentEventMap)[] = ['pointerdown', 'touchstart', 'keydown', 'wheel'];
    events.forEach(e => document.addEventListener(e, unlock, { passive: true }));
    return () => events.forEach(e => document.removeEventListener(e, unlock));
  }, [attemptPlay]);

  // Browsers pause media in a backgrounded tab — resume when the visitor returns.
  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === 'visible' && isActiveRef.current && videoRef.current?.paused) {
        attemptPlay();
      }
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, [attemptPlay]);

  // The declarative `autoplay` attribute is what makes iOS Safari cooperate, but
  // it can also start the reel while the section is still off-screen. Park it back
  // at the opening frame until the visitor actually gets here.
  const handlePlay = useCallback(() => {
    const video = videoRef.current;
    if (!isActiveRef.current && video) {
      video.pause();
      video.currentTime = 0;
      return;
    }
    setIsPlaying(true);
    setNeedsTap(false);
  }, []);

  // Repaint the progress bar without re-rendering React on every frame tick.
  const handleTimeUpdate = useCallback(() => {
    const video = videoRef.current;
    const bar = progressRef.current;
    if (!video || !bar || !video.duration) return;
    bar.style.transform = `scaleX(${video.currentTime / video.duration})`;
  }, []);

  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) attemptPlay(); else video.pause();
  }, [attemptPlay]);

  const toggleMute = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    const next = !video.muted;
    video.muted = next;
    setIsMuted(next);
    // Unmuting counts as a gesture — good moment to recover a blocked video.
    if (!next && video.paused) attemptPlay();
  }, [attemptPlay]);

  const show = (delay: number) => ({
    initial: { opacity: 0, y: 24 },
    animate: isActive ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 },
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const, delay },
  });

  return (
    <section
      aria-label="Production Studio showreel"
      className="relative h-screen w-full overflow-hidden bg-[#0a0a0a]"
    >
      {/* ── Ambient backdrop ─────────────────────────────────────────────
          A 64px thumbnail blurred up to full screen: the colour and mood of
          the reel, for a fraction of the cost of blurring a live video. */}
      <div aria-hidden className="absolute inset-0">
        <img
          src={AMBIENT_SRC}
          alt=""
          className="h-full w-full scale-125 object-cover opacity-50"
          style={{ filter: 'blur(28px) saturate(150%)' }}
        />
        <div
          className="absolute inset-0"
          style={{ background: 'radial-gradient(120% 90% at 70% 30%, rgba(112,0,255,0.18) 0%, transparent 60%)' }}
        />
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(to bottom, #0a0a0a 0%, rgba(10,10,10,0.55) 35%, rgba(10,10,10,0.75) 70%, #0a0a0a 100%)' }}
        />
      </div>

      {/* ── Content ──────────────────────────────────────────────────────── */}
      <div className="relative z-10 mx-auto flex h-full w-full max-w-[1440px] flex-col justify-center gap-6 px-6 pt-24 pb-20 sm:gap-8 sm:px-10 lg:grid lg:grid-cols-12 lg:items-center lg:gap-x-16 lg:px-16 lg:pt-28 lg:pb-24 xl:pr-28">

        {/* ── Left: copy ─────────────────────────────────────────────────── */}
        <div className="order-2 lg:order-1 lg:col-span-5">
          <motion.div {...show(0.1)} className="flex items-center gap-3">
            <span className="h-[1px] w-8 bg-[#bfff00]/60" />
            <span className="text-[10px] font-medium uppercase tracking-[0.45em] text-[#bfff00]">
              Showreel
            </span>
          </motion.div>

          <motion.h2
            {...show(0.18)}
            className="serif mt-4 text-[2.6rem] leading-[0.95] text-white sm:text-6xl lg:mt-6 lg:text-7xl xl:text-[5.25rem]"
          >
            Production
            <span className="block italic text-white/70">Studio</span>
          </motion.h2>

          <motion.p
            {...show(0.26)}
            className="mt-4 max-w-md text-sm leading-relaxed text-white/55 sm:text-base lg:mt-6"
          >
            Mobile-first cinematic content — brand campaigns, lifestyle reels and
            event coverage, crafted frame by frame to stop the scroll.
          </motion.p>

          {/* Primary call to action */}
          <motion.div {...show(0.34)} className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-4 lg:mt-10">
            <div className="relative">
              {/* Radar halo — draws the eye straight to the button */}
              {!reduceMotion && (
                <motion.span
                  aria-hidden
                  className="pointer-events-none absolute inset-0 rounded-full"
                  animate={{
                    boxShadow: [
                      '0 0 0 0px rgba(191,255,0,0.45)',
                      '0 0 0 16px rgba(191,255,0,0)',
                    ],
                  }}
                  transition={{ duration: 2.2, repeat: Infinity, ease: 'easeOut' }}
                />
              )}
              <button
                onClick={() => navigate('/portfolio')}
                className="group relative inline-flex items-center gap-3 overflow-hidden rounded-full bg-[#bfff00] px-7 py-4 text-sm font-bold uppercase tracking-[0.12em] text-black shadow-[0_18px_45px_-14px_rgba(191,255,0,0.75)] transition-transform duration-300 hover:scale-[1.03] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#bfff00] active:scale-100 sm:px-9"
              >
                {/* Shine sweep on hover */}
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/60 to-transparent transition-transform duration-700 group-hover:translate-x-full"
                />
                <span className="relative">View My Portfolio</span>
                <ArrowUpRight
                  size={18}
                  strokeWidth={2.5}
                  className="relative transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1"
                />
              </button>
            </div>

            <button
              onClick={toggleMute}
              className="group inline-flex items-center gap-2 text-xs font-medium text-white/50 transition-colors hover:text-white"
            >
              {isMuted ? <Volume2 size={15} /> : <VolumeX size={15} />}
              <span className="border-b border-white/20 pb-0.5 group-hover:border-white/60">
                {isMuted ? 'Play with sound' : 'Mute the reel'}
              </span>
            </button>
          </motion.div>

          {/* Credentials */}
          <motion.div
            {...show(0.42)}
            className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 text-[9px] uppercase tracking-[0.28em] text-white/35 sm:text-[10px] lg:mt-10"
          >
            <span className="text-white/70">{PORTFOLIO_ITEMS.length} Films</span>
            <span className="hidden h-3 w-[1px] bg-white/15 sm:block" />
            <span>{DISCIPLINES.join(' · ')}</span>
          </motion.div>
        </div>

        {/* ── Right: the reel ────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 32, scale: 0.97 }}
          animate={isActive ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 32, scale: 0.97 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="relative order-1 w-full lg:order-2 lg:col-span-7"
        >
          {/* Glow bed */}
          <div
            aria-hidden
            className="absolute -inset-6 rounded-[2rem] opacity-70 blur-3xl"
            style={{ background: 'linear-gradient(120deg, rgba(112,0,255,0.35), rgba(191,255,0,0.16))' }}
          />

          <div className="group relative overflow-hidden rounded-2xl bg-black shadow-[0_50px_120px_-30px_rgba(0,0,0,0.95)] ring-1 ring-white/12">
            <video
              ref={setVideoRef}
              src={VIDEO_SRC}
              poster={POSTER_SRC}
              className="block aspect-video w-full object-cover"
              autoPlay
              loop
              muted
              playsInline
              preload="auto"
              disablePictureInPicture
              onPlay={handlePlay}
              onPause={() => setIsPlaying(false)}
              onTimeUpdate={handleTimeUpdate}
            />

            {/* Legibility scrim for the frame chrome */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0"
              style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.45) 0%, transparent 25%, transparent 65%, rgba(0,0,0,0.55) 100%)' }}
            />

            {/* Reel badge */}
            <div className="pointer-events-none absolute left-4 top-4 flex items-center gap-2 rounded-full bg-black/40 px-3 py-1.5 backdrop-blur-md sm:left-5 sm:top-5">
              <span className="relative flex h-1.5 w-1.5">
                {!reduceMotion && isPlaying && (
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#bfff00] opacity-75" />
                )}
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#bfff00]" />
              </span>
              <span className="text-[9px] font-semibold uppercase tracking-[0.3em] text-white/85">
                Showreel 2024
              </span>
            </div>

            {/* Controls, inside the frame so nothing collides with page furniture */}
            <div className="absolute right-4 top-4 flex items-center gap-2 sm:right-5 sm:top-5">
              <button
                onClick={toggleMute}
                aria-label={isMuted ? 'Unmute showreel' : 'Mute showreel'}
                className="rounded-full bg-black/40 p-2.5 text-white/90 backdrop-blur-md ring-1 ring-white/15 transition-colors hover:bg-black/70 hover:text-[#bfff00]"
              >
                {isMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
              </button>
              <button
                onClick={togglePlay}
                aria-label={isPlaying ? 'Pause showreel' : 'Play showreel'}
                className="rounded-full bg-black/40 p-2.5 text-white/90 backdrop-blur-md ring-1 ring-white/15 transition-colors hover:bg-black/70 hover:text-[#bfff00]"
              >
                {isPlaying ? <Pause size={15} /> : <Play size={15} />}
              </button>
            </div>

            {/* Fallback when the browser refuses to autoplay */}
            {needsTap && (
              <button
                onClick={togglePlay}
                aria-label="Play showreel"
                className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-black/45 backdrop-blur-[2px]"
              >
                <span className="flex h-16 w-16 items-center justify-center rounded-full bg-[#bfff00] text-black shadow-[0_0_40px_rgba(191,255,0,0.5)]">
                  <Play size={24} className="ml-1" fill="currentColor" />
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-white/80">
                  Tap to play
                </span>
              </button>
            )}

            {/* Progress */}
            <div aria-hidden className="absolute inset-x-0 bottom-0 h-[3px] bg-white/10">
              <div
                ref={progressRef}
                className="h-full origin-left bg-[#bfff00]"
                style={{ transform: 'scaleX(0)' }}
              />
            </div>
          </div>

          {/* Frame corner accents */}
          <div aria-hidden className="absolute -left-3 -top-3 hidden h-8 w-8 rounded-tl-lg border-l border-t border-white/20 sm:block" />
          <div aria-hidden className="absolute -bottom-3 -right-3 hidden h-8 w-8 rounded-br-lg border-b border-r border-white/20 sm:block" />
        </motion.div>
      </div>
    </section>
  );
};

export default VideoShowcase;
