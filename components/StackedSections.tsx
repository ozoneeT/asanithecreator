
import React from 'react';
import { motion } from 'framer-motion';
import { SECTIONS } from '../constants';

const StackedSections: React.FC = () => {
  return (
    <div className="relative bg-[#0a0a0a]">
      {SECTIONS.map((section, index) => (
        <section
          key={section.id}
          className="sticky top-0 min-h-screen w-full overflow-hidden flex items-center justify-center border-t border-white/5 py-20 md:py-0 snap-start snap-always"
          style={{ backgroundColor: section.bgColor, zIndex: index + 1 }}
        >
          <div className="container mx-auto px-6 grid md:grid-cols-2 gap-10 md:gap-16 items-center">
            <div className={`${index % 2 !== 0 ? 'md:order-2' : ''} order-2`}>
              <motion.div
                initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="max-w-xl mx-auto md:mx-0 text-center md:text-left"
              >
                <span className="text-[10px] uppercase tracking-[0.6em] text-white/30 mb-8 block font-bold">
                  Capability — 0{index + 1}
                </span>
                <h2 className="text-4xl md:text-7xl serif mb-8 leading-[1.1]">
                  {section.title}
                  <span className="block italic text-2xl md:text-4xl text-white/40 mt-3 font-normal">
                    {section.subtitle}
                  </span>
                </h2>
                <p className="text-sm md:text-lg text-white/50 leading-relaxed mb-12 font-light max-w-lg mx-auto md:mx-0">
                  {section.description}
                </p>
                <button className="group relative inline-flex items-center gap-6 text-[10px] uppercase tracking-[0.4em] font-bold text-white transition-all">
                  <span className="relative z-10">Discover More</span>
                  <span className="w-10 h-[1px] bg-white group-hover:w-20 transition-all duration-300" />
                </button>
              </motion.div>
            </div>

            <div className={`${index % 2 !== 0 ? 'md:order-1' : ''} order-1`}>
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8 }}
                className="relative aspect-square md:aspect-[4/5] overflow-hidden rounded-sm grayscale hover:grayscale-0 transition-all duration-1000 shadow-2xl group"
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
              </motion.div>
            </div>
          </div>
        </section>
      ))}
    </div>
  );
};

export default StackedSections;

