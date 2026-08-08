import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useGarden } from '../lib/gardenState';
import { SeedlingNode } from '../types';
import { AvatarSvg } from './SettingsView';
import { 
  Sprout, 
  Leaf, 
  BookOpen, 
  Lightbulb, 
  Activity, 
  Plus, 
  Calendar, 
  Trash2, 
  CheckCircle2, 
  Bot, 
  Award, 
  Clock, 
  ArrowRight,
  Search,
  Bell,
  Sparkles,
  FileText,
  Archive,
  Mail,
  Loader2
} from 'lucide-react';
import { stripFormatting } from '../lib/editorUtils';

export const PulsingLeaf: React.FC = () => {
  return (
    <div className="relative w-14 h-14 flex items-center justify-center flex-none select-none">
      {/* 1. Subtle, Calm Background Pulse Glow with extremely low opacity */}
      <motion.div
        className="absolute w-14 h-14 bg-emerald-500/20 rounded-full filter blur-lg"
        animate={{
          scale: [0.9, 1.15, 0.9],
          opacity: [0.02, 0.08, 0.02],
        }}
        transition={{
          duration: 2.4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* 2. Soft Outer Pulse Backdrop of the Leaf with muted opacity */}
      <motion.div
        className="absolute text-emerald-500/20 fill-emerald-500/3"
        style={{ originY: "50%", originX: "50%" }}
        animate={{
          scale: [0.95, 1.05, 0.95],
        }}
        transition={{
          duration: 2.4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <Leaf className="w-12 h-12 filter drop-shadow-[0_1px_2px_rgba(16,185,129,0.06)]" />
      </motion.div>

      {/* 4. Main Leaf Body with low contrast strokes and matching quiet fill */}
      <motion.div
        className="absolute text-emerald-600/50 fill-emerald-500/10"
        style={{ originY: "50%", originX: "50%" }}
        animate={{
          scale: [0.97, 1.03, 0.97],
        }}
        transition={{
          duration: 2.4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <Leaf className="w-10 h-10" />
      </motion.div>
    </div>
  );
};

interface DashboardViewProps {
  onNavigateToEditor: (existingId?: string) => void;
  onNavigateToCompanion: () => void;
  onNavigateToCapture: () => void;
  onNavigateToVault: () => void;
  onOpenSearch?: (initialQuery?: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNavigateToEditor,
  onNavigateToCompanion,
  onNavigateToCapture,
  onNavigateToVault,
  onOpenSearch
}) => {
  const { 
    profile, 
    seedlings, 
    activities, 
    updateSeedling, 
    triggerPushNotification,
    updateProfile,
    userEmail
  } = useGarden();

  // Search filter query (local state)
  const [searchQuery, setSearchQuery] = useState('');
  const [newCareText, setNewCareText] = useState('');
  const [activeGraphFilter, setActiveGraphFilter] = useState<'all' | 'notes' | 'tasks' | 'archive' | 'ideas'>('all');

  // Garden Growth Report states
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportLoading, setReportLoading] = useState(false);
  const [reportData, setReportData] = useState<{ subject: string; htmlBody: string } | null>(null);
  const [reportEmailSent, setReportEmailSent] = useState(false);

  const handleGenerateReport = async () => {
    setShowReportModal(true);
    setReportLoading(true);
    setReportEmailSent(false);
    setReportData(null);
    try {
      const response = await fetch('/api/report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          displayName: profile?.displayName || 'Gardener',
          streakDays: profile?.streakDays || 0,
          notesCount: seedlings.length,
          companionName: profile?.companionName || 'Sprouty',
          recentNotes: seedlings.slice(0, 5).map(s => s.title || 'Untitled Seedling'),
          email: userEmail || 'gardener@example.com'
        })
      });
      if (response.ok) {
        const data = await response.json();
        setReportData({
          subject: data.subject,
          htmlBody: data.htmlBody
        });
      } else {
        throw new Error('Server returned error status');
      }
    } catch (err) {
      console.error('Failed to generate weekly growth report:', err);
      // Fallback local report data
      setReportData({
        subject: `🌿 Your Weekly Garden Growth Report: ${profile?.streakDays || 0} Day Streak Blooming!`,
        htmlBody: `
          <!DOCTYPE html>
          <html>
          <body style="font-family: sans-serif; background-color: #f5f4ef; padding: 20px; margin: 0;">
            <div style="max-width: 500px; margin: 0 auto; background: white; padding: 25px; border-radius: 16px; border: 1px solid #e2e8f0; box-shadow: 0 2px 8px rgba(0,0,0,0.04);">
              <h2 style="color: #203d36; margin-top: 0; font-size: 20px;">Weekly Garden Growth</h2>
              <p style="color: #334155; font-size: 14px;">Hello, ${profile?.displayName || 'Gardener'}! 🌿</p>
              <p style="color: #065f46; font-style: italic; background: #f0fdf4; padding: 15px; border-left: 4px solid #10b981; border-radius: 0 8px 8px 0; font-size: 14px; line-height: 1.5; margin: 15px 0;">
                "Your intellectual garden is shooting up beautiful green stems! By sowing ${seedlings.length} notes this week, you've nourished the soil of your thoughts."
              </p>
              <h4 style="color: #203d36; border-bottom: 1px solid #f1f5f9; padding-bottom: 8px; margin-top: 20px; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">Consistency Metrics</h4>
              <p style="font-size: 13px; color: #475569; line-height: 1.6;">
                <strong>Day Streak:</strong> ${profile?.streakDays || 0} days<br/>
                <strong>Seeds Sowed:</strong> ${seedlings.length}
              </p>
              <h4 style="color: #203d36; border-bottom: 1px solid #f1f5f9; padding-bottom: 8px; margin-top: 20px; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">Seedlings Sowed This Week</h4>
              <ul style="padding-left: 20px; margin: 10px 0; font-size: 13px; color: #475569; line-height: 1.6;">
                ${seedlings.slice(0, 5).map(s => `<li><strong>${s.title || 'Untitled Note'}</strong></li>`).join('') || '<li>No notes sowed this week.</li>'}
              </ul>
            </div>
          </body>
          </html>
        `
      });
    } finally {
      setReportLoading(false);
    }
  };

  const handleSendSimulatedEmail = () => {
    setReportEmailSent(true);
    triggerPushNotification(
      '📬 Report Sent!', 
      `Weekly Garden Growth digest sent to ${userEmail || 'gardener@example.com'}.`, 
      'care'
    );
    // Auto close after 2 seconds
    setTimeout(() => {
      setShowReportModal(false);
    }, 2000);
  };

  // Daily Care checklist Items loaded from / saved to local storage for personalization
  const [dailyCare, setDailyCare] = useState<Array<{ id: string; text: string; done: boolean; xpReward: number }>>(() => {
    const cached = localStorage.getItem(`synapze_care_${profile.uid}`);
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch { }
    }
    return [
      { id: 'care_1', text: 'Hydrate active companion', done: false, xpReward: 10 },
      { id: 'care_2', text: 'Record daily knowledge seedling', done: false, xpReward: 15 }
    ];
  });

  useEffect(() => {
    localStorage.setItem(`synapze_care_${profile.uid}`, JSON.stringify(dailyCare));
  }, [dailyCare, profile.uid]);

  const handleAddCareItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCareText.trim()) return;
    const newItem = {
      id: 'care_' + Date.now(),
      text: newCareText.trim(),
      done: false,
      xpReward: 10
    };
    setDailyCare(prev => [...prev, newItem]);
    setNewCareText('');
    triggerPushNotification('Daily Care Expanded', `Successfully sowed item "${newItem.text}" into daily routines.`, 'care');
  };

  const handleRemoveCareItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDailyCare(prev => prev.filter(item => item.id !== id));
  };

  // Derived metrics from actual data
  const totalTasks = seedlings.filter(s => s.isTask).length;
  const completedTasks = seedlings.filter(s => s.isTask && s.isCompleted).length;
  const pendingTasksCount = totalTasks - completedTasks;
  const activeNotesCount = seedlings.filter(s => s.status !== 'archived').length;
  const archivedNotesCount = seedlings.filter(s => s.status === 'archived').length;

  // Toggle checklist entries
  const toggleCareItem = (id: string, isChecked: boolean, xpReward: number) => {
    setDailyCare(prev => prev.map(item => {
      if (item.id === id) {
        if (!item.done && isChecked) {
          triggerPushNotification('Companion Nourished', `Earned +${xpReward} XP for performing daily note review!`, 'care');
          updateProfile({
            companionXp: (profile.companionXp || 0) + xpReward
          });
        }
        return { ...item, done: isChecked };
      }
      return item;
    }));
  };

  // Filter actual seedlings on search input
  const filteredSeedlings = seedlings.filter(seed => {
    // Apply graph filtering dynamically
    if (activeGraphFilter === 'notes') {
      if (seed.isTask || seed.status === 'archived') return false;
    } else if (activeGraphFilter === 'tasks') {
      if (!seed.isTask || seed.status === 'archived') return false;
    } else if (activeGraphFilter === 'archive') {
      if (seed.status !== 'archived') return false;
    } else if (activeGraphFilter === 'ideas') {
      if (seed.status === 'archived' || !seed.tags.some(t => t.toLowerCase().includes('idea'))) return false;
    } else {
      // 'all' hides archived notes unless they are explicitly searched
      if (seed.status === 'archived' && !searchQuery) return false;
    }

    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      seed.title.toLowerCase().includes(query) ||
      seed.content.toLowerCase().includes(query) ||
      seed.tags.some(t => t.toLowerCase().includes(query))
    );
  });

  // Safe style formulas for the dashboard seedlings card grid based on high-contrast legible notes
  const getCardStyles = (index: number) => {
    const styles = [
      {
        container: 'bg-[#fcf8e8] border border-amber-200/80 text-slate-900 shadow-xs hover:shadow-md hover:border-amber-400 transition-all',
        text: 'text-slate-800',
        badge: 'bg-amber-100 text-amber-900 border border-amber-300/60 font-semibold',
        tag: 'text-amber-900/80 font-medium'
      },
      {
        container: 'bg-[#f0f7fc] border border-sky-200/80 text-slate-900 shadow-xs hover:shadow-md hover:border-sky-400 transition-all',
        text: 'text-slate-800',
        badge: 'bg-sky-100 text-sky-900 border border-sky-300/60 font-semibold',
        tag: 'text-sky-900/80 font-medium'
      },
      {
        container: 'bg-[#f0f8f3] border border-emerald-200/80 text-slate-900 shadow-xs hover:shadow-md hover:border-emerald-400 transition-all',
        text: 'text-slate-800',
        badge: 'bg-emerald-100 text-emerald-900 border border-emerald-300/60 font-semibold',
        tag: 'text-emerald-900/80 font-medium'
      }
    ];
    return styles[index % styles.length];
  };

  // Get active activities for mini bars visualizer
  const getWeeklyStats = () => {
    const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
    const hasActivities = activities && activities.length > 0;
    
    // We compute actual activity counts per day for the current week (Monday to Sunday)
    // To make it feel super dynamic and functional even for new users, we can combine sowed seedlings per day with actual activities!
    const dailyXp = [0, 0, 0, 0, 0, 0, 0]; // index 0 = Mon, ..., index 6 = Sun
    
    if (hasActivities) {
      activities.forEach(act => {
        try {
          const date = new Date(act.timestamp);
          // getDay() returns 0 for Sunday, 1 for Monday, etc.
          // Let's convert it to 0 for Monday, ..., 6 for Sunday
          const dayIndex = date.getDay() === 0 ? 6 : date.getDay() - 1;
          if (dayIndex >= 0 && dayIndex < 7) {
            dailyXp[dayIndex] += act.xpGained || 5;
          }
        } catch (e) {
          // ignore parsing error
        }
      });
    }

    // Find the max XP to scale the bars nicely
    const maxXp = Math.max(...dailyXp);
    
    return days.map((day, idx) => {
      let height = 0;
      if (hasActivities) {
        if (maxXp > 0) {
          // Map to a percentage between 15% and 100% so even days with little activity have a small representation
          height = dailyXp[idx] > 0 ? 15 + Math.round((dailyXp[idx] / maxXp) * 85) : 0;
        } else {
          height = 0;
        }
      } else {
        // For new users, let's count sowed seedlings per day of the week to display live seedling density!
        const seedlingsByDay = [0, 0, 0, 0, 0, 0, 0];
        seedlings.forEach(seed => {
          try {
            const date = new Date(seed.createdAt);
            const dayIndex = date.getDay() === 0 ? 6 : date.getDay() - 1;
            if (dayIndex >= 0 && dayIndex < 7) {
              seedlingsByDay[dayIndex] += 1;
            }
          } catch (e) {}
        });
        const maxSeeds = Math.max(...seedlingsByDay);
        if (maxSeeds > 0) {
          height = seedlingsByDay[idx] > 0 ? 20 + Math.round((seedlingsByDay[idx] / maxSeeds) * 80) : 0;
        } else {
          height = 0;
        }
      }
      
      return {
        label: day,
        heightPercentage: height
      };
    });
  };

  const barStats = getWeeklyStats();

  return (
    <div className="space-y-8 animate-fade-in max-w-7xl mx-auto pb-12">
      
      {/* 1. TOP ALIGNED HEADER ROW & SEARCH INTERACTIVE BAR */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-2 border-b border-slate-100">
        
        {/* Left Welcome statement without user avatar */}
        <div className="flex items-center gap-4 text-left">
          <div className="space-y-1">
            <h1 className="font-serif text-3xl font-extrabold tracking-tight text-slate-900 leading-tight">
              Hello, {profile?.displayName || 'Gardener'}
            </h1>
            <p className="text-slate-500 text-xs md:text-sm max-w-2xl">
              {profile.bio || `Streak: ${profile.streakDays} days hydration level.`}
            </p>
          </div>
        </div>

        {/* Right Search Input Box with enlarged mobile & desktop footprint */}
        <div className="flex items-center gap-3 w-full md:w-auto self-start md:self-center">
          <div className="relative w-full md:w-80 lg:w-96">
            <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                const val = e.target.value;
                setSearchQuery('');
                if (onOpenSearch) {
                  onOpenSearch(val);
                }
              }}
              onFocus={() => {
                if (onOpenSearch) {
                  onOpenSearch('');
                }
              }}
              onClick={() => {
                if (onOpenSearch) {
                  onOpenSearch('');
                }
              }}
              placeholder="Search your garden..."
              className="w-full pl-11 pr-10 py-3 sm:py-3.5 border border-slate-200/80 bg-slate-100/70 hover:bg-slate-50 focus:bg-white rounded-2xl text-sm font-sans font-medium focus:outline-hidden focus:ring-2 focus:ring-emerald-700/20 transition-all text-left cursor-pointer min-h-[48px]"
            />
            {/* Quick Helper Shortcut Badge */}
            <span className="absolute right-3 top-1/2 -translate-y-1/2 bg-slate-200/60 text-[10px] font-mono text-slate-500 font-semibold px-2 py-0.5 rounded-md pointer-events-none hidden lg:inline">
              ESC
            </span>
          </div>
        </div>

      </div>

      {/* 2. STATS ROW (Bento Cards Layout) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Card 1: Active Streak (Large Dark Green) */}
        <div className="md:col-span-6 bg-[#203d36] text-[#faf9f6] rounded-[1.8rem] p-6 flex items-center justify-between shadow-lg shadow-[#203d36]/10 overflow-hidden relative group">
          {/* Subtle glowing leaf background accent */}
          <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none group-hover:scale-110 transition-transform duration-300" />
          
          <div className="space-y-4 text-left z-10">
            <span className="text-[10px] font-mono font-bold tracking-widest text-[#fdda64]/90 block uppercase">
              ACTIVE STREAK
            </span>
            <div className="space-y-1">
              <h2 className="text-3xl md:text-4xl font-serif font-black tracking-tight flex items-center gap-2">
                {profile.streakDays ?? 0} Days
              </h2>
              <p className="text-[#c2cfc9] text-xs font-medium max-w-xs leading-relaxed">
                Your garden is flourishing. Keep the momentum up!
              </p>
            </div>
          </div>

          <div className="z-10 shrink-0">
            <PulsingLeaf />
          </div>
        </div>

        {/* Card 2: Active Notes (White card) */}
        <div 
          onClick={() => setActiveGraphFilter(activeGraphFilter === 'notes' ? 'all' : 'notes')}
          className={`md:col-span-3 rounded-[1.8rem] p-6 flex flex-col justify-between shadow-xs relative text-left group cursor-pointer transition-all duration-300 ${
            activeGraphFilter === 'notes' 
              ? 'bg-sky-50/30 border-sky-400 ring-2 ring-sky-400/20 border shadow-md' 
              : 'bg-white border border-slate-200/60 hover:border-sky-300/80 hover:shadow-md'
          }`}
        >
          <div className={`absolute top-0 left-6 right-6 h-[3px] rounded-b-full ${activeGraphFilter === 'notes' ? 'bg-sky-400' : 'bg-sky-200/50'}`} />
          
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold tracking-wider text-slate-400 block uppercase">
              ACTIVE NOTES
            </span>
            <div className="flex items-center gap-1.5">
              {activeGraphFilter === 'notes' && <span className="w-2 h-2 rounded-full bg-sky-500 animate-pulse" />}
              <BookOpen className={`w-4.5 h-4.5 transition-colors ${activeGraphFilter === 'notes' ? 'text-sky-600' : 'text-sky-500 group-hover:text-sky-600'}`} />
            </div>
          </div>

          <div className="mt-6 space-y-1">
            <h2 className="text-3xl font-serif font-black text-slate-800">
              {activeNotesCount}
            </h2>
            <p className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
              <span>active notes</span>
              {activeGraphFilter === 'notes' && <span className="text-sky-600 text-[9px] lowercase font-normal italic">(filter active)</span>}
            </p>
          </div>
        </div>

        {/* Card 3: Active Tasks (White Card) */}
        <div 
          onClick={() => setActiveGraphFilter(activeGraphFilter === 'tasks' ? 'all' : 'tasks')}
          className={`md:col-span-3 rounded-[1.8rem] p-6 flex flex-col justify-between shadow-xs relative text-left group cursor-pointer transition-all duration-300 ${
            activeGraphFilter === 'tasks' 
              ? 'bg-amber-50/30 border-amber-400 ring-2 ring-amber-400/20 border shadow-md' 
              : 'bg-white border border-slate-200/60 hover:border-amber-300/80 hover:shadow-md'
          }`}
        >
          <div className={`absolute top-0 left-6 right-6 h-[3px] rounded-b-full ${activeGraphFilter === 'tasks' ? 'bg-amber-400' : 'bg-amber-200/50'}`} />
          
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold tracking-wider text-slate-400 block uppercase">
              ACTIVE TASKS
            </span>
            <div className="flex items-center gap-1.5">
              {activeGraphFilter === 'tasks' && <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />}
              <CheckCircle2 className={`w-4.5 h-4.5 transition-colors ${activeGraphFilter === 'tasks' ? 'text-amber-600' : 'text-amber-500 group-hover:text-amber-600'}`} />
            </div>
          </div>

          <div className="mt-6 space-y-1">
            <h2 className="text-3xl font-serif font-black text-slate-800 font-display">
              {pendingTasksCount}
            </h2>
            <p className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
              <span>pending care</span>
              {activeGraphFilter === 'tasks' && <span className="text-amber-600 text-[9px] lowercase font-normal italic">(filter active)</span>}
            </p>
          </div>
        </div>

      </div>

      {/* 3. CORE SUB-SECTION LAYOUT: RECENT SEEDLINGS GRID VS DAILY CARE CHECKLIST */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: Recent Seedlings Grid */}
        <div className="lg:col-span-8 space-y-5">
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="font-serif text-2xl font-bold text-slate-900 tracking-tight">
                {activeGraphFilter === 'all' && "Recent Seedlings"}
                {activeGraphFilter === 'notes' && "Recent Seedlings (Filtered: Notes)"}
                {activeGraphFilter === 'tasks' && "Recent Seedlings (Filtered: Tasks)"}
                {activeGraphFilter === 'archive' && "Recent Seedlings (Filtered: Archived Notes)"}
                {activeGraphFilter === 'ideas' && "Recent Seedlings (Filtered: Ideas)"}
              </h2>
              {activeGraphFilter !== 'all' && (
                <button
                  onClick={() => setActiveGraphFilter('all')}
                  className="px-2 py-1 bg-rose-50 text-rose-600 border border-rose-100 rounded-lg hover:bg-rose-100 transition-colors cursor-pointer text-[10px] font-bold uppercase tracking-wider flex items-center gap-1"
                >
                  Clear filter ✕
                </button>
              )}
            </div>
            <button 
              onClick={onNavigateToVault}
              className="text-xs font-mono font-extrabold text-slate-400 hover:text-slate-800 transition-colors uppercase cursor-pointer tracking-wider"
            >
              View all notes
            </button>
          </div>

          {/* 2x2 Grid Layout exactly like the image */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {filteredSeedlings.length === 0 ? (
              <div className="bg-[#f5f4ef] rounded-[1.8rem] border border-dashed border-slate-200 p-6 flex items-center justify-center text-center h-[210px]">
                <p className="text-slate-400 text-xs font-mono">No matching seedlings found.</p>
              </div>
            ) : (
              filteredSeedlings.slice(0, 3).map((seed, idx) => {
                const cardStyle = getCardStyles(idx);
                return (
                  <motion.div 
                    key={seed.id}
                    onClick={() => onNavigateToEditor(seed.id)}
                    whileHover={{ y: -4, scale: 1.015, boxShadow: "0 12px 30px -10px rgba(32, 61, 54, 0.15)" }}
                    whileTap={{ scale: 0.985 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    className={`p-6 rounded-[1.8rem] border flex flex-col justify-between h-[210px] text-left cursor-pointer transition-all duration-300 ${cardStyle.container}`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-3">
                        <h3 className={`font-serif font-bold text-lg tracking-tight line-clamp-1 flex-1 transition-all duration-300 ${seed.isTask && seed.isCompleted ? 'line-through opacity-50' : ''}`}>
                          {seed.title}
                        </h3>
                        {seed.isTask ? (
                          <button
                            onClick={(e) => {
                              e.stopPropagation(); // Avoid navigating to the editor
                              updateSeedling(seed.id, { isCompleted: !seed.isCompleted });
                            }}
                            className="p-1 rounded-full hover:bg-black/5 transition-colors cursor-pointer text-slate-800 hover:text-emerald-800 shrink-0"
                            title={seed.isCompleted ? "Mark as open task" : "Mark as completed"}
                          >
                            <CheckCircle2 className={`w-5 h-5 transition-all ${seed.isCompleted ? 'text-emerald-700 fill-emerald-100 stroke-[2.5]' : 'text-slate-500/60 stroke-[1.5]'}`} />
                          </button>
                        ) : (
                          <div className="p-1 text-slate-500/50 shrink-0" title="Reference Note">
                            <FileText className="w-4.5 h-4.5 stroke-[1.8]" />
                          </div>
                        )}
                      </div>
                      
                      {/* Clean preview using stripped formatted markdown snippet */}
                      <p className={`text-xs leading-relaxed line-clamp-3 transition-all duration-300 ${seed.isTask && seed.isCompleted ? 'opacity-40 line-through' : ''} ${cardStyle.text}`}>
                        {stripFormatting(seed.content) || 'Nurturing seedling... Open inside Editor Studio to detail goals and milestones.'}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5 pt-2">
                      {/* Type Label Badge */}
                      <span className={`text-[9px] font-mono font-bold uppercase tracking-widest px-1.5 py-0.5 rounded-md flex items-center gap-1 bg-white/45 text-slate-800 border border-white/20`}>
                        {seed.isTask ? (
                          <>
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                            <span>Task</span>
                          </>
                        ) : (
                          <>
                            <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
                            <span>Note</span>
                          </>
                        )}
                      </span>

                      <span className={`text-[9px] font-mono font-bold uppercase tracking-widest px-1.5 py-0.5 rounded-md ${cardStyle.badge}`}>
                        {seed.status}
                      </span>
                      {seed.tags.slice(0, 2).map(tag => (
                        <span 
                          key={tag} 
                          className={`text-[9px] font-mono leading-none tracking-wider self-center ${cardStyle.tag}`}
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </motion.div>
                );
              })
            )}

            {/* 4th Card in the 2x2 grid: Dotted "Start a new note..." interactive tile matching the UI perfectly! */}
            <motion.div 
              onClick={() => onNavigateToEditor()}
              whileHover={{ y: -4, scale: 1.015, borderColor: "rgba(32, 61, 54, 0.4)" }}
              whileTap={{ scale: 0.985 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              className="border-2 border-dashed border-[#203d36]/20 bg-[#f5f4ef]/80 hover:bg-[#203d36]/10 rounded-[1.8rem] p-6 flex flex-col items-center justify-center text-center group cursor-pointer h-[210px] transition-all duration-300 shadow-xs hover:shadow-md"
            >
              <div className="w-10 h-10 rounded-full bg-white border border-[#203d36]/15 flex items-center justify-center text-[#203d36]/60 group-hover:text-[#203d36] group-hover:border-[#203d36]/40 transition-colors shadow-2xs">
                <Plus className="w-5 h-5" />
              </div>
              <span className="text-sm font-serif font-bold text-[#203d36] mt-3">
                Start a new note
              </span>
              <span className="text-[10px] font-mono text-[#203d36]/60 uppercase tracking-widest mt-1 font-bold">
                quick seeding
              </span>
            </motion.div>

          </div>

        </div>

        {/* Right Side Column: Daily Care Checklist Panel */}
        <div className="lg:col-span-4 space-y-6">
          
          <div className="bg-white border border-slate-200/60 rounded-[1.8rem] p-6 shadow-xs text-left relative">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-serif text-lg font-bold text-slate-900 tracking-tight">
                Daily Care
              </h3>
              <span className="text-[10px] font-mono font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
                {dailyCare.filter(i => i.done).length}/{dailyCare.length} done
              </span>
            </div>

            <p className="text-slate-400 text-xs font-sans leading-relaxed mb-5">
              Maintain the organic health of your study routines. Form custom tasks to nurture your mascot companion.
            </p>

            <div className="space-y-4 max-h-64 overflow-y-auto custom-scrollbar pr-1">
              {dailyCare.map(item => (
                <div 
                  key={item.id}
                  className="flex items-start justify-between gap-3 group border-b border-slate-50 pb-3 last:border-b-0 last:pb-0"
                >
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <input
                      type="checkbox"
                      checked={item.done}
                      onChange={(e) => toggleCareItem(item.id, e.target.checked, item.xpReward)}
                      className="w-4.5 h-4.5 rounded text-emerald-700 border-slate-300 focus:ring-emerald-700/20 cursor-pointer mt-0.5"
                    />
                    <div className="space-y-0.5 min-w-0 flex-1">
                      <p className={`text-xs font-medium leading-relaxed break-words ${item.done ? 'line-through text-slate-400' : 'text-slate-700'}`}>
                        {item.text}
                      </p>
                    </div>
                  </div>
                  
                  {/* Pruning tool to remove customized task */}
                  <button
                    onClick={(e) => handleRemoveCareItem(item.id, e)}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-slate-100 text-slate-400 hover:text-red-500 rounded-lg transition-all cursor-pointer"
                    title="Prune item"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Personalized input form */}
            <form onSubmit={handleAddCareItem} className="mt-5 pt-4 border-t border-slate-100 flex items-center gap-2">
              <input
                type="text"
                value={newCareText}
                onChange={(e) => setNewCareText(e.target.value)}
                placeholder="Add personalized care..."
                className="flex-1 bg-slate-50 hover:bg-slate-100/60 focus:bg-white text-xs px-3 py-2 border border-slate-200 rounded-xl focus:outline-hidden transition-colors text-left"
              />
              <button
                type="submit"
                className="p-2 bg-slate-900 hover:bg-black text-white rounded-xl transition-colors shrink-0 cursor-pointer"
                title="Add task"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </form>

          </div>

        </div>

      </div>

      {/* 4. CULTIVATE YOUR KNOWLEDGE - STATS HERO BLOCK (BOTTOM SECTION) */}
      <div className="bg-[#f0ece1]/50 border border-slate-200/50 rounded-[2rem] p-6 md:p-10 text-left grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative overflow-hidden">
        
        {/* Decorative background glows */}
        <div className="absolute top-1/2 left-1/4 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />

        {/* Text and stats graphics */}
        <div className="lg:col-span-7 space-y-6 z-10">
          <div className="space-y-2">
            <h2 className="font-serif text-3xl md:text-4xl font-extrabold text-[#203d36] tracking-tight leading-tight">
              Cultivate your <br />
              <span className="text-emerald-800 italic font-medium">Knowledge.</span>
            </h2>
            <p className="text-[#3c4a42] text-sm leading-relaxed max-w-lg">
              Every note you take is a seed. In time, they grow into a robust forest of ideas that you can navigate with ease.
            </p>
          </div>

          {/* Micro bars list chart representing daily activity/gains */}
          <div className="pt-4 flex items-end gap-3.5 h-24">
            {barStats.map((stat, index) => (
              <div key={index} className="flex flex-col items-center gap-1.5 flex-1">
                {/* Bar */}
                <div className="w-full bg-slate-200/70 rounded-md h-16 relative overflow-hidden">
                  <motion.div 
                    initial={{ height: 0 }}
                    animate={{ height: `${stat.heightPercentage}%` }}
                    transition={{ duration: 1, delay: index * 0.05 }}
                    className="absolute bottom-0 left-0 right-0 bg-[#203d36] rounded-md"
                  />
                </div>
                <span className="text-[9px] font-mono font-bold text-slate-400">
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Digital Forest Beautiful visual design (CSS canvas/representation) */}
        <div className="lg:col-span-5 w-full h-full flex justify-center items-center z-10 relative">
          <div className="w-full h-64 md:h-80 rounded-[1.8rem] bg-[#203d36] border border-white/5 shadow-2xl relative group overflow-hidden flex flex-col justify-between p-4">
            
            {/* Soft inner stars/leaves overlay */}
            <div className="absolute inset-0 bg-radial-at-t from-emerald-500/10 to-transparent pointer-events-none" />
            
            {/* SVG Network Tree/Knowledge Graph */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
              {/* Connected Lines / Branches */}
              {/* Branch to Ideas */}
              <line x1="50%" y1="50%" x2="20%" y2="22%" stroke="#10b981" strokeWidth="2" strokeDasharray="3 3" opacity="0.6" />
              {/* Branch to Notes */}
              <line x1="50%" y1="50%" x2="80%" y2="22%" stroke="#38bdf8" strokeWidth="2" strokeDasharray="3 3" opacity="0.6" />
              {/* Branch to Tasks */}
              <line x1="50%" y1="50%" x2="15%" y2="68%" stroke="#fbbf24" strokeWidth="2" strokeDasharray="3 3" opacity="0.6" />
              {/* Branch to Archive */}
              <line x1="50%" y1="50%" x2="85%" y2="68%" stroke="#818cf8" strokeWidth="2" strokeDasharray="3 3" opacity="0.6" />
              
              {/* Central Trunk */}
              <line x1="50%" y1="50%" x2="50%" y2="88%" stroke="#78350f" strokeWidth="4" opacity="0.8" />
            </svg>

            {/* Interactive/Animated HTML Nodes layered on top */}
            <div className="absolute inset-0 w-full h-full flex items-center justify-center">
              
              {/* Central Sprout Node representing the growing Tree canopy */}
              <motion.div 
                onClick={() => {
                  setActiveGraphFilter('all');
                }}
                className={`absolute w-20 h-20 rounded-full border flex flex-col items-center justify-center text-white shadow-xl z-10 cursor-pointer select-none transition-all ${
                  activeGraphFilter === 'all'
                    ? 'bg-emerald-800/95 border-[#fdda64] scale-105'
                    : 'bg-emerald-950/80 border-emerald-500/30 opacity-75 hover:opacity-100 hover:scale-105'
                }`}
                style={{ left: 'calc(50% - 40px)', top: 'calc(50% - 40px)' }}
                animate={activeGraphFilter === 'all' ? { scale: [1.05, 1.1, 1.05] } : { scale: 1 }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              >
                <div className="w-14 h-14 rounded-full bg-emerald-700/80 flex items-center justify-center">
                  <Sprout className="w-7 h-7 text-[#fdda64] animate-bounce-slow" />
                </div>
              </motion.div>

              {/* Node 1: #ideas (top-left) */}
              <motion.div 
                onClick={() => {
                  setActiveGraphFilter('ideas');
                }}
                className={`absolute px-2.5 py-1.5 rounded-xl flex items-center gap-1.5 shadow-md font-mono text-[9px] z-10 cursor-pointer border select-none transition-all ${
                  activeGraphFilter === 'ideas' 
                    ? 'bg-emerald-500 border-[#fdda64] text-white scale-110 shadow-lg shadow-emerald-500/20' 
                    : 'bg-[#183a2b] border-emerald-500/40 text-emerald-200 hover:bg-[#1f4c39] hover:scale-105'
                }`}
                style={{ left: '12%', top: '16%' }}
                animate={activeGraphFilter === 'ideas' ? { scale: [1.1, 1.15, 1.1] } : { y: [0, -4, 0] }}
                transition={activeGraphFilter === 'ideas' ? { duration: 1.5, repeat: Infinity } : { duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${activeGraphFilter === 'ideas' ? 'bg-white animate-pulse' : 'bg-emerald-400'}`} />
                <span>#ideas</span>
              </motion.div>

              {/* Node 2: #notes (top-right) */}
              <motion.div 
                onClick={() => {
                  setActiveGraphFilter('notes');
                }}
                className={`absolute px-2.5 py-1.5 rounded-xl flex items-center gap-1.5 shadow-md font-mono text-[9px] z-10 cursor-pointer border select-none transition-all ${
                  activeGraphFilter === 'notes' 
                    ? 'bg-sky-500 border-[#fdda64] text-white scale-110 shadow-lg shadow-sky-500/20' 
                    : 'bg-[#0f2d3a] border-sky-500/40 text-sky-200 hover:bg-[#174356] hover:scale-105'
                }`}
                style={{ right: '12%', top: '16%' }}
                animate={activeGraphFilter === 'notes' ? { scale: [1.1, 1.15, 1.1] } : { y: [0, -5, 0] }}
                transition={activeGraphFilter === 'notes' ? { duration: 1.5, repeat: Infinity } : { duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${activeGraphFilter === 'notes' ? 'bg-white animate-pulse' : 'bg-sky-400'}`} />
                <span>#notes</span>
              </motion.div>

              {/* Node 3: #tasks (bottom-left) */}
              <motion.div 
                onClick={() => {
                  setActiveGraphFilter('tasks');
                }}
                className={`absolute px-2.5 py-1.5 rounded-xl flex items-center gap-1.5 shadow-md font-mono text-[9px] z-10 cursor-pointer border select-none transition-all ${
                  activeGraphFilter === 'tasks' 
                    ? 'bg-amber-500 border-[#fdda64] text-white scale-110 shadow-lg shadow-amber-500/20' 
                    : 'bg-[#36270b] border-amber-500/40 text-amber-200 hover:bg-[#4d3811] hover:scale-105'
                }`}
                style={{ left: '6%', bottom: '24%' }}
                animate={activeGraphFilter === 'tasks' ? { scale: [1.1, 1.15, 1.1] } : { y: [0, -3, 0] }}
                transition={activeGraphFilter === 'tasks' ? { duration: 1.5, repeat: Infinity } : { duration: 2.8, repeat: Infinity, ease: 'easeInOut', delay: 0.2 }}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${activeGraphFilter === 'tasks' ? 'bg-white animate-pulse' : 'bg-amber-400'}`} />
                <span>#tasks</span>
              </motion.div>

              {/* Node 4: #archive (bottom-right) */}
              <motion.div 
                onClick={() => {
                  setActiveGraphFilter('archive');
                }}
                className={`absolute px-2.5 py-1.5 rounded-xl flex items-center gap-1.5 shadow-md font-mono text-[9px] z-10 cursor-pointer border select-none transition-all ${
                  activeGraphFilter === 'archive' 
                    ? 'bg-indigo-500 border-[#fdda64] text-white scale-110 shadow-lg shadow-indigo-500/20' 
                    : 'bg-[#1c1a3a] border-indigo-500/40 text-indigo-200 hover:bg-[#282554] hover:scale-105'
                }`}
                style={{ right: '6%', bottom: '24%' }}
                animate={activeGraphFilter === 'archive' ? { scale: [1.1, 1.15, 1.1] } : { y: [0, -4, 0] }}
                transition={activeGraphFilter === 'archive' ? { duration: 1.5, repeat: Infinity } : { duration: 4.2, repeat: Infinity, ease: 'easeInOut', delay: 0.8 }}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${activeGraphFilter === 'archive' ? 'bg-white animate-pulse' : 'bg-indigo-400'}`} />
                <span>#archive</span>
              </motion.div>

            </div>

            {/* Bottom Status text label inside graph */}
            <div className="absolute bottom-3 left-0 right-0 text-center select-none z-10">
              <span className="text-[8px] font-mono tracking-widest text-slate-400 font-bold uppercase bg-slate-950/40 px-2.5 py-1 rounded-full border border-white/5 inline-flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                KNOWLEDGE_ECOSYSTEM_ACTIVE
              </span>
            </div>

          </div>
        </div>

      </div>

      {/* 5. BRAND FOOTER SECTION */}
      <footer className="pt-6 border-t border-slate-100 text-slate-400 text-xs flex flex-col sm:flex-row items-center justify-between gap-4 font-mono font-medium">
        <span>© 2026 Synapze Labs. Planted with care.</span>
        <div className="flex items-center gap-4">
          <a href="#privacy" className="hover:text-slate-700 transition-colors cursor-pointer">Privacy</a>
          <span>|</span>
          <a href="#changelog" className="hover:text-slate-700 transition-colors cursor-pointer">Changelog</a>
        </div>
      </footer>

      {/* Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="bg-white rounded-3xl shadow-xl border border-slate-200/80 w-full max-w-2xl overflow-hidden flex flex-col max-h-[85vh] text-left"
          >
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center">
                  <Mail className="w-4 h-4 text-emerald-700" />
                </div>
                <div>
                  <h3 className="font-sans font-bold text-slate-950 text-sm">
                    Weekly Growth Report
                  </h3>
                  <p className="text-[9px] font-mono text-slate-400">
                    GENERATED FOR {profile.displayName.toUpperCase()}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setShowReportModal(false)}
                className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors cursor-pointer text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex-1 bg-slate-50/20 space-y-4">
              {reportLoading ? (
                <div className="py-20 flex flex-col items-center justify-center gap-4 text-center">
                  <Loader2 className="w-10 h-10 text-emerald-600 animate-spin" />
                  <div className="space-y-1">
                    <p className="text-sm font-sans font-bold text-slate-800">
                      Compiling your report...
                    </p>
                    <p className="text-xs text-slate-400 max-w-xs mx-auto">
                      Analyzing note density, streak counts, and drafting summary.
                    </p>
                  </div>
                </div>
              ) : reportEmailSent ? (
                <div className="py-20 flex flex-col items-center justify-center gap-4 text-center">
                  <motion.div
                    initial={{ scale: 0.8 }}
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 0.5 }}
                    className="w-14 h-14 rounded-full bg-emerald-500/10 flex items-center justify-center"
                  >
                    <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                  </motion.div>
                  <div className="space-y-1">
                    <p className="text-sm font-sans font-bold text-slate-800">
                      Report Delivered!
                    </p>
                    <p className="text-xs text-slate-500">
                      Email successfully dispatched to <strong>{userEmail || 'gardener@example.com'}</strong>
                    </p>
                  </div>
                </div>
              ) : reportData ? (
                <div className="space-y-4">
                  {/* Mock Email Frame */}
                  <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs flex flex-col">
                    {/* Envelope Header */}
                    <div className="px-4 py-3 bg-slate-50 border-b border-slate-100 text-xs text-slate-500 space-y-1.5 font-mono">
                      <div>
                        <span className="text-slate-400">From:</span> {profile.companionName.toLowerCase()}@synapze.garden (Companion AI)
                      </div>
                      <div>
                        <span className="text-slate-400">To:</span> {userEmail || 'gardener@example.com'}
                      </div>
                      <div className="pt-0.5 font-sans font-bold text-slate-800">
                        <span className="text-slate-400 font-mono font-normal">Subject:</span> {reportData.subject}
                      </div>
                    </div>
                    {/* Rendered HTML in sandbox */}
                    <div className="p-1 max-h-[350px] overflow-y-auto bg-[#f5f4ef]">
                      <iframe 
                        srcDoc={reportData.htmlBody} 
                        title="Garden Growth Report Preview" 
                        className="w-full border-0 min-h-[500px]"
                        sandbox="allow-same-origin"
                      />
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                      onClick={() => setShowReportModal(false)}
                      className="px-4 py-2 text-slate-600 hover:text-slate-800 font-sans font-bold text-xs hover:bg-slate-50 rounded-xl transition-colors cursor-pointer"
                    >
                      Close
                    </button>
                    <button
                      onClick={handleSendSimulatedEmail}
                      className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-sans font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-2"
                    >
                      <Mail className="w-4 h-4" />
                      Send to My Email (Simulated)
                    </button>
                  </div>
                </div>
              ) : (
                <div className="py-12 text-center text-slate-400 text-xs">
                  Failed to load report. Try again.
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}

    </div>
  );
};
