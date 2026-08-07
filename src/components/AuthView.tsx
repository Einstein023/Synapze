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
  ArrowRight
} from 'lucide-react';

export const AuthView: React.FC<{ onBack: () => void; onGoToWorkspace?: () => void }> = ({ onBack, onGoToWorkspace }) => {
  const { 
    signInWithGoogle, 
    signInWithEmail, 
    signUpWithEmail, 
    simulateEmailSignIn, 
    isAuthenticated, 
    userEmail, 
    signOutUser,
    sendRecoveryOtp,
    verifyOtpAndSetPassword,
    sendMagicLink
  } = useGarden();

  // Primary Auth States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  // Magic Link States
  const [useMagicLink, setUseMagicLink] = useState(false);
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [magicLinkLoading, setMagicLinkLoading] = useState(false);
  const [magicLinkMessage, setMagicLinkMessage] = useState('');

  // Password Recovery States
  const [authMode, setAuthMode] = useState<'auth' | 'forgot_password' | 'verify_otp'>('auth');
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
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
      // Scale Throttle Delay Simulation
      await new Promise(resolve => setTimeout(resolve, 800));
      const res = await sendRecoveryOtp(recoveryEmail);
      if (res.success) {
        setOtpSuccessMsg(res.message);
        setAuthMode('verify_otp');
        setOtpCode('');
        setNewPassword('');
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
    if (!recoveryEmail || !otpCode.trim() || !newPassword.trim()) {
      setError('Please fill out all fields.');
      return;
    }
    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters.');
      return;
    }
    setError('');
    setOtpSuccessMsg('');
    setOtpLoading(true);

    try {
      // Scale Throttle Delay Simulation
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

  // Error handling timeout
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(''), 6000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const handleSendMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }
    setError('');
    setMagicLinkLoading(true);
    try {
      const res = await sendMagicLink(email);
      setMagicLinkSent(true);
      setMagicLinkMessage(res.message);
    } catch (err: any) {
      setError(getFriendlyErrorMessage(err));
    } finally {
      setMagicLinkLoading(false);
    }
  };

  const handleVerifyMagicLinkSimulation = async () => {
    setError('');
    setLoading(true);
    try {
      await signInWithEmail(email, "magic-pwd-123");
      setUseMagicLink(false);
      setMagicLinkSent(false);
    } catch (err: any) {
      setError(getFriendlyErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOutUser();
      onBack(); // Redirect to landing page
    } catch (err) {
      console.error(err);
    }
  };



  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (!agreedToTerms && !isAuthenticated) {
      setError('Please agree to the Terms of Service and Privacy Policy to continue.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      if (isSignUp) {
        await signUpWithEmail(email, password);
      } else {
        await signInWithEmail(email, password);
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
                      className="w-full flex items-center justify-center gap-2.5 px-4 py-3.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl shadow-xs transition-colors duration-200 cursor-pointer disabled:opacity-50"
                    >
                      <svg className="w-4.5 h-4.5" viewBox="0 0 24 24">
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
                      <span className="font-sans text-xs">Continue with Google</span>
                    </button>
                  </div>

                  {/* Minimal Divider */}
                  <div className="relative flex py-2 items-center">
                    <div className="flex-grow border-t border-slate-205"></div>
                    <span className="flex-shrink mx-4 text-[10px] font-mono font-bold text-slate-400 tracking-wider">OR</span>
                    <div className="flex-grow border-t border-slate-205"></div>
                  </div>

                  {/* Dynamic Credential Forms */}
                  {useMagicLink ? (
                    <form onSubmit={handleSendMagicLink} className="space-y-5">
                      <div className="space-y-1 text-left">
                        <span className="text-[10px] font-mono font-bold tracking-wider text-[#365345] uppercase block">Passwordless Access Link</span>
                        <h4 className="font-serif text-lg font-bold text-[#203d36]">Authorize with Magic Link</h4>
                        <p className="text-xs text-[#5c6e66] leading-relaxed">
                          Input your email below. We will send a secure verification link that grants entry. Once verified, you will be directed straight to your garden.
                        </p>
                      </div>

                      <div className="space-y-1.5 text-left">
                        <label className="text-[11px] font-medium text-[#5c6e66] font-sans block">Email address</label>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="example@synapze.io"
                          className="w-full py-3 px-4 block border border-slate-205 bg-[#f6f5f0]/40 focus:bg-white text-[#203d36] text-sm focus:outline-none focus:border-[#203d36] rounded-xl transition-all duration-200 placeholder-[#b5bdba] font-medium"
                          required
                          disabled={magicLinkLoading}
                        />
                      </div>

                      {magicLinkSent && (
                        <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl text-emerald-800 text-xs leading-relaxed space-y-3 text-left">
                          <p className="font-bold">✉️ Magic confirmation link sent!</p>
                          <p>{magicLinkMessage}</p>
                          <button
                            type="button"
                            onClick={handleVerifyMagicLinkSimulation}
                            className="w-full py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer shadow-sm"
                          >
                            Verify Link & Access Garden Workspace
                          </button>
                        </div>
                      )}

                      <div className="flex gap-3 pt-2">
                        <button
                          type="button"
                          onClick={() => {
                            setUseMagicLink(false);
                            setMagicLinkSent(false);
                          }}
                          className="w-1/3 py-3 border border-slate-200 text-[#5c6e66] hover:bg-slate-50 font-semibold text-xs rounded-xl transition-all duration-200 cursor-pointer"
                        >
                          Use Password
                        </button>
                        <button
                          type="submit"
                          disabled={magicLinkLoading}
                          className="w-2/3 py-3 bg-[#365345] hover:bg-[#203d36] text-white font-semibold text-xs rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer duration-200"
                        >
                          {magicLinkLoading ? (
                            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <span>Send Magic Link</span>
                          )}
                        </button>
                      </div>
                    </form>
                  ) : (
                    <form onSubmit={handleEmailAuth} className="space-y-5">
                      
                      {/* Email Field with Magic link indicator */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <label className="text-[11px] font-medium text-[#5c6e66] font-sans">Email address</label>
                          <button 
                            type="button"
                            onClick={() => setUseMagicLink(true)}
                            className="text-[11px] text-[#5c6e66] hover:text-[#203d36] font-bold underline decoration-dotted transition-colors"
                          >
                            Use Magic Link
                          </button>
                        </div>
                        
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

                      {/* Password Field with reveal toggle & forget link */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <label className="text-[11px] font-medium text-[#5c6e66] font-sans">Password</label>
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
                        </div>

                        <div className="relative">
                          <input
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full py-3 pl-4 pr-11 block border border-slate-205 bg-[#f6f5f0]/40 focus:bg-white text-[#203d36] text-sm focus:outline-none focus:border-[#203d36] rounded-xl transition-all duration-200 placeholder-[#b5bdba] font-medium"
                            required
                            disabled={loading}
                          />

                          {/* Show password button */}
                          <button
                            type="button"
                            onClick={() => setShowPassword(p => !p)}
                            className="absolute right-4.5 top-1/2 -translate-y-1/2 text-[#5c6e66] hover:text-[#203d36] transition-colors"
                          >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      {/* Custom Elegant Accept Terms Checkbox */}
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
                          I agree to the Terms of Service and Privacy Policy
                        </span>
                      </div>

                      {/* Primary Action Submit button */}
                      <div className="pt-2">
                        <button
                          type="submit"
                          disabled={loading}
                          className="w-full py-3.5 bg-[#365345] hover:bg-[#203d36] text-[#faf9f6]/95 font-semibold text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer duration-200"
                        >
                          {loading ? (
                            <span className="w-4.5 h-4.5 border-2 border-[#faf9f6] border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <span>{isSignUp ? 'Register Sprout Profile' : 'Enter Terminal'}</span>
                          )}
                        </button>
                      </div>

                    </form>
                  )}
                </>
              )}

              {authMode === 'forgot_password' && (
                <form onSubmit={handleSendOtp} className="space-y-5 text-left bg-white p-5 border border-slate-200/60 rounded-2xl shadow-xs">
                  <div className="space-y-1">
                    <h3 className="font-serif text-base font-bold text-[#203d36]">Master Key Recovery</h3>
                    <p className="text-xs text-[#5c6e66] leading-relaxed">
                      Enter your gardener email below. We will send a secure 6-digit recovery OTP code valid for exactly 10 minutes.
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-medium text-[#5c6e66]">Registered Email address</label>
                    <input
                      type="email"
                      value={recoveryEmail}
                      onChange={(e) => setRecoveryEmail(e.target.value)}
                      placeholder="example@synapze.io"
                      className="w-full py-3 px-4 block border border-slate-205 bg-[#f6f5f0]/40 focus:bg-white text-[#203d36] text-sm focus:outline-none focus:border-[#203d36] rounded-xl transition-all duration-200 placeholder-[#b5bdba] font-medium"
                      required
                      disabled={otpLoading}
                    />
                  </div>

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
                      Go Back
                    </button>

                    <button
                      type="submit"
                      disabled={otpLoading}
                      className="w-full sm:w-2/3 py-3 bg-[#365345] hover:bg-[#203d36] text-[#faf9f6] font-semibold text-xs rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer duration-200"
                    >
                      {otpLoading ? (
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <span>Send Recovery OTP</span>
                      )}
                    </button>
                  </div>
                </form>
              )}

              {authMode === 'verify_otp' && (
                <form onSubmit={handleResetPassword} className="space-y-5 text-left bg-white p-5 border border-slate-200/60 rounded-2xl shadow-xs">
                  <div className="space-y-1">
                    <h3 className="font-serif text-base font-bold text-[#203d36]">Verify Access Code</h3>
                    <p className="text-xs text-[#5c6e66] leading-relaxed">
                      A recovery code has been broadcasted. Input the 6-digit code and configure your replacement master password.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-medium text-[#5c6e66]">Gardener Email</label>
                      <input
                        type="email"
                        value={recoveryEmail}
                        onChange={(e) => setRecoveryEmail(e.target.value)}
                        placeholder="example@synapze.io"
                        className="w-full py-2.5 px-3 block border border-slate-205 bg-[#f6f5f0]/40 focus:bg-white text-[#203d36] text-xs focus:outline-none focus:border-[#203d36] rounded-xl transition-all placeholder-[#b5bdba]"
                        required
                        disabled={otpLoading}
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-medium text-[#5c6e66]">6-Digit Recovery OTP</label>
                        <input
                          type="text"
                          maxLength={6}
                          value={otpCode}
                          onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                          placeholder="000000"
                          className="w-full py-3 px-4 block border border-slate-250 bg-white text-[#203d36] text-base font-bold text-center tracking-widest focus:outline-none focus:border-[#203d36] rounded-xl placeholder-slate-300"
                          required
                          disabled={otpLoading}
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[11px] font-medium text-[#5c6e66]">New Master Password</label>
                        <input
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="Min 6 characters"
                          className="w-full py-3 px-4 block border border-slate-205 bg-white text-[#203d36] text-sm focus:outline-none focus:border-[#203d36] rounded-xl placeholder-[#b5bdba]"
                          required
                          disabled={otpLoading}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 flex flex-col sm:flex-row gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setError('');
                        setOtpSuccessMsg('');
                        setAuthMode('forgot_password');
                      }}
                      className="w-full sm:w-1/3 py-3 border border-slate-200 text-slate-600 bg-white hover:bg-slate-50 font-semibold text-xs rounded-xl transition-all duration-200 cursor-pointer text-center"
                    >
                      Back to Send
                    </button>

                    <button
                      type="submit"
                      disabled={otpLoading}
                      className="w-full sm:w-2/3 py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer duration-200"
                    >
                      {otpLoading ? (
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <span>Verify & Set Password</span>
                      )}
                    </button>
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
                  onClick={() => setIsSignUp(prev => !prev)}
                  className="text-xs font-bold text-[#365345] hover:text-[#203d36] underline cursor-pointer decoration-solid transition-colors"
                >
                  {isSignUp ? "Sign in to garden" : "Start growing for free"}
                </button>
              </div>

            </div>
          )}

        </div>

        {/* Left Side Small Aesthetic footer */}
        <div className="text-center font-mono text-[10px] text-slate-400 font-medium">
          © 2261 Synapze Labs. Planted with care.
        </div>

      </div>

      {/* RIGHT SIDE: BEAUTIFUL BRAND CORNER INTERACTIVE METRIC GRAPH (5/12 cols) */}
      <div className="hidden lg:flex lg:col-span-5 bg-[#2d4239] text-white p-6 sm:p-12 lg:p-16 flex-col justify-between relative overflow-hidden lg:min-h-[100vh]">
        
        {/* Aesthetic Background Soft Glows inside dark layout */}
        <div className="absolute top-1/4 right-0 w-[400px] h-[400px] bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 left-10 w-[200px] h-[200px] bg-[#fdda64]/5 rounded-full blur-3xl pointer-events-none" />

        {/* Slogan Text Header block */}
        <div className="space-y-4 max-w-lg relative z-10 pt-10">
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-medium tracking-tight h-auto leading-[1.12]">
            The simplest way to manage your workforce
          </h2>
          
          <p className="text-[#bfdad0] text-xs sm:text-sm leading-relaxed max-w-md font-sans">
            Transform complex data into an organic, living knowledge base. Synapze is the fertile ground for your team's collective intelligence.
          </p>
        </div>

        {/* Live Glass-morphism dashboard simulation */}
        <div className="relative my-12 z-10 w-full max-w-md mx-auto">
          
          {/* Main Simulated Browser Box */}
          <div className="bg-white/10 border border-white/15 backdrop-blur-md rounded-2xl p-5 shadow-2xl relative space-y-5">
            
            {/* Top Bar with dot indicators, avatars, + add team */}
            <div className="flex items-center justify-between">
              
              {/* Fake navigation dots */}
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#ea5c54]" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#f4be4f]" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#57c05b]" />
              </div>

              {/* Avatars pile with count */}
              <div className="flex items-center gap-1.5">
                <div className="flex -space-x-2">
                  <div className="w-6 h-6 rounded-full bg-slate-300 border border-[#2d4239] text-[9px] font-bold flex items-center justify-center text-slate-800">M</div>
                  <div className="w-6 h-6 rounded-full bg-[#fdda64] border border-[#2d4239] text-[9px] font-bold flex items-center justify-center text-slate-900">A</div>
                  <div className="w-6 h-6 rounded-full bg-[#8ae3b2] border border-[#2d4239] text-[9px] font-bold flex items-center justify-center text-[#2d4239]">{activeMembersCount}</div>
                </div>

                <button 
                  onClick={() => setIsFloatingInviteVisible(prev => !prev)}
                  className="px-2 py-1 bg-[#e2f1e6] hover:bg-[#cadcd1] text-[#2d4239] text-[9px] font-bold rounded-md flex items-center gap-1 transition-colors"
                >
                  <Plus className="w-2.5 h-2.5" />
                  Add member
                </button>
              </div>

            </div>

            {/* Simulated Grid Stats: Productive and Focused hours */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3.5">
              
              {/* Productive hours widget with custom SVG vector chart line */}
              <div className="sm:col-span-8 bg-white/5 border border-white/5 p-4 rounded-xl flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-[9px] text-[#bfdad0] font-sans block leading-none">Productive Time / Day</span>
                  <div className="text-xl font-bold font-serif leading-none pt-1">12.4 hr</div>
                  <span className="text-[8px] text-emerald-400 font-mono tracking-tight font-medium block pt-1">📈 +23% last week</span>
                </div>

                {/* Beautiful vector curve chart line */}
                <svg className="w-20 h-10 text-emerald-400 shrink-0" viewBox="0 0 100 40" fill="none">
                  <path 
                    d="M5 35 Q 25 -10, 45 25 T 90 5" 
                    stroke="currentColor" 
                    strokeWidth="2.5" 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                  />
                  <path 
                    d="M5 35 Q 25 -10, 45 25 T 90 5 L 90 40 L 5 40 Z" 
                    fill="url(#sparkGradient)" 
                    opacity="0.15" 
                  />
                  <defs>
                    <linearGradient id="sparkGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="currentColor" />
                      <stop offset="100%" stopColor="transparent" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>

              {/* Focused time widget */}
              <div className="sm:col-span-4 bg-white/5 border border-white/5 p-4 rounded-xl flex flex-col justify-center">
                <span className="text-[9px] text-[#bfdad0] font-sans">Focused Time</span>
                <div className="text-xl font-bold font-serif leading-none pt-1">8.5 hr</div>
              </div>

            </div>

            {/* Bottom Section Widget utilization info */}
            <div className="space-y-1.5 pt-1">
              <span className="text-[9px] font-sans text-slate-350 block uppercase tracking-wider font-semibold">Team's Utilization</span>
              <div className="flex flex-wrap gap-4 text-[10px] text-slate-205 font-medium">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#fdda64] block" />
                  Marketing
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#8ae3b2] block" />
                  Customer Success
                </span>
              </div>
            </div>

            {/* FLOATING ADD MEMBER MODAL (Overlapping interactive absolute element) */}
            {isFloatingInviteVisible && (
              <div className="absolute right-0 bottom-[-16px] xl:right-[-25px] xl:bottom-[-20px] bg-white text-[#2a2a2a] w-64 p-4.5 rounded-xl shadow-2xl border border-slate-200/90 space-y-3 z-20 hover:scale-[1.02] transition-transform duration-300">
                <div className="flex items-center justify-between">
                  <span className="font-serif font-bold text-xs text-[#203d36]">Add Member</span>
                  <button 
                    onClick={() => setIsFloatingInviteVisible(false)} 
                    className="text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Mini invite simple form */}
                <form onSubmit={handleAddMember} className="flex gap-1.5">
                  <div className="relative flex-1">
                    <input
                      type="email"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      placeholder="rafiqur@gmail.com"
                      className="w-full bg-[#faf9f6] border border-slate-200 px-2 py-1.5 text-[10px] text-slate-800 rounded focus:outline-none focus:border-[#203d36]"
                    />
                  </div>
                  <button 
                    type="submit" 
                    className="bg-[#203d36] text-[9px] hover:bg-[#162e29] font-bold text-white px-2.5 py-1.5 rounded transition-colors"
                  >
                    Send Invite
                  </button>
                </form>

                {/* Team lists inside preview widget */}
                <div className="space-y-2 pt-1 border-t border-slate-100">
                  <div className="flex items-center justify-between text-[11px]">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-[#fdda64] text-[9px] font-bold text-[#453712] flex items-center justify-center">LA</span>
                      <span className="font-bold text-slate-800">Leslie Alexander</span>
                    </div>
                    <span className="text-[8px] font-mono text-slate-400 font-bold">OWNER</span>
                  </div>

                  {/* Dynamic members list */}
                  {invitedMembers.map((m, idx) => (
                    <div key={idx} className="flex items-center justify-between text-[11px] animate-fade-in animate-duration-300">
                      <div className="flex items-center gap-2">
                        <span className={`w-6 h-6 rounded-full ${m.color} text-[9px] font-bold text-white flex items-center justify-center`}>{m.initial}</span>
                        <span className="font-medium text-slate-700 truncate max-w-[120px]">{m.email}</span>
                      </div>
                      <span className="text-[8px] font-mono text-emerald-600 font-bold">{m.role}</span>
                    </div>
                  ))}
                </div>

              </div>
            )}

          </div>

        </div>

        {/* Sponsor/Enterprise logos line at bottom of the dark banner */}
        <div className="relative z-10">
          <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 text-xs font-serif font-bold text-white/50 pb-2">
            <span>WeChat</span>
            <span>Booking.com</span>
            <span>Google</span>
            <span>Spotify</span>
            <span className="normal-case">stripe</span>
          </div>
        </div>

      </div>

    </div>
  );
};
