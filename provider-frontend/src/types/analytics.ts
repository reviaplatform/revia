export interface AnalyticsOverview {
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

export interface RepairRequestsData {
  byStatus: Record<string, number>;
  byFlow: {
    direct: number;
    ai_chat: number;
  };
  timeline: {
    date: string;
    count: number;
  }[];
}

export interface RevenueData {
  byType: {
    booking_cash_pos: number;
    booking_online: number;
    payout_sent: number;
  };
  timeline: {
    date: string;
    credit: number;
    debit: number;
  }[];
}

export interface OffersData {
  total: number;
  accepted: number;
  rejected: number;
  pending: number;
  acceptanceRate: number;
  avgInspectionPrice: number;
}

export interface ReviewsData {
  distribution: Record<string, number>;
  timeline: {
    date: string;
    avgRating: number;
    count: number;
  }[];
}

export interface PayoutsData {
  total: number;
  totalAmount: number;
  byMethod: Record<string, { count: number; amount: number }>;
  byStatus: Record<string, number>;
}

export interface SubscriptionData {
  status: 'pending_payment' | 'active' | 'expired' | null;
  expiresAt: string | null;
  daysRemaining: number | null;
}

export interface SupportData {
  byStatus: Record<string, number>;
  byPriority: Record<string, number>;
}

export interface AnalyticsResponse {
  status: string;
  data: {
    period: string;
    overview: AnalyticsOverview;
    repairRequests: RepairRequestsData;
    revenue: RevenueData;
    offers: OffersData;
    reviews: ReviewsData;
    payouts: PayoutsData;
    subscription: SubscriptionData;
    support: SupportData;
  };
}

export type AnalyticsPeriod = '7d' | '30d' | '90d' | '1y' | 'all';
