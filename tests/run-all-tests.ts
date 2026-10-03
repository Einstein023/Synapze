/**
 * Master Test Runner for Synapze Garden
 * Runs both Authentication and Synchronization test suites.
 */

import { runAuthTests, TestResult } from './auth.test';
import { runSyncTests } from './sync.test';

async function main() {
  console.log('\n======================================================');
  console.log('🌿 SYNAPZE GARDEN AUTOMATED TEST SUITE RUNNER');
  console.log('======================================================\n');

  const startTime = Date.now();
  let allResults: TestResult[] = [];

  try {
    console.log('▶ Running Authentication Tests (Email & Google Sign-In / Sign-Up / OTP)...');
    const authResults = await runAuthTests();
    allResults = allResults.concat(authResults);

    console.log('▶ Running Data Synchronization & Notes CRUD Tests...');
    const syncResults = await runSyncTests();
    allResults = allResults.concat(syncResults);

    console.log('\n------------------------------------------------------');
    console.log('TEST RESULTS SUMMARY:');
    console.log('------------------------------------------------------');

    let passedCount = 0;
    let failedCount = 0;

    for (const r of allResults) {
      if (r.passed) {
        passedCount++;
        console.log(`  ✅ [PASS] (${r.durationMs}ms) [${r.suite}] ${r.name}`);
      } else {
        failedCount++;
        console.error(`  ❌ [FAIL] (${r.durationMs}ms) [${r.suite}] ${r.name}`);
        console.error(`     Error: ${r.error}`);
      }
    }

    const totalDuration = Date.now() - startTime;
    console.log('\n======================================================');
    console.log(`TOTAL: ${allResults.length} tests executed in ${totalDuration}ms`);
    console.log(`PASSED: ${passedCount}`);
    console.log(`FAILED: ${failedCount}`);
    console.log('======================================================\n');

    if (failedCount > 0) {
      process.exit(1);
    } else {
      console.log('🎉 ALL TESTS PASSED SUCCESSFULLY! Everything is functioning as designed.\n');
      process.exit(0);
    }
  } catch (err) {
    console.error('Fatal test runner error:', err);
    process.exit(1);
  }
}

main();
