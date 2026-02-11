
import React from 'react';
import { Star } from 'lucide-react';
import { TESTIMONIALS } from '../constants';

const TestimonialsSection: React.FC = () => {
    // Duplicate testimonials for infinite loop effect
    const duplicatedTestimonials = [...TESTIMONIALS, ...TESTIMONIALS, ...TESTIMONIALS];

    return (
        <section className="h-screen w-full flex flex-col bg-gradient-to-br from-[#0a0a0a] via-[#111] to-[#0d0d0d] overflow-hidden relative">
            {/* Ambient glow effects */}
            <div className="absolute top-1/4 -left-1/4 w-1/2 h-1/2 bg-[#bfff00]/5 blur-[120px] rounded-full pointer-events-none" />
            <div className="absolute bottom-1/4 -right-1/4 w-1/2 h-1/2 bg-[#4a7dff]/5 blur-[120px] rounded-full pointer-events-none" />

            {/* Chat Container - Centered with max-width */}
            <div className="relative w-full h-full flex flex-col items-center justify-center">
                {/* Chat window with glass effect - constrained width */}
                <div className="relative h-full w-full max-w-4xl bg-black/20 backdrop-blur-sm overflow-hidden flex flex-col mx-auto">
                    {/* Header */}
                    <div className="relative h-20 md:h-24 bg-gradient-to-b from-black/60 to-transparent backdrop-blur-sm border-b border-white/5 z-10 flex items-center justify-between px-6 md:px-12 flex-shrink-0 mt-16 md:mt-20">
                        <div className="flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-[#bfff00] animate-pulse" />
                            <span className="text-xs md:text-sm text-white/60 uppercase tracking-wider">Live Messages</span>
                        </div>
                        <div>
                            <h2 className="text-3xl md:text-5xl text-white" style={{ fontFamily: 'Brush Script MT, cursive' }}>Testimonials</h2>
                        </div>
                    </div>

                    {/* Messages container with mask */}
                    <div className="flex-1 overflow-hidden relative">
                        <div
                            className="absolute inset-0 overflow-hidden"
                            style={{
                                maskImage: 'linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%)',
                                WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%)'
                            }}
                        >
                            {/* Scrolling container with CSS animation */}
                            <div className="animate-scroll-up">
                                <div className="p-6 md:p-12 space-y-6 w-full">
                                    {duplicatedTestimonials.map((msg, index) => (
                                        <div
                                            key={`${msg.id}-${index}`}
                                            className={`flex ${msg.type === 'booking' ? 'justify-start' : 'justify-end'}`}
                                        >
                                            <div className={`max-w-[80%] ${msg.type === 'booking' ? 'order-2' : 'order-1'}`}>
                                                {/* Message bubble */}
                                                <div className={`
                                                    relative px-5 py-4 rounded-2xl
                                                    ${msg.type === 'booking'
                                                        ? 'bg-white/5 border border-white/10 rounded-tl-sm'
                                                        : 'bg-gradient-to-br from-[#bfff00] to-[#9fdf00] text-black rounded-tr-sm'
                                                    }
                                                    backdrop-blur-sm shadow-lg
                                                `}>
                                                    {/* Stars for testimonials */}
                                                    {msg.type === 'testimonial' && (
                                                        <div className="flex gap-0.5 mb-2">
                                                            {[...Array(5)].map((_, i) => (
                                                                <Star key={i} size={12} fill="currentColor" className="text-black/80" />
                                                            ))}
                                                        </div>
                                                    )}

                                                    <p className={`text-sm md:text-base leading-relaxed ${msg.type === 'booking' ? 'text-white/90' : 'text-black'
                                                        }`}>
                                                        {msg.message}
                                                    </p>

                                                    {/* Sender info */}
                                                    <div className={`mt-3 pt-3 border-t ${msg.type === 'booking' ? 'border-white/10' : 'border-black/10'
                                                        } flex items-center justify-between`}>
                                                        <div>
                                                            <p className={`text-xs font-bold ${msg.type === 'booking' ? 'text-white' : 'text-black'
                                                                }`}>
                                                                {msg.name}
                                                            </p>
                                                            <p className={`text-[10px] ${msg.type === 'booking' ? 'text-white/50' : 'text-black/60'
                                                                } uppercase tracking-wider`}>
                                                                {msg.role}
                                                            </p>
                                                        </div>
                                                        <span className={`text-[10px] ${msg.type === 'booking' ? 'text-white/40' : 'text-black/40'
                                                            }`}>
                                                            {msg.time}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bottom gradient fade */}
                    <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
                </div>
            </div>

            <style>{`
                @keyframes scroll-up {
                    0% {
                        transform: translateY(0);
                    }
                    100% {
                        transform: translateY(-33.333%);
                    }
                }

                .animate-scroll-up {
                    animation: scroll-up 30s linear infinite;
                }
            `}</style>
        </section>
    );
};

export default TestimonialsSection;
