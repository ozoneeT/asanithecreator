
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Play, Pause, VolumeX, Volume2, ArrowUpRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

interface VideoShowcaseProps {
  isActive?: boolean;
}

const VideoShowcase: React.FC<VideoShowcaseProps> = ({ isActive = false }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const navigate = useNavigate();

  // Stable ref callback — useCallback with [] runs ONLY on mount/unmount.
  // An inline arrow function would re-run every render and reset el.muted = true.
  const setVideoRef = useCallback((el: HTMLVideoElement | null) => {
    videoRef.current = el;
    if (el) { el.setAttribute('muted', ''); el.muted = true; }
  }, []);

  // Autoplay / pause when section enters or leaves view
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (isActive) {
      video.play().then(() => setIsPlaying(true)).catch(() => {});
    } else {
      video.pause();
      setIsPlaying(false);
    }
  }, [isActive]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    const newMuted = !video.muted;
    video.muted = newMuted;
    setIsMuted(newMuted);
  };

  return (
    <section className="h-screen w-full relative overflow-hidden bg-black">

      {/* Blurred video — scale slightly to hide blur edges */}
      <video
        ref={setVideoRef}
        src="/Production_Studio.MP4"
        className="absolute inset-0 w-full h-full object-cover"
        style={{ filter: 'blur(8px)', transform: 'scale(1.06)' }}
        loop
        playsInline
        preload="auto"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />

      {/* Gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-black/50 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-transparent pointer-events-none" />

      {/* Top label */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={isActive ? { opacity: 1, y: 0 } : { opacity: 0, y: -10 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="absolute top-8 left-8 md:top-10 md:left-12"
      >
        <span className="text-[10px] uppercase tracking-[0.5em] text-[#bfff00] opacity-80 font-medium">
          Work
        </span>
      </motion.div>

      {/* Bottom content */}
      <div className="absolute bottom-0 left-0 right-0 px-8 pb-10 md:px-16 md:pb-16">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isActive ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
          className="max-w-xl"
        >
          <h2 className="text-5xl md:text-7xl serif text-white leading-[0.95] mb-4 md:mb-5">
            Production<br />Studio
          </h2>
          <p className="text-white/55 text-sm md:text-base max-w-sm mb-8 leading-relaxed">
            Mobile-first cinematic content — brand campaigns, lifestyle reels, and event
            coverage crafted to stop the scroll.
          </p>
          <button
            onClick={() => navigate('/portfolio')}
            className="group inline-flex items-center gap-3 text-white border border-white/25 px-6 py-3 rounded-full hover:bg-white hover:text-black transition-all duration-300"
          >
            <span className="text-sm font-medium tracking-wide">View Portfolio</span>
            <ArrowUpRight
              size={15}
              className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-200"
            />
          </button>
        </motion.div>
      </div>

      {/* Playback controls — bottom right */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={isActive ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="absolute bottom-10 right-6 md:bottom-16 md:right-10 flex items-center gap-2"
      >
        <button
          onClick={toggleMute}
          aria-label={isMuted ? 'Unmute' : 'Mute'}
          className="p-2.5 rounded-full bg-black/40 backdrop-blur-sm border border-white/10 text-white hover:bg-white/10 transition-colors"
        >
          {isMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
        </button>
        <button
          onClick={togglePlay}
          aria-label={isPlaying ? 'Pause' : 'Play'}
          className="p-2.5 rounded-full bg-black/40 backdrop-blur-sm border border-white/10 text-white hover:bg-white/10 transition-colors"
        >
          {isPlaying ? <Pause size={15} /> : <Play size={15} />}
        </button>
      </motion.div>

    </section>
  );
};

export default VideoShowcase;
