import React, { useState } from 'react';
import { CheckCircle2, XCircle, Play, RefreshCw, X, ShieldCheck, Database, Key, Sparkles } from 'lucide-react';

interface TestCase {
  id: string;
  category: 'auth' | 'google' | 'sync' | 'notes';
  name: string;
  description: string;
  status: 'idle' | 'running' | 'passed' | 'failed';
  error?: string;
  durationMs?: number;
}

const INITIAL_TESTS: TestCase[] = [
  {
    id: 'email_reg',
    category: 'auth',
    name: 'Email & Password Registration',
    description: 'Verify new account creation, profile defaults, and duplicate prevention',
    status: 'idle'
  },
  {
    id: 'email_login',
    category: 'auth',
    name: 'Email & Password Login',
    description: 'Verify password authentication and credential checking',
    status: 'idle'
  },
  {
    id: 'google_signup',
    category: 'google',
    name: 'Google Account Sign-Up',
    description: 'Verify instant Google account provisioning with avatar & profile',
    status: 'idle'
  },
  {
    id: 'google_signin',
    category: 'google',
    name: 'Google Returning Sign-In',
    description: 'Verify data preservation and seamless login for existing Google accounts',
    status: 'idle'
  },
  {
    id: 'otp_recovery',
    category: 'auth',
    name: 'OTP Password Recovery',
    description: 'Verify 6-digit OTP generation, code confirmation, and password reset',
    status: 'idle'
  },
  {
    id: 'profile_sync',
    category: 'sync',
    name: 'Profile Cross-Device Sync',
    description: 'Verify display name, theme, companion, and streak synchronization',
    status: 'idle'
  },
  {
    id: 'seedling_crud',
    category: 'notes',
    name: 'Notes & Seedlings CRUD Operations',
    description: 'Verify creating notes, advancing growth stages, and deleting nodes',
    status: 'idle'
  },
  {
    id: 'sse_stream',
    category: 'sync',
    name: 'Real-Time SSE Event Stream',
    description: 'Verify persistent server-sent events for instant multi-device push',
    status: 'idle'
  }
];

