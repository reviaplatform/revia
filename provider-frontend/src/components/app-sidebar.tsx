"use client"

import * as React from "react"
import {
  Widget,
  User,
  Settings,
  Hashtag,
  UsersGroupTwoRounded,
  MenuDots,
  Wallet,
  Tuning,
  Videocamera,
  Logout,
  ChatRoundLine,
} from "@solar-icons/react"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import { useTranslations, useLocale } from "next-intl"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar"
import { useAuth } from "@/context/AuthContext"
import Link from "next/link"
import Image from "next/image"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user, brand, logout } = useAuth();
  const { state } = useSidebar();
  const t = useTranslations("Navigation");

  const data = {
    user: {
      name: user?.name || "Provider",
      email: user?.email || "provider@revia.sa",
      avatar: brand?.logo || user?.picture || "/revia-icon.png",
    },
    navMain: [
      {
        title: t("dashboard"),
        url: "/dashboard",
        icon: Widget,
        className: "text-nav-dashboard",
      },
      {
        title: t("brand"),
        url: "/dashboard/brand",
        icon: Hashtag,
        className: "text-nav-brand",
      },
      {
        title: t("categories"),
        url: "/dashboard/categories",
        icon: MenuDots,
        className: "text-nav-categories",
      },
      {
        title: t("accounts"),
        url: "/dashboard/accounts",
        icon: UsersGroupTwoRounded,
        className: "text-nav-accounts",
      },
      {
        title: t("payouts"),
        url: "/dashboard/payouts",
        icon: Wallet,
        className: "text-nav-payouts",
      },
      {
        title: t("repairRequests"),
        url: "/dashboard/repair-requests",
        icon: Tuning,
        className: "text-nav-requests",
      },
      {
        title: t("reels"),
        url: "/dashboard/reels",
        icon: Videocamera,
        className: "text-nav-reels",
      },
      {
        title: t("subscription"),
        url: "/dashboard/subscription",
        icon: Wallet,
        className: "text-nav-subscription",
      },
      {
        title: t("reviaAssistant"),
        url: "/dashboard/brand-chat",
        icon: ChatRoundLine,
        className: "text-nav-brand-chat",
      },
      {
        title: t("settings"),
        url: "/dashboard/settings",
        icon: Settings,
        className: "text-nav-settings",
      },
      {
        title: t("support"),
        url: "/dashboard/support",
        icon: ChatRoundLine,
        className: "text-nav-support",
      },
    ],
  }

  const locale = useLocale();

  return (
    <Sidebar collapsible="icon" side="left" {...props}>
      <SidebarHeader className="border-b border-wf-border p-0 h-20">
        <SidebarMenu className="gap-0">
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild className="hover:bg-transparent h-20 px-6 focus-visible:ring-0 rounded-none transition-all duration-300 group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:justify-center">
              <Link href="/dashboard" className="flex items-center group-data-[collapsible=icon]:justify-center w-full">
                {state === "collapsed" ? (
                  <div className="flex items-center justify-center w-full">
                    <Image
                      src="/revia-iconn.png"
                      alt="Revia"
                      width={32}
                      height={32}
                      className="w-auto h-auto object-contain"
                    />
                  </div>
                ) : (
                  <Image
                    src="/revia-logo.png"
                    alt="Revia Logo"
                    width={140}
                    height={36}
                    className="h-10 w-auto object-contain"
                    priority
                  />
                )}
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter className="p-4 border-t border-wf-border group-data-[collapsible=icon]:p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => logout()}
              className="w-full justify-start gap-3 h-11 rounded-wf bg-slate-50 border border-wf-border text-wf-gray-700 hover:bg-wf-red hover:text-white hover:border-wf-red transition-all font-semibold uppercase tracking-[1.5px] text-[11px] group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:gap-0"
            >
              <Logout className="size-4 shrink-0" />
              <span className="group-data-[collapsible=icon]:hidden">{t("logout")}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
