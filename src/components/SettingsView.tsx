import React, { useState, useEffect } from 'react';
import { useGarden } from '../lib/gardenState';
import { Save, Bell, RefreshCw, User, Settings, Database, Trash2, Sprout, Bot, ShieldCheck, ShieldAlert, Mail, Check, Sparkles, AlertTriangle, X } from 'lucide-react';
import { DeleteAccountView } from './DeleteAccountView';
import { getFriendlyErrorMessage } from '../lib/errorUtils';

export const AvatarSvg: React.FC<{ 
  type: string; 
  className?: string; 
  status?: 'online' | 'idle' | 'dnd' | 'offline';
}> = ({ type, className = "w-16 h-16", status }) => {
  const renderAvatarContent = () => {
    if (type === 'avatar_retro_badger') {
      return (
        <svg className="w-full h-full bg-[#fcf9f2]" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Main Ivory Background & vintage border */}
          <circle cx="50" cy="50" r="48" fill="#fbf8f3" stroke="#111827" strokeWidth="3"/>
          
          {/* Retro Ears with purple center */}
          <circle cx="20" cy="38" r="12" fill="#111827" stroke="#111827" strokeWidth="2" />
          <circle cx="20" cy="38" r="7" fill="#d6bcfa" />
          <circle cx="48" cy="18" r="10" fill="#111827" stroke="#111827" strokeWidth="2" />
          <circle cx="48" cy="18" r="5" fill="#d6bcfa" />

          {/* Dark Raccoon/Badger head mask background */}
          <path d="M15 48 C15 30 35 24 50 24 C72 24 82 35 84 52 C84 65 72 74 54 74 C34 74 15 65 15 48 Z" fill="#111827" />

          {/* Creamy white face mask front */}
          <path d="M25 58 C20 64 26 76 42 76 C58 76 80 66 80 54 C80 44 68 41 54 44 C40 46 28 52 25 58 Z" fill="#faf6f0" stroke="#111827" strokeWidth="3" />

          {/* Sweet retro big eyes / spectacles */}
          {/* Left Spectacle frame */}
          <circle cx="43" cy="42" r="12" fill="#e9d5ff" stroke="#111827" strokeWidth="3.5" />
          <path d="M37 42 A 6 6 0 0 1 49 42" stroke="#111827" strokeWidth="3" fill="none" />
          <circle cx="43" cy="42" r="2" fill="#111827" />
          {/* Glass Glare */}
          <path d="M36 38 L41 33" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />

          {/* Right Spectacle frame */}
          <circle cx="64" cy="45" r="11" fill="#e9d5ff" stroke="#111827" strokeWidth="3.5" />
          <path d="M58 45 A 6 6 0 0 1 70 45" stroke="#111827" strokeWidth="3" fill="none" />
          <circle cx="64" cy="45" r="2" fill="#111827" />
          {/* Glass Glare */}
          <path d="M58 41 L62 37" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />

          {/* Spectacle bridge link */}
          <path d="M51 42 Q54 40 57 43" stroke="#111827" strokeWidth="3" fill="none" strokeLinecap="round" />

          {/* Round Cheeky Nose */}
          <path d="M74 48 C78 48 83 50 83 54 C83 58 78 60 74 60 C70 60 69 48 74 48 Z" fill="#111827" />
          <circle cx="73" cy="51" r="2" fill="#ffffff" />

          {/* Giant wide 1930s laughing mouth */}
          <path d="M40 64 C40 76 48 84 62 80 C70 77 74 68 72 61 C58 58 46 59 40 64 Z" fill="#111827" stroke="#111827" strokeWidth="1" />
          {/* Tongue */}
          <path d="M46 75 C50 69 62 67 67 73 C63 80 52 80 46 75 Z" fill="#f07167" />
          {/* White single tooth block */}
          <path d="M42 63 H63 V66 C55 68 46 66 42 63 Z" fill="#ffffff" />

          {/* Pink cheek circles */}
          <circle cx="31" cy="56" r="4.5" fill="#f472b6" opacity="0.8" />

          {/* Three orange sparks/lines bottom right */}
          <path d="M79 68 L86 65" stroke="#f97316" strokeWidth="3" strokeLinecap="round" />
          <path d="M80 75 L88 75" stroke="#f97316" strokeWidth="3" strokeLinecap="round" />
          <path d="M77 81 L83 87" stroke="#f97316" strokeWidth="3" strokeLinecap="round" />
        </svg>
      );
    }
    if (type === 'avatar_retro_bun') {
      return (
        <svg className="w-full h-full bg-[#f97316]" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Vintage solid orange-peach textured circle */}
          <circle cx="50" cy="50" r="48" fill="#f97316" stroke="#111827" strokeWidth="3"/>

          {/* Main happy Bun / dumpling body */}
          <path d="M50 25 C26 25 22 40 22 61 C22 76 34 85 50 85 C66 85 78 76 78 61 C78 40 74 25 50 25 Z" fill="#faf8f4" stroke="#111827" strokeWidth="3.5" />

          {/* Red/Peach neck scarf bandana base */}
          <path d="M22 72 C18 76 22 81 34 83 C50 85 66 83 74 81 C78 78 76 74 74 72" fill="#f07167" stroke="#111827" strokeWidth="3.5" />
          {/* Purple drop tie */}
          <path d="M38 72 L50 86 L62 72 Z" fill="#c084fc" stroke="#111827" strokeWidth="3" />

          {/* Lavender purple baseball cap / beret */}
          <path d="M42 27 C40 16 54 12 68 18 Q60 24 48 26 Z" fill="#c084fc" stroke="#111827" strokeWidth="3" />
          <circle cx="55" cy="18" r="9" fill="#faf8f4" stroke="#111827" strokeWidth="3" />
          {/* Tiny cap button */}
          <circle cx="56" cy="9" r="2.5" fill="#f97316" stroke="#111827" strokeWidth="1.5" />

          {/* Friendly happy closed crescent eyes */}
          <path d="M34 49 Q40 41 46 49" stroke="#111827" strokeWidth="3.5" strokeLinecap="round" fill="none" />
          <path d="M54 49 Q60 41 66 49" stroke="#111827" strokeWidth="3.5" strokeLinecap="round" fill="none" />
          {/* Cute eyebrows */}
          <path d="M35 41 Q40 37 43 42" stroke="#111827" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          <path d="M55 41 Q60 37 63 42" stroke="#111827" strokeWidth="2.5" strokeLinecap="round" fill="none" />

          {/* Tiny round nose */}
          <circle cx="50" cy="54" r="3" fill="none" stroke="#111827" strokeWidth="3" />

          {/* Shy cheerful retro smile */}
          <path d="M42 61 Q50 69 58 61" stroke="#111827" strokeWidth="3.5" strokeLinecap="round" fill="none" />
          {/* Smile tick */}
          <path d="M57 60 Q59 58 59 61" stroke="#111827" strokeWidth="3" fill="none" />

          {/* Sprinkles on cheeks */}
          <path d="M26 51 L30 49" stroke="#f97316" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M74 53 L70 55" stroke="#f97316" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M28 62 L32 64" stroke="#f97316" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M72 63 L68 61" stroke="#f97316" strokeWidth="2.5" strokeLinecap="round" />

          {/* Retro white sparks popping on the left */}
          <path d="M15 38 L8 34" stroke="#ffffff" strokeWidth="3.5" strokeLinecap="round" />
          <path d="M11 48 L4 48" stroke="#ffffff" strokeWidth="3.5" strokeLinecap="round" />
          <path d="M14 58 L7 62" stroke="#ffffff" strokeWidth="3.5" strokeLinecap="round" />
        </svg>
      );
    }
    if (type === 'avatar_retro_flower') {
      return (
        <svg className="w-full h-full bg-[#f3e8ff]" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Soft lavender background & dark border */}
          <circle cx="50" cy="50" r="48" fill="#f3e8ff" stroke="#111827" strokeWidth="3"/>

          {/* 1930s style flower petals */}
          <g stroke="#111827" strokeWidth="3" fill="#ffffff">
            <circle cx="50" cy="22" r="10" />
            <circle cx="50" cy="78" r="10" />
            <circle cx="22" cy="50" r="10" />
            <circle cx="78" cy="50" r="10" />
            <circle cx="30" cy="30" r="10" />
            <circle cx="70" cy="30" r="10" />
            <circle cx="30" cy="70" r="10" />
            <circle cx="70" cy="70" r="10" />
          </g>

          {/* Main happy orange flower face */}
          <circle cx="50" cy="50" r="23" fill="#fed7aa" stroke="#111827" strokeWidth="3.5" />

          {/* Playful pie-cut retro eyes */}
          {/* Left Eye */}
          <path d="M38 48 C38 41 44 41 44 48 C44 51 38 51 38 48 Z" fill="#111827" />
          {/* Right Eye - cute wink shape */}
          <path d="M56 46 Q60 51 64 46" stroke="#111827" strokeWidth="3.5" strokeLinecap="round" fill="none" />

          {/* Sweet blush circles */}
          <circle cx="34" cy="53" r="3" fill="#f472b6" />
          <circle cx="66" cy="53" r="3" fill="#f472b6" />

          {/* Cheeky open smile */}
          <path d="M43 55 Q50 63 57 55" stroke="#111827" strokeWidth="3" strokeLinecap="round" fill="none" />

          {/* Retro plant sprout on head */}
          <path d="M50 24 Q46 14 50 6 Q54 14 50 24" fill="#4ade80" stroke="#111827" strokeWidth="2" />
        </svg>
      );
    }
    if (type === 'avatar_retro_shroom') {
      return (
        <svg className="w-full h-full bg-[#e0f2fe]" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Cool retro blue backdrop */}
          <circle cx="50" cy="50" r="48" fill="#e0f2fe" stroke="#111827" strokeWidth="3"/>

          {/* Mushroom stem */}
          <path d="M36 48 L38 80 C38 84 62 84 62 80 L64 48 Z" fill="#faf6f0" stroke="#111827" strokeWidth="3.5" />

          {/* Lavender purple Cap */}
          <path d="M18 50 C18 18 82 18 82 50 Q50 47 18 50 Z" fill="#c084fc" stroke="#111827" strokeWidth="3.5" />

          {/* Spots on Cap */}
          <circle cx="34" cy="32" r="5" fill="#faf6f0" />
          <circle cx="50" cy="26" r="6" fill="#faf6f0" />
          <circle cx="66" cy="34" r="5" fill="#faf6f0" />

          {/* Pie-eyes with highlight wedge */}
          {/* Left Eye */}
          <circle cx="44" cy="60" r="4.5" fill="#111827" />
          <path d="M44 60 L47 57" stroke="#ffffff" strokeWidth="1.5" />
          {/* Right Eye */}
          <circle cx="56" cy="60" r="4.5" fill="#111827" />
          <path d="M56 60 L59 57" stroke="#ffffff" strokeWidth="1.5" />

          {/* Cheek rosy dots */}
          <circle cx="38" cy="65" r="2.5" fill="#f472b6" />
          <circle cx="62" cy="65" r="2.5" fill="#f472b6" />

          {/* Wide cute open smile */}
          <path d="M46 64 C46 72 54 72 54 64" stroke="#111827" strokeWidth="3" strokeLinecap="round" fill="none" />

          {/* Tiny leaf sprig sprouting on stem */}
          <path d="M32 74 Q24 72 28 66 Q32 70 32 74" fill="#4ade80" stroke="#111827" strokeWidth="1.5" />
        </svg>
      );
    }
    if (type === 'avatar_wumpus') {
      return (
        <svg className="w-full h-full" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="50" cy="50" r="48" fill="#5865F2" stroke="#7983f5" strokeWidth="2"/>
          <path d="M50 25 C32 25 28 35 28 50 C28 65 32 75 50 75 C68 75 72 65 72 50 C72 35 68 25 50 25 Z" fill="#6bc0d8" />
          <path d="M30 30 Q22 20 28 15 Q34 20 32 28 Z" fill="#fbd38d" />
          <path d="M70 30 Q78 20 72 15 Q66 20 68 28 Z" fill="#fbd38d" />
          <circle cx="42" cy="45" r="5" fill="#1a202c" />
          <circle cx="40" cy="43" r="1.5" fill="#ffffff" />
          <circle cx="58" cy="45" r="5" fill="#1a202c" />
          <circle cx="56" cy="43" r="1.5" fill="#ffffff" />
          <path d="M46 54 Q50 50 54 54 Q50 58 46 54" fill="#319795" />
          <path d="M30 28 C30 28 38 18 50 18 C62 18 70 28 70 28 L74 31 L26 31 Z" fill="#ddaf77" />
          <path d="M36 28 C36 28 42 20 50 20 C58 20 64 28 64 28" stroke="#c05621" strokeWidth="2" />
          <path d="M50 18 Q50 10 54 12" stroke="#48bb78" strokeWidth="3" strokeLinecap="round" />
          <path d="M50 14 Q46 12 50 18" stroke="#48bb78" strokeWidth="3" strokeLinecap="round" />
        </svg>
      );
    }
    if (type === 'avatar_clyde') {
      return (
        <svg className="w-full h-full" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="50" cy="50" r="48" fill="#5865F2" stroke="#7983f5" strokeWidth="2"/>
          <path d="M26 40 C26 34 32 30 50 30 C68 30 74 34 74 40 C74 46 72 62 72 64 C70 68 64 70 50 70 C36 70 30 68 28 64 C28 62 26 46 26 40 Z" fill="#ffffff" />
          <path d="M26 44 L18 52 C16 54 18 58 22 56 L28 52 Z" fill="#ffffff" />
          <path d="M74 44 L82 52 C84 54 82 58 78 56 L72 52 Z" fill="#ffffff" />
          <circle cx="40" cy="48" r="6" fill="#5865F2" />
          <circle cx="60" cy="48" r="6" fill="#5865F2" />
          <path d="M46 58 Q50 62 54 58" stroke="#5865F2" strokeWidth="3" strokeLinecap="round" />
          <path d="M30 35 Q40 31 50 35 Q60 31 70 35" stroke="#48bb78" strokeWidth="3" fill="none" />
          <circle cx="38" cy="31" r="3" fill="#48bb78" />
          <circle cx="50" cy="30" r="3.5" fill="#f6e05e" />
          <circle cx="62" cy="31" r="3" fill="#48bb78" />
        </svg>
      );
    }
    if (type === 'avatar_explorer') {
      return (
        <svg className="w-full h-full" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="50" cy="50" r="48" fill="#e2ede8" stroke="#bddecb" strokeWidth="2"/>
          <path d="M50 20 C42 20 38 28 38 35 C38 42 42 48 50 48 C58 48 62 42 62 35 C62 28 58 20 50 20 Z" fill="#2d5a44" />
          <path d="M25 80 C25 65 35 56 50 56 C65 56 75 65 75 80" stroke="#2d5a44" strokeWidth="6" strokeLinecap="round" />
          <circle cx="50" cy="35" r="4" fill="#fdda64" />
        </svg>
      );
    }
    if (type === 'avatar_sprout') {
      return (
        <svg className="w-full h-full" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="50" cy="50" r="48" fill="#fdf2e9" stroke="#f5d6be" strokeWidth="2"/>
          <circle cx="50" cy="38" r="16" fill="#dd6b20" />
          <path d="M24 78 C24 64 34 54 50 54 C66 54 76 64 76 78" stroke="#dd6b20" strokeWidth="6" strokeLinecap="round" />
          <path d="M46 22 Q50 14 54 22" stroke="#48bb78" strokeWidth="3" strokeLinecap="round" />
          <path d="M50 18 Q56 16 52 24" stroke="#48bb78" strokeWidth="3" strokeLinecap="round" />
        </svg>
      );
    }
    if (type === 'avatar_scholar') {
      return (
        <svg className="w-full h-full" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="50" cy="50" r="48" fill="#f3f0ff" stroke="#ded8fc" strokeWidth="2"/>
          <circle cx="50" cy="38" r="16" fill="#6b46c1" />
          <path d="M24 78 C24 64 34 54 50 54 C66 54 76 64 76 78" stroke="#6b46c1" strokeWidth="6" strokeLinecap="round" />
          <circle cx="43" cy="38" r="5" stroke="#fff" strokeWidth="2.5" />
          <circle cx="57" cy="38" r="5" stroke="#fff" strokeWidth="2.5" />
          <path d="M46 38 L54 38" stroke="#fff" strokeWidth="2" />
        </svg>
      );
    }
    // Default: Spore Scout
    return (
      <svg className="w-full h-full" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="50" r="48" fill="#fefaf0" stroke="#fbe7c6" strokeWidth="2"/>
        <path d="M50 12 L64 26 L50 40 L36 26 Z" fill="#b7791f" />
        <path d="M25 80 C25 66 35 56 50 56 C65 56 75 66 75 80" stroke="#b7791f" strokeWidth="6" strokeLinecap="round" />
      </svg>
    );
  };

  const isLarge = className.includes('w-20') || className.includes('w-24');
  const isSmall = className.includes('w-12') || className.includes('w-10');
  const badgeSize = isLarge ? 'w-6 h-6' : isSmall ? 'w-4 h-4' : 'w-5 h-5';

  const renderStatusBadge = () => {
    if (!status) return null;
    if (status === 'online') {
      return (
        <svg className={`${badgeSize} absolute -bottom-0.5 -right-0.5 filter drop-shadow-[0_1px_1px_rgba(0,0,0,0.15)]`} viewBox="0 0 16 16" fill="none">
          <circle cx="8" cy="8" r="7.5" fill="white" />
          <circle cx="8" cy="8" r="5.5" fill="#23a55a" />
        </svg>
      );
    }
    if (status === 'idle') {
      return (
        <svg className={`${badgeSize} absolute -bottom-0.5 -right-0.5 filter drop-shadow-[0_1px_1px_rgba(0,0,0,0.15)]`} viewBox="0 0 16 16" fill="none">
          <circle cx="8" cy="8" r="7.5" fill="white" />
          <path d="M11 9.5 C10.5 11.5 8.5 12.5 6.5 12 C4.5 11.5 3.5 9.5 4 7.5 C4.5 5.5 6.5 4.5 8.5 5 C7.5 6 7.5 8 8.5 9 C9.5 10 11 10 11 9.5 Z" fill="#faa81a" />
        </svg>
      );
    }
    if (status === 'dnd') {
      return (
        <svg className={`${badgeSize} absolute -bottom-0.5 -right-0.5 filter drop-shadow-[0_1px_1px_rgba(0,0,0,0.15)]`} viewBox="0 0 16 16" fill="none">
          <circle cx="8" cy="8" r="7.5" fill="white" />
          <circle cx="8" cy="8" r="5.5" fill="#f23f43" />
          <rect x="4.5" y="7" width="7" height="2" rx="0.5" fill="white" />
        </svg>
      );
    }
    if (status === 'offline') {
      return (
        <svg className={`${badgeSize} absolute -bottom-0.5 -right-0.5 filter drop-shadow-[0_1px_1px_rgba(0,0,0,0.15)]`} viewBox="0 0 16 16" fill="none">
          <circle cx="8" cy="8" r="7.5" fill="white" />
          <circle cx="8" cy="8" r="5.5" fill="#747f8d" />
          <circle cx="8" cy="8" r="2.5" fill="white" />
        </svg>
      );
    }
    return null;
  };

  // Extract size classes or default to w-16 h-16
  const sizeClasses = className.match(/(w-\d+|h-\d+|w-\[.*?\]|h-\[.*?\])/g)?.join(' ') || 'w-16 h-16';
  const cleanedClassName = className.replace(/(w-\d+|h-\d+|w-\[.*?\]|h-\[.*?\])/g, '').trim();

  return (
    <div className={`relative inline-block ${sizeClasses} ${cleanedClassName}`}>
      <div className="w-full h-full overflow-hidden transition-all duration-300 rounded-full hover:rounded-[32%] hover:scale-105 active:scale-95 shadow-md border border-slate-200/50 hover:shadow-lg bg-white">
        {renderAvatarContent()}
      </div>
      {renderStatusBadge()}
    </div>
  );
};

