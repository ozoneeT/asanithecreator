
import React from 'react';
import { motion } from 'framer-motion';
import { SectionContent } from '../types';

interface Props {
  section: SectionContent;
  index: number;
}

const ServiceSection: React.FC<Props> = ({ section, index }) => {
  return (
    <section
      className="h-screen w-full flex items-center overflow-hidden border-t border-white/5"
      style={{ backgroundColor: section.bgColor }}
    >
      <div className="container mx-auto px-4 sm:px-6 md:px-12 grid md:grid-cols-2 gap-4 md:gap-16 items-center max-h-full overflow-y-auto md:overflow-visible no-scrollbar">
        <div className={`${index % 2 !== 0 ? 'md:order-2' : ''} order-2`}>
          <motion.div
            initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="max-w-xl mx-auto md:mx-0 text-center md:text-left"
          >
            <span className="text-[11px] uppercase tracking-[0.3em] md:tracking-[0.6em] text-white/30 mb-4 md:mb-8 block font-bold">
              {index === 0 ? "ABOUT ME" : `Capability — 0${index + 1}`}
            </span>
            <h2 className="text-3xl md:text-6xl lg:text-7xl serif mb-6 md:mb-8 leading-[1.1]">
              {section.title}
              <span className="block italic text-xl md:text-3xl lg:text-4xl text-white/40 mt-2 md:mt-3 font-normal">
                {section.subtitle}
              </span>
            </h2>
            <p className="text-sm md:text-base lg:text-lg text-white/50 leading-relaxed mb-6 md:mb-12 font-light max-w-none md:max-w-lg mx-auto md:mx-0">
              {section.description}
            </p>
            <button className="group relative inline-flex items-center gap-4 md:gap-6 text-[11px] md:text-[10px] uppercase tracking-[0.2em] md:tracking-[0.4em] font-bold text-white transition-all min-h-[44px]">
              <span className="relative z-10"> </span>
              <span className="w-10 h-[1px] bg-white group-hover:w-20 transition-all duration-300" />
            </button>
          </motion.div>
        </div>

        <div className={`${index % 2 !== 0 ? 'md:order-1' : ''} order-1`}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="relative aspect-video md:aspect-[4/5] overflow-hidden rounded-sm grayscale hover:grayscale-0 transition-all duration-1000 shadow-2xl group"
          >
            <img
              src={section.image}
              alt={section.title}
              className="w-full h-full object-cover scale-110 group-hover:scale-100 transition-transform duration-[2000ms]"
              loading="eager"
            />
            <div className="absolute inset-0 bg-black/40 group-hover:bg-transparent transition-colors duration-700" />
            <div className="absolute top-6 right-6 w-12 h-[1px] bg-white/20" />
            <div className="absolute top-6 right-6 h-12 w-[1px] bg-white/20" />

            {/* Interactive Hints */}
            <div className="absolute bottom-6 left-0 right-0 text-center pointer-events-none group-hover:opacity-0 transition-opacity duration-500">
              <span className="hidden md:block text-[10px] uppercase tracking-[0.2em] text-white/60">
                Hover on me to see The Beauty ✨
              </span>
              <span className="md:hidden text-[10px] uppercase tracking-[0.2em] text-white/60">
                Click on me to see The Beauty 👆
              </span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default ServiceSection;
