
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Film, MonitorPlay, Zap, ArrowUpRight } from 'lucide-react';
import ReactPlayer from 'react-player';

const ReactPlayerFixed = ReactPlayer as unknown as React.ComponentType<any>;


// Services with local video files
const services = [
    {
        id: 'brand-business',
        title: 'Brand and Business Video',
        shortTitle: 'Business',
        description: 'Elevate your corporate identity with high-end production that communicates your value proposition effectively.',
        icon: Camera,
        videoSrc: '/BrandAndBusiness.MP4'
    },
    {
        id: 'lifestyle-personal',
        title: 'Lifestyle & Personal Brand',
        shortTitle: 'Lifestyle',
        description: 'Authentic storytelling that connects deeply with your audience, showcasing the human side of your brand.',
        icon: MonitorPlay,
        videoSrc: '/Lifestyle.MP4'
    },
    {
        id: 'event-coverage',
        title: 'Event Coverage',
        shortTitle: 'Events',
        description: 'Capture the energy and key moments of your events with cinematic flair, perfect for recaps and promotion.',
        icon: Film,
        videoSrc: '/Events.MP4'
    },
    {
        id: 'social-media',
        title: 'Social Media Content',
        shortTitle: 'Social',
        description: 'Engaging, trend-aware content designed to stop the scroll and drive engagement across all platforms.',
        icon: Zap,
        videoSrc: '/SocialMedia.MP4'
    }
];

interface ServicesSectionProps {
    isActive?: boolean;
}

