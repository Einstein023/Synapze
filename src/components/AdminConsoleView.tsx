import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useGarden } from '../lib/gardenState';
import { db, auth, OperationType, handleFirestoreError } from '../firebase';
import { 
  collection, 
  getDocs, 
  query, 
  limit
} from 'firebase/firestore';
import { GardenerProfile, ActivityMetric } from '../types';
import { 
  Shield, 
  Users, 
  Activity, 
  Trash2, 
  ArrowLeft, 
  Search, 
  Sparkles, 
  Eye, 
  RefreshCw, 
  AlertTriangle,
  Lock,
  Check,
  Award,
  Download,
  Filter,
  ArrowUpDown,
  Copy,
  CheckCheck,
  X,
  ChevronLeft,
  ChevronRight,
  Flame,
  Zap
} from 'lucide-react';
import { AvatarSvg } from './SettingsView';

interface DeletionFeedback {
  id: string;
  email: string;
  uid: string;
  reason: string;
  timestamp: string;
}

type SortOption = 'streak-desc' | 'xp-desc' | 'name-asc' | 'name-desc' | 'recent';

const PAGE_SIZE = 12;

export const AdminConsoleView: React.FC = () => {
  const { userEmail, isOffline } = useGarden();
  const isAdmin = userEmail === 'uhunomaof@gmail.com';

  // State managers
  const [activeTab, setActiveTab] = useState<'directory' | 'deletions'>('directory');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Loaded database state lists
  const [gardeners, setGardeners] = useState<GardenerProfile[]>([]);
  const [deletions, setDeletions] = useState<DeletionFeedback[]>([]);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<SortOption>('streak-desc');
  const [companionFilter, setCompanionFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Selected User inspection state
  const [inspectedUser, setInspectedUser] = useState<GardenerProfile | null>(null);
  const [inspectedUserActivities, setInspectedUserActivities] = useState<ActivityMetric[]>([]);
  const [loadingInspection, setLoadingInspection] = useState<boolean>(false);
  const [activitySearchQuery, setActivitySearchQuery] = useState<string>('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Load all central admin data
  const loadAdminData = useCallback(async () => {
    if (!isAdmin || isOffline || !db || !auth?.currentUser) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);

    try {
      // 1. Fetch gardeners
      const usersCol = collection(db, 'users');
      const usersSnap = await getDocs(usersCol).catch(err => {
        handleFirestoreError(err, OperationType.LIST, 'users');
      });

      const loadedGardeners: GardenerProfile[] = [];
      if (usersSnap) {
        usersSnap.forEach((docSnap) => {
          loadedGardeners.push(docSnap.data() as GardenerProfile);
        });
      }
      setGardeners(loadedGardeners);

      // 2. Fetch deletions feedback
      const deletionsCol = collection(db, 'account_deletions');
      const deletionsSnap = await getDocs(deletionsCol).catch(err => {
        handleFirestoreError(err, OperationType.LIST, 'account_deletions');
      });

      const loadedDeletions: DeletionFeedback[] = [];
      if (deletionsSnap) {
        deletionsSnap.forEach((docSnap) => {
          const data = docSnap.data();
          loadedDeletions.push({
            id: docSnap.id,
            email: data.email || 'Unknown',
            uid: data.uid || '',
            reason: data.reason || 'Not specified',
            timestamp: data.timestamp || new Date().toISOString()
          });
        });
      }
      
      // Sort deletions newest first
      loadedDeletions.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      setDeletions(loadedDeletions);

    } catch (err: any) {
      console.error("Admin Load Error:", err);
      setError(err.message || String(err));
    } finally {
      setLoading(false);
    }
  }, [isAdmin, isOffline]);

  useEffect(() => {
    if (isAdmin && !isOffline) {
      loadAdminData();
    }
  }, [isAdmin, isOffline, loadAdminData]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, sortBy, companionFilter]);

  // Keyboard shortcut listener: ESC exits inspection mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && inspectedUser) {
        setInspectedUser(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [inspectedUser]);

  // Load specific user's activities with limit to optimize network/rendering
  const inspectUser = async (user: GardenerProfile) => {
    if (!db || isOffline || !auth?.currentUser) return;
    setInspectedUser(user);
    setLoadingInspection(true);
    setInspectedUserActivities([]);
    setActivitySearchQuery('');

    try {
      // Fetch recent activities subcollection with limit(50) for fast load
      const activitiesCol = collection(db, 'users', user.uid, 'activities');
      const activitiesQuery = query(activitiesCol, limit(50));
      const activitiesSnap = await getDocs(activitiesQuery).catch(err => {
        handleFirestoreError(err, OperationType.LIST, `users/${user.uid}/activities`);
      });

      const activities: ActivityMetric[] = [];
      if (activitiesSnap) {
        activitiesSnap.forEach(docSnap => {
          activities.push(docSnap.data() as ActivityMetric);
        });
      }
      // Sort activities newest first
      activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      setInspectedUserActivities(activities);

    } catch (err) {
      console.error("Error inspecting gardener:", err);
    } finally {
      setLoadingInspection(false);
    }
  };

  // Copy helper with animated feedback
  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Memoized High-Level Analytics
  const { totalGardeners, highestStreak, averageStreak, totalDeletionsCount, totalXpAcrossGardeners } = useMemo(() => {
    const total = gardeners.length;
    const highest = total > 0 ? Math.max(...gardeners.map(g => g.streakDays || 0)) : 0;
    const avg = total > 0 ? Math.round(gardeners.reduce((acc, curr) => acc + (curr.streakDays || 0), 0) / total) : 0;
    const totalXp = gardeners.reduce((acc, curr) => acc + (curr.companionXp || 0), 0);
    return {
      totalGardeners: total,
      highestStreak: highest,
      averageStreak: avg,
      totalDeletionsCount: deletions.length,
      totalXpAcrossGardeners: totalXp
    };
  }, [gardeners, deletions]);

  // Memoized Filtered & Sorted Gardeners
  const filteredGardeners = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    
    return gardeners
      .filter(g => {
        // Text match
        const matchesQuery = !q || (
          (g.displayName || '').toLowerCase().includes(q) ||
          (g.email || '').toLowerCase().includes(q) ||
          (g.companionName || '').toLowerCase().includes(q) ||
          (g.theme || '').toLowerCase().includes(q) ||
          g.uid.toLowerCase().includes(q)
        );

        // Companion type match
        const matchesCompanion = companionFilter === 'all' || g.companionType === companionFilter;

        return matchesQuery && matchesCompanion;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case 'streak-desc':
            return (b.streakDays || 0) - (a.streakDays || 0);
          case 'xp-desc':
            return (b.companionXp || 0) - (a.companionXp || 0);
          case 'name-asc':
            return (a.displayName || '').localeCompare(b.displayName || '');
          case 'name-desc':
            return (b.displayName || '').localeCompare(a.displayName || '');
          case 'recent':
            return new Date(b.lastActiveDate || 0).getTime() - new Date(a.lastActiveDate || 0).getTime();
          default:
            return 0;
        }
      });
  }, [gardeners, searchQuery, companionFilter, sortBy]);

  // Paginated Gardeners for Scalable Performance
  const totalPages = Math.ceil(filteredGardeners.length / PAGE_SIZE) || 1;
  const paginatedGardeners = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredGardeners.slice(start, start + PAGE_SIZE);
  }, [filteredGardeners, currentPage]);

  // Filtered Activities for Inspected User
  const filteredInspectedActivities = useMemo(() => {
    const q = activitySearchQuery.toLowerCase().trim();
    if (!q) return inspectedUserActivities;
    return inspectedUserActivities.filter(act => 
      act.actionText.toLowerCase().includes(q)
    );
  }, [inspectedUserActivities, activitySearchQuery]);

  // Export Gardeners CSV
  const exportGardenersCsv = () => {
    if (gardeners.length === 0) return;
    const headers = ['UID', 'DisplayName', 'Email', 'StreakDays', 'Theme', 'CompanionType', 'CompanionName', 'CompanionXP', 'LastActiveDate'];
    const rows = gardeners.map(g => [
      `"${g.uid}"`,
      `"${(g.displayName || '').replace(/"/g, '""')}"`,
      `"${(g.email || '').replace(/"/g, '""')}"`,
      g.streakDays || 0,
      `"${g.theme || 'alabaster'}"`,
      `"${g.companionType || 'Sproutling'}"`,
      `"${(g.companionName || '').replace(/"/g, '""')}"`,
      g.companionXp || 0,
      `"${g.lastActiveDate || ''}"`
    ]);
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `synapze_gardeners_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Export Deletions CSV
  const exportDeletionsCsv = () => {
    if (deletions.length === 0) return;
    const headers = ['ID', 'Email', 'UID', 'Reason', 'Timestamp'];
    const rows = deletions.map(d => [
      `"${d.id}"`,
      `"${(d.email || '').replace(/"/g, '""')}"`,
      `"${d.uid}"`,
      `"${(d.reason || '').replace(/"/g, '""')}"`,
      `"${d.timestamp}"`
    ]);
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `synapze_deletions_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Secure Block for Unauthorized Users
  if (!isAdmin) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-6" id="admin-unauthorized-container">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="bg-white rounded-[2.5rem] border border-red-100 shadow-2xl max-w-lg w-full p-10 text-center space-y-6 relative overflow-hidden"
          id="admin-unauthorized-card"
        >
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-rose-500/5 rounded-full blur-3xl pointer-events-none" />

          <div className="w-20 h-20 bg-rose-50 border border-rose-100 text-rose-600 rounded-3xl flex items-center justify-center mx-auto shadow-sm">
            <Lock className="w-9 h-9 stroke-[2.2]" />
          </div>

          <div className="space-y-3">
            <span className="text-[11px] font-mono font-bold tracking-widest text-rose-600 uppercase bg-rose-50 px-3 py-1.5 rounded-full border border-rose-100/40">
              403 ACCESS DENIED
            </span>
            <h2 className="font-serif text-3xl font-black text-slate-800 tracking-tight pt-2">
              Authorized Personnel Only
            </h2>
            <p className="text-slate-500 text-sm leading-relaxed max-w-sm mx-auto font-sans font-medium">
              This terminal is cryptographically secured. Your active credentials do not grant access to global gardeners metadata.
            </p>
          </div>

          <div className="border-t border-slate-100 pt-6">
            <p className="text-xs text-slate-400 font-mono">
              Signed in as: <span className="font-semibold text-slate-700">{userEmail || 'GUEST_MEMBER'}</span>
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-8" id="admin-console-view-root">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/80 pb-6" id="admin-header-section">
        <div className="space-y-1.5 text-left">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center text-amber-400 shadow-sm">
              <Shield className="w-4.5 h-4.5" />
            </div>
            <span className="font-mono text-xs font-bold text-slate-500 uppercase tracking-widest">Global Administration Panel</span>
          </div>
          <h1 className="font-serif text-3.5xl font-black text-slate-800 tracking-tight leading-none">
            Secure Admin Console
          </h1>
          <p className="text-sm font-medium text-slate-500">
            Monitor real-time gardener registrations, evaluate streak performance, and inspect deactivation feedback.
          </p>
        </div>

        {/* Sync Controls & CSV Export */}
        <div className="flex flex-wrap items-center gap-2.5 self-start md:self-center">
          {isOffline ? (
            <div className="px-4 py-2 bg-amber-50 border border-amber-200 rounded-2xl flex items-center gap-2 text-xs font-mono font-bold text-amber-700">
              <AlertTriangle className="w-4 h-4 shrink-0 text-amber-500" />
              OFFLINE_BLOCKED
            </div>
          ) : (
            <>
              <button 
                onClick={activeTab === 'directory' ? exportGardenersCsv : exportDeletionsCsv}
                disabled={loading || (activeTab === 'directory' ? gardeners.length === 0 : deletions.length === 0)}
                title="Export current table to CSV file"
                className="flex items-center gap-1.5 px-3.5 py-2.5 bg-white hover:bg-slate-50 disabled:opacity-50 text-slate-700 rounded-2xl text-xs font-mono font-bold transition-all cursor-pointer shadow-xs border border-slate-200"
              >
                <Download className="w-3.5 h-3.5 text-slate-500" />
                EXPORT_CSV
              </button>

              <button 
                onClick={loadAdminData}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white rounded-2xl text-xs font-mono font-bold transition-all cursor-pointer shadow-xs"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-amber-400' : ''}`} />
                {loading ? 'SYNCING...' : 'RELOAD_DATABASE'}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Error Alert Banner */}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center justify-between gap-4 text-xs font-mono text-rose-700">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
            <span>Failed to sync with Firestore: {error}</span>
          </div>
          <button 
            onClick={loadAdminData}
            className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg cursor-pointer"
          >
            Retry
          </button>
        </div>
      )}

      {/* Overview Analytics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5" id="admin-analytics-grid">
        
        {/* Total Gardeners Card */}
        <div className="bg-white border border-slate-200/70 rounded-3xl p-5 flex items-center gap-4 shadow-xs text-left">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider">Total Gardeners</div>
            <div className="font-display font-black text-2xl text-slate-800 mt-0.5">
              {loading ? (
                <div className="w-12 h-6 bg-slate-100 rounded animate-pulse" />
              ) : totalGardeners}
            </div>
          </div>
        </div>

        {/* Average Streak Days Card */}
        <div className="bg-white border border-slate-200/70 rounded-3xl p-5 flex items-center gap-4 shadow-xs text-left">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider">Average Streak</div>
            <div className="font-display font-black text-2xl text-slate-800 mt-0.5">
              {loading ? (
                <div className="w-16 h-6 bg-slate-100 rounded animate-pulse" />
              ) : `${averageStreak} Days`}
            </div>
          </div>
        </div>

        {/* Highest Streak Days Card */}
        <div className="bg-white border border-slate-200/70 rounded-3xl p-5 flex items-center gap-4 shadow-xs text-left">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-500">
            <Flame className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider">Highest Streak</div>
            <div className="font-display font-black text-2xl text-slate-800 mt-0.5">
              {loading ? (
                <div className="w-16 h-6 bg-slate-100 rounded animate-pulse" />
              ) : `${highestStreak} Days`}
            </div>
          </div>
        </div>

        {/* Total Deletions / Closing Feedbacks */}
        <div className="bg-white border border-slate-200/70 rounded-3xl p-5 flex items-center gap-4 shadow-xs text-left">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-500">
            <Trash2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider">Closing Feedbacks</div>
            <div className="font-display font-black text-2xl text-slate-800 mt-0.5">
              {loading ? (
                <div className="w-12 h-6 bg-slate-100 rounded animate-pulse" />
              ) : totalDeletionsCount}
            </div>
          </div>
        </div>

      </div>

      {/* Main Content Area */}
      {!inspectedUser ? (
        <div className="space-y-6" id="admin-main-view">
          
          {/* Navigation Tabs */}
          <div className="flex border-b border-slate-200">
            <button
              onClick={() => setActiveTab('directory')}
              className={`pb-3 px-6 text-xs font-mono font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
                activeTab === 'directory' 
                  ? 'border-slate-800 text-slate-800' 
                  : 'border-transparent text-slate-400 hover:text-slate-700'
              }`}
            >
              👩‍🌾 Gardeners Directory ({filteredGardeners.length})
            </button>
            <button
              onClick={() => setActiveTab('deletions')}
              className={`pb-3 px-6 text-xs font-mono font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
                activeTab === 'deletions' 
                  ? 'border-slate-800 text-slate-800' 
                  : 'border-transparent text-slate-400 hover:text-slate-700'
              }`}
            >
              💔 Account Closing Reasons ({deletions.length})
            </button>
          </div>

          <AnimatePresence mode="wait">
            {activeTab === 'directory' ? (
              <motion.div 
                key="directory"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-5"
                id="admin-directory-tab"
              >
                {/* Search & Filter Toolbar */}
                <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3">
                  {/* Search Bar */}
                  <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-400">
                      <Search className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search gardeners by name, email, companion name, theme, or UID..."
                      className="w-full bg-white border border-slate-200/80 rounded-2xl pl-11 pr-10 py-3 text-slate-800 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#203d36]/15 focus:border-[#203d36] font-medium shadow-xs text-left"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery('')}
                        className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer p-1"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {/* Sort Controls */}
                  <div className="flex items-center gap-2">
                    <div className="relative inline-flex items-center">
                      <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 absolute left-3 pointer-events-none" />
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as SortOption)}
                        className="bg-white border border-slate-200/80 rounded-2xl pl-8 pr-8 py-3 text-xs font-mono font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#203d36]/15 cursor-pointer appearance-none shadow-xs"
                      >
                        <option value="streak-desc">🔥 Highest Streak</option>
                        <option value="xp-desc">⭐ Most Companion XP</option>
                        <option value="name-asc">🔤 Name (A - Z)</option>
                        <option value="name-desc">🔤 Name (Z - A)</option>
                        <option value="recent">⏱️ Recently Active</option>
                      </select>
                    </div>

                    {/* Companion Filter */}
                    <div className="relative inline-flex items-center">
                      <Filter className="w-3.5 h-3.5 text-slate-400 absolute left-3 pointer-events-none" />
                      <select
                        value={companionFilter}
                        onChange={(e) => setCompanionFilter(e.target.value)}
                        className="bg-white border border-slate-200/80 rounded-2xl pl-8 pr-8 py-3 text-xs font-mono font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#203d36]/15 cursor-pointer appearance-none shadow-xs"
                      >
                        <option value="all">🐾 All Companions</option>
                        <option value="Sproutling">🌱 Sproutling</option>
                        <option value="Sage Pup">🐕 Sage Pup</option>
                        <option value="Lumo">👾 Lumo</option>
                      </select>
                    </div>
                  </div>
                </div>

                {loading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {[1, 2, 3, 4, 5, 6].map((idx) => (
                      <div key={idx} className="bg-white border border-slate-200/60 rounded-3xl p-5 space-y-4 animate-pulse">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-xl bg-slate-100" />
                          <div className="space-y-2 flex-1">
                            <div className="w-24 h-4 bg-slate-100 rounded" />
                            <div className="w-36 h-3 bg-slate-100 rounded" />
                          </div>
                        </div>
                        <div className="h-14 bg-slate-50 rounded-2xl" />
                        <div className="h-8 bg-slate-100 rounded-xl" />
                      </div>
                    ))}
                  </div>
                ) : filteredGardeners.length === 0 ? (
                  <div className="bg-white border border-slate-200/70 rounded-3xl p-16 text-center space-y-3">
                    <Users className="w-10 h-10 text-slate-300 mx-auto" />
                    <h3 className="font-sans font-bold text-slate-700 text-base">No Gardeners Found</h3>
                    <p className="text-slate-400 text-xs max-w-sm mx-auto">
                      No registered digital garden profiles match your active search or filter query.
                    </p>
                    {(searchQuery || companionFilter !== 'all') && (
                      <button
                        onClick={() => { setSearchQuery(''); setCompanionFilter('all'); }}
                        className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-mono font-bold rounded-xl cursor-pointer"
                      >
                        Clear Filters
                      </button>
                    )}
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5" id="gardeners-grid">
                      {paginatedGardeners.map((g) => {
                        const companionLevel = Math.max(1, Math.floor(Math.sqrt((g.companionXp || 120) / 100)));
                        return (
                          <motion.div
                            key={g.uid}
                            whileHover={{ y: -3 }}
                            transition={{ duration: 0.2 }}
                            className="bg-white border border-slate-200/70 rounded-3xl p-5 flex flex-col justify-between shadow-xs hover:shadow-md relative overflow-hidden text-left"
                          >
                            {/* Accent corner banner for themes */}
                            <div className={`absolute top-0 right-0 w-24 h-24 -mr-12 -mt-12 rotate-45 opacity-5 pointer-events-none ${
                              g.theme === 'forest' ? 'bg-emerald-500' :
                              g.theme === 'midnight' ? 'bg-blue-600' :
                              g.theme === 'cyberpunk' ? 'bg-fuchsia-500' :
                              g.theme === 'clay' ? 'bg-amber-600' : 'bg-slate-400'
                            }`} />

                            <div className="space-y-4">
                              {/* Profile details */}
                              <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                                <div className="w-11 h-11 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center overflow-hidden shrink-0">
                                  <AvatarSvg type={g.profilePicture || 'avatar_explorer'} className="w-full h-full" />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <h4 className="font-sans font-extrabold text-slate-800 text-sm truncate leading-snug">
                                    {g.displayName || 'Unnamed Gardener'}
                                  </h4>
                                  <p className="text-[11px] text-slate-400 font-medium truncate">
                                    {g.email || 'No email attached'}
                                  </p>
                                </div>
                              </div>

                              {/* Streak & Active Stats */}
                              <div className="grid grid-cols-2 gap-3.5 bg-slate-50/50 p-2.5 rounded-2xl border border-slate-100/50">
                                <div>
                                  <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-wider block">Garden Streak</span>
                                  <span className="text-xs font-bold text-slate-700 block mt-0.5">🔥 {g.streakDays || 0} Days</span>
                                </div>
                                <div>
                                  <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-wider block">Visual Theme</span>
                                  <span className="text-[10px] font-bold text-slate-600 font-mono block mt-1 uppercase truncate">{g.theme || 'alabaster'}</span>
                                </div>
                              </div>

                              {/* Companion detail summary */}
                              <div className="flex items-center gap-2.5 pt-1">
                                <div className="w-9 h-9 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-base shadow-xs">
                                  {g.companionType === 'Sproutling' ? '🌱' : g.companionType === 'Sage Pup' ? '🐕' : '👾'}
                                </div>
                                <div>
                                  <div className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider leading-none">Mascot Partner</div>
                                  <div className="text-xs font-extrabold text-slate-800 mt-1 block">
                                    {g.companionName} <span className="text-[10px] font-mono text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100/30">LVL {companionLevel}</span>
                                  </div>
                                </div>
                              </div>

                              <p className="text-[11px] text-slate-400 line-clamp-2 italic leading-relaxed pt-1">
                                "{g.bio || 'No bio entered.'}"
                              </p>
                            </div>

                            <div className="pt-4 mt-4 border-t border-slate-100">
                              <button
                                onClick={() => inspectUser(g)}
                                className="w-full flex items-center justify-center gap-1.5 py-2.5 px-3 bg-slate-900 hover:bg-emerald-800 text-white hover:text-[#fdda64] text-xs font-semibold rounded-xl transition-all cursor-pointer font-sans shadow-sm"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                Inspect Garden Space
                              </button>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>

                    {/* Pagination Bar */}
                    {totalPages > 1 && (
                      <div className="flex items-center justify-between border-t border-slate-200/80 pt-4 px-2">
                        <span className="text-xs font-mono text-slate-500">
                          Showing {(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, filteredGardeners.length)} of {filteredGardeners.length} gardeners
                        </span>
                        
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 text-slate-700 cursor-pointer disabled:cursor-not-allowed transition-all"
                            aria-label="Previous page"
                          >
                            <ChevronLeft className="w-4 h-4" />
                          </button>
                          
                          <span className="text-xs font-mono font-bold text-slate-700 px-2">
                            Page {currentPage} of {totalPages}
                          </span>

                          <button
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                            className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 text-slate-700 cursor-pointer disabled:cursor-not-allowed transition-all"
                            aria-label="Next page"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </motion.div>
            ) : (
              <motion.div 
                key="deletions"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
                id="admin-deletions-tab"
              >
                {loading ? (
                  <div className="bg-white border border-slate-100 rounded-3xl p-16 text-center space-y-4">
                    <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin mx-auto" />
                    <p className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
                      Fetching deactivation feedback logs...
                    </p>
                  </div>
                ) : deletions.length === 0 ? (
                  <div className="bg-white border border-slate-200/70 rounded-3xl p-16 text-center space-y-3">
                    <Award className="w-10 h-10 text-emerald-500 mx-auto" />
                    <h3 className="font-sans font-bold text-slate-700 text-base">Zero Account Deletions</h3>
                    <p className="text-slate-400 text-xs max-w-sm mx-auto">
                      All registered gardeners have retained their accounts! No permanent deactivation feedback has been submitted.
                    </p>
                  </div>
                ) : (
                  <div className="bg-white border border-slate-200/80 rounded-3xl overflow-hidden shadow-xs" id="admin-deletions-table">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse font-sans">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-200/80 font-mono text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                            <th className="py-4 px-6">Gardener Email</th>
                            <th className="py-4 px-6">Selected Closing Option</th>
                            <th className="py-4 px-6">Date of Closing</th>
                            <th className="py-4 px-6">Reference UID</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-slate-700 text-xs">
                          {deletions.map((log) => (
                            <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                              <td className="py-4.5 px-6 font-semibold text-slate-800">
                                {log.email}
                              </td>
                              <td className="py-4.5 px-6">
                                <span className="inline-flex px-2.5 py-1.5 rounded-xl bg-rose-50 text-rose-700 font-bold border border-rose-100/40 text-[10px]">
                                  ⚠️ {log.reason}
                                </span>
                              </td>
                              <td className="py-4.5 px-6 font-mono text-[11px] text-slate-400">
                                {new Date(log.timestamp).toLocaleString(undefined, {
                                  dateStyle: 'medium',
                                  timeStyle: 'short'
                                })}
                              </td>
                              <td className="py-4.5 px-6 font-mono text-[10px] text-slate-400 max-w-[140px] truncate" title={log.uid}>
                                <button
                                  onClick={() => handleCopy(log.uid, `del-uid-${log.id}`)}
                                  className="hover:text-slate-700 flex items-center gap-1 cursor-pointer font-mono"
                                >
                                  {log.uid}
                                  {copiedKey === `del-uid-${log.id}` ? (
                                    <CheckCheck className="w-3 h-3 text-emerald-600 inline" />
                                  ) : (
                                    <Copy className="w-3 h-3 opacity-40 hover:opacity-100 inline" />
                                  )}
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ) : (
        /* Inspected Individual User Panel Detail Sub-view */
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-6"
          id="admin-inspection-pane"
        >
          {/* Back button header banner */}
          <div className="flex items-center justify-between border-b border-slate-200/80 pb-4">
            <button
              onClick={() => setInspectedUser(null)}
              className="flex items-center gap-2 py-2 px-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-all cursor-pointer font-sans"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Directory <span className="text-[10px] font-mono text-slate-400">(ESC)</span>
            </button>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">ACTIVE_INSPECTION_MODE</span>
            </div>
          </div>

          {/* Inspected Gardener card */}
          <div className="bg-slate-900 text-slate-200 rounded-[2rem] p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-lg text-left">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center overflow-hidden shrink-0">
                <AvatarSvg type={inspectedUser.profilePicture || 'avatar_explorer'} className="w-full h-full" />
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="font-serif text-2xl font-black text-white tracking-tight leading-none">
                    {inspectedUser.displayName || 'Gardener'}
                  </h2>
                  <span className="text-[10px] font-mono text-[#fdda64] font-bold bg-[#fdda64]/10 border border-[#fdda64]/20 px-2 py-0.5 rounded-full uppercase">
                    Streak: {inspectedUser.streakDays}d
                  </span>
                  <span className="text-[10px] font-mono text-emerald-400 font-bold bg-emerald-400/10 border border-emerald-400/20 px-2 py-0.5 rounded-full uppercase">
                    Theme: {inspectedUser.theme || 'alabaster'}
                  </span>
                </div>
                
                <div className="flex items-center gap-3 text-xs text-slate-400 font-medium flex-wrap">
                  {inspectedUser.email && (
                    <button
                      onClick={() => handleCopy(inspectedUser.email || '', 'inspect-email')}
                      className="hover:text-white flex items-center gap-1 cursor-pointer transition-colors"
                      title="Click to copy email"
                    >
                      <span>{inspectedUser.email}</span>
                      {copiedKey === 'inspect-email' ? <CheckCheck className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 opacity-60" />}
                    </button>
                  )}
                  <span>•</span>
                  <button
                    onClick={() => handleCopy(inspectedUser.uid, 'inspect-uid')}
                    className="hover:text-white flex items-center gap-1 cursor-pointer font-mono text-[10px] bg-slate-800 px-2 py-0.5 rounded transition-colors"
                    title="Click to copy UID"
                  >
                    <span>UID: {inspectedUser.uid}</span>
                    {copiedKey === 'inspect-uid' ? <CheckCheck className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 opacity-60" />}
                  </button>
                </div>

                <p className="text-xs italic text-slate-400 leading-normal max-w-xl">
                  "{inspectedUser.bio || 'No bio entered.'}"
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-slate-800 border border-slate-700/60 rounded-2xl p-4 shrink-0">
              <div className="w-11 h-11 rounded-full bg-slate-900 flex items-center justify-center text-xl shadow-inner">
                {inspectedUser.companionType === 'Sproutling' ? '🌱' : inspectedUser.companionType === 'Sage Pup' ? '🐕' : '👾'}
              </div>
              <div className="min-w-[120px]">
                <div className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-wider leading-none">Companion Bot</div>
                <div className="text-sm font-extrabold text-white mt-1">
                  {inspectedUser.companionName}
                </div>
                <div className="text-[10px] font-medium text-[#fdda64] font-mono mt-0.5 flex items-center gap-1">
                  <Zap className="w-3 h-3" />
                  XP: {inspectedUser.companionXp} (LVL {Math.max(1, Math.floor(Math.sqrt((inspectedUser.companionXp || 120) / 100)))})
                </div>
              </div>
            </div>
          </div>

          {/* Inspected content grid: Privacy Shield vs Activities Feed */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" id="inspection-data-grids">
            
            {/* Seedlings/Notes column (Privacy Enforced) */}
            <div className="space-y-4 text-left">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Lock className="w-4.5 h-4.5 text-slate-500" />
                  <h3 className="font-sans font-bold text-slate-800 text-sm sm:text-base uppercase tracking-wider">
                    Privacy Isolation Shield
                  </h3>
                </div>
                <span className="text-[10px] font-mono text-emerald-600 font-bold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
                  ENCRYPTED & ISOLATED
                </span>
              </div>

              <div className="bg-gradient-to-br from-slate-50 to-slate-100/50 border border-slate-200/80 rounded-[2rem] p-8 text-center space-y-6 relative overflow-hidden shadow-xs">
                <div className="w-16 h-16 bg-white border border-slate-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
                  <Shield className="w-7 h-7 stroke-[2.2]" />
                </div>

                <div className="space-y-2 max-w-sm mx-auto">
                  <h4 className="font-serif text-xl font-bold text-slate-800 tracking-tight">
                    End-User Content Strictly Protected
                  </h4>
                  <p className="text-slate-500 text-xs leading-relaxed font-sans font-medium">
                    To comply with global data protection standards and ensure absolute personal privacy, gardeners' personal seedlings, markdown notes, completed checklists, and digital entries are structurally isolated.
                  </p>
                </div>

                <div className="bg-white/80 border border-slate-100/60 rounded-2xl p-4 text-left space-y-2 max-w-sm mx-auto">
                  <div className="flex items-center gap-2 text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    Zero Administrator Visibility
                  </div>
                  <p className="text-[11px] text-slate-500 leading-normal">
                    Database security rules completely forbid the administrator role from querying document contents or reading raw user text logs. Your gardeners can write in full confidence.
                  </p>
                </div>
              </div>
            </div>

            {/* Activities column */}
            <div className="space-y-4 text-left">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Activity className="w-4.5 h-4.5 text-slate-500" />
                  <h3 className="font-sans font-bold text-slate-800 text-sm sm:text-base uppercase tracking-wider">
                    Recent Activity Logs ({filteredInspectedActivities.length})
                  </h3>
                </div>
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">MAX_50_RECORDS</span>
              </div>

              {/* Activity Search */}
              {inspectedUserActivities.length > 5 && (
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={activitySearchQuery}
                    onChange={(e) => setActivitySearchQuery(e.target.value)}
                    placeholder="Filter activity descriptions..."
                    className="w-full bg-white border border-slate-200/80 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#203d36]/15 font-medium"
                  />
                </div>
              )}

              {loadingInspection ? (
                <div className="bg-white border border-slate-100 rounded-3xl p-12 text-center">
                  <RefreshCw className="w-6 h-6 text-emerald-600 animate-spin mx-auto mb-2" />
                  <span className="text-xs font-mono font-bold text-slate-400">LOADING_METRICS_STREAM...</span>
                </div>
              ) : filteredInspectedActivities.length === 0 ? (
                <div className="bg-white border border-slate-200/70 rounded-3xl p-12 text-center text-slate-400 text-xs space-y-1">
                  <Activity className="w-8 h-8 text-slate-300 mx-auto" />
                  <p className="font-bold">No registered metrics found</p>
                  <p className="text-[11px]">
                    {activitySearchQuery ? 'No activities match your filter query.' : 'No recent activity logs recorded for this gardener.'}
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5 max-h-[460px] overflow-y-auto pr-1.5 custom-scrollbar">
                  {filteredInspectedActivities.map((act) => (
                    <div 
                      key={act.id} 
                      className="bg-white border border-slate-200/60 rounded-2xl p-3.5 flex items-center justify-between gap-4 shadow-xs hover:border-slate-300 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center border border-slate-100 shrink-0 text-emerald-600 font-mono text-[11px] font-bold">
                          +{act.xpGained}
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-slate-800 leading-tight">
                            {act.actionText}
                          </p>
                          <p className="text-[10px] font-mono text-slate-400 mt-0.5">
                            {new Date(act.timestamp).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                      <span className="text-[9px] text-slate-400 font-mono shrink-0 whitespace-nowrap">
                        {new Date(act.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </motion.div>
      )}

    </div>
  );
};

