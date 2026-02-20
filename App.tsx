
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import Preloader from './components/Preloader';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import { USER_IMAGE, VIDEO_FOOTAGE, SECTIONS } from './constants';

// Lazy load heavy sections to reduce initial bundle size
const VideoShowcase = React.lazy(() => import('./components/VideoShowcase'));
const ServiceSection = React.lazy(() => import('./components/ServiceSection'));
const ServicesSection = React.lazy(() => import('./components/ServicesSection'));
const TestimonialsSection = React.lazy(() => import('./components/TestimonialsSection'));
const Footer = React.lazy(() => import('./components/Footer'));
const SECTION_NAMES = ['Home', 'Work', 'About', 'Services', 'Capabilities', 'Testimonials', 'Contact'];
const TOTAL_SECTIONS = 7;

const App: React.FC = () => {
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

              {/* Capabilities Section - Visual Storytelling */}
              <div className="snap-start shrink-0 h-screen w-full">
                <ServiceSection key={SECTIONS[1].id} section={SECTIONS[1]} index={1} />
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
