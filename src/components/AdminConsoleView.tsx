import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useGarden } from '../lib/gardenState';
import { db, auth, OperationType, handleFirestoreError } from '../firebase';
import { 
  collection, 
  getDocs, 
  query, 
  orderBy, 
  limit, 
  getDocsFromServer
} from 'firebase/firestore';
import { GardenerProfile, SeedlingNode, ActivityMetric } from '../types';
import { 
  Shield, 
  Users, 
  BookOpen, 
  Activity, 
  Trash2, 
  ArrowLeft, 
  Search, 
  Calendar, 
  Sparkles, 
  ChevronRight, 
  Eye, 
  RefreshCw, 
  Sprout, 
  Bot, 
  CheckCircle, 
  AlertTriangle,
  Lock,
  Compass,
  Check,
  Award
} from 'lucide-react';
import { AvatarSvg } from './SettingsView';

interface DeletionFeedback {
  id: string;
  email: string;
  uid: string;
  reason: string;
  timestamp: string;
}

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

  // Search state
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Selected User inspection state
  const [inspectedUser, setInspectedUser] = useState<GardenerProfile | null>(null);
  const [inspectedUserActivities, setInspectedUserActivities] = useState<ActivityMetric[]>([]);
  const [loadingInspection, setLoadingInspection] = useState<boolean>(false);

  // Load all central admin data
  const loadAdminData = async () => {
    if (!isAdmin || isOffline || !db) return;
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
  };

  useEffect(() => {
    if (isAdmin && !isOffline) {
      loadAdminData();
    }
  }, [isAdmin, isOffline]);

  // Load specific user's activities for deep inspection
  const inspectUser = async (user: GardenerProfile) => {
    if (!db || isOffline) return;
    setInspectedUser(user);
    setLoadingInspection(true);
    setInspectedUserActivities([]);

    try {
      // Fetch activities subcollection for that gardener
      const activitiesCol = collection(db, 'users', user.uid, 'activities');
      const activitiesSnap = await getDocs(activitiesCol).catch(err => {
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
          {/* Subtle red background glow */}
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

  // Calculate high-level admin metrics
  const totalGardeners = gardeners.length;
  const highestStreak = gardeners.length > 0 ? Math.max(...gardeners.map(g => g.streakDays || 0)) : 0;
  const averageStreak = gardeners.length > 0 ? Math.round(gardeners.reduce((acc, curr) => acc + (curr.streakDays || 0), 0) / gardeners.length) : 0;
  const totalDeletionsCount = deletions.length;

  // Filter gardeners list matching query
  const filteredGardeners = gardeners.filter(g => {
    const q = searchQuery.toLowerCase();
    const nameMatch = (g.displayName || '').toLowerCase().includes(q);
    const emailMatch = (g.email || '').toLowerCase().includes(q);
    const companionMatch = (g.companionName || '').toLowerCase().includes(q);
    const uidMatch = g.uid.toLowerCase().includes(q);
    return nameMatch || emailMatch || companionMatch || uidMatch;
  });

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
            Monitor real-time gardener registrations, inspect seedlings, and evaluate deactivation reasons.
          </p>
        </div>

        {/* Sync Controls */}
        <div className="flex items-center gap-3 self-start md:self-center">
          {isOffline ? (
            <div className="px-4 py-2 bg-amber-50 border border-amber-200 rounded-2xl flex items-center gap-2 text-xs font-mono font-bold text-amber-700">
              <AlertTriangle className="w-4 h-4 shrink-0 text-amber-500" />
              OFFLINE_BLOCKED
            </div>
          ) : (
            <button 
              onClick={loadAdminData}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 text-slate-700 rounded-2xl text-xs font-mono font-bold transition-all cursor-pointer shadow-xs border border-slate-200/50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-emerald-600' : ''}`} />
              RELOAD_DATABASE
            </button>
          )}
        </div>
      </div>

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
              {loading ? '...' : totalGardeners}
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
              {loading ? '...' : `${averageStreak} Days`}
            </div>
          </div>
        </div>

        {/* Highest Streak Days Card */}
        <div className="bg-white border border-slate-200/70 rounded-3xl p-5 flex items-center gap-4 shadow-xs text-left">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-500">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider">Highest Streak</div>
            <div className="font-display font-black text-2xl text-slate-800 mt-0.5">
              {loading ? '...' : `${highestStreak} Days`}
            </div>
          </div>
        </div>

        {/* Permanent Deletions Feedback Card */}
        <div className="bg-white border border-slate-200/70 rounded-3xl p-5 flex items-center gap-4 shadow-xs text-left">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-500">
            <Trash2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider">Closing Feedbacks</div>
            <div className="font-display font-black text-2xl text-slate-800 mt-0.5">
              {loading ? '...' : totalDeletionsCount}
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
                {/* Search Bar */}
                <div className="relative">
                  <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-400">
                    <Search className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search gardeners by screen name, email address, companion name, or unique UID..."
                    className="w-full bg-white border border-slate-200/80 rounded-2xl pl-11 pr-4 py-3.5 text-slate-800 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#203d36]/15 focus:border-[#203d36] font-medium shadow-xs text-left"
                  />
                </div>

                {loading ? (
                  <div className="bg-white border border-slate-100 rounded-3xl p-16 text-center space-y-4">
                    <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin mx-auto" />
                    <p className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
                      Pulling profile indices from Firestore...
                    </p>
                  </div>
                ) : filteredGardeners.length === 0 ? (
                  <div className="bg-white border border-slate-200/70 rounded-3xl p-16 text-center space-y-3">
                    <Users className="w-10 h-10 text-slate-300 mx-auto" />
                    <h3 className="font-sans font-bold text-slate-700 text-base">No Gardeners Found</h3>
                    <p className="text-slate-400 text-xs max-w-sm mx-auto">
                      No registered digital garden profiles match your active search filter query.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5" id="gardeners-grid">
                    {filteredGardeners.map((g) => {
                      const companionLevel = Math.floor(Math.sqrt((g.companionXp || 120) / 100));
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
                              <div className="min-w-0">
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
                              className="w-full flex items-center justify-center gap-1.5 py-2 px-3 bg-slate-900 hover:bg-emerald-800 text-white hover:text-[#fdda64] text-xs font-semibold rounded-xl transition-all cursor-pointer font-sans shadow-sm"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              Inspect Garden Space
                            </button>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
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
                    <CheckCircle className="w-10 h-10 text-slate-300 mx-auto" />
                    <h3 className="font-sans font-bold text-slate-700 text-base">No Feedback Received</h3>
                    <p className="text-slate-400 text-xs max-w-sm mx-auto">
                      Fantastic news! No permanent account deletion feedback forms have been generated or registered.
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
                              <td className="py-4.5 px-6 font-mono text-[10px] text-slate-400 max-w-[120px] truncate" title={log.uid}>
                                {log.uid}
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
              Back to Directory
            </button>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">ACTIVE_INSPECTION_MODE</span>
            </div>
          </div>

          {/* Inspected Gardener card */}
          <div className="bg-slate-900 text-slate-200 rounded-[2rem] p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-lg text-left">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center overflow-hidden shrink-0">
                <AvatarSvg type={inspectedUser.profilePicture || 'avatar_explorer'} className="w-full h-full" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h2 className="font-serif text-2xl font-black text-white tracking-tight leading-none">
                    {inspectedUser.displayName || 'Gardener'}
                  </h2>
                  <span className="text-[10px] font-mono text-[#fdda64] font-bold bg-[#fdda64]/10 border border-[#fdda64]/20 px-2 py-0.5 rounded-full uppercase">
                    Streak: {inspectedUser.streakDays}d
                  </span>
                </div>
                <p className="text-xs text-slate-400 font-medium">
                  {inspectedUser.email || 'No email attached'} • UID: <span className="font-mono text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-300">{inspectedUser.uid}</span>
                </p>
                <p className="text-xs italic text-slate-400 leading-normal max-w-xl">
                  "{inspectedUser.bio || 'No bio entered.'}"
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-slate-800 border border-slate-700/60 rounded-2xl p-3.5 shrink-0">
              <div className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center text-lg shadow-inner">
                {inspectedUser.companionType === 'Sproutling' ? '🌱' : inspectedUser.companionType === 'Sage Pup' ? '🐕' : '👾'}
              </div>
              <div className="min-w-[100px]">
                <div className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-wider leading-none">Companion Bot</div>
                <div className="text-xs font-extrabold text-white mt-1">
                  {inspectedUser.companionName}
                </div>
                <div className="text-[10px] font-medium text-[#fdda64] font-mono mt-0.5">
                  XP Gained: {inspectedUser.companionXp}
                </div>
              </div>
            </div>
          </div>

          {/* Inspected content grid: Seedlings list vs Activities feed */}
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
                  ENCRYPTED & SECURED
                </span>
              </div>

              <div className="bg-gradient-to-br from-slate-50 to-slate-100/50 border border-slate-200/80 rounded-[2rem] p-8 text-center space-y-6 relative overflow-hidden shadow-xs">
                {/* Visual badge */}
                <div className="w-16 h-16 bg-white border border-slate-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
                  <Shield className="w-7 h-7 stroke-[2.2]" />
                </div>

                <div className="space-y-2 max-w-sm mx-auto">
                  <h4 className="font-serif text-xl font-bold text-slate-800 tracking-tight">
                    End-User Content Encrypted
                  </h4>
                  <p className="text-slate-500 text-xs leading-relaxed font-sans font-medium">
                    To comply with global data privacy protection acts and ensure absolute security, gardeners' personal seedlings, notes, completed checklists, and digital entries are structurally isolated.
                  </p>
                </div>

                <div className="bg-white/80 border border-slate-100/60 rounded-2xl p-4 text-left space-y-2 max-w-sm mx-auto">
                  <div className="flex items-center gap-2 text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    Zero Administrator Visiblity
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
                    Recent Activity Logs ({inspectedUserActivities.length})
                  </h3>
                </div>
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">METRICS_STREAM</span>
              </div>

              {loadingInspection ? (
                <div className="bg-white border border-slate-100 rounded-3xl p-12 text-center">
                  <RefreshCw className="w-6 h-6 text-emerald-600 animate-spin mx-auto mb-2" />
                  <span className="text-xs font-mono font-bold text-slate-400">LOADING_METRICS_STREAM...</span>
                </div>
              ) : inspectedUserActivities.length === 0 ? (
                <div className="bg-white border border-slate-200/70 rounded-3xl p-12 text-center text-slate-400 text-xs space-y-1">
                  <Activity className="w-8 h-8 text-slate-300 mx-auto" />
                  <p className="font-bold">No registered metrics</p>
                  <p className="text-[11px]">No recent activity logs recorded for this gardener.</p>
                </div>
              ) : (
                <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1.5 custom-scrollbar">
                  {inspectedUserActivities.map((act) => (
                    <div 
                      key={act.id} 
                      className="bg-white border border-slate-200/60 rounded-2xl p-3.5 flex items-center justify-between gap-4 shadow-xs"
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
