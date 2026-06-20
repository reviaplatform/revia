export type AnalyticsPeriod = '7d' | '30d' | '90d' | '1y' | 'all';

export interface TimelinePoint {
    date: string;
    count: number;
}

export interface RevenueTimelinePoint {
    date: string;
    revenue: number;
    commission: number;
}

// ------------------------------------------------------------------
// 1. Platform Overview
// ------------------------------------------------------------------
export interface PlatformOverview {
    // All-time entity counts
    totalCustomers: number;
    activeCustomers: number;
    bannedCustomers: number;
    totalBrands: number;
    activeBrands: number;
    pendingApprovalBrands: number;
    totalProviders: number;
    activeSubscriptions: number;

    // Period-filtered activity
    newCustomers: number;
    newRepairRequests: number;
    totalRevenue: number;
    totalCommission: number;
    pendingPayouts: number;
    openSupportTickets: number;
}

// ------------------------------------------------------------------
// 2. Customers
// ------------------------------------------------------------------
export interface CustomersAnalytics {
    total: number;
    byStatus: { active: number; banned: number; deleted: number };
    byGender: { male: number; female: number };
    timeline: TimelinePoint[];
}

// ------------------------------------------------------------------
// 3. Brands
// ------------------------------------------------------------------
export interface TopBrand {
    id: string;
    name: string;
    completedRepairs: number;
    rating: number;
    walletBalance: number;
}

export interface BrandsAnalytics {
    total: number;
    active: number;
    deleted: number;
    pendingApproval: number;
    timeline: TimelinePoint[];
    topByCompletedRepairs: TopBrand[];
}

// ------------------------------------------------------------------
// 4. Repair Requests
// ------------------------------------------------------------------
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
    total: number;
    byStatus: RepairRequestsByStatus;
    byFlow: { direct: number; ai_chat: number };
    timeline: TimelinePoint[];
}

// ------------------------------------------------------------------
// 5. Payments & Revenue
// ------------------------------------------------------------------
export interface PaymentsAnalytics {
    total: number;
    totalRevenue: number;
    totalCommission: number;
    totalBrandNet: number;
    byStatus: { pending: number; paid: number; failed: number; refunded: number };
    byType: { inspection: number; final: number };
    byMethod: { cash: number; pos: number; online: number };
    timeline: RevenueTimelinePoint[];
}

// ------------------------------------------------------------------
// 6. Payouts
// ------------------------------------------------------------------
export interface PayoutsAnalytics {
    total: number;
    totalAmount: number;
    byStatus: { pending: number; sent: number; rejected: number };
    byMethod: {
        instapay: { count: number; amount: number };
        bank: { count: number; amount: number };
        wallet: { count: number; amount: number };
    };
    timeline: TimelinePoint[];
}

// ------------------------------------------------------------------
// 7. Subscriptions
// ------------------------------------------------------------------
export interface SubscriptionsAnalytics {
    total: number;
    active: number;
    expired: number;
    pendingPayment: number;
    totalRevenue: number;
    timeline: TimelinePoint[];
}

// ------------------------------------------------------------------
// 8. Support Tickets
// ------------------------------------------------------------------
export interface SupportAnalytics {
    total: number;
    byStatus: { OPEN: number; IN_PROGRESS: number; RESOLVED: number; CLOSED: number };
    byPriority: { LOW: number; MEDIUM: number; HIGH: number };
    bySenderType: { customer: number; brand: number };
    timeline: TimelinePoint[];
}

// ------------------------------------------------------------------
// 9. Reels
// ------------------------------------------------------------------
export interface ReelsAnalytics {
    total: number;
    visible: number;
    deleted: number;
    totalLikes: number;
    totalViews: number;
    timeline: TimelinePoint[];
}

// ------------------------------------------------------------------
// 10. Chat Sessions (customer AI chat)
// ------------------------------------------------------------------
export interface ChatSessionsAnalytics {
    total: number;
    finished: number;
    inProgress: number;
    timeline: TimelinePoint[];
}

// ------------------------------------------------------------------
// 11. Devices
// ------------------------------------------------------------------
export interface DevicesAnalytics {
    total: number;
    byPlatform: {
        ios: number;
        android: number;
        windows: number;
        macos: number;
        linux: number;
        other: number;
    };
}

// ------------------------------------------------------------------
// Root response
// ------------------------------------------------------------------
export interface AdminAnalyticsResult {
    period: AnalyticsPeriod;
    overview: PlatformOverview;
    customers: CustomersAnalytics;
    brands: BrandsAnalytics;
    repairRequests: RepairRequestsAnalytics;
    payments: PaymentsAnalytics;
    payouts: PayoutsAnalytics;
    subscriptions: SubscriptionsAnalytics;
    support: SupportAnalytics;
    reels: ReelsAnalytics;
    chatSessions: ChatSessionsAnalytics;
    devices: DevicesAnalytics;
}
