"use client";

import * as React from "react";
import { usePathname } from "next/navigation";

import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

export function NavMain({
  items,
  onPageSelect,
  currentPage,
}: {
  items: {
    title: string;
    url: string;
    icon?: React.ComponentType<any>;
    isActive?: boolean;
    color?: string;
    items?: {
      title: string;
      url: string;
    }[];
  }[];
  onPageSelect?: (pageName: string) => void;
  currentPage?: string;
}) {
  const pathname = usePathname();

  // Helper to determine if a divider should be shown before an item
  const shouldShowDivider = (title: string, index: number) => {
    if (index === 0) return false;
    const groups = [
      ["Profile"], // Management starts
      ["Payout"], // Financial starts
      ["Contact Us"], // Support starts
    ];
    return groups.some((g) => g.includes(title));
  };

  return (
    <SidebarGroup className="flex-1 flex flex-col pt-0">
      <SidebarMenu className="flex-1 flex flex-col gap-1.5">
        {items.map((item, index) => {
          const isActive = currentPage
            ? currentPage === item.title
            : pathname === item.url;
          
          const divider = shouldShowDivider(item.title, index);

          return (
            <React.Fragment key={item.title}>
              {divider && (
                <div className="mx-4 my-2 h-[1px] bg-[color-mix(in_oklch,var(--sidebar-primary,oklch(0.6_0.18_250)),transparent_90%)]" />
              )}
              <SidebarMenuItem 
                className="flex-1 transition-all duration-400 ease-[var(--ease-out-expo)] delay-[var(--stagger-delay)]"
                style={{ "--stagger-delay": `${index * 20}ms` } as React.CSSProperties}
              >
              <SidebarMenuButton
                asChild
                tooltip={item.title}
                isActive={isActive}
                style={
                  {
                    "--item-color": item.color || "var(--sidebar-primary)",
                  } as React.CSSProperties
                }
                className={`w-full pl-4 pr-4 h-full [&>span]:!block [&>span]:!opacity-100 transition-all duration-300 font-heading ${
                  isActive
                    ? "bg-[color-mix(in_oklch,var(--item-color),transparent_86%)] text-[color-mix(in_oklch,var(--item-color),black_30%)] font-semibold"
                    : "text-sidebar-foreground/80 hover:bg-[color-mix(in_oklch,var(--item-color),transparent_94%)] hover:text-[var(--item-color)] sidebar-menu-button font-medium"
                }`}
              >
                <a
                  href={item.url}
                  className="flex items-center gap-3.5 w-full h-full"
                  onClick={() => {
                    onPageSelect?.(item.title);
                  }}
                >
                  {item.icon && (
                    <item.icon
                      className={`h-5 w-5 flex-shrink-0 transition-all duration-300 ${
                        isActive ? "scale-110" : "opacity-70 group-hover:opacity-100"
                      }`}
                      style={{
                        color: isActive ? "var(--item-color)" : undefined,
                      }}
                      strokeWidth={isActive ? 2 : 1.5}
                    />
                  )}
                  <span
                    className={`flex-1 block opacity-100 transition-all duration-300 tracking-tight ${
                      isActive ? "translate-x-0.5" : ""
                    }`}
                  >
                    {item.title}
                  </span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </React.Fragment>
        );
      })}
    </SidebarMenu>
  </SidebarGroup>
  );
}
