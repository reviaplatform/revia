/**
 * Component-level verification harness for ReviaMatch (src/core/matching).
 * Exercises category filtering, relevance/tag scoring, radius adherence,
 * fallback trigger rate, and weight-sensitivity directly against the real
 * exported functions, with no HTTP/DB involved.
 *
 * Usage: npx ts-node -r tsconfig-paths/register ./src/scripts/matching-verification.ts
 */

import {
  filterByCategory,
  scoreProviders,
  matchProviders,
  MatchingProvider,
  MatchingTicket,
} from '@/core/matching';

function provider(overrides: Partial<MatchingProvider> & { _id: string }): MatchingProvider {
  return {
    name: { en: overrides._id, ar: overrides._id },
    tags: [],
    categories: [{ _id: 'c1', name: { en: 'phone', ar: 'هاتف' }, isActive: true }],
    branches: [{ name: { en: 'Main', ar: 'الرئيسي' }, location: { longitude: 31.23, latitude: 30.04 }, isActive: true }],
    completedRepairs: 50,
    rating: 4.5,
    ratingCount: 50,
    lockedBalance: 0,
    deletedAt: null,
    ...overrides,
  };
}

const ticket: MatchingTicket = {
  device_type: 'phone',
  device_brand: 'apple',
  symptom: 'cracked screen',
  probable_cause: 'physical hardware damage to screen',
  location: { longitude: 31.23, latitude: 30.04 },
};

// --- 1. Category Filtering: False Positive / False Negative Rate ---
function testCategoryFiltering() {
  console.log('\n=== 1. Category Filtering (FP/FN/Status) ===');
  const providers: MatchingProvider[] = [
    provider({ _id: 'match-active', categories: [{ _id: 'c1', name: { en: 'phone', ar: 'هاتف' }, isActive: true }] }),
    provider({ _id: 'wrong-category', categories: [{ _id: 'c2', name: { en: 'laptop', ar: 'لابتوب' }, isActive: true }] }),
    provider({ _id: 'inactive-category', categories: [{ _id: 'c1', name: { en: 'phone', ar: 'هاتف' }, isActive: false }] }),
    provider({ _id: 'soft-deleted', categories: [{ _id: 'c1', name: { en: 'phone', ar: 'هاتف' }, isActive: true }], deletedAt: new Date() }),
  ];
  const expectedPass = new Set(['match-active']);
  const result = filterByCategory(ticket, providers);
  const resultIds = new Set(result.map(p => p._id));

  const falsePositives = [...resultIds].filter(id => !expectedPass.has(id));
  const falseNegatives = [...expectedPass].filter(id => !resultIds.has(id));

  console.log(`Providers passing filter (English device_type ticket): ${[...resultIds].join(', ')}`);
  console.log(`False Positive Rate (leakage): ${(falsePositives.length / providers.length * 100).toFixed(1)}% (${falsePositives.length}/${providers.length})`);
  console.log(`False Negative Rate (over-filtering): ${(falseNegatives.length / expectedPass.size * 100).toFixed(1)}% (${falseNegatives.length}/${expectedPass.size})`);
  console.log(`Status effectiveness: inactive-category excluded=${!resultIds.has('inactive-category')}, soft-deleted excluded=${!resultIds.has('soft-deleted')}`);

  // Arabic-ticket path, tested in isolation (the category match is same-language only —
  // there is no cross-language fallback, so an Arabic ticket must be matched against
  // an Arabic category name, not the English one).
  const arabicTicket: MatchingTicket = { ...ticket, device_type: 'هاتف' };
  const arabicProviders: MatchingProvider[] = [
    provider({ _id: 'arabic-match', categories: [{ _id: 'c1', name: { en: 'phone', ar: 'هاتف' }, isActive: true }] }),
  ];
  const arabicResult = filterByCategory(arabicTicket, arabicProviders);
  console.log(`Arabic device_type ("هاتف") matched against Arabic category name: ${arabicResult.length === 1 ? 'PASS' : 'FAIL'}`);
}

