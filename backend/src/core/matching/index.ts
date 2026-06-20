/**
 * Revia Matching Engine — Backend Port
 *
 * Exact port of matching-engine 2/src/lib/matching.ts.
 * Type shapes adapted to Mongoose models; logic is identical.
 */

// ---------------------------------------------------------------------------
// Types (mirrors matching-engine 2/src/types/matching.ts)
// ---------------------------------------------------------------------------

export interface MatchingCategory {
    _id: string;
    name: { en: string; ar: string };
    isActive: boolean;
}

export interface MatchingBranchLocation {
    longitude: number;
    latitude: number;
}

export interface MatchingBranch {
    name: { en: string; ar: string };
    location: MatchingBranchLocation;
    isActive: boolean;
}

export interface MatchingProvider {
    _id: string;
    name: { en: string; ar: string };
    tags: string[];
    categories: MatchingCategory[];
    branches: MatchingBranch[];
    completedRepairs: number;
    rating: number;
    ratingCount: number;
    lockedBalance: number;
    deletedAt: Date | string | null;
}

export interface MatchingTicket {
    /** e.g. "laptop", "phone" — matched against category name */
    device_type: string;
    /** e.g. "huawei", "samsung" — matched against provider tags */
    device_brand: string;
    /** The customer's description of the issue */
    symptom: string;
    /** AI or customer-supplied probable cause */
    probable_cause: string;
    /** Optional customer GPS coordinates for geospatial scoring */
    location?: {
        longitude: number;
        latitude: number;
    };
}

export interface ScoredMatchingProvider extends MatchingProvider {
    match_score: number;
    quality_score: number;
    distance_km?: number;
    geospatial_score?: number;
    final_composite_score?: number;
    reasons: string[];
}

// ---------------------------------------------------------------------------
// Helper: Haversine distance in km
// ---------------------------------------------------------------------------

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

// ---------------------------------------------------------------------------
// Step 1 — Filter: strict category match + soft-delete guard
// ---------------------------------------------------------------------------

export function filterByCategory(
    ticket: MatchingTicket,
    providers: MatchingProvider[],
): MatchingProvider[] {
    const targetDeviceType = ticket.device_type.toLowerCase().trim();

    return providers.filter(provider => {
        // Guard: provider must not be deleted
        if (provider.deletedAt !== null) return false;

        // Check if the provider has an active category matching the device type
        const hasMatchingCategory = provider.categories.some(category => {
            if (!category.isActive) return false;

            const nameEn = category.name.en.toLowerCase().trim();
            const nameAr = category.name.ar.trim();

            // Match against English or Arabic category name
            return nameEn === targetDeviceType || nameAr === targetDeviceType;
        });

        // Note: If the provider schema adds a top-level `isActive` flag in the future,
        // it should also be checked here. Currently, we check `deletedAt` and category `isActive`.
        return hasMatchingCategory;
    });
}

// ---------------------------------------------------------------------------
// Step 2 — Score: relevance + Bayesian quality + geospatial proximity
// ---------------------------------------------------------------------------

const HARDWARE_KEYWORDS = ['screen', 'lcd', 'panel', 'cable', 'battery', 'motherboard', 'physical', 'broken', 'hardware'];
const SOFTWARE_KEYWORDS = ['software', 'driver', 'os', 'virus', 'update', 'boot', 'system'];

