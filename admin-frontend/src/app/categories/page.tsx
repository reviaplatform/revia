"use client";

import { useState, useEffect } from "react";
import { SidebarMinimalistic as PanelLeft } from "@solar-icons/react";
import { SpinnerCustom } from "@/components/ui/spinner-custom";
import { AppSidebar } from "@/components/app-sidebar";
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
import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP);
import { CategoryCard } from "@/components/category-card";
import { CreateCategoryDialog } from "@/components/create-category-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Magnifer as Search,
  Filter,
  Tag,
  GraphUp as TrendingUp,
  Eye,
  EyeClosed as EyeOff,
  Box as Package,
  Dollar,
} from "@solar-icons/react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { categoryAdminApi, CategoryListItem } from "@/services/categoryService";
import { toast } from "sonner";


import { PageTemplate } from "@/components/page-template";
import { CategoriesSkeleton } from "@/components/categories-skeleton";

export default function CategoriesPage() {
  const [currentPage, setCurrentPage] = useState("Categories");
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [commissionFilter, setCommissionFilter] = useState("all");

  const [categories, setCategories] = useState<CategoryListItem[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!isLoading && categories.length > 0) {
        // Animate stat cards
        gsap.from(".stat-card", {
          y: 20,
          opacity: 0,
          duration: 0.6,
          stagger: 0.1,
          ease: "power2.out",
          clearProps: "all",
        });

        // Animate category cards grid
        gsap.from(".category-card-anim", {
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
    { scope: containerRef, dependencies: [isLoading, categories.length] }
  );
  const fetchCategories = async () => {
    setIsLoading(true);
    try {
      const res = await categoryAdminApi.getList(1, 100);
      let list: CategoryListItem[] = [];
      if (Array.isArray(res)) list = res;
      else if (res?.data && Array.isArray(res.data)) list = res.data;
      setCategories(list);
    } catch (e: any) { toast.error(e.message) }
    finally { setIsLoading(false) }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  if (isLoading) {
    return <CategoriesSkeleton />;
  }

  const filteredCategories = categories.filter((category) => {
    const rawEn = category.name?.en || "";
    const rawAr = category.name?.ar || "";
    const matchesSearch = rawEn.toLowerCase().includes(searchTerm.toLowerCase()) || rawAr.toLowerCase().includes(searchTerm.toLowerCase()) || category.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const isActive = category.isActive !== false;
    const matchesStatus = statusFilter === "all" || (statusFilter === "active" && isActive) || (statusFilter === "hidden" && !isActive);
    
    const rate = category.commissionPerRequest || 0;
    let matchesCommission = true;
    if (commissionFilter === "high") matchesCommission = rate >= 8;
    else if (commissionFilter === "medium") matchesCommission = rate >= 5 && rate < 8;
    else if (commissionFilter === "low") matchesCommission = rate < 5;

    return matchesSearch && matchesStatus && matchesCommission;
  });

  const activeCategories = categories.filter((cat) => cat.isActive !== false).length;
  const hiddenCategories = categories.filter((cat) => cat.isActive === false).length;
  const totalCom = categories.reduce((sum, cat) => sum + (cat.commissionPerRequest || 0), 0); const avgCommissionRate = categories.length ? totalCom / categories.length : 0;

  return (
    <PageTemplate currentPage={currentPage}>
      <div className="space-y-8" ref={containerRef}>
        {/* Page Hero */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 gsap-entrance">
          <div className="flex flex-col gap-1 border-l-2 border-primary/20 pl-6">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-black tracking-tighter text-foreground uppercase">
                Category Management
              </h1>
              <Badge variant="secondary" className="rounded-sm bg-primary/10 text-primary border-none text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 h-fit">
                {categories.length} Catalogued
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground font-medium max-w-[50ch]">
              Organize and manage product categories, commission structures, and platform visibility settings.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <CreateCategoryDialog onSuccess={fetchCategories} />
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-2">
          {/* Active Categories Card */}
          <div className="bg-card border border-border rounded-md p-5 hover:border-wf-green/40 transition-all duration-300 group stat-card">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2.5 bg-wf-green/10 rounded-md border border-wf-green/20">
                <Eye className="h-5 w-5 text-wf-green" />
              </div>
              <div className="text-right">
                <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">
                  Active
                </div>
                <div className="text-2xl font-bold text-foreground tabular-nums">
                  {activeCategories}
                </div>
              </div>
            </div>
            <div className="flex items-center text-[10px] font-bold uppercase tracking-wider text-wf-green/80">
              <div className="w-1.5 h-1.5 rounded-full bg-wf-green mr-2 animate-pulse" />
              <span>Visible to users</span>
            </div>
          </div>

          {/* Hidden Categories Card */}
          <div className="bg-card border border-border rounded-md p-5 hover:border-orange-500/40 transition-all duration-300 group stat-card">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2.5 bg-orange-500/10 rounded-md border border-orange-500/20">
                <EyeOff className="h-5 w-5 text-orange-600" />
              </div>
              <div className="text-right">
                <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">
                  Hidden
                </div>
                <div className="text-2xl font-bold text-foreground tabular-nums">
                  {hiddenCategories}
                </div>
              </div>
            </div>
            <div className="flex items-center text-[10px] font-bold uppercase tracking-wider text-orange-600/80">
              <div className="w-1.5 h-1.5 rounded-full bg-orange-500 mr-2" />
              <span>Private / Draft</span>
            </div>
          </div>

          {/* Average Commission Card */}
          <div className="bg-card border border-border rounded-md p-5 hover:border-primary/40 transition-all duration-300 group stat-card">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2.5 bg-primary/10 rounded-md border border-primary/20">
                <Dollar className="h-5 w-5 text-primary" />
              </div>
              <div className="text-right">
                <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">
                  Avg Rate
                </div>
                <div className="text-2xl font-bold text-foreground tabular-nums">
                  {avgCommissionRate.toFixed(1)}%
                </div>
              </div>
            </div>
            <div className="flex items-center text-[10px] font-bold uppercase tracking-wider text-primary/80">
              <div className="w-1.5 h-1.5 rounded-full bg-primary mr-2" />
              <span>Platform Yield</span>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-card border border-border rounded-md p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/60" />
              <Input
                placeholder="Search categories..."
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
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="hidden">Hidden</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={commissionFilter}
                onValueChange={setCommissionFilter}
              >
                <SelectTrigger className="h-10 text-xs w-full sm:w-[150px] rounded-md border-border bg-background hover:bg-muted/50 transition-colors capitalize font-medium">
                  <div className="flex items-center">
                    <Dollar className="h-3.5 w-3.5 mr-2 text-muted-foreground/70" />
                    <SelectValue placeholder="Commission" />
                  </div>
                </SelectTrigger>
                <SelectContent className="rounded-md border-border">
                  <SelectItem value="all">All Commission</SelectItem>
                  <SelectItem value="high">High (8%+)</SelectItem>
                  <SelectItem value="medium">Medium (5-8%)</SelectItem>
                  <SelectItem value="low">Low (&lt;5%)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredCategories.map((category, index) => (
            <div 
              key={category.id} 
              className="category-card-anim"
            >
              <CategoryCard category={category} onRefresh={fetchCategories} />
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredCategories.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center bg-card border border-border border-dashed rounded-md">
            <div className="p-4 bg-muted/30 rounded-full mb-4">
              <Tag className="h-10 w-10 text-muted-foreground/40" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">
              No categories found
            </h3>
            <p className="text-muted-foreground mb-8 max-w-[40ch]">
              {searchTerm ||
              statusFilter !== "all" ||
              commissionFilter !== "all"
                ? "We couldn't find any categories matching your filters. Try clearing them to see everything."
                : "Your category catalog is empty. Start by adding your first product category."}
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              {(searchTerm || statusFilter !== "all" || commissionFilter !== "all") && (
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSearchTerm("");
                    setStatusFilter("all");
                    setCommissionFilter("all");
                  }}
                  className="rounded-md h-10 px-6 font-semibold"
                >
                  Clear Filters
                </Button>
              )}
              {!searchTerm &&
                statusFilter === "all" &&
                commissionFilter === "all" && (
                  <CreateCategoryDialog onSuccess={fetchCategories} />
                )}
            </div>
          </div>
        )}
      </div>
    </PageTemplate>
  );
}
