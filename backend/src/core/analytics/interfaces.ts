export type AnalyticsPeriod = '7d' | '30d' | '90d' | '1y' | 'all';

export interface TimelinePoint {
    date: string;
    count: number;
}

export interface RevenueTimelinePoint {
    date: string;
    credit: number;
    debit: number;
}

export interface ReviewTimelinePoint {
    date: string;
    avgRating: number;
    count: number;
}

export interface OverviewAnalytics {
    completedRepairs: number;
    walletBalance: number;
    lockedBalance: number;
    averageRating: number;
    totalReviews: number;
    totalRepairRequests: number;
    cancelledRepairs: number;
    activeRepairs: number;
    totalRevenue: number;
    pendingPayouts: number;
    sentPayouts: number;
    openSupportTickets: number;
}

export interface RepairRequestsByStatus {
    ai_assessing: number;
    pending_brand_selection: number;
    pending_offers: number;
    offer_selected: number;
    inspection_pending: number;
    inspection_done: number;
    payment_pending: number;
    payment_done: number;
    pending_provider_repair: number;
    pending_user_device_pickup: number;
    completed: number;
    cancelled: number;
}

export interface RepairRequestsAnalytics {
    byStatus: RepairRequestsByStatus;
    byFlow: { direct: number; ai_chat: number };
    timeline: TimelinePoint[];
}

export interface RevenueAnalytics {
    byType: {
        booking_cash_pos: number;
        booking_online: number;
        payout_sent: number;
    };
    timeline: RevenueTimelinePoint[];
}

export interface OffersAnalytics {
    total: number;
    accepted: number;
    rejected: number;
    pending: number;
    acceptanceRate: number;
    avgInspectionPrice: number;
}

export interface ReviewsAnalytics {
    distribution: { 1: number; 2: number; 3: number; 4: number; 5: number };
    timeline: ReviewTimelinePoint[];
}

export interface PayoutsByMethod {
    instapay: { count: number; amount: number };
    bank: { count: number; amount: number };
    wallet: { count: number; amount: number };
}

export interface PayoutsAnalytics {
    total: number;
    totalAmount: number;
    byMethod: PayoutsByMethod;
    byStatus: { pending: number; sent: number; rejected: number };
}

export interface SubscriptionAnalytics {
    status: string | null;
    expiresAt: string | null;
    daysRemaining: number | null;
}

export interface SupportAnalytics {
    byStatus: { OPEN: number; IN_PROGRESS: number; RESOLVED: number; CLOSED: number };
    byPriority: { LOW: number; MEDIUM: number; HIGH: number };
}

export interface BrandAnalyticsResult {
    period: AnalyticsPeriod;
    overview: OverviewAnalytics;
    repairRequests: RepairRequestsAnalytics;
    revenue: RevenueAnalytics;
    offers: OffersAnalytics;
    reviews: ReviewsAnalytics;
    payouts: PayoutsAnalytics;
    subscription: SubscriptionAnalytics;
    support: SupportAnalytics;
}
