"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { 
  HamburgerMenu, 
  Logout, 
  UserCircle, 
  Global
} from "@solar-icons/react";
import { useAuth } from '@/context/AuthContext';
import { useSidebar } from '@/context/SidebarContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface DashboardHeaderProps {
  lang: "en" | "ar";
}

export default function DashboardHeader({ lang }: DashboardHeaderProps) {
  const isAr = lang === 'ar';
  const { user, logout, isLoading } = useAuth();
  const { toggleMobile } = useSidebar();
  const pathname = usePathname();
  const router = useRouter();

  const toggleLang = () => {
    const newLang = isAr ? 'en' : 'ar';
    const segments = pathname.split('/');
    segments[1] = newLang;
    router.push(segments.join('/'));
  };

  const handleLogout = () => {
    logout();
    window.location.href = `/${lang}`;
  };

  const navLinks = [
    { name: isAr ? 'نظرة عامة' : 'Overview', href: `/${lang}/dashboard` },
    { name: isAr ? 'أجهزتي' : 'My Devices', href: `/${lang}/dashboard/devices` },
    { name: isAr ? 'طلبات الصيانة' : 'Repairs', href: `/${lang}/dashboard/repairs` },
    { name: isAr ? 'الملف الشخصي' : 'Profile', href: `/${lang}/dashboard/profile` },
    { name: isAr ? 'الاستكشاف' : 'Discovery', href: `/${lang}/dashboard/reels` }
  ];

  // Derive current page name for breadcrumb
  const currentLink = navLinks.find(link => {
    if (link.href === `/${lang}/dashboard`) return pathname === link.href;
    return pathname.startsWith(link.href);
  });
  const currentPageTitle = currentLink ? currentLink.name : '';

  return (
    <header className="h-16 sm:h-20 bg-white/70 backdrop-blur-xl border-b border-border sticky top-0 z-40 px-4 sm:px-10 flex items-center justify-between transition-all duration-300">
      
      <div className="flex items-center gap-4 sm:gap-8 flex-1 min-w-0">
        {/* Mobile Left: Menu Toggle & Page Title */}
        <div className="flex items-center gap-2 lg:hidden min-w-0 flex-1">
          <button 
            onClick={toggleMobile}
            className="p-2 -ms-1 text-foreground/40 hover:bg-foreground/5 rounded-md transition-all active:scale-95"
            aria-label="Toggle Menu"
          >
            <HamburgerMenu size={22} />
          </button>
          
          <div className="flex flex-col leading-none min-w-0">
            <span className="wf-uppercase-label !text-[7px] sm:text-[8px] text-foreground/30 truncate">
              Revia Platform
            </span>
            <span className="text-[13px] sm:text-sm font-bold text-foreground truncate tracking-tight">
              {currentPageTitle}
            </span>
          </div>
        </div>

        {/* Desktop Left: Breadcrumb */}
        <div className="hidden lg:flex items-center text-[11px] font-semibold uppercase tracking-[0.1em]">
          <span className="text-foreground/30 hover:text-brand-500 transition-colors cursor-pointer">{isAr ? 'لوحة التحكم' : 'Dashboard'}</span>
          {currentPageTitle && (
            <>
              <div className="mx-4 w-1 h-3 rounded-full bg-border" />
              <span className="text-foreground font-bold">{currentPageTitle}</span>
            </>
          )}
        </div>
      </div>

      {/* Right side: Actions & User Profile */}
      <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
        {/* Language Toggle */}
        <button 
          onClick={toggleLang}
          className="group flex items-center gap-2 px-2 py-1.5 text-[10px] font-bold text-foreground/40 hover:text-brand-500 hover:bg-brand-500/5 rounded-md transition-all active:scale-95 uppercase tracking-widest"
        >
          <Global size={18} className="group-hover:rotate-12 transition-transform" />
          <span className="hidden sm:inline">{isAr ? 'English' : 'العربية'}</span>
        </button>

        {isLoading ? (
          <div className="flex items-center gap-3 animate-pulse bg-foreground/[0.02] p-1.5 pe-4 rounded-full border border-border">
             <div className="w-10 h-10 rounded-full bg-foreground/10" />
             <div className="hidden sm:flex flex-col gap-1.5">
                <div className="h-3 w-16 bg-foreground/10 rounded" />
                <div className="h-2 w-20 bg-foreground/5 rounded" />
             </div>
          </div>
        ) : (
          <DropdownMenu>
            <DropdownMenuTrigger className="group flex items-center gap-3 hover:bg-white p-1.5 pe-4 rounded-full transition-all duration-300 border border-transparent hover:border-brand-500/10 active:scale-95 outline-none">
              <div className="w-10 h-10 rounded-full bg-brand-500 text-white flex items-center justify-center font-bold transition-all duration-300">
                {user?.name?.charAt(0) || 'U'}
              </div>
              <div className="hidden sm:flex flex-col items-start leading-tight">
                <span className="text-sm font-bold text-foreground leading-none mb-1 group-hover:text-brand-500 transition-colors tracking-tight">
                  {user?.name?.split(' ')[0] || 'User'}
                </span>
                <span className="wf-uppercase-label !text-[9px] text-foreground/30">
                  {isAr ? 'حساب شخصي' : 'Personal Account'}
                </span>
              </div>
            </DropdownMenuTrigger>

            <DropdownMenuContent align={isAr ? "start" : "end"} className="w-64 mt-2 rounded-lg border border-border p-2 bg-white/95 backdrop-blur-xl">
              <div className="px-3 py-3 mb-1 bg-foreground/[0.02] rounded-md border border-border/5">
                <p className="font-bold text-foreground truncate text-sm tracking-tight">{user?.name}</p>
                <p className="wf-uppercase-label !text-[10px] text-brand-500 mt-1 truncate" dir="ltr">{user?.phoneNumber}</p>
              </div>
              <DropdownMenuSeparator className="bg-border/50 mx-1 my-2" />
              
              <DropdownMenuItem asChild className="rounded-md cursor-pointer hover:bg-brand-500/5 focus:bg-brand-500/5 py-2.5 transition-colors group">
                <Link 
                  href={`/${lang}/dashboard/profile`}
                  className="flex items-center gap-3 w-full text-[13px] font-semibold text-foreground/70 group-hover:text-brand-500"
                >
                  <UserCircle size={20} className="text-foreground/20 group-hover:text-brand-500/60" />
                  {isAr ? 'الملف الشخصي' : 'Profile Settings'}
                </Link>
              </DropdownMenuItem>
              
              <DropdownMenuItem 
                onClick={handleLogout}
                className="rounded-md cursor-pointer text-secondary-red hover:bg-secondary-red/5 hover:text-secondary-red focus:bg-secondary-red/5 focus:text-secondary-red mt-1 flex items-center gap-3 w-full text-[13px] font-semibold py-2.5 transition-colors group"
              >
                <Logout size={20} className="text-secondary-red/40 group-hover:text-secondary-red/60" />
                {isAr ? 'تسجيل الخروج' : 'Sign Out'}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </header>
  );
}