interface SettingsViewProps {
  onNavigateToLanding?: () => void;
  onToggleDeletePage?: (active: boolean) => void;
  initialShowDelete?: boolean;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ onNavigateToLanding, onToggleDeletePage, initialShowDelete }) => {
  const { 
    profile, 
    updateProfile, 
    triggerPushNotification,
    clearLocalCache, 
    firebaseActive, 
    isOffline, 
    setOfflineMode,
    signOutUser,
    seedlings,
    deleteSeedling,
    deactivateAccount,
    deleteAccount,
    sendRecoveryOtp,
    userEmail
  } = useGarden();

  // Settings State Form
  const [displayName, setDisplayName] = useState(profile.displayName);
  const [bio, setBio] = useState(profile.bio);
  const [companionName, setCompanionName] = useState(profile.companionName?.toUpperCase() || 'SPROUTY');
  const [companionType, setCompanionType] = useState(profile.companionType);
  const [profilePicture, setProfilePicture] = useState(profile.profilePicture || 'avatar_explorer');

  // New subpage view state
  const [showDeleteAccountPage, setShowDeleteAccountPage] = useState(initialShowDelete || false);

  useEffect(() => {
    setShowDeleteAccountPage(!!initialShowDelete);
  }, [initialShowDelete]);

  // Interactive UI States
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'error'>('saved');

  // OTP states for recovery inside deactivate / delete modal
  const [otpSent, setOtpSent] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpMessage, setOtpMessage] = useState('');

  // Verification & Password Modals State
  const [showVerifyModal, setShowVerifyModal] = useState<'deactivate' | 'delete' | null>(null);
  const [verifyPasswordInput, setVerifyPasswordInput] = useState('');
  const [verifyError, setVerifyError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [showWipeConfirm, setShowWipeConfirm] = useState(false);

  // Prevent body scrolling when a modal overlay is active
  useEffect(() => {
    if (showVerifyModal || showWipeConfirm) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [showVerifyModal, showWipeConfirm]);

  useEffect(() => {
    if (onToggleDeletePage) {
      onToggleDeletePage(showDeleteAccountPage);
    }
  }, [showDeleteAccountPage, onToggleDeletePage]);

  // Auto-save debounced sync
  const isInitialMount = React.useRef(true);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    setSaveStatus('saving');
    const delayDebounceFn = setTimeout(() => {
      updateProfile({
        displayName,
        bio,
        companionName: companionName.trim().toUpperCase(),
        companionType,
        profilePicture
      })
      .then(() => {
        setSaveStatus('saved');
      })
      .catch((err) => {
        console.error("Profile auto-save error:", err);
        setSaveStatus('error');
      });
    }, 600); // 600ms debounce

    return () => clearTimeout(delayDebounceFn);
  }, [displayName, bio, companionName, companionType, profilePicture]);

  const handlePruneCache = () => {
    setShowWipeConfirm(true);
  };

  const handleDeactivateAccount = () => {
    setShowDeleteAccountPage(true);
  };

  const handleDeleteAccount = () => {
    setShowDeleteAccountPage(true);
  };

  const handleRequestOtp = async () => {
    if (!userEmail) {
      setVerifyError('Your account email is missing or unresolved.');
      return;
    }
    setOtpLoading(true);
    setVerifyError('');
    try {
      const res = await sendRecoveryOtp(userEmail);
      if (res.success) {
        setOtpSent(true);
        setOtpMessage(`A secure verification OTP has been sent to ${userEmail}. Please look for the incoming OTP notification in your workspace.`);
      } else {
        setVerifyError(res.message);
      }
    } catch (err: any) {
      setVerifyError(getFriendlyErrorMessage(err));
    } finally {
      setOtpLoading(false);
    }
  };

  const handleConfirmVerification = async () => {
    if (!verifyPasswordInput.trim()) {
      setVerifyError('Verification password or OTP code is required.');
      return;
    }

    setIsVerifying(true);
    setVerifyError('');

    try {
      if (showVerifyModal === 'deactivate') {
        const res = await deactivateAccount(verifyPasswordInput);
        if (res.success) {
          setShowVerifyModal(null);
          setOtpSent(false);
          setOtpMessage('');
          triggerPushNotification('Profile Deactivated', res.message, 'system');
        } else {
          setVerifyError(res.message);
        }
      } else if (showVerifyModal === 'delete') {
        const res = await deleteAccount(verifyPasswordInput);
        if (res.success) {
          setShowVerifyModal(null);
          setOtpSent(false);
          setOtpMessage('');
          triggerPushNotification('Account Composted', res.message, 'system');
        } else {
          setVerifyError(res.message);
        }
      }
    } catch (err: any) {
      setVerifyError(getFriendlyErrorMessage(err));
    } finally {
      setIsVerifying(false);
    }
  };

  const avatarsList = [
    { id: 'avatar_retro_badger', name: 'Retro Badger' },
    { id: 'avatar_retro_bun', name: 'Retro Sprout Bun' },
    { id: 'avatar_retro_flower', name: 'Retro Blossom' },
    { id: 'avatar_retro_shroom', name: 'Retro Funky Fungi' },
    { id: 'avatar_explorer', name: 'Alabaster Botanist' },
    { id: 'avatar_sprout', name: 'Orchid Sower' },
    { id: 'avatar_scholar', name: 'Bramble Scholar' },
    { id: 'avatar_spore', name: 'Spore Scout' }
  ];

  if (showDeleteAccountPage) {
    return (
      <DeleteAccountView
        profile={{
          displayName,
          profilePicture,
          companionName,
          companionType,
          streakDays: profile.streakDays || 0
        }}
        onBack={() => {
          if (window.history.length > 1) {
            window.history.back();
          } else {
            setShowDeleteAccountPage(false);
          }
        }}
        deleteAccount={deleteAccount}
        isOffline={isOffline}
        firebaseActive={firebaseActive}
        userEmail={userEmail}
        sendRecoveryOtp={sendRecoveryOtp}
        triggerPushNotification={triggerPushNotification}
        onNavigateToLanding={onNavigateToLanding}
      />
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in text-slate-800 scroll-smooth" id="settings-view-container">
      
      {/* Settings Header */}
      <div className="bg-[#203d36] border border-[#203d36]/30 rounded-2xl p-6 md:p-8 shadow-xs flex items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-1">
          <h1 className="font-display text-2xl font-bold text-white tracking-tight">Profile Settings</h1>
          <p className="text-emerald-100/80 text-sm">Personalize your gardener identity, partner companion, and device alerts.</p>
        </div>
        <Settings className="w-10 h-10 text-white/25 shrink-0 hidden sm:block" />
      </div>

      <div className="space-y-6">
        
        {/* Row 1: Profile details options */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-6">
          <h3 className="font-display font-semibold text-base text-slate-800 flex items-center gap-2 pb-3 border-b border-slate-100 uppercase tracking-wider font-mono">
            <User className="w-4 h-4 text-forest-500" />
            Gardener Identity Profile
          </h3>

          <div className="flex flex-col md:flex-row gap-6 items-center md:items-start pb-2">
            {/* Clickable Profile Avatar */}
            <div className="flex flex-col items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setShowAvatarPicker(!showAvatarPicker)}
                className="group relative flex flex-col items-center justify-center p-1 bg-white hover:bg-slate-50 border-2 border-slate-200 hover:border-forest-400 rounded-full cursor-pointer transition-all focus:outline-hidden hover:scale-105"
                title="Click to choose a different avatar design"
              >
                <div className="w-24 h-24 rounded-full overflow-hidden">
                  <AvatarSvg type={profilePicture} className="w-full h-full" />
                </div>
                <div className="absolute -bottom-1 bg-slate-900 text-white text-[9px] px-2 py-0.5 rounded-full font-mono font-bold uppercase tracking-wider scale-90 group-hover:bg-forest-600 transition-colors">
                  Choose Design
                </div>
              </button>
              <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest mt-1">TAP AVATAR</span>
            </div>

            <div className="flex-1 space-y-4 w-full">
              {/* Display Name Input */}
              <div className="space-y-2 text-left">
                <label className="text-xs font-mono font-bold text-slate-400 block tracking-wider uppercase">Gardener Name Selection</label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="e.g. Master Sprout"
                  className="w-full bg-slate-50 border border-slate-200 text-base md:text-sm px-4 py-3.5 rounded-xl focus:outline-none focus:border-forest-500 text-slate-800 placeholder-slate-400 transition-colors focus:bg-white text-left font-medium min-h-[48px]"
                  required
                />
              </div>

              {/* Bio input */}
              <div className="space-y-2 text-left">
                <label className="text-xs font-mono font-bold text-slate-400 block tracking-wider uppercase">Gardener Bio / Manifesto</label>
                <input
                  type="text"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Intentional learning enthusiast..."
                  className="w-full bg-slate-50 border border-slate-200 text-base md:text-sm px-4 py-3.5 rounded-xl focus:outline-none focus:border-forest-500 text-slate-800 placeholder-slate-400 transition-colors focus:bg-white text-left font-medium min-h-[48px]"
                />
              </div>

              {/* Registered email as GARDENER EMAIL */}
              <div className="space-y-2 text-left">
                <label className="text-xs font-mono font-bold text-slate-400 block tracking-wider uppercase">Gardener Email</label>
                <div className="flex items-center gap-2.5 w-full bg-slate-50 border border-slate-200 text-sm px-4 py-3.5 rounded-xl text-slate-600 select-all font-sans">
                  <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                  <span className="font-mono text-xs text-slate-700 truncate">{userEmail || 'gardener@example.com'}</span>
                  {/* Desktop Label */}
                  <span className="ml-auto hidden sm:inline-block text-[9px] font-mono font-bold text-[#203d36] bg-emerald-50 border border-emerald-100/50 px-2 py-0.5 rounded-md uppercase tracking-wider whitespace-nowrap">
                    REGISTERED
                  </span>
                  {/* Mobile Label (Circle with check) */}
                  <span className="ml-auto sm:hidden flex items-center justify-center w-5 h-5 rounded-full bg-emerald-50 border border-emerald-200 text-[#203d36] shrink-0" title="Registered">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Conditional Dropdown list of character design avatars */}
          {showAvatarPicker && (
            <div className="space-y-3 text-left border-t border-slate-100 pt-5 animate-fade-in">
              <div className="flex items-center justify-between">
                <label className="text-xs font-mono font-bold text-slate-500 block tracking-wider uppercase">Select Character Design Avatar</label>
                <button 
                  type="button" 
                  onClick={() => setShowAvatarPicker(false)}
                  className="text-xs text-forest-600 hover:text-forest-700 font-mono font-bold"
                >
                  [CLOSE PICKER]
                </button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-3">
                {avatarsList.map((av) => (
                  <div 
                    key={av.id}
                    onClick={() => {
                      setProfilePicture(av.id);
                      setShowAvatarPicker(false);
                    }}
                    className={`p-3 border rounded-2xl cursor-pointer text-center space-y-2 select-none transition-all hover:scale-102 ${
                      profilePicture === av.id ? 'bg-forest-50/60 border-forest-300 shadow-xs ring-1 ring-forest-400' : 'border-slate-200 bg-slate-5/20 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex justify-center">
                      <AvatarSvg type={av.id} className="w-12 h-12" />
                    </div>
                    <div className="text-[10px] font-bold text-slate-700 leading-tight truncate">{av.name}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Row 2: Mascot Choice */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-6">
          <h3 className="font-display font-semibold text-base text-slate-800 flex items-center gap-2 pb-3 border-b border-slate-100 uppercase tracking-wider font-mono">
            <Bot className="w-4 h-4 text-forest-500" />
            Mascot Botanist Selection
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Sproutling option */}
            <div 
              onClick={() => { setCompanionType('Sproutling'); }}
              className={`p-4 border rounded-2xl cursor-pointer text-center space-y-2.5 select-none transition-all ${
                companionType === 'Sproutling' ? 'bg-forest-50/60 border-forest-300 shadow-sm' : 'border-slate-100 bg-slate-50/40 hover:bg-slate-50'
              }`}
            >
              <span className="text-4xl block leading-none">🌱</span>
              <div className="text-sm font-bold text-slate-800">Sproutling Botanist</div>
              <p className="text-[10px] text-slate-500 leading-normal">Optimized for daily task care and checklist pruning assistance.</p>
            </div>

            {/* Sage Pup option */}
            <div 
              onClick={() => { setCompanionType('Sage Pup'); }}
              className={`p-4 border rounded-2xl cursor-pointer text-center space-y-2.5 select-none transition-all ${
                companionType === 'Sage Pup' ? 'bg-forest-50/60 border-forest-300 shadow-sm' : 'border-slate-100 bg-slate-50/40 hover:bg-slate-50'
              }`}
            >
              <span className="text-4xl block leading-none">🐕</span>
              <div className="text-sm font-bold text-slate-800">Sage Pup Scholar</div>
              <p className="text-[10px] text-slate-500 leading-normal">Helpful in file categorization and archiving index maintenance.</p>
            </div>

            {/* Lumo option */}
            <div 
              onClick={() => { setCompanionType('Lumo'); }}
              className={`p-4 border rounded-2xl cursor-pointer text-center space-y-2.5 select-none transition-all ${
                companionType === 'Lumo' ? 'bg-forest-50/60 border-forest-300 shadow-sm' : 'border-slate-100 bg-slate-50/40 hover:bg-slate-50'
              }`}
            >
              <span className="text-4xl block leading-none">👾</span>
              <div className="text-sm font-bold text-slate-800">Lumo Solar Spore</div>
              <p className="text-[10px] text-slate-500 leading-normal">Surges and light glows when linking complex thought nodes together.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-1">
            {/* Custom Companion Name */}
            <div className="space-y-2 text-left">
              <label className="text-xs font-mono font-bold text-slate-400 block tracking-wider uppercase">Name Your Mascot (CONVERTED TO UPPERCASE)</label>
              <input
                type="text"
                value={companionName}
                onChange={(e) => setCompanionName(e.target.value.toUpperCase())}
                placeholder="e.g. SPROUTY"
                className="w-full bg-slate-50 border border-slate-200 text-sm px-4 py-3 rounded-xl focus:outline-none focus:border-forest-500 text-slate-800 placeholder-slate-400 transition-colors focus:bg-white text-left font-semibold"
                required
              />
            </div>
          </div>
        </div>

      </div>

      {/* Danger Zone Section */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 md:p-8 shadow-xs text-left space-y-5">
        <div className="space-y-1">
          <h3 className="font-sans font-bold text-slate-950 text-lg">
            Danger Zone
          </h3>
          <p className="text-slate-500 text-sm">
            Actions in this section are permanent and cannot be undone.
          </p>
        </div>

        <div className="pt-2">
          <button
            type="button"
            onClick={handleDeleteAccount}
            className="px-5 py-2.5 bg-[#ef4444] hover:bg-[#dc2626] text-white text-sm font-bold rounded-lg shadow-sm transition-all cursor-pointer"
          >
            Delete Account
          </button>
        </div>

        <div>
          <p className="text-slate-500 text-sm">
            Permanently delete your account and all associated data.
          </p>
        </div>
      </div>

      {showWipeConfirm && (
        <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 z-[9999] overflow-y-auto animate-fade-in">
          <div className="bg-white border border-slate-200/90 rounded-3xl w-full max-w-sm sm:max-w-md shadow-2xl overflow-hidden relative my-auto text-left">
            
            {/* Top Red Alert Gradient */}
            <div className="h-2 bg-gradient-to-r from-rose-500 via-rose-600 to-amber-500 w-full" />

            {/* Close Button Top Right */}
            <button
              type="button"
              onClick={() => setShowWipeConfirm(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="p-6 sm:p-7 space-y-5">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-rose-100/80 border border-rose-200 flex items-center justify-center text-rose-600 shrink-0 shadow-xs">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div className="pr-6">
                  <h3 className="font-extrabold text-lg sm:text-xl text-slate-900 tracking-tight leading-snug">
                    Purge Caches & Indices?
                  </h3>
                  <p className="text-slate-500 text-xs sm:text-sm font-medium mt-1 leading-relaxed">
                    You are about to wipe local database index caches. Unsaved local sandbox items will be permanently cleared.
                  </p>
                </div>
              </div>

              <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl">
                <p className="text-xs text-rose-600 font-semibold leading-relaxed">
                  ⚠ Warning: Local offline cache will be reset. Active workspace nodes synced to cloud will remain safe.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowWipeConfirm(false)}
                  className="w-full py-3.5 px-4 bg-slate-100 hover:bg-slate-200/80 text-slate-700 font-bold rounded-2xl text-xs sm:text-sm transition-all cursor-pointer text-center flex items-center justify-center min-h-[48px]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowWipeConfirm(false);
                    clearLocalCache();
                  }}
                  className="w-full py-3.5 px-4 bg-rose-600 hover:bg-rose-700 active:scale-[0.98] text-white font-bold rounded-2xl text-xs sm:text-sm transition-all shadow-md shadow-rose-600/25 cursor-pointer text-center flex items-center justify-center gap-2 min-h-[48px]"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Purge Cache</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