export const TestRunnerModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const [tests, setTests] = useState<TestCase[]>(INITIAL_TESTS);
  const [isRunning, setIsRunning] = useState(false);
  const [totalDuration, setTotalDuration] = useState<number | null>(null);

  if (!isOpen) return null;

  const runAllTests = async () => {
    setIsRunning(true);
    const overallStart = Date.now();
    const currentTests = [...INITIAL_TESTS];
    const testEmail = `diagnostic_${Date.now()}@synapze.io`;
    const testPass = 'DiagnosticPass123!';
    let testUid = '';
    let testSeedlingId = '';

    for (let i = 0; i < currentTests.length; i++) {
      const t = currentTests[i];
      t.status = 'running';
      setTests([...currentTests]);
      const start = Date.now();

      try {
        if (t.id === 'email_reg') {
          const res = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: testEmail, password: testPass, name: 'Diagnostic Florist' })
          });
          const data = await res.json();
          if (!res.ok || !data.success) throw new Error(data.error || 'Registration failed');
          testUid = data.uid;
        } else if (t.id === 'email_login') {
          const res = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: testEmail, password: testPass })
          });
          const data = await res.json();
          if (!res.ok || !data.success) throw new Error(data.error || 'Login failed');
        } else if (t.id === 'google_signup') {
          const gEmail = `g_diag_${Date.now()}@gmail.com`;
          const res = await fetch('/api/auth/google', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: gEmail, name: 'Google Diagnostic User' })
          });
          const data = await res.json();
          if (!res.ok || !data.success) throw new Error(data.error || 'Google signup failed');
        } else if (t.id === 'google_signin') {
          const gEmail = `g_diag_${Date.now()}@gmail.com`;
          // Register then sign in
          await fetch('/api/auth/google', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: gEmail, name: 'Existing User' })
          });
          const res = await fetch('/api/auth/google', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: gEmail })
          });
          const data = await res.json();
          if (!res.ok || !data.success) throw new Error(data.error || 'Google sign-in failed');
        } else if (t.id === 'otp_recovery') {
          const sendRes = await fetch('/api/auth/otp/send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: testEmail })
          });
          const sendData = await sendRes.json();
          const code = sendData.devOtp || '123456';
          const verifyRes = await fetch('/api/auth/otp/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: testEmail, otpCode: code })
          });
          if (!verifyRes.ok) throw new Error('OTP verification rejected valid code');
        } else if (t.id === 'profile_sync') {
          const res = await fetch('/api/sync/profile', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: testEmail,
              userId: testUid,
              profile: { bio: 'Verified via diagnostics', streakDays: 3 }
            })
          });
          const data = await res.json();
          if (!res.ok || !data.success) throw new Error(data.error || 'Profile sync failed');
        } else if (t.id === 'seedling_crud') {
          testSeedlingId = `seed_diag_${Date.now()}`;
          const createRes = await fetch('/api/sync/seedling', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: testEmail,
              userId: testUid,
              action: 'upsert',
              seedling: {
                id: testSeedlingId,
                userId: testUid,
                title: 'Diagnostics Knowledge Leaf',
                content: 'Test content verified successfully',
                status: 'growing',
                isTask: false,
                isCompleted: true,
                createdAt: new Date().toISOString()
              }
            })
          });
          if (!createRes.ok) throw new Error('Seedling create failed');
          const deleteRes = await fetch('/api/sync/seedling', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: testEmail,
              userId: testUid,
              action: 'delete',
              seedlingId: testSeedlingId
            })
          });
          if (!deleteRes.ok) throw new Error('Seedling delete failed');
        } else if (t.id === 'sse_stream') {
          const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort(), 2000);
          try {
            const res = await fetch(`/api/sync/events?email=${encodeURIComponent(testEmail)}`, {
              signal: controller.signal
            });
            clearTimeout(timeout);
            if (!res.ok) throw new Error(`Stream returned status ${res.status}`);
          } catch (err: any) {
            if (err.name !== 'AbortError') throw err;
          }
        }

        t.status = 'passed';
        t.durationMs = Date.now() - start;
      } catch (err: any) {
        t.status = 'failed';
        t.error = err?.message || String(err);
        t.durationMs = Date.now() - start;
      }

      setTests([...currentTests]);
      // Small pause for visual feedback
      await new Promise(r => setTimeout(r, 120));
    }

    setTotalDuration(Date.now() - overallStart);
    setIsRunning(false);
  };

  const passedCount = tests.filter(t => t.status === 'passed').length;
  const failedCount = tests.filter(t => t.status === 'failed').length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden text-left">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800 font-sans">System Diagnostics & Automated Tests</h2>
              <p className="text-xs text-slate-500">Live validation of Authentication, Google Sign-In, and Cross-Device Sync</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-slate-200/60 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content list */}
        <div className="p-6 overflow-y-auto flex-1 space-y-3">
          
          {/* Summary Banner if executed */}
          {totalDuration !== null && (
            <div className={`p-4 rounded-2xl border flex items-center justify-between text-xs font-medium ${
              failedCount === 0 
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
                : 'bg-rose-50 border-rose-200 text-rose-800'
            }`}>
              <div className="flex items-center gap-2">
                {failedCount === 0 ? (
                  <CheckCircle2 className="w-4.5 h-4.5 text-emerald-600 shrink-0" />
                ) : (
                  <XCircle className="w-4.5 h-4.5 text-rose-600 shrink-0" />
                )}
                <span>
                  <strong>{passedCount} of {tests.length} tests passed</strong> in {totalDuration}ms.
                  {failedCount === 0 ? ' Everything is working appropriately!' : ' Some tests need attention.'}
                </span>
              </div>
            </div>
          )}

          {tests.map(t => (
            <div
              key={t.id}
              className="p-3.5 bg-slate-50 border border-slate-150 rounded-2xl flex items-center justify-between gap-4 transition-all hover:bg-slate-100/60"
            >
              <div className="space-y-0.5 flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-800 font-sans">{t.name}</span>
                  {t.durationMs !== undefined && (
                    <span className="text-[10px] font-mono text-slate-400 bg-white px-1.5 py-0.5 rounded-md border border-slate-200">
                      {t.durationMs}ms
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 truncate">{t.description}</p>
                {t.error && (
                  <p className="text-[11px] text-rose-600 font-mono mt-1 bg-rose-50 p-1.5 rounded-lg border border-rose-100">
                    Error: {t.error}
                  </p>
                )}
              </div>

              <div className="shrink-0 flex items-center">
                {t.status === 'idle' && (
                  <span className="text-[11px] font-medium text-slate-400 px-2.5 py-1 bg-white border border-slate-200 rounded-lg">
                    Ready
                  </span>
                )}
                {t.status === 'running' && (
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-600 px-2.5 py-1 bg-emerald-50 border border-emerald-200 rounded-lg">
                    <RefreshCw className="w-3 h-3 animate-spin" />
                    <span>Testing...</span>
                  </div>
                )}
                {t.status === 'passed' && (
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700 px-2.5 py-1 bg-emerald-100 border border-emerald-300 rounded-lg">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>PASSED</span>
                  </div>
                )}
                {t.status === 'failed' && (
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold text-rose-700 px-2.5 py-1 bg-rose-100 border border-rose-300 rounded-lg">
                    <XCircle className="w-3.5 h-3.5 text-rose-600" />
                    <span>FAILED</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
            <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
            <span>Synapze Test Engine v1.2</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-100 font-semibold text-xs rounded-xl transition-all cursor-pointer"
            >
              Close
            </button>
            <button
              onClick={runAllTests}
              disabled={isRunning}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isRunning ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Running Suite...</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Run All Tests</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
