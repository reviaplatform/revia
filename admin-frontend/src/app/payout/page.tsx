"use client";

import { useState, useEffect } from "react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PayoutTable } from "@/components/payout-table";
import { WalletTransactionsTable } from "@/components/wallet-transactions-table";

import { PageTemplate } from "@/components/page-template";
import { PayoutSkeleton } from "@/components/payout-skeleton";

export default function PayoutPage() {
  const [currentPage, setCurrentPage] = useState("Payout");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading time
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => {
      clearTimeout(timer);
      };
  }, []);

  if (isLoading) {
    return <PayoutSkeleton />;
  }

  return (
    <PageTemplate currentPage={currentPage}>
      <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        {/* Page Title & Description */}
        <div className="flex flex-col gap-1 border-l-2 border-primary/20 pl-6">
          <h1 className="text-2xl md:text-3xl font-black tracking-tighter text-foreground uppercase">
            Payout Management
          </h1>
          <p className="text-sm text-muted-foreground font-medium max-w-[50ch]">
            Monitor financial settlements, process brand withdrawals, and audit platform-wide transactions.
          </p>
        </div>

        <Tabs defaultValue="payouts" className="w-full">
          <div className="overflow-x-auto pb-4 -mb-4 no-scrollbar">
            <TabsList className="inline-flex items-center gap-1 bg-muted/30 p-1 rounded-md border border-border h-12 w-fit mb-8">
              <TabsTrigger
                value="payouts"
                className="flex items-center justify-center gap-2 px-6 md:px-8 h-full text-[10px] md:text-[11px] font-bold uppercase tracking-wider rounded-sm data-[state=active]:bg-background data-[state=active]:border-border data-[state=active]:shadow-sm transition-all whitespace-nowrap"
              >
                Payout Requests
              </TabsTrigger>
              <TabsTrigger
                value="wallet"
                className="flex items-center justify-center gap-2 px-6 md:px-8 h-full text-[10px] md:text-[11px] font-bold uppercase tracking-wider rounded-sm data-[state=active]:bg-background data-[state=active]:border-border data-[state=active]:shadow-sm transition-all whitespace-nowrap"
              >
                Wallet Ledgers
              </TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="payouts" className="animate-in fade-in duration-500 outline-none">
            <div className="bg-card rounded-md border border-border p-4 md:p-6 shadow-sm">
              <div className="mb-6">
                <h2 className="text-base md:text-lg font-bold tracking-tight text-foreground uppercase">Disbursal Requirements</h2>
                <p className="text-[10px] md:text-xs text-muted-foreground font-medium">Review and execute pending brand withdrawal requests.</p>
              </div>
              <PayoutTable />
            </div>
          </TabsContent>
          
          <TabsContent value="wallet" className="animate-in fade-in duration-500 outline-none">
            <div className="bg-card rounded-md border border-border p-4 md:p-6 shadow-sm">
              <div className="mb-6">
                <h2 className="text-base md:text-lg font-bold tracking-tight text-foreground uppercase">Transaction History</h2>
                <p className="text-[10px] md:text-xs text-muted-foreground font-medium">Full audit trail of all financial events within the platform.</p>
              </div>
              <WalletTransactionsTable />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </PageTemplate>
  );
}
