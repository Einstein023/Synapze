import React, { useState } from 'react';
import { ArrowLeft, Shield, FileText, History, CheckCircle2, Sparkles, Zap, ShieldCheck } from 'lucide-react';

interface LegalViewProps {
  onBack: () => void;
  defaultTab?: 'terms' | 'privacy' | 'changelog';
}

export const LegalView: React.FC<LegalViewProps> = ({ onBack, defaultTab = 'terms' }) => {
  const [activeTab, setActiveTab] = useState<'terms' | 'privacy' | 'changelog'>(defaultTab);

  return (
    <div className="min-h-screen bg-[#faf9f6] text-[#1e293b] font-sans py-6 sm:py-10 px-4 sm:px-6 md:px-12 selection:bg-[#cae9d5] selection:text-[#203d36]">
      <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8">
        
        {/* Navigation Header */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-5 sm:pb-6">
          <button
            onClick={onBack}
            className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-white border border-slate-200/80 hover:bg-slate-50 active:bg-slate-100 text-slate-800 font-bold text-sm sm:text-base rounded-2xl transition-all shadow-xs cursor-pointer min-h-[48px] shrink-0"
          >
            <ArrowLeft className="w-5 h-5 text-slate-600" />
            <span>Back to Synapze</span>
          </button>

          {/* Tab Switcher */}
          <div className="flex bg-slate-200/60 p-1.5 rounded-2xl border border-slate-300/40 w-full sm:w-auto overflow-x-auto">
            <button
              onClick={() => setActiveTab('terms')}
              className={`flex-1 sm:flex-initial px-4 sm:px-5 py-3 text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer min-h-[48px] flex items-center justify-center gap-2 whitespace-nowrap ${
                activeTab === 'terms'
                  ? 'bg-white text-[#203d36] shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileText className="w-4 h-4 shrink-0" />
              <span>Terms of Service</span>
            </button>
            <button
              onClick={() => setActiveTab('privacy')}
              className={`flex-1 sm:flex-initial px-4 sm:px-5 py-3 text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer min-h-[48px] flex items-center justify-center gap-2 whitespace-nowrap ${
                activeTab === 'privacy'
                  ? 'bg-white text-[#203d36] shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Shield className="w-4 h-4 shrink-0" />
              <span>Privacy Policy</span>
            </button>
            <button
              onClick={() => setActiveTab('changelog')}
              className={`flex-1 sm:flex-initial px-4 sm:px-5 py-3 text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer min-h-[48px] flex items-center justify-center gap-2 whitespace-nowrap ${
                activeTab === 'changelog'
                  ? 'bg-white text-[#203d36] shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <History className="w-4 h-4 shrink-0" />
              <span>Changelog</span>
            </button>
          </div>
        </div>

        {/* Content Box */}
        <div
          className="bg-white border border-slate-200/80 rounded-2xl sm:rounded-3xl p-5 sm:p-8 md:p-10 shadow-xs space-y-6 sm:space-y-8 text-slate-700 leading-relaxed text-left"
        >
          {activeTab === 'terms' ? (
            <div className="space-y-6 sm:space-y-8">
              <div className="border-b border-slate-100 pb-5">
                <span className="text-[11px] font-mono font-extrabold text-emerald-700 uppercase tracking-widest block mb-1.5">
                  LEGAL DOCUMENT
                </span>
                <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#203d36] tracking-tight">
                  Terms of Service
                </h1>
                <p className="text-xs text-slate-400 mt-2 font-mono">
                  Effective Date: August 7, 2026 | Last Updated: August 2026
                </p>
              </div>

              <section className="space-y-2.5">
                <h2 className="text-base sm:text-lg font-serif font-bold text-[#203d36]">1. Agreement to Terms</h2>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  By creating an account or accessing the Synapze platform, you agree to be bound by these Terms of Service. If you do not agree to all terms, you may not use or access our services.
                </p>
              </section>

              <section className="space-y-2.5">
                <h2 className="text-base sm:text-lg font-serif font-bold text-[#203d36]">2. Account Registration & Responsibilities</h2>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  You are responsible for maintaining the confidentiality of your account credentials and for all activities conducted under your account. You agree to immediately notify Synapze of any unauthorized use or security breach.
                </p>
              </section>

              <section className="space-y-2.5">
                <h2 className="text-base sm:text-lg font-serif font-bold text-[#203d36]">3. Acceptable Use Policy</h2>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Synapze provides a digital workspace for personal knowledge organization and creative note-taking. You agree not to perform any of the following prohibited activities:
                </p>
                <ul className="list-disc pl-5 text-xs sm:text-sm space-y-2 text-slate-600 leading-relaxed">
                  <li>Attempting to bypass platform security measures or disrupt servers</li>
                  <li>Using automated scraping tools to extract application code or data</li>
                  <li>Uploading malicious content, viruses, or illegal material</li>
                  <li>Interfering with other users' access to the workspace</li>
                </ul>
              </section>

              <section className="space-y-2.5">
                <h2 className="text-base sm:text-lg font-serif font-bold text-[#203d36]">4. Ownership & Intellectual Property</h2>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  You retain complete ownership of all content, notes, and seeds created within your Synapze garden. Synapze retains all rights, title, and interest in and to the platform codebase, design elements, mascots, and branding.
                </p>
              </section>

              <section className="space-y-2.5">
                <h2 className="text-base sm:text-lg font-serif font-bold text-[#203d36]">5. Account Termination & Deletion</h2>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  You may permanently delete your account at any time through the Account Settings. Upon confirming account deletion, your sowed data and companion history will be permanently expunged from our database according to our data deletion schedule.
                </p>
              </section>

              <section className="space-y-2.5">
                <h2 className="text-base sm:text-lg font-serif font-bold text-[#203d36]">6. Service Availability & Changes</h2>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  We continuously improve our platform. Synapze reserves the right to modify, suspend, or discontinue features with reasonable notice where applicable.
                </p>
              </section>
            </div>
          ) : activeTab === 'privacy' ? (
            <div className="space-y-6 sm:space-y-8">
              <div className="border-b border-slate-100 pb-5">
                <span className="text-[11px] font-mono font-extrabold text-emerald-700 uppercase tracking-widest block mb-1.5">
                  PRIVACY GUARANTEE
                </span>
                <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#203d36] tracking-tight">
                  Privacy Policy
                </h1>
                <p className="text-xs text-slate-400 mt-2 font-mono">
                  Effective Date: August 7, 2026 | Last Updated: August 2026
                </p>
              </div>

              <section className="space-y-2.5">
                <h2 className="text-base sm:text-lg font-serif font-bold text-[#203d36]">1. Information We Collect</h2>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  We collect information to provide, personalize, and secure your workspace experience:
                </p>
                <ul className="list-disc pl-5 text-xs sm:text-sm space-y-2 text-slate-600 leading-relaxed">
                  <li><strong>Account Information:</strong> Email address, display name, and avatar settings.</li>
                  <li><strong>Auth Provider Information:</strong> Provider type (Google, GitHub, or Email) used during authentication.</li>
                  <li><strong>User Content:</strong> Notes, seedlings, tags, and companion interaction logs created in your workspace.</li>
                  <li><strong>System Diagnostics:</strong> Anonymized error logs and sync state to ensure offline/online data reliability.</li>
                </ul>
              </section>

              <section className="space-y-2.5">
                <h2 className="text-base sm:text-lg font-serif font-bold text-[#203d36]">2. How We Use Your Data</h2>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Your data is strictly utilized to deliver platform features, facilitate real-time synchronization, and personalize companion interactions. <strong>We do not sell, rent, or trade your personal data to third parties.</strong>
                </p>
              </section>

              <section className="space-y-2.5">
                <h2 className="text-base sm:text-lg font-serif font-bold text-[#203d36]">3. Data Security & Encryption</h2>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  We employ industry-standard encryption protocols (TLS/HTTPS in transit and AES-256 at rest) alongside Firebase Authentication to safeguard your account. Passwords are securely hashed.
                </p>
              </section>

              <section className="space-y-2.5">
                <h2 className="text-base sm:text-lg font-serif font-bold text-[#203d36]">4. Offline & Local Storage</h2>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Synapze utilizes client-side local caching (`localStorage` & IndexedDB) to enable seamless offline operation. Offline edits are encrypted locally and synchronized once your internet connection is restored.
                </p>
              </section>

              <section className="space-y-2.5">
                <h2 className="text-base sm:text-lg font-serif font-bold text-[#203d36]">5. Your Rights & Data Portability</h2>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  You hold full control over your data. You may export your notes into standard markdown formats or initiate full account deletion at any time in Settings.
                </p>
              </section>

              <section className="space-y-2.5">
                <h2 className="text-base sm:text-lg font-serif font-bold text-[#203d36]">6. Contact Privacy Team</h2>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  If you have questions regarding this Privacy Policy or your data, contact our security team at <span className="font-semibold text-[#203d36]">privacy@synapze.io</span>.
                </p>
              </section>
            </div>
          ) : (
            <div className="space-y-6 sm:space-y-8">
              <div className="border-b border-slate-100 pb-5">
                <span className="text-[11px] font-mono font-extrabold text-emerald-700 uppercase tracking-widest block mb-1.5">
                  RELEASE NOTES & UPDATES
                </span>
                <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#203d36] tracking-tight">
                  Platform Changelog
                </h1>
                <p className="text-xs text-slate-400 mt-2 font-mono">
                  Version 2.4.0 | Released: August 2026
                </p>
              </div>

              {/* Version 2.4.0 */}
              <div className="space-y-3 p-4 sm:p-5 bg-[#f6f5f0]/60 rounded-2xl border border-slate-200/60">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#203d36] text-white text-xs font-mono font-bold rounded-full">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
                    v2.4.0 — Latest Release
                  </span>
                  <span className="text-xs font-mono text-slate-400">August 2026</span>
                </div>
                <h3 className="text-base font-serif font-bold text-[#203d36]">Fast Authentication & Instant Workspace Navigation</h3>
                <ul className="space-y-2 text-xs sm:text-sm text-slate-600">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>Optimized Authentication Performance:</strong> Streamlined email/password authentication flow with non-blocking database queries.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>Password Policy Updates:</strong> Standardized 8–20 character password length validation with password confirmation fields.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>Legal Document Integration:</strong> Direct navigation from Dashboard footers to Privacy Policy, Terms of Service, and Platform Changelog.</span>
                  </li>
                </ul>
              </div>

              {/* Version 2.3.0 */}
              <div className="space-y-3 p-4 sm:p-5 bg-white rounded-2xl border border-slate-200/60">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-700 text-xs font-mono font-bold rounded-full border border-slate-200">
                    <Zap className="w-3.5 h-3.5 text-amber-500" />
                    v2.3.0
                  </span>
                  <span className="text-xs font-mono text-slate-400">July 2026</span>
                </div>
                <h3 className="text-base font-serif font-bold text-[#203d36]">AI Companion & Interactive Knowledge Graph</h3>
                <ul className="space-y-2 text-xs sm:text-sm text-slate-600">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>Garden Companion AI:</strong> Chat with your personalized AI gardener assistant to structure notes and plant creative seeds.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>Visual Knowledge Ecosystem:</strong> Interactive force-directed node graph mapping notes, tags, and archived seedlings.</span>
                  </li>
                </ul>
              </div>

              {/* Version 2.2.0 */}
              <div className="space-y-3 p-4 sm:p-5 bg-white rounded-2xl border border-slate-200/60">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-700 text-xs font-mono font-bold rounded-full border border-slate-200">
                    <ShieldCheck className="w-3.5 h-3.5 text-indigo-500" />
                    v2.2.0
                  </span>
                  <span className="text-xs font-mono text-slate-400">June 2026</span>
                </div>
                <h3 className="text-base font-serif font-bold text-[#203d36]">Real-Time Offline Synchronization & Vault Archive</h3>
                <ul className="space-y-2 text-xs sm:text-sm text-slate-600">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>Offline Local Persistence:</strong> Full client-side caching with auto-reconnection and seamless background sync.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>Vault & Recycle Bin:</strong> Safely archive or restore deleted seedlings with permanent purge capabilities.</span>
                  </li>
                </ul>
              </div>

            </div>
          )}

          <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-500 font-mono">
            <span>© 2026 Synapze Inc. All Rights Reserved.</span>
            <button
              onClick={onBack}
              className="text-[#203d36] font-bold hover:underline cursor-pointer min-h-[44px] flex items-center justify-center"
            >
              Close Document
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
