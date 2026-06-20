import { Types } from 'mongoose';
import { IBrandDB } from '@/database/models/brand';
import RepairRequestModel, { RepairRequestStatus } from '@/database/models/repairRequest';
import BrandWalletTransactionModel, { WalletTransactionDirection } from '@/database/models/brandWalletTransaction';
import BrandOfferModel, { BrandOfferStatus } from '@/database/models/brandOffer';
import BrandReviewModel from '@/database/models/brandReview';
import BrandPayoutModel, { PayoutMethod, PayoutStatus } from '@/database/models/brandPayout';
import BrandSubscriptionModel, { SubscriptionStatus } from '@/database/models/brandSubscription';
import SupportTicketModel, {
    SupportTicketSenderType,
    SupportTicketStatus,
    SupportTicketPriority,
} from '@/database/models/supportTicket';
import { AsyncSafeResult } from '@/core/types';
import {
    AnalyticsPeriod,
    BrandAnalyticsResult,
    OverviewAnalytics,
    RepairRequestsByStatus,
    RepairRequestsAnalytics,
    RevenueAnalytics,
    OffersAnalytics,
    ReviewsAnalytics,
    PayoutsAnalytics,
    SubscriptionAnalytics,
    SupportAnalytics,
    TimelinePoint,
    RevenueTimelinePoint,
    ReviewTimelinePoint,
} from './interfaces';

function _getDateFrom(period: AnalyticsPeriod): Date | null {
    if (period === 'all') return null;
    const days = { '7d': 7, '30d': 30, '90d': 90, '1y': 365 }[period];
    return new Date(Date.now() - days * 24 * 60 * 60 * 1000);
}

function _buildDateGroup(period: AnalyticsPeriod): Record<string, unknown> {
    if (period === '7d' || period === '30d') {
        return { $dateToString: { format: '%Y-%m-%d', date: '$createdAt', timezone: 'Africa/Cairo' } };
    }
    if (period === '90d' || period === '1y') {
        return {
            $concat: [
                { $toString: { $isoWeekYear: '$createdAt' } },
                '-W',
                {
                    $cond: [
                        { $lt: [{ $isoWeek: '$createdAt' }, 10] },
                        { $concat: ['0', { $toString: { $isoWeek: '$createdAt' } }] },
                        { $toString: { $isoWeek: '$createdAt' } },
                    ],
                },
            ],
        };
    }
    return { $dateToString: { format: '%Y-%m', date: '$createdAt', timezone: 'Africa/Cairo' } };
}

function _dateMatch(dateFrom: Date | null): Record<string, unknown> {
    return dateFrom ? { createdAt: { $gte: dateFrom } } : {};
}

