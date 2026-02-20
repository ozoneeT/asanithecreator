import React, { useState, useRef, useEffect, useCallback } from 'react';
import { PORTFOLIO_VIDEOS } from '../constants';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Heart, MessageCircle, Share2, Music, Volume2, VolumeX, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Player from '@vimeo/player';

const getVideoId = (url: string): string => url.split('/').pop() ?? '';

// Stable iframe URL — never changes so the iframe never reloads.
// muted=1 is required for autoplay on iOS; we un-mute via the SDK.
const buildSrc = (videoId: string) =>
  `https://player.vimeo.com/video/${videoId}?loop=1&muted=1&controls=0&dnt=1&title=0&byline=0&portrait=0`;

const videoIds = PORTFOLIO_VIDEOS.map(getVideoId).filter(Boolean);

// Unique title + description per video — keyed by Vimeo ID
interface VideoMeta { title: string; description: string; tags: string }
const VIDEO_META: Record<string, VideoMeta> = {
  '1163715974': {
    title: 'Brand Campaign — Analee Craftiee',
    description: 'Product showcase that turned views into real sales on launch day. Clean, compelling, built to convert. 🛍️✨',
    tags: '#BrandVideo #UGC #ProductContent',
  },
  '1163715968': {
    title: 'Lifestyle Brand Reel',
    description: 'Personal brand storytelling — authentic moments, cinematic frames, and content that builds real connection. 🌟',
    tags: '#LifestyleContent #PersonalBrand #Reel',
  },
  '1163715925': {
    title: 'Wedding Film — ADELOVE25',
    description: 'Every tender moment and timeless detail preserved in cinematic beauty. A love story told with intention. 💍🎬',
    tags: '#WeddingFilm #EventCoverage #Cinematic',
  },
  '1163715942': {
    title: 'Pre-Wedding Promo — 16K Likes 🔥',
    description: 'This went viral on TikTok with 16K+ likes in 24 hours. Proof that authentic storytelling always wins. 📱🚀',
    tags: '#TikTokViral #SocialMedia #PreWedding',
  },
  '1163715969': {
    title: 'Behind the Lens',
    description: 'Raw, unfiltered moments from set. A glimpse into the creative process that drives every final cut. 🎥',
    tags: '#BTS #ContentCreator #BehindTheScenes',
  },
  '1163715981': {
    title: 'Street Portrait Session',
    description: 'Mobile street photography elevated to cinematic art. Every city block has a story worth capturing. 🏙️',
    tags: '#StreetPortrait #MobileFilm #Urban',
  },
  '1163715971': {
    title: 'Product Showcase Reel',
    description: 'Detail-driven product content that makes every item look irresistible before they even read the caption. 📦🎬',
    tags: '#ProductReel #CommercialVideo #Brand',
  },
  '1163715972': {
    title: 'Instagram Reels Pack',
    description: 'Scroll-stopping reels crafted for the Instagram algorithm. Trend-aware, fast-paced, always on point. 📲',
    tags: '#InstagramReels #ContentPack #SocialMedia',
  },
  '1163715953': {
    title: 'Fitness Brand Launch — Michael',
    description: 'High-energy promo content for Michael\'s fitness brand launch. Crafted to inspire action and drive conversions. 💪🔥',
    tags: '#FitnessContent #BrandLaunch #GymVideo',
  },
  '1163715941': {
    title: 'Creative Direction Session',
    description: 'From concept to camera — creative direction that brings brand vision to life with clarity and precision. 🎨',
    tags: '#CreativeDirection #BrandVideo #Concept',
  },
  '1163715959': {
    title: 'Artist Promo Reel',
    description: 'Cinematic visuals that match the sound. Music video content that amplifies your artistry and reach. 🎵🎬',
    tags: '#MusicVideo #ArtistContent #Cinematic',
  },
  '1163715939': {
    title: 'Travel Content Reel',
    description: 'A cinematic travel story shot entirely on mobile. Motion, light, and culture — all in one frame. ✈️🌍',
    tags: '#TravelReel #MobileFilm #Adventure',
  },
  '1163715940': {
    title: 'Birthday Film — Tobi',
    description: 'Tobi\'s birthday was a whole movie! Cinematic, vibrant, and unforgettable — everyone\'s asking who shot it. 🎂🎬',
    tags: '#BirthdayFilm #EventCoverage #CelebrationReel',
  },
  '1163715958': {
    title: 'Pre-Wedding Reel — Esther & Partner',
    description: 'A dreamy pre-wedding reel that captured hearts. Love stories told beautifully, one frame at a time. 💕',
    tags: '#PreWedding #LoveReel #Cinematic',
  },
  '1163715960': {
    title: 'Production Studio Showreel',
    description: 'A curated highlight of our finest work — brands, events, lifestyle, and more. This is what we do. 🎬✨',
    tags: '#Showreel #Portfolio #ProductionStudio',
  },
  '1163715973': {
    title: 'Food & Lifestyle Content',
    description: 'Delicious visuals that make your audience hungry before they even check the caption. 🍽️✨',
    tags: '#FoodContent #LifestyleVideo #BrandReel',
  },
  '1163715956': {
    title: 'Fashion & Style Reel',
    description: 'Style in motion — editorial fashion content that\'s clean, intentional, and built for the feed. 👗✨',
    tags: '#FashionReel #StyleContent #EditorialVideo',
  },
  '1163715935': {
    title: 'Outdoor Brand Campaign',
    description: 'Golden hour. Open spaces. Content that breathes life into outdoor brand stories. 🌅',
    tags: '#OutdoorContent #GoldenHour #BrandCampaign',
  },
  '1163715938': {
    title: 'Corporate Highlight Film',
    description: 'Professional, polished, and purposeful — corporate content that commands attention and earns trust. 🏢',
    tags: '#CorporateVideo #BusinessContent #Professional',
  },
  '1163715957': {
    title: 'Dance & Performance Reel',
    description: 'Movement captured with rhythm and precision. Performance content that matches the energy of the talent. 💃',
    tags: '#PerformanceReel #DanceVideo #ArtisticContent',
  },
  '1114452062': {
    title: 'Collaboration Feature',
    description: 'Two creative visions, one standout result. The synergy on this collab was unmatched. 🤝🎬',
    tags: '#Collaboration #CreativeCollab #VideoProduction',
  },
};

