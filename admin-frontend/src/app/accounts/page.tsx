"use client";

import { useState } from "react";
import { SidebarMinimalistic as PanelLeft } from "@solar-icons/react";
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
import { AdminTable } from "@/components/admin-table";
import { ProviderTable } from "@/components/provider-table";
import { CustomerTable } from "@/components/customer-table";
import { UsersGroupRounded as Users, Buildings as Building2, UserCheck } from "@solar-icons/react";

import { PageTemplate } from "@/components/page-template";

export default function AccountsPage() {
  const [currentPage, setCurrentPage] = useState("Accounts");

  return (
    <PageTemplate currentPage={currentPage}>
      <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out-expo">
        <div className="flex flex-col gap-1 border-l-2 border-primary/20 pl-6">
          <h1 className="text-2xl md:text-3xl font-black tracking-tighter text-foreground uppercase">
            Accounts
          </h1>
          <p className="text-sm text-muted-foreground font-medium max-w-[50ch]">
            Manage administrative roles, brand providers, and customer account status.
          </p>
        </div>

        <Tabs defaultValue="admins" className="w-full">
          <div className="overflow-x-auto pb-4 -mb-4 no-scrollbar">
            <TabsList className="inline-flex items-center gap-1 bg-muted/30 p-1 rounded-md border border-border h-12 w-fit mb-8">
              <TabsTrigger
                value="admins"
                className="flex items-center justify-center gap-2 px-6 md:px-8 h-full text-[10px] md:text-[11px] font-bold uppercase tracking-wider rounded-sm data-[state=active]:bg-background data-[state=active]:border-border data-[state=active]:shadow-sm transition-all whitespace-nowrap"
              >
                <Users className="h-3.5 w-3.5" />
                Admins
              </TabsTrigger>
              <TabsTrigger
                value="providers"
                className="flex items-center justify-center gap-2 px-6 md:px-8 h-full text-[10px] md:text-[11px] font-bold uppercase tracking-wider rounded-sm data-[state=active]:bg-background data-[state=active]:border-border data-[state=active]:shadow-sm transition-all whitespace-nowrap"
              >
                <Building2 className="h-3.5 w-3.5" />
                Providers
              </TabsTrigger>
              <TabsTrigger
                value="customers"
                className="flex items-center justify-center gap-2 px-6 md:px-8 h-full text-[10px] md:text-[11px] font-bold uppercase tracking-wider rounded-sm data-[state=active]:bg-background data-[state=active]:border-border data-[state=active]:shadow-sm transition-all whitespace-nowrap"
              >
                <UserCheck className="h-3.5 w-3.5" />
                Customers
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="admins" className="mt-0 outline-none ring-0 focus-visible:ring-0">
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 delay-150">
              <AdminTable />
            </div>
          </TabsContent>

          <TabsContent value="providers" className="mt-0 outline-none ring-0 focus-visible:ring-0">
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 delay-150">
              <ProviderTable />
            </div>
          </TabsContent>

          <TabsContent value="customers" className="mt-0 outline-none ring-0 focus-visible:ring-0">
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 delay-150">
              <CustomerTable />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </PageTemplate>
  );
}