export function scoreProviders(
    ticket: MatchingTicket,
    filteredProviders: MatchingProvider[],
): ScoredMatchingProvider[] {
    const deviceBrand = ticket.device_brand.toLowerCase().trim();
    const probableCause = ticket.probable_cause.toLowerCase();
    const symptom = ticket.symptom.toLowerCase();

    // Determine if the issue is hardware or software related based on keywords
    const isHardwareIssue = HARDWARE_KEYWORDS.some(kw => probableCause.includes(kw) || symptom.includes(kw));
    const isSoftwareIssue = SOFTWARE_KEYWORDS.some(kw => probableCause.includes(kw) || symptom.includes(kw));

    // --- Score Component 1: Bayesian Quality Calculation ---
    // C = Mean rating across all filtered providers
    const C = filteredProviders.length > 0
        ? filteredProviders.reduce((acc, p) => acc + p.rating, 0) / filteredProviders.length
        : 3.5;
    // m = Prior minimum number of repairs to be confident in the score
    const m = 50;

    return filteredProviders.map(provider => {
        let match_score = 0;
        const reasons: string[] = [];
        const providerTags = provider.tags.map(tag => tag.toLowerCase().trim());

        // 1. Brand Matching (+50 points)
        if (providerTags.includes(deviceBrand)) {
            match_score += 50;
            reasons.push(`Brand match: ${deviceBrand}`);
        }

        // 2. Symptom/Hardware/Software Matching (+20 points)
        if (isHardwareIssue && providerTags.includes('hardware')) {
            match_score += 20;
            reasons.push('Specialty match: hardware');
        }

        if (isSoftwareIssue && providerTags.includes('software')) {
            match_score += 20;
            reasons.push('Specialty match: software');
        }

        // Base score for passing the category filter
        if (match_score === 0) {
            match_score = 10;
            reasons.push('Category match only');
        }

        // Bayesian Quality Score calculation
        const v = provider.completedRepairs;
        const R = provider.rating;

        // Formula: (v / (v + m)) * R + (m / (v + m)) * C
        // Allows a 4.8-star provider with 1000 repairs to outrank a 5.0-star provider with 2 repairs.
        const quality_score = Number((((v / (v + m)) * R) + ((m / (v + m)) * C)).toFixed(2));

        // --- Score Component 2: Geospatial Proximity ---
        let distance_km: number | undefined = undefined;
        let geospatial_score = 0;

        if (ticket.location && provider.branches.length > 0) {
            // Find the closest active branch
            let minDistance = Infinity;
            provider.branches.forEach(branch => {
                if (branch.isActive && branch.location) {
                    const dist = calculateDistance(
                        ticket.location!.latitude,
                        ticket.location!.longitude,
                        branch.location.latitude,
                        branch.location.longitude,
                    );
                    if (dist < minDistance) {
                        minDistance = dist;
                    }
                }
            });

            if (minDistance !== Infinity) {
                distance_km = Number(minDistance.toFixed(2));

                // Calculate a proximity score 0-100.
                // Max score (100) if within 2km, decays linearly to 0 at 30km.
                const maxDist = 30;   // 30km radius limit for scoring
                const perfectDist = 2; // 2km is perfect

                if (minDistance <= perfectDist) {
                    geospatial_score = 100;
                } else if (minDistance > maxDist) {
                    geospatial_score = 0;
                } else {
                    geospatial_score = ((maxDist - minDistance) / (maxDist - perfectDist)) * 100;
                }
                geospatial_score = Number(geospatial_score.toFixed(2));
                reasons.push(distance_km <= 5 ? 'Very close location' : 'Serviceable distance');
            }
        }

        // --- The Composite Recommendation Equation ---
        // w1 * Relevance (max ~90) + w2 * Quality (max 5→100) + w3 * Proximity (max 100)
        // Normalize: Quality is 0-5, multiply by 20 → 0-100.
        const w1 = 0.40; // Relevance
        const w2 = 0.35; // Quality
        const w3 = 0.25; // Proximity

        const normalized_quality = quality_score * 20;

        const final_composite_score = Number(
            (w1 * match_score + w2 * normalized_quality + w3 * geospatial_score).toFixed(2),
        );

        return {
            ...provider,
            match_score,
            quality_score,
            distance_km,
            geospatial_score,
            final_composite_score,
            reasons,
        };
    });
}

// ---------------------------------------------------------------------------
// Step 3 — Rank: composite score desc → quality score desc → completedRepairs desc
// ---------------------------------------------------------------------------

export function rankProviders(scoredProviders: ScoredMatchingProvider[]): ScoredMatchingProvider[] {
    return [...scoredProviders].sort((a, b) => {
        // Primary Sort: Composite Recommendation Score (Descending)
        if (a.final_composite_score !== undefined && b.final_composite_score !== undefined) {
            if (b.final_composite_score !== a.final_composite_score) {
                return b.final_composite_score - a.final_composite_score;
            }
        } else {
            // Fallback Primary Sort: match_score (Descending)
            if (b.match_score !== a.match_score) {
                return b.match_score - a.match_score;
            }
        }

        // Secondary Sort: Bayesian Quality Score (Descending)
        if (b.quality_score !== a.quality_score) {
            return b.quality_score - a.quality_score;
        }

        // Tertiary Sort: completedRepairs (Descending)
        return b.completedRepairs - a.completedRepairs;
    });
}

// ---------------------------------------------------------------------------
// Main entry point: run the full pipeline with progressive geospatial fallback
// ---------------------------------------------------------------------------

export function matchProviders(
    ticket: MatchingTicket,
    providers: MatchingProvider[],
): ScoredMatchingProvider[] {
    const filtered = filterByCategory(ticket, providers);
    const scored = scoreProviders(ticket, filtered);

    // Initial strict bounds: Max 30km distance
    let radius = 30;
    let finalProviders = scored.filter(p => p.distance_km === undefined || p.distance_km <= radius);

    // Progressive Fallback 1: Relax geospatial limit to 100km
    if (finalProviders.length === 0) {
        radius = 100;
        finalProviders = scored.filter(p => p.distance_km === undefined || p.distance_km <= radius);
    }

    // Progressive Fallback 2: Relax completely on distance
    if (finalProviders.length === 0) {
        finalProviders = scored;
    }

    // Progressive Fallback 3: Relax category matching (last resort)
    // If no providers matched the category at all, try scoring all active providers
    if (finalProviders.length === 0) {
        const activeProviders = providers.filter(p => p.deletedAt === null && p.lockedBalance === 0);
        finalProviders = scoreProviders(ticket, activeProviders);
    }

    return rankProviders(finalProviders);
}

// ---------------------------------------------------------------------------
// Convenience: run the full pipeline and return top-N provider IDs
// ---------------------------------------------------------------------------

export function runMatchingPipeline(
    ticket: MatchingTicket,
    providers: MatchingProvider[],
    topN = 5,
): string[] {
    return matchProviders(ticket, providers).slice(0, topN).map(p => p._id);
}
