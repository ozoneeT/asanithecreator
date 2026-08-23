// Legacy Vimeo library — the hardcoded list the portfolio used before Bunny.
// Kept as a fallback so the site keeps working while videos are migrated:
// if /api/videos returns nothing, the portfolio renders these instead.
//
// Once everything lives in Bunny, delete this file, its import in
// components/PortfolioPage.tsx, and PORTFOLIO_VIDEOS in constants.tsx.

import { PORTFOLIO_VIDEOS } from '../constants';
import type { PortfolioVideo } from './videoTypes';

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

const getVideoId = (url: string): string => url.split('/').pop() ?? '';

export const LEGACY_VIMEO_VIDEOS: PortfolioVideo[] = PORTFOLIO_VIDEOS
  .map(getVideoId)
  .filter(Boolean)
  .map(id => {
    const meta = VIDEO_META[id] ?? {
      title: '@asanithecreator',
      description: 'Cinematic storytelling and commercial work. \u{1F3AC}\u2728',
      tags: '#ContentCreator #MobileFilm',
    };
    return {
      id,
      source: 'vimeo' as const,
      title: meta.title,
      description: meta.description,
      tags: meta.tags,
      mp4Url: null,                       // Vimeo Basic exposes no direct file
      posterUrl: `/posters/${id}.webp`,
      width: 0,
      height: 0,
      duration: 0,
    };
  });
