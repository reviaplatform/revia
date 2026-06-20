"use client";

import { useState, useEffect } from "react";
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
import { SubscriptionTable } from "@/components/subscription-table";
import { SubscriptionConfigForm } from "@/components/subscription-config-form";
import { Card, Wallet, Settings } from "@solar-icons/react";

import { PageTemplate } from "@/components/page-template";
import { SubscriptionsSkeleton } from "@/components/subscriptions-skeleton";

export default function SubscriptionsPage() {
  const [currentPage, setCurrentPage] = useState("Subscriptions");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Standard loading delay for premium feel
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <SubscriptionsSkeleton />;
  }

  return (
    <PageTemplate currentPage={currentPage}>
      <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out-expo">
        <div className="border-l-2 border-primary/20 pl-6">
          <h1 className="text-3xl md:text-4xl font-black text-foreground tracking-tighter uppercase mb-2">
            Brand Subscriptions
          </h1>
          <p className="text-muted-foreground text-sm font-medium max-w-[60ch] leading-relaxed">
            Manage premium brand features, payment verification, and global pricing configurations.
          </p>
        </div>

        <Tabs defaultValue="list" className="w-full">
          <TabsList className="grid w-full grid-cols-2 h-auto tabs-enhanced mb-8 max-w-md">
            <TabsTrigger
              value="list"
              className="flex items-center justify-center gap-2 py-3 px-4 text-xs md:text-sm data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:border data-[state=active]:border-border shadow-sm"
            >
              <Card className="h-4 w-4" />
              <span>Manage Subscriptions</span>
            </TabsTrigger>
            <TabsTrigger
              value="config"
              className="flex items-center justify-center gap-2 py-3 px-4 text-xs md:text-sm data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:border data-[state=active]:border-border shadow-sm"
            >
              <Settings className="h-4 w-4" />
              <span>Pricing & Duration</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="list" className="mt-0 outline-none ring-0 focus-visible:ring-0">
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 delay-150">
              <SubscriptionTable />
            </div>
          </TabsContent>

          <TabsContent value="config" className="mt-0 outline-none ring-0 focus-visible:ring-0">
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 delay-150">
              <SubscriptionConfigForm />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </PageTemplate>
  );
}
