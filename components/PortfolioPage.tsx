import React, { useState, useRef } from 'react';
import { PORTFOLIO_VIDEOS } from '../constants';
import { motion } from 'framer-motion';
import { ChevronLeft, Heart, MessageCircle, Share2, Music, Volume2, VolumeX, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PortfolioPage: React.FC = () => {
    const navigate = useNavigate();
    const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
    const [isMuted, setIsMuted] = useState(true);
    const containerRef = useRef<HTMLDivElement>(null);

    const handleScroll = () => {
        if (!containerRef.current) return;
        const index = Math.round(containerRef.current.scrollTop / window.innerHeight);
        if (index !== currentVideoIndex && index >= 0 && index < PORTFOLIO_VIDEOS.length) {
            setCurrentVideoIndex(index);
        }
    };

    return (
        <div
            ref={containerRef}
            onScroll={handleScroll}
            className="h-[100dvh] w-full bg-black overflow-y-auto overflow-x-hidden snap-y snap-mandatory relative"
        >
            {/* Back Button */}
            <button
                onClick={() => navigate(-1)}
                className="fixed top-6 left-6 md:top-8 md:left-8 z-[100] p-3 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-white hover:bg-white/10 transition-colors pointer-events-auto"
            >
                <ChevronLeft className="w-6 h-6" />
            </button>

            {PORTFOLIO_VIDEOS.map((url, index) => {
                const isActive = index === currentVideoIndex;

                return (
                    <div
                        key={index}
                        onClick={() => setIsMuted(!isMuted)}
                        className="snap-start shrink-0 h-[100dvh] w-full relative flex items-center justify-center bg-black cursor-pointer"
                    >
                        {/* Auto-play and pause based on visibility */}
                        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                            {/* Load surrounding videos optionally to prevent complete blank frames, 
                  but strictly play ONLY the active one */}
                            {Math.abs(currentVideoIndex - index) <= 1 && (() => {
                                const videoId = url.split('/').pop();
                                const standardUrl = url.includes('reviews') ? `https://vimeo.com/${videoId}` : url;

                                return (
                                    <div className="w-full h-full relative flex items-center justify-center bg-zinc-900 group">
                                        {/* Loading Skeleton */}
                                        <div className="absolute flex flex-col items-center justify-center gap-3 z-0 pointer-events-none">
                                            <Loader2 className="w-8 h-8 text-white/50 animate-spin" />
                                            <span className="text-white/50 text-sm font-medium">Loading HQ Video...</span>
                                        </div>

                                        <iframe
                                            src={`https://player.vimeo.com/video/${videoId}?autoplay=${isActive ? 1 : 0}&loop=1&muted=${isMuted ? 1 : 0}&controls=0&dnt=1&title=0&byline=0&portrait=0`}
                                            className="w-full h-full scale-[1.05] pointer-events-none relative z-10 transition-opacity duration-500 bg-transparent"
                                            style={{ objectFit: 'cover' }}
                                            allow="autoplay; fullscreen; picture-in-picture"
                                            loading={index === 0 ? "eager" : "lazy"}
                                            title="Portfolio Video"
                                        />
                                    </div>
                                );
                            })()}
                        </div>

                        {/* Gradient Overlay for Text Readability */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 pointer-events-none z-10" />

                        {/* UI Overlay - Like TikTok UI */}
                        {isActive && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="absolute inset-0 pointer-events-none z-20 flex flex-col justify-end p-6 md:p-10"
                            >
                                <div className="flex items-end justify-between w-full max-w-7xl mx-auto h-full pb-8 md:pb-12">

                                    {/* Bottom Left Info */}
                                    <div className="flex-1 max-w-lg">
                                        <h2 className="text-xl md:text-2xl font-bold text-white mb-2">@asanithecreator</h2>
                                        <p className="text-sm md:text-base text-white/80 line-clamp-2 md:line-clamp-none mb-4">
                                            Cinematic storytelling and commercial work. Specializing in high-end brand content. 🎬✨
                                        </p>
                                        <div className="flex items-center gap-2 text-white/90 text-sm bg-black/40 w-fit px-3 py-1.5 rounded-full backdrop-blur-md border border-white/10">
                                            <Music className="w-4 h-4 animate-spin" style={{ animationDuration: '4s' }} />
                                            <span className="truncate max-w-[150px]">Original Sound - Asani</span>
                                        </div>
                                    </div>

                                    {/* Right Side Action Bar */}
                                    <div className="flex flex-col gap-5 items-center ml-4 pointer-events-auto pb-4">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); setIsMuted(!isMuted); }}
                                            className="group flex flex-col items-center gap-1 hover:scale-110 transition-transform mb-2"
                                        >
                                            <div className="p-3 md:p-4 rounded-full bg-black/40 backdrop-blur-md border border-white/10">
                                                {isMuted ? <VolumeX className="w-6 h-6 md:w-8 md:h-8 text-white transition-colors" /> : <Volume2 className="w-6 h-6 md:w-8 md:h-8 text-white transition-colors" />}
                                            </div>
                                        </button>

                                        <button className="group flex flex-col items-center gap-1 hover:scale-110 transition-transform">
                                            <div className="p-3 md:p-4 rounded-full bg-black/40 backdrop-blur-md border border-white/10">
                                                <Heart className="w-6 h-6 md:w-8 md:h-8 text-white group-hover:text-red-500 transition-colors" />
                                            </div>
                                            <span className="text-white text-xs font-bold shadow-black drop-shadow-md">4.2k</span>
                                        </button>

                                        <button className="group flex flex-col items-center gap-1 hover:scale-110 transition-transform">
                                            <div className="p-3 md:p-4 rounded-full bg-black/40 backdrop-blur-md border border-white/10">
                                                <MessageCircle className="w-6 h-6 md:w-8 md:h-8 text-white group-hover:text-[#bfff00] transition-colors" />
                                            </div>
                                            <span className="text-white text-xs font-bold shadow-black drop-shadow-md">128</span>
                                        </button>

                                        <button className="group flex flex-col items-center gap-1 hover:scale-110 transition-transform">
                                            <div className="p-3 md:p-4 rounded-full bg-black/40 backdrop-blur-md border border-white/10">
                                                <Share2 className="w-6 h-6 md:w-8 md:h-8 text-white group-hover:text-[#7000FF] transition-colors" />
                                            </div>
                                            <span className="text-white text-xs font-bold shadow-black drop-shadow-md">Share</span>
                                        </button>

                                        <div className="mt-4 w-12 h-12 md:w-14 md:h-14 rounded-full border-2 border-white/50 overflow-hidden animate-spin-slow" style={{ animationDuration: '8s' }}>
                                            <img src="/placeholder-music.jpg" alt="Music Record" className="w-full h-full object-cover bg-[#222]" />
                                        </div>
                                    </div>

                                </div>
                            </motion.div>
                        )}
                    </div>
                );
            })}
        </div>
    );
};

export default PortfolioPage;
