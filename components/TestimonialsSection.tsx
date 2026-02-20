import React, { useState } from 'react';
import { Check, CheckCheck, MoreVertical, Phone, Video, ChevronLeft } from 'lucide-react';
import { TESTIMONIALS, USER_IMAGE } from '../constants';

const TestimonialsSection: React.FC = () => {
    const [isPaused, setIsPaused] = useState(false);
    // Duplicate for infinite scroll effect
    const duplicatedTestimonials = [...TESTIMONIALS, ...TESTIMONIALS, ...TESTIMONIALS];

    return (
        <section className="h-screen w-full flex flex-col items-center justify-center bg-[#111b21] overflow-hidden relative font-sans select-none [-webkit-user-select:none] [-webkit-touch-callout:none]">

            {/* WhatsApp Doodle Background (Simulated with massive subtle pattern) */}
            <div
                className="absolute inset-0 opacity-[0.03] pointer-events-none"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                    backgroundSize: '60px 60px'
                }}
            />

            {/* Simulated Phone Container */}
            <div className="relative w-full max-w-2xl h-[85vh] md:h-[80vh] bg-[#0b141a] md:border md:border-white/10 md:rounded-3xl overflow-hidden flex flex-col shadow-2xl">

                {/* WhatsApp Header */}
                <div className="flex-shrink-0 h-16 bg-[#202c33] flex items-center justify-between px-3 md:px-4 z-20 shadow-md">
                    <div className="flex items-center gap-2">
                        <button className="text-white/70 hover:text-white transition-colors">
                            <ChevronLeft className="w-6 h-6" />
                        </button>

                        <div className="relative cursor-pointer">
                            <img
                                src={USER_IMAGE}
                                alt="Asani"
                                className="w-10 h-10 rounded-full object-cover border border-white/10 bg-[#111b21]"
                            />
                        </div>

                        <div className="flex flex-col ml-1 cursor-pointer">
                            <span className="text-white font-medium text-base leading-tight">My Testimonials</span>
                            <span className="text-[#8696a0] text-xs">online</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-5 text-[#aebac1]">
                        <Video className="w-5 h-5 cursor-pointer hover:text-white transition-colors" />
                        <Phone className="w-5 h-5 cursor-pointer hover:text-white transition-colors" />
                        <MoreVertical className="w-5 h-5 cursor-pointer hover:text-white transition-colors" />
                    </div>
                </div>

                {/* Date Bubble */}
                <div className="absolute top-20 left-1/2 -translate-x-1/2 z-20">
                    <div className="bg-[#182229] text-[#8696a0] text-xs px-3 py-1 rounded-lg shadow-sm border border-white/5 uppercase tracking-wide">
                        Today
                    </div>
                </div>

                {/* Messages Container */}
                <div className="flex-1 overflow-hidden relative px-2 sm:px-4 pt-12 pb-4">
                    <div
                        className="absolute inset-0 overflow-hidden"
                        style={{ maskImage: 'linear-gradient(to bottom, transparent 0%, black 10%, black 90%, transparent 100%)' }}
                        onMouseEnter={() => setIsPaused(true)}
                        onMouseLeave={() => setIsPaused(false)}
                        onTouchStart={() => setIsPaused(true)}
                        onTouchEnd={() => setIsPaused(false)}
                    >
                        <div
                            className="animate-scroll-up-chat"
                            style={{ animationPlayState: isPaused ? 'paused' : 'running' }}
                        >
                            <div className="flex flex-col gap-2 w-full pt-8 cursor-pointer">
                                {duplicatedTestimonials.map((msg, index) => {
                                    const isOutgoing = msg.isOutgoing;

                                    // Determine if it should have a tail (we'll just give all of them tails for simplicity of the UI)
                                    return (
                                        <div
                                            key={`${msg.id}-${index}`}
                                            className={`flex w-full ${isOutgoing ? 'justify-end' : 'justify-start'}`}
                                        >
                                            <div className={`
                                                relative max-w-[85%] md:max-w-[75%] px-3 py-2 text-[15px] shadow-sm leading-relaxed
                                                ${isOutgoing
                                                    ? 'bg-[#005c4b] text-[#e9edef] rounded-lg rounded-tr-none ml-12'
                                                    : 'bg-[#202c33] text-[#e9edef] rounded-lg rounded-tl-none mr-12'
                                                }
                                            `}>
                                                {/* Chat Tail - Outgoing */}
                                                {isOutgoing && (
                                                    <svg viewBox="0 0 8 13" width="8" height="13" className="absolute top-0 -right-2 text-[#005c4b]">
                                                        <path opacity=".13" d="M5.188 1H0v11.193l6.467-8.625C7.526 2.156 6.958 1 5.188 1z"></path>
                                                        <path fill="currentColor" d="M5.188 0H0v11.193l6.467-8.625C7.526 1.156 6.958 0 5.188 0z"></path>
                                                    </svg>
                                                )}

                                                {/* Chat Tail - Incoming */}
                                                {!isOutgoing && (
                                                    <svg viewBox="0 0 8 13" width="8" height="13" className="absolute top-0 -left-2 text-[#202c33]">
                                                        <path opacity=".13" fill="#0000000" d="M1.533 3.568L8 12.193V1H2.812C1.042 1 .474 2.156 1.533 3.568z"></path>
                                                        <path fill="currentColor" d="M1.533 2.568L8 11.193V0H2.812C1.042 0 .474 1.156 1.533 2.568z"></path>
                                                    </svg>
                                                )}

                                                {/* Sender Name (Only on incoming messages) */}
                                                {!isOutgoing && (
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="text-[#53bdeb] text-sm font-medium">{msg.name}</span>
                                                        <span className="text-[#8696a0] text-[10px] uppercase font-medium bg-black/20 px-1.5 rounded">
                                                            {msg.role}
                                                        </span>
                                                    </div>
                                                )}

                                                {/* Message Text */}
                                                <span className="break-words align-top inline-block pr-1">
                                                    {msg.message}
                                                </span>

                                                {/* Timestamp & Read Receipt */}
                                                <span className="float-right text-[11px] text-[#8696a0] mt-1 ml-3 flex items-center gap-1 inline-block h-[15px]">
                                                    {msg.time}
                                                    {isOutgoing && (
                                                        <CheckCheck className="w-4 h-4 text-[#53bdeb]" />
                                                    )}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>

                {/* WhatsApp Chat Input Bar */}
                <div className="flex-shrink-0 min-h-[62px] bg-[#202c33] flex items-center px-3 gap-3 z-20">
                    <button className="text-[#8696a0] p-2 hover:bg-white/5 rounded-full transition-colors">
                        {/* Plus Icon */}
                        <svg viewBox="0 0 24 24" width="24" height="24" className="fill-current text-[#8696a0]">
                            <path d="M19 11h-6V5h-2v6H5v2h6v6h2v-6h6z"></path>
                        </svg>
                    </button>

                    <div className="flex-1 bg-[#2a3942] rounded-lg px-4 py-2 text-[#8696a0] text-[15px] cursor-not-allowed">
                        Type a message
                    </div>

                    <button className="text-[#8696a0] p-2 hover:bg-white/5 rounded-full transition-colors">
                        {/* Microphone Icon */}
                        <svg viewBox="0 0 24 24" width="24" height="24" className="fill-current text-[#8696a0]">
                            <path d="M11.999 14.942c2.001 0 3.531-1.53 3.531-3.531V4.35c0-2.001-1.53-3.531-3.531-3.531S8.469 2.35 8.469 4.35v7.061c0 2.001 1.53 3.531 3.531 3.531zm6.238-3.53c0 3.531-2.942 6.002-6.237 6.002s-6.237-2.471-6.237-6.002H3.761c0 4.001 3.178 7.297 7.061 7.885v3.884h2.354v-3.884c3.884-.588 7.061-3.884 7.061-7.885h-2.002z"></path>
                        </svg>
                    </button>
                </div>
            </div>

            <style>{`
                @keyframes scroll-up-chat {
                    0% { transform: translateY(0); }
                    100% { transform: translateY(-33.333%); }
                }

                .animate-scroll-up-chat {
                    animation: scroll-up-chat 120s linear infinite;
                }
            `}</style>
        </section>
    );
};

export default TestimonialsSection;
