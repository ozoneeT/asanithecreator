
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TESTIMONIALS } from '../constants';
import { MessageSquare, Calendar, X } from 'lucide-react';
import { Testimonial } from '../types';

const NotificationList: React.FC = () => {
  const [activeNotifications, setActiveNotifications] = useState<Testimonial[]>([]);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      if (index < TESTIMONIALS.length) {
        setActiveNotifications(prev => [...prev, TESTIMONIALS[index]]);
        setIndex(prev => prev + 1);
      } else {
        clearInterval(interval);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [index]);

  const removeNotification = (id: string) => {
    setActiveNotifications(prev => prev.filter(n => n.id !== id));
  };

  return (
    <div className="fixed bottom-4 md:bottom-8 right-4 md:right-8 z-[60] flex flex-col items-end gap-3 max-w-[calc(100vw-2rem)] md:max-w-sm pointer-events-none">
      <AnimatePresence mode="popLayout">
        {activeNotifications.map((notif, i) => (
          <motion.div
            key={notif.id}
            layout
            initial={{ opacity: 0, y: 20, scale: 0.9, x: 50 }}
            animate={{ 
              opacity: 1, 
              y: 0, 
              scale: 1, 
              x: 0,
              zIndex: activeNotifications.length - i
            }}
            exit={{ 
              opacity: 0, 
              scale: 0.95, 
              x: 20,
              transition: { duration: 0.2 } 
            }}
            className="pointer-events-auto bg-white/10 backdrop-blur-2xl border border-white/10 p-4 md:p-5 rounded-xl md:rounded-2xl shadow-2xl relative overflow-hidden w-full group"
          >
            {/* Ambient Background Glow */}
            <div className={`absolute top-0 right-0 w-24 h-24 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2 opacity-20 ${notif.type === 'booking' ? 'bg-white' : 'bg-gray-400'}`} />
            
            <div className="flex gap-4 items-start relative z-10">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${notif.type === 'booking' ? 'bg-white text-black' : 'bg-white/10 text-white'}`}>
                {notif.type === 'booking' ? <Calendar size={18} strokeWidth={2.5} /> : <MessageSquare size={18} strokeWidth={2.5} />}
              </div>
              
              <div className="flex-1 min-w-0 pr-4">
                <div className="flex justify-between items-start mb-0.5">
                  <h4 className="text-xs md:text-sm font-bold truncate text-white uppercase tracking-tight">{notif.name}</h4>
                  <span className="text-[9px] text-white/30 uppercase tracking-widest flex-shrink-0 ml-2">{notif.time}</span>
                </div>
                <p className="text-[11px] md:text-xs text-white/60 mb-2 leading-relaxed line-clamp-2">
                  {notif.message}
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-[8px] py-1 px-2 bg-white/5 border border-white/10 rounded-full text-white/50 uppercase tracking-[0.2em] font-bold">
                    {notif.role}
                  </span>
                </div>
              </div>

              <button 
                onClick={() => removeNotification(notif.id)}
                className="absolute top-0 right-0 p-2 text-white/20 hover:text-white transition-colors"
              >
                <X size={14} />
              </button>
            </div>
            
            {/* Visual bottom bar indicator */}
            <motion.div 
              initial={{ scaleX: 1 }}
              animate={{ scaleX: 0 }}
              transition={{ duration: 8, ease: "linear" }}
              onAnimationComplete={() => removeNotification(notif.id)}
              className="absolute bottom-0 left-0 h-0.5 w-full bg-white/30 origin-left"
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default NotificationList;
