import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue, animate } from 'motion/react';
import { 
  Sprout, 
  ArrowRight, 
  Check, 
  Image as ImageIcon,
  PenTool,
  Lock,
  Globe,
  Layers,
  Sparkles,
  Menu,
  X,
  Star,
  Quote
} from 'lucide-react';

interface LandingViewProps {
  onStart: () => void;
  onNavigateToAuth: () => void;
  onNavigateToLegal?: (tab: 'terms' | 'privacy') => void;
}

export const LandingView: React.FC<LandingViewProps> = ({ onStart, onNavigateToAuth, onNavigateToLegal }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  // Let the user check off things on the live mock post-it note in the hero!
  const [todoItems, setTodoItems] = useState([
    { id: 1, text: 'Weekend Plans', isHeader: true },
    { id: 2, text: 'Buy groceries', checked: true },
    { id: 3, text: 'Walk the dog', checked: false },
    { id: 4, text: 'Read new sci-fi book', checked: false },
    { id: 5, text: 'Call mom', checked: false },
  ]);

  const toggleTodo = (id: number) => {
    setTodoItems(prev => prev.map(item => {
      if (item.id === id && !item.isHeader) {
        return { ...item, checked: !item.checked };
      }
      return item;
    }));
  };

  // Word rotator list of terms for the main hero heading
  const rotatorWords = ['organically.', 'calmly.', 'purposefully.', 'playfully.'];
  const [wordIndex, setWordIndex] = useState(0);

  // Hero cards drag offsets and drag-end snapback logic
  const card1X = useMotionValue(0);
  const card1Y = useMotionValue(0);
  const card2X = useMotionValue(0);
  const card2Y = useMotionValue(0);
  const card3X = useMotionValue(0);
  const card3Y = useMotionValue(0);

  const card1TimerRef = useRef<NodeJS.Timeout | null>(null);
  const card2TimerRef = useRef<NodeJS.Timeout | null>(null);
  const card3TimerRef = useRef<NodeJS.Timeout | null>(null);
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    return () => {
      if (card1TimerRef.current) clearTimeout(card1TimerRef.current);
      if (card2TimerRef.current) clearTimeout(card2TimerRef.current);
      if (card3TimerRef.current) clearTimeout(card3TimerRef.current);
    };
  }, []);

  const handleCardDragStart = (cardNum: number) => {
    if (cardNum === 1 && card1TimerRef.current) {
      clearTimeout(card1TimerRef.current);
      card1TimerRef.current = null;
    } else if (cardNum === 2 && card2TimerRef.current) {
      clearTimeout(card2TimerRef.current);
      card2TimerRef.current = null;
    } else if (cardNum === 3 && card3TimerRef.current) {
      clearTimeout(card3TimerRef.current);
      card3TimerRef.current = null;
    }
  };

  const handleCardDragEnd = (cardNum: number) => {
    if (cardNum === 1) {
      if (card1TimerRef.current) clearTimeout(card1TimerRef.current);
      card1TimerRef.current = setTimeout(() => {
        animate(card1X, 0, { type: "spring", stiffness: 80, damping: 15 });
        animate(card1Y, 0, { type: "spring", stiffness: 80, damping: 15 });
      }, 5000);
    } else if (cardNum === 2) {
      if (card2TimerRef.current) clearTimeout(card2TimerRef.current);
      card2TimerRef.current = setTimeout(() => {
        animate(card2X, 0, { type: "spring", stiffness: 80, damping: 15 });
        animate(card2Y, 0, { type: "spring", stiffness: 80, damping: 15 });
      }, 5000);
    } else if (cardNum === 3) {
      if (card3TimerRef.current) clearTimeout(card3TimerRef.current);
      card3TimerRef.current = setTimeout(() => {
        animate(card3X, 0, { type: "spring", stiffness: 80, damping: 15 });
        animate(card3Y, 0, { type: "spring", stiffness: 80, damping: 15 });
      }, 5000);
    }
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setWordIndex((prev) => (prev + 1) % rotatorWords.length);
    }, 2800);
    return () => clearInterval(timer);
  }, []);

  // Scroll animations removed per user preference.

  // Stagger variants for the main hero text layout
  const heroContainerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.1,
      }
    }
  };

  const heroItemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { type: "spring", stiffness: 100, damping: 15 } 
    }
  };

  return (
    <div className="relative min-h-screen bg-[#faf9f6] text-[#1e293b] overflow-x-hidden font-sans selection:bg-[#cae9d5] selection:text-[#203d36]">
      
      {/* Scroll indicator removed */}
      
      {/* Ambient Moving Backdrop Glow Orbs */}
      <motion.div 
        className="absolute top-[5%] left-[-15%] w-[45rem] h-[45rem] bg-emerald-100/35 rounded-full filter blur-3xl -z-10 pointer-events-none"
        animate={{
          x: [0, 50, -30, 0],
          y: [0, -70, 50, 0],
          scale: [1, 1.1, 0.95, 1],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      <motion.div 
        className="absolute top-[35%] right-[-15%] w-[40rem] h-[40rem] bg-amber-100/25 rounded-full filter blur-3xl -z-10 pointer-events-none"
        animate={{
          x: [0, -60, 40, 0],
          y: [0, 80, -40, 0],
          scale: [1, 0.9, 1.05, 1],
        }}
        transition={{
          duration: 24,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      <motion.div 
        className="absolute bottom-[10%] left-[20%] w-[35rem] h-[35rem] bg-[#0c4a60]/5 rounded-full filter blur-3xl -z-10 pointer-events-none"
        animate={{
          x: [0, 30, -30, 0],
          y: [0, -30, 30, 0],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />



      {/* Elegant Header Navigation */}
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-30 max-w-7xl mx-auto px-6 py-6 flex items-center justify-between"
      >
        {/* Brand Logo */}
        <motion.div 
          className="flex items-center gap-2 cursor-pointer" 
          onClick={onStart}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
        >
          <div className="w-8 h-8 rounded-lg bg-[#203d36] flex items-center justify-center text-white shadow-md">
            <Sprout className="w-5 h-5 text-[#fdda64]" />
          </div>
          <span className="font-serif font-bold text-xl text-[#203d36] tracking-tight hidden sm:inline">Synapze</span>
        </motion.div>

        {/* Center Desktop Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-[#5c6e66]">
          <a href="#features" className="hover:text-[#203d36] transition-colors relative group py-1">
            Features
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#203d36] transition-all group-hover:w-full" />
          </a>
          <a href="#community" className="hover:text-[#203d36] transition-colors relative group py-1">
            Community
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#203d36] transition-all group-hover:w-full" />
          </a>
        </nav>

        {/* Right Auth triggers */}
        <div className="hidden md:flex items-center gap-5">
          <button
            onClick={onNavigateToAuth}
            className="text-sm font-semibold text-[#203d36] hover:text-[#5c6e66] transition-colors cursor-pointer"
          >
            Log in
          </button>
          
          <motion.button
            onClick={onStart}
            whileHover={{ y: 2, scale: 0.98, boxShadow: "0px 2px 4px rgba(0,0,0,0.1)" }}
            whileTap={{ y: 4, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 450, damping: 15 }}
            className="px-5 py-2.5 bg-[#203d36] hover:bg-[#162e29] text-white rounded-xl text-sm font-semibold shadow-md cursor-pointer"
          >
            Get Started Free
          </motion.button>
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex md:hidden items-center">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-[#203d36] hover:text-[#5c6e66] transition-colors focus:outline-hidden cursor-pointer"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </motion.header>

      {/* Mobile Nav Dropdown Panel */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute top-[80px] left-6 right-6 p-6 bg-[#faf9f6]/95 backdrop-blur-md border border-slate-200/60 rounded-2xl shadow-xl z-40 flex flex-col gap-4 text-left md:hidden"
          >
            <div className="flex flex-col gap-3">
              <a 
                href="#features" 
                onClick={() => setMobileMenuOpen(false)}
                className="text-base font-semibold text-[#203d36] hover:text-[#5c6e66] py-2 border-b border-slate-100"
              >
                Features
              </a>
              <a 
                href="#community" 
                onClick={() => setMobileMenuOpen(false)}
                className="text-base font-semibold text-[#203d36] hover:text-[#5c6e66] py-2 border-b border-slate-100"
              >
                Community
              </a>
            </div>

            <div className="flex flex-col gap-3 pt-2">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onNavigateToAuth();
                }}
                className="w-full py-2.5 text-center text-sm font-semibold text-[#203d36] border border-[#203d36]/30 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Log in
              </button>
              
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onStart();
                }}
                className="w-full py-2.5 text-center text-sm font-semibold text-white bg-[#203d36] hover:bg-[#162e29] rounded-xl shadow-md transition-colors cursor-pointer"
              >
                Get Started Free
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Hero Section */}
      <section className="max-w-7xl mx-auto px-6 pt-12 pb-24 md:pt-20 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
        
        {/* Left Side Content Column */}
        <motion.div 
          variants={heroContainerVariants}
          initial="hidden"
          animate="visible"
          className="lg:col-span-6 space-y-6 text-left"
        >
          
          {/* Heading */}
          <motion.h1 
            variants={heroItemVariants}
            className="font-serif text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-[#203d36] leading-[1.1]"
          >
            Capture your thoughts, <br />
            <span className="relative inline-block min-w-[190px] sm:min-w-[240px] md:min-w-[300px] text-left align-bottom">
              <AnimatePresence mode="wait">
                <motion.span
                  key={wordIndex}
                  initial={{ y: 12, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -12, opacity: 0 }}
                  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  className="italic font-normal text-[#203d36] inline-block whitespace-nowrap"
                >
                  {rotatorWords[wordIndex]}
                </motion.span>
              </AnimatePresence>
              <svg className="absolute -bottom-1 left-0 w-full h-2 text-[#fdda64]/60" viewBox="0 0 100 10" preserveAspectRatio="none">
                <path d="M0,7 C30,2 70,2 100,7" stroke="currentColor" strokeWidth="4" fill="none" strokeLinecap="round" />
              </svg>
            </span>
          </motion.h1>

          {/* Captivating description */}
          <motion.p 
            variants={heroItemVariants}
            className="text-[#5c6e66] text-base md:text-lg leading-relaxed max-w-xl font-sans font-medium"
          >
            The most creative workspace for your ideas, tasks, and doodles. Organize your life in a way that actually feels fun, not like a chore.
          </motion.p>

          {/* Call to Actions */}
          <motion.div 
            variants={heroItemVariants}
            className="flex flex-wrap items-center gap-4 pt-2"
          >
            <motion.button
              onClick={onStart}
              whileHover={{ y: 2, scale: 0.98, boxShadow: "0px 4px 8px rgba(0,0,0,0.05)" }}
              whileTap={{ y: 4, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 450, damping: 15 }}
              className="px-7 py-4 bg-[#203d36] hover:bg-[#162e29] text-white rounded-xl font-semibold text-base shadow-lg shadow-forest-500/10 flex items-center gap-2 group cursor-pointer"
            >
              Start Growing 
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </motion.button>

            <a
              href="#features"
              className="px-7 py-4 bg-white hover:bg-slate-50 text-[#203d36] border border-slate-200 rounded-xl font-semibold text-base shadow-xs cursor-pointer transition-all duration-200 flex items-center justify-center"
            >
              Explore Features
            </a>
          </motion.div>

        </motion.div>

        {/* Right Side Mockup Column */}
        <div ref={heroRef} className="lg:col-span-6 relative h-[420px] sm:h-[470px] w-full flex items-center justify-center select-none mt-6 lg:mt-0">
          
          {/* Card 1: Warm Yellow Checklist sticky (Gentle natural floating rotation) */}
          <motion.div
            initial={{ opacity: 0, x: -80, rotate: -15, scale: 0.95 }}
            animate={{ 
              opacity: 1, 
              x: 0, 
              rotate: -5,
              scale: 1
            }}
            transition={{
              opacity: { duration: 0.8, delay: 0.2 },
              x: { type: "spring", stiffness: 80, damping: 14, delay: 0.2 },
              rotate: { type: "spring", stiffness: 80, damping: 14, delay: 0.2 },
              scale: { type: "spring", stiffness: 80, damping: 14, delay: 0.2 }
            }}
            className="absolute left-4 sm:left-12 top-6 z-10"
            style={{ transformOrigin: 'center' }}
          >
            <motion.div
              drag
              dragConstraints={heroRef}
              dragElastic={0.15}
              onDragStart={() => handleCardDragStart(1)}
              onDragEnd={() => handleCardDragEnd(1)}
              style={{ x: card1X, y: card1Y }}
              className="cursor-grab active:cursor-grabbing"
            >
              <motion.div
                animate={{ y: [0, -6, 0] }}
                whileHover={{ scale: 1.05 }}
                transition={{
                  y: {
                    delay: 1.0,
                    duration: 5,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }
                }}
                className="bg-[#fdda64] w-64 p-5 rounded-2xl shadow-xl border border-[#eed052]"
              >
                {/* Top tiny pushpin bar styling */}
                <div className="flex gap-1 mb-3">
                  <span className="w-2.5 h-1.5 bg-[#d9af2c] rounded-full" />
                  <span className="w-2.5 h-1.5 bg-[#d9af2c] rounded-full" />
                </div>

                {/* Simulated Checklist Title */}
                <h3 className="font-serif font-bold text-[#453712] text-lg mb-4">{todoItems[0].text}</h3>

                {/* Todo items loops */}
                <div className="space-y-3 font-medium text-sm text-[#4c3f15] font-sans">
                  {todoItems.slice(1).map(item => (
                    <div 
                      key={item.id} 
                      onClick={() => toggleTodo(item.id)}
                      className="flex items-center gap-3 group"
                    >
                      <motion.div 
                        whileTap={{ scale: 0.8 }}
                        className={`w-4.5 h-4.5 rounded border border-[#caa12f] flex items-center justify-center transition-colors ${
                          item.checked ? 'bg-[#5ea150] border-[#5ea150]' : 'bg-white/50 group-hover:bg-white'
                        }`}
                      >
                        {item.checked && <Check className="w-3 h-3 text-white stroke-[3px]" />}
                      </motion.div>
                      <span className={`transition-all ${item.checked ? 'line-through text-[#82764f]' : ''}`}>
                        {item.text}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          </motion.div>

          {/* Card 2: Sky Blue Inspiration card (Behind yellow sticky, floats in opposite timing) */}
          <motion.div
            initial={{ opacity: 0, x: 80, rotate: 18, scale: 0.95 }}
            animate={{ 
              opacity: 1, 
              x: 0, 
              rotate: 6,
              scale: 1
            }}
            transition={{
              opacity: { duration: 0.8, delay: 0.35 },
              x: { type: "spring", stiffness: 80, damping: 14, delay: 0.35 },
              rotate: { type: "spring", stiffness: 80, damping: 14, delay: 0.35 },
              scale: { type: "spring", stiffness: 80, damping: 14, delay: 0.35 }
            }}
            className="absolute right-4 sm:right-10 top-2 z-0"
          >
            <motion.div
              drag
              dragConstraints={heroRef}
              dragElastic={0.15}
              onDragStart={() => handleCardDragStart(2)}
              onDragEnd={() => handleCardDragEnd(2)}
              style={{ x: card2X, y: card2Y }}
              className="cursor-grab active:cursor-grabbing"
            >
              <motion.div
                animate={{ y: [0, 8, 0] }}
                whileHover={{ scale: 1.05 }}
                transition={{
                  y: {
                    delay: 1.15,
                    duration: 6,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }
                }}
                className="bg-[#d8efff] w-60 p-5 rounded-3xl shadow-lg border border-[#badcfe]"
              >
                {/* Folder tab circle */}
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-3.5 h-3.5 rounded-full bg-[#347baa]/20 flex items-center justify-center">
                    <span className="w-1.5 h-1.5 bg-[#347baa] rounded-full" />
                  </span>
                  <span className="font-serif font-bold text-[#1b4d66] text-xs">Inspiration</span>
                </div>

                {/* Simulated dotted image frame */}
                <div className="w-full h-36 border-2 border-dashed border-[#8ebdfc] rounded-2xl flex flex-col items-center justify-center bg-[#eafeff]/50 gap-2">
                  <div className="w-10 h-10 rounded-xl bg-white/80 shadow-xs flex items-center justify-center text-[#3b82f6]">
                    <ImageIcon className="w-5 h-5" />
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>

          {/* Card 3: Front document card (Slow float up/down) */}
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.9 }}
            animate={{ 
              opacity: 1, 
              scale: 1
            }}
            transition={{
              opacity: { duration: 0.8, delay: 0.5 },
              scale: { type: "spring", stiffness: 90, damping: 13, delay: 0.5 }
            }}
            className="absolute right-2 sm:right-14 bottom-16 z-20"
          >
            <motion.div
              drag
              dragConstraints={heroRef}
              dragElastic={0.15}
              onDragStart={() => handleCardDragStart(3)}
              onDragEnd={() => handleCardDragEnd(3)}
              style={{ x: card3X, y: card3Y }}
              className="cursor-grab active:cursor-grabbing"
            >
              <motion.div
                animate={{ y: [0, -10, 0] }}
                whileHover={{ scale: 1.04 }}
                transition={{
                  y: {
                    type: "tween",
                    delay: 1.3,
                    duration: 5.5,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }
                }}
                className="bg-white w-72 p-5 rounded-2xl shadow-2xl border border-slate-100"
              >
                <div className="flex items-center gap-2 mb-2">
                  <PenTool className="w-4 h-4 text-[#203d36]" />
                  <h4 className="font-serif font-bold text-[#203d36] text-sm">Meeting Notes: Q3 Launch</h4>
                </div>

                {/* Horizontal lines to simulate text lines */}
                <div className="space-y-2 mt-4 pb-4">
                  <div className="h-2 bg-slate-100 rounded-full w-full" />
                  <div className="h-2 bg-slate-100 rounded-full w-11/12" />
                  <div className="h-2 bg-slate-100 rounded-full w-4/5" />
                </div>

                {/* Row tag badges exactly matching the mockup */}
                <div className="flex items-center gap-1.5 pt-2 border-t border-slate-50">
                  <span className="px-2 py-0.5 bg-[#fae596] text-[#6d5511] font-sans text-[9px] font-bold rounded-sm tracking-wide uppercase">MARKETING</span>
                  <span className="px-2 py-0.5 bg-[#d8efff] text-[#1b4d66] font-sans text-[9px] font-bold rounded-sm tracking-wide uppercase">URGENT</span>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>

        </div>

      </section>

      {/* FEATURES WRAPPER WITH COZY YELLOW/CREAM BRAND-ALIGNED BACKGROUND */}
      <section className="bg-[#faf8ee] py-24 border-y border-[#fdda64]/35 relative overflow-hidden" id="features">
        {/* Subtle warm decorative glow highlights */}
        <div className="absolute top-10 right-10 w-96 h-96 bg-[#fdda64]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 left-10 w-96 h-96 bg-emerald-700/5 rounded-full blur-3xl pointer-events-none" />

        {/* MID SECTION INTRODUCTION HEADER */}
        <div 
          className="max-w-7xl mx-auto px-6 text-center mb-16 relative z-10"
        >
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-[#203d36] tracking-tight mb-4">
            Ditch the clutter. Keep the vibe.
          </h2>
          <p className="max-w-2xl mx-auto text-[#4d5e55] text-sm sm:text-base leading-relaxed font-semibold">
            The ultimate cozy, distraction-free corner designed for teenagers to dump school notes, journal thoughts, and watch ideas grow into cute virtual gardens.
          </p>
        </div>

        {/* BENTO THREE-COLUMN LAYOUT */}
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            
            {/* Column 1: Cozy Seedling Buddy */}
            <div 
              className="bg-white border border-[#203d36]/10 rounded-[2.2rem] p-10 flex flex-col justify-between h-[548px] overflow-hidden group shadow-lg hover:shadow-xl transition-shadow relative text-left"
            >
              <div className="space-y-4">
                <h3 className="font-serif text-3xl font-bold text-[#203d36] tracking-tight leading-tight">
                  Cozy Seedling Buddy
                </h3>
                <p className="text-[#4a5851] text-[14.5px] font-sans font-medium leading-relaxed antialiased max-w-[270px]">
                  Meet Synapze, your interactive garden mascot. They sit in the corner of your screen, growing new leaves as you write. No stressful reminders—just a cute friend chilling with you.
                </p>
              </div>

              {/* Inner Floating Graphic Container */}
              <div className="relative flex-1 w-full mt-6 flex items-end">
                <div 
                  className="bg-[#faf8ee] rounded-2xl p-6 shadow-md border border-[#fdda64]/20 w-60 ml-2 mb-4 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-center gap-2 text-[#427a5b]">
                    <Sprout className="w-4.5 h-4.5 text-[#203d36]" />
                    <span className="text-[10px] font-bold tracking-widest font-mono text-[#203d36]">GARDEN COMPANION</span>
                  </div>
                  <h4 className="font-serif text-[26px] font-bold text-[#203d36] mt-2.5">Lv. 4 Sprout</h4>
                  <div className="text-xs font-semibold text-emerald-800 mt-2 flex items-center gap-1">
                    <span>🌱 Chilling in your notes</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Column 2: Aesthetic Lo-fi Editor */}
            <div 
              className="bg-white border border-[#203d36]/10 rounded-[2.2rem] p-10 flex flex-col justify-between h-[548px] overflow-hidden group shadow-lg hover:shadow-xl transition-shadow relative text-left"
            >
              <div className="space-y-4">
                <h3 className="font-serif text-3xl font-bold text-[#203d36] tracking-tight leading-tight">
                  Aesthetic Lo-fi Editor
                </h3>
                <p className="text-[#4a5851] text-[14.5px] font-sans font-medium leading-relaxed antialiased max-w-[270px]">
                  A clean, quiet markdown page tailored for late-night inspiration, diaries, or study guides. Zero clutter, custom soft-pastel layout colors, and beautiful interactive styling.
                </p>
              </div>

              {/* Inner Floating Overlapping Documents */}
              <div className="relative flex-1 w-full mt-6">
                {/* Upper Document Card */}
                <div 
                  className="absolute left-2 top-2 bg-[#faf8ee] rounded-2xl p-5 shadow-md border border-[#fdda64]/25 w-[205px] z-10 hover:shadow-lg transition-shadow"
                >
                  <div className="space-y-3.5">
                    <div className="flex items-center justify-between text-[#203d36]">
                      <span className="text-[13px] font-semibold font-sans">Midnight Jots</span>
                      <span className="w-6 h-6 rounded-full bg-[#203d36] flex items-center justify-center text-[#fdda64] text-[11px] font-bold">5</span>
                    </div>
                    <div className="flex items-center justify-between text-[#4a5851]">
                      <span className="text-[13px] font-semibold font-sans">Study Lists</span>
                      <span className="w-6 h-6 rounded-full bg-[#eef3f0] flex items-center justify-center text-[#203d36] text-[11px] font-bold">3</span>
                    </div>
                  </div>
                </div>

                {/* Lower Project Card (Overlapping) */}
                <div 
                  className="absolute right-2 bottom-4 bg-white rounded-2xl p-5 shadow-md border border-slate-150 w-[185px] z-20 hover:shadow-lg transition-shadow"
                >
                  <h5 className="text-[13.5px] font-bold text-[#203d36] font-sans">Aesthetic Moodboard</h5>
                  <p className="text-[10px] text-slate-400 font-sans mt-0.5 font-medium">Last edited just now</p>
                  <p className="text-[11.5px] font-mono font-bold text-[#427a5b] mt-2.5">🌿 Freshly sprouted</p>
                </div>
              </div>
            </div>

            {/* Column 3: The Mind Garden */}
            <div 
              className="bg-white border border-[#203d36]/10 rounded-[2.2rem] p-10 flex flex-col justify-between h-[548px] overflow-hidden group shadow-lg hover:shadow-xl transition-shadow relative text-left md:col-span-2 lg:col-span-1 md:flex-row lg:flex-col"
              id="community"
            >
              <div className="space-y-4 md:max-w-xs lg:max-w-none md:pr-6 lg:pr-0 flex flex-col justify-center">
                <h3 className="font-serif text-3xl font-bold text-[#203d36] tracking-tight leading-tight">
                  The Mind Garden
                </h3>
                <p className="text-[#4a5851] text-[14.5px] font-sans font-medium leading-relaxed antialiased max-w-[270px] md:max-w-xs lg:max-w-[270px]">
                  Your notes are seeds! As you write and complete goals, watch them bloom into digital flowers. See all your folders arranged as physical planter pots in an interactive backyard.
                </p>
              </div>

              {/* Inner Floating Widgets */}
              <div className="relative flex-1 w-full h-full mt-6 md:mt-0 flex flex-col justify-end md:max-w-xs lg:max-w-none">
                {/* Seedlings Card */}
                <div 
                  className="absolute right-4 top-2 md:top-10 lg:top-2 bg-[#faf8ee] rounded-2xl p-5.5 shadow-md border border-[#fdda64]/25 w-[215px] z-10 hover:shadow-lg transition-shadow text-left"
                >
                  <h5 className="text-[14px] font-extrabold text-[#203d36] tracking-tight mb-1 font-sans">Active Backyard</h5>
                  <p className="text-[11px] text-[#4a5851] leading-normal font-semibold font-sans">
                    Track your cozy study streaks and watch flowers bloom on your personalized digital shelf.
                  </p>
                </div>

                {/* Aesthetic Badge Mockup (Overlapping Bottom Right, Styled as Static Graphic Component) */}
                <div 
                  className="absolute right-2 bottom-4 md:bottom-10 lg:bottom-4 z-20 select-none"
                >
                  <div 
                    className="bg-[#203d36] text-white text-[12px] font-bold py-3 px-5 rounded-2xl shadow-md flex items-center gap-2 border border-[#ffffff]/10 hover:bg-black transition-colors duration-200"
                  >
                    <svg className="w-3.5 h-3.5 text-[#fdda64]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    <span className="font-mono text-[11px] text-[#faf9f6]">Share My Vibe</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* TESTIMONIALS SECTION - Polished, aesthetic community voices with distinct yellow brand-aligned background */}
      <section className="bg-gradient-to-br from-[#fef0be] via-[#fdda64] to-[#f9d24a] py-24 relative overflow-hidden z-10" id="testimonials">
        {/* Ambient decorative background glow inside the yellow brand section */}
        <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-96 h-96 bg-white/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-10 w-80 h-80 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-5">
            <div 
              className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#203d36]/10 text-[#203d36] text-xs font-bold tracking-wide border border-[#203d36]/15"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#203d36] animate-pulse" />
              <span>COMMUNITY VOICES</span>
            </div>

            <h2 
              className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-[#203d36] tracking-tight"
            >
              Loved by thinkers, growers, and builders
            </h2>

            <p 
              className="text-[#36493f] text-sm sm:text-base leading-relaxed font-semibold max-w-xl mx-auto"
            >
              Here is how creators and builders use Synapze to cultivate their thoughts.
            </p>

            {/* Trusted by 100k Users Social Proof Badge */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <div className="flex -space-x-2.5 overflow-hidden">
                <img className="inline-block h-8 w-8 rounded-full ring-2 ring-[#fdda64] object-cover" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=80&h=80&q=80" alt="User Profile" referrerPolicy="no-referrer" />
                <img className="inline-block h-8 w-8 rounded-full ring-2 ring-[#fdda64] object-cover" src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=80&h=80&q=80" alt="User Profile" referrerPolicy="no-referrer" />
                <img className="inline-block h-8 w-8 rounded-full ring-2 ring-[#fdda64] object-cover" src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=80&h=80&q=80" alt="User Profile" referrerPolicy="no-referrer" />
                <img className="inline-block h-8 w-8 rounded-full ring-2 ring-[#fdda64] object-cover" src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=80&h=80&q=80" alt="User Profile" referrerPolicy="no-referrer" />
              </div>
              <p className="text-xs font-semibold text-[#36493f] font-mono">
                Trusted by <span className="underline decoration-[#203d36] decoration-2 font-black text-[#203d36]">100,000+</span> minds worldwide
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                quote: "Synapze turned my messy document dumping ground into a quiet digital sanctuary. The mascot tending to my seeds keeps me accountable, and logging notes feels like watering real plants.",
                author: "Evelyn Reed",
                role: "Landscape Architect & Novelist",
                avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&h=120&q=80"
              },
              {
                quote: "I use Synapze for daily design research, logging task completion, and organizing articles. The tactile evolution animations give me a subtle focus boost that standard tools lack.",
                author: "Marcus Chen",
                role: "Interactive Product Designer",
                avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&h=120&q=80"
              },
              {
                quote: "The integration between instant note capture, persistent database backup, and the absolute focus on beautiful visual layouts makes this my absolute favorite tool of the year.",
                author: "Dr. Sarah Jenkins",
                role: "Cognitive Scientist & Lecturer",
                avatarUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=120&h=120&q=80"
              }
            ].map((item, idx) => (
              <motion.div
                key={idx}
                whileHover={{ 
                  y: -6, 
                  scale: 1.01, 
                  boxShadow: "0 20px 25px -5px rgb(32 61 54 / 0.1), 0 8px 10px -6px rgb(32 61 54 / 0.1)",
                  borderColor: "rgba(32, 61, 54, 0.15)"
                }}
                transition={{ 
                  duration: 0.25, 
                  ease: [0.16, 1, 0.3, 1]
                }}
                className="bg-white/95 backdrop-blur-xs border border-[#203d36]/10 rounded-[2rem] p-8 flex flex-col justify-between shadow-lg relative text-left"
              >
                {/* Upper block with Stars Rating & Quote Icon */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, starIdx) => (
                      <Star key={starIdx} className="w-4 h-4 text-[#203d36] fill-[#203d36] stroke-[1.5]" />
                    ))}
                  </div>
                  <Quote className="w-6 h-6 text-[#203d36]/20 transform rotate-180" />
                </div>

                {/* Quote text */}
                <p className="text-[#36493f] font-sans font-medium text-sm sm:text-[14.5px] leading-relaxed italic mb-8">
                  "{item.quote}"
                </p>

                {/* Author Footer */}
                <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                  <img 
                    src={item.avatarUrl} 
                    alt={item.author}
                    className="w-10 h-10 rounded-full object-cover shadow-xs border border-slate-200/50"
                    referrerPolicy="no-referrer"
                  />
                  <div>
                    <h4 className="font-serif font-bold text-[#203d36] text-sm leading-tight">{item.author}</h4>
                    <p className="text-xs text-slate-500 font-sans font-medium mt-0.5">{item.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* BOTTOM CTA CALL-TO-ACTION DESIGN BOX */}
      <section 
        className="bg-[#1c332d] text-white mx-6 sm:mx-12 md:mx-20 rounded-3xl py-16 md:py-24 px-6 text-center relative overflow-hidden z-10 shadow-2xl mt-20 sm:mt-28 md:mt-32 mb-24" 
        id="pricing"
      >
        {/* Ambient decorative circle overlays */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-[450px] h-[450px] bg-emerald-950/40 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl mx-auto space-y-6">
          <h2 className="font-serif text-4xl md:text-5xl font-bold tracking-tight">
            Ready to seed your ideas?
          </h2>
          <p className="text-[#cad9d1] font-sans text-sm sm:text-base font-medium max-w-lg mx-auto">
            Join 50,000+ creators building their second brain with Synapze.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <motion.button
              onClick={onStart}
              whileHover={{ y: 2, scale: 0.98, boxShadow: "0px 4px 8px rgba(0,0,0,0.1)" }}
              whileTap={{ y: 4, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 450, damping: 15 }}
              className="w-full sm:w-auto px-8 py-4 bg-[#9c6d10] hover:bg-[#855b11] text-white font-bold rounded-xl text-base shadow-lg cursor-pointer min-h-[44px]"
            >
              Get Started for Free
            </motion.button>
          </div>
        </div>
      </section>

      {/* Elegant Minimalist Footer */}
      <footer 
        className="border-t border-slate-200/60 bg-white/50 py-10 px-6 font-mono text-xs text-[#5c6e66]"
      >
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logo brand bottom left */}
          <div className="flex items-center gap-2">
            <Sprout className="w-4.5 h-4.5 text-[#427a5b]" />
            <span className="font-serif font-extrabold text-sm text-[#203d36]">Synapze</span>
            <span className="text-slate-400">|</span>
            <span>© 2026 Synapze Labs. Planted with care.</span>
          </div>

          {/* Links bottom right */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-slate-500 font-semibold font-sans">
            <button 
              onClick={() => onNavigateToLegal?.('privacy')}
              className="hover:text-[#203d36] transition-colors cursor-pointer min-h-[44px] flex items-center"
            >
              Privacy Policy
            </button>
            <button 
              onClick={() => onNavigateToLegal?.('terms')}
              className="hover:text-[#203d36] transition-colors cursor-pointer min-h-[44px] flex items-center"
            >
              Terms of Service
            </button>
          </div>
        </div>
      </footer>

    </div>
  );
};