async function _getRRTimeline(
    brandId: Types.ObjectId,
    dateFrom: Date | null,
    period: AnalyticsPeriod,
): Promise<TimelinePoint[]> {
    const results = await RepairRequestModel.aggregate([
        { $match: { assignedBrandIds: brandId, ..._dateMatch(dateFrom) } },
        { $group: { _id: _buildDateGroup(period), count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
        { $project: { _id: 0, date: '$_id', count: 1 } },
    ]);
    return results as TimelinePoint[];
}

async function _getRevenueTimeline(
    brandId: Types.ObjectId,
    dateFrom: Date | null,
    period: AnalyticsPeriod,
): Promise<RevenueTimelinePoint[]> {
    const results = await BrandWalletTransactionModel.aggregate([
        { $match: { brandId, ..._dateMatch(dateFrom) } },
        {
            $group: {
                _id: {
                    date: _buildDateGroup(period),
                    direction: '$direction',
                },
                amount: { $sum: '$amount' },
            },
        },
        {
            $group: {
                _id: '$_id.date',
                credit: {
                    $sum: {
                        $cond: [{ $eq: ['$_id.direction', WalletTransactionDirection.CREDIT] }, '$amount', 0],
                    },
                },
                debit: {
                    $sum: {
                        $cond: [{ $eq: ['$_id.direction', WalletTransactionDirection.DEBIT] }, '$amount', 0],
                    },
                },
            },
        },
        { $sort: { _id: 1 } },
        { $project: { _id: 0, date: '$_id', credit: 1, debit: 1 } },
    ]);
    return results as RevenueTimelinePoint[];
}

async function _getReviewTimeline(
    brandId: Types.ObjectId,
    dateFrom: Date | null,
    period: AnalyticsPeriod,
): Promise<ReviewTimelinePoint[]> {
    const results = await BrandReviewModel.aggregate([
        { $match: { brandId, ..._dateMatch(dateFrom) } },
        {
            $group: {
                _id: _buildDateGroup(period),
                avgRating: { $avg: '$rating' },
                count: { $sum: 1 },
            },
        },
        { $sort: { _id: 1 } },
        {
            $project: {
                _id: 0,
                date: '$_id',
                avgRating: { $round: ['$avgRating', 2] },
                count: 1,
            },
        },
    ]);
    return results as ReviewTimelinePoint[];
}

export async function getBrandAnalytics(
    brand: IBrandDB,
    period: AnalyticsPeriod,
): AsyncSafeResult<BrandAnalyticsResult> {
    try {
        const brandId = brand._id as Types.ObjectId;
        const dateFrom = _getDateFrom(period);
        const rrMatch = { assignedBrandIds: brandId, ..._dateMatch(dateFrom) };
        const brandMatch = { brandId, ..._dateMatch(dateFrom) };

        const [
            rrByStatus,
            rrByFlow,
            rrTimeline,
            rrTotal,
            revenueByType,
            revenueTimeline,
            offerStats,
            reviewDist,
            reviewTimeline,
            payoutStats,
            subscriptionDoc,
            supportStats,
        ] = await Promise.all([
            RepairRequestModel.aggregate([
                { $match: rrMatch },
                { $group: { _id: '$status', count: { $sum: 1 } } },
            ]),
            RepairRequestModel.aggregate([
                { $match: rrMatch },
                { $group: { _id: '$flow', count: { $sum: 1 } } },
            ]),
            _getRRTimeline(brandId, dateFrom, period),
            RepairRequestModel.countDocuments(rrMatch),
            BrandWalletTransactionModel.aggregate([
                { $match: brandMatch },
                { $group: { _id: '$type', amount: { $sum: '$amount' } } },
            ]),
            _getRevenueTimeline(brandId, dateFrom, period),
            BrandOfferModel.aggregate([
                { $match: brandMatch },
                {
                    $group: {
                        _id: null,
                        total: { $sum: 1 },
                        accepted: {
                            $sum: { $cond: [{ $eq: ['$status', BrandOfferStatus.ACCEPTED] }, 1, 0] },
                        },
                        rejected: {
                            $sum: { $cond: [{ $eq: ['$status', BrandOfferStatus.REJECTED] }, 1, 0] },
                        },
                        pending: {
                            $sum: { $cond: [{ $eq: ['$status', BrandOfferStatus.PENDING] }, 1, 0] },
                        },
                        avgInspectionPrice: { $avg: '$inspectionPrice' },
                    },
                },
            ]),
            BrandReviewModel.aggregate([
                { $match: brandMatch },
                { $group: { _id: '$rating', count: { $sum: 1 } } },
            ]),
            _getReviewTimeline(brandId, dateFrom, period),
            BrandPayoutModel.aggregate([
                { $match: brandMatch },
                {
                    $group: {
                        _id: null,
                        total: { $sum: 1 },
                        totalAmount: { $sum: '$amount' },
                        instapayCount: {
                            $sum: { $cond: [{ $eq: ['$method', PayoutMethod.INSTAPAY] }, 1, 0] },
                        },
                        instapayAmount: {
                            $sum: { $cond: [{ $eq: ['$method', PayoutMethod.INSTAPAY] }, '$amount', 0] },
                        },
                        bankCount: {
                            $sum: { $cond: [{ $eq: ['$method', PayoutMethod.BANK] }, 1, 0] },
                        },
                        bankAmount: {
                            $sum: { $cond: [{ $eq: ['$method', PayoutMethod.BANK] }, '$amount', 0] },
                        },
                        walletCount: {
                            $sum: { $cond: [{ $eq: ['$method', PayoutMethod.WALLET] }, 1, 0] },
                        },
                        walletAmount: {
                            $sum: { $cond: [{ $eq: ['$method', PayoutMethod.WALLET] }, '$amount', 0] },
                        },
                        pendingCount: {
                            $sum: { $cond: [{ $eq: ['$status', PayoutStatus.PENDING] }, 1, 0] },
                        },
                        sentCount: {
                            $sum: { $cond: [{ $eq: ['$status', PayoutStatus.SENT] }, 1, 0] },
                        },
                        rejectedCount: {
                            $sum: { $cond: [{ $eq: ['$status', PayoutStatus.REJECTED] }, 1, 0] },
                        },
                    },
                },
            ]),
            BrandSubscriptionModel.findOne({ brandId }).sort({ createdAt: -1 }),
            SupportTicketModel.aggregate([
                {
                    $match: {
                        brandId,
                        senderType: SupportTicketSenderType.BRAND,
                        ..._dateMatch(dateFrom),
                    },
                },
                {
                    $group: {
                        _id: null,
                        OPEN: {
                            $sum: { $cond: [{ $eq: ['$status', SupportTicketStatus.OPEN] }, 1, 0] },
                        },
                        IN_PROGRESS: {
                            $sum: {
                                $cond: [{ $eq: ['$status', SupportTicketStatus.IN_PROGRESS] }, 1, 0],
                            },
                        },
                        RESOLVED: {
                            $sum: {
                                $cond: [{ $eq: ['$status', SupportTicketStatus.RESOLVED] }, 1, 0],
                            },
                        },
                        CLOSED: {
                            $sum: { $cond: [{ $eq: ['$status', SupportTicketStatus.CLOSED] }, 1, 0] },
                        },
                        LOW: {
                            $sum: {
                                $cond: [{ $eq: ['$priority', SupportTicketPriority.LOW] }, 1, 0],
                            },
                        },
                        MEDIUM: {
                            $sum: {
                                $cond: [{ $eq: ['$priority', SupportTicketPriority.MEDIUM] }, 1, 0],
                            },
                        },
                        HIGH: {
                            $sum: {
                                $cond: [{ $eq: ['$priority', SupportTicketPriority.HIGH] }, 1, 0],
                            },
                        },
                    },
                },
            ]),
        ]);

        // --- Repair Requests ---
        const statusMap: Record<string, number> = {};
        for (const s of rrByStatus as { _id: string; count: number }[]) {
            statusMap[s._id] = s.count;
        }
        const flowMap: Record<string, number> = {};
        for (const f of rrByFlow as { _id: string; count: number }[]) {
            flowMap[f._id] = f.count;
        }

        const byStatus: RepairRequestsByStatus = {
            ai_assessing: statusMap[RepairRequestStatus.AI_ASSESSING] ?? 0,
            pending_brand_selection: statusMap[RepairRequestStatus.PENDING_BRAND_SELECTION] ?? 0,
            pending_offers: statusMap[RepairRequestStatus.PENDING_OFFERS] ?? 0,
            offer_selected: statusMap[RepairRequestStatus.OFFER_SELECTED] ?? 0,
            inspection_pending: statusMap[RepairRequestStatus.INSPECTION_PENDING] ?? 0,
            inspection_done: statusMap[RepairRequestStatus.INSPECTION_DONE] ?? 0,
            payment_pending: statusMap[RepairRequestStatus.PAYMENT_PENDING] ?? 0,
            payment_done: statusMap[RepairRequestStatus.PAYMENT_DONE] ?? 0,
            pending_provider_repair: statusMap[RepairRequestStatus.PENDING_PROVIDER_REPAIR] ?? 0,
            pending_user_device_pickup: statusMap[RepairRequestStatus.PENDING_USER_DEVICE_PICKUP] ?? 0,
            completed: statusMap[RepairRequestStatus.COMPLETED] ?? 0,
            cancelled: statusMap[RepairRequestStatus.CANCELLED] ?? 0,
        };

        const repairRequests: RepairRequestsAnalytics = {
            byStatus,
            byFlow: {
                direct: flowMap['direct'] ?? 0,
                ai_chat: flowMap['ai_chat'] ?? 0,
            },
            timeline: rrTimeline,
        };

        // --- Revenue ---
        const revenueTypeMap: Record<string, number> = {};
        for (const t of revenueByType as { _id: string; amount: number }[]) {
            revenueTypeMap[t._id] = t.amount;
        }

        const revenue: RevenueAnalytics = {
            byType: {
                booking_cash_pos: revenueTypeMap['booking_cash_pos'] ?? 0,
                booking_online: revenueTypeMap['booking_online'] ?? 0,
                payout_sent: revenueTypeMap['payout_sent'] ?? 0,
            },
            timeline: revenueTimeline,
        };

        // --- Offers ---
        const offerRaw = (offerStats as { _id: null; total: number; accepted: number; rejected: number; pending: number; avgInspectionPrice: number | null }[])[0];
        const offers: OffersAnalytics = {
            total: offerRaw?.total ?? 0,
            accepted: offerRaw?.accepted ?? 0,
            rejected: offerRaw?.rejected ?? 0,
            pending: offerRaw?.pending ?? 0,
            acceptanceRate:
                offerRaw?.total
                    ? Math.round(((offerRaw.accepted) / offerRaw.total) * 10000) / 100
                    : 0,
            avgInspectionPrice: Math.round((offerRaw?.avgInspectionPrice ?? 0) * 100) / 100,
        };

        // --- Reviews ---
        const distMap: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        for (const d of reviewDist as { _id: number; count: number }[]) {
            distMap[d._id] = d.count;
        }

        const reviews: ReviewsAnalytics = {
            distribution: { 1: distMap[1], 2: distMap[2], 3: distMap[3], 4: distMap[4], 5: distMap[5] },
            timeline: reviewTimeline,
        };

        // --- Payouts ---
        const pr = (payoutStats as {
            _id: null;
            total: number;
            totalAmount: number;
            instapayCount: number;
            instapayAmount: number;
            bankCount: number;
            bankAmount: number;
            walletCount: number;
            walletAmount: number;
            pendingCount: number;
            sentCount: number;
            rejectedCount: number;
        }[])[0];

        const payouts: PayoutsAnalytics = {
            total: pr?.total ?? 0,
            totalAmount: pr?.totalAmount ?? 0,
            byMethod: {
                instapay: { count: pr?.instapayCount ?? 0, amount: pr?.instapayAmount ?? 0 },
                bank: { count: pr?.bankCount ?? 0, amount: pr?.bankAmount ?? 0 },
                wallet: { count: pr?.walletCount ?? 0, amount: pr?.walletAmount ?? 0 },
            },
            byStatus: {
                pending: pr?.pendingCount ?? 0,
                sent: pr?.sentCount ?? 0,
                rejected: pr?.rejectedCount ?? 0,
            },
        };

        // --- Subscription ---
        let subscription: SubscriptionAnalytics = { status: null, expiresAt: null, daysRemaining: null };
        if (subscriptionDoc) {
            let daysRemaining: number | null = null;
            if (subscriptionDoc.status === SubscriptionStatus.ACTIVE && subscriptionDoc.expiresAt) {
                const ms = new Date(subscriptionDoc.expiresAt).getTime() - Date.now();
                daysRemaining = Math.max(0, Math.ceil(ms / 86_400_000));
            }
            subscription = {
                status: subscriptionDoc.status,
                expiresAt: subscriptionDoc.expiresAt ? new Date(subscriptionDoc.expiresAt).toISOString() : null,
                daysRemaining,
            };
        }

        // --- Support ---
        const sr = (supportStats as {
            _id: null;
            OPEN: number;
            IN_PROGRESS: number;
            RESOLVED: number;
            CLOSED: number;
            LOW: number;
            MEDIUM: number;
            HIGH: number;
        }[])[0];

        const support: SupportAnalytics = {
            byStatus: {
                OPEN: sr?.OPEN ?? 0,
                IN_PROGRESS: sr?.IN_PROGRESS ?? 0,
                RESOLVED: sr?.RESOLVED ?? 0,
                CLOSED: sr?.CLOSED ?? 0,
            },
            byPriority: {
                LOW: sr?.LOW ?? 0,
                MEDIUM: sr?.MEDIUM ?? 0,
                HIGH: sr?.HIGH ?? 0,
            },
        };

        // --- Overview ---
        const totalRevenue =
            (revenueTypeMap['booking_cash_pos'] ?? 0) + (revenueTypeMap['booking_online'] ?? 0);

        const overview: OverviewAnalytics = {
            completedRepairs: brand.completedRepairs,
            walletBalance: brand.walletBalance,
            lockedBalance: brand.lockedBalance,
            averageRating: brand.rating,
            totalReviews: brand.ratingCount,
            totalRepairRequests: rrTotal,
            cancelledRepairs: byStatus.cancelled,
            activeRepairs: rrTotal - byStatus.completed - byStatus.cancelled,
            totalRevenue,
            pendingPayouts: pr?.pendingCount ?? 0,
            sentPayouts: pr?.sentCount ?? 0,
            openSupportTickets: sr?.OPEN ?? 0,
        };

        const result: BrandAnalyticsResult = {
            period,
            overview,
            repairRequests,
            revenue,
            offers,
            reviews,
            payouts,
            subscription,
            support,
        };

        return { result, error: null };
    } catch (err) {
        return { error: err, result: null };
    }
}
