
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Camera, Film, MonitorPlay, Zap, ArrowUpRight, Volume2, VolumeX } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// How long each card holds the stage. The clips are different lengths, so the
// carousel runs on its own clock instead of waiting for `ended` — that also means
// a video that fails to load can never stall the rotation.
const SLIDE_MS = 8000;

// Sound eases in rather than snapping to full volume — sweeping the pointer
// across the row would otherwise fire a burst of audio pops.
// Deliberately on a timer rather than requestAnimationFrame: rAF is frozen in a
// backgrounded or occluded window, which would strand the video unmuted at volume
// zero — audible in name only.
const FADE_MS = 350;
const FADE_STEP_MS = 25;
const fades = new WeakMap<HTMLVideoElement, ReturnType<typeof setInterval>>();

// Chrome can tell us up front whether a video may play with sound. Browsers
// without the API get the benefit of the doubt — the pause handler corrects us.
type NavigatorWithPolicy = Navigator & { getAutoplayPolicy?: (target: unknown) => string };
const supportsAutoplayPolicy = () =>
    typeof (navigator as NavigatorWithPolicy).getAutoplayPolicy === 'function';
const audioIsAllowed = () => {
    const nav = navigator as NavigatorWithPolicy;
    return nav.getAutoplayPolicy ? nav.getAutoplayPolicy('mediaelement') === 'allowed' : true;
};

const cancelFade = (video: HTMLVideoElement) => {
    const running = fades.get(video);
    if (running !== undefined) { clearInterval(running); fades.delete(video); }
};

const fadeIn = (video: HTMLVideoElement) => {
    cancelFade(video);
    const from = video.volume;
    const start = Date.now();
    const id = setInterval(() => {
        const t = Math.min(1, (Date.now() - start) / FADE_MS);
        video.volume = from + (1 - from) * t;
        if (t >= 1) cancelFade(video);
    }, FADE_STEP_MS);
    fades.set(video, id);
};

const services = [
    {
        id: 'brand-business',
        title: 'Brand and Business Video',
        shortTitle: 'Business',
        description: 'Elevate your corporate identity with high-end production that communicates your value proposition effectively.',
        icon: Camera,
        videoSrc: '/BrandAndBusiness.MP4',
        poster: '/posters/service-BrandAndBusiness.jpg',
    },
    {
        id: 'lifestyle-personal',
        title: 'Lifestyle & Personal Brand',
        shortTitle: 'Lifestyle',
        description: 'Authentic storytelling that connects deeply with your audience, showcasing the human side of your brand.',
        icon: MonitorPlay,
        videoSrc: '/Lifestyle.MP4',
        poster: '/posters/service-Lifestyle.jpg',
    },
    {
        id: 'event-coverage',
        title: 'Event Coverage',
        shortTitle: 'Events',
        description: 'Capture the energy and key moments of your events with cinematic flair, perfect for recaps and promotion.',
        icon: Film,
        videoSrc: '/Events.MP4',
        poster: '/posters/service-Events.jpg',
    },
    {
        id: 'social-media',
        title: 'Social Media Content',
        shortTitle: 'Social',
        description: 'Engaging, trend-aware content designed to stop the scroll and drive engagement across all platforms.',
        icon: Zap,
        videoSrc: '/SocialMedia.MP4',
        poster: '/posters/service-SocialMedia.jpg',
    },
];

interface ServicesSectionProps {
    isActive?: boolean;
}

