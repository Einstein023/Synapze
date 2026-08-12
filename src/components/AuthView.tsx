import React, { useState, useEffect } from 'react';
import { useGarden } from '../lib/gardenState';
import { getFriendlyErrorMessage } from '../lib/errorUtils';
import { 
  Sprout, 
  ArrowLeft, 
  ShieldAlert, 
  Check, 
  Eye, 
  EyeOff, 
  Plus, 
  X,
  Sparkles,
  ArrowRight,
  Bot,
  Database,
  ShieldCheck
} from 'lucide-react';

export const AuthView: React.FC<{ 
  onBack: () => void; 
  onGoToWorkspace?: () => void;
  onNavigateToLegal?: (tab: 'terms' | 'privacy') => void;
  initialSignUp?: boolean;
}> = ({ onBack, onGoToWorkspace, onNavigateToLegal, initialSignUp = true }) => {
  const { 
    signInWithGoogle, 
    signInWithEmail, 
    signUpWithEmail, 
    simulateEmailSignIn, 
    isAuthenticated, 
    userEmail, 
    signOutUser,
    sendRecoveryOtp,
    verifyOtpOnly,
    verifyOtpAndSetPassword
  } = useGarden();

  // Primary Auth States
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(initialSignUp);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  // Password Recovery States
  const [authMode, setAuthMode] = useState<'auth' | 'forgot_password' | 'verify_otp' | 'new_password'>('auth');
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [recoveryConfirmPassword, setRecoveryConfirmPassword] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpSuccessMsg, setOtpSuccessMsg] = useState('');

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recoveryEmail || !recoveryEmail.trim().includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }
    setError('');
    setOtpSuccessMsg('');
    setOtpLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      const res = await sendRecoveryOtp(recoveryEmail);
      if (res.success) {
        setOtpSuccessMsg(res.message);
      } else {
        setError(res.message);
      }
    } catch (err: any) {
      setError(getFriendlyErrorMessage(err));
    } finally {
      setOtpLoading(false);
    }
  };

  const handleVerifyOtpOnly = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode.trim() || otpCode.trim().length !== 6) {
      setError('Please enter a valid 6-digit OTP code.');
      return;
    }
    setError('');
    setOtpSuccessMsg('');
    setOtpLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      const res = await verifyOtpOnly(recoveryEmail, otpCode.trim());
      if (res.success) {
        setOtpSuccessMsg('OTP code confirmed! Now enter your new password.');
        setAuthMode('new_password');
        setNewPassword('');
        setRecoveryConfirmPassword('');
      } else {
        setError(res.message);
      }
    } catch (err: any) {
      setError(getFriendlyErrorMessage(err));
    } finally {
      setOtpLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword.trim() || !recoveryConfirmPassword.trim()) {
      setError('Please fill out both password fields.');
      return;
    }
    if (newPassword.length < 8 || newPassword.length > 20) {
      setError('New password must be between 8 and 20 characters long.');
      return;
    }
    if (newPassword !== recoveryConfirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setError('');
    setOtpSuccessMsg('');
    setOtpLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      const res = await verifyOtpAndSetPassword(recoveryEmail, otpCode, newPassword);
      if (res.success) {
        setOtpSuccessMsg(res.message);
        setAuthMode('auth');
        setEmail(recoveryEmail);
        setPassword(newPassword);
      } else {
        setError(res.message);
      }
    } catch (err: any) {
      setError(getFriendlyErrorMessage(err));
    } finally {
      setOtpLoading(false);
    }
  };

  // Interactive Live Dashboard Mockup States (Right Panel)
  const [inviteEmail, setInviteEmail] = useState('');
  const [invitedMembers, setInvitedMembers] = useState<Array<{ email: string; role: string; initial: string; color: string }>>([
    { email: 'rafiqur@gmail.com', role: 'ADMIN', initial: 'R', color: 'bg-[#89b3f4]' }
  ]);
  const [activeMembersCount, setActiveMembersCount] = useState(4);
  const [isFloatingInviteVisible, setIsFloatingInviteVisible] = useState(true);

  // Auto-redirect to workspace when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      if (onGoToWorkspace) {
        onGoToWorkspace();
      }
    }
  }, [isAuthenticated, onGoToWorkspace]);

  // Error handling timeout
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(''), 6000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const handleSignOut = async () => {
    try {
      await signOutUser();
      onBack(); // Redirect to landing page
    } catch (err) {
      // Handled silently
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSignUp && !fullName.trim()) {
      setError('Please enter your full name.');
      return;
    }
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }
    if (password.length < 8 || password.length > 20) {
      setError('Password must be between 8 and 20 characters long.');
      return;
    }
    if (isSignUp && password !== confirmPassword) {
      setError('Passwords do not match. Please re-enter your password.');
      return;
    }
    // Only require agreeing to terms when SIGNING UP
    if (isSignUp && !agreedToTerms) {
      setError('Please agree to the Terms of Service and Privacy Policy to continue.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      if (isSignUp) {
        await signUpWithEmail(email, password, fullName.trim());
      } else {
        await signInWithEmail(email, password);
      }
      if (onGoToWorkspace) {
        onGoToWorkspace();
      }
    } catch (err: any) {
      console.warn(err);
      setError(getFriendlyErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setError('');
    setLoading(true);
    try {
      await signInWithGoogle();
    } catch (err: any) {
      console.warn(err);
      setError(getFriendlyErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleSandboxGuestAuth = () => {
    setError('');
    setLoading(true);
    const guestEmail = email || 'sandbox-guest@synapze.io';
    
    setTimeout(async () => {
      try {
        await simulateEmailSignIn(guestEmail);
      } catch (err: any) {
        setError(getFriendlyErrorMessage(err));
      } finally {
        setLoading(false);
      }
    }, 400);
  };

  // Right-side floating add member trigger
  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail || !inviteEmail.includes('@')) return;
    
    const initials = inviteEmail.substring(0, 2).toUpperCase();
    setInvitedMembers(prev => [
      ...prev,
      { email: inviteEmail, role: 'INVITED', initial: initials[0], color: 'bg-[#caa5f2]' }
    ]);
    setActiveMembersCount(prev => prev + 1);
    setInviteEmail('');
  };

  return (
    <div className="min-h-screen bg-[#faf9f6] text-[#203d36] flex flex-col lg:grid lg:grid-cols-12 overflow-x-hidden font-sans selection:bg-[#cae9d5] selection:text-[#203d36]">
      
      {/* LEFT SIDE: AUTH FORM SCREEN (7/12 cols) */}
      <div className="lg:col-span-7 flex flex-col justify-between p-6 sm:p-12 lg:p-16 min-h-[100vh]">
        
        {/* Top Header Logo Row */}
        <div className="flex items-center justify-between">
          <div 
            onClick={onBack} 
            className="flex items-center gap-2 cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-lg bg-[#203d36] flex items-center justify-center text-white transition-transform group-hover:scale-105">
              <Sprout className="w-5 h-5 text-[#fdda64]" />
            </div>
            <span className="font-serif font-extrabold text-xl tracking-tight text-[#203d36]">Synapze</span>
          </div>

          <button 
            onClick={onBack}
            className="w-9 h-9 rounded-xl border border-slate-200/80 bg-white hover:bg-slate-50 text-[#5c6e66] hover:text-[#203d36] flex items-center justify-center shadow-xs transition-all cursor-pointer"
            title="Back to Landing Page"
          >
            <ArrowLeft className="w-4.5 h-4.5" />
          </button>
        </div>

        {/* Auth Box Center Container */}
        <div className="my-auto max-w-md w-full mx-auto py-12 space-y-8">
          
          {/* Brand Logo */}
          <div className="flex justify-start">
            <div className="w-12 h-12 bg-[#203d36] rounded-xl flex items-center justify-center shadow-md shadow-[#203d36]/10">
              <Sprout className="w-6.5 h-6.5 text-[#fdda64]" />
            </div>
          </div>
          
          {/* Welcome Titles */}
          <div className="space-y-2">
            <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-[#203d36] leading-tight">
              {isAuthenticated ? "Session Established" : (isSignUp ? "Start growing for free" : "Welcome back to your garden")}
            </h1>
            <p className="text-[#5c6e66] text-sm font-medium">
              {isAuthenticated 
                ? "Your digital notes & checklists are synchronized in secure cloud storage modules." 
                : "Cultivate your thoughts and ideas in a serene digital space."}
            </p>
          </div>

          {/* Conditional Authenticated View */}
          {isAuthenticated ? (
            <div className="space-y-6">
              
              <div className="p-6 bg-[#f4faf6] border border-[#d8ecd4] rounded-2xl space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#203d36] flex items-center justify-center text-[#fdda64] text-lg font-bold shadow-sm">
                    🌱
                  </div>
                  <div>
                    <span className="text-[10px] font-mono font-bold text-[#427a5b] block tracking-wider">ACTIVE GARDENER NODE</span>
                    <span className="text-sm font-bold text-[#203d36] font-mono break-all">{userEmail}</span>
                  </div>
                </div>
                
                <div className="text-xs text-[#5c6e66] leading-relaxed font-medium">
                  Welcome back! You are linked safely to our premium memory storage node. Tap the action triggers to return to workspace, or disconnect your session secure link.
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <button
                  onClick={onGoToWorkspace || onBack}
                  className="px-6 py-3.5 bg-[#203d36] hover:bg-[#162e29] text-white font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md"
                >
                  Go to Garden Workspace
                  <ArrowRight className="w-4 h-4 text-[#fdda64]" />
                </button>

                <button
                  onClick={handleSignOut}
                  className="px-6 py-3.5 bg-white hover:bg-red-50 hover:text-red-700 hover:border-red-200 text-[#5c6e66] border border-slate-200 font-bold rounded-xl text-xs transition-colors cursor-pointer"
                >
                  Disconnect Session
                </button>
              </div>

            </div>
          ) : (
            <div className="space-y-6">

              {error && (
                <div className="p-4 bg-rose-50 border border-rose-100 text-rose-800 text-xs rounded-2xl flex flex-col gap-3 leading-relaxed shadow-xs">
                  <div className="flex items-start gap-2.5">
                    <ShieldAlert className="w-4.5 h-4.5 text-rose-500 shrink-0 mt-0.5" />
                    <span className="font-semibold text-rose-900">{error}</span>
                  </div>
                  {error.includes('operation-not-allowed') && (
                    <div className="mt-1 pt-3 border-t border-rose-200/50 text-slate-700 space-y-2.5">
                      <p className="font-bold text-slate-800 flex items-center gap-1.5 text-[11px] uppercase tracking-wider font-mono">
                        ⚙️ Firebase Setup Required:
                      </p>
                      <p className="text-slate-600 text-xs">
                        The <strong>Email/Password</strong> sign-in provider is disabled in your Firebase console. To enable it and test real email authentication:
                      </p>
                      <ol className="list-decimal pl-4.5 space-y-1.5 text-xs text-slate-600">
                        <li>
                          Open your{' '}
                          <a 
                            href="https://console.firebase.google.com/project/pelagic-amulet-h9nlt/authentication/providers" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-forest-600 hover:text-forest-700 font-bold underline inline-flex items-center gap-0.5"
                          >
                            Firebase Auth Console
                          </a>
                        </li>
                        <li>Click <strong>"Add new provider"</strong> (or select <strong>"Email/Password"</strong> from the list)</li>
                        <li>Toggle <strong>"Enable"</strong> under Email/Password, and click <strong>"Save"</strong></li>
                      </ol>
                      <div className="bg-white/80 border border-rose-100 p-2.5 rounded-xl text-[11px] text-slate-500">
                        <strong>Instant Workaround:</strong> You can continue testing immediately by clicking <strong>"Continue with Google"</strong> or toggling <strong>"Sandbox Mode / Guest Login"</strong> in the bottom bar below!
                      </div>
                    </div>
                  )}
                </div>
              )}

              {otpSuccessMsg && (
                <div className="p-4 bg-emerald-50 border border-emerald-100 text-emerald-800 text-xs rounded-xl flex items-start gap-2.5 leading-relaxed shadow-xs">
                  <Check className="w-4.5 h-4.5 text-emerald-500 shrink-0 mt-0.5" />
                  <span className="font-semibold">{otpSuccessMsg}</span>
                </div>
              )}

              {authMode === 'auth' && (
                <>
                  {/* Dynamic Social Login full width */}
                  <div className="w-full">
                    {/* Google Signin */}
                    <button
                      type="button"
                      onClick={handleGoogleAuth}
                      disabled={loading}
                      className="w-full flex items-center justify-center gap-3 px-5 py-4 bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 text-sm sm:text-base font-bold rounded-2xl shadow-xs transition-colors duration-200 cursor-pointer disabled:opacity-50 min-h-[50px]"
                    >
                      <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                        <path
                          fill="#4285F4"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="#34A853"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                        />
                        <path
                          fill="#EA4335"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                        />
                      </svg>
                      <span className="font-sans">Continue with Google</span>
                    </button>
                  </div>

                  {/* Minimal Divider */}
                  <div className="relative flex py-2 items-center">
                    <div className="flex-grow border-t border-slate-205"></div>
                    <span className="flex-shrink mx-4 text-[10px] font-mono font-bold text-slate-400 tracking-wider">OR</span>
                    <div className="flex-grow border-t border-slate-205"></div>
                  </div>

                  {/* Credential Form */}
                  <form onSubmit={handleEmailAuth} className="space-y-4 text-left">
                    
                    {/* Full Name Field (Sign Up Only) */}
                    {isSignUp && (
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-medium text-[#5c6e66] font-sans block">
                          Full Name
                        </label>
                        <input
                          type="text"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="e.g. Alex Morgan"
                          className="w-full py-3 px-4 block border border-slate-205 bg-[#f6f5f0]/40 focus:bg-white text-[#203d36] text-sm focus:outline-none focus:border-[#203d36] rounded-xl transition-all duration-200 placeholder-[#b5bdba] font-medium"
                          required={isSignUp}
                          disabled={loading}
                        />
                      </div>
                    )}

                    {/* Email Field */}
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-medium text-[#5c6e66] font-sans block">Email address</label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="example@synapze.io"
                        className="w-full py-3 px-4 block border border-slate-205 bg-[#f6f5f0]/40 focus:bg-white text-[#203d36] text-sm focus:outline-none focus:border-[#203d36] rounded-xl transition-all duration-200 placeholder-[#b5bdba] font-medium"
                        required
                        disabled={loading}
                      />
                    </div>

                    {/* Password Field with reveal toggle & 8-20 char rules */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-[11px] font-medium text-[#5c6e66] font-sans">
                          Password {isSignUp && <span className="text-[10px] text-slate-400 font-normal">(8–20 characters)</span>}
                        </label>
                        {!isSignUp && (
                          <button 
                            type="button"
                            onClick={() => {
                              setRecoveryEmail(email);
                              setError('');
                              setOtpSuccessMsg('');
                              setAuthMode('forgot_password');
                            }}
                            className="text-[11px] text-[#5c6e66] hover:text-[#203d36] font-semibold transition-colors cursor-pointer"
                          >
                            Forgot password?
                          </button>
                        )}
                      </div>

                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••"
                          minLength={8}
                          maxLength={20}
                          className="w-full py-3 pl-4 pr-11 block border border-slate-205 bg-[#f6f5f0]/40 focus:bg-white text-[#203d36] text-sm focus:outline-none focus:border-[#203d36] rounded-xl transition-all duration-200 placeholder-[#b5bdba] font-medium"
                          required
                          disabled={loading}
                        />

                        {/* Show password button */}
                        <button
                          type="button"
                          onClick={() => setShowPassword(p => !p)}
                          className="absolute right-4.5 top-1/2 -translate-y-1/2 text-[#5c6e66] hover:text-[#203d36] transition-colors cursor-pointer"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Confirm Password Field (Sign Up Only) */}
                    {isSignUp && (
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-medium text-[#5c6e66] font-sans block">
                          Confirm Password
                        </label>
                        <div className="relative">
                          <input
                            type={showPassword ? "text" : "password"}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Re-enter password"
                            minLength={8}
                            maxLength={20}
                            className="w-full py-3 pl-4 pr-11 block border border-slate-205 bg-[#f6f5f0]/40 focus:bg-white text-[#203d36] text-sm focus:outline-none focus:border-[#203d36] rounded-xl transition-all duration-200 placeholder-[#b5bdba] font-medium"
                            required={isSignUp}
                            disabled={loading}
                          />
                        </div>
                      </div>
                    )}

                    {/* Terms & Privacy Checkbox (ONLY shown when registering / Sign Up) */}
                    {isSignUp && (
                      <div className="space-y-1.5 pt-1">
                        <div 
                          onClick={() => setAgreedToTerms(prev => !prev)}
                          className="flex items-start gap-3 cursor-pointer select-none group"
                        >
                          <div className={`mt-0.5 w-[18px] h-[18px] rounded border transition-all flex items-center justify-center shrink-0 ${
                            agreedToTerms 
                              ? 'bg-[#365345] border-[#365345]' 
                              : 'border-slate-300 bg-white group-hover:border-slate-400'
                          }`}>
                            {agreedToTerms && <Check className="w-3 h-3 text-white stroke-[3.5px]" />}
                          </div>
                          
                          <span className="text-[11px] text-[#5c6e66] font-medium leading-relaxed font-sans">
                            I agree to the{' '}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onNavigateToLegal?.('terms');
                              }}
                              className="font-bold underline text-[#203d36] hover:text-[#365345] cursor-pointer"
                            >
                              Terms of Service
                            </button>
                            {' '}and{' '}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onNavigateToLegal?.('privacy');
                              }}
                              className="font-bold underline text-[#203d36] hover:text-[#365345] cursor-pointer"
                            >
                              Privacy Policy
                            </button>
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Primary Action Submit button */}
                    <div className="pt-2">
                      <button
                        type="submit"
                        disabled={loading || (isSignUp && !agreedToTerms)}
                        className={`w-full py-4 px-6 bg-[#365345] hover:bg-[#203d36] text-[#faf9f6]/95 font-bold text-base rounded-2xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer duration-200 min-h-[52px] ${
                          isSignUp && !agreedToTerms ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                      >
                        {loading ? (
                          <span className="w-5 h-5 border-2 border-[#faf9f6] border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <span>{isSignUp ? 'Create Account' : 'Sign In'}</span>
                        )}
                      </button>
                    </div>

                  </form>
                </>
              )}

              {authMode === 'forgot_password' && (
                <form onSubmit={handleSendOtp} className="space-y-5 text-left bg-white p-5 border border-slate-200/60 rounded-2xl shadow-xs">
                  <div className="space-y-1">
                    <h3 className="font-serif text-base font-bold text-[#203d36]">Reset Master Password</h3>
                    <p className="text-xs text-[#5c6e66] leading-relaxed">
                      Enter your registered email address below. We will send you an official Firebase password reset link to create a new password securely.
                    </p>
                  </div>

                  {otpSuccessMsg ? (
                    <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-3 text-left">
                      <div className="flex items-start gap-2.5 text-emerald-800 text-xs font-medium leading-relaxed">
                        <Check className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{otpSuccessMsg}</span>
                      </div>
                      <p className="text-[11px] text-emerald-700/80 font-normal">
                        After resetting your password via the link in your email, return here to sign in with your new password.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-medium text-[#5c6e66]">Registered Email Address</label>
                      <input
                        type="email"
                        value={recoveryEmail}
                        onChange={(e) => setRecoveryEmail(e.target.value)}
                        placeholder="example@domain.com"
                        className="w-full py-3 px-4 block border border-slate-200 bg-[#f6f5f0]/40 focus:bg-white text-[#203d36] text-sm focus:outline-none focus:border-[#203d36] rounded-xl transition-all duration-200 placeholder-[#b5bdba] font-medium"
                        required
                        disabled={otpLoading}
                      />
                    </div>
                  )}

                  <div className="pt-2 flex flex-col sm:flex-row gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setError('');
                        setOtpSuccessMsg('');
                        setAuthMode('auth');
                      }}
                      className="w-full sm:w-1/3 py-3 border border-slate-200 text-slate-600 bg-white hover:bg-slate-50 font-semibold text-xs rounded-xl transition-all duration-200 cursor-pointer text-center"
                    >
                      Back to Login
                    </button>

                    {!otpSuccessMsg && (
                      <button
                        type="submit"
                        disabled={otpLoading}
                        className="w-full sm:w-2/3 py-3 bg-[#365345] hover:bg-[#203d36] text-[#faf9f6] font-semibold text-xs rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer duration-200"
                      >
                        {otpLoading ? (
                          <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <span>Send Reset Link</span>
                        )}
                      </button>
                    )}
                  </div>
                </form>
              )}

              {/* Bottom login toggle link */}
              <div className="text-center pt-2">
                <span className="text-xs text-[#5c6e66] font-medium">
                  {isSignUp ? "Already have an account? " : "Don't have an account yet? "}
                </span>
                
                <button
                  type="button"
                  onClick={() => {
                    setError('');
                    setIsSignUp(prev => !prev);
                  }}
                  className="text-xs font-bold text-[#365345] hover:text-[#203d36] underline cursor-pointer decoration-solid transition-colors ml-1"
                >
                  {isSignUp ? "Sign In" : "Sign Up"}
                </button>
              </div>

            </div>
          )}

        </div>

        {/* Left Side Small Aesthetic footer */}
        <div className="text-center font-mono text-[10px] text-slate-400 font-medium">
          © 2026 Synapze Labs. Planted with care.
        </div>

      </div>

      {/* RIGHT SIDE: CLEAN & MINIMAL BRAND PANEL (5/12 cols) */}
      <div className="hidden lg:flex lg:col-span-5 bg-[#1b332c] text-white p-12 lg:p-16 flex-col justify-between relative overflow-hidden lg:min-h-[100vh]">
        
        {/* Soft Background Accent */}
        <div className="absolute top-1/3 right-0 w-[300px] h-[300px] bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header */}
        <div className="space-y-6 relative z-10 my-auto max-w-md">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-800/60 text-[#fdda64] text-xs font-semibold">
            <Sprout className="w-4 h-4 text-[#fdda64]" />
            <span>Digital Garden Workspace</span>
          </div>

          <h2 className="font-serif text-3xl sm:text-4xl font-medium tracking-tight leading-snug">
            A calm, personal space for your thoughts & habits.
          </h2>
          
          <p className="text-[#a1c4b8] text-sm leading-relaxed font-sans">
            Synapze lets you capture ideas, cultivate notes, and build daily consistency in a distraction-free environment.
          </p>

          {/* Minimal Feature List */}
          <div className="pt-4 space-y-4 text-xs sm:text-sm text-[#d4e6e0]">
            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center shrink-0 text-[#fdda64] font-bold text-xs">
                🌱
              </div>
              <div>
                <p className="font-bold text-white">Sow Seeds & Notes</p>
                <p className="text-xs text-[#89ab9e]">Organize your thoughts into interconnected knowledge nodes.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center shrink-0 text-emerald-400 font-bold text-xs">
                ⚡
              </div>
              <div>
                <p className="font-bold text-white">Track Daily Routines</p>
                <p className="text-xs text-[#89ab9e]">Build habits and track streaks over time.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center shrink-0 text-amber-300 font-bold text-xs">
                🔒
              </div>
              <div>
                <p className="font-bold text-white">Private & Offline-First</p>
                <p className="text-xs text-[#89ab9e]">Your data syncs securely to the cloud and stays accessible offline.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Minimal Footer */}
        <div className="relative z-10 pt-6 border-t border-white/10 text-xs text-[#789a8e] flex items-center justify-between font-mono">
          <span>Synapze Garden v2.4</span>
          <span>Cloud & Local Sync Active</span>
        </div>

      </div>

    </div>
  );
};