// --- 2. Relevance Scoring: Brand Match Precision in Top 3 ---
function testRelevanceScoring() {
  console.log('\n=== 2. Relevance Scoring (Brand Match Precision, Top 3) ===');
  const providers: MatchingProvider[] = [
    provider({ _id: 'brand+hw', tags: ['apple', 'hardware'], rating: 4.6, completedRepairs: 80 }),
    provider({ _id: 'brand-only', tags: ['apple'], rating: 4.6, completedRepairs: 80 }),
    provider({ _id: 'hw-only', tags: ['samsung', 'hardware'], rating: 4.9, completedRepairs: 80 }),
    provider({ _id: 'generic', tags: ['samsung'], rating: 4.9, completedRepairs: 80 }),
    provider({ _id: 'no-match-high-rating', tags: ['huawei'], rating: 5.0, completedRepairs: 80 }),
  ];
  const ranked = matchProviders(ticket, providers);
  const top3 = ranked.slice(0, 3);
  const brandMatchCount = top3.filter(p => p.tags.includes('apple')).length;
  console.log('Ranking (id : match_score : final_composite_score):');
  ranked.forEach(p => console.log(`  ${p._id} : ${p.match_score} : ${p.final_composite_score}`));
  console.log(`Brand Match Precision (top 3 holding "apple" tag): ${(brandMatchCount / 3 * 100).toFixed(1)}%`);
}

// --- 3. Radius Adherence ---
function testRadiusAdherence() {
  console.log('\n=== 3. Radius Adherence (no out-of-radius result before fallback) ===');
  // Customer at (30.04, 31.23). Providers placed at known distances via latitude offset (~111km/deg).
  function atDistanceKm(km: number) {
    return { longitude: 31.23, latitude: 30.04 + km / 111 };
  }
  const providers: MatchingProvider[] = [
    provider({ _id: 'p-5km', branches: [{ name: { en: 'B', ar: 'ب' }, location: atDistanceKm(5), isActive: true }] }),
    provider({ _id: 'p-25km', branches: [{ name: { en: 'B', ar: 'ب' }, location: atDistanceKm(25), isActive: true }] }),
    provider({ _id: 'p-45km', branches: [{ name: { en: 'B', ar: 'ب' }, location: atDistanceKm(45), isActive: true }] }),
    provider({ _id: 'p-150km', branches: [{ name: { en: 'B', ar: 'ب' }, location: atDistanceKm(150), isActive: true }] }),
  ];
  const ranked = matchProviders(ticket, providers);
  console.log('Returned (id : distance_km), radius=30km, in-pool max=45/150km:');
  ranked.forEach(p => console.log(`  ${p._id} : ${p.distance_km}`));
  const outsideRadiusBeforeFallback = ranked.filter(p => (p.distance_km ?? 0) > 30);
  console.log(`Radius adherence violation count (should be 0, since a 30km-compliant provider exists): ${outsideRadiusBeforeFallback.length}`);
}

