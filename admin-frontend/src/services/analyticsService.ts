import { apiFetch } from "@/lib/api";

export interface AnalyticsPeriod {
  period: string;
  overview: {
    totalCustomers: number;
    activeCustomers: number;
    bannedCustomers: number;
    totalBrands: number;
    activeBrands: number;
    pendingApprovalBrands: number;
    totalProviders: number;
    activeSubscriptions: number;
    newCustomers: number;
    newRepairRequests: number;
    totalRevenue: number;
    totalCommission: number;
    pendingPayouts: number;
    openSupportTickets: number;
  };
  customers: {
    total: number;
    byStatus: Record<string, number>;
    byGender: Record<string, number>;
    timeline: Array<{ date: string; count: number }>;
  };
  brands: {
    total: number;
    active: number;
    deleted: number;
    pendingApproval: number;
    timeline: Array<{ date: string; count: number }>;
    topByCompletedRepairs: Array<{
      id: string;
      name: string;
      completedRepairs: number;
      rating: number;
      walletBalance: number;
    }>;
  };
  repairRequests: {
    total: number;
    byStatus: Record<string, number>;
    byFlow: { direct: number; ai_chat: number };
    timeline: Array<{ date: string; count: number }>;
  };
  payments: {
    total: number;
    totalRevenue: number;
    totalCommission: number;
    totalBrandNet: number;
    byStatus: Record<string, number>;
    byType: { inspection: number; final: number };
    byMethod: { cash: number; pos: number; online: number };
    timeline: Array<{ date: string; revenue: number; commission: number }>;
  };
  payouts: {
    total: number;
    totalAmount: number;
    byStatus: Record<string, number>;
    byMethod: Record<string, { count: number; amount: number }>;
    timeline: Array<{ date: string; count: number }>;
  };
  subscriptions: {
    total: number;
    active: number;
    expired: number;
    pendingPayment: number;
    totalRevenue: number;
    timeline: Array<{ date: string; count: number }>;
  };
  support: {
    total: number;
    byStatus: Record<string, number>;
    byPriority: Record<string, number>;
    bySenderType: { customer: number; brand: number };
    timeline: Array<{ date: string; count: number }>;
  };
  reels: {
    total: number;
    visible: number;
    deleted: number;
    totalLikes: number;
    totalViews: number;
    timeline: Array<{ date: string; count: number }>;
  };
  chatSessions: {
    total: number;
    finished: number;
    inProgress: number;
    timeline: Array<{ date: string; count: number }>;
  };
  devices: {
    total: number;
    byPlatform: Record<string, number>;
  };
}

export interface AnalyticsResponse {
  status: string;
  data: AnalyticsPeriod;
}

// Keep the old interface for backward compatibility during migration if needed, 
// but we'll primarily use the new one.
export interface DashboardStats {
  totalUsers: number;
  totalProviders: number;
  totalCustomers: number;
  totalAdmins: number;
  totalCategories: number;
  revenue: string;
  revenueChange: string;
  bookings: string;
  bookingsChange: string;
  activeSessions: string;
  sessionsChange: string;
}

export const analyticsService = {
  /**
   * Fetches full analytics data from the new admin analytics endpoint.
   */
  getAnalytics: async (period: string = "30d"): Promise<AnalyticsPeriod> => {
    const response = await apiFetch<AnalyticsResponse>(`/analytics?period=${period}`);
    return response.data;
  },

  /**
   * @deprecated Use getAnalytics instead.
   * Maintained for compatibility during migration.
   */
  getAggregatedStats: async (): Promise<DashboardStats> => {
    try {
      const data = await analyticsService.getAnalytics("30d");
      return {
        totalUsers: data.overview.totalCustomers + data.overview.totalProviders,
        totalProviders: data.overview.totalProviders,
        totalCustomers: data.overview.totalCustomers,
        totalAdmins: 0, // Not explicitly in the new analytics API yet
        totalCategories: 0, // Not explicitly in the new analytics API yet
        revenue: `EGP ${data.overview.totalRevenue.toLocaleString()}`,
        revenueChange: "+0%", // Needs comparison data if available
        bookings: data.overview.newRepairRequests.toString(),
        bookingsChange: "+0%",
        activeSessions: data.chatSessions.inProgress.toString(),
        sessionsChange: "+0%",
      };
    } catch (error) {
      console.error("Failed to fetch analytics", error);
      throw error;
    }
  },
};
