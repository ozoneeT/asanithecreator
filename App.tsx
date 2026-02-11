
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import Preloader from './components/Preloader';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import VideoShowcase from './components/VideoShowcase';
import ServiceSection from './components/ServiceSection';
import ServicesSection from './components/ServicesSection';
import TestimonialsSection from './components/TestimonialsSection';
import Footer from './components/Footer';
import { USER_IMAGE, VIDEO_FOOTAGE, SECTIONS } from './constants';

const SECTION_NAMES = ['Home', 'Work', 'About', 'Services', 'Capabilities', 'Testimonials', 'Contact'];
const TOTAL_SECTIONS = 7;
const SCROLL_COOLDOWN = 1200;

const App: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [currentSection, setCurrentSection] = useState(0);
  const isScrollingRef = useRef(false);
  const touchStartRef = useRef(0);

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

  const scrollToSection = useCallback((index: number) => {
    if (index < 0 || index >= TOTAL_SECTIONS || isScrollingRef.current) return;
    isScrollingRef.current = true;
    setCurrentSection(index);
    setTimeout(() => { isScrollingRef.current = false; }, SCROLL_COOLDOWN);
  }, []);

  // Wheel handler — enforces one section at a time
  useEffect(() => {
    if (loading) return;
    const handleWheel = (e: WheelEvent) => {
      // Allow horizontal scrolling to pass through
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
      e.preventDefault();
      if (isScrollingRef.current) return;
      if (e.deltaY > 0) scrollToSection(currentSection + 1);
      else if (e.deltaY < 0) scrollToSection(currentSection - 1);
    };
    window.addEventListener('wheel', handleWheel, { passive: false });
    return () => window.removeEventListener('wheel', handleWheel);
  }, [loading, currentSection, scrollToSection]);

  // Touch handlers
  useEffect(() => {
    if (loading) return;
    const handleTouchStart = (e: TouchEvent) => {
      touchStartRef.current = e.touches[0].clientY;
    };
    const handleTouchEnd = (e: TouchEvent) => {
      if (isScrollingRef.current) return;
      const diff = touchStartRef.current - e.changedTouches[0].clientY;
      if (Math.abs(diff) > 60) {
        if (diff > 0) scrollToSection(currentSection + 1);
        else scrollToSection(currentSection - 1);
      }
    };
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });
    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [loading, currentSection, scrollToSection]);

  // Keyboard handler
  useEffect(() => {
    if (loading) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isScrollingRef.current) return;
      if (e.key === 'ArrowDown' || e.key === 'PageDown') {
        e.preventDefault();
        scrollToSection(currentSection + 1);
      } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
        e.preventDefault();
        scrollToSection(currentSection - 1);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [loading, currentSection, scrollToSection]);

  // Nav section mapping
  const navSectionMap: Record<string, number> = {
    home: 0,
    work: 1,
    about: 2,
    services: 3,
    capabilities: 4,
    testimonials: 5,
    contact: 6,
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
            style={{
              transform: `translateY(calc(-${currentSection} * var(--section-height)))`,
              transition: 'transform 1s cubic-bezier(0.76, 0, 0.24, 1)',
            }}
          >
            <Hero onNavigate={(index: number) => scrollToSection(index)} />
            <VideoShowcase isActive={currentSection === 1} />

            {/* About Section */}
            <ServiceSection key={SECTIONS[0].id} section={SECTIONS[0]} index={0} />

            {/* Services Section */}
            <ServicesSection />

            {/* Capabilities Section - Visual Storytelling */}
            <ServiceSection key={SECTIONS[1].id} section={SECTIONS[1]} index={1} />

            {/* Testimonials Section (Replaces Brand Identity) */}
            <TestimonialsSection />

            <Footer />
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

          {/* Section Counter */}
          {/* <div className="fixed bottom-8 left-6 md:left-10 z-40 hidden md:flex items-baseline gap-2 mix-blend-difference">
              <span className="text-2xl font-light serif tabular-nums">
                {String(currentSection + 1).padStart(2, '0')}
              </span>
              <span className="text-[10px] text-white/30 tracking-widest">
                / {String(TOTAL_SECTIONS).padStart(2, '0')}
              </span>
            </div> */}
        </div>
      )}
    </div>
  );
};

export default App;
