import React, { useState, useEffect } from 'react';
import { useGarden } from '../lib/gardenState';
import { motion, AnimatePresence } from 'motion/react';

export const EvolutionModal: React.FC = () => {
  const { evolutionTrigger, setEvolutionTrigger } = useGarden();
  const [phase, setPhase] = useState<'intro' | 'evolving' | 'revealed'>('intro');

  useEffect(() => {
    if (evolutionTrigger) {
      setPhase('intro');
      
      // Auto advance phases for dramatic buildup
      const evolvingTimeout = setTimeout(() => {
        setPhase('evolving');
      }, 1500);

      const revealTimeout = setTimeout(() => {
        setPhase('revealed');
      }, 3500);

      return () => {
        clearTimeout(evolvingTimeout);
        clearTimeout(revealTimeout);
      };
    }
  }, [evolutionTrigger]);

  useEffect(() => {
    if (evolutionTrigger) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [evolutionTrigger]);

  if (!evolutionTrigger) return null;

  const { companionName, prevLevel, nextLevel, title } = evolutionTrigger;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Clean slate light glass overlay backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-slate-950/45 backdrop-blur-md"
          onClick={() => phase === 'revealed' && setEvolutionTrigger(null)}
        />

        {/* Soft light amber radial background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-amber-500/10 rounded-full blur-[100px] pointer-events-none animate-pulse duration-[3s]" />

        {/* Modal body in light design theme */}
        <motion.div
          initial={{ opacity: 0, scale: 0.93, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.93, y: -15 }}
          transition={{ type: 'spring', damping: 25, stiffness: 180 }}
          className="relative bg-white border border-slate-200 rounded-3xl p-8 max-w-md w-full shadow-2xl text-center overflow-hidden"
        >
          {phase === 'intro' && (
            <motion.div 
              key="intro"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              <div className="mx-auto w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center border border-slate-200/80">
                <div className="w-10 h-10 bg-amber-50 border border-amber-200 rounded-full flex items-center justify-center text-amber-700 font-mono font-bold text-xs animate-pulse">
                  LVL
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="inline-block font-mono text-[10px] font-bold px-2.5 py-1 bg-amber-50 text-amber-700 rounded-full border border-amber-200 uppercase tracking-widest">
                  Evolution Threshold Reached
                </div>
                <h3 className="font-display font-bold text-2xl text-slate-900 tracking-tight mt-1">
                  Energy Surge Detected
                </h3>
                <p className="text-slate-500 text-sm max-w-xs mx-auto leading-relaxed">
                  {companionName} is channeling sowed knowledge state to mutate into a grander form...
                </p>
              </div>

              {/* Level Transition Showcase (Plain, Clean, Icon-free & Emoji-free) */}
              <div className="flex items-center justify-center gap-6 py-6 font-mono text-slate-800">
                <div className="text-center">
                  <div className="w-20 h-20 bg-slate-50 rounded-2xl flex flex-col items-center justify-center border border-slate-200 font-sans shadow-xs">
                    <span className="text-slate-400 text-[10px] font-mono tracking-widest uppercase mb-0.5">LVL</span>
                    <span className="text-2xl font-black text-slate-800">{prevLevel}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 uppercase mt-2 block font-extrabold tracking-wider">PREVIOUS</span>
                </div>
                
                <span className="text-xs font-mono font-bold text-slate-400 mt-6 shrink-0">TO</span>

                <div className="text-center">
                  <div className="w-20 h-20 bg-emerald-50 rounded-2xl flex flex-col items-center justify-center border border-emerald-300 font-sans shadow-xs">
                    <span className="text-emerald-500 text-[10px] font-mono tracking-widest uppercase mb-0.5">LVL</span>
                    <span className="text-2xl font-black text-emerald-700">{nextLevel}</span>
                  </div>
                  <span className="text-[10px] text-emerald-600 uppercase mt-2 block font-extrabold tracking-wider">NEXT FORM</span>
                </div>
              </div>

              <div className="pt-2">
                <div className="w-full bg-slate-100 rounded-full h-1 overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 1.4, ease: 'easeInOut' }}
                    className="bg-emerald-500 h-full"
                  />
                </div>
                <span className="text-[10px] text-slate-400 font-mono mt-2 block tracking-wider">ALIGNING ARCHITECTURE STACKS...</span>
              </div>
            </motion.div>
          )}

          {phase === 'evolving' && (
            <motion.div 
              key="evolving"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6 py-8"
            >
              <div className="relative w-36 h-36 mx-auto flex items-center justify-center">
                {/* Visual rays rotating */}
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 2.5, ease: 'linear' }}
                  className="absolute inset-0 border-2 border-dashed border-emerald-400/40 rounded-full"
                />
                
                <motion.div 
                  animate={{ rotate: -360 }}
                  transition={{ repeat: Infinity, duration: 4.5, ease: 'linear' }}
                  className="absolute inset-2 border border-dashed border-slate-200 rounded-full"
                />

                <motion.div
                  animate={{ 
                    scale: [1, 1.15, 0.95, 1.2, 1],
                  }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                  className="w-24 h-24 bg-emerald-50 rounded-full flex flex-col items-center justify-center border border-emerald-200 shadow-md font-sans"
                >
                  <span className="text-[10px] text-emerald-600 font-mono font-bold uppercase tracking-widest mb-0.5">MUTATING</span>
                  <span className="text-xl font-black text-emerald-800">LVL {prevLevel}</span>
                </motion.div>
              </div>

              <div className="space-y-1">
                <h4 className="font-display font-bold text-base text-emerald-600 uppercase tracking-widest animate-pulse">
                  METAMORPHOSIS ACTIVE
                </h4>
                <p className="text-slate-400 text-[10px] font-mono max-w-xs mx-auto">
                  CELL RESYNCING & STACK RECONSTRUCT...
                </p>
              </div>
            </motion.div>
          )}

          {phase === 'revealed' && (
            <motion.div 
              key="revealed"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-6"
            >
              <div className="relative w-32 h-32 mx-auto mt-2">
                <div className="absolute inset-0 bg-amber-400/10 rounded-full filter blur-xl animate-pulse" />
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 15, ease: 'linear' }}
                  className="absolute inset-0 border border-double border-amber-300 rounded-full flex items-center justify-center"
                />

                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', delay: 0.1, stiffness: 200, damping: 12 }}
                  className="absolute inset-3 bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-300 shadow-lg rounded-full flex flex-col items-center justify-center font-sans"
                >
                  <span className="text-[10px] text-amber-700 font-mono font-bold uppercase tracking-widest mb-0.5">LVL {nextLevel}</span>
                  <span className="text-2xl font-black text-amber-900 uppercase tracking-tight">EVOLVED</span>
                </motion.div>
              </div>

              <div className="space-y-2">
                <div className="inline-block bg-amber-50 border border-amber-200 text-amber-700 text-[10px] font-mono font-bold uppercase tracking-wider px-3 py-1 rounded-full">
                  EVOLUTION COMPLETE
                </div>
                
                <h3 className="font-display font-bold text-2xl text-slate-900 tracking-tight mt-2 leading-tight">
                  {companionName} Has Evolved
                </h3>
                
                <p className="text-slate-600 font-semibold text-sm">
                  Now Level {nextLevel} — {title}
                </p>
                
                <p className="text-slate-500 text-xs italic bg-slate-50 p-4 rounded-xl border border-slate-100 mt-4 max-w-sm mx-auto leading-relaxed">
                  "Our cognitive resonance has matured. We are now capable of deeper insights indexing together!"
                </p>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setEvolutionTrigger(null)}
                  className="w-full bg-forest-600 hover:bg-forest-750 active:bg-forest-800 text-white font-semibold py-3 px-6 rounded-xl shadow-md transition-all text-sm flex items-center justify-center cursor-pointer pointer-events-auto"
                >
                  Confirm Evolved Status
                </button>
              </div>
            </motion.div>
          )}

        </motion.div>
      </div>
    </AnimatePresence>
  );
};
