import CustomerModel, { CustomerStatus, CustomerGender } from '@/database/models/customer';
import BrandModel from '@/database/models/brand';
import ProviderModel from '@/database/models/provider';
import RepairRequestModel, { RepairRequestStatus } from '@/database/models/repairRequest';
import PaymentModel, { PaymentStatus, PaymentType, PaymentMethod } from '@/database/models/payment';
import BrandPayoutModel, { PayoutMethod, PayoutStatus } from '@/database/models/brandPayout';
import BrandSubscriptionModel, { SubscriptionStatus } from '@/database/models/brandSubscription';
import SupportTicketModel, {
    SupportTicketSenderType,
    SupportTicketStatus,
    SupportTicketPriority,
} from '@/database/models/supportTicket';
import ReelModel from '@/database/models/reel';
import ChatSessionModel from '@/database/models/chatSession';
import DeviceModel, { DevicePlatform } from '@/database/models/device';
import { AsyncSafeResult } from '@/core/types';
import {
    AnalyticsPeriod,
    AdminAnalyticsResult,
    PlatformOverview,
    CustomersAnalytics,
    BrandsAnalytics,
    RepairRequestsAnalytics,
    RepairRequestsByStatus,
    PaymentsAnalytics,
    PayoutsAnalytics,
    SubscriptionsAnalytics,
    SupportAnalytics,
    ReelsAnalytics,
    ChatSessionsAnalytics,
    DevicesAnalytics,
    TimelinePoint,
    RevenueTimelinePoint,
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

async function _timeline(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Model: { aggregate: (pipeline: any[]) => any },
    match: Record<string, unknown>,
    period: AnalyticsPeriod,
): Promise<TimelinePoint[]> {
    const results = await Model.aggregate([
        { $match: match },
        { $group: { _id: _buildDateGroup(period), count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
        { $project: { _id: 0, date: '$_id', count: 1 } },
    ]);
    return results as TimelinePoint[];
}

async function _revenueTimeline(
    match: Record<string, unknown>,
    period: AnalyticsPeriod,
): Promise<RevenueTimelinePoint[]> {
    const results = await PaymentModel.aggregate([
        { $match: { ...match, status: PaymentStatus.PAID } },
        {
            $group: {
                _id: _buildDateGroup(period),
                revenue: { $sum: '$amount' },
                commission: { $sum: '$commissionAmount' },
            },
        },
        { $sort: { _id: 1 } },
        { $project: { _id: 0, date: '$_id', revenue: 1, commission: 1 } },
    ]);
    return results as RevenueTimelinePoint[];
}

export async function getAdminAnalytics(
    period: AnalyticsPeriod,
): AsyncSafeResult<AdminAnalyticsResult> {
    try {
        const dateFrom = _getDateFrom(period);
        const periodMatch = _dateMatch(dateFrom);

        const [
            // Customers
            customerAllTime,
            customerPeriod,
            customerTimeline,
            // Brands
            brandAllTime,
            brandTimeline,
            topBrands,
            // Providers
            providerTotal,
            // Repair Requests
            rrByStatus,
            rrByFlow,
            rrTimeline,
            rrTotal,
            // Payments
            paymentStats,
            paymentTimeline,
            // Payouts
            payoutStats,
            payoutTimeline,
            // Subscriptions
            subscriptionStats,
            subscriptionTimeline,
            // Support
            supportStats,
            supportTimeline,
            // Reels
            reelStats,
            reelTimeline,
            // Chat Sessions
            chatStats,
            chatTimeline,
            // Devices
            deviceStats,
            // Active subscriptions (all-time for overview)
            activeSubCount,
            // Pending payouts in period (for overview)
            pendingPayoutsCount,
        ] = await Promise.all([
            // --- Customers all-time breakdown ---
            CustomerModel.aggregate([
                {
                    $group: {
                        _id: null,
                        total: { $sum: 1 },
                        active: { $sum: { $cond: [{ $eq: ['$status', CustomerStatus.ACTIVE] }, 1, 0] } },
                        banned: { $sum: { $cond: [{ $eq: ['$status', CustomerStatus.BANNED] }, 1, 0] } },
                        deleted: { $sum: { $cond: [{ $eq: ['$status', CustomerStatus.DELETED] }, 1, 0] } },
                        male: { $sum: { $cond: [{ $eq: ['$gender', CustomerGender.MALE] }, 1, 0] } },
                        female: { $sum: { $cond: [{ $eq: ['$gender', CustomerGender.FEMALE] }, 1, 0] } },
                    },
                },
            ]),
            // --- New customers in period ---
            CustomerModel.countDocuments(periodMatch),
            // --- Customer registration timeline ---
            _timeline(CustomerModel, periodMatch, period),

            // --- Brands all-time breakdown ---
            BrandModel.aggregate([
                {
                    $group: {
                        _id: null,
                        total: { $sum: 1 },
                        active: {
                            $sum: {
                                $cond: [
                                    {
                                        $and: [
                                            { $eq: ['$deletedAt', null] },
                                            { $ne: ['$approvedAt', null] },
                                        ],
                                    },
                                    1,
                                    0,
                                ],
                            },
                        },
                        deleted: { $sum: { $cond: [{ $ne: ['$deletedAt', null] }, 1, 0] } },
                        pendingApproval: {
                            $sum: {
                                $cond: [
                                    {
                                        $and: [
                                            { $eq: ['$deletedAt', null] },
                                            { $eq: ['$approvedAt', null] },
                                        ],
                                    },
                                    1,
                                    0,
                                ],
                            },
                        },
                    },
                },
            ]),
            // --- Brand registration timeline ---
            _timeline(BrandModel, periodMatch, period),
            // --- Top 5 brands by completedRepairs ---
            BrandModel.find({ deletedAt: null })
                .sort({ completedRepairs: -1 })
                .limit(5)
                .select('_id name completedRepairs rating walletBalance')
                .lean(),

            // --- Providers total (non-deleted) ---
            ProviderModel.countDocuments({ deletedAt: null }),

            // --- Repair Requests by status (period) ---
            RepairRequestModel.aggregate([
                { $match: periodMatch },
                { $group: { _id: '$status', count: { $sum: 1 } } },
            ]),
            // --- Repair Requests by flow (period) ---
            RepairRequestModel.aggregate([
                { $match: periodMatch },
                { $group: { _id: '$flow', count: { $sum: 1 } } },
            ]),
            // --- Repair Requests timeline ---
            _timeline(RepairRequestModel, periodMatch, period),
            // --- Repair Requests total in period ---
            RepairRequestModel.countDocuments(periodMatch),

            // --- Payment stats (period) ---
            PaymentModel.aggregate([
                { $match: periodMatch },
                {
                    $group: {
                        _id: null,
                        total: { $sum: 1 },
                        totalRevenue: {
                            $sum: { $cond: [{ $eq: ['$status', PaymentStatus.PAID] }, '$amount', 0] },
                        },
                        totalCommission: {
                            $sum: {
                                $cond: [{ $eq: ['$status', PaymentStatus.PAID] }, '$commissionAmount', 0],
                            },
                        },
                        totalBrandNet: {
                            $sum: { $cond: [{ $eq: ['$status', PaymentStatus.PAID] }, '$brandNet', 0] },
                        },
                        pendingCount: {
                            $sum: { $cond: [{ $eq: ['$status', PaymentStatus.PENDING] }, 1, 0] },
                        },
                        paidCount: {
                            $sum: { $cond: [{ $eq: ['$status', PaymentStatus.PAID] }, 1, 0] },
                        },
                        failedCount: {
                            $sum: { $cond: [{ $eq: ['$status', PaymentStatus.FAILED] }, 1, 0] },
                        },
                        refundedCount: {
                            $sum: { $cond: [{ $eq: ['$status', PaymentStatus.REFUNDED] }, 1, 0] },
                        },
                        inspectionCount: {
                            $sum: { $cond: [{ $eq: ['$type', PaymentType.INSPECTION] }, 1, 0] },
                        },
                        finalCount: {
                            $sum: { $cond: [{ $eq: ['$type', PaymentType.FINAL] }, 1, 0] },
                        },
                        cashCount: {
                            $sum: { $cond: [{ $eq: ['$method', PaymentMethod.CASH] }, 1, 0] },
                        },
                        posCount: {
                            $sum: { $cond: [{ $eq: ['$method', PaymentMethod.POS] }, 1, 0] },
                        },
                        onlineCount: {
                            $sum: { $cond: [{ $eq: ['$method', PaymentMethod.ONLINE] }, 1, 0] },
                        },
                    },
                },
            ]),
            // --- Revenue timeline ---
            _revenueTimeline(periodMatch, period),

            // --- Payout stats (period) ---
            BrandPayoutModel.aggregate([
                { $match: periodMatch },
                {
                    $group: {
                        _id: null,
                        total: { $sum: 1 },
                        totalAmount: { $sum: '$amount' },
                        pendingCount: {
                            $sum: { $cond: [{ $eq: ['$status', PayoutStatus.PENDING] }, 1, 0] },
                        },
                        sentCount: {
                            $sum: { $cond: [{ $eq: ['$status', PayoutStatus.SENT] }, 1, 0] },
                        },
                        rejectedCount: {
                            $sum: { $cond: [{ $eq: ['$status', PayoutStatus.REJECTED] }, 1, 0] },
                        },
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
                    },
                },
            ]),
            // --- Payout timeline ---
            _timeline(BrandPayoutModel, periodMatch, period),

            // --- Subscription stats (period) ---
            BrandSubscriptionModel.aggregate([
                { $match: periodMatch },
                {
                    $group: {
                        _id: null,
                        total: { $sum: 1 },
                        active: {
                            $sum: { $cond: [{ $eq: ['$status', SubscriptionStatus.ACTIVE] }, 1, 0] },
                        },
                        expired: {
                            $sum: { $cond: [{ $eq: ['$status', SubscriptionStatus.EXPIRED] }, 1, 0] },
                        },
                        pendingPayment: {
                            $sum: {
                                $cond: [{ $eq: ['$status', SubscriptionStatus.PENDING_PAYMENT] }, 1, 0],
                            },
                        },
                        totalRevenue: {
                            $sum: {
                                $cond: [
                                    {
                                        $in: ['$status', [SubscriptionStatus.ACTIVE, SubscriptionStatus.EXPIRED]],
                                    },
                                    '$price',
                                    0,
                                ],
                            },
                        },
                    },
                },
            ]),
            // --- Subscription timeline ---
            _timeline(BrandSubscriptionModel, periodMatch, period),

            // --- Support stats (period) ---
            SupportTicketModel.aggregate([
                { $match: periodMatch },
                {
                    $group: {
                        _id: null,
                        total: { $sum: 1 },
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
                        customerSender: {
                            $sum: {
                                $cond: [
                                    { $eq: ['$senderType', SupportTicketSenderType.CUSTOMER] },
                                    1,
                                    0,
                                ],
                            },
                        },
                        brandSender: {
                            $sum: {
                                $cond: [
                                    { $eq: ['$senderType', SupportTicketSenderType.BRAND] },
                                    1,
                                    0,
                                ],
                            },
                        },
                    },
                },
            ]),
            // --- Support timeline ---
            _timeline(SupportTicketModel, periodMatch, period),

            // --- Reels stats (all-time) ---
            ReelModel.aggregate([
                {
                    $group: {
                        _id: null,
                        total: { $sum: 1 },
                        visible: { $sum: { $cond: ['$isVisible', 1, 0] } },
                        deleted: { $sum: { $cond: [{ $ne: ['$deletedAt', null] }, 1, 0] } },
                        totalLikes: { $sum: '$likesCount' },
                        totalViews: { $sum: '$viewsCount' },
                    },
                },
            ]),
            // --- Reels timeline ---
            _timeline(ReelModel, periodMatch, period),

            // --- Chat session stats (period) ---
            ChatSessionModel.aggregate([
                { $match: periodMatch },
                {
                    $group: {
                        _id: null,
                        total: { $sum: 1 },
                        finished: { $sum: { $cond: ['$isFinished', 1, 0] } },
                        inProgress: { $sum: { $cond: [{ $not: ['$isFinished'] }, 1, 0] } },
                    },
                },
            ]),
            // --- Chat session timeline ---
            _timeline(ChatSessionModel, periodMatch, period),

            // --- Device platform breakdown (all-time) ---
            DeviceModel.aggregate([
                {
                    $group: {
                        _id: null,
                        total: { $sum: 1 },
                        ios: { $sum: { $cond: [{ $eq: ['$platform', DevicePlatform.IOS] }, 1, 0] } },
                        android: {
                            $sum: { $cond: [{ $eq: ['$platform', DevicePlatform.ANDROID] }, 1, 0] },
                        },
                        windows: {
                            $sum: { $cond: [{ $eq: ['$platform', DevicePlatform.WINDOWS] }, 1, 0] },
                        },
                        macos: {
                            $sum: { $cond: [{ $eq: ['$platform', DevicePlatform.MACOS] }, 1, 0] },
                        },
                        linux: {
                            $sum: { $cond: [{ $eq: ['$platform', DevicePlatform.LINUX] }, 1, 0] },
                        },
                        other: {
                            $sum: { $cond: [{ $eq: ['$platform', DevicePlatform.OTHER] }, 1, 0] },
                        },
                    },
                },
            ]),

            // --- Active subscriptions all-time (for overview) ---
            BrandSubscriptionModel.countDocuments({ status: SubscriptionStatus.ACTIVE }),

            // --- Pending payouts in period (for overview) ---
            BrandPayoutModel.countDocuments({ ...periodMatch, status: PayoutStatus.PENDING }),
        ]);

        // ----------------------------------------------------------------
        // Assemble customers
        // ----------------------------------------------------------------
        const cAll = (customerAllTime as {
            _id: null;
            total: number;
            active: number;
            banned: number;
            deleted: number;
            male: number;
            female: number;
        }[])[0];

        const customers: CustomersAnalytics = {
            total: cAll?.total ?? 0,
            byStatus: {
                active: cAll?.active ?? 0,
                banned: cAll?.banned ?? 0,
                deleted: cAll?.deleted ?? 0,
            },
            byGender: {
                male: cAll?.male ?? 0,
                female: cAll?.female ?? 0,
            },
            timeline: customerTimeline,
        };

        // ----------------------------------------------------------------
        // Assemble brands
        // ----------------------------------------------------------------
        const bAll = (brandAllTime as {
            _id: null;
            total: number;
            active: number;
            deleted: number;
            pendingApproval: number;
        }[])[0];

        const brands: BrandsAnalytics = {
            total: bAll?.total ?? 0,
            active: bAll?.active ?? 0,
            deleted: bAll?.deleted ?? 0,
            pendingApproval: bAll?.pendingApproval ?? 0,
            timeline: brandTimeline,
            topByCompletedRepairs: (topBrands as unknown as { _id: { toString(): string }; name: { en: string; ar: string } | string; completedRepairs: number; rating: number; walletBalance: number }[]).map(b => ({
                id: b._id.toString(),
                name: typeof b.name === 'object' ? (b.name as { en: string; ar: string }).en : b.name,
                completedRepairs: b.completedRepairs,
                rating: b.rating,
                walletBalance: b.walletBalance,
            })),
        };

        // ----------------------------------------------------------------
        // Assemble repair requests
        // ----------------------------------------------------------------
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
            total: rrTotal,
            byStatus,
            byFlow: {
                direct: flowMap['direct'] ?? 0,
                ai_chat: flowMap['ai_chat'] ?? 0,
            },
            timeline: rrTimeline,
        };

        // ----------------------------------------------------------------
        // Assemble payments
        // ----------------------------------------------------------------
        const pm = (paymentStats as {
            _id: null;
            total: number;
            totalRevenue: number;
            totalCommission: number;
            totalBrandNet: number;
            pendingCount: number;
            paidCount: number;
            failedCount: number;
            refundedCount: number;
            inspectionCount: number;
            finalCount: number;
            cashCount: number;
            posCount: number;
            onlineCount: number;
        }[])[0];

        const payments: PaymentsAnalytics = {
            total: pm?.total ?? 0,
            totalRevenue: pm?.totalRevenue ?? 0,
            totalCommission: pm?.totalCommission ?? 0,
            totalBrandNet: pm?.totalBrandNet ?? 0,
            byStatus: {
                pending: pm?.pendingCount ?? 0,
                paid: pm?.paidCount ?? 0,
                failed: pm?.failedCount ?? 0,
                refunded: pm?.refundedCount ?? 0,
            },
            byType: {
                inspection: pm?.inspectionCount ?? 0,
                final: pm?.finalCount ?? 0,
            },
            byMethod: {
                cash: pm?.cashCount ?? 0,
                pos: pm?.posCount ?? 0,
                online: pm?.onlineCount ?? 0,
            },
            timeline: paymentTimeline,
        };

        // ----------------------------------------------------------------
        // Assemble payouts
        // ----------------------------------------------------------------
        const pr = (payoutStats as {
            _id: null;
            total: number;
            totalAmount: number;
            pendingCount: number;
            sentCount: number;
            rejectedCount: number;
            instapayCount: number;
            instapayAmount: number;
            bankCount: number;
            bankAmount: number;
            walletCount: number;
            walletAmount: number;
        }[])[0];

        const payouts: PayoutsAnalytics = {
            total: pr?.total ?? 0,
            totalAmount: pr?.totalAmount ?? 0,
            byStatus: {
                pending: pr?.pendingCount ?? 0,
                sent: pr?.sentCount ?? 0,
                rejected: pr?.rejectedCount ?? 0,
            },
            byMethod: {
                instapay: { count: pr?.instapayCount ?? 0, amount: pr?.instapayAmount ?? 0 },
                bank: { count: pr?.bankCount ?? 0, amount: pr?.bankAmount ?? 0 },
                wallet: { count: pr?.walletCount ?? 0, amount: pr?.walletAmount ?? 0 },
            },
            timeline: payoutTimeline,
        };

        // ----------------------------------------------------------------
        // Assemble subscriptions
        // ----------------------------------------------------------------
        const sr = (subscriptionStats as {
            _id: null;
            total: number;
            active: number;
            expired: number;
            pendingPayment: number;
            totalRevenue: number;
        }[])[0];

        const subscriptions: SubscriptionsAnalytics = {
            total: sr?.total ?? 0,
            active: sr?.active ?? 0,
            expired: sr?.expired ?? 0,
            pendingPayment: sr?.pendingPayment ?? 0,
            totalRevenue: sr?.totalRevenue ?? 0,
            timeline: subscriptionTimeline,
        };

        // ----------------------------------------------------------------
        // Assemble support
        // ----------------------------------------------------------------
        const sup = (supportStats as {
            _id: null;
            total: number;
            OPEN: number;
            IN_PROGRESS: number;
            RESOLVED: number;
            CLOSED: number;
            LOW: number;
            MEDIUM: number;
            HIGH: number;
            customerSender: number;
            brandSender: number;
        }[])[0];

        const support: SupportAnalytics = {
            total: sup?.total ?? 0,
            byStatus: {
                OPEN: sup?.OPEN ?? 0,
                IN_PROGRESS: sup?.IN_PROGRESS ?? 0,
                RESOLVED: sup?.RESOLVED ?? 0,
                CLOSED: sup?.CLOSED ?? 0,
            },
            byPriority: {
                LOW: sup?.LOW ?? 0,
                MEDIUM: sup?.MEDIUM ?? 0,
                HIGH: sup?.HIGH ?? 0,
            },
            bySenderType: {
                customer: sup?.customerSender ?? 0,
                brand: sup?.brandSender ?? 0,
            },
            timeline: supportTimeline,
        };

        // ----------------------------------------------------------------
        // Assemble reels
        // ----------------------------------------------------------------
        const rl = (reelStats as {
            _id: null;
            total: number;
            visible: number;
            deleted: number;
            totalLikes: number;
            totalViews: number;
        }[])[0];

        const reels: ReelsAnalytics = {
            total: rl?.total ?? 0,
            visible: rl?.visible ?? 0,
            deleted: rl?.deleted ?? 0,
            totalLikes: rl?.totalLikes ?? 0,
            totalViews: rl?.totalViews ?? 0,
            timeline: reelTimeline,
        };

        // ----------------------------------------------------------------
        // Assemble chat sessions
        // ----------------------------------------------------------------
        const ch = (chatStats as {
            _id: null;
            total: number;
            finished: number;
            inProgress: number;
        }[])[0];

        const chatSessions: ChatSessionsAnalytics = {
            total: ch?.total ?? 0,
            finished: ch?.finished ?? 0,
            inProgress: ch?.inProgress ?? 0,
            timeline: chatTimeline,
        };

        // ----------------------------------------------------------------
        // Assemble devices
        // ----------------------------------------------------------------
        const dv = (deviceStats as {
            _id: null;
            total: number;
            ios: number;
            android: number;
            windows: number;
            macos: number;
            linux: number;
            other: number;
        }[])[0];

        const devices: DevicesAnalytics = {
            total: dv?.total ?? 0,
            byPlatform: {
                ios: dv?.ios ?? 0,
                android: dv?.android ?? 0,
                windows: dv?.windows ?? 0,
                macos: dv?.macos ?? 0,
                linux: dv?.linux ?? 0,
                other: dv?.other ?? 0,
            },
        };

        // ----------------------------------------------------------------
        // Assemble overview
        // ----------------------------------------------------------------
        const overview: PlatformOverview = {
            totalCustomers: cAll?.total ?? 0,
            activeCustomers: cAll?.active ?? 0,
            bannedCustomers: cAll?.banned ?? 0,
            totalBrands: bAll?.total ?? 0,
            activeBrands: bAll?.active ?? 0,
            pendingApprovalBrands: bAll?.pendingApproval ?? 0,
            totalProviders: providerTotal,
            activeSubscriptions: activeSubCount,
            newCustomers: customerPeriod,
            newRepairRequests: rrTotal,
            totalRevenue: pm?.totalRevenue ?? 0,
            totalCommission: pm?.totalCommission ?? 0,
            pendingPayouts: pendingPayoutsCount,
            openSupportTickets: sup?.OPEN ?? 0,
        };

        const result: AdminAnalyticsResult = {
            period,
            overview,
            customers,
            brands,
            repairRequests,
            payments,
            payouts,
            subscriptions,
            support,
            reels,
            chatSessions,
            devices,
        };

        return { result, error: null };
    } catch (err) {
        return { error: err, result: null };
    }
}
