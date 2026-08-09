import React, { useState, useEffect } from 'react';
import { GardenProvider, useGarden } from './lib/gardenState';
import { LandingView } from './components/LandingView';
import { AuthView } from './components/AuthView';
import { DashboardView } from './components/DashboardView';
import { EditorView } from './components/EditorView';
import { CompanionCenter } from './components/CompanionCenter';
import { FastCapture } from './components/FastCapture';
import { VaultArchive } from './components/VaultArchive';
import { CommandSearch } from './components/CommandSearch';
import { SettingsView, AvatarSvg } from './components/SettingsView';
import { AdminConsoleView } from './components/AdminConsoleView';
import { LegalView } from './components/LegalView';
import { FloatingXpAlerts } from './components/FloatingXpAlerts';
import { EvolutionModal } from './components/EvolutionModal';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sprout, 
  Search, 
  Compass, 
  BookOpen, 
  Settings, 
  Bot, 
  Archive, 
  ShieldAlert, 
  Shield,
  Menu, 
  X, 
  User, 
  Bell, 
  RefreshCw,
  LogOut,
  Signal,
  SignalZero,
  Plus
} from 'lucide-react';

function GardenAppContent() {
  const { 
    profile, 
    isOffline, 
    setOfflineMode, 
    isAuthenticated, 
    userEmail, 
    signOutUser,
    isSyncing,
    updateProfile
  } = useGarden();

  // Navigation and views controlling states
  const [viewState, setViewState] = useState<'landing' | 'auth' | 'app' | 'legal'>('landing');
  const [legalTab, setLegalTab] = useState<'terms' | 'privacy'>('terms');
  const [currentTab, setCurrentTab] = useState<'dashboard' | 'capture' | 'editor' | 'companion' | 'vault' | 'settings' | 'admin'>('dashboard');
  const [editingSeedlingId, setEditingSeedlingId] = useState<string | null>(null);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [showLogoLoader, setShowLogoLoader] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOutUser();
    } catch (e) {
      console.error(e);
    }
    setViewState('landing');
    setCurrentTab('dashboard');
  };

  useEffect(() => {
    if (viewState === 'app') {
      setShowLogoLoader(true);
      const timer = setTimeout(() => {
        setShowLogoLoader(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [viewState]);

  // Name prompting modal for first time users
  const [showNameModal, setShowNameModal] = useState(false);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [tempName, setTempName] = useState('');

  useEffect(() => {
    if (isAuthenticated && profile && (profile.displayName === 'Gardener' || !profile.displayName)) {
      setShowNameModal(true);
    } else {
      setShowNameModal(false);
    }
  }, [isAuthenticated, profile?.displayName]);

  useEffect(() => {
    setIsDeletingAccount(false);
  }, [currentTab]);

  // Command Palette Toggle State
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [initialSearchQuery, setInitialSearchQuery] = useState('');
  
  // Mobile Nav Drawer Toggle State
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Keyboard shortcut listener (ESC triggers search, Shift + S triggers settings)
  useEffect(() => {
    const handleKeys = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && viewState === 'app') {
        setIsSearchOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeys);
    return () => window.removeEventListener('keydown', handleKeys);
  }, [viewState]);

  // Navigate to editor with active note selected
  const handleEditNote = (noteId: string | null) => {
    setEditingSeedlingId(noteId);
    setCurrentTab('editor');
  };

  // Render view controller matching tabs
  const renderTabContent = () => {
    switch (currentTab) {
      case 'capture':
        return <FastCapture onNavigateToEditor={(id) => handleEditNote(id)} />;
      case 'editor':
        return <EditorView activeSeedlingId={editingSeedlingId} onSelectSeedling={setEditingSeedlingId} onBack={() => { setEditingSeedlingId(null); setCurrentTab('dashboard'); }} />;
      case 'companion':
        return <CompanionCenter />;
      case 'vault':
        return <VaultArchive onNavigateToEditor={(id) => handleEditNote(id)} />;
      case 'settings':
        return (
          <SettingsView 
            onNavigateToLanding={() => { setViewState('landing'); setCurrentTab('dashboard'); }} 
            onToggleDeletePage={setIsDeletingAccount}
          />
        );
      case 'admin':
        return <AdminConsoleView />;
      case 'dashboard':
      default:
        return (
          <DashboardView 
            onNavigateToEditor={(id) => handleEditNote(id || null)} 
            onNavigateToCompanion={() => setCurrentTab('companion')}
            onNavigateToCapture={() => setCurrentTab('capture')}
            onNavigateToVault={() => setCurrentTab('vault')}
            onOpenSearch={(query) => {
              setInitialSearchQuery(query || '');
              setIsSearchOpen(true);
            }}
          />
        );
    }
  };

  // Handle CTA transitions
  if (viewState === 'legal') {
    return (
      <LegalView 
        onBack={() => setViewState('landing')} 
        defaultTab={legalTab} 
      />
    );
  }

  if (viewState === 'landing') {
    return (
      <LandingView 
        onStart={() => {
          if (isAuthenticated) {
            setViewState('app');
          } else {
            setViewState('auth');
          }
        }} 
        onNavigateToAuth={() => setViewState('auth')}
        onNavigateToLegal={(tab) => {
          setLegalTab(tab);
          setViewState('legal');
        }}
      />
    );
  }

  if (viewState === 'auth') {
    return (
      <AuthView 
        onBack={() => setViewState('landing')} 
        onGoToWorkspace={() => setViewState('app')}
        onNavigateToLegal={(tab) => {
          setLegalTab(tab);
          setViewState('legal');
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#faf9f6] flex flex-col font-sans transition-all duration-300">
      
      {/* Dynamic Offline notice alert ticker bar */}
      {isOffline && (
        <div className="bg-amber-500 text-slate-950 font-mono text-[11px] font-bold py-2 px-4 shadow-sm text-center flex items-center justify-center gap-2 relative z-50 select-none">
          <SignalZero className="w-4.5 h-4.5 animate-pulse" />
          <span>🔌 GARDEN OFFLINE MODE ACTIVE: Changes are buffered locally and will synchronize automatically when online connection is restored.</span>
        </div>
      )}

      {/* Main Top Header bar */}
      <header className="bg-white border-b border-slate-200/80 px-6 py-4 flex items-center justify-between sticky top-0 z-40 shadow-xs">
        
        {/* Brand identity */}
        <div className="flex items-center gap-3">
          <button 
            onClick={() => {
              if (isAuthenticated) {
                setCurrentTab('dashboard');
                setEditingSeedlingId(null);
              } else {
                setViewState('landing');
              }
            }}
            className="flex items-center gap-2.5 group hover:opacity-90 transition-opacity cursor-pointer text-left"
          >
            <div className="w-10 h-10 bg-[#203d36] rounded-xl flex items-center justify-center shadow-md shadow-[#203d36]/10 group-hover:rotate-12 duration-200">
              <Sprout className="w-5.5 h-5.5 text-[#fdda64]" />
            </div>
            <div>
              <span className="font-display font-bold text-lg text-slate-900 tracking-tight leading-none block">Synapze</span>
            </div>
          </button>
        </div>

        {/* Action badges and controls */}
        <div className="flex items-center gap-4">
          
          {/* Real-time sync spinner */}
          {isSyncing && (
            <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-slate-100 text-slate-500 text-[10px] font-mono font-bold animate-pulse">
              <RefreshCw className="w-3 h-3 animate-spin text-emerald-600" />
              SYNCING_CLOUDS...
            </span>
          )}

          {/* User authenticated block */}
          {isAuthenticated ? (
            <div className="hidden md:flex items-center gap-2">
              <button 
                onClick={() => { setCurrentTab('settings'); setEditingSeedlingId(null); }}
                className="flex items-center gap-2 bg-slate-50 hover:bg-slate-100 border border-slate-200/60 rounded-xl px-3 py-1.5 font-sans text-xs text-slate-700 transition-colors cursor-pointer"
                title="View Profile Settings"
              >
                <div className="w-5 h-5 rounded-full overflow-hidden flex items-center justify-center shrink-0">
                  <AvatarSvg type={profile.profilePicture || 'avatar_explorer'} className="w-full h-full" />
                </div>
                <span className="truncate max-w-[120px] font-semibold text-slate-800">{profile.displayName || userEmail}</span>
              </button>
              <button 
                onClick={handleSignOut}
                className="hover:text-red-500 bg-slate-50 hover:bg-slate-100 border border-slate-200/60 p-2 rounded-xl transition-colors cursor-pointer"
                title="Disconnect node"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setViewState('auth')}
              className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-forest-100 text-forest-800 hover:bg-forest-200 text-[10px] font-mono font-bold transition-all cursor-pointer"
            >
              👤 SECURE SIGN IN
            </button>
          )}

          {/* Burger menu toggler for mobile viewports */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition-colors md:hidden cursor-pointer"
            title="Toggle Menu navigator"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

        </div>

      </header>

      {/* Primary Layout Wrapper */}
      <div className="flex-1 flex min-h-0">
        
        {/* Sidebar Nav: Tablet/Desktop viewport list layout - fixed for layout stability */}
        {!isDeletingAccount && (
          <aside className="w-64 bg-white border-r border-slate-200/80 p-5 space-y-6 hidden md:flex flex-col fixed left-0 top-[73px] bottom-0 z-20 overflow-y-auto custom-scrollbar">
          
          {/* Quick Stats sidebar wrapper */}
          <div className="bg-forest-50 p-4 rounded-2xl border border-forest-100/50 space-y-1">
            <span className="text-[10px] font-mono font-bold text-forest-600 tracking-wider uppercase">ACTIVE ASSISTANT</span>
            <div className="flex items-center gap-2.5 pt-1.5">
              <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center border border-forest-100 text-lg shadow-sm">
                {profile.companionType === 'Sproutling' ? '🌱' : profile.companionType === 'Sage Pup' ? '🐕' : '👾'}
              </div>
              <div className="min-w-0">
                <div className="font-display font-extrabold text-slate-800 text-sm leading-none">{profile.companionName}</div>
                <div className="text-[10px] font-medium text-slate-400 font-mono mt-0.5 uppercase tracking-tight">Active Streak: {profile.streakDays}d</div>
              </div>
            </div>
          </div>

          {/* Navigation Links list */}
          <div className="space-y-1.5 font-mono">
            
            <motion.button
              whileTap={{ scale: 0.97 }}
              whileHover={currentTab === 'dashboard' ? { scale: 1.01 } : { x: 4 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              onClick={() => { setCurrentTab('dashboard'); setEditingSeedlingId(null); }}
              className={`w-full text-left px-4 py-3 rounded-xl text-xs font-semibold uppercase tracking-wider flex items-center gap-3 cursor-pointer transition-colors ${
                currentTab === 'dashboard' 
                  ? 'bg-forest-500 text-white shadow-md shadow-forest-500/10' 
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
              }`}
            >
              <Compass className="w-4 h-4" />
              Gardener Dashboard
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.97 }}
              whileHover={currentTab === 'editor' ? { scale: 1.01 } : { x: 4 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              onClick={() => { setCurrentTab('editor'); }}
              className={`w-full text-left px-4 py-3 rounded-xl text-xs font-semibold uppercase tracking-wider flex items-center gap-3 cursor-pointer transition-colors ${
                currentTab === 'editor' 
                  ? 'bg-forest-500 text-white shadow-md shadow-forest-500/10' 
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              Editor Studio
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.97 }}
              whileHover={currentTab === 'capture' ? { scale: 1.01 } : { x: 4 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              onClick={() => { setCurrentTab('capture'); setEditingSeedlingId(null); }}
              className={`w-full text-left px-4 py-3 rounded-xl text-xs font-semibold uppercase tracking-wider flex items-center gap-3 cursor-pointer transition-colors ${
                currentTab === 'capture' 
                  ? 'bg-forest-500 text-white shadow-md shadow-forest-500/10' 
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
              }`}
            >
              <Sprout className="w-4 h-4" />
              Fast Capture
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.97 }}
              whileHover={currentTab === 'companion' ? { scale: 1.01 } : { x: 4 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              onClick={() => { setCurrentTab('companion'); setEditingSeedlingId(null); }}
              className={`w-full text-left px-4 py-3 rounded-xl text-xs font-semibold uppercase tracking-wider flex items-center gap-3 cursor-pointer transition-colors ${
                currentTab === 'companion' 
                  ? 'bg-forest-500 text-white shadow-md shadow-forest-500/10' 
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
              }`}
            >
              <Bot className="w-4 h-4" />
              Companion Center
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.97 }}
              whileHover={currentTab === 'vault' ? { scale: 1.01 } : { x: 4 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              onClick={() => { setCurrentTab('vault'); setEditingSeedlingId(null); }}
              className={`w-full text-left px-4 py-3 rounded-xl text-xs font-semibold uppercase tracking-wider flex items-center gap-3 cursor-pointer transition-colors ${
                currentTab === 'vault' 
                  ? 'bg-forest-500 text-white shadow-md shadow-forest-500/10' 
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
              }`}
            >
              <Archive className="w-4 h-4" />
              Vault Archive
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.97 }}
              whileHover={currentTab === 'settings' ? { scale: 1.01 } : { x: 4 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              onClick={() => { setCurrentTab('settings'); setEditingSeedlingId(null); }}
              className={`w-full text-left px-4 py-3 rounded-xl text-xs font-semibold uppercase tracking-wider flex items-center gap-3 cursor-pointer transition-colors ${
                currentTab === 'settings' 
                  ? 'bg-forest-500 text-white shadow-md shadow-forest-500/10' 
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
              }`}
            >
              <Settings className="w-4 h-4" />
              Settings
            </motion.button>

            {userEmail === 'uhunomaof@gmail.com' && (
              <motion.button
                whileTap={{ scale: 0.97 }}
                whileHover={currentTab === 'admin' ? { scale: 1.01 } : { x: 4 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                onClick={() => { setCurrentTab('admin'); setEditingSeedlingId(null); }}
                className={`w-full text-left px-4 py-3 rounded-xl text-xs font-semibold uppercase tracking-wider flex items-center gap-3 cursor-pointer transition-colors ${
                  currentTab === 'admin' 
                    ? 'bg-slate-900 text-white shadow-md shadow-slate-900/10' 
                    : 'text-amber-600 hover:bg-slate-50 hover:text-amber-800'
                }`}
              >
                <Shield className="w-4 h-4" />
                Admin Console
              </motion.button>
            )}

          </div>



        </aside>
        )}

        {/* Mobile Navigation overlay slide out */}
        {isMobileMenuOpen && (
          <div 
            className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs z-30 md:hidden animate-fade-in"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <div 
              className="w-64 bg-white h-full p-5 space-y-6 shadow-2xl relative animate-slide-right flex flex-col justify-between"
              onClick={(e) => e.stopPropagation()}
            >
              
              <div className="space-y-6">
                
                {/* Brand label */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <Sprout className="w-5.5 h-5.5 text-forest-500 shrink-0" />
                    <span className="font-display font-extrabold text-sm uppercase tracking-wider text-slate-800 font-mono">Synapze Mobile</span>
                  </div>
                  <button
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer min-h-[44px] flex items-center justify-center"
                    aria-label="Close drawer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Nav Links */}
                <div className="space-y-1 font-mono">
                  {[
                    { id: 'dashboard', val: 'Dashboard', icon: <Compass className="w-4.5 h-4.5" /> },
                    { id: 'editor', val: 'Editor Studio', icon: <BookOpen className="w-4.5 h-4.5" /> },
                    { id: 'capture', val: 'Fast Capture', icon: <Sprout className="w-4.5 h-4.5" /> },
                    { id: 'companion', val: 'Companion Center', icon: <Bot className="w-4.5 h-4.5" /> },
                    { id: 'vault', val: 'Vault Archive', icon: <Archive className="w-4.5 h-4.5" /> },
                    { id: 'settings', val: 'Settings', icon: <Settings className="w-4.5 h-4.5" /> },
                    ...(userEmail === 'uhunomaof@gmail.com' ? [{ id: 'admin', val: 'Admin Console', icon: <Shield className="w-4.5 h-4.5 text-amber-500" /> }] : [])
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => { setCurrentTab(tab.id as any); setEditingSeedlingId(null); setIsMobileMenuOpen(false); }}
                      className={`w-full text-left px-4 py-3 rounded-xl text-xs font-semibold uppercase tracking-wider flex items-center gap-3 cursor-pointer min-h-[44px] ${
                        currentTab === tab.id 
                          ? (tab.id === 'admin' ? 'bg-slate-900 text-white shadow-md' : 'bg-forest-500 text-white shadow-md') 
                          : 'text-slate-500 hover:bg-slate-50'
                      }`}
                    >
                      {tab.icon}
                      {tab.val}
                    </button>
                  ))}
                </div>

              </div>

              {/* Mobile indicators & Sign Out */}
              <div className="space-y-3.5 border-t border-slate-100 pt-4">
                {/* Connection status indicator for mobile */}
                <div className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200/80 bg-slate-50 font-mono text-[10px] select-none text-center">
                  {isOffline ? (
                    <span className="flex items-center gap-1.5 text-amber-600 font-bold">
                      <SignalZero className="w-3.5 h-3.5 animate-pulse text-amber-500" />
                      OFFLINE MODE
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5 text-emerald-600 font-bold">
                      <Signal className="w-3.5 h-3.5 text-emerald-500" />
                      ONLINE MODE
                    </span>
                  )}
                </div>

                {/* Mobile Sign Out Button */}
                {isAuthenticated && (
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      handleSignOut();
                    }}
                    className="w-full py-3 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs rounded-xl transition-all border border-rose-200/60 flex items-center justify-center gap-2 cursor-pointer min-h-[44px]"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                )}

                <div className="text-[10px] text-slate-400 font-mono text-center">
                  active streak {profile.streakDays} days
                </div>
              </div>

            </div>
          </div>
        )}

        {/* Primary central canvas spacer */}
        <main className={`flex-1 overflow-y-auto custom-scrollbar scroll-smooth ${isDeletingAccount ? '' : 'md:ml-64'} ${currentTab === 'editor' ? 'p-0 bg-white' : 'p-6 md:p-8'}`}>
          <AnimatePresence mode="wait">
            <motion.div
              key={currentTab}
              initial={{ opacity: 0, y: 12, filter: 'blur(3px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -12, filter: 'blur(3px)' }}
              transition={{ duration: 0.22, ease: "easeInOut" }}
              className="h-full w-full"
            >
              {renderTabContent()}
            </motion.div>
          </AnimatePresence>
        </main>

      </div>

      {/* Global Command palette dialog modal */}
      {isSearchOpen && (
        <CommandSearch 
          onNavigate={(view) => { setCurrentTab(view); setEditingSeedlingId(null); }} 
          onSelectSeedling={(id) => setEditingSeedlingId(id)}
          initialQuery={initialSearchQuery}
          onClose={() => { setIsSearchOpen(false); setInitialSearchQuery(''); }} 
        />
      )}

      {/* Floating XP Rewards Popups alert stream */}
      <FloatingXpAlerts />

      {/* Full Screen Companion Growth Evolution Ceremony */}
      <EvolutionModal />

      {/* Name Input Modal for New Users */}
      <AnimatePresence>
        {showNameModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-md z-[100] flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              transition={{ type: 'spring', duration: 0.5 }}
              className="bg-white rounded-[2rem] border border-slate-100 shadow-2xl max-w-md w-full p-8 text-center space-y-6"
            >
              <div className="w-16 h-16 bg-emerald-50 text-emerald-800 rounded-2xl flex items-center justify-center mx-auto border border-emerald-100 shadow-inner">
                <User className="w-7 h-7 text-emerald-700" />
              </div>
              
              <div className="space-y-2">
                <h3 className="font-serif text-2xl font-extrabold text-[#203d36] tracking-tight">
                  Welcome, Gardener!
                </h3>
                <p className="text-slate-500 text-sm leading-relaxed">
                  Every great forest starts with a single seedling. Enter your name to customize your digital garden workspace.
                </p>
              </div>

              <form 
                onSubmit={async (e) => {
                  e.preventDefault();
                  const trimmed = tempName.trim();
                  if (trimmed.length < 2) return;
                  try {
                    await updateProfile({ displayName: trimmed });
                    setShowNameModal(false);
                    setShowWelcomeModal(true);
                  } catch (err) {
                    console.error("Failed to update display name:", err);
                  }
                }}
                className="space-y-4"
              >
                <input 
                  type="text" 
                  value={tempName} 
                  onChange={(e) => setTempName(e.target.value)} 
                  placeholder="Your Name" 
                  className="w-full border border-slate-200/80 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent font-medium text-slate-800 bg-slate-50/50" 
                  required 
                  minLength={2} 
                  maxLength={18}
                  autoFocus
                />
                
                <button 
                  type="submit" 
                  className="w-full bg-[#203d36] hover:bg-black text-[#fdda64] font-semibold py-3 px-4 rounded-xl shadow-md transition-all font-mono text-xs uppercase tracking-wider cursor-pointer"
                >
                  Enter Garden Workspace
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Welcome / Registration Complete Modal */}
      <AnimatePresence>
        {showWelcomeModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-md z-[100] flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              transition={{ type: 'spring', duration: 0.5 }}
              className="bg-[#faf9f6] rounded-[2.5rem] border border-[#f0ece1] shadow-2xl max-w-sm w-full p-8 text-center space-y-6 relative overflow-hidden"
            >
              {/* Soft decorative light */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-24 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

              {/* Registration Complete Success Icon: Circle with a check mark */}
              <div className="relative pt-2">
                <svg className="w-24 h-24 mx-auto select-none" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                  {/* Subtle outer glow background */}
                  <circle cx="50" cy="50" r="46" fill="#f0fdf4" />
                  
                  {/* Bold line-art check circle */}
                  <circle cx="50" cy="50" r="38" stroke="#203d36" strokeWidth="5" fill="#bbf7d0" />
                  
                  {/* Precise, stylized hand-crafted checkmark path */}
                  <path 
                    d="M 34 50 L 45 61 L 66 38" 
                    stroke="#203d36" 
                    strokeWidth="6" 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    fill="none"
                  />
                </svg>
              </div>

              {/* Text content */}
              <div className="space-y-3">
                <h3 className="font-serif text-2xl font-black text-[#203d36] tracking-tight">
                  Registration complete!
                </h3>
                <p className="text-[#3c4a42] text-sm leading-relaxed max-w-xs mx-auto font-sans font-medium">
                  Welcome to Synpaze Knowledge Garden. Time to begin your note creation journey
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3.5 pt-2">
                <button 
                  type="button"
                  onClick={() => {
                    setShowWelcomeModal(false);
                    setCurrentTab('settings');
                    setEditingSeedlingId(null);
                  }}
                  className="flex-1 py-3 border border-slate-200/80 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl transition-all cursor-pointer text-center shadow-xs"
                >
                  More settings
                </button>
                <button 
                  type="button"
                  onClick={() => {
                    setShowWelcomeModal(false);
                    setCurrentTab('dashboard');
                    setEditingSeedlingId(null);
                  }}
                  className="flex-1 py-3 bg-[#203d36] hover:bg-black text-white text-xs font-semibold rounded-xl shadow-md transition-all cursor-pointer text-center font-sans"
                >
                  Go to dashboard
                </button>
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cinematic Logo & Brand Name Loading Screen Overlay */}
      <AnimatePresence>
        {showLogoLoader && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ 
              opacity: 0, 
              transition: { duration: 0.5, ease: "easeOut" } 
            }}
            className="fixed inset-0 bg-[#faf9f6] z-[9999] flex flex-col items-center justify-center select-none overflow-hidden"
          >
            {/* Centered Bouncing Logo */}
            <motion.div
              animate={{
                y: [0, -28, 0],
              }}
              transition={{
                duration: 1.0,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="flex items-center justify-center"
            >
              <div className="w-20 h-20 rounded-2xl bg-[#203d36] flex items-center justify-center text-white shadow-xl">
                <Sprout className="w-11 h-11 text-[#fdda64]" />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}

export default function App() {
  return (
    <GardenProvider>
      <GardenAppContent />
    </GardenProvider>
  );
}
