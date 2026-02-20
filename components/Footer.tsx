import React from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, Mail, Phone, ArrowUpRight } from 'lucide-react';
import { BRAND_NAME } from '../constants';

const Footer: React.FC = () => {
  return (
    <footer id="contact" className="min-h-[100dvh] bg-[#050505] flex flex-col justify-center px-4 sm:px-6 md:px-8 border-t border-white/5 overflow-hidden relative">

      {/* Background ambient glows */}
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-[#7000FF]/5 to-transparent pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-[#bfff00] rounded-full blur-[150px] opacity-[0.03] pointer-events-none" />

      <div className="container mx-auto flex flex-col justify-between h-full py-4 sm:py-6 md:py-16 mt-8 md:mt-0 pb-16 relative z-10">

        <div className="flex-1 flex flex-col justify-center items-center text-center">

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-6 md:mb-16"
          >
            <span className="text-[11px] uppercase tracking-[0.4em] md:tracking-[0.6em] text-[#bfff00] mb-2 mt-5 block font-bold">
              Available For Hire
            </span>
            <h2 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-light leading-[1.1] tracking-tight">
              Ready to create <br className="hidden md:block" />
              <span className="font-serif italic text-white/90">something extraordinary?</span>
            </h2>
          </motion.div>

          {/* Contact Methods Grid */}
          <div className="flex flex-col md:flex-row gap-4 w-full max-w-5xl">

            {/* Primary WhatsApp Card */}
            <motion.a
              href="https://wa.me/2348163043098"
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex-1 group relative overflow-hidden rounded-3xl bg-[#0a0a0a] border border-white/10 hover:border-[#bfff00]/50 p-4 sm:p-5 md:p-10 transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(191,255,0,0.15)] text-left flex flex-col justify-between min-h-[120px] md:min-h-[200px]"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[#bfff00]/0 to-[#bfff00]/0 group-hover:from-[#bfff00]/5 group-hover:to-transparent transition-all duration-500" />
              {/* Shimmer Effect */}
              <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/5 to-transparent animate-[shimmer_3s_infinite] pointer-events-none" />

              <div className="flex justify-between items-start relative z-10 w-full mb-4 sm:mb-8">
                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-[#bfff00] group-hover:text-black transition-colors duration-500">
                  <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <ArrowUpRight className="w-5 h-5 sm:w-6 sm:h-6 text-white/30 group-hover:text-[#bfff00] transition-colors" />
              </div>

              <div className="relative z-10">
                <div className="text-[10px] uppercase tracking-[0.2em] text-white/40 mb-2">Primary WhatsApp</div>
                <div className="text-lg sm:text-xl md:text-2xl font-medium tracking-tight group-hover:text-[#bfff00] transition-colors">
                  +234 816 304 3098
                </div>
              </div>
            </motion.a>

            {/* Email Card (Center Priority) */}
            <motion.a
              href="mailto:adedolapoa54@gmail.com"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex-1 md:flex-[1.2] group relative overflow-hidden rounded-3xl bg-[#7000FF] border border-[#7000FF] p-4 sm:p-5 md:p-10 transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(112,0,255,0.4)] text-left flex flex-col justify-between min-h-[120px] md:min-h-[200px]"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/0 to-black/20 group-hover:scale-110 transition-transform duration-700" />
              {/* Shimmer Effect */}
              <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shimmer_3s_infinite] pointer-events-none" style={{ animationDelay: '1s' }} />

              <div className="flex justify-between items-start relative z-10 w-full mb-4 sm:mb-8">
                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center group-hover:bg-white group-hover:text-[#7000FF] transition-colors duration-500">
                  <Mail className="w-5 h-5 sm:w-6 sm:h-6 text-white group-hover:text-[#7000FF]" />
                </div>
                <ArrowUpRight className="w-5 h-5 sm:w-6 sm:h-6 text-white/70 group-hover:text-white transition-colors" />
              </div>

              <div className="relative z-10 w-full overflow-hidden">
                <div className="text-[10px] uppercase tracking-[0.2em] text-white/70 mb-2">Direct Email</div>
                <div className="text-lg sm:text-xl md:text-2xl font-medium tracking-tight text-white group-hover:opacity-90 transition-opacity truncate w-full pr-4">
                  adedolapoa54@gmail.com
                </div>
              </div>
            </motion.a>

            {/* Secondary WhatsApp Card */}
            <motion.a
              href="https://wa.me/2349037124872"
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="flex-1 group relative overflow-hidden rounded-3xl bg-[#0a0a0a] border border-white/10 hover:border-white/30 p-4 sm:p-5 md:p-10 transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(255,255,255,0.05)] text-left flex flex-col justify-between min-h-[120px] md:min-h-[200px]"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/0 to-white/0 group-hover:from-white/5 group-hover:to-transparent transition-all duration-500" />
              {/* Shimmer Effect */}
              <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/5 to-transparent animate-[shimmer_3s_infinite] pointer-events-none" style={{ animationDelay: '2s' }} />

              <div className="flex justify-between items-start relative z-10 w-full mb-4 sm:mb-8">
                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-white group-hover:text-black transition-colors duration-500">
                  <Phone className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <ArrowUpRight className="w-5 h-5 sm:w-6 sm:h-6 text-white/30 group-hover:text-white transition-colors" />
              </div>

              <div className="relative z-10">
                <div className="text-[10px] uppercase tracking-[0.2em] text-white/40 mb-2">Secondary Line</div>
                <div className="text-lg sm:text-xl md:text-2xl font-medium tracking-tight group-hover:text-white transition-colors">
                  +234 903 712 4872
                </div>
              </div>
            </motion.a>

          </div>
        </div>

        {/* Footer Bottom Bar */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 pt-4 border-t border-white/5 text-[10px] sm:text-[11px] uppercase tracking-wider md:tracking-widest text-white/30 mt-6 w-full max-w-5xl mx-auto flex-shrink-0">
          <div>&copy; {new Date().getFullYear()} {BRAND_NAME.toUpperCase()}</div>
          <div className="flex gap-4 md:gap-8">
            <span className="hover:text-white transition-colors cursor-pointer">Lagos, Nigeria</span>
            <span className="hover:text-white transition-colors cursor-pointer">Available Worldwide</span>
          </div>
          <div>Built with Intent</div>
        </div>
      </div>
      <style>{`
        @keyframes shimmer {
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>
    </footer>
  );
};

export default Footer;
