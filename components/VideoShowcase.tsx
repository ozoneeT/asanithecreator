
import React, { useState, useReducer, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Play, Pause, SkipBack, SkipForward,
  Film, Music, Type, Smile, Sparkles, ArrowRightLeft, SlidersHorizontal,
  Plus, Undo2, Redo2, Scissors, Trash2,
  Volume2, VolumeX, ZoomIn, Maximize,
  GripVertical, Pencil, X
} from 'lucide-react';

import Player from '@vimeo/player';
import ReactPlayer from 'react-player';
import { VIDEO_FOOTAGE } from '../constants';

const ReactPlayerFixed = ReactPlayer as unknown as React.ComponentType<any>;

// ─── Types ────────────────────────────────────────────────────

interface MediaItem {
  id: string;
  type: 'video' | 'vimeo'; // Added type
  src: string;
  thumbnail?: string;      // Added thumbnail for vimeo/video distinction if needed
  name: string;
  duration: string;
  durationMs: number;
}

interface TimelineClip {
  id: string;
  mediaId: string;
  type: 'video' | 'vimeo'; // Added type
  src: string;
  thumbnail?: string;
  name: string;
  startMs: number;
  durationMs: number;
  track: 'video' | 'audio';
}

type TopTab = 'media' | 'audio' | 'text' | 'stickers' | 'effects' | 'transition' | 'filters';
type BrowserTab = 'local' | 'import' | 'library';
type PropTab = 'video' | 'audio' | 'speed' | 'animate' | 'adjust';
type PropSubTab = 'basic' | 'cutout' | 'mask' | 'canvas';

interface EditorState {
  activeTopTab: TopTab;
  activeBrowserTab: BrowserTab;
  activePropTab: PropTab;
  activePropSubTab: PropSubTab;
  previewSrc: string;
  isPlaying: boolean;
  currentTimeMs: number;
  totalDurationMs: number;
  timelineClips: TimelineClip[];
  playheadMs: number;
  selectedClipId: string | null;
  activeFilter: string;
  filterStrength: number;
  zoom: number;
  isDragOver: boolean;
  volume: number;
}

type Action =
  | { type: 'SET_TOP_TAB'; tab: TopTab }
  | { type: 'SET_BROWSER_TAB'; tab: BrowserTab }
  | { type: 'SET_PROP_TAB'; tab: PropTab }
  | { type: 'SET_PROP_SUB_TAB'; tab: PropSubTab }
  | { type: 'SET_PREVIEW'; src: string }
  | { type: 'TOGGLE_PLAY' }
  | { type: 'TICK'; delta: number }
  | { type: 'ADD_CLIP'; clip: TimelineClip }
  | { type: 'REMOVE_CLIP'; clipId: string }
  | { type: 'SELECT_CLIP'; clipId: string | null }
  | { type: 'MOVE_PLAYHEAD'; ms: number }
  | { type: 'SET_FILTER'; name: string }
  | { type: 'SET_FILTER_STRENGTH'; value: number }
  | { type: 'SET_ZOOM'; value: number }
  | { type: 'SET_DRAG_OVER'; value: boolean }
  | { type: 'SET_VOLUME'; value: number }
  | { type: 'UPDATE_CLIP_DURATION'; clipId: string; durationMs: number }
  | { type: 'SET_PLAYING'; value: boolean }
  | { type: 'SET_CURRENT_TIME'; ms: number }
  | { type: 'VIDEO_ENDED' };

// ─── Constants ────────────────────────────────────────────────

const VIMEO_ID = '1163715960';

const MEDIA_LIBRARY: MediaItem[] = [
  {
    id: 'media-video-1',
    type: 'video',
    src: '/Production_Studio.MP4',
    thumbnail: '/vimeo_thumb.png',
    name: 'Production_Studio_Reel.mp4',
    duration: '01:24',
    durationMs: 84000,
  },
  ...VIDEO_FOOTAGE.slice(1).map((src, i) => ({
    id: `media-${i + 1}`,
    type: 'video' as const,
    src,
    name: ['Cinema_Reel.mov', 'Camera_Setup.mov', 'Studio_Light.mov', 'Concert_Live.mov'][i],
    duration: ['00:39', '00:32', '00:18', '00:45'][i],
    durationMs: [39000, 32000, 18000, 45000][i],
  }))
];

const TOP_TABS: { id: TopTab; label: string; Icon: React.ElementType }[] = [
  { id: 'media', label: 'Media', Icon: Film },
  { id: 'audio', label: 'Audio', Icon: Music },
  { id: 'text', label: 'Text', Icon: Type },
  { id: 'stickers', label: 'Stickers', Icon: Smile },
  { id: 'effects', label: 'Effects', Icon: Sparkles },
  { id: 'transition', label: 'Transition', Icon: ArrowRightLeft },
  { id: 'filters', label: 'Filters', Icon: SlidersHorizontal },
];

const FILTER_PRESETS: { name: string; css: string }[] = [
  { name: 'None', css: '' },
  { name: '90s', css: 'sepia(0.3) contrast(1.1) brightness(0.95) saturate(1.2)' },
  { name: 'Noir', css: 'grayscale(1) contrast(1.3) brightness(0.9)' },
  { name: 'Vivid', css: 'saturate(1.6) contrast(1.15)' },
  { name: 'Cool', css: 'hue-rotate(15deg) saturate(0.9) brightness(1.05)' },
  { name: 'Warm', css: 'sepia(0.15) saturate(1.4) brightness(1.05)' },
];

