// Local sample reel shipped in public/.
//
// Acts as the portfolio's fallback so the page is never empty. R2 always wins:
// as soon as manifest.json lists any video, useVideos swaps these out entirely.
// Delete this file (and its import in hooks/useVideos.ts) once the R2 library is
// populated and you no longer want a built-in fallback.

import type { PortfolioVideo } from './videoTypes';

const local = (
  file: string,
  title: string,
  description: string,
  tags: string,
  width: number,
  height: number,
  duration: number,
): PortfolioVideo => ({
  id: `local-${file}`,
  source: 'r2',
  title,
  description,
  tags,
  mp4Url: `/${file}.MP4`,
  posterUrl: `/portfolio-posters/${file}.webp`,
  width,
  height,
  duration,
});

export const LOCAL_VIDEOS: PortfolioVideo[] = [
  local(
    'BrandAndBusiness',
    'Brand & Business',
    'Product content built to convert — clean framing, deliberate pacing, and a story that sells before the caption does. 🛍️',
    '#BrandVideo #ProductContent #UGC',
    720, 1280, 12,
  ),
  local(
    'Lifestyle',
    'Lifestyle Reel',
    'Personal brand storytelling — authentic moments captured with a cinematic eye. 🌟',
    '#LifestyleContent #PersonalBrand #Reel',
    720, 1280, 9.147,
  ),
  local(
    'SocialMedia',
    'Social Media Promo',
    'Scroll-stopping content made for the feed. Trend-aware, fast-paced, always on point. 📲',
    '#SocialMedia #Reels #ContentCreator',
    720, 1280, 12,
  ),
  local(
    'Events',
    'Event Coverage',
    'Every moment that matters, preserved with intention and warmth. 💍🎬',
    '#EventCoverage #Cinematic #Wedding',
    480, 848, 4.9,
  ),
  local(
    'Production_Studio',
    'Production Studio',
    'Behind the lens — the process, the setup, and the craft that shapes every final cut. 🎥',
    '#BTS #ProductionStudio #Filmmaking',
    848, 480, 26.5,
  ),
];
