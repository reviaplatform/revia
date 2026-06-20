/**
 * Load testing script for the Revia backend.
 *
 * Exercises the three layers referenced in Chapter 5 of the thesis:
 *   - src/server  -> HTTP/middleware stack (root health route, no DB hit)
 *   - src/database + business logic -> five authenticated, read-only API routes spanning
 *     distinct controllers (category, device, repairRequest, brandReview, support), each
 *     swept across multiple concurrency levels
 *   - src/core/matching -> in-process ReviaMatch scoring/ranking benchmark (no HTTP, no DB)
 *
 * Usage:
 *   1. Start the backend in another terminal: npm run dev
 *   2. Run: npx ts-node -r tsconfig-paths/register ./src/scripts/load-test.ts
 *
 * Requires a valid USER access token (see src/scripts/gen-test-token.ts) for the
 * authenticated DB-backed routes; falls back to skipping those scenarios if absent.
 */

import autocannon, { Result } from 'autocannon';
import { matchProviders, MatchingProvider, MatchingTicket } from '@/core/matching';

const BASE_URL = process.env['LOAD_TEST_BASE_URL'] ?? 'http://localhost:10001';
const TOKEN = process.env['LOAD_TEST_TOKEN'];

interface HttpScenario {
  name: string;
  url: string;
  connections: number;
  duration: number;
  headers?: Record<string, string>;
}

function printHttpResult(name: string, result: Result) {
  console.log(`\n=== ${name} ===`);
  console.log(`connections=${result.connections} duration=${result.duration}s`);
  console.log(`requests: total=${result.requests.total} avg/sec=${result.requests.average}`);
  console.log(
    `latency (ms): p50=${result.latency.p50} p97_5=${result.latency.p97_5} ` +
      `p99=${result.latency.p99} avg=${result.latency.average} max=${result.latency.max}`,
  );
  console.log(`errors=${result.errors} timeouts=${result.timeouts} non2xx=${result.non2xx}`);
}

async function runHttpScenario(scenario: HttpScenario): Promise<void> {
  const result = await autocannon({
    url: scenario.url,
    connections: scenario.connections,
    duration: scenario.duration,
    headers: scenario.headers,
  });
  printHttpResult(scenario.name, result);
}

function genSyntheticProviders(n: number): MatchingProvider[] {
  const tags = ['apple', 'samsung', 'huawei', 'hardware', 'software'];
  const providers: MatchingProvider[] = [];
  for (let i = 0; i < n; i++) {
    providers.push({
      _id: `p${i}`,
      name: { en: `Provider ${i}`, ar: `مزود ${i}` },
      tags: [tags[i % tags.length]!, tags[(i + 1) % tags.length]!],
      categories: [{ _id: 'c1', name: { en: 'phone', ar: 'هاتف' }, isActive: true }],
      branches: [
        {
          name: { en: 'Main', ar: 'الرئيسي' },
          location: { longitude: 31.2 + Math.random(), latitude: 30.0 + Math.random() },
          isActive: true,
        },
      ],
      completedRepairs: Math.floor(Math.random() * 500),
      rating: 3 + Math.random() * 2,
      ratingCount: Math.floor(Math.random() * 200),
      lockedBalance: 0,
      deletedAt: null,
    });
  }
  return providers;
}

function runMatchingBenchmark(providerCounts: number[], iterations = 200): void {
  console.log('\n=== ReviaMatch in-process scoring benchmark (src/core/matching) ===');
  const ticket: MatchingTicket = {
    device_type: 'phone',
    device_brand: 'apple',
    symptom: 'cracked screen',
    probable_cause: 'physical hardware damage to screen',
    location: { longitude: 31.23, latitude: 30.04 },
  };

  for (const n of providerCounts) {
    const providers = genSyntheticProviders(n);
    const start = process.hrtime.bigint();
    for (let i = 0; i < iterations; i++) {
      matchProviders(ticket, providers);
    }
    const end = process.hrtime.bigint();
    const avgMs = Number(end - start) / 1e6 / iterations;
    console.log(`providers=${n}: avg ${avgMs.toFixed(3)}ms over ${iterations} iterations`);
  }
}

async function main() {
  console.log(`Load test target: ${BASE_URL}`);

  // Layer 1: src/server — bare HTTP/middleware stack, no DB I/O.
  for (const connections of [50, 200]) {
    await runHttpScenario({
      name: `GET / (server layer only) c=${connections}`,
      url: `${BASE_URL}/`,
      connections,
      duration: 12,
    });
  }

  // Layer 2: src/database + business logic — authenticated, read-only API routes
  // covering distinct controllers/logic paths (not just one endpoint or the matcher).
  if (TOKEN) {
    const headers = { Authorization: `Bearer ${TOKEN}` };
    const sampleBrandId = process.env['LOAD_TEST_BRAND_ID'] ?? '69d3e8440d572df64cf7e5b2';

    const apiRoutes: { label: string; path: string }[] = [
      { label: 'category.list', path: '/api/v1/category/list' },
      { label: 'device.listMyDevices', path: '/api/v1/devices' },
      { label: 'repairRequest.list', path: '/api/v1/repair-requests' },
      { label: 'brandReview.list', path: `/api/v1/brand-reviews/${sampleBrandId}` },
      { label: 'support.list', path: '/api/v1/support' },
    ];

    for (const route of apiRoutes) {
      for (const connections of [10, 50, 100]) {
        await runHttpScenario({
          name: `GET ${route.path} (${route.label}) c=${connections}`,
          url: `${BASE_URL}${route.path}`,
          connections,
          duration: 10,
          headers,
        });
      }
    }
  } else {
    console.log('\nSkipping authenticated API/database-layer scenarios: set LOAD_TEST_TOKEN to enable.');
  }

  // Layer 3: src/core/matching — pure in-memory scoring/ranking, no I/O.
  runMatchingBenchmark([50, 500, 2000, 10000]);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