// --- 4. Progressive Fallback Trigger Rate ---
// NOTE: this stresses the engine with a synthetic uniform 0-250km customer distance
// distribution, deliberately adversarial to surface all three fallback tiers in one run.
// The resulting percentages are an artifact of that synthetic distribution, not an estimate
// of real-world fallback frequency — that requires live ticket/branch geodata (see chp5 §5.9).
function testFallbackTriggerRate() {
  console.log('\n=== 4. Progressive Fallback Trigger Rate (1,000 synthetic tickets, uniform 0-250km stress distribution) ===');
  // Provider pool clustered around Cairo; customer locations scattered 0-250km away.
  const providers: MatchingProvider[] = Array.from({ length: 20 }, (_, i) =>
    provider({ _id: `cairo-${i}`, tags: ['apple', 'hardware'], rating: 4 + Math.random(), completedRepairs: Math.floor(Math.random() * 200) }),
  );

  let tier0 = 0; // within 30km, no fallback
  let tier1 = 0; // required 100km relax
  let tier2 = 0; // required unbounded relax
  let tier3 = 0; // required category relax (won't occur here, no category mismatch)
  const N = 1000;

  for (let i = 0; i < N; i++) {
    const distanceKm = Math.random() * 250; // 0-250km from Cairo cluster
    const t: MatchingTicket = {
      ...ticket,
      location: { longitude: 31.23, latitude: 30.04 + distanceKm / 111 },
    };
    const filtered = filterByCategory(t, providers);
    const scored = scoreProviders(t, filtered);
    const within30 = scored.filter(p => (p.distance_km ?? 0) <= 30);
    const within100 = scored.filter(p => (p.distance_km ?? 0) <= 100);
    if (within30.length > 0) tier0++;
    else if (within100.length > 0) tier1++;
    else if (filtered.length > 0) tier2++;
    else tier3++;
  }

  console.log(`No fallback (<=30km): ${(tier0 / N * 100).toFixed(1)}%`);
  console.log(`Tier 1 fallback (30-100km): ${(tier1 / N * 100).toFixed(1)}%`);
  console.log(`Tier 2 fallback (>100km, unbounded): ${(tier2 / N * 100).toFixed(1)}%`);
  console.log(`Tier 3 fallback (category relax): ${(tier3 / N * 100).toFixed(1)}%`);
}

// --- 5. Weight Sensitivity Index ---
function testWeightSensitivity() {
  console.log('\n=== 5. Weight Sensitivity Index (re-using Scenario G Provider A/B at 2.3km/6.55km) ===');
  // Component scores reproduced directly from chp5 Scenario G (5.5.7), close-range case:
  // relevance=70 for both (brand+hardware match); A: quality=4.38, geo=98.94; B: quality=4.74, geo=83.75.
  const relevance = 70;
  const a = { quality: 4.38, geo: 98.94 };
  const b = { quality: 4.74, geo: 83.75 };

  function compositeFor(w1: number, w2: number, w3: number, p: { quality: number; geo: number }): number {
    return w1 * relevance + w2 * (p.quality * 20) + w3 * p.geo;
  }

  // Sweep weight transferred from w3 (Proximity) into w2 (Quality), in 0.01 steps,
  // holding w1 fixed at 0.40, to find the crossover point where B overtakes A.
  let crossoverShift: number | null = null;
  for (let shift = 0; shift <= 0.20; shift += 0.01) {
    const w2 = 0.35 + shift;
    const w3 = 0.25 - shift;
    const scoreA = compositeFor(0.40, w2, w3, a);
    const scoreB = compositeFor(0.40, w2, w3, b);
    if (crossoverShift === null && scoreB > scoreA) {
      crossoverShift = Number(shift.toFixed(2));
    }
  }

  const baselineA = compositeFor(0.40, 0.35, 0.25, a);
  const baselineB = compositeFor(0.40, 0.35, 0.25, b);
  console.log(`Baseline (w1=0.40, w2=0.35, w3=0.25): A=${baselineA.toFixed(2)}, B=${baselineB.toFixed(2)} -> ${baselineA > baselineB ? 'A' : 'B'} ranks 1st`);
  console.log(`Crossover: shifting ${crossoverShift} from w3 to w2 (w2=${(0.35 + (crossoverShift ?? 0)).toFixed(2)}, w3=${(0.25 - (crossoverShift ?? 0)).toFixed(2)}) flips the ranking to B`);
  console.log('Weight Sensitivity Index (minimum weight shift required to flip a near-tied composite ranking): ' + (crossoverShift !== null ? `${crossoverShift} (${(crossoverShift / 0.25 * 100).toFixed(0)}% relative change to w3)` : 'no flip within +/-0.20 range'));
}

testCategoryFiltering();
testRelevanceScoring();
testRadiusAdherence();
testFallbackTriggerRate();
testWeightSensitivity();
