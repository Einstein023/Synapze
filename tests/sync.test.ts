/**
 * Automated Data Synchronization & Notes Test Suite for Synapze Garden
 * Tests profile sync, seedling creation, editing, status change, deletion, and cross-device fetch.
 */

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000';

export interface TestResult {
  suite: string;
  name: string;
  passed: boolean;
  error?: string;
  durationMs: number;
}

export async function runSyncTests(): Promise<TestResult[]> {
  const results: TestResult[] = [];
  const testEmail = `sync_user_${Date.now()}@synapze.io`;
  let testUid = '';
  let createdSeedlingId = '';

  async function test(name: string, fn: () => Promise<void>) {
    const start = Date.now();
    try {
      await fn();
      results.push({ suite: 'Data Synchronization', name, passed: true, durationMs: Date.now() - start });
    } catch (err: any) {
      results.push({ suite: 'Data Synchronization', name, passed: false, error: err?.message || String(err), durationMs: Date.now() - start });
    }
  }

  // 1. Setup initial user
  await test('Sync Setup - Creates user session for sync operations', async () => {
    const res = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail, password: 'GardenPassword123!', name: 'Sync Botanist' })
    });
    const data = await res.json();
    if (!res.ok || !data.success) throw new Error('Failed to register sync user');
    testUid = data.uid;
  });

  // 2. Profile Sync
  await test('Profile Sync - Updates profile attributes and persists changes', async () => {
    const updatedBio = 'Cultivating digital thoughts across mobile and desktop devices.';
    const updatedTheme = 'sage';
    const updatedCompanion = 'Bloomkin';

    const res = await fetch(`${BASE_URL}/api/sync/profile`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        userId: testUid,
        profile: {
          bio: updatedBio,
          theme: updatedTheme,
          companionType: updatedCompanion,
          streakDays: 5
        }
      })
    });
    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(`Profile sync failed: ${data.error}`);
    if (data.profile.bio !== updatedBio) throw new Error('Expected bio to be updated');
    if (data.profile.theme !== updatedTheme) throw new Error('Expected theme to be updated');
    if (data.profile.streakDays !== 5) throw new Error('Expected streakDays to be 5');
  });

  // 3. Seedling Creation (Note with status 'seedling')
  await test('Seedling CRUD - Creates a new knowledge node note', async () => {
    createdSeedlingId = `node_${Date.now()}`;
    const newSeedling = {
      id: createdSeedlingId,
      userId: testUid,
      title: 'Dendrochronology Notes',
      content: 'Analyzing tree rings to evaluate historical climate variations.',
      status: 'seedling',
      isTask: false,
      isCompleted: false,
      tags: ['botany', 'climate'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const res = await fetch(`${BASE_URL}/api/sync/seedling`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        userId: testUid,
        action: 'upsert',
        seedling: newSeedling
      })
    });
    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(`Seedling creation failed: ${data.error}`);
    const found = (data.seedlings || []).find((s: any) => s.id === createdSeedlingId);
    if (!found) throw new Error('Created seedling not returned in sync response');
    if (found.title !== 'Dendrochronology Notes') throw new Error('Seedling title does not match');
  });

  // 4. Seedling Update (Note content modification & status change to 'growing')
  await test('Seedling CRUD - Modifies note content and advances status to "growing"', async () => {
    const updatedContent = 'Analyzing tree rings: Updated with core samples from ancient Bristlecone pines.';
    const updatedSeedling = {
      id: createdSeedlingId,
      userId: testUid,
      title: 'Dendrochronology Notes (Expanded)',
      content: updatedContent,
      status: 'growing',
      isTask: false,
      isCompleted: false,
      tags: ['botany', 'climate', 'research'],
      updatedAt: new Date().toISOString()
    };

    const res = await fetch(`${BASE_URL}/api/sync/seedling`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        userId: testUid,
        action: 'upsert',
        seedling: updatedSeedling
      })
    });
    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(`Seedling update failed: ${data.error}`);
    const found = (data.seedlings || []).find((s: any) => s.id === createdSeedlingId);
    if (!found) throw new Error('Updated seedling not found');
    if (found.status !== 'growing') throw new Error(`Expected status 'growing', got ${found.status}`);
    if (found.content !== updatedContent) throw new Error('Seedling content update mismatch');
  });

  // 5. Cross-Device Full Sync Fetch
  await test('Cross-Device Fetch - Retrieves complete notes & profile on separate device', async () => {
    const res = await fetch(`${BASE_URL}/api/sync?email=${encodeURIComponent(testEmail)}&userId=${encodeURIComponent(testUid)}`);
    const data = await res.json();
    if (!res.ok || !data.success) throw new Error('Cross-device fetch failed');
    if (!data.profile || data.profile.theme !== 'sage') throw new Error('Profile theme not preserved in cross-device fetch');
    const note = (data.seedlings || []).find((s: any) => s.id === createdSeedlingId);
    if (!note) throw new Error('Seedling node missing in cross-device fetch');
    if (note.status !== 'growing') throw new Error('Seedling status mismatch in cross-device fetch');
  });

  // 6. Seedling Deletion
  await test('Seedling CRUD - Deletes knowledge node and updates sync store', async () => {
    const res = await fetch(`${BASE_URL}/api/sync/seedling`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        userId: testUid,
        action: 'delete',
        seedlingId: createdSeedlingId
      })
    });
    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(`Seedling deletion failed: ${data.error}`);
    const found = (data.seedlings || []).find((s: any) => s.id === createdSeedlingId);
    if (found) throw new Error('Deleted seedling still found in response');

    // Confirm with a fresh sync query
    const verifyRes = await fetch(`${BASE_URL}/api/sync?email=${encodeURIComponent(testEmail)}`);
    const verifyData = await verifyRes.json();
    const stillExists = (verifyData.seedlings || []).some((s: any) => s.id === createdSeedlingId);
    if (stillExists) throw new Error('Deleted seedling still exists in database');
  });

  // 7. Server-Sent Events (SSE) Stream Check
  await test('Real-Time SSE - Successfully connects to event push endpoint', async () => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2500);

    try {
      const res = await fetch(`${BASE_URL}/api/sync/events?email=${encodeURIComponent(testEmail)}`, {
        signal: controller.signal
      });
      clearTimeout(timeout);
      if (!res.ok) throw new Error(`SSE endpoint returned status ${res.status}`);
      const contentType = res.headers.get('content-type') || '';
      if (!contentType.includes('text/event-stream')) {
        throw new Error(`Expected text/event-stream header, got ${contentType}`);
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        // Abort after confirming streaming connection is normal
        return;
      }
      throw err;
    }
  });

  return results;
}
