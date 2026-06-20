"use client";

import * as React from "react";
import Image from "next/image";
import {
  Chart,
  Buildings,
  Calendar,
  Card,
  Box,
  Widget,
  Tag,
  Wallet,

  Letter,
  Settings,
  User,
} from "@solar-icons/react";

import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";

// This is sample data.
const data = {
  user: {
    name: "",
    email: "",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: Widget,
      isActive: true,
      color: "var(--nav-blue)",
    },
    {
      title: "Profile",
      url: "/profile",
      icon: User,
      color: "var(--nav-amber)",
    },
    {
      title: "Payout",
      url: "/payout",
      icon: Card,
      color: "var(--nav-emerald)",
    },
    {
      title: "Accounts",
      url: "/accounts",
      icon: Buildings,
      color: "var(--nav-amber)",
    },

    {
      title: "Categories",
      url: "/categories",
      icon: Tag,
      color: "var(--nav-amber)",
    },
    {
      title: "Brands",
      url: "/brands",
      icon: Box,
      color: "var(--nav-amber)",
    },
    {
      title: "Subscriptions",
      url: "/subscriptions",
      icon: Wallet,
      color: "var(--nav-emerald)",
    },
    {
      title: "Repair Requests",
      url: "/repair-requests",
      icon: Settings,
      color: "var(--nav-emerald)",
    },
    {
      title: "Support Tickets",
      url: "/support",
      icon: Letter,
      color: "var(--nav-sky)",
    },
  ],
};

export function AppSidebar({
  onPageSelect,
  currentPage,
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  onPageSelect?: (pageName: string) => void;
  currentPage?: string;
}) {
  return (
    <Sidebar 
      collapsible="icon" 
      className="bg-[oklch(0.992_0.006_250)] border-r border-sidebar-border"
      {...props}
    >
      <SidebarHeader className="border-b-0 flex-shrink-0 relative overflow-hidden">
        {/* Subtle Brand Background Accent - REMOVED for flat design */}
        <div className="flex items-center h-12 w-full overflow-hidden pl-2 relative z-10">
          {/* Expanded Logo */}
          <div className="absolute left-2 transition-all duration-400 ease-[var(--ease-out-expo)] group-data-[collapsible=icon]:opacity-0 group-data-[collapsible=icon]:scale-90 group-data-[collapsible=icon]:pointer-events-none">
            <Image
              src="/revia-logo.png"
              alt="Revia Logo"
              width={120}
              height={120}
              className="h-10 w-auto object-contain"
              priority
              quality={90}
              sizes="120px"
            />
          </div>
          {/* Collapsed Logo (Icon Only) */}
          <div className="absolute left-1/2 -translate-x-1/2 transition-all duration-400 ease-[var(--ease-out-expo)] opacity-0 scale-90 pointer-events-none group-data-[collapsible=icon]:opacity-100 group-data-[collapsible=icon]:scale-100 group-data-[collapsible=icon]:pointer-events-auto">
            <Image
              src="/revia-icon-without.png"
              alt="Revia Icon"
              width={32}
              height={32}
              className="h-8 w-8 object-contain"
              quality={90}
              sizes="32px"
            />
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent className="flex-1 flex flex-col">
        <div className="flex-1 flex flex-col">
          <NavMain
            items={data.navMain}
            onPageSelect={onPageSelect}
            currentPage={currentPage}
          />
        </div>
      </SidebarContent>
      <SidebarFooter className="flex-shrink-0">
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
