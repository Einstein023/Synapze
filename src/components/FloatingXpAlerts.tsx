import React from 'react';
import { useGarden } from '../lib/gardenState';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Sprout } from 'lucide-react';

export const FloatingXpAlerts: React.FC = () => {
  const { xpPopups } = useGarden();

  return (
    <div className="fixed bottom-24 right-6 z-50 pointer-events-none flex flex-col gap-2 max-w-[280px]">
      <AnimatePresence>
        {xpPopups.map((popup) => (
          <motion.div
            key={popup.id}
            initial={{ opacity: 0, y: 30, scale: 0.8, filter: 'blur(2px)' }}
            animate={{ 
              opacity: 1, 
              y: 0, 
              scale: 1, 
              filter: 'blur(0px)',
              transition: { type: 'spring', stiffness: 260, damping: 15 }
            }}
            exit={{ 
              opacity: 0, 
              y: -50, 
              scale: 0.95, 
              filter: 'blur(4px)',
              transition: { duration: 0.6, ease: 'easeIn' }
            }}
            className="bg-slate-900/95 backdrop-blur-md border border-emerald-500/30 text-emerald-400 px-3.5 py-2 rounded-xl flex items-center gap-2.5 shadow-xl font-mono text-xs font-bold leading-none pointer-events-none self-end"
          >
            <div className="w-5 h-5 bg-emerald-500/10 text-emerald-400 rounded-lg flex items-center justify-center shrink-0 border border-emerald-400/20">
              <Sparkles className="w-3 h-3 text-emerald-400 animate-pulse" />
            </div>
            <div className="flex flex-col">
              <span className="text-emerald-300 drop-shadow-sm text-sm">+{popup.amount} XP</span>
              <span className="text-[9px] text-slate-400 font-sans tracking-wide uppercase mt-0.5">{popup.source}</span>
            </div>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1.2, 1] }}
              transition={{ delay: 0.1, duration: 0.4 }}
              className="ml-1 text-[11px]"
            >
              🌱
            </motion.div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
