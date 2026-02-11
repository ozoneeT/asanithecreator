
import React from 'react';
import { motion } from 'framer-motion';
import { BRAND_NAME } from '../constants';

const Preloader: React.FC = () => {
  const letters = BRAND_NAME.split('');

  const containerVariants = {
    initial: { opacity: 1 },
    exit: {
      opacity: 0,
      transition: { duration: 0.6, ease: [0.4, 0, 0.2, 1] }
    }
  };

  const textVariants = {
    initial: { y: 100, opacity: 0 },
    animate: (i: number) => ({
      y: 0,
      opacity: 1,
      transition: {
        delay: 0.1 * i,
        duration: 0.8,
        ease: [0.33, 1, 0.68, 1]
      }
    })
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="initial"
      exit="exit"
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0a0a0a]"
    >
      <div className="flex overflow-hidden px-4 sm:px-0">
        {letters.map((letter, i) => (
          <motion.span
            key={i}
            custom={i}
            variants={textVariants}
            initial="initial"
            animate="animate"
            className={`text-[5vw] sm:text-4xl md:text-7xl font-light text-white uppercase tracking-[0.1em] sm:tracking-[0.2em] ${letter === ' ' ? 'mx-[1vw] sm:mx-4' : ''}`}
          >
            {letter}
          </motion.span>
        ))}
      </div>
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 2, ease: "easeInOut" }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 w-32 h-[1px] bg-white/30 origin-left"
      />
    </motion.div>
  );
};

export default Preloader;
