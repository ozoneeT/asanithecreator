
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowUp } from 'lucide-react';
import Preloader from './Preloader';
import Navbar from './Navbar';
import Hero from './Hero';
import { USER_IMAGE, VIDEO_FOOTAGE, SECTIONS } from '../constants';

// Lazy load heavy sections to reduce initial bundle size
const VideoShowcase = React.lazy(() => import('./VideoShowcase'));
const ServiceSection = React.lazy(() => import('./ServiceSection'));
const ServicesSection = React.lazy(() => import('./ServicesSection'));
const TestimonialsSection = React.lazy(() => import('./TestimonialsSection'));
const Footer = React.lazy(() => import('./Footer'));
const SECTION_NAMES = ['Home', 'Work', 'About', 'Services', 'Testimonials', 'Contact'];
const TOTAL_SECTIONS = 6;

const Home: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [currentSection, setCurrentSection] = useState(0);

  useEffect(() => {
    const imagesToPreload = [
      USER_IMAGE,
      ...VIDEO_FOOTAGE,
      ...SECTIONS.map(s => s.image)
    ];

    const preloadImages = async () => {
      const promises = imagesToPreload.map(src => {
        return new Promise((resolve) => {
          const img = new Image();
          img.src = src;
          img.onload = resolve;
          img.onerror = resolve;
        });
      });

      const timer = new Promise(resolve => setTimeout(resolve, 3000));
      await Promise.all([...promises, timer]);
      setLoading(false);
    };

    preloadImages();
  }, []);

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scrollToSection = useCallback((index: number) => {
    if (index < 0 || index >= TOTAL_SECTIONS) return;
    setCurrentSection(index);
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        top: index * window.innerHeight,
        behavior: 'smooth'
      });
    }
  }, []);

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const container = e.currentTarget;
    // Calculate which section is currently most visible
    const index = Math.round(container.scrollTop / window.innerHeight);
    if (index >= 0 && index < TOTAL_SECTIONS && currentSection !== index) {
      setCurrentSection(index);
    }
  }, [currentSection]);

  // Nav section mapping
  const navSectionMap: Record<string, number> = {
    home: 0,
    work: 1,
    about: 2,
    services: 3,
    testimonials: 4,
    contact: 5,
  };

  const handleNavClick = (section: string) => {
    const index = navSectionMap[section.toLowerCase()];
    if (index !== undefined) scrollToSection(index);
  };

  return (
    <div className="relative h-screen overflow-hidden">
      <AnimatePresence>
        {loading && <Preloader key="preloader" />}
      </AnimatePresence>

      {!loading && (
        <div
          className="relative h-screen overflow-hidden bg-[#0a0a0a]"
        >
          <Navbar onNavigate={handleNavClick} currentSection={currentSection} />

          {/* Scroll Container */}
          <div
            ref={scrollContainerRef}
            onScroll={handleScroll}
            className="h-screen w-full overflow-y-auto overflow-x-hidden snap-y snap-mandatory scroll-smooth relative"
          >
            <div className="snap-start shrink-0 h-screen w-full">
              <Hero onNavigate={(index: number) => scrollToSection(index)} />
            </div>

            <React.Suspense fallback={<div className="h-screen w-full bg-[#0a0a0a] flex items-center justify-center">Loading...</div>}>
              <div className="snap-start shrink-0 h-screen w-full">
                <VideoShowcase isActive={currentSection === 1} />
              </div>

              {/* About Section */}
              <div className="snap-start shrink-0 h-screen w-full">
                <ServiceSection key={SECTIONS[0].id} section={SECTIONS[0]} index={0} />
              </div>

              {/* Services Section */}
              <div className="snap-start shrink-0 h-screen w-full">
                <ServicesSection isActive={currentSection === 3} />
              </div>

              {/* Testimonials Section (Replaces Brand Identity) */}
              <div className="snap-start shrink-0 h-screen w-full">
                <TestimonialsSection />
              </div>

              <div className="snap-start shrink-0 h-screen w-full">
                <Footer />
              </div>
            </React.Suspense>
          </div>

          {/* Section Indicator Dots */}
          <div className={`fixed z-40 flex transition-opacity duration-500 ${currentSection === 1 ? 'opacity-0 pointer-events-none' : 'opacity-100'}
            bottom-4 left-1/2 -translate-x-1/2 flex-row gap-2
            md:bottom-auto md:left-auto md:translate-x-0 md:right-10 md:top-1/2 md:-translate-y-1/2 md:flex-col md:items-end md:gap-4`}>
            {SECTION_NAMES.map((name, i) => (
              <button
                key={i}
                onClick={() => scrollToSection(i)}
                className="group relative flex items-center gap-3 min-w-[20px] min-h-[20px] md:min-w-0 md:min-h-0 justify-center md:justify-end"
              >
                <span className={`text-[9px] uppercase tracking-[0.15em] whitespace-nowrap transition-all duration-500 font-light hidden md:block ${currentSection === i ? 'opacity-50 translate-x-0' : 'opacity-0 translate-x-2 group-hover:opacity-30 group-hover:translate-x-0'
                  }`}>
                  {name}
                </span>
                <span className={`block rounded-full transition-all duration-500 ${currentSection === i
                  ? 'w-2 h-2 md:w-2.5 md:h-2.5 bg-white'
                  : 'w-1.5 h-1.5 bg-white/20 group-hover:bg-white/40'
                  }`} />
              </button>
            ))}
          </div>

          {/* Scroll to Top FAB */}
          <AnimatePresence>
            {currentSection > 0 && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: 20 }}
                onClick={() => scrollToSection(0)}
                className="fixed bottom-6 right-6 md:bottom-10 md:right-10 z-[100] p-3 sm:p-4 rounded-full bg-[#7000FF] text-white shadow-[0_10px_30px_-10px_rgba(112,0,255,0.5)] border border-white/10 hover:bg-[#bfff00] hover:text-black hover:border-transparent transition-all duration-300 pointer-events-auto"
                aria-label="Scroll to top"
              >
                <ArrowUp className="w-5 h-5 sm:w-6 sm:h-6" />
              </motion.button>
            )}
          </AnimatePresence>

        </div>
      )}
    </div>
  );
};

export default Home;
