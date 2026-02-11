
import React from 'react';
import { BRAND_NAME } from '../constants';

const Footer: React.FC = () => {
  return (
    <footer id="contact" className="h-screen bg-[#050505] flex flex-col justify-center px-6 md:px-8 border-t border-white/5 overflow-hidden">
      <div className="container mx-auto flex flex-col justify-between h-full py-16 md:py-24">
        <div className="flex-1 flex items-center">
          <div className="grid md:grid-cols-2 gap-12 w-full">
            <div>
              <h2 className="text-3xl md:text-5xl lg:text-6xl serif mb-8 md:mb-10 leading-tight">
                Let's create something <br />
                <span className="italic">extraordinary together.</span>
              </h2>
              <div className="flex flex-col gap-4">
                <a href="mailto:hello@asani.com" className="text-lg md:text-2xl font-light hover:opacity-50 transition-opacity">
                  hello@asani.com
                </a>
                <div className="text-white/40 uppercase tracking-widest text-xs mt-4">
                  Available for worldwide collaborations
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-8 md:gap-12">
              <div>
                <h4 className="text-[10px] uppercase tracking-[0.4em] text-white/30 mb-6 md:mb-8">Social</h4>
                <ul className="flex flex-col gap-3 md:gap-4 font-light text-sm md:text-base">
                  <li><a href="#" className="hover:italic transition-all">Instagram</a></li>
                  <li><a href="#" className="hover:italic transition-all">YouTube</a></li>
                  <li><a href="#" className="hover:italic transition-all">Twitter</a></li>
                  <li><a href="#" className="hover:italic transition-all">LinkedIn</a></li>
                </ul>
              </div>
              <div>
                <h4 className="text-[10px] uppercase tracking-[0.4em] text-white/30 mb-6 md:mb-8">Navigation</h4>
                <ul className="flex flex-col gap-3 md:gap-4 font-light text-sm md:text-base">
                  <li><a href="#" className="hover:italic transition-all">Work</a></li>
                  <li><a href="#" className="hover:italic transition-all">Process</a></li>
                  <li><a href="#" className="hover:italic transition-all">The Studio</a></li>
                  <li><a href="#" className="hover:italic transition-all">Contact</a></li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center gap-4 md:gap-6 pt-8 md:pt-12 border-t border-white/5 text-[10px] uppercase tracking-widest text-white/20">
          <div>&copy; 2024 {BRAND_NAME.toUpperCase()}</div>
          <div className="flex gap-8">
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
          </div>
          <div>Designed with Intent</div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
