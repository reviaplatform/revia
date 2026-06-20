"use client"

import { AltArrowRight } from "@solar-icons/react"
import type { ElementType } from "react"
import Link from "next/link"
import { usePathname } from "@/navigation"
import { cn } from "@/lib/utils"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"

const getActiveColor = (className?: string) => {
  if (!className) return 'var(--primary)';
  const colorName = className.replace('text-', '');
  if (colorName === 'nav-subscription') return 'var(--nav-payouts)';
  if (colorName === 'nav-brand-chat') return 'var(--nav-brand)';
  if (colorName === 'nav-support') return 'var(--nav-settings)';
  return `var(--${colorName})`;
};

export function NavMain({
  items,
}: {
  items: {
    title: string
    url: string
    icon?: ElementType
    isActive?: boolean
    className?: string
    items?: {
      title: string
      url: string
    }[]
  }[]
}) {
  const pathname = usePathname();

  return (
    <SidebarGroup>
      <SidebarGroupLabel className="text-wf-gray-300 font-bold uppercase tracking-[1.5px] text-[10px] pt-6 mb-2 group-data-[collapsible=icon]:hidden">Platform</SidebarGroupLabel>
      <SidebarMenu className="gap-1 group-data-[collapsible=icon]:gap-3">
        {items.map((item) => {
          const isActive = pathname === item.url || pathname?.startsWith(`${item.url}/`);
          const activeColor = getActiveColor(item.className);

          if (!item.items || item.items.length === 0) {
            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton 
                  asChild 
                  tooltip={item.title} 
                  isActive={isActive}
                  className={cn(
                    "transition-all duration-300 relative group/btn h-11 rounded-wf border border-transparent mb-1",
                    "group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:justify-center",
                    isActive 
                      ? "shadow-sm" 
                      : "text-wf-gray-300 hover:bg-slate-50 hover:text-wf-near-black hover:border-wf-border/30"
                  )}
                  style={isActive ? {
                    backgroundColor: `color-mix(in srgb, ${activeColor} 8%, transparent)`,
                    borderColor: `color-mix(in srgb, ${activeColor} 15%, transparent)`,
                  } : undefined}
                >
                  <Link href={item.url} className="flex items-center w-full px-4 group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:justify-center">
                    {item.icon && (
                      <item.icon 
                        className="transition-all duration-300 size-4 shrink-0"
                        style={isActive ? { color: activeColor } : undefined}
                      />
                    )}
                    <span 
                      className={cn(
                        "transition-all duration-300 text-xs font-semibold uppercase tracking-[1px] group-data-[collapsible=icon]:hidden",
                        isActive ? "translate-x-1 rtl:-translate-x-1" : "group-hover:translate-x-1 rtl:group-hover:-translate-x-1"
                      )}
                      style={isActive ? { color: activeColor } : undefined}
                    >
                      {item.title}
                    </span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          }

          return (
            <Collapsible
              key={item.title}
              asChild
              defaultOpen={isActive}
              className="group/collapsible"
            >
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton 
                    tooltip={item.title} 
                    isActive={isActive}
                    className={cn(
                      "transition-all duration-300 relative group/btn h-11 rounded-wf border border-transparent mb-1",
                      "group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:justify-center",
                      isActive 
                        ? "shadow-sm" 
                        : "text-wf-gray-300 hover:bg-slate-50 hover:text-wf-near-black hover:border-wf-border/30"
                    )}
                    style={isActive ? {
                      backgroundColor: `color-mix(in srgb, ${activeColor} 8%, transparent)`,
                      borderColor: `color-mix(in srgb, ${activeColor} 15%, transparent)`,
                    } : undefined}
                  >
                    {item.icon && (
                      <item.icon 
                        className="transition-all duration-300 size-4 shrink-0"
                        style={isActive ? { color: activeColor } : undefined}
                      />
                    )}
                    <span 
                      className={cn(
                        "transition-all duration-300 text-xs font-semibold uppercase tracking-[1px] group-data-[collapsible=icon]:hidden",
                        isActive ? "translate-x-1 rtl:-translate-x-1" : "group-hover:translate-x-1 rtl:group-hover:-translate-x-1"
                      )}
                      style={isActive ? { color: activeColor } : undefined}
                    >
                      {item.title}
                    </span>
                    <AltArrowRight 
                      className="ms-auto size-3 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90 rtl:rotate-180 group-data-[collapsible=icon]:hidden" 
                      style={isActive ? { color: activeColor } : undefined}
                    />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent className="group-data-[collapsible=icon]:hidden">
                  <SidebarMenuSub>
                    {item.items?.map((subItem) => {
                      const isSubActive = pathname === subItem.url;
                      return (
                        <SidebarMenuSubItem key={subItem.title}>
                          <SidebarMenuSubButton asChild isActive={isSubActive}>
                            <Link href={subItem.url}>
                              <span>{subItem.title}</span>
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      )
                    })}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
          )
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
}
