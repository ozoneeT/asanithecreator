
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BRAND_NAME } from '../constants';
import { X } from 'lucide-react';

interface NavbarProps {
  onNavigate?: (section: string) => void;
  currentSection?: number;
}

const Navbar: React.FC<NavbarProps> = ({ onNavigate, currentSection }) => {
  const [isOpen, setIsOpen] = useState(false);

  const navItems = ['Work', 'About', 'Services', 'Testimonials', 'Contact'];

  const handleClick = (item: string) => {
    onNavigate?.(item.toLowerCase());
    setIsOpen(false);
  };

  return (
    <>
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 1.2, ease: [0.33, 1, 0.68, 1], delay: 1 }}
        className="fixed top-0 left-0 w-full z-50 flex items-center justify-between px-6 md:px-12 py-6 md:py-10 mix-blend-difference pointer-events-none"
      >
        <button
          onClick={() => onNavigate?.('home')}
          className={`flex flex-col leading-none group transition-opacity duration-500 w-auto ${currentSection === 1 ? 'opacity-0 pointer-events-none' : 'opacity-100 pointer-events-auto'}`}
        >
          <span className="text-xl md:text-2xl font-bold serif tracking-tight">ASANI</span>
          <span className="text-[11px] md:text-[10px] uppercase tracking-[0.2em] opacity-70 group-hover:text-[#bfff00] transition-colors">the_creator</span>
        </button>

        <div className="hidden md:flex items-center gap-16 pointer-events-auto">
          {navItems.map((item, i) => (
            <motion.button
              key={item}
              onClick={() => handleClick(item)}
              whileHover={{ y: -2 }}
              className="text-[10px] uppercase tracking-[0.4em] font-bold text-white/80 hover:text-white transition-colors"
            >
              <span className="text-[8px] opacity-30 mr-2">0{i + 1}</span>
              {item}
            </motion.button>
          ))}
        </div>

        <div className="md:hidden">
          <button
            onClick={() => setIsOpen(true)}
            className="p-3 min-w-[44px] min-h-[44px] flex flex-col items-end justify-center gap-1.5 text-white pointer-events-auto"
            aria-label="Open Menu"
          >
            <div className="w-6 h-[1.5px] bg-white rounded-full" />
            <div className="w-4 h-[1.5px] bg-white rounded-full" />
          </button>
        </div>
      </motion.nav>

      {/* Fullscreen Mobile Menu Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-[#0a0a0a] z-[100] flex flex-col p-6 sm:p-10 md:hidden"
          >
            <div className="flex justify-between items-center mb-20">
              <span className="text-sm font-bold tracking-tighter uppercase">{BRAND_NAME}</span>
              <button onClick={() => setIsOpen(false)} className="p-3 min-w-[44px] min-h-[44px] flex items-center justify-center">
                <X size={28} strokeWidth={1} />
              </button>
            </div>

            <div className="flex flex-col gap-8">
              {navItems.map((item, i) => (
                <motion.button
                  key={item}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.1 * i }}
                  onClick={() => handleClick(item)}
                  className="text-4xl sm:text-5xl serif hover:italic transition-all flex items-baseline gap-4 group text-left"
                >
                  <span className="text-xs serif italic opacity-30 group-hover:opacity-100 transition-opacity">0{i + 1}</span>
                  {item}
                </motion.button>
              ))}
            </div>

            <div className="mt-auto pt-10 border-t border-white/10 flex justify-between items-end">
              <div>
                <p className="text-[11px] uppercase tracking-[0.3em] opacity-40 mb-4">Connect</p>
                <div className="flex gap-2 text-xs">
                  <a href="#" className="min-w-[44px] min-h-[44px] flex items-center justify-center">IG</a>
                  <a href="#" className="min-w-[44px] min-h-[44px] flex items-center justify-center">TW</a>
                  <a href="#" className="min-w-[44px] min-h-[44px] flex items-center justify-center">YT</a>
                </div>
              </div>
              <div className="text-[11px] uppercase tracking-widest opacity-20">&copy;2024 ASANI</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
