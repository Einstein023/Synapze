/**
 * Automated Authentication Test Suite for Synapze Garden
 * Tests Email Signup, Email Signin, Google Signup/Signin, and OTP Password Recovery.
 */

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000';

export interface TestResult {
  suite: string;
  name: string;
  passed: boolean;
  error?: string;
  durationMs: number;
}

export async function runAuthTests(): Promise<TestResult[]> {
  const results: TestResult[] = [];
  const testEmail = `test_gardener_${Date.now()}@synapze.io`;
  const testPassword = 'Password123!';
  const testName = 'Test Florist';

  async function test(name: string, fn: () => Promise<void>) {
    const start = Date.now();
    try {
      await fn();
      results.push({ suite: 'Authentication', name, passed: true, durationMs: Date.now() - start });
    } catch (err: any) {
      results.push({ suite: 'Authentication', name, passed: false, error: err?.message || String(err), durationMs: Date.now() - start });
    }
  }

  // 1. Test Email Registration
  await test('Email Registration - Successfully creates new account with initial profile', async () => {
    const res = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail, password: testPassword, name: testName })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(`Registration failed: ${data.error || res.statusText}`);
    if (!data.success) throw new Error('Expected success to be true');
    if (data.email !== testEmail.toLowerCase()) throw new Error(`Expected email ${testEmail}, got ${data.email}`);
    if (!data.uid || !data.uid.startsWith('usr_')) throw new Error('Expected valid user UID');
    if (!data.profile || data.profile.displayName !== testName) throw new Error('Expected profile to have custom display name');
    if (data.profile.companionName !== 'SPROUTY') throw new Error('Expected default companion SPROUTY');
  });

  // 2. Test Duplicate Registration Rejection
  await test('Email Registration - Rejects duplicate email registration with friendly message', async () => {
    const res = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail, password: 'DifferentPassword123' })
    });
    const data = await res.json();
    if (res.status !== 400) throw new Error(`Expected 400 Bad Request for duplicate email, got ${res.status}`);
    if (!data.error || !data.error.includes('already exists')) throw new Error(`Expected error message to mention account already exists, got: ${data.error}`);
  });

  // 3. Test Password Length Validation
  await test('Email Registration - Enforces minimum 8 character password constraint', async () => {
    const res = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: `short_${Date.now()}@synapze.io`, password: 'short' })
    });
    if (res.status !== 400) throw new Error(`Expected 400 Bad Request for short password, got ${res.status}`);
  });

  // 4. Test Email Login - Success
  await test('Email Login - Successfully authenticates existing account', async () => {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail, password: testPassword })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(`Login failed: ${data.error || res.statusText}`);
    if (!data.success) throw new Error('Expected success to be true');
    if (data.email !== testEmail.toLowerCase()) throw new Error(`Expected email match, got ${data.email}`);
    if (!data.profile) throw new Error('Expected user profile on login');
  });

  // 5. Test Email Login - Incorrect Password
  await test('Email Login - Rejects incorrect password with 401 Unauthorized', async () => {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail, password: 'WrongPassword999!' })
    });
    if (res.status !== 401) throw new Error(`Expected 401 Unauthorized, got ${res.status}`);
  });

  // 6. Test Google Sign-Up (New User)
  const googleTestEmail = `google_user_${Date.now()}@gmail.com`;
  const googleName = 'Google Arborist';
  await test('Google Authentication - Seamlessly provisions new Google user account', async () => {
    const res = await fetch(`${BASE_URL}/api/auth/google`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: googleTestEmail,
        name: googleName,
        photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'
      })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(`Google auth failed: ${data.error || res.statusText}`);
    if (!data.success) throw new Error('Expected success: true');
    if (data.provider !== 'google') throw new Error(`Expected provider 'google', got ${data.provider}`);
    if (data.profile.displayName !== googleName) throw new Error(`Expected name ${googleName}, got ${data.profile.displayName}`);
    if (!data.profile.profilePicture) throw new Error('Expected profilePicture to be saved');
  });

  // 7. Test Google Sign-In (Returning User)
  await test('Google Authentication - Preserves profile & data on returning Google sign-in', async () => {
    const res = await fetch(`${BASE_URL}/api/auth/google`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: googleTestEmail })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(`Returning Google sign-in failed: ${data.error}`);
    if (data.email !== googleTestEmail.toLowerCase()) throw new Error('Expected email match');
    if (data.profile.displayName !== googleName) throw new Error('Expected original display name preserved');
  });

  // 8. Test OTP Send, Verify, and Password Reset Flow
  let issuedOtpCode = '';
  await test('Password Recovery - Sends 6-digit OTP code', async () => {
    const res = await fetch(`${BASE_URL}/api/auth/otp/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(`OTP send failed: ${data.error}`);
    if (!data.success) throw new Error('Expected success true on OTP send');
    issuedOtpCode = data.devOtp;
    if (!issuedOtpCode || issuedOtpCode.length !== 6) throw new Error(`Expected 6-digit OTP code, got ${issuedOtpCode}`);
  });

  await test('Password Recovery - Successfully verifies valid OTP code', async () => {
    const res = await fetch(`${BASE_URL}/api/auth/otp/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail, otpCode: issuedOtpCode })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(`OTP verify failed: ${data.error}`);
    if (!data.success) throw new Error('Expected OTP verification to pass');
  });

  await test('Password Recovery - Rejects invalid OTP code', async () => {
    const res = await fetch(`${BASE_URL}/api/auth/otp/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail, otpCode: '999999' })
    });
    if (res.status !== 400) throw new Error(`Expected 400 Bad Request for incorrect OTP code, got ${res.status}`);
  });

  const updatedPassword = 'NewSecretPassword2026!';
  await test('Password Recovery - Resets password and permits login with new credentials', async () => {
    // 1. Reset password
    const resetRes = await fetch(`${BASE_URL}/api/auth/otp/reset`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail, otpCode: issuedOtpCode, newPassword: updatedPassword })
    });
    const resetData = await resetRes.json();
    if (!resetRes.ok) throw new Error(`Password reset failed: ${resetData.error}`);

    // 2. Attempt login with old password (must fail)
    const oldLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail, password: testPassword })
    });
    if (oldLoginRes.status !== 401) throw new Error('Expected old password to be invalid after reset');

    // 3. Attempt login with new password (must succeed)
    const newLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail, password: updatedPassword })
    });
    const newLoginData = await newLoginRes.json();
    if (!newLoginRes.ok || !newLoginData.success) throw new Error('Expected login with new password to succeed');
  });

  return results;
}
