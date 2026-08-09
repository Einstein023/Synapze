import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, X, RefreshCw, Eye, EyeOff, ChevronDown, Check, ShieldCheck, Key, Lock, Globe } from 'lucide-react';
import { AvatarSvg } from './SettingsView';
import { getFriendlyErrorMessage } from '../lib/errorUtils';
import { useGarden } from '../lib/gardenState';

interface DeleteAccountViewProps {
  profile: {
    displayName: string;
    profilePicture: string;
    companionName: string;
    companionType: string;
    streakDays: number;
  };
  onBack: () => void;
  deleteAccount: (password: string, reason?: string) => Promise<{ success: boolean; message: string }>;
  isOffline: boolean;
  firebaseActive: boolean;
  userEmail: string | null;
  sendRecoveryOtp: (email: string) => Promise<{ success: boolean; message: string }>;
  triggerPushNotification: (title: string, body: string, type?: any) => void;
  onNavigateToLanding?: () => void;
}

export const DeleteAccountView: React.FC<DeleteAccountViewProps> = ({
  profile,
  onBack,
  deleteAccount,
  isOffline,
  firebaseActive,
  userEmail,
  sendRecoveryOtp,
  triggerPushNotification,
  onNavigateToLanding
}) => {
  const { authProvider } = useGarden();

  // Page core states
  const [reason, setReason] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [activeModal, setActiveModal] = useState<'deactivate' | 'delete' | null>(null);
  const [successState, setSuccessState] = useState<'deactivate' | 'delete' | null>(null);

  // Verification Form states
  const [passwordInput, setPasswordInput] = useState('');
  const [verifyError, setVerifyError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // OTP and Verification states
  const [showCodeVerification, setShowCodeVerification] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpMessage, setOtpMessage] = useState('');
  const [otpDigits, setOtpDigits] = useState<string[]>(Array(6).fill(''));
  const [timerSeconds, setTimerSeconds] = useState(263); // 04:23 is exactly 263 seconds
  
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Mask email like u*******f@gmail.com
  const maskEmail = (email: string) => {
    if (!email) return "u*******@gmail.com";
    const parts = email.split('@');
    if (parts.length !== 2) return email;
    const [local, domain] = parts;
    if (local.length <= 2) {
      return `${local[0]}*@${domain}`;
    }
    return `${local[0]}${'*'.repeat(local.length - 2)}${local[local.length - 1]}@${domain}`;
  };

  // Countdown timer for Code Verification resend
  useEffect(() => {
    if (!showCodeVerification) return;
    const interval = setInterval(() => {
      setTimerSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [showCodeVerification]);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
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
        setOtpMessage(`A secure OTP code has been issued. Check your workspace notification.`);
        setShowCodeVerification(true);
        setTimerSeconds(263); // reset countdown timer to 04:23
      } else {
        setVerifyError(res.message);
      }
    } catch (err: any) {
      setVerifyError(err.message || 'Failed to dispatch security verification OTP.');
    } finally {
      setOtpLoading(false);
    }
  };

  const getCleanErrorMessage = (err: any): string => {
    return getFriendlyErrorMessage(err);
  };

  const handleConfirmAction = async () => {
    if (firebaseActive && authProvider !== 'google' && !passwordInput.trim()) {
      setVerifyError('Verification password or OTP code is required.');
      return;
    }

    setIsVerifying(true);
    setVerifyError('');

    try {
      const verifier = (authProvider === 'google' || !passwordInput.trim()) ? 'google-oauth-bypass' : passwordInput.trim();
      if (activeModal === 'delete') {
        const res = await deleteAccount(verifier, reason);
        if (res.success) {
          setSuccessState('delete');
          setActiveModal(null);
          setPasswordInput('');
          setOtpSent(false);
          setOtpMessage('');
          triggerPushNotification('Account Composted', res.message, 'system');
        } else {
          setVerifyError(res.message || 'recheck you password');
        }
      }
    } catch (err: any) {
      setVerifyError(getCleanErrorMessage(err));
    } finally {
      setIsVerifying(false);
    }
  };

  const handleOtpChange = (value: string, index: number) => {
    const cleanValue = value.replace(/[^0-9]/g, '').slice(-1);
    const newDigits = [...otpDigits];
    newDigits[index] = cleanValue;
    setOtpDigits(newDigits);

    // Auto-focus next input
    if (cleanValue && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace') {
      if (!otpDigits[index] && index > 0) {
        const newDigits = [...otpDigits];
        newDigits[index - 1] = '';
        setOtpDigits(newDigits);
        inputRefs.current[index - 1]?.focus();
      } else if (otpDigits[index]) {
        const newDigits = [...otpDigits];
        newDigits[index] = '';
        setOtpDigits(newDigits);
      }
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();
    if (/^\d{6}$/.test(pastedData)) {
      const digits = pastedData.split('');
      setOtpDigits(digits);
      inputRefs.current[5]?.focus();
    }
  };

  const handleVerifyOtpCode = async () => {
    const code = otpDigits.join('');
    if (code.length !== 6) return;
    
    setIsVerifying(true);
    setVerifyError('');
    
    try {
      if (activeModal === 'delete') {
        const res = await deleteAccount(code, reason);
        if (res.success) {
          setSuccessState('delete');
          setActiveModal(null);
          setShowCodeVerification(false);
          setOtpDigits(Array(6).fill(''));
          triggerPushNotification('Account Composted', res.message, 'system');
        } else {
          setVerifyError(res.message || 'recheck you password');
        }
      }
    } catch (err: any) {
      setVerifyError(getCleanErrorMessage(err));
    } finally {
      setIsVerifying(false);
    }
  };

  const handleCloseSuccess = () => {
    setSuccessState(null);
    if (onNavigateToLanding) {
      onNavigateToLanding();
    } else {
      window.location.reload();
    }
  };

  return (
    <div className="min-h-[calc(100vh-73px)] bg-slate-50/50 flex flex-col items-center justify-start p-4 sm:p-6 md:p-8 pt-8 scroll-smooth" id="delete-account-view">
      
      {/* 2. Main Content Card Container */}
      <div className="max-w-lg w-full space-y-6 flex flex-col" id="delete-main-container">
        
        {/* Elegant Inline Header */}
        <div className="flex items-center justify-between px-1" id="delete-header-inline">
          {(!successState && activeModal !== 'delete') ? (
            <button 
              onClick={onBack}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200/80 hover:bg-slate-50 text-slate-600 hover:text-slate-900 rounded-xl transition-all cursor-pointer text-xs font-bold shadow-xs"
              id="delete-back-btn"
            >
              <ChevronLeft className="w-4 h-4" />
              Back to Settings
            </button>
          ) : (
            <div />
          )}
        </div>

        <AnimatePresence mode="wait">
          {successState ? (
            /* SUCCESS INLINE SECTION */
            <motion.div
              key="success-section"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.2 }}
              className="bg-white border border-slate-200/60 rounded-3xl p-6 sm:p-8 md:p-10 shadow-sm space-y-6 text-center"
              id="delete-content-card"
            >
              {/* Green Success Badge Pill */}
              <div className="pt-2" id="success-badge-wrapper">
                <span className="inline-flex items-center px-3.5 py-1 rounded-full text-[10px] sm:text-[11px] font-extrabold bg-emerald-50 text-emerald-600 border border-emerald-100 tracking-wider uppercase" id="success-badge-pill">
                  Success
                </span>
              </div>

              {/* Headline & Text */}
              <div className="space-y-2.5 px-2" id="success-copy-section">
                <h3 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight" id="success-headline">
                  Successfully!
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 leading-relaxed max-w-xs mx-auto" id="success-description">
                  Your account has been successfully deleted. We are sorry to see you go.
                </p>
              </div>

              {/* Close/Acknowledge Button */}
              <div className="pt-2" id="success-action-wrapper">
                <button
                  onClick={handleCloseSuccess}
                  className="w-full py-3.5 bg-[#203d36] hover:bg-black text-white font-bold text-xs sm:text-sm rounded-xl sm:rounded-2xl transition-all cursor-pointer shadow-md shadow-[#203d36]/15 flex items-center justify-center"
                  id="success-close-btn"
                >
                  Close
                </button>
              </div>
            </motion.div>
          ) : activeModal ? (
            showCodeVerification ? (
              /* OTP VERIFICATION INLINE SECTION */
              <motion.div
                key="otp-section"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.2 }}
                className="bg-white border border-slate-200/60 rounded-3xl p-5 sm:p-8 md:p-10 shadow-sm space-y-6 sm:space-y-8 w-full max-w-full overflow-hidden"
                id="delete-content-card"
              >
                <div className="pt-2">
                  <button
                    onClick={() => setShowCodeVerification(false)}
                    className="text-slate-500 hover:text-slate-800 flex items-center gap-1 font-semibold text-xs transition-colors cursor-pointer"
                    id="code-verify-back-btn"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Back to password
                  </button>
                </div>

                <div className="space-y-2 text-center">
                  <h3 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight" id="code-verify-title">
                    Code Verification
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 leading-relaxed" id="code-verify-desc">
                    Enter the code we've sent to <span className="font-semibold text-slate-800">{maskEmail(userEmail || 'uhunomaof@gmail.com')}</span>.
                  </p>
                </div>

                {/* 6 Digit Input Boxes */}
                <div className="flex items-center justify-center gap-1 sm:gap-2 py-2 w-full max-w-full overflow-hidden px-1" id="code-verify-digit-container">
                  {/* First 3 boxes */}
                  <div className="flex gap-1 sm:gap-2 min-w-0 shrink">
                    {[0, 1, 2].map((idx) => (
                      <input
                        key={idx}
                        ref={(el) => { inputRefs.current[idx] = el; }}
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={1}
                        value={otpDigits[idx]}
                        onChange={(e) => handleOtpChange(e.target.value, idx)}
                        onKeyDown={(e) => handleOtpKeyDown(e, idx)}
                        onPaste={handleOtpPaste}
                        className="w-9 h-12 xs:w-10 xs:h-14 sm:w-12 sm:h-16 rounded-xl sm:rounded-2xl bg-black text-white font-mono font-bold text-base sm:text-xl text-center focus:outline-none transition-all border-2 border-transparent focus:border-emerald-500 focus:shadow-[0_0_8px_rgba(16,185,129,0.4)] shrink min-w-0"
                      />
                    ))}
                  </div>

                  {/* Hyphen */}
                  <span className="text-slate-800 font-bold text-lg sm:text-xl px-0.5 sm:px-1 select-none shrink-0">-</span>

                  {/* Last 3 boxes */}
                  <div className="flex gap-1 sm:gap-2 min-w-0 shrink">
                    {[3, 4, 5].map((idx) => (
                      <input
                        key={idx}
                        ref={(el) => { inputRefs.current[idx] = el; }}
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={1}
                        value={otpDigits[idx]}
                        onChange={(e) => handleOtpChange(e.target.value, idx)}
                        onKeyDown={(e) => handleOtpKeyDown(e, idx)}
                        onPaste={handleOtpPaste}
                        className="w-9 h-12 xs:w-10 xs:h-14 sm:w-12 sm:h-16 rounded-xl sm:rounded-2xl bg-black text-white font-mono font-bold text-base sm:text-xl text-center focus:outline-none transition-all border-2 border-transparent focus:border-emerald-500 focus:shadow-[0_0_8px_rgba(16,185,129,0.4)] shrink min-w-0"
                      />
                    ))}
                  </div>
                </div>

                {/* Timer display */}
                <div className="text-xs text-slate-500 font-semibold text-center" id="code-verify-timer-box">
                  {timerSeconds > 0 ? (
                    <span>Resend code in <span className="font-mono text-slate-800 font-bold">{formatTimer(timerSeconds)}</span></span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        handleRequestOtp();
                      }}
                      className="text-emerald-600 hover:text-emerald-700 font-bold hover:underline transition-all cursor-pointer"
                      id="code-verify-resend-btn"
                    >
                      Resend code
                    </button>
                  )}
                </div>

                {verifyError && (
                  <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-rose-600 text-xs font-semibold leading-relaxed text-center" id="code-verify-error">
                    {verifyError}
                  </div>
                )}

                {/* Submit Verify Button */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleVerifyOtpCode}
                    disabled={otpDigits.join('').length !== 6 || isVerifying}
                    className={`w-full py-3.5 sm:py-4 rounded-3xl font-sans font-extrabold text-sm sm:text-base transition-all flex items-center justify-center gap-2 ${
                      otpDigits.join('').length === 6 && !isVerifying
                        ? 'bg-[#203d36] text-white hover:bg-black cursor-pointer shadow-md'
                        : 'bg-[#e0e0e0] text-slate-400 cursor-not-allowed'
                    }`}
                    id="code-verify-submit-btn"
                  >
                    {isVerifying ? (
                      <>
                        <RefreshCw className="w-5 h-5 animate-spin" />
                        <span>Verifying...</span>
                      </>
                    ) : (
                      <span>Verify</span>
                    )}
                  </button>
                </div>
              </motion.div>
            ) : (
              /* PASSWORD CONFIRMATION INLINE SECTION */
              <motion.div
                key="password-section"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.2 }}
                className="bg-white border border-slate-200/60 rounded-3xl p-6 sm:p-8 md:p-10 shadow-sm space-y-6 text-center"
                id="delete-content-card"
              >
                {/* Red Warning Badge Pill */}
                <div className="pt-2" id="warning-badge-wrapper">
                  <span className="inline-flex items-center px-3.5 py-1 rounded-full text-[10px] sm:text-[11px] font-extrabold bg-rose-50 text-rose-600 border border-rose-100 tracking-wider uppercase" id="warning-badge-pill">
                    Warning
                  </span>
                </div>

                {/* Warning Copy */}
                <div className="space-y-2.5" id="warning-copy-section">
                  <h3 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight leading-snug px-2" id="warning-headline">
                    Are you sure you want to delete your account?
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 leading-relaxed max-w-xs mx-auto" id="warning-description">
                    By deleting your account you will permanently lose all sowed seeds, companion achievements, and notes. This action cannot be undone.
                  </p>
                </div>

                {/* Verification password inputs (If firebase active and not Google OAuth) */}
                {firebaseActive && authProvider !== 'google' && (
                  <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100 text-left space-y-3.5" id="warning-verification-box">
                    <div className="flex items-center justify-between text-xs font-semibold" id="warning-verification-labels">
                      <label className="text-slate-500 font-medium" id="warning-pwd-label">Confirm Master Password</label>
                      <button
                        type="button"
                        onClick={handleRequestOtp}
                        disabled={otpLoading}
                        className="text-[#203d36] hover:text-black font-bold hover:underline transition-all cursor-pointer text-xs"
                        id="warning-otp-btn"
                      >
                        {otpLoading ? "Sending OTP..." : "Forgot password?"}
                      </button>
                    </div>
                    
                    <div className="relative flex items-center" id="warning-pwd-input-wrapper">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={passwordInput}
                        onChange={(e) => setPasswordInput(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full bg-white border border-slate-200 text-sm pl-4 pr-10 py-3 rounded-xl focus:outline-none focus:border-[#203d36] text-slate-800 placeholder-slate-400 font-mono transition-colors"
                        id="warning-pwd-input"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 text-slate-400 hover:text-slate-600 transition-colors p-1"
                        title={showPassword ? "Hide Password" : "Show Password"}
                        id="warning-pwd-toggle-btn"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>

                    {verifyError && (
                      <div className="p-3 bg-rose-50/80 border border-rose-100 rounded-xl text-rose-600 text-xs font-semibold leading-relaxed text-center" id="warning-error-msg">
                        {verifyError}
                      </div>
                    )}
                  </div>
                )}

                {/* Buttons Row */}
                <div className="flex flex-col sm:flex-row gap-3 pt-2" id="warning-buttons-row">
                  <button
                    type="button"
                    onClick={() => setActiveModal(null)}
                    className="w-full sm:flex-1 py-3.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 hover:text-slate-900 font-bold text-sm rounded-2xl transition-all cursor-pointer min-h-[48px]"
                    id="warning-back-btn"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmAction}
                    disabled={isVerifying}
                    className="w-full sm:flex-1 py-3.5 bg-[#203d36] hover:bg-black disabled:bg-[#203d36]/70 text-white font-bold text-sm rounded-2xl transition-all cursor-pointer flex items-center justify-center gap-2 min-h-[48px]"
                    id="warning-confirm-btn"
                  >
                    {isVerifying ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Verifying...</span>
                      </>
                    ) : (
                      <span>Delete Account</span>
                    )}
                  </button>
                </div>
              </motion.div>
            )
          ) : (
            /* INITIAL CONFIGURATION INLINE SECTION */
            <motion.div
              key="initial-section"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.2 }}
              className="bg-white border border-slate-200/60 rounded-3xl p-6 sm:p-8 md:p-10 shadow-sm space-y-8"
              id="delete-content-card"
            >
              {/* Header Inside Card */}
              <div className="text-center space-y-2 border-b border-slate-100 pb-6" id="delete-card-intro">
                <h1 className="font-sans font-extrabold text-slate-900 text-xl sm:text-2xl" id="delete-title">
                  Delete Account
                </h1>
                <p className="text-xs text-slate-500 font-medium">Deleting your node will permanently compost your garden identity and sowed seeds.</p>
              </div>

              {/* Profile Section */}
              <div className="text-center space-y-3" id="delete-profile-section">
                <div className="relative w-20 h-20 sm:w-24 sm:h-24 mx-auto" id="delete-avatar-container">
                  <div className="w-full h-full rounded-full overflow-hidden border border-slate-100 shadow-md">
                    <AvatarSvg type={profile.profilePicture || 'avatar_explorer'} className="w-full h-full" />
                  </div>
                  {/* Minus Circle Badge in bottom-right */}
                  <div className="absolute -bottom-0.5 -right-0.5 bg-rose-500 text-white rounded-full w-6.5 h-6.5 flex items-center justify-center border-2 border-white shadow-md cursor-default select-none" id="delete-avatar-badge">
                    <span className="text-white text-sm font-extrabold leading-none mb-0.5">−</span>
                  </div>
                </div>
                <h2 className="font-sans font-bold text-slate-900 text-lg sm:text-xl" id="delete-profile-name">
                  {profile.displayName || userEmail || 'Yanika Phuthon'}
                </h2>
              </div>

              {/* Reason Section */}
              <div className="space-y-3.5 relative" id="delete-reason-section">
                <label className="font-sans font-bold text-slate-800 text-sm sm:text-base block text-left" id="delete-reason-label">
                  Tell us the reason for closing your account <span className="text-rose-500">*</span>
                </label>
                
                {/* Custom Redesigned Dropdown */}
                <div className="relative" id="delete-reason-wrapper">
                  <button
                    type="button"
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="w-full bg-slate-50 hover:bg-slate-100/50 border border-slate-200 hover:border-slate-300 text-slate-800 text-xs sm:text-sm px-4 py-3.5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#203d36]/15 focus:border-[#203d36] cursor-pointer transition-all flex items-center justify-between font-semibold shadow-xs text-left"
                    id="delete-reason-trigger"
                  >
                    <span className={reason ? "text-slate-800" : "text-slate-400 font-medium"}>
                      {reason || "Select a reason"}
                    </span>
                    <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 shrink-0 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  <AnimatePresence>
                    {isDropdownOpen && (
                      <>
                        {/* Overlay backdrop to close dropdown when clicking anywhere else */}
                        <div 
                          className="fixed inset-0 z-40 cursor-default" 
                          onClick={() => setIsDropdownOpen(false)} 
                        />
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.15, ease: "easeOut" }}
                          className="absolute left-0 right-0 mt-2 bg-white border border-slate-200/80 shadow-xl rounded-2xl p-2.5 z-50 max-h-60 overflow-y-auto text-left space-y-1"
                          id="delete-reason-dropdown-menu"
                        >
                          {["I have a privacy concern", "I don't use this application anymore", "The application is too complicated", "I am receiving too many notifications", "Other / Personal reasons"].map((opt) => {
                            const isSelected = reason === opt;
                            return (
                              <button
                                key={opt}
                                type="button"
                                onClick={() => {
                                  setReason(opt);
                                  setIsDropdownOpen(false);
                                }}
                                className={`w-full text-left px-4 py-3 rounded-xl text-xs sm:text-sm transition-all flex items-center justify-between cursor-pointer ${
                                  isSelected 
                                    ? 'bg-emerald-50 text-emerald-800 font-bold border border-emerald-100' 
                                    : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900 border border-transparent font-medium active:bg-slate-100'
                                }`}
                              >
                                <span>{opt}</span>
                                {isSelected && <Check className="w-4 h-4 text-emerald-600 shrink-0 stroke-[2.5]" />}
                              </button>
                            );
                          })}
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>

                {!reason && (
                  <p className="text-[11px] text-rose-500 font-semibold font-sans leading-normal text-left" id="delete-reason-error-hint">
                    ⚠ selecting a reason is reason is important and required for further development
                  </p>
                )}
              </div>

              {/* Core Action Callouts */}
              <div className="pt-4" id="delete-actions-section">
                <button
                  onClick={() => {
                    if (!reason) return;
                    setPasswordInput('');
                    setVerifyError('');
                    setOtpSent(false);
                    setOtpMessage('');
                    setShowCodeVerification(false);
                    setActiveModal('delete');
                  }}
                  disabled={!reason}
                  className={`w-full py-3.5 sm:py-4 font-bold text-sm rounded-2xl transition-all flex items-center justify-center gap-2 ${
                    reason
                      ? 'bg-rose-600 hover:bg-rose-700 active:scale-[0.99] text-white cursor-pointer shadow-md shadow-rose-600/15'
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed border-transparent shadow-none'
                  }`}
                  id="delete-trigger-btn"
                >
                  Delete My Account
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

    </div>
  );
};
