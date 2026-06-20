"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
  AltArrowDown,
  Settings,
  Logout,
} from "@solar-icons/react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useSidebar } from "@/components/ui/sidebar-provider";
import { profileApi } from "@/services/profileService";

export function NavUser({
  user,
}: {
  user: {
    name: string;
    email: string;
    avatar: string;
  };
}) {
  const { isMobile } = useSidebar();
  const router = useRouter();

  // Real profile state for sidebar badge
  const [profileName, setProfileName] = useState(user.name);
  const [profileEmail, setProfileEmail] = useState(user.email);

  // Fetch real profile data for badge
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await profileApi.getMyProfile();
        if (data) {
          setProfileName(data.name || "");
          setProfileEmail(data.email || "");
        }
      } catch (error: any) {
        // Silently fail or simple log for background badge update
        console.error("Failed to sync profile badge", error);
      }
    };
    fetchProfile();

    // Listen for updates from the profile page
    const handleProfileSync = (e: any) => {
      if (e.detail?.name) setProfileName(e.detail.name);
    };
    window.addEventListener("profileUpdated", handleProfileSync as EventListener);
    return () => window.removeEventListener("profileUpdated", handleProfileSync as EventListener);
  }, []);

  const handleOpenSettings = () => {
    router.push("/profile");
  };

  const handleLogout = () => {
    // Clear authentication state
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("accessToken");
    router.push("/auth/login");
  };

  const getInitials = (name: string) => {
    if (!name) return "U";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground text-sidebar-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent transition-all duration-300">
              <Avatar className="h-8 w-8 rounded-lg ring-2 ring-transparent group-data-[state=open]/menu-item:ring-[color-mix(in_oklch,oklch(0.6_0.18_250),transparent_60%)] transition-all">
                <AvatarImage src={user.avatar} alt={profileName || user.name} />
                <AvatarFallback className="rounded-lg bg-[color-mix(in_oklch,oklch(0.6_0.18_250),transparent_90%)] text-[oklch(0.6_0.18_250)]">
                  {getInitials(profileName || user.name)}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold text-sidebar-foreground group-data-[state=open]/menu-item:text-[oklch(0.6_0.18_250)] transition-colors">
                  {profileName || user.name}
                </span>
                <span className="truncate text-xs text-sidebar-foreground/70">
                  {profileEmail || user.email}
                </span>
              </div>
              <AltArrowDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={user.avatar} alt={profileName || user.name} />
                  <AvatarFallback className="rounded-lg">
                    {getInitials(profileName || user.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{profileName || user.name}</span>
                  <span className="truncate text-xs">{profileEmail || user.email}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuItem onClick={handleOpenSettings}>
              <Settings />
              Settings
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleLogout}>
              <Logout />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