const ServicesSection: React.FC<ServicesSectionProps> = ({ isActive = false }) => {
    const [activeIndex, setActiveIndex] = useState(0);
    const [isPaused, setIsPaused] = useState(false);

    // Two ways to hear a card: rest the pointer on it, or pin the speaker.
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
    const [speakerOn, setSpeakerOn] = useState(false);
    const [hoverCapable, setHoverCapable] = useState(false);
    // Browsers stop a video that becomes audible without permission. Hover is not
    // a gesture, so we only take the risk once we believe audio is allowed —
    // otherwise the preview would cost the visitor a stalled video.
    const [audioUnlocked, setAudioUnlocked] = useState(!supportsAutoplayPolicy());
    const soundOn = speakerOn || (hoverCapable && audioUnlocked && hoveredIndex !== null);

    const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
    // One stable callback per card. An inline arrow here would be a fresh function
    // on every render, so React would re-run it every time — and it sets
    // `muted = true`, which would silently undo whatever the visitor just asked for.
    const setVideoRef = useMemo(
        () => services.map((_, i) => (el: HTMLVideoElement | null) => {
            videoRefs.current[i] = el;
            if (el) { el.setAttribute('muted', ''); el.muted = true; }  // iOS reads the attribute
        }),
        [],
    );
    const progressBarRef = useRef<HTMLDivElement | null>(null);
    const progressRef = useRef(0);           // 0–1 through the current slide
    const activeIndexRef = useRef(0);
    const isActiveRef = useRef(isActive);
    const wantsSoundRef = useRef(false);

    const navigate = useNavigate();
    const reduceMotion = useReducedMotion();

    activeIndexRef.current = activeIndex;
    isActiveRef.current = isActive;
    wantsSoundRef.current = soundOn;

    // ── Playback ────────────────────────────────────────────────────────────
    // Only the card on stage plays; everything else is parked at its poster frame.
    useEffect(() => {
        videoRefs.current.forEach((video, index) => {
            if (!video) return;
            if (isActive && index === activeIndex) {
                video.play().catch(() => { /* poster stays up; the timer keeps going */ });
            } else {
                video.pause();
            }
        });
    }, [isActive, activeIndex]);

    // Hover-to-hear only makes sense with a real pointer. Touch devices keep the
    // speaker button, which never fires audio the visitor did not ask for.
    useEffect(() => {
        const mq = window.matchMedia('(hover: hover) and (pointer: fine)');
        const sync = () => setHoverCapable(mq.matches);
        sync();
        mq.addEventListener('change', sync);
        return () => mq.removeEventListener('change', sync);
    }, []);

    // ── Sound ───────────────────────────────────────────────────────────────
    // Sound belongs to exactly one video: the one on stage, and only while the
    // visitor has asked for it.
    useEffect(() => {
        videoRefs.current.forEach((video, index) => {
            if (!video) return;
            const wantsSound = soundOn && isActive && index === activeIndex;

            if (!wantsSound) {
                cancelFade(video);
                video.volume = 0;
                video.muted = true;
                video.setAttribute('muted', '');   // iOS checks the attribute, not the property
                return;
            }

            video.volume = 0;
            video.muted = false;
            video.removeAttribute('muted');
            fadeIn(video);
        });
    }, [soundOn, isActive, activeIndex]);

    // A card that goes audible without permission gets stopped by the browser.
    // `play()` is no help here — it resolves, because the element *was* playing
    // when we called it, and the stop lands afterwards. The pause event is the
    // only reliable signal, so recovery hangs off it: drop back to silent
    // playback and stop offering hover previews until a real click says otherwise.
    const handlePause = useCallback((index: number) => {
        const video = videoRefs.current[index];
        if (!video) return;
        // Leaving the stage is a pause we asked for.
        if (!isActiveRef.current || index !== activeIndexRef.current || !wantsSoundRef.current) return;
        // So is the browser suspending media in a tab nobody is looking at.
        if (document.visibilityState !== 'visible') return;

        cancelFade(video);
        video.volume = 0;
        video.muted = true;
        video.setAttribute('muted', '');
        setAudioUnlocked(false);
        setSpeakerOn(false);
        setHoveredIndex(null);
        void video.play().catch(() => { });
    }, []);

    // A click anywhere is what browsers want before they will let a video be
    // heard, so re-ask after every one. The policy flips once the click has been
    // processed, hence the deferred read.
    useEffect(() => {
        if (!supportsAutoplayPolicy()) return;
        const sync = () => setAudioUnlocked(audioIsAllowed());
        const resync = () => { window.setTimeout(sync, 0); };
        sync();
        document.addEventListener('click', resync, { passive: true });
        document.addEventListener('keydown', resync);
        return () => {
            document.removeEventListener('click', resync);
            document.removeEventListener('keydown', resync);
        };
    }, []);

    // The speaker button is a real gesture, so it is allowed to try even when we
    // think audio is blocked. If it plays without the browser stepping in, that
    // settles it — hover previews are safe to offer again. `handlePause` clears
    // `speakerOn`, which cancels this before it can fire.
    useEffect(() => {
        if (!speakerOn) return;
        const settled = window.setTimeout(() => setAudioUnlocked(true), 600);
        return () => window.clearTimeout(settled);
    }, [speakerOn]);

    // Whenever the sounding video loses focus — the carousel moves on, the section
    // scrolls away, or the tab goes to the background — sound returns to mute.
    // Hover is deliberately left alone here: moving the pointer onto a new card
    // changes `activeIndex`, and that preview should keep playing.
    useEffect(() => { setSpeakerOn(false); }, [activeIndex]);
    useEffect(() => {
        if (!isActive) { setSpeakerOn(false); setHoveredIndex(null); }
    }, [isActive]);
    useEffect(() => {
        const remuteWhenHidden = () => {
            if (document.visibilityState !== 'visible') { setSpeakerOn(false); setHoveredIndex(null); }
        };
        // Browsers suspend media in a backgrounded tab and do not restart it, so
        // the card would sit frozen on the visitor's return.
        const resumeWhenVisible = () => {
            if (document.visibilityState !== 'visible' || !isActiveRef.current) return;
            videoRefs.current[activeIndexRef.current]?.play().catch(() => { });
        };
        const onVisibilityChange = () => { remuteWhenHidden(); resumeWhenVisible(); };
        document.addEventListener('visibilitychange', onVisibilityChange);
        window.addEventListener('blur', remuteWhenHidden);
        return () => {
            document.removeEventListener('visibilitychange', onVisibilityChange);
            window.removeEventListener('blur', remuteWhenHidden);
        };
    }, []);

    // The button always does the opposite of what you can currently hear:
    // silence a card you are hovering, or pin sound on one you are not.
    const toggleSound = useCallback(() => {
        if (soundOn) { setSpeakerOn(false); setHoveredIndex(null); }
        else setSpeakerOn(true);
    }, [soundOn]);

    const goTo = useCallback((index: number) => {
        if (index === activeIndexRef.current) return;
        progressRef.current = 0;
        if (progressBarRef.current) progressBarRef.current.style.transform = 'scaleX(0)';

        const incoming = videoRefs.current[index];
        if (incoming) {
            incoming.currentTime = 0;
            // Fired straight off the tap so iOS still counts it as user-activated.
            incoming.play().catch(() => { });
        }
        setActiveIndex(index);
    }, []);

    // ── Auto-advance ────────────────────────────────────────────────────────
    // Reduced-motion visitors drive the carousel themselves.
    useEffect(() => {
        if (!isActive || isPaused || reduceMotion) return;

        let frame = 0;
        const start = performance.now() - progressRef.current * SLIDE_MS;

        const tick = (now: number) => {
            const pct = Math.min(1, (now - start) / SLIDE_MS);
            progressRef.current = pct;
            if (progressBarRef.current) progressBarRef.current.style.transform = `scaleX(${pct})`;
            if (pct >= 1) {
                goTo((activeIndexRef.current + 1) % services.length);
                return;
            }
            frame = requestAnimationFrame(tick);
        };

        frame = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(frame);
    }, [isActive, isPaused, activeIndex, reduceMotion, goTo]);

    // Reset the clock when the section is scrolled away so it starts fresh on return.
    useEffect(() => {
        if (isActive) return;
        progressRef.current = 0;
        if (progressBarRef.current) progressBarRef.current.style.transform = 'scaleX(0)';
    }, [isActive]);

    return (
        <section className="relative h-screen w-full flex flex-col justify-center overflow-hidden border-t border-white/5 bg-[#0d0d0d] pb-14 pt-24 sm:pb-12 sm:pt-28 md:pb-16 md:pt-28">
            <div className="container mx-auto flex h-full flex-col px-6 md:px-12">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={isActive ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                    transition={{ duration: 0.8 }}
                    className="mb-4 flex-shrink-0 text-center md:mb-8"
                >
                    <span className="mb-3 block text-[11px] uppercase tracking-[0.3em] text-[#bfff00] opacity-70 md:tracking-[0.6em]">
                        Our Expertise
                    </span>
                    <h2 className="serif text-3xl md:text-5xl">Services</h2>
                </motion.div>

                <div
                    className="flex min-h-0 flex-1 flex-row gap-2 md:gap-4"
                    onMouseLeave={() => { setIsPaused(false); setHoveredIndex(null); }}
                >
                    {services.map((service, index) => {
                        // `isCardActive` = this card is on stage.
                        // `isActive` (prop) = the whole section is in view.
                        const isCardActive = activeIndex === index;
                        const isNext = index === (activeIndex + 1) % services.length;
                        // Hovering cannot make sound yet — nudge the visitor towards the click
                        // that unlocks it, instead of leaving them with silent hover.
                        const needsClickForSound = isCardActive && hoverCapable && !audioUnlocked && hoveredIndex === index;

                        return (
                            <motion.div
                                key={service.id}
                                layout
                                role="tab"
                                aria-selected={isCardActive}
                                aria-label={service.title}
                                tabIndex={0}
                                onClick={() => goTo(index)}
                                onKeyDown={e => {
                                    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); goTo(index); }
                                }}
                                onMouseEnter={() => { setIsPaused(true); setHoveredIndex(index); goTo(index); }}
                                onMouseLeave={() => { setIsPaused(false); setHoveredIndex(h => (h === index ? null : h)); }}
                                className={`relative cursor-pointer select-none overflow-hidden rounded-2xl outline-none transition-[flex,filter] duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] focus-visible:ring-2 focus-visible:ring-[#bfff00]
                  ${isCardActive
                                        ? 'flex-[4] grayscale-0 ring-1 ring-[#bfff00]/25 sm:flex-[3] md:flex-[4]'
                                        : 'flex-[0.5] grayscale hover:grayscale-0 sm:flex-1 hover:flex-[1.2]'}
                `}
                            >
                                {/* ── Media ─────────────────────────────────────────────
                                    Every clip is vertical 9:16 and every card is a tall
                                    column, so object-cover fills it edge to edge — no
                                    letterboxing, no blurred filler. */}
                                <div className="absolute inset-0 overflow-hidden bg-[#111]">
                                    <video
                                        ref={setVideoRef[index]}
                                        src={service.videoSrc}
                                        poster={service.poster}
                                        className={`h-full w-full object-cover object-center transition-opacity duration-700 ${isCardActive ? 'opacity-100' : 'opacity-50'}`}
                                        muted
                                        loop
                                        playsInline
                                        disablePictureInPicture
                                        preload={isCardActive ? 'auto' : isNext ? 'metadata' : 'none'}
                                        onPause={() => handlePause(index)}
                                        aria-hidden="true"
                                        tabIndex={-1}
                                        style={{ pointerEvents: 'none' }}
                                    />

                                    {/* Scrim — heavy only where the copy sits, so the footage
                                        stays visible everywhere else. */}
                                    <div
                                        className="pointer-events-none absolute inset-0 transition-opacity duration-500"
                                        style={{
                                            background: isCardActive
                                                ? 'linear-gradient(to top, rgba(0,0,0,0.94) 0%, rgba(0,0,0,0.6) 28%, rgba(0,0,0,0.08) 58%, rgba(0,0,0,0.35) 100%)'
                                                : 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.5) 60%, rgba(0,0,0,0.5) 100%)',
                                        }}
                                    />
                                </div>

                                {/* Progress — one bar, driven straight from the carousel clock */}
                                {isCardActive && (
                                    <div className="absolute left-0 top-0 z-20 h-1 w-full bg-white/10">
                                        <div
                                            ref={progressBarRef}
                                            className="h-full origin-left bg-[#bfff00]"
                                            style={{ transform: 'scaleX(0)' }}
                                        />
                                    </div>
                                )}

                                {/* Sound — lives on the card that is playing. Muting is
                                    handled centrally the moment this card loses the stage. */}
                                {isCardActive && (
                                    <button
                                        onClick={e => { e.stopPropagation(); toggleSound(); }}
                                        aria-label={soundOn ? `Mute ${service.title}` : `Play ${service.title} with sound`}
                                        aria-pressed={soundOn}
                                        className={`absolute right-3 top-4 z-30 rounded-full p-2.5 backdrop-blur-md ring-1 transition-colors md:right-4 md:top-5
                      ${soundOn
                                                ? 'bg-[#bfff00] text-black ring-[#bfff00]'
                                                : 'bg-black/45 text-white/90 ring-white/15 hover:bg-black/70 hover:text-[#bfff00]'}
                      ${needsClickForSound ? 'animate-pulse ring-[#bfff00]/70' : ''}`}
                                    >
                                        {soundOn ? <Volume2 size={15} /> : <VolumeX size={15} />}
                                    </button>
                                )}

                                {/* ── Copy ──────────────────────────────────────────────── */}
                                <div className="relative z-10 flex h-full flex-col justify-end p-4 md:p-6">
                                    <AnimatePresence mode="wait">
                                        {isCardActive ? (
                                            <motion.div
                                                key="expanded"
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: 10 }}
                                                transition={{ duration: 0.3, delay: 0.1 }}
                                                className="space-y-4"
                                            >
                                                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-[#bfff00] backdrop-blur-sm">
                                                    <service.icon size={24} />
                                                </div>
                                                <h3 className="serif text-lg leading-tight sm:text-2xl md:text-4xl">{service.title}</h3>
                                                <p className="max-w-[280px] text-xs font-light leading-relaxed text-white/70 sm:max-w-sm sm:text-sm md:max-w-md md:text-base">
                                                    {service.description}
                                                </p>
                                                <div className="pt-4">
                                                    <button
                                                        onClick={e => { e.stopPropagation(); navigate('/portfolio'); }}
                                                        className="group flex min-h-[44px] items-center gap-2 text-[11px] uppercase tracking-wider text-white transition-colors hover:text-[#bfff00] md:tracking-widest"
                                                    >
                                                        View Projects
                                                        <ArrowUpRight size={14} className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                                                    </button>
                                                </div>
                                            </motion.div>
                                        ) : (
                                            <motion.div
                                                key="collapsed"
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                transition={{ duration: 0.3 }}
                                                className="absolute inset-0 flex h-full flex-col items-center justify-end pb-8"
                                            >
                                                <div className="mb-12 origin-center -rotate-90 whitespace-nowrap">
                                                    <span className="text-xs font-bold uppercase tracking-[0.1em] text-white/60 md:text-sm md:tracking-[0.2em]">
                                                        {service.shortTitle}
                                                    </span>
                                                </div>
                                                <div className="rounded-full bg-white/5 p-3 text-white/50 backdrop-blur-sm">
                                                    <service.icon size={20} />
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};

export default ServicesSection;
