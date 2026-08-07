import React, { useState, useEffect } from 'react';
import { useGarden, getCompanionDetailByType } from '../lib/gardenState';
import { Sparkles, Heart, Droplets, Sun, FlaskConical, Crown } from 'lucide-react';

export const CompanionCenter: React.FC = () => {
  const { profile, updateProfile, triggerPushNotification, activities, seedlings, awardCompanionXp } = useGarden();
  const [feedLogs, setFeedLogs] = useState<string[]>([]);
  const [showConfetti, setShowConfetti] = useState(false);

  // Companion state calculation
  const totalXp = profile.companionXp || 120;
  // Calculate Level: 1 Level per 250 XP
  const level = Math.floor(totalXp / 250) + 1;
  const currentLevelMin = (level - 1) * 250;
  const nextLevelXp = level * 250;
  const progressPercent = Math.min(100, Math.max(0, ((totalXp - currentLevelMin) / 250) * 100));

  // Companion dynamic identity using dynamic levels & evolution roles
  const getCompanionDetail = () => {
    return getCompanionDetailByType(profile.companionType, level, profile.companionName);
  };

  const compInfo = getCompanionDetail();

  // Active cooldown timestamps
  const [cooldowns, setCooldowns] = useState<{
    water: number;
    fertilizer: number;
    sunlight: number;
    stroke: number;
  }>({
    water: 0,
    fertilizer: 0,
    sunlight: 0,
    stroke: 0
  });

  // Calculate remaining seconds
  const [secondsLeft, setSecondsLeft] = useState<{
    water: number;
    fertilizer: number;
    sunlight: number;
    stroke: number;
  }>({
    water: 0,
    fertilizer: 0,
    sunlight: 0,
    stroke: 0
  });

  // Load initial timestamps
  useEffect(() => {
    const w = Number(localStorage.getItem(`synapze_cd_water_${profile.uid}`) || 0);
    const f = Number(localStorage.getItem(`synapze_cd_fertilizer_${profile.uid}`) || 0);
    const s = Number(localStorage.getItem(`synapze_cd_sunlight_${profile.uid}`) || 0);
    const st = Number(localStorage.getItem(`synapze_cd_stroke_${profile.uid}`) || 0);

    setCooldowns({ water: w, fertilizer: f, sunlight: s, stroke: st });
  }, [profile.uid]);

  // Update remaining seconds in real time
  useEffect(() => {
    const timer = setInterval(() => {
      const now = Date.now();
      
      const wDiff = Math.max(0, Math.ceil((cooldowns.water - now) / 1000));
      const fDiff = Math.max(0, Math.ceil((cooldowns.fertilizer - now) / 1000));
      const sDiff = Math.max(0, Math.ceil((cooldowns.sunlight - now) / 1000));
      const stDiff = Math.max(0, Math.ceil((cooldowns.stroke - now) / 1000));

      setSecondsLeft({
        water: wDiff,
        fertilizer: fDiff,
        sunlight: sDiff,
        stroke: stDiff
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [cooldowns]);

  // Feed/Nurture Companion action
  const handleFeed = (type: 'water' | 'fertilizer' | 'sunlight' | 'stroke') => {
    const now = Date.now();
    
    // Safety check
    if (secondsLeft[type] > 0) {
      triggerPushNotification('Care Tool Cooling Down', `Wait another ${secondsLeft[type]}s before nurturing again.`, 'system');
      return;
    }

    let gainedXp = 10;
    let logMsg = '';
    let cooldownDurationMs = 30000; // default 30s
    
    if (type === 'water') {
      gainedXp = 15;
      logMsg = `💧 Hydrated ${profile.companionName} with premium mineral water (+15 XP)`;
      cooldownDurationMs = 45000; // 45s cooldown
    } else if (type === 'fertilizer') {
      gainedXp = 30;
      logMsg = `🧪 Fertilized soil with bio-active potassium crystals (+30 XP)`;
      cooldownDurationMs = 180000; // 180s (3m) cooldown
    } else if (type === 'sunlight') {
      gainedXp = 20;
      logMsg = `☀️ Exposed foliage canopy to targeted synthesis rays (+20 XP)`;
      cooldownDurationMs = 90000; // 90s (1.5m) cooldown
    } else {
      gainedXp = 10;
      logMsg = `💖 Gently stroked and praised ${profile.companionName} (+10 XP)`;
      cooldownDurationMs = 30000; // 30s cooldown
    }

    // Award XP via context, triggering floating popups & possible evolutions!
    awardCompanionXp(gainedXp, type === 'water' ? 'Watered' : type === 'fertilizer' ? 'Fertilized' : type === 'sunlight' ? 'Synthesis' : 'Petted');

    // Save cooldown timestamps
    const futureTime = now + cooldownDurationMs;
    localStorage.setItem(`synapze_cd_${type}_${profile.uid}`, String(futureTime));
    setCooldowns(prev => ({ ...prev, [type]: futureTime }));

    // Force exact immediate seconds update for responsiveness
    setSecondsLeft(prev => ({ ...prev, [type]: Math.ceil(cooldownDurationMs / 1000) }));

    setFeedLogs(prev => [logMsg, ...prev].slice(0, 5));
  };

  // Generate a daily consistency grid (7 rows x 26 columns = past half year)
  const renderConsistencyGrid = () => {
    const today = new Date();
    today.setHours(12, 0, 0, 0); // Normalize time
    const currentDayOfWeek = today.getDay(); // 0 is Sunday, 6 is Saturday

    const gridCols = [];
    
    // Group seedlings by their localized date key "YYYY-MM-DD"
    const notesByDate: Record<string, typeof seedlings> = {};
    seedlings.forEach(note => {
      if (note.createdAt) {
        const sDate = new Date(note.createdAt);
        if (!isNaN(sDate.getTime())) {
          const dateKey = sDate.toISOString().split('T')[0];
          if (!notesByDate[dateKey]) {
            notesByDate[dateKey] = [];
          }
          notesByDate[dateKey].push(note);
        }
      }
    });

    // Render 26 columns (weeks), ending at column 25 which contains the current week
    for (let c = 0; c < 26; c++) {
      const colCells = [];
      for (let r = 0; r < 7; r++) {
        // Calculate the day offset for this column & row relative to today
        // Column 25 corresponds to the current week. Row corresponds to the day of week.
        const dayOffset = (c - 25) * 7 + (r - currentDayOfWeek);
        const cellDate = new Date(today.getTime() + dayOffset * 24 * 60 * 60 * 1000);
        
        const year = cellDate.getFullYear();
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const monthStr = monthNames[cellDate.getMonth()];
        const dayNum = cellDate.getDate();
        const dateKey = cellDate.toISOString().split('T')[0];
        const dateLabel = `${monthStr} ${dayNum}, ${year}`;

        const isFuture = dayOffset > 0;
        const notesOnThisDate = notesByDate[dateKey] || [];
        const notesCount = notesOnThisDate.length;

        let opacityClass = 'bg-slate-100 hover:bg-slate-200/80';
        let tooltipText = `📅 ${dateLabel}: No knowledge planted.`;

        if (isFuture) {
          opacityClass = 'bg-slate-50 border border-slate-100/30 cursor-not-allowed opacity-20';
          tooltipText = `📅 ${dateLabel} (Future Day)`;
        } else if (notesCount > 0) {
          tooltipText = `📅 ${dateLabel}: Sowed ${notesCount} note${notesCount > 1 ? 's' : ''} ("${notesOnThisDate.map(n => n.title).join(', ')}")`;
          if (notesCount === 1) {
            opacityClass = 'bg-forest-100 border border-forest-200/40 hover:bg-forest-200';
          } else if (notesCount === 2) {
            opacityClass = 'bg-forest-200 hover:bg-forest-300';
          } else if (notesCount === 3) {
            opacityClass = 'bg-forest-500 hover:bg-forest-600';
          } else {
            opacityClass = 'bg-forest-600 hover:bg-forest-700 text-white';
          }
        }

        colCells.push(
          <div 
            key={r} 
            className={`w-3.5 h-3.5 rounded-sm transition-all duration-150 cursor-pointer relative group/cell ${opacityClass}`}
            title={tooltipText}
          >
            {/* Tooltip Hover Overlay Card */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover/cell:flex flex-col bg-slate-950 text-white font-mono text-[9px] p-2 rounded shadow-xl z-50 whitespace-nowrap pointer-events-none border border-slate-800">
              <span className="font-bold text-emerald-400">{dateLabel}</span>
              <span className="text-slate-300">
                {notesCount > 0 ? `🌱 Sowed ${notesCount} note${notesCount > 1 ? 's' : ''}` : `💤 Dormant Soil`}
              </span>
              {notesCount > 0 && (
                <div className="max-w-[150px] truncate text-slate-400 font-sans mt-0.5 border-t border-slate-800 pt-0.5">
                  {notesOnThisDate.map(n => n.title).join(', ')}
                </div>
              )}
            </div>
          </div>
        );
      }
      gridCols.push(<div key={c} className="flex flex-col gap-1">{colCells}</div>);
    }

    return (
      <div className="flex gap-1 overflow-x-auto custom-scrollbar pb-3 justify-center select-none bg-slate-50/75 p-5 rounded-2xl border border-slate-100">
        <div className="flex gap-1">
          {gridCols.map((col, index) => (
            <div key={index}>{col}</div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8 animate-fade-in text-slate-800">
      
      {/* Master details card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Companion Avatar stat summary */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs flex flex-col items-center justify-center text-center relative overflow-hidden">
          
          {/* Level badge */}
          <div className="absolute top-4 left-4 bg-forest-600 text-white font-mono text-xs font-bold px-2.5 py-1 rounded-full">
            LVL {level}
          </div>
          
          {/* Mascot Large Avatar */}
          <div className="w-28 h-28 bg-forest-50 border-4 border-forest-100 shadow-inner rounded-full flex items-center justify-center text-6xl mb-4 select-none animate-pulse" style={{ animationDuration: '4s' }}>
            {compInfo.avatarEmoji}
          </div>

          <h2 className="font-display font-bold text-2xl text-slate-900 tracking-tight">{profile.companionName}</h2>
          <p className="text-xs font-mono font-bold text-forest-600 uppercase tracking-widest mt-1 mb-3">{compInfo.title}</p>
          
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-slate-100 text-slate-600 text-xs font-medium font-mono">
            Bond: {compInfo.bond}
          </div>

          <div className="border-t border-slate-100 w-full pt-4 mt-6">
            <p className="text-slate-500 text-xs italic leading-relaxed">
              "{compInfo.quote}"
            </p>
          </div>
        </div>

        {/* Level metrics & Interactive Care station */}
        <div className="md:col-span-2 bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
          
          {/* Level meter progress bar */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-mono font-bold text-slate-400">
              <span>EXPERIENCE METER (XP TRACKER)</span>
              <span className="text-forest-600">{totalXp} / {nextLevelXp} XP </span>
            </div>
            
            {/* Real Progress bar */}
            <div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-forest-500 rounded-full transition-all duration-500 relative"
                style={{ width: `${progressPercent}%` }}
              >
                <div className="absolute top-0 right-0 w-3 h-full bg-white/20 animate-pulse" />
              </div>
            </div>

            <p className="text-slate-500 text-xs font-sans leading-relaxed pt-1 flex items-center gap-1.5 label text-slate-400">
              <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              Next reward perk: Level {level + 1} unlocks the "Sage Forest" custom aesthetic theme layout.
            </p>
          </div>

          {/* Interactive Botanist feeding station selection */}
          <div className="border-t border-slate-100 pt-6 mt-6">
            <h3 className="font-display font-semibold text-sm text-slate-800 mb-4 uppercase tracking-wider font-mono">Mascot Energizer Station</h3>
            
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <button
                type="button"
                disabled={secondsLeft.water > 0}
                onClick={() => handleFeed('water')}
                className={`py-3 px-4 border rounded-xl flex flex-col items-center justify-center gap-2 text-center transition-all duration-200 group ${
                  secondsLeft.water > 0 
                    ? 'bg-slate-100/70 border-slate-200 text-slate-450 cursor-not-allowed'
                    : 'bg-slate-50 hover:bg-sky-50 border-slate-100 hover:border-sky-200 cursor-pointer text-slate-700'
                }`}
              >
                <div className={`p-2 rounded-xl transition-colors duration-250 ${secondsLeft.water > 0 ? 'bg-slate-200/50 text-slate-400' : 'bg-sky-50 text-sky-550 group-hover:bg-sky-100'}`}>
                  <Droplets className="w-5 h-5 shrink-0" />
                </div>
                <span className="text-xs font-semibold">
                  {secondsLeft.water > 0 ? `Water ${secondsLeft.water}s` : 'Pure Water'}
                </span>
                <span className="text-[9px] font-mono font-bold text-sky-600 uppercase">+15 XP</span>
              </button>

              <button
                type="button"
                disabled={secondsLeft.sunlight > 0}
                onClick={() => handleFeed('sunlight')}
                className={`py-3 px-4 border rounded-xl flex flex-col items-center justify-center gap-2 text-center transition-all duration-200 group ${
                  secondsLeft.sunlight > 0 
                    ? 'bg-slate-100/70 border-slate-200 text-slate-450 cursor-not-allowed'
                    : 'bg-slate-50 hover:bg-amber-50 border-slate-100 hover:border-amber-200 cursor-pointer text-slate-700'
                }`}
              >
                <div className={`p-2 rounded-xl transition-colors duration-250 ${secondsLeft.sunlight > 0 ? 'bg-slate-200/50 text-slate-400' : 'bg-amber-50 text-amber-550 group-hover:bg-amber-100 animate-pulse'}`}>
                  <Sun className="w-5 h-5 shrink-0" />
                </div>
                <span className="text-xs font-semibold">
                  {secondsLeft.sunlight > 0 ? `Sun ${secondsLeft.sunlight}s` : 'Solar Ray'}
                </span>
                <span className="text-[9px] font-mono font-bold text-amber-600 uppercase">+20 XP</span>
              </button>

              <button
                type="button"
                disabled={secondsLeft.fertilizer > 0}
                onClick={() => handleFeed('fertilizer')}
                className={`py-3 px-4 border rounded-xl flex flex-col items-center justify-center gap-2 text-center transition-all duration-200 group ${
                  secondsLeft.fertilizer > 0 
                    ? 'bg-slate-100/70 border-slate-200 text-slate-450 cursor-not-allowed'
                    : 'bg-slate-50 hover:bg-emerald-50 border-slate-100 hover:border-emerald-200 cursor-pointer text-slate-700'
                }`}
              >
                <div className={`p-2 rounded-xl transition-colors duration-250 ${secondsLeft.fertilizer > 0 ? 'bg-slate-200/50 text-slate-400' : 'bg-emerald-50 text-emerald-555 group-hover:bg-emerald-100'}`}>
                  <FlaskConical className="w-5 h-5 shrink-0" />
                </div>
                <span className="text-xs font-semibold">
                  {secondsLeft.fertilizer > 0 ? `Soil ${secondsLeft.fertilizer}s` : 'Bio Crystals'}
                </span>
                <span className="text-[9px] font-mono font-bold text-emerald-600 uppercase">+30 XP</span>
              </button>

              <button
                type="button"
                disabled={secondsLeft.stroke > 0}
                onClick={() => handleFeed('stroke')}
                className={`py-3 px-4 border rounded-xl flex flex-col items-center justify-center gap-2 text-center transition-all duration-200 group ${
                  secondsLeft.stroke > 0 
                    ? 'bg-slate-100/70 border-slate-200 text-slate-450 cursor-not-allowed'
                    : 'bg-slate-50 hover:bg-rose-50 border-slate-100 hover:border-rose-200 cursor-pointer text-slate-700'
                }`}
              >
                <div className={`p-2 rounded-xl transition-colors duration-250 ${secondsLeft.stroke > 0 ? 'bg-slate-200/50 text-slate-400' : 'bg-rose-50 text-rose-550 group-hover:bg-rose-100'}`}>
                  <Heart className="w-5 h-5 shrink-0" />
                </div>
                <span className="text-xs font-semibold">
                  {secondsLeft.stroke > 0 ? `Pet ${secondsLeft.stroke}s` : 'Nurture Pet'}
                </span>
                <span className="text-[9px] font-mono font-bold text-rose-600 uppercase">+10 XP</span>
              </button>
            </div>
          </div>

        </div>

      </div>

      {/* Consistency matrix (Daily activity tracker) */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div className="space-y-1">
            <h3 className="font-display font-bold text-lg text-slate-800 flex items-center gap-2">
              Sowing Consistency Grid
            </h3>
            <p className="text-slate-500 text-xs">
              Keep your garden green!
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-emerald-600 bg-emerald-50 border border-emerald-200/50 rounded-lg px-2.5 py-1">
            STREAK HEALTH: {profile.streakDays} DAYS
          </span>
        </div>

        {renderConsistencyGrid()}

        <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-3 px-1">
          <span>Less active (Dormant Soil)</span>
          <div className="flex gap-1 items-center">
            <div className="w-2.5 h-2.5 rounded bg-slate-100" />
            <div className="w-2.5 h-2.5 rounded bg-emerald-100" />
            <div className="w-2.5 h-2.5 rounded bg-forest-200" />
            <div className="w-2.5 h-2.5 rounded bg-forest-500" />
            <div className="w-2.5 h-2.5 rounded bg-forest-600" />
            <span className="ml-1">More active (Fully Hydrated)</span>
          </div>
        </div>
      </div>

      {/* Badges checklist */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs text-left">
        <h3 className="font-display font-bold text-lg text-slate-800 flex items-center gap-2 mb-4">
          Botanist Badges & Core Talents
        </h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {[
            { tag: 'Sprout Emperor', desc: 'Plant at least 10 active knowledge seedlings.', unlocked: seedlings.filter(s => s.status !== 'archived').length >= 10 },
            { tag: 'Synaptic Monarch', desc: 'Amass massive knowledge, reaching at least 800 XP.', unlocked: totalXp >= 800 },
            { tag: 'Lord of Streaks', desc: 'Maintain consecutive hydration streak of 7+ days.', unlocked: (profile.streakDays || 0) >= 7 },
            { tag: 'Cloud Overlord', desc: 'Establish stable connections, reaching at least 1500 XP.', unlocked: totalXp >= 1500 },
            { tag: 'Sage Companion', desc: 'Grow Companion level to level 5 status or above.', unlocked: level >= 5 },
            { tag: 'Master Composter', desc: 'Compost or prune at least 5 different knowledge seedlings.', unlocked: activities.filter(a => a.actionText.includes('Composted') || a.actionText.includes('Pruned') || a.actionText.includes('note file')).length >= 5 }
          ].map((badge, idx) => (
            <div 
              key={idx} 
              className={`p-4 rounded-xl border flex items-center gap-3.5 transition-all ${
                badge.unlocked 
                  ? 'bg-amber-50/40 border-amber-200 hover:border-amber-300 shadow-xs' 
                  : 'bg-slate-50/40 border-slate-100 opacity-60'
              }`}
            >
              <div className={`w-12 h-12 rounded-full border shrink-0 flex items-center justify-center text-xl shadow-inner relative ${
                badge.unlocked 
                  ? 'bg-amber-100 border-amber-300 text-amber-700 font-semibold ring-4 ring-amber-400/10' 
                  : 'bg-slate-100 border-slate-200 text-slate-450 font-normal'
              }`}>
                {badge.unlocked ? (
                  <Crown className="w-5 h-5 text-amber-600 animate-bounce" style={{ animationDuration: '3s' }} />
                ) : (
                  <span className="text-xs">🔒</span>
                )}
              </div>
              <div className="space-y-0.5 min-w-0">
                <div className={`text-xs font-bold truncate ${badge.unlocked ? 'text-amber-950 font-serif' : 'text-slate-400 font-medium'}`}>{badge.tag}</div>
                <div className="text-[10px] text-slate-500 leading-normal line-clamp-2">{badge.desc}</div>
                <div className="text-[9px] font-semibold text-amber-700 uppercase tracking-widest leading-none pt-0.5">
                  {badge.unlocked ? '👑 UNLOCKED' : 'LOCKED'}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