const PortfolioPage: React.FC = () => {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  // Shows "Tap to unmute" badge whenever we land on a new video while unmuted preference is set
  const [showUnmuteHint, setShowUnmuteHint] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const playerRefs = useRef<Map<number, Player>>(new Map());

  // Refs that are always current — safe to read inside async callbacks/effects
  const isMutedRef = useRef(true);
  const currentIndexRef = useRef(0); // ← prevents stale closure in onIframeLoad

  // ── Keep refs in sync ──────────────────────────────────────
  useEffect(() => { currentIndexRef.current = currentIndex; }, [currentIndex]);

  // ── Scroll detection ───────────────────────────────────────
  const handleScroll = useCallback(() => {
    if (!containerRef.current) return;
    const idx = Math.round(containerRef.current.scrollTop / window.innerHeight);
    if (idx !== currentIndexRef.current && idx >= 0 && idx < videoIds.length) {
      setCurrentIndex(idx);
    }
  }, []);

  // ── Try to unmute the given player (works on Chrome/Android after first
  //    user interaction; silently fails on iOS — handled by the hint overlay).
  const applyUnmuteToPlayer = (player: Player) => {
    player.setMuted(false).catch(() => {});
    player.setVolume(1).catch(() => {});
  };

  // ── Attach Player SDK when an iframe finishes loading ──────
  // useCallback with [] — no captured state, uses refs only.
  // This is critical: inline / [currentIndex]-dep callbacks create stale
  // closures because onLoad fires ONCE at mount time with the snapshot of
  // whatever currentIndex was then.
  const onIframeLoad = useCallback((iframe: HTMLIFrameElement, index: number) => {
    // Tear down any previous player for this slot
    playerRefs.current.get(index)?.destroy().catch(() => {});

    const player = new Player(iframe);
    playerRefs.current.set(index, player);

    // player.ready() ensures the SDK handshake with the iframe is complete
    // before we send any commands.
    player.ready().then(() => {
      const isActive = index === currentIndexRef.current; // always fresh ✓
      if (isActive) {
        player.play().catch(() => {});
        if (!isMutedRef.current) {
          // Attempt programmatic unmute (works on desktop/Android).
          // iOS will silently block this; the hint overlay handles that case.
          applyUnmuteToPlayer(player);
        }
      }
    }).catch(() => {});
  }, []); // intentionally empty — uses refs, not captured state

  // ── React to index changes (scroll) ───────────────────────
  useEffect(() => {
    playerRefs.current.forEach((player, idx) => {
      if (idx === currentIndex) {
        player.play().catch(() => {});
        if (!isMutedRef.current) {
          applyUnmuteToPlayer(player);
        }
      } else {
        player.pause().catch(() => {});
      }

      // Free memory for videos > 1 step away
      if (Math.abs(idx - currentIndex) > 1) {
        player.destroy().catch(() => {});
        playerRefs.current.delete(idx);
      }
    });

    // If user's preference is unmuted, show the tap hint so they can quickly
    // unmute on iOS (where programmatic unmute is blocked).
    if (!isMutedRef.current) {
      setShowUnmuteHint(true);
      const t = setTimeout(() => setShowUnmuteHint(false), 3000);
      return () => clearTimeout(t);
    }
  }, [currentIndex]);

  // ── Unmute the active video — must be called from a user gesture ──
  const unmute = useCallback((player: Player) => {
    applyUnmuteToPlayer(player);
    setIsMuted(false);
    isMutedRef.current = false;
    setShowUnmuteHint(false);
  }, []);

  // ── Sound-button handler ───────────────────────────────────
  const handleToggleMute = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    const player = playerRefs.current.get(currentIndexRef.current);
    const newMuted = !isMutedRef.current;
    setIsMuted(newMuted);
    isMutedRef.current = newMuted;
    setShowUnmuteHint(false);
    if (player) {
      player.setMuted(newMuted).catch(() => {});
      player.setVolume(newMuted ? 0 : 1).catch(() => {});
    }
  }, []);

  // ── Tap on video screen — unmute if muted (user gesture ✓) ─
  const handleVideoTap = useCallback(() => {
    if (!isMutedRef.current) return; // already unmuted — don't toggle back
    const player = playerRefs.current.get(currentIndexRef.current);
    if (player) unmute(player);
  }, [unmute]);

  // ── Cleanup on unmount ─────────────────────────────────────
  useEffect(() => {
    return () => {
      playerRefs.current.forEach(p => p.destroy().catch(() => {}));
      playerRefs.current.clear();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className="h-[100dvh] w-full bg-black overflow-y-auto overflow-x-hidden snap-y snap-mandatory relative"
    >
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="fixed top-6 left-6 md:top-8 md:left-8 z-[100] p-3 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-white hover:bg-white/10 transition-colors"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>

      {/* Tap-to-unmute hint — appears when user has unmuted preference but new
          video starts muted (iOS cannot be un-muted programmatically) */}
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

      {videoIds.map((videoId, index) => {
        const isActiveVideo = index === currentIndex;
        const isNearby = Math.abs(currentIndex - index) <= 1;

        return (
          <div
            key={index}
            onClick={handleVideoTap}
            className="snap-start shrink-0 h-[100dvh] w-full relative flex items-center justify-center bg-black cursor-pointer"
          >
            {isNearby && (
              <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                <div className="w-full h-full relative flex items-center justify-center bg-zinc-900">
                  {/* Loading skeleton */}
                  <div className="absolute flex flex-col items-center justify-center gap-3 z-0 pointer-events-none">
                    <Loader2 className="w-8 h-8 text-white/50 animate-spin" />
                    <span className="text-white/50 text-sm font-medium">Loading...</span>
                  </div>

                  {/* Stable iframe — src never changes = no reload on mute toggle */}
                  <iframe
                    src={buildSrc(videoId)}
                    className="w-full h-full scale-[1.05] pointer-events-none relative z-10 bg-transparent"
                    allow="autoplay; fullscreen; picture-in-picture"
                    loading={index === 0 ? 'eager' : 'lazy'}
                    title={`Portfolio video ${index + 1}`}
                    onLoad={e => onIframeLoad(e.currentTarget as HTMLIFrameElement, index)}
                  />
                </div>
              </div>
            )}

            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 pointer-events-none z-10" />

            {/* UI overlay — only for the active slide */}
            <AnimatePresence>
              {isActiveVideo && (
                <motion.div
                  key={`ui-${index}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="absolute inset-0 pointer-events-none z-20 flex flex-col justify-end p-6 md:p-10"
                >
                  <div className="flex items-end justify-between w-full max-w-7xl mx-auto pb-8 md:pb-12">

                    {/* Bottom-left info — unique per video */}
                    {(() => {
                      const meta = VIDEO_META[videoId] ?? {
                        title: '@asanithecreator',
                        description: 'Cinematic storytelling and commercial work. 🎬✨',
                        tags: '#ContentCreator #MobileFilm',
                      };
                      return (
                        <div className="flex-1 max-w-lg">
                          <h2 className="text-xl md:text-2xl font-bold text-white mb-2">
                            {meta.title}
                          </h2>
                          <p className="text-sm md:text-base text-white/80 line-clamp-2 md:line-clamp-none mb-1">
                            {meta.description}
                          </p>
                          <p className="text-xs text-white/50 mb-4">{meta.tags}</p>
                          <div className="flex items-center gap-2 text-white/90 text-sm bg-black/40 w-fit px-3 py-1.5 rounded-full backdrop-blur-md border border-white/10">
                            <Music className="w-4 h-4 animate-spin" style={{ animationDuration: '4s' }} />
                            <span className="truncate max-w-[150px]">Original Sound - Asani</span>
                          </div>
                        </div>
                      );
                    })()}

                    {/* Right-side action bar */}
                    <div className="flex flex-col gap-5 items-center ml-4 pointer-events-auto pb-4">

                      {/* Sound toggle */}
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
