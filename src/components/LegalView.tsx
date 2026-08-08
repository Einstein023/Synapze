import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Shield, FileText, Lock, CheckCircle, Eye, Globe } from 'lucide-react';

interface LegalViewProps {
  onBack: () => void;
  defaultTab?: 'terms' | 'privacy';
}

export const LegalView: React.FC<LegalViewProps> = ({ onBack, defaultTab = 'terms' }) => {
  const [activeTab, setActiveTab] = useState<'terms' | 'privacy'>(defaultTab);

  return (
    <div className="min-h-screen bg-[#faf9f6] text-[#1e293b] font-sans py-8 px-4 sm:px-6 md:px-12 selection:bg-[#cae9d5] selection:text-[#203d36]">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Navigation Header */}
        <div className="flex items-center justify-between border-b border-slate-200/80 pb-6">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200/80 hover:bg-slate-50 text-slate-700 font-semibold text-sm rounded-xl transition-all shadow-xs cursor-pointer min-h-[44px]"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>

          {/* Tab Switcher */}
          <div className="flex bg-slate-200/60 p-1 rounded-xl border border-slate-300/40">
            <button
              onClick={() => setActiveTab('terms')}
              className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all cursor-pointer min-h-[44px] flex items-center gap-2 ${
                activeTab === 'terms'
                  ? 'bg-white text-[#203d36] shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Terms of Service</span>
            </button>
            <button
              onClick={() => setActiveTab('privacy')}
              className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all cursor-pointer min-h-[44px] flex items-center gap-2 ${
                activeTab === 'privacy'
                  ? 'bg-white text-[#203d36] shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Shield className="w-4 h-4" />
              <span>Privacy Policy</span>
            </button>
          </div>
        </div>

        {/* Content Box */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-10 shadow-xs space-y-8 text-slate-700 leading-relaxed"
        >
          {activeTab === 'terms' ? (
            <div className="space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <span className="text-xs font-mono font-bold text-emerald-700 uppercase tracking-widest block mb-1">
                  LEGAL DOCUMENT
                </span>
                <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#203d36] tracking-tight">
                  Terms of Service
                </h1>
                <p className="text-xs text-slate-400 mt-2 font-mono">
                  Effective Date: August 7, 2026 | Last Updated: August 2026
                </p>
              </div>

              <section className="space-y-3">
                <h2 className="text-lg font-serif font-bold text-[#203d36]">1. Agreement to Terms</h2>
                <p className="text-sm">
                  By creating an account or accessing the Synapze platform, you agree to be bound by these Terms of Service. If you do not agree to all terms, you may not use or access our services.
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="text-lg font-serif font-bold text-[#203d36]">2. Account Registration & Responsibilities</h2>
                <p className="text-sm">
                  You are responsible for maintaining the confidentiality of your account credentials and for all activities conducted under your account. You agree to immediately notify Synapze of any unauthorized use or security breach.
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="text-lg font-serif font-bold text-[#203d36]">3. Acceptable Use Policy</h2>
                <p className="text-sm">
                  Synapze provides a digital workspace for personal knowledge organization and creative note-taking. You agree not to perform any of the following prohibited activities:
                </p>
                <ul className="list-disc pl-5 text-sm space-y-1.5 text-slate-600">
                  <li>Attempting to bypass platform security measures or disrupt servers</li>
                  <li>Using automated scraping tools to extract application code or data</li>
                  <li>Uploading malicious content, viruses, or illegal material</li>
                  <li>Interfering with other users' access to the workspace</li>
                </ul>
              </section>

              <section className="space-y-3">
                <h2 className="text-lg font-serif font-bold text-[#203d36]">4. Ownership & Intellectual Property</h2>
                <p className="text-sm">
                  You retain complete ownership of all content, notes, and seeds created within your Synapze garden. Synapze retains all rights, title, and interest in and to the platform codebase, design elements, mascots, and branding.
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="text-lg font-serif font-bold text-[#203d36]">5. Account Termination & Deletion</h2>
                <p className="text-sm">
                  You may permanently delete your account at any time through the Account Settings. Upon confirming account deletion, your sowed data and companion history will be permanently expunged from our database according to our data deletion schedule.
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="text-lg font-serif font-bold text-[#203d36]">6. Service Availability & Changes</h2>
                <p className="text-sm">
                  We continuously improve our platform. Synapze reserves the right to modify, suspend, or discontinue features with reasonable notice where applicable.
                </p>
              </section>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <span className="text-xs font-mono font-bold text-emerald-700 uppercase tracking-widest block mb-1">
                  PRIVACY GUARANTEE
                </span>
                <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#203d36] tracking-tight">
                  Privacy Policy
                </h1>
                <p className="text-xs text-slate-400 mt-2 font-mono">
                  Effective Date: August 7, 2026 | Last Updated: August 2026
                </p>
              </div>

              <section className="space-y-3">
                <h2 className="text-lg font-serif font-bold text-[#203d36]">1. Information We Collect</h2>
                <p className="text-sm">
                  We collect information to provide, personalize, and secure your workspace experience:
                </p>
                <ul className="list-disc pl-5 text-sm space-y-1.5 text-slate-600">
                  <li><strong>Account Information:</strong> Email address, display name, and avatar settings.</li>
                  <li><strong>Auth Provider Information:</strong> Provider type (Google, GitHub, or Email) used during authentication.</li>
                  <li><strong>User Content:</strong> Notes, seedlings, tags, and companion interaction logs created in your workspace.</li>
                  <li><strong>System Diagnostics:</strong> Anonymized error logs and sync state to ensure offline/online data reliability.</li>
                </ul>
              </section>

              <section className="space-y-3">
                <h2 className="text-lg font-serif font-bold text-[#203d36]">2. How We Use Your Data</h2>
                <p className="text-sm">
                  Your data is strictly utilized to deliver platform features, facilitate real-time synchronization, and personalize companion interactions. <strong>We do not sell, rent, or trade your personal data to third parties.</strong>
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="text-lg font-serif font-bold text-[#203d36]">3. Data Security & Encryption</h2>
                <p className="text-sm">
                  We employ industry-standard encryption protocols (TLS/HTTPS in transit and AES-256 at rest) alongside Firebase Authentication to safeguard your account. Passwords are securely hashed.
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="text-lg font-serif font-bold text-[#203d36]">4. Offline & Local Storage</h2>
                <p className="text-sm">
                  Synapze utilizes client-side local caching (`localStorage` & IndexedDB) to enable seamless offline operation. Offline edits are encrypted locally and synchronized once your internet connection is restored.
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="text-lg font-serif font-bold text-[#203d36]">5. Your Rights & Data Portability</h2>
                <p className="text-sm">
                  You hold full control over your data. You may export your notes into standard markdown formats or initiate full account deletion at any time in Settings.
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="text-lg font-serif font-bold text-[#203d36]">6. Contact Privacy Team</h2>
                <p className="text-sm">
                  If you have questions regarding this Privacy Policy or your data, contact our security team at <span className="font-semibold text-[#203d36]">privacy@synapze.io</span>.
                </p>
              </section>
            </div>
          )}

          <div className="pt-6 border-t border-slate-100 flex justify-between items-center text-xs text-slate-500 font-mono">
            <span>© 2026 Synapze Inc. All Rights Reserved.</span>
            <button
              onClick={onBack}
              className="text-[#203d36] font-bold hover:underline cursor-pointer min-h-[44px] flex items-center"
            >
              Close Document
            </button>
          </div>
        </motion.div>

      </div>
    </div>
  );
};
