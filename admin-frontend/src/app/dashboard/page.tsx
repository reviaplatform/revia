"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import {
  UsersGroupRounded as Users,
  Cart as ShoppingCart,
  Dollar as DollarSign,
  Restart as Activity,
  Calendar,
  Shop as BrandIcon,
  ChatLine as ChatIcon,
  Widget as DeviceIcon,
  QuestionCircle as SupportIcon,
  MedalStar as RewardIcon,
} from "@solar-icons/react";
import { SpinnerCustom } from "@/components/ui/spinner-custom";
import { analyticsService, AnalyticsPeriod } from "@/services/analyticsService";
import { DashboardSkeleton } from "@/components/dashboard-skeleton";
import { PageTemplate } from "@/components/page-template";
import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

// Lazy load heavy chart components
const RevenueUsersChart = dynamic(
  () => import("@/components/revenue-users-chart").then((mod) => mod.RevenueUsersChart),
  {
    ssr: false,
    loading: () => (
      <div className="h-[400px] w-full bg-card animate-pulse rounded-lg flex items-center justify-center border border-border/50">
        <SpinnerCustom className="h-6 w-6 opacity-30" />
      </div>
    ),
  }
);

export default function DashboardPage() {
  const [period, setPeriod] = useState("30d");
  const [isLoading, setIsLoading] = useState(true);
  const [analytics, setAnalytics] = useState<AnalyticsPeriod | null>(null);
  const router = useRouter();
  const metricsRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!isLoading && analytics) {
        // Animate metrics with a slight bounce
        gsap.from(".metric-card", {
          y: 30,
          opacity: 0,
          scale: 0.98,
          duration: 0.8,
          stagger: 0.05,
          ease: "back.out(1.2)",
          clearProps: "all",
        });

        // Animate charts and tables with a smoother slide
        gsap.from(".chart-container", {
          y: 40,
          opacity: 0,
          duration: 1,
          stagger: 0.15,
          ease: "power4.out",
          delay: 0.2,
          clearProps: "all",
        });
      }
    },
    { scope: metricsRef, dependencies: [isLoading, analytics] }
  );

  useEffect(() => {
    const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";
    if (!isAuthenticated) {
      router.push("/auth/login");
      return;
    }
    fetchAnalytics();
  }, [period, router]);

  const fetchAnalytics = async () => {
    setIsLoading(true);
    try {
      const data = await analyticsService.getAnalytics(period);
      setAnalytics(data);
    } catch (error) {
      console.error("Failed to load analytics", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && !analytics) {
    return <DashboardSkeleton />;
  }

  const overview = analytics?.overview;

  return (
    <PageTemplate currentPage="Dashboard">
      <div className="flex flex-col gap-6 md:gap-8" ref={metricsRef}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-l-2 border-primary/20 pl-6 gsap-entrance">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl md:text-3xl font-black tracking-tighter text-foreground uppercase">
              Platform Performance
            </h1>
            <p className="text-sm text-muted-foreground font-medium max-w-[50ch]">
              Real-time overview of Revia's operational metrics for the selected period.
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-full md:w-[160px] h-10 text-xs font-semibold bg-background border-border/50">
                <Calendar className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                <SelectValue placeholder="Select Period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 Days</SelectItem>
                <SelectItem value="30d">Last 30 Days</SelectItem>
                <SelectItem value="90d">Last 90 Days</SelectItem>
                <SelectItem value="1y">Last Year</SelectItem>
                <SelectItem value="all">All Time</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Key Metric Cards */}
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              title: "Total Revenue",
              value: `EGP ${overview?.totalRevenue.toLocaleString() || "0"}`,
              subValue: `Comm: EGP ${overview?.totalCommission.toLocaleString() || "0"}`,
              icon: DollarSign,
              color: "text-primary",
            },
            {
              title: "New Customers",
              value: overview?.newCustomers.toLocaleString() || "0",
              subValue: `Total: ${overview?.totalCustomers.toLocaleString() || "0"}`,
              icon: Users,
              color: "text-wf-green",
            },
            {
              title: "Repair Requests",
              value: overview?.newRepairRequests.toLocaleString() || "0",
              subValue: `${analytics?.repairRequests.byFlow.ai_chat || 0} via AI Chat`,
              icon: ShoppingCart,
              color: "text-wf-yellow",
            },
            {
              title: "Active Brands",
              value: overview?.activeBrands.toLocaleString() || "0",
              subValue: `${overview?.pendingApprovalBrands || 0} Pending`,
              icon: BrandIcon,
              color: "text-blue-500",
            },
            {
              title: "Total Providers",
              value: overview?.totalProviders.toLocaleString() || "0",
              subValue: "Registered Mechanics",
              icon: Users,
              color: "text-purple-500",
            },
            {
              title: "Active Subscriptions",
              value: overview?.activeSubscriptions.toLocaleString() || "0",
              subValue: `Revenue: EGP ${analytics?.subscriptions.totalRevenue.toLocaleString() || "0"}`,
              icon: RewardIcon,
              color: "text-pink-500",
            },
            {
              title: "Pending Payouts",
              value: overview?.pendingPayouts.toLocaleString() || "0",
              subValue: `Total: EGP ${analytics?.payouts.totalAmount.toLocaleString() || "0"}`,
              icon: DollarSign,
              color: "text-emerald-500",
            },
            {
              title: "Total Reels",
              value: analytics?.reels.total.toLocaleString() || "0",
              subValue: `Views: ${analytics?.reels.totalViews.toLocaleString() || "0"}`,
              icon: Activity,
              color: "text-red-500",
            },
          ].map((metric) => (
            <Card
              key={metric.title}
              className="border-border/50 bg-card hover:border-primary/30 transition-all duration-200 group relative overflow-hidden metric-card"
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 pt-5 px-5">
                <CardTitle className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                  {metric.title}
                </CardTitle>
                <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                  <metric.icon className={`h-4 w-4 ${metric.color}`} />
                </div>
              </CardHeader>
              <CardContent className="pb-5 px-5 space-y-1">
                <div className="text-2xl font-bold tracking-tight tabular-nums">{metric.value}</div>
                <p className="text-[11px] text-muted-foreground font-medium">{metric.subValue}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tabbed Analytics Interface */}
        <Tabs defaultValue="financials" className="w-full chart-container">
          <TabsList className="grid grid-cols-3 max-w-[600px] border border-border/50 bg-muted/20 mb-6">
            <TabsTrigger value="financials" className="text-xs font-semibold">Financial Performance</TabsTrigger>
            <TabsTrigger value="repairs" className="text-xs font-semibold">Repair Operations</TabsTrigger>
            <TabsTrigger value="platforms" className="text-xs font-semibold">Platforms & Insights</TabsTrigger>
          </TabsList>

          {/* TAB 1: Financials */}
          <TabsContent value="financials" className="space-y-6">
            <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
              <Card className="lg:col-span-2 border-border/50 bg-card overflow-hidden">
                <CardHeader className="px-6 pt-6 pb-2">
                  <CardTitle className="text-base font-semibold tracking-tight">Revenue & User Growth</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <RevenueUsersChart
                    data={analytics?.payments.timeline.map(t => ({
                      month: t.date,
                      date: t.date,
                      revenue: t.revenue,
                      users: analytics.customers.timeline.find(c => c.date === t.date)?.count || 0
                    }))}
                  />
                </CardContent>
              </Card>

              <div className="flex flex-col gap-6">
                <Card className="border-border/50 bg-card">
                  <CardHeader className="px-6 pt-6 pb-2">
                    <CardTitle className="text-base font-semibold tracking-tight">Payments Breakdown</CardTitle>
                  </CardHeader>
                  <CardContent className="px-6 py-4 space-y-4">
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="bg-muted/30 p-2 rounded-lg border border-border/50">
                        <p className="text-[9px] font-bold text-muted-foreground uppercase">Revenue</p>
                        <p className="text-xs font-bold truncate">EGP {analytics?.payments.totalRevenue.toLocaleString()}</p>
                      </div>
                      <div className="bg-muted/30 p-2 rounded-lg border border-border/50">
                        <p className="text-[9px] font-bold text-muted-foreground uppercase">Commission</p>
                        <p className="text-xs font-bold truncate text-primary">EGP {analytics?.payments.totalCommission.toLocaleString()}</p>
                      </div>
                      <div className="bg-muted/30 p-2 rounded-lg border border-border/50">
                        <p className="text-[9px] font-bold text-muted-foreground uppercase">Brand Net</p>
                        <p className="text-xs font-bold truncate text-wf-green">EGP {analytics?.payments.totalBrandNet.toLocaleString()}</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase">Payment Methods</p>
                      <div className="grid grid-cols-3 gap-2">
                        {analytics?.payments.byMethod && Object.entries(analytics.payments.byMethod).map(([method, count]) => (
                          <div key={method} className="bg-muted/20 p-2 rounded-lg text-center text-xs">
                            <span className="capitalize font-medium block text-muted-foreground text-[10px]">{method}</span>
                            <span className="font-bold">{count}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase">Payment Statuses</p>
                      <div className="grid grid-cols-4 gap-2">
                        {analytics?.payments.byStatus && Object.entries(analytics.payments.byStatus).map(([status, count]) => (
                          <div key={status} className="bg-muted/20 p-2 rounded-lg text-center text-xs">
                            <span className="capitalize font-medium block text-muted-foreground text-[9px]">{status}</span>
                            <span className="font-bold">{count}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-border/50 bg-card">
                  <CardHeader className="px-6 pt-6 pb-2">
                    <CardTitle className="text-base font-semibold tracking-tight">Payouts & Subscriptions</CardTitle>
                  </CardHeader>
                  <CardContent className="px-6 py-4 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase">Subscriptions</p>
                        <div className="bg-muted/30 p-3 rounded-lg space-y-1.5 text-xs">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Active:</span>
                            <span className="font-bold text-wf-green">{analytics?.subscriptions.active}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Expired:</span>
                            <span className="font-bold text-secondary-red">{analytics?.subscriptions.expired}</span>
                          </div>
                          <div className="flex justify-between border-t border-border/50 pt-1.5">
                            <span className="text-muted-foreground">Rev:</span>
                            <span className="font-bold">EGP {analytics?.subscriptions.totalRevenue.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase">Payout Methods</p>
                        <div className="bg-muted/30 p-3 rounded-lg space-y-1.5 text-xs">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Instapay:</span>
                            <span className="font-bold">EGP {analytics?.payouts.byMethod.instapay.amount.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Bank:</span>
                            <span className="font-bold">EGP {analytics?.payouts.byMethod.bank.amount.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Wallet:</span>
                            <span className="font-bold">EGP {analytics?.payouts.byMethod.wallet.amount.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* TAB 2: Repair Operations */}
          <TabsContent value="repairs" className="space-y-6">
            <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
              <Card className="lg:col-span-2 border-border/50 bg-card">
                <CardHeader className="px-6 pt-6 pb-4 border-b border-border/50">
                  <CardTitle className="text-base font-semibold tracking-tight">Repair Requests Status Breakdown</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {analytics?.repairRequests.byStatus && Object.entries(analytics.repairRequests.byStatus).map(([status, count]) => {
                      const displayStatus = status.replace(/_/g, ' ');
                      const percentage = (count / (analytics.repairRequests.total || 1)) * 100;
                      return (
                        <div key={status} className="space-y-1 p-2 bg-muted/20 border border-border/30 rounded-lg">
                          <div className="flex items-center justify-between text-xs">
                            <span className="capitalize font-medium text-foreground">{displayStatus}</span>
                            <span className="font-mono font-bold text-primary">{count}</span>
                          </div>
                          <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary rounded-full"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              <div className="flex flex-col gap-6">
                <Card className="border-border/50 bg-card">
                  <CardHeader className="px-6 pt-6 pb-2">
                    <CardTitle className="text-base font-semibold tracking-tight">Support Tickets</CardTitle>
                  </CardHeader>
                  <CardContent className="px-6 py-4 space-y-4 text-xs">
                    <div className="space-y-2">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase">By Status</p>
                      <div className="grid grid-cols-2 gap-2">
                        {analytics?.support.byStatus && Object.entries(analytics.support.byStatus).map(([status, count]) => (
                          <div key={status} className="flex justify-between p-2 bg-muted/30 rounded-lg">
                            <span className="text-muted-foreground uppercase text-[9px] font-bold">{status}</span>
                            <span className="font-bold">{count}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase">By Priority</p>
                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div className="bg-blue-500/5 text-blue-500 border border-blue-500/10 p-2 rounded-lg">
                          <span className="block text-[9px] font-bold uppercase">Low</span>
                          <span className="font-bold text-sm">{analytics?.support.byPriority.LOW ?? 0}</span>
                        </div>
                        <div className="bg-yellow-500/5 text-yellow-500 border border-yellow-500/10 p-2 rounded-lg">
                          <span className="block text-[9px] font-bold uppercase">Medium</span>
                          <span className="font-bold text-sm">{analytics?.support.byPriority.MEDIUM ?? 0}</span>
                        </div>
                        <div className="bg-red-500/5 text-red-500 border border-red-500/10 p-2 rounded-lg">
                          <span className="block text-[9px] font-bold uppercase">High</span>
                          <span className="font-bold text-sm">{analytics?.support.byPriority.HIGH ?? 0}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-border/50 bg-card">
                  <CardHeader className="px-6 pt-6 pb-2">
                    <CardTitle className="text-base font-semibold tracking-tight">AI Chat Sessions</CardTitle>
                  </CardHeader>
                  <CardContent className="px-6 py-4 space-y-3">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-muted-foreground font-medium">In Progress Sessions:</span>
                      <span className="font-bold text-wf-yellow text-sm">{analytics?.chatSessions.inProgress}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-muted-foreground font-medium">Finished Sessions:</span>
                      <span className="font-bold text-wf-green text-sm">{analytics?.chatSessions.finished}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs border-t border-border/50 pt-2">
                      <span className="text-muted-foreground font-semibold">Total Sessions:</span>
                      <span className="font-bold text-sm">{analytics?.chatSessions.total}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* TAB 3: Platforms & Insights */}
          <TabsContent value="platforms" className="space-y-6">
            <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
              {/* Devices & Platforms Card */}
              <Card className="border-border/50 bg-card">
                <CardHeader className="px-6 pt-6 pb-2">
                  <CardTitle className="text-base font-semibold tracking-tight">Devices & Platforms</CardTitle>
                </CardHeader>
                <CardContent className="px-6 py-4">
                  <div className="space-y-4">
                    {analytics?.devices.byPlatform && Object.entries(analytics.devices.byPlatform).map(([platform, count]) => (
                      <div key={platform} className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="capitalize font-medium text-foreground flex items-center gap-1.5">
                            <DeviceIcon className="h-3 w-3 text-muted-foreground" />
                            {platform}
                          </span>
                          <span className="font-mono text-muted-foreground">{count.toLocaleString()}</span>
                        </div>
                        <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary/60 rounded-full"
                            style={{ width: `${(count / (analytics?.devices.total || 1)) * 100}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Top Performing Brands Table */}
              <Card className="border-border/50 bg-card overflow-hidden">
                <CardHeader className="px-6 pt-6 pb-4 border-b border-border/50">
                  <CardTitle className="text-base font-semibold tracking-tight">Top Performing Brands</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader className="bg-muted/30">
                        <TableRow className="hover:bg-transparent border-border/50">
                          <TableHead className="text-[10px] font-bold uppercase tracking-wider pl-6">Brand Name</TableHead>
                          <TableHead className="text-[10px] font-bold uppercase tracking-wider text-center">Repairs</TableHead>
                          <TableHead className="text-[10px] font-bold uppercase tracking-wider text-right pr-6">Balance</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {analytics?.brands.topByCompletedRepairs.map((brand) => (
                          <TableRow key={brand.id} className="group border-border/40 hover:bg-muted/30 transition-colors">
                            <TableCell className="pl-6">
                              <span className="font-semibold text-sm">{brand.name}</span>
                            </TableCell>
                            <TableCell className="text-center font-mono text-sm">{brand.completedRepairs}</TableCell>
                            <TableCell className="text-right pr-6 font-mono text-sm font-semibold text-wf-green">
                              EGP {brand.walletBalance.toLocaleString()}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>

              {/* Reels & Customer Demographics */}
              <div className="flex flex-col gap-6">
                <Card className="border-border/50 bg-card">
                  <CardHeader className="px-6 pt-6 pb-2">
                    <CardTitle className="text-base font-semibold tracking-tight">Reels Performance</CardTitle>
                  </CardHeader>
                  <CardContent className="px-6 py-4 space-y-3 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground font-medium">Total Videos:</span>
                      <span className="font-bold text-sm">{analytics?.reels.total}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground font-medium">Visible / Deleted:</span>
                      <span className="font-bold text-sm text-primary">{analytics?.reels.visible} / {analytics?.reels.deleted}</span>
                    </div>
                    <div className="flex justify-between items-center border-t border-border/50 pt-2">
                      <span className="text-muted-foreground font-medium">Total Likes:</span>
                      <span className="font-bold text-sm text-wf-green">{analytics?.reels.totalLikes.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground font-medium">Total Views:</span>
                      <span className="font-bold text-sm text-blue-500">{analytics?.reels.totalViews.toLocaleString()}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-border/50 bg-card">
                  <CardHeader className="px-6 pt-6 pb-2">
                    <CardTitle className="text-base font-semibold tracking-tight">Customer Demographics</CardTitle>
                  </CardHeader>
                  <CardContent className="px-6 py-4 space-y-3 text-xs">
                    <div className="space-y-1.5">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase">Gender Split</p>
                      <div className="flex gap-4">
                        <div className="flex-1 bg-blue-500/5 text-blue-500 border border-blue-500/10 p-2 rounded-lg text-center">
                          <span className="block text-[9px] font-bold uppercase">Male</span>
                          <span className="font-bold text-sm">{analytics?.customers.byGender.male ?? 0}</span>
                        </div>
                        <div className="flex-1 bg-pink-500/5 text-pink-500 border border-pink-500/10 p-2 rounded-lg text-center">
                          <span className="block text-[9px] font-bold uppercase">Female</span>
                          <span className="font-bold text-sm">{analytics?.customers.byGender.female ?? 0}</span>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-1.5 border-t border-border/50 pt-2">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase">Status Breakdown</p>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Active Customers:</span>
                        <span className="font-bold text-wf-green">{analytics?.customers.byStatus.active ?? 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Banned Customers:</span>
                        <span className="font-bold text-secondary-red">{analytics?.customers.byStatus.banned ?? 0}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </PageTemplate>
  );
}
