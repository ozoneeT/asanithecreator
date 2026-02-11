import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUpRight, ArrowDown, Star, Quote } from 'lucide-react';
import { TESTIMONIALS, USER_IMAGE } from '../constants';

interface HeroProps {
  onNavigate?: (sectionIndex: number) => void;
}

const testimonials = TESTIMONIALS.filter(t => t.type === 'testimonial');

const Hero: React.FC<HeroProps> = ({ onNavigate }) => {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial(prev => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="h-screen w-full relative flex flex-col items-center justify-end bg-[#0a0a0a] overflow-hidden pt-20 sm:pt-32 md:pt-40 pb-0">

      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-radial from-white/[0.02] via-transparent to-transparent pointer-events-none" />

      {/* SUBTLE Background Text (Optional, kept low opacity) */}
      <div className="absolute top-1/3 left-0 w-full flex justify-center opacity-[0.02] pointer-events-none select-none">
        <h1 className="text-[20vw] font-bold uppercase tracking-[0.2em] serif leading-none indent-[0.2em]">
          ASANI
        </h1>
      </div>

      {/* --- TOP SECTION: Header & Title --- */}
      <div className="relative top-10 z-20 flex flex-col items-center text-center mb-4 md:mb-8 w-full px-4 sm:px-6 mt-16 sm:mt-28 md:mt-48">
        {/* Hello Bubble */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="relative mb-2"
        >
          <div className="bg-transparent text-black px-6 py-2 rounded-full border border-gray-200 shadow-sm relative z-10">
            <span className="text-sm text-white font-medium tracking-wide">
              Hello! <span className="inline-block animate-wave">👋</span>
            </span>
          </div>
        </motion.div>

        {/* Main Title */}
        <motion.h1
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="text-5xl md:text-7xl lg:text-8xl font-light tracking-tight text-white/90 leading-[1.1]"
        >
          I'm <span className="font-serif italic text-white">Asani</span>, <br />
          <span className="font-semibold">The Creator</span>
        </motion.h1>

        {/* Mobile-only cycling testimonial */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 1.0 }}
          className="md:hidden mt-4 max-w-[280px] text-center"
        >
          <div className="flex gap-0.5 justify-center mb-2">
            {[1, 2, 3, 4, 5].map(i => (
              <Star key={i} className="w-3 h-3 text-[#F59E0B] fill-[#F59E0B]" />
            ))}
          </div>
          <div className="relative min-h-[60px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentTestimonial}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.3 }}
              >
                <p className="text-xs text-white/50 leading-relaxed">
                  "{testimonials[currentTestimonial].message}"
                </p>
                <p className="text-[11px] text-white/30 mt-1.5 font-bold uppercase tracking-wider">
                  {testimonials[currentTestimonial].name}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>
      </div>

      {/* LEFT WIDGET: Cycling Testimonials */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.9 }}
        className="absolute left-6 md:left-12 lg:left-24 top-1/2 -translate-y-1/2 z-30 hidden md:block max-w-[200px]"
      >
        <Quote className="w-8 h-8 text-[#7000FF]/60 mb-2 rotate-180" />
        <div className="relative min-h-[80px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentTestimonial}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
            >
              <p className="text-sm text-white/60 font-medium leading-relaxed">
                "{testimonials[currentTestimonial].message}"
              </p>
              <p className="text-xs text-white/40 mt-2 font-bold uppercase tracking-wider">
                {testimonials[currentTestimonial].name}
              </p>
              <p className="text-[10px] text-white/25 mt-0.5 uppercase tracking-widest">
                {testimonials[currentTestimonial].role}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>

      {/* RIGHT WIDGET: Experience/Rating */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 1.0 }}
        className="absolute right-6 md:right-12 lg:right-24 top-1/2 -translate-y-1/2 z-30 hidden md:block text-right"
      >
        <div className="flex gap-1 justify-end mb-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <Star key={i} className="w-4 h-4 text-[#F59E0B] fill-[#F59E0B]" />
          ))}
        </div>
        <h3 className="text-4xl font-bold text-white mb-0">5 Years</h3>
        <p className="text-sm text-white/50 uppercase tracking-widest">Experience</p>
      </motion.div>

      {/* --- CENTER SECTION: Image & Arch --- */}
      <div className="relative w-full flex-1 flex items-end justify-center max-h-[60vh] md:max-h-[70vh]">

        {/* Container for Image - FULL WIDTH */}
        <div className="relative w-full h-full flex items-end justify-center px-4 md:px-12">

          {/* CENTRAL IMAGE POP-OUT */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
            className="relative z-10 w-full max-w-[85vw] sm:max-w-[400px] md:max-w-[500px] lg:max-w-[600px] flex justify-center items-end"
          >
            {/* ARCH Background Shape */}
            <div className="absolute bottom-0 w-full h-[75%] bg-gradient-to-b from-white/5 to-transparent border-t border-x border-white/10 rounded-t-[50%] backdrop-blur-sm z-0">
              {/* Inner Glow */}
              <div className="absolute inset-0 bg-[#7000FF]/5 rounded-t-[50%] blur-xl" />
            </div>

            {/* Character Image */}
            <img
              src={USER_IMAGE}
              alt="Asani The Creator"
              className="relative z-10 w-full h-auto object-contain drop-shadow-2xl"
              style={{ maskImage: 'linear-gradient(to bottom, black 90%, transparent 100%)' }}
            />

            {/* --- BOTTOM FLOATING BUTTONS --- */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 1.1 }}
              className="absolute bottom-8 md:bottom-12 z-40 flex items-center gap-2 sm:gap-4 bg-white/5 backdrop-blur-md border border-white/10 p-1.5 sm:p-2 rounded-full pl-4 sm:pl-6 pr-1.5 sm:pr-2 shadow-2xl"
            >
              <button
                onClick={() => onNavigate?.(1)}
                className="text-white text-sm font-medium tracking-wide hover:text-[#7000FF] transition-colors pr-4"
              >
                Portfolio <ArrowUpRight className="inline w-4 h-4 ml-1" />
              </button>

              <button
                onClick={() => onNavigate?.(5)}
                className="bg-[#7000FF] hover:bg-[#6000E0] text-white text-xs sm:text-sm font-bold px-4 sm:px-6 py-2.5 sm:py-3 rounded-full transition-all shadow-lg shadow-[#7000FF]/25"
              >
                Hire Me
              </button>
            </motion.div>

          </motion.div>

        </div>
      </div>

      {/* Scroll Down Indicator - Bottom Left */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 1.4 }}
        onClick={() => onNavigate?.(1)}
        className="absolute bottom-8 left-6 md:left-12 lg:left-10 z-30 flex items-center gap-3 cursor-pointer group"
      >
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          className="w-11 h-11 md:w-8 md:h-8 rounded-full border border-white/20 flex items-center justify-center group-hover:border-white/40 transition-colors"
        >
          <ArrowDown size={14} className="text-white/50 group-hover:text-white/80 transition-colors" />
        </motion.div>
        <span className="text-[10px] text-white/30 uppercase tracking-[0.2em] font-medium group-hover:text-white/50 transition-colors hidden md:block">
          Production Studio
        </span>
      </motion.div>
    </section>
  );
};

export default Hero;