const INITIAL_CLIPS: TimelineClip[] = [
  {
    id: 'clip-1',
    mediaId: MEDIA_LIBRARY[0].id,
    type: MEDIA_LIBRARY[0].type,
    src: MEDIA_LIBRARY[0].src,
    thumbnail: MEDIA_LIBRARY[0].thumbnail,
    name: MEDIA_LIBRARY[0].name,
    startMs: 0,
    durationMs: MEDIA_LIBRARY[0].durationMs,
    track: 'video'
  },
];

const TIMELINE_PX_PER_SEC = 6;

// ─── Helpers ──────────────────────────────────────────────────

const formatTime = (ms: number): string => {
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  const cs = Math.floor((ms % 1000) / 10);
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}:${String(cs).padStart(2, '0')}`;
};

const generateWaveformPath = (w: number, h: number): string => {
  const mid = h / 2;
  const pts: string[] = [`M 0 ${mid}`];
  const segs = Math.floor(w / 2);
  for (let i = 0; i <= segs; i++) {
    const x = (i / segs) * w;
    const amp = (Math.sin(i * 0.3) * 0.3 + Math.sin(i * 0.7) * 0.2 + (Math.sin(i * 1.5) * 0.15)) * h;
    pts.push(`L ${x.toFixed(1)} ${(mid + amp).toFixed(1)}`);
  }
  return pts.join(' ');
};

// ─── Reducer ──────────────────────────────────────────────────

const initialState: EditorState = {
  activeTopTab: 'media',
  activeBrowserTab: 'local',
  activePropTab: 'video',
  activePropSubTab: 'basic',
  previewSrc: MEDIA_LIBRARY[0].src,
  isPlaying: false,
  currentTimeMs: 0,
  totalDurationMs: 92000,
  timelineClips: INITIAL_CLIPS,
  playheadMs: 0,
  selectedClipId: null,
  activeFilter: 'None',
  filterStrength: 50,
  zoom: 70,
  isDragOver: false,
  volume: 100,
};

function reducer(state: EditorState, action: Action): EditorState {
  switch (action.type) {
    case 'SET_TOP_TAB': return { ...state, activeTopTab: action.tab };
    case 'SET_BROWSER_TAB': return { ...state, activeBrowserTab: action.tab };
    case 'SET_PROP_TAB': return { ...state, activePropTab: action.tab };
    case 'SET_PROP_SUB_TAB': return { ...state, activePropSubTab: action.tab };
    case 'SET_PREVIEW': return { ...state, previewSrc: action.src };
    case 'TOGGLE_PLAY': return { ...state, isPlaying: !state.isPlaying };
    case 'TICK': {
      const next = state.currentTimeMs + action.delta;
      if (next >= state.totalDurationMs) {
        return { ...state, isPlaying: false, currentTimeMs: 0, playheadMs: 0 };
      }
      // Update preview based on which clip the playhead is on
      const activeClip = state.timelineClips
        .filter(c => c.track === 'video')
        .find(c => next >= c.startMs && next < c.startMs + c.durationMs);

      // Only update preview if we have a clip and it's different or we moved time
      const nextSrc = activeClip ? activeClip.src : state.previewSrc;

      return {
        ...state,
        currentTimeMs: next,
        playheadMs: next,
        previewSrc: nextSrc,
      };
    }
    case 'ADD_CLIP': return {
      ...state,
      timelineClips: [...state.timelineClips, action.clip],
      totalDurationMs: Math.max(state.totalDurationMs, action.clip.startMs + action.clip.durationMs),
      isDragOver: false,
    };
    case 'REMOVE_CLIP': return {
      ...state,
      timelineClips: state.timelineClips.filter(c => c.id !== action.clipId),
      selectedClipId: state.selectedClipId === action.clipId ? null : state.selectedClipId,
    };
    case 'SELECT_CLIP': return { ...state, selectedClipId: action.clipId };
    case 'MOVE_PLAYHEAD': {
      const ms = Math.max(0, Math.min(action.ms, state.totalDurationMs));
      const activeClip = state.timelineClips
        .filter(c => c.track === 'video')
        .find(c => ms >= c.startMs && ms < c.startMs + c.durationMs);
      return {
        ...state,
        playheadMs: ms,
        currentTimeMs: ms,
        previewSrc: activeClip ? activeClip.src : state.previewSrc,
      };
    }
    case 'SET_FILTER': return { ...state, activeFilter: action.name };
    case 'SET_FILTER_STRENGTH': return { ...state, filterStrength: action.value };
    case 'SET_ZOOM': return { ...state, zoom: action.value };
    case 'SET_DRAG_OVER': return { ...state, isDragOver: action.value };
    case 'SET_VOLUME': return { ...state, volume: action.value };
    case 'UPDATE_CLIP_DURATION': {
      // Find the clip being updated
      const clipIndex = state.timelineClips.findIndex(c => c.id === action.clipId);
      if (clipIndex === -1) return state;

      // Update the clip duration
      const updatedClips = [...state.timelineClips];
      updatedClips[clipIndex] = { ...updatedClips[clipIndex], durationMs: action.durationMs };

      // Reposition all subsequent clips to eliminate gaps
      for (let i = clipIndex + 1; i < updatedClips.length; i++) {
        const prevClip = updatedClips[i - 1];
        updatedClips[i] = { ...updatedClips[i], startMs: prevClip.startMs + prevClip.durationMs };
      }

      // Recalculate total duration
      const newTotal = updatedClips.reduce((max, c) => Math.max(max, c.startMs + c.durationMs), 0);

      return {
        ...state,
        timelineClips: updatedClips,
        totalDurationMs: newTotal
      };
    }
    case 'SET_PLAYING': return { ...state, isPlaying: action.value };
    case 'SET_CURRENT_TIME': return { ...state, currentTimeMs: action.ms, playheadMs: action.ms };
    case 'VIDEO_ENDED': return { ...state, isPlaying: false, currentTimeMs: 0, playheadMs: 0 };
    default: return state;
  }
}

// ─── Main Component ───────────────────────────────────────────

interface VideoShowcaseProps {
  isActive?: boolean;
}

const VideoShowcase: React.FC<VideoShowcaseProps> = ({ isActive = false }) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const timelineRef = useRef<HTMLDivElement>(null);
  const [isScrubbing, setIsScrubbing] = useState(false);
  const vimeoPlayerRef = useRef<Player | null>(null);
  const videoElementRef = useRef<HTMLVideoElement | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const isPlayingRef = useRef(state.isPlaying);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

  // Keep ref in sync with state to avoid stale closures in Vimeo callbacks
  useEffect(() => {
    isPlayingRef.current = state.isPlaying;
  }, [state.isPlaying]);

  // Auto-play when scrolling into view, auto-pause when scrolling out of view
  useEffect(() => {
    dispatch({ type: 'SET_PLAYING', value: isActive });
  }, [isActive]);

  // Sync Vimeo player play/pause state
  useEffect(() => {
    if (vimeoPlayerRef.current) {
      if (state.isPlaying) {
        vimeoPlayerRef.current.play().catch(err => console.error('Vimeo play error:', err));
      } else {
        vimeoPlayerRef.current.pause().catch(err => console.error('Vimeo pause error:', err));
      }
    }
  }, [state.isPlaying]);

  // ReactPlayer handles play/pause automatically via the playing prop
  // No need for manual retry logic

  // Sync Native Video Element play/pause
  useEffect(() => {
    if (videoElementRef.current) {
      if (state.isPlaying) {
        videoElementRef.current.play().catch(err => console.error("Native video play error:", err));
      } else {
        videoElementRef.current.pause();
      }
    }
  }, [state.isPlaying]);

  // ReactPlayer handles seeking internally via currentTime prop if needed
  // Metadata is handled by ReactPlayer's onReady and onDuration callbacks

  // Sync Volume for Vimeo
  useEffect(() => {
    if (vimeoPlayerRef.current) {
      vimeoPlayerRef.current.setVolume(state.volume / 100).catch(() => { });
    }
  }, [state.volume]);

  // ReactPlayer handles volume via the volume prop (0-1)
  // ReactPlayer handles duration via onDuration callback

  // Sync fullscreen state with browser events (e.g. user presses Esc)
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isFs = !!(document.fullscreenElement || (document as any).webkitFullscreenElement || (document as any).mozFullScreenElement || (document as any).msFullscreenElement);
      setIsFullscreen(isFs);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    };
  }, []);

  // Toggle Fullscreen
  const toggleFullscreen = () => {
    if (!playerContainerRef.current) return;

    if (!isFullscreen) {
      // Enter Fullscreen
      const element = playerContainerRef.current as any;
      const requestMethod = element.requestFullscreen || element.webkitRequestFullscreen || element.mozRequestFullScreen || element.msRequestFullscreen;

      if (requestMethod) {
        requestMethod.call(element).catch((err: any) => {
          console.error(`Error enabling fullscreen: ${err.message}. Falling back to CSS.`);
          setIsFullscreen(true); // Fallback to CSS
        });
      } else {
        setIsFullscreen(true); // Fallback to CSS
      }
    } else {
      // Exit Fullscreen
      const doc = document as any;
      const exitMethod = doc.exitFullscreen || doc.webkitExitFullscreen || doc.mozCancelFullScreen || doc.msExitFullscreen;

      if (exitMethod) {
        exitMethod.call(doc).catch((err: any) => console.error(err));
      }
      // We rely on the event listener to unset isFullscreen if using API, 
      // but if we used CSS fallback, we need to unset it manually.
      // Since it's harmless to set it false if we are exiting, let's just double check or let the event handler do it mostly.
      // Actually, if we are in CSS-only mode, the event won't fire. So we MUST set it here.
      setIsFullscreen(false);
    }
  };

  // Playback is now driven by the video element's timeupdate / ended events
  // (see onTimeUpdate and onEnded on the <video> element below)

  // Timeline scrub handlers
  const handleTimelineScrub = useCallback((clientX: number) => {
    if (!timelineRef.current) return;
    const rect = timelineRef.current.getBoundingClientRect();
    const scrollLeft = timelineRef.current.scrollLeft;
    const offsetX = clientX - rect.left + scrollLeft;
    const ms = (offsetX / TIMELINE_PX_PER_SEC) * 1000;
    dispatch({ type: 'MOVE_PLAYHEAD', ms });
  }, []);

  const onTimelineMouseDown = useCallback((e: React.MouseEvent) => {
    setIsScrubbing(true);
    handleTimelineScrub(e.clientX);
  }, [handleTimelineScrub]);

  useEffect(() => {
    if (!isScrubbing) return;
    const onMove = (e: MouseEvent) => handleTimelineScrub(e.clientX);
    const onUp = () => setIsScrubbing(false);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [isScrubbing, handleTimelineScrub]);

  // Drag & drop handlers
  const onDragStart = (e: React.DragEvent, item: MediaItem) => {
    e.dataTransfer.setData('application/media-id', item.id);
    e.dataTransfer.effectAllowed = 'copy';
  };

  const onTimelineDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const mediaId = e.dataTransfer.getData('application/media-id');
    const media = MEDIA_LIBRARY.find(m => m.id === mediaId);
    if (!media || !timelineRef.current) return;
    const rect = timelineRef.current.getBoundingClientRect();
    const scrollLeft = timelineRef.current.scrollLeft;
    const offsetX = e.clientX - rect.left + scrollLeft;
    const startMs = Math.max(0, (offsetX / TIMELINE_PX_PER_SEC) * 1000);
    dispatch({
      type: 'ADD_CLIP',
      clip: {
        id: `clip-${Date.now()}`,
        mediaId: media.id,
        src: media.src,
        name: media.name,
        startMs,
        durationMs: media.durationMs,
        track: 'video',
        type: media.type,
        thumbnail: media.thumbnail,
      },
    });
  };

  // Filter CSS
  const activeFilterCSS = FILTER_PRESETS.find(f => f.name === state.activeFilter)?.css || '';
  const filterStyle = activeFilterCSS
    ? { filter: activeFilterCSS, opacity: state.filterStrength / 100 }
    : {};

  const videoClips = state.timelineClips.filter(c => c.track === 'video');
  const timelineWidthPx = Math.max(800, (state.totalDurationMs / 1000) * TIMELINE_PX_PER_SEC + 100);
  const playheadPx = (state.playheadMs / 1000) * TIMELINE_PX_PER_SEC;

  return (
    <section id="work" className="h-screen relative bg-[#0d0d15] overflow-hidden flex flex-col">

      {/* ─── Header ─── */}
      <div className="flex-shrink-0 flex items-center justify-between px-4 h-[42px] bg-[#1a1a2e] border-b border-[#2a2a4a]">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
            <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
            <div className="w-3 h-3 rounded-full bg-[#28c840]" />
          </div>
          <span className="text-[11px] text-[#8888aa] ml-2 font-medium">Production Studio</span>
        </div>
        <span className="text-[10px] text-[#555570] hidden md:block">Auto save local at {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        <div className="flex items-center gap-2">
          <button className="text-[10px] bg-[#4a7dff] text-white px-4 py-1.5 rounded-md font-bold hover:bg-[#3a6dee] transition-colors">Export</button>
        </div>
      </div>

      {/* ─── Top Toolbar ─── */}
      <div className="flex-shrink-0 flex items-center h-[44px] bg-[#16162a] border-b border-[#2a2a4a] px-1 md:px-2 overflow-x-auto no-scrollbar">
        {TOP_TABS.map(({ id, label, Icon }) => (
          <button
            key={id}
            onClick={() => dispatch({ type: 'SET_TOP_TAB', tab: id })}
            className={`flex flex-col items-center justify-center px-2 md:px-4 h-full gap-0.5 transition-colors relative flex-shrink-0 ${state.activeTopTab === id ? 'text-white' : 'text-[#8888aa] hover:text-[#bbbbd0]'
              }`}
          >
            <Icon size={16} />
            <span className="text-[9px] font-medium">{label}</span>
            {state.activeTopTab === id && (
              <motion.div layoutId="topTabIndicator" className="absolute bottom-0 left-2 right-2 h-[2px] bg-[#4a7dff] rounded-full" />
            )}
          </button>
        ))}
      </div>

      {/* ─── Middle: 3-column layout ─── */}
      <div className="flex-1 flex min-h-0">

        {/* ── Left Panel: Media Browser ── */}
        <div className="w-[220px] flex-shrink-0 bg-[#1a1a2e] border-r border-[#2a2a4a] flex flex-col hidden md:flex">
          {/* Browser Tabs */}
          <div className="flex items-center gap-1 px-3 pt-3 pb-2">
            {(['local', 'import', 'library'] as BrowserTab[]).map(tab => (
              <button
                key={tab}
                onClick={() => dispatch({ type: 'SET_BROWSER_TAB', tab })}
                className={`text-[10px] px-3 py-1.5 rounded-md font-bold capitalize transition-colors ${state.activeBrowserTab === tab
                  ? 'bg-[#4a7dff] text-white'
                  : 'text-[#8888aa] hover:text-white hover:bg-[#252540]'
                  }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Import Button */}
          <div className="px-3 mb-2">
            <button className="w-full flex items-center justify-center gap-2 py-2 border border-dashed border-[#4a7dff]/40 rounded-lg text-[#4a7dff] text-[10px] font-bold hover:bg-[#4a7dff]/10 transition-colors">
              <Plus size={14} /> Import
            </button>
          </div>

          {/* Media Grid */}
          <div
            className="flex-1 overflow-y-auto px-3 pb-3"
            onWheel={e => e.stopPropagation()}
          >
            <div className="grid grid-cols-2 gap-2">
              {MEDIA_LIBRARY.map(item => (
                <motion.div
                  key={item.id}
                  draggable
                  onDragStart={e => onDragStart(e as unknown as React.DragEvent, item)}
                  onClick={() => dispatch({ type: 'SET_PREVIEW', src: item.src })}
                  whileHover={{ scale: 1.03 }}
                  className="relative rounded-lg overflow-hidden cursor-grab active:cursor-grabbing group bg-[#16162a]"
                >
                  <div className="aspect-[4/3] relative group-hover:opacity-90 transition-opacity">
                    {item.type === 'vimeo' ? (
                      <div className="absolute inset-0 bg-black flex items-center justify-center">
                        <img src={item.thumbnail} alt={item.name} className="w-full h-full object-cover opacity-60" />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-6 h-6 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                            <Play size={10} fill="white" className="text-white ml-0.5" />
                          </div>
                        </div>
                      </div>
                    ) : item.type === 'video' && (item.src.endsWith('.mp4') || item.src.endsWith('.MP4')) ? (
                      <div className="absolute inset-0 bg-black flex items-center justify-center">
                        {item.thumbnail ? (
                          <img src={item.thumbnail} alt={item.name} className="w-full h-full object-cover opacity-60" />
                        ) : (
                          <video src={item.src} className="w-full h-full object-cover" muted />
                        )}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-6 h-6 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                            <Play size={10} fill="white" className="text-white ml-0.5" />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <img src={item.src} alt={item.name} className="w-full h-full object-cover" loading="eager" />
                    )}
                  </div>
                  <div className="absolute top-1.5 right-1.5 bg-black/70 text-[8px] text-white/80 px-1.5 py-0.5 rounded font-mono">
                    {item.duration}
                  </div>
                  <div className="p-1.5">
                    <p className="text-[9px] text-[#8888aa] truncate">{item.name}</p>
                  </div>
                  <div className="absolute inset-0 bg-[#4a7dff]/0 group-hover:bg-[#4a7dff]/10 transition-colors rounded-lg" />
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Center: Player ── */}
        <div ref={playerContainerRef} className={`flex-1 flex flex-col min-w-0 bg-[#0d0d15] ${isFullscreen ? 'fixed inset-0 z-[9999] w-screen h-screen' : ''}`}>
          {/* Player Header */}
          <div className="flex-shrink-0 flex items-center justify-between px-4 h-[32px] border-b border-[#2a2a4a]">
            <span className="text-[11px] text-[#8888aa] font-medium">Player</span>
            <button onClick={toggleFullscreen} className="hover:text-white text-[#555570] transition-colors">
              <Maximize size={13} />
            </button>
          </div>

          {/* Preview */}
          <div className="flex-1 flex items-center justify-center p-3 min-h-0 relative">
            <div className="relative w-full h-full max-w-full max-h-full flex items-center justify-center overflow-hidden rounded-md bg-black">
              {/* Base video/image preview */}
              <div className="w-full h-full flex items-center justify-center">
                {(() => {
                  // Determine type based on current clip or previewSrc
                  const activeClip = state.timelineClips.find(c => c.src === state.previewSrc) || state.timelineClips[0];
                  const isVimeo = activeClip?.type === 'vimeo' || state.previewSrc.includes('vimeo');

                  if (isVimeo) {
                    return (
                      <div className="w-full h-full bg-black relative">
                        <iframe
                          ref={iframeRef}
                          src={state.previewSrc}
                          className="w-full h-full"
                          frameBorder="0"
                          allow="autoplay; fullscreen; picture-in-picture"
                          allowFullScreen
                          style={{
                            // Apply zoom to container or iframe? Applying to iframe might cut off content.
                            // For simplicity in this mock editor, we'll scale the container
                            transform: `scale(${state.zoom / 50})`,
                            pointerEvents: 'none', // Disable mouse interaction to prevent scroll blocking
                            ...(activeFilterCSS ? { filter: activeFilterCSS, opacity: state.filterStrength / 100 } : {})
                          }}
                          onLoad={() => {
                            if (iframeRef.current) {
                              const player = new Player(iframeRef.current);
                              vimeoPlayerRef.current = player;

                              // Sync Duration from Vimeo
                              player.getDuration().then((duration) => {
                                console.log('Vimeo duration:', duration);
                                // Update the timeline clip. Assuming 'clip-1' is the Vimeo clip.
                                dispatch({ type: 'UPDATE_CLIP_DURATION', clipId: 'clip-1', durationMs: duration * 1000 });
                              }).catch(e => console.error('Failed to get duration', e));

                              player.on('play', () => {
                                if (!isPlayingRef.current) dispatch({ type: 'TOGGLE_PLAY' });
                              });
                              player.on('pause', () => {
                                if (isPlayingRef.current) dispatch({ type: 'TOGGLE_PLAY' });
                              });
                              player.on('timeupdate', (data) => {
                                // Sync timeline with vimeo time if playing
                                // We might need to handle this carefully to avoid loops
                              });
                            }
                          }}
                        />
                        {/* Overlay removed to allow direct interaction, but we sync state via events */}
                      </div>
                    );
                  }

                  // Check if it's a video file (MP4)
                  const isVideoFile = true; // Force true for now if it's in media library, or refine check logic
                  // const isVideoFile = state.previewSrc.toLowerCase().endsWith('.mp4') ||
                  //   state.previewSrc.toLowerCase().endsWith('.mov');

                  if (isVideoFile) {
                    // Get the active clip to access thumbnail
                    const activeClip = state.timelineClips.find(c => c.src === state.previewSrc);

                    return (
                      <div className="w-full h-full" style={{
                        transform: `scale(${state.zoom / 50})`,
                        ...(activeFilterCSS ? { filter: activeFilterCSS, opacity: state.filterStrength / 100 } : {})
                      }}>
                        {/* @ts-ignore - ReactPlayer types have issues */}
                        {/* Native Video Element for better local playback */}
                        <video
                          ref={videoElementRef}
                          src={state.previewSrc}
                          className="w-full h-full"
                          playsInline
                          muted={isMuted}
                          loop={false}
                          style={{
                            objectFit: 'contain',
                            transform: 'translateZ(0)',
                            WebkitTransform: 'translateZ(0)'
                          }}
                          onTimeUpdate={(e) => {
                            const video = e.currentTarget;
                            dispatch({ type: 'SET_CURRENT_TIME', ms: video.currentTime * 1000 });
                          }}
                          onEnded={() => {
                            dispatch({ type: 'VIDEO_ENDED' });
                          }}
                          onError={(e) => {
                            console.error('Video playback error:', e);
                          }}
                          onLoadedMetadata={(e) => {
                            console.log('Video ready:', state.previewSrc);
                            // Ensure volume and play state are synced
                            const video = e.currentTarget;
                            video.volume = state.volume / 100;
                            if (state.isPlaying) {
                              video.play().catch(err => console.error("Play failed:", err));
                            }
                          }}
                        />
                      </div>
                    );
                  }

                  return (
                    <img
                      src={state.previewSrc}
                      className="max-w-full max-h-full object-contain"
                      style={{ transform: `scale(${state.zoom / 50})` }}
                    />
                  );
                })()}
              </div>
              {/* Unmute overlay — shown when autoplay forced muted playback */}
              {state.isPlaying && isMuted && (
                <button
                  onClick={() => {
                    if (videoElementRef.current) {
                      videoElementRef.current.muted = false;
                      setIsMuted(false);
                    }
                  }}
                  className="absolute bottom-3 left-3 z-20 flex items-center gap-1.5 bg-black/70 backdrop-blur-sm text-white text-[10px] font-medium px-3 py-1.5 rounded-full hover:bg-black/90 transition-colors cursor-pointer"
                >
                  <VolumeX size={14} />
                  <span>Click to unmute</span>
                </button>
              )}
              {/* Filter overlay */}
              {activeFilterCSS && !state.previewSrc.includes('vimeo') && (
                <img
                  src={state.previewSrc}
                  className="absolute inset-0 w-full h-full object-contain pointer-events-none"
                  style={{ ...filterStyle, transform: `scale(${state.zoom / 50})`, margin: 'auto' }}
                />
              )}
            </div>
          </div>

          {/* Playback Controls */}
          <div className="flex-shrink-0 flex items-center justify-between px-4 h-[44px] border-t border-[#2a2a4a] bg-[#16162a]">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono text-[#ff4466]">{formatTime(state.currentTimeMs)}</span>
              <span className="text-[11px] font-mono text-[#555570]">{formatTime(state.totalDurationMs)}</span>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={() => dispatch({ type: 'MOVE_PLAYHEAD', ms: Math.max(0, state.playheadMs - 5000) })}
                className="text-[#8888aa] hover:text-white transition-colors"
              >
                <SkipBack size={16} />
              </button>
              <button
                onClick={() => {
                  if (videoElementRef.current) {
                    videoElementRef.current.muted = false;
                    setIsMuted(false);
                  }
                  dispatch({ type: 'TOGGLE_PLAY' });
                }}
                className="w-8 h-8 bg-[#4a7dff] rounded-full flex items-center justify-center hover:bg-[#3a6dee] transition-colors"
              >
                {state.isPlaying ? <Pause size={14} fill="white" className="text-white" /> : <Play size={14} fill="white" className="text-white ml-0.5" />}
              </button>
              <button
                onClick={() => dispatch({ type: 'MOVE_PLAYHEAD', ms: Math.min(state.totalDurationMs, state.playheadMs + 5000) })}
                className="text-[#8888aa] hover:text-white transition-colors"
              >
                <SkipForward size={16} />
              </button>
            </div>

            <div className="hidden sm:flex items-center gap-2">
              <Volume2 size={13} className="text-[#555570]" />
              <input
                type="range"
                min="0"
                max="100"
                value={state.volume}
                onChange={(e) => dispatch({ type: 'SET_VOLUME', value: parseInt(e.target.value) })}
                className="w-16 h-1 bg-[#2a2a4a] rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2.5 [&::-webkit-slider-thumb]:h-2.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#4a7dff]"
              />
              <div className="w-[1px] h-3 bg-[#2a2a4a] mx-1" />
              <ZoomIn size={13} className="text-[#555570]" />
              <span className="text-[10px] text-[#8888aa] font-mono">{state.zoom}%</span>
            </div>
          </div>
        </div>

        {/* ── Right Panel: Properties ── */}
        <div className="w-[240px] flex-shrink-0 bg-[#1a1a2e] border-l border-[#2a2a4a] flex flex-col hidden lg:flex">
          {/* Prop Tabs */}
          <div className="flex items-center border-b border-[#2a2a4a] px-1 h-[36px] flex-shrink-0">
            {(['video', 'audio', 'speed', 'animate', 'adjust'] as PropTab[]).map(tab => (
              <button
                key={tab}
                onClick={() => dispatch({ type: 'SET_PROP_TAB', tab })}
                className={`text-[10px] px-2.5 py-1.5 capitalize font-medium transition-colors ${state.activePropTab === tab ? 'text-white' : 'text-[#555570] hover:text-[#8888aa]'
                  }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Sub Tabs */}
          <div className="flex items-center gap-1 px-3 py-2 border-b border-[#2a2a4a] flex-shrink-0">
            {(['basic', 'cutout', 'mask', 'canvas'] as PropSubTab[]).map(tab => (
              <button
                key={tab}
                onClick={() => dispatch({ type: 'SET_PROP_SUB_TAB', tab })}
                className={`text-[9px] px-2.5 py-1 rounded-md capitalize font-bold transition-colors ${state.activePropSubTab === tab ? 'bg-[#252540] text-white' : 'text-[#555570] hover:text-[#8888aa]'
                  }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Properties Content */}
          <div
            className="flex-1 overflow-y-auto px-3 py-3 space-y-4"
            onWheel={e => e.stopPropagation()}
          >
            {/* Filters Section */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] text-[#4a7dff] font-bold uppercase tracking-wider">Filters</span>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-[#8888aa]">Name</span>
                  <span className="text-[10px] text-white font-medium">{state.activeFilter}</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[10px] text-[#8888aa]">Strength</span>
                  <div className="flex items-center gap-2 flex-1">
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={state.filterStrength}
                      onChange={e => dispatch({ type: 'SET_FILTER_STRENGTH', value: Number(e.target.value) })}
                      className="flex-1 h-1 accent-[#4a7dff] bg-[#2a2a4a] rounded-full appearance-none cursor-pointer"
                    />
                    <span className="text-[10px] text-white font-mono w-8 text-right">{state.filterStrength}%</span>
                  </div>
                </div>
                {/* Filter Presets */}
                <div className="grid grid-cols-3 gap-1.5 mt-2">
                  {FILTER_PRESETS.map(f => (
                    <button
                      key={f.name}
                      onClick={() => dispatch({ type: 'SET_FILTER', name: f.name })}
                      className={`rounded-md overflow-hidden border-2 transition-colors ${state.activeFilter === f.name ? 'border-[#4a7dff]' : 'border-transparent hover:border-[#2a2a4a]'
                        }`}
                    >
                      <div className="aspect-square">
                        <img src={MEDIA_LIBRARY[2].src} className="w-full h-full object-cover" style={{ filter: f.css }} />
                      </div>
                      <p className="text-[8px] text-center py-0.5 text-[#8888aa]">{f.name}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Effects Section */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] text-[#4a7dff] font-bold uppercase tracking-wider">Effects</span>
              </div>
              <div className="flex items-center justify-between bg-[#16162a] rounded-lg px-3 py-2">
                <div className="flex items-center gap-2">
                  <span className="text-[9px] text-[#555570] font-bold">NO 1</span>
                  <span className="text-[10px] text-white">Motion Blur</span>
                </div>
                <div className="flex items-center gap-1">
                  <button className="p-1 hover:bg-[#252540] rounded transition-colors"><Pencil size={11} className="text-[#8888aa]" /></button>
                  <button className="p-1 hover:bg-[#252540] rounded transition-colors"><Trash2 size={11} className="text-[#8888aa]" /></button>
                </div>
              </div>
            </div>

            {/* Position & Size */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] text-[#4a7dff] font-bold uppercase tracking-wider">Position & Size</span>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[10px] text-[#8888aa]">Zoom</span>
                  <div className="flex items-center gap-2 flex-1">
                    <input
                      type="range"
                      min={25}
                      max={200}
                      value={state.zoom}
                      onChange={e => dispatch({ type: 'SET_ZOOM', value: Number(e.target.value) })}
                      className="flex-1 h-1 accent-[#4a7dff] bg-[#2a2a4a] rounded-full appearance-none cursor-pointer"
                    />
                    <span className="text-[10px] text-white font-mono w-10 text-right">{state.zoom}%</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {[{ label: 'X', value: '0.0' }, { label: 'Y', value: '0.0' }].map(({ label, value }) => (
                    <div key={label} className="flex items-center gap-2 bg-[#16162a] rounded-md px-2 py-1.5">
                      <span className="text-[9px] text-[#555570] font-bold">{label}</span>
                      <span className="text-[10px] text-white font-mono">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Bottom: Timeline ─── */}
      <div className="flex-shrink-0 h-[120px] md:h-[180px] bg-[#16162a] border-t border-[#2a2a4a] flex flex-col">

        {/* Timeline Toolbar */}
        <div className="flex items-center justify-between px-3 h-[32px] border-b border-[#2a2a4a] flex-shrink-0">
          <div className="flex items-center gap-1">
            {[
              { Icon: Undo2, label: 'Undo' },
              { Icon: Redo2, label: 'Redo' },
              { Icon: Scissors, label: 'Split' },
              { Icon: Trash2, label: 'Delete' },
            ].map(({ Icon, label }) => (
              <button
                key={label}
                onClick={label === 'Delete' && state.selectedClipId ? () => dispatch({ type: 'REMOVE_CLIP', clipId: state.selectedClipId! }) : undefined}
                className="p-1.5 text-[#8888aa] hover:text-white hover:bg-[#252540] rounded transition-colors"
                title={label}
              >
                <Icon size={14} />
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <Volume2 size={13} className="text-[#555570]" />
            <GripVertical size={13} className="text-[#555570]" />
          </div>
        </div>

        {/* Timeline Body */}
        <div
          ref={timelineRef}
          className={`flex-1 overflow-x-auto overflow-y-hidden relative select-none ${state.isDragOver ? 'ring-2 ring-inset ring-[#4a7dff]/40' : ''}`}
          onWheel={e => e.stopPropagation()}
          onMouseDown={onTimelineMouseDown}
          onDragOver={e => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'copy';
            if (!state.isDragOver) dispatch({ type: 'SET_DRAG_OVER', value: true });
          }}
          onDragLeave={() => dispatch({ type: 'SET_DRAG_OVER', value: false })}
          onDrop={onTimelineDrop}
          style={{ cursor: isScrubbing ? 'col-resize' : 'default' }}
        >
          <div style={{ width: timelineWidthPx, minHeight: '100%' }} className="relative">

            {/* Time Ruler */}
            <div className="h-[20px] relative border-b border-[#2a2a4a]">
              {Array.from({ length: Math.ceil(state.totalDurationMs / 10000) + 1 }, (_, i) => {
                const sec = i * 10;
                const x = sec * TIMELINE_PX_PER_SEC;
                const min = Math.floor(sec / 60);
                const s = sec % 60;
                return (
                  <div key={i} className="absolute top-0 h-full" style={{ left: x }}>
                    <div className="w-[1px] h-2 bg-[#555570]" />
                    <span className="text-[8px] text-[#555570] font-mono ml-1 select-none">
                      {String(min).padStart(2, '0')}:{String(s).padStart(2, '0')}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Video Track */}
            <div className="h-[55px] relative border-b border-[#2a2a4a]/50">
              <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-[#2a2a4a]" />
              {videoClips.map(clip => {
                const left = (clip.startMs / 1000) * TIMELINE_PX_PER_SEC;
                const width = (clip.durationMs / 1000) * TIMELINE_PX_PER_SEC;
                return (
                  <motion.div
                    key={clip.id}
                    initial={{ scaleX: 0, opacity: 0 }}
                    animate={{ scaleX: 1, opacity: 1 }}
                    transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                    onClick={(e) => {
                      e.stopPropagation();
                      dispatch({ type: 'SELECT_CLIP', clipId: clip.id });
                    }}
                    className={`absolute top-1 bottom-1 rounded-md overflow-hidden origin-left cursor-pointer group ${state.selectedClipId === clip.id ? 'ring-2 ring-[#4a7dff]' : ''
                      }`}
                    style={{ left, width: Math.max(width, 20) }}
                  >
                    <div className="absolute inset-0 bg-[#7c5cfc]" />
                    {clip.type === 'vimeo' ? (
                      <div className="absolute inset-0 bg-black flex items-center justify-center overflow-hidden">
                        {clip.thumbnail ? (
                          <img src={clip.thumbnail} className="w-full h-full object-cover opacity-60" />
                        ) : (
                          <Film size={12} className="text-white/50" />
                        )}
                      </div>
                    ) : (
                      <img src={clip.src} className="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-luminosity" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-r from-[#7c5cfc]/80 via-transparent to-[#7c5cfc]/80" />
                    <div className="relative z-10 flex items-center gap-2 px-2 h-full">
                      <span className="text-[8px] text-white/80 font-medium truncate">{clip.name}</span>
                    </div>
                    {state.selectedClipId === clip.id && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          dispatch({ type: 'REMOVE_CLIP', clipId: clip.id });
                        }}
                        className="absolute top-0.5 right-0.5 p-0.5 bg-black/50 rounded z-20 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X size={10} className="text-white" />
                      </button>
                    )}
                  </motion.div>
                );
              })}
            </div>

            {/* Audio Track */}
            <div className="h-[40px] relative">
              <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-[#2a2a4a]" />
              {videoClips.length > 0 && (
                <div
                  className="absolute top-1 bottom-1 rounded-md bg-[#1e3a5f] overflow-hidden"
                  style={{
                    left: (videoClips[0].startMs / 1000) * TIMELINE_PX_PER_SEC,
                    width: Math.min(
                      ((videoClips.reduce((max, c) => Math.max(max, c.startMs + c.durationMs), 0) - videoClips[0].startMs) / 1000) * TIMELINE_PX_PER_SEC,
                      timelineWidthPx - 20
                    ),
                  }}
                >
                  <div className="flex items-center gap-2 px-2 h-full relative">
                    <span className="text-[8px] text-[#4a9dff] font-medium">Audio.aac</span>
                    <svg className="absolute inset-0 w-full h-full opacity-30" preserveAspectRatio="none" viewBox="0 0 400 40">
                      <path d={generateWaveformPath(400, 40)} fill="none" stroke="#4a9dff" strokeWidth="1" />
                    </svg>
                  </div>
                </div>
              )}
            </div>

            {/* Playhead */}
            <div
              className="absolute top-0 bottom-0 w-[2px] bg-[#ff4466] z-40 pointer-events-none"
              style={{ left: playheadPx }}
            >
              <div className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-[#ff4466] rounded-sm rotate-45" />
            </div>

            {/* Drop zone indicator */}
            {state.isDragOver && (
              <div className="absolute inset-0 bg-[#4a7dff]/5 flex items-center justify-center pointer-events-none">
                <span className="text-[11px] text-[#4a7dff] font-bold">Drop media here</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default VideoShowcase;
