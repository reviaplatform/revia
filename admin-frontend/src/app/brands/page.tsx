"use client";

import { useState, useEffect } from "react";
import { SidebarMinimalistic as PanelLeft } from "@solar-icons/react";
import { SpinnerCustom } from "@/components/ui/spinner-custom";
import { AppSidebar } from "@/components/app-sidebar";
import { brandAdminApi, BrandListItem, BrandReview } from "@/services/brandService";
import { toast } from "sonner";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarProvider } from "@/components/ui/sidebar-provider";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BrandCard } from "@/components/brand-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Magnifer as Search,
  Filter,
  Buildings as Building2,
  CheckCircle,
  ClockCircle as Clock,
  CloseCircle as XCircle,
  Forbidden as Ban,
  Eye,
  EyeClosed as EyeOff,
  GraphUp as TrendingUp,
  UsersGroupRounded as Users,
  Global as Globe,
} from "@solar-icons/react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Local interface removed in favor of BrandListItem from service

import { PageTemplate } from "@/components/page-template";
import { BrandsSkeleton } from "@/components/brands-skeleton";
import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP);

export default function BrandsPage() {
  const [currentPage, setCurrentPage] = useState("Brands");
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [brandsData, setBrandsData] = useState<BrandListItem[]>([]);
  const [isUpdating, setIsUpdating] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const [reviewsData, setReviewsData] = useState<BrandReview[]>([]);
  const [isReviewsLoading, setIsReviewsLoading] = useState(false);

  const fetchReviews = async () => {
    setIsReviewsLoading(true);
    try {
      const response = await brandAdminApi.getAllReviews();
      let list: BrandReview[] = [];
      if (Array.isArray(response)) {
        list = response;
      } else if ((response as any)?.data && Array.isArray((response as any).data)) {
        list = (response as any).data;
      }
      setReviewsData(list);
    } catch (err: any) {
      toast.error("Failed to load reviews", { description: err.message });
      setReviewsData([]);
    } finally {
      setIsReviewsLoading(false);
    }
  };

  const getBrandDetails = (brandId: string) => {
    const brand = brandsData.find(b => b.id === brandId || b._id === brandId);
    return brand ? {
      name: typeof brand.name === 'object' ? brand.name.en : brand.name || "Unknown Brand",
      logo: brand.logo
    } : {
      name: "Unknown Brand",
      logo: null
    };
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <span
            key={i}
            className={`text-sm ${
              i < rating ? "text-amber-500" : "text-muted-foreground/30"
            }`}
          >
            ★
          </span>
        ))}
      </div>
    );
  };

  useGSAP(
    () => {
      if (!isLoading && brandsData.length > 0) {
        // Animate stats cards
        gsap.from(".stat-card", {
          y: 20,
          opacity: 0,
          duration: 0.6,
          stagger: 0.1,
          ease: "power2.out",
          clearProps: "all",
        });

        // Animate brand cards grid
        gsap.from(".brand-card-anim", {
          y: 40,
          opacity: 0,
          scale: 0.98,
          duration: 0.8,
          stagger: {
            each: 0.04,
            grid: "auto",
            from: "start",
          },
          ease: "power4.out",
          delay: 0.2,
          clearProps: "all",
        });
      }
    },
    { scope: containerRef, dependencies: [isLoading, brandsData.length] }
  );

  const fetchBrands = async () => {
    setIsLoading(true);
    try {
      const response = await brandAdminApi.getList(1, 100);
      let list: BrandListItem[] = [];
      if (Array.isArray(response)) {
        list = response;
      } else if (response?.data && Array.isArray(response.data)) {
        list = response.data;
      } else if (response?.items && Array.isArray(response.items)) {
        list = response.items;
      } else if (response?.brands && Array.isArray(response.brands)) {
        list = response.brands;
      }
      setBrandsData(list);
    } catch (err: any) {
      toast.error("Failed to load brands", { description: err.message });
      setBrandsData([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBrands();
    fetchReviews();
  }, []);

  if (isLoading) {
    return <BrandsSkeleton />;
  }

  // Brand management functions
  const handleUpdateBrand = (id: string, data: Partial<BrandListItem>) => {
    setBrandsData((prev) =>
      prev.map((brand) => (brand.id === id || brand._id === id ? { ...brand, ...data } : brand))
    );
  };



  const handleApproveBrand = async (id: string) => {
    setIsUpdating(true);
    try {
      await brandAdminApi.approve(id);
      toast.success("Brand Approved");
      fetchBrands();
    } catch (e: any) {
      toast.error("Failed to approve", { description: e.message });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRejectBrand = (id: string) => {
    setBrandsData((prev) =>
      prev.map((brand) =>
        brand.id === id || brand._id === id ? { ...brand, status: "rejected" } : brand
      )
    );
    toast.success("Brand Rejected (Local change only)");
  };

  const handleBanBrand = async (id: string) => {
    setIsUpdating(true);
    try {
      await brandAdminApi.ban(id);
      toast.success("Brand Banned");
      fetchBrands();
    } catch (e: any) {
      toast.error("Failed to ban", { description: e.message });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUnbanBrand = async (id: string) => {
    setIsUpdating(true);
    try {
      await brandAdminApi.unban(id);
      toast.success("Brand Unbanned");
      fetchBrands();
    } catch (e: any) {
      toast.error("Failed to unban", { description: e.message });
    } finally {
      setIsUpdating(false);
    }
  };



  const filteredBrands = brandsData.filter((brand) => {
    const isBanned = brand.isBanned || (brand.status || "").toLowerCase() === "banned" || !!brand.deletedAt;
    const isApproved = brand.isApproved || (brand.status || "").toLowerCase() === "approved" || !!brand.approvedAt;
    const isPending = !isBanned && !isApproved && (brand.status === "pending" || !brand.status);

    const nameEn = typeof brand.name === 'object' ? brand.name.en : brand.name || "";
    const nameAr = typeof brand.name === 'object' ? brand.name.ar : "";
    const crn = brand.crn || "";
    const tin = brand.tin || "";
    const id = brand.id || brand._id || "";

    const matchesSearch =
      nameEn.toLowerCase().includes(searchTerm.toLowerCase()) ||
      nameAr.toLowerCase().includes(searchTerm.toLowerCase()) ||
      crn.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tin.toLowerCase().includes(searchTerm.toLowerCase()) ||
      id.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "approved" && isApproved) ||
      (statusFilter === "pending" && isPending) ||
      (statusFilter === "banned" && isBanned);

    return matchesSearch && matchesStatus;
  });

  const totalBrands = brandsData.length;
  const approvedBrands = brandsData.filter(b => 
    b.approvedAt || (b.status || "").toLowerCase() === "approved" || b.isApproved
  ).length;
  
  const bannedBrands = brandsData.filter(b => 
    b.deletedAt || (b.status || "").toLowerCase() === "banned" || b.isBanned
  ).length;
  
  const pendingBrands = brandsData.filter(b => {
    const banned = b.deletedAt || (b.status || "").toLowerCase() === "banned" || b.isBanned;
    const approved = b.approvedAt || (b.status || "").toLowerCase() === "approved" || b.isApproved;
    return !banned && !approved && (b.status === "pending" || !b.status);
  }).length;
  
  const totalRepairs = brandsData.reduce((sum, b) => sum + (b.completedRepairs || 0), 0);

  return (
    <PageTemplate currentPage={currentPage}>
      <div className="space-y-8" ref={containerRef}>
        {/* Page Hero */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 gsap-entrance">
          <div className="flex flex-col gap-1 border-l-2 border-primary/20 pl-6">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-black tracking-tighter text-foreground uppercase">
                Brand Management
              </h1>
              <Badge variant="secondary" className="rounded-sm bg-primary/10 text-primary border-none text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 h-fit">
                {totalBrands} Partners
              </Badge>
              {pendingBrands > 0 && (
                <Badge variant="outline" className="rounded-sm px-2 py-0.5 h-fit text-[10px] font-bold bg-orange-500/10 text-orange-600 border-orange-200/50 uppercase tracking-wider">
                  {pendingBrands} Awaiting Review
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground font-medium max-w-[50ch]">
              Configure brand partnerships, monitor approval status, and manage platform visibility settings across the product catalog.
            </p>
          </div>
        </div>

        <Tabs defaultValue="directory" className="w-full" onValueChange={(val) => {
          if (val === "reviews") {
            fetchReviews();
          } else {
            fetchBrands();
          }
        }}>
          <TabsList className="grid grid-cols-2 max-w-[400px] border border-border/50 bg-muted/20 mb-6">
            <TabsTrigger value="directory" className="text-xs font-semibold">Brand Directory</TabsTrigger>
            <TabsTrigger value="reviews" className="text-xs font-semibold">Reviews Feed</TabsTrigger>
          </TabsList>

          <TabsContent value="directory" className="space-y-6">
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Approved Brands Card */}
              <div className="group bg-card border border-border rounded-md p-5 transition-all duration-300 hover:border-green-500/30 hover:bg-green-500/[0.02] stat-card">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2.5 bg-green-500/10 rounded-md border border-green-500/20 text-green-600 group-hover:bg-green-500/20 transition-colors">
                    <CheckCircle className="h-5 w-5" />
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold tracking-tight text-foreground">
                      {approvedBrands}
                    </div>
                    <div className="text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground/80">Approved</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-1 w-1 rounded-full bg-green-500" />
                  <span className="text-[11px] font-medium text-muted-foreground">Active partnerships</span>
                </div>
              </div>

              {/* Pending Brands Card */}
              <div className="group bg-card border border-border rounded-md p-5 transition-all duration-300 hover:border-orange-500/30 hover:bg-orange-500/[0.02] stat-card">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2.5 bg-orange-500/10 rounded-md border border-orange-500/20 text-orange-600 group-hover:bg-orange-500/20 transition-colors">
                    <Clock className="h-5 w-5" />
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold tracking-tight text-foreground">
                      {pendingBrands}
                    </div>
                    <div className="text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground/80">Pending</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-1 w-1 rounded-full bg-orange-500" />
                  <span className="text-[11px] font-medium text-muted-foreground">Awaiting review</span>
                </div>
              </div>

              {/* Banned Brands Card */}
              <div className="group bg-card border border-border rounded-md p-5 transition-all duration-300 hover:border-red-500/30 hover:bg-red-500/[0.02] stat-card">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2.5 bg-red-500/10 rounded-md border border-red-500/20 text-red-600 group-hover:bg-red-500/20 transition-colors">
                    <Ban className="h-5 w-5" />
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold tracking-tight text-foreground">
                      {bannedBrands}
                    </div>
                    <div className="text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground/80">Restricted</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-1 w-1 rounded-full bg-red-500" />
                  <span className="text-[11px] font-medium text-muted-foreground">Access revoked</span>
                </div>
              </div>

              {/* Total Repairs Card */}
              <div className="group bg-card border border-border rounded-md p-5 transition-all duration-300 hover:border-primary/30 hover:bg-primary/[0.02] stat-card">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2.5 bg-primary/10 rounded-md border border-primary/20 text-primary group-hover:bg-primary/20 transition-colors">
                    <TrendingUp className="h-5 w-5" />
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold tracking-tight text-foreground">
                      {totalRepairs.toLocaleString()}
                    </div>
                    <div className="text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground/80">Total Repairs</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-1 w-1 rounded-full bg-primary" />
                  <span className="text-[11px] font-medium text-muted-foreground">Platform throughput</span>
                </div>
              </div>
            </div>

            {/* Search and Filters */}
            <div className="bg-card border border-border rounded-md p-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/60" />
                  <Input
                    placeholder="Search brands by name, CRN, TIN or ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 h-10 rounded-md border-border bg-background focus:ring-primary/20 transition-all font-medium text-sm"
                  />
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Select
                    value={statusFilter}
                    onValueChange={setStatusFilter}
                  >
                    <SelectTrigger className="h-10 text-xs w-full sm:w-[150px] rounded-md border-border bg-background hover:bg-muted/50 transition-colors capitalize font-medium">
                      <div className="flex items-center">
                        <Filter className="h-3.5 w-3.5 mr-2 text-muted-foreground/70" />
                        <SelectValue placeholder="Status" />
                      </div>
                    </SelectTrigger>
                    <SelectContent className="rounded-md border-border">
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="banned">Banned</SelectItem>
                    </SelectContent>
                  </Select>

                </div>
              </div>
            </div>

            {/* Brands Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredBrands.map((brand: BrandListItem, index) => {
                const isBanned = brand.isBanned || (brand.status || "").toLowerCase() === "banned" || !!brand.deletedAt;
                const isApproved = brand.isApproved || (brand.status || "").toLowerCase() === "approved" || !!brand.approvedAt;

                let status = "pending";
                if (isBanned) status = "banned";
                else if (isApproved) status = "approved";
                else if ((brand.status || "").toLowerCase() === "rejected") status = "rejected";

                return (
                  <div
                    key={brand.id || brand._id}
                    className="brand-card-anim"
                  >
                    <BrandCard
                      brand={{
                        ...brand,
                        id: String(brand.id || brand._id || ""),
                        status: status,
                        isBanned: isBanned,
                      }}
                      onApprove={handleApproveBrand}
                      onReject={handleRejectBrand}
                      onBan={handleBanBrand}
                      onUnban={handleUnbanBrand}
                    />
                  </div>
                );
              })}
            </div>

            {/* Empty State */}
            {filteredBrands.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 text-center bg-card border border-border border-dashed rounded-md">
                <div className="p-4 bg-muted/30 rounded-full mb-4">
                  <Building2 className="h-10 w-10 text-muted-foreground/40" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">
                  No brands found
                </h3>
                <p className="text-muted-foreground mb-8 max-w-[40ch]">
                  {searchTerm ||
                    statusFilter !== "all"
                    ? "We couldn't find any brands matching your filters. Try clearing them to see everything."
                    : "Your brand catalog is empty. Start by onboarding your first partner."}
                </p>
                {(searchTerm || statusFilter !== "all") && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchTerm("");
                      setStatusFilter("all");
                    }}
                    className="rounded-md h-10 px-6 font-semibold"
                  >
                    Clear Filters
                  </Button>
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="reviews" className="space-y-6">
            {isReviewsLoading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-2">
                <SpinnerCustom className="h-8 w-8 text-primary animate-spin" />
                <span className="text-xs text-muted-foreground">Loading reviews...</span>
              </div>
            ) : reviewsData.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center bg-card border border-border border-dashed rounded-md">
                <div className="p-4 bg-muted/30 rounded-full mb-4">
                  <TrendingUp className="h-10 w-10 text-muted-foreground/40" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">No reviews yet</h3>
                <p className="text-muted-foreground max-w-[40ch]">
                  Customers have not submitted any reviews for brands on the platform yet.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {reviewsData.map((review) => {
                  const brandInfo = getBrandDetails(review.brandId);
                  return (
                    <div key={review.id} className="bg-card border border-border rounded-md p-5 flex flex-col justify-between hover:border-primary/30 transition-all duration-300 group">
                      <div className="space-y-3">
                        {/* Header: Customer and Date */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">
                              {review.customerName ? review.customerName.slice(0, 2).toUpperCase() : "U"}
                            </div>
                            <span className="text-xs font-semibold text-foreground">
                              {review.customerName || `Customer #${review.customerId.slice(-6).toUpperCase()}`}
                            </span>
                          </div>
                          <span className="text-[10px] text-muted-foreground font-mono">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </span>
                        </div>

                        {/* Rating Stars and Req ID */}
                        <div className="flex items-center justify-between">
                          {renderStars(review.rating)}
                          <span className="text-[9px] text-muted-foreground/50 font-mono">
                            Req ID: {review.repairRequestId.slice(-6).toUpperCase()}
                          </span>
                        </div>

                        {/* Review Comment */}
                        {review.comment && (
                          <p className="text-xs text-muted-foreground italic bg-muted/20 p-2.5 rounded border border-border/30">
                            "{review.comment}"
                          </p>
                        )}
                      </div>

                      {/* Brand Info Footnote */}
                      <div className="mt-4 pt-3 border-t border-border/60 flex items-center gap-2.5">
                        <div className="w-8 h-8 bg-muted rounded border border-border flex items-center justify-center overflow-hidden">
                          {brandInfo.logo ? (
                            <img src={brandInfo.logo} alt={brandInfo.name} className="w-full h-full object-cover" />
                          ) : (
                            <Building2 className="h-4 w-4 text-muted-foreground/40" />
                          )}
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block leading-none mb-0.5">Reviewed Brand</span>
                          <span className="text-xs font-bold text-foreground leading-none">{brandInfo.name}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </PageTemplate>
  );
}