const ServicesSection: React.FC<ServicesSectionProps> = ({ isActive = false }) => {
    const [activeIndex, setActiveIndex] = useState(0);
    const [progress, setProgress] = useState(0);
    const [isPaused, setIsPaused] = useState(false);

    const sectionRef = useRef(null);

    // Refs for clean timer logic
    const activeIndexRef = useRef(0);
    const progressRef = useRef(0);
    const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
    const bgVideoRefs = useRef<(HTMLVideoElement | null)[]>([]);

    useEffect(() => {
        // Control main videos
        videoRefs.current.forEach((video) => {
            if (video) {
                if (isActive && !isPaused) {
                    video.play().catch(e => console.log("Auto-play prevented:", e));
                } else {
                    video.pause();
                }
            }
        });
        // Control background videos
        bgVideoRefs.current.forEach((video) => {
            if (video) {
                if (isActive && !isPaused) {
                    video.play().catch(e => console.log("Bg Auto-play prevented:", e));
                } else {
                    video.pause();
                }
            }
        });
    }, [isActive, isPaused]);

    // Progress tracking is now handled by ReactPlayer's onProgress callback
    // No need for manual RAF-based updates

    // Reset progress when changing videos
    useEffect(() => {
        setProgress(0);
        progressRef.current = 0;
    }, [activeIndex]);

    // ReactPlayer handles play/pause automatically via the playing prop

    // Manual change handler
    const handleManualChange = (index: number) => {
        activeIndexRef.current = index;
        progressRef.current = 0;
        setActiveIndex(index);
        setProgress(0);
    };

    return (
        <section ref={sectionRef} className="h-screen w-full flex flex-col justify-center bg-[#0d0d0d] overflow-hidden border-t border-white/5 relative py-8 sm:py-12 md:py-20">
            <div className="container mx-auto px-6 md:px-12 h-full flex flex-col">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="text-center mb-4 md:mb-8 flex-shrink-0"
                >
                    <span className="text-[11px] uppercase tracking-[0.3em] md:tracking-[0.6em] text-[#bfff00] mb-3 block opacity-70">
                        Our Expertise
                    </span>
                    <h2 className="text-3xl md:text-5xl serif">Services</h2>
                </motion.div>

                <div
                    className="flex-1 flex flex-row gap-2 md:gap-4 min-h-0"
                    onMouseLeave={() => setIsPaused(false)}
                >
                    {services.map((service, index) => {
                        const isActive = activeIndex === index;
                        return (
                            <motion.div
                                key={service.id}
                                layout
                                onClick={() => handleManualChange(index)}
                                onMouseEnter={() => {
                                    setIsPaused(true);
                                    if (!isActive) handleManualChange(index);
                                }}
                                onMouseLeave={() => setIsPaused(false)}
                                onTouchStart={() => setIsPaused(true)}
                                onTouchEnd={() => setIsPaused(false)}
                                className={`relative rounded-2xl overflow-hidden cursor-pointer transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]
                  ${isActive ? 'flex-[4] sm:flex-[3] md:flex-[4]' : 'flex-[0.5] sm:flex-1 hover:flex-[1.2]'}
                  ${isActive ? 'grayscale-0' : 'grayscale hover:grayscale-0'}
                `}
                            >
                                {/* Background Media — two layers: blurry fill + clear video */}
                                <div className="absolute inset-0 bg-[#1a1a1a] overflow-hidden">
                                    {/* Layer 1: Blurry scaled video fills entire card */}
                                    <div
                                        className={`absolute inset-[-40%] transition-opacity duration-700 ${isActive ? 'opacity-50' : 'opacity-20'}`}
                                        style={{ filter: 'blur(20px)' }}
                                    >
                                        {/* @ts-ignore - ReactPlayer types have issues */}
                                        <video
                                            ref={el => { bgVideoRefs.current[index] = el; }}
                                            src={service.videoSrc}
                                            className="w-full h-full object-cover"
                                            autoPlay
                                            muted
                                            loop
                                            playsInline
                                            style={{ pointerEvents: 'none' }}
                                        />
                                    </div>

                                    {/* Layer 2: Clear video (centered, normal aspect ratio) */}
                                    <div className={`absolute inset-0 transition-opacity duration-700 ${isActive ? 'opacity-70' : 'opacity-30'}`}>
                                        {/* @ts-ignore - ReactPlayer types have issues */}
                                        <video
                                            ref={el => { videoRefs.current[index] = el; }}
                                            src={service.videoSrc}
                                            className="w-full h-full object-contain"
                                            muted
                                            loop
                                            playsInline
                                            autoPlay
                                            style={{ pointerEvents: 'none' }}
                                            onTimeUpdate={(e) => {
                                                if (isActive && index === activeIndex) {
                                                    const video = e.currentTarget;
                                                    const currentProgress = (video.currentTime / video.duration) * 100;
                                                    progressRef.current = currentProgress;
                                                    setProgress(currentProgress);
                                                }
                                            }}
                                            onEnded={() => {
                                                console.log(`Video ended: ${service.videoSrc}`);
                                                if (isActive && index === activeIndex) {
                                                    progressRef.current = 0;
                                                    const nextIndex = (activeIndexRef.current + 1) % services.length;
                                                    activeIndexRef.current = nextIndex;
                                                    setActiveIndex(nextIndex);
                                                }
                                            }}
                                        />
                                    </div>

                                    {/* Gradient overlay */}
                                    <div className={`absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent transition-opacity duration-500 ${isActive ? 'opacity-80' : 'opacity-60'}`} />
                                </div>

                                {/* Progress Bar (Visible only when active) */}
                                {isActive && (
                                    <div className="absolute top-0 left-0 w-full h-1 bg-white/10 z-20">
                                        <motion.div
                                            className="h-full bg-[#bfff00]"
                                            style={{ width: `${progress}%` }}
                                        />
                                    </div>
                                )}

                                {/* Content Container */}
                                <div className="relative h-full z-10 p-4 md:p-6 flex flex-col justify-end">
                                    <AnimatePresence mode="wait">
                                        {isActive ? (
                                            <motion.div
                                                key="expanded"
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: 10 }}
                                                transition={{ duration: 0.3, delay: 0.1 }}
                                                className="space-y-4"
                                            >
                                                <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center mb-4 text-[#bfff00]">
                                                    <service.icon size={24} />
                                                </div>
                                                <h3 className="text-lg sm:text-2xl md:text-4xl serif leading-tight">{service.title}</h3>
                                                <p className="text-xs sm:text-sm md:text-base text-white/70 max-w-[280px] sm:max-w-sm md:max-w-md font-light leading-relaxed">
                                                    {service.description}
                                                </p>
                                                <div className="pt-4">
                                                    <button className="flex items-center gap-2 text-[11px] uppercase tracking-wider md:tracking-widest text-white hover:text-[#bfff00] transition-colors min-h-[44px]">
                                                        View Projects <ArrowUpRight size={14} />
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
                                                className="flex flex-col items-center justify-end h-full absolute inset-0 pb-8"
                                            >
                                                <div className="-rotate-90 origin-center whitespace-nowrap mb-12">
                                                    <span className="text-xs md:text-sm uppercase tracking-[0.1em] md:tracking-[0.2em] font-bold text-white/50">{service.shortTitle}</span>
                                                </div>
                                                <div className="p-3 rounded-full bg-white/5 backdrop-blur-sm text-white/50">
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
