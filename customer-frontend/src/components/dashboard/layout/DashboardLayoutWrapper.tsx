"use client";

import { useSidebar } from '@/context/SidebarContext';
import DashboardSidebar from '@/components/dashboard/layout/DashboardSidebar';
import DashboardHeader from '@/components/dashboard/layout/DashboardHeader';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import { useGSAP } from "@gsap/react";
import { useRef } from 'react';

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, ScrollSmoother, useGSAP);
}

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function DashboardLayoutWrapper({
  children,
  lang,
}: {
  children: React.ReactNode;
  lang: 'en' | 'ar';
}) {
  const { isExpanded, isMobileOpen, closeMobile } = useSidebar();
  const isAr = lang === 'ar';
  const wrapperRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const smoother = ScrollSmoother.create({
      smooth: 1.5,
      effects: true,
      smoothTouch: 0.1,
      wrapper: "#dashboard-smooth-wrapper",
      content: "#dashboard-smooth-content",
    });

    return () => {
      smoother.kill();
    };
  }, []);

  return (
    <div 
      id="dashboard-smooth-wrapper" 
      ref={wrapperRef}
      className="min-h-screen bg-[#f8fafc] font-sans relative overflow-hidden" 
      dir={isAr ? 'rtl' : 'ltr'}
    >
      {/* Dynamic Background matching Landing Page */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-100/40 via-white to-indigo-50/30 pointer-events-none z-0" />
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none z-0" />
      
      {/* Desktop Sidebar Area - FIXED */}
      <div 
        className={cn(
          "fixed top-0 bottom-0 z-[110] hidden lg:block border-e border-border bg-white transition-[width] duration-500 ease-in-out will-change-[width]",
          isExpanded ? "w-64" : "w-20",
          isAr ? "right-0" : "left-0"
        )}
      >
        <DashboardSidebar lang={lang} />
      </div>

      {/* Mobile Sidebar Overlay */}
      {isMobileOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-gray-900/50 backdrop-blur-md z-[120] transition-opacity duration-500"
          onClick={closeMobile}
        />
      )}

      {/* Mobile Sidebar Drawer */}
      <div className={cn(
        "lg:hidden fixed top-0 bottom-0 z-[130] w-72 bg-white transition-transform duration-500 ease-out overflow-hidden",
        isAr ? "right-0" : "left-0",
        isMobileOpen ? "translate-x-0" : (isAr ? "translate-x-full" : "-translate-x-full")
      )}>
        <DashboardSidebar lang={lang} isMobile />
      </div>
      
      {/* Fixed Header Container */}
      <div 
        className={cn(
          "dashboard-header-container fixed top-0 z-[100] w-full transition-[padding] duration-500 ease-in-out will-change-[padding]",
          isExpanded ? "lg:ps-64" : "lg:ps-20"
        )}
      >
        <DashboardHeader lang={lang} />
      </div>

      {/* Smooth Content Area */}
      <div 
        id="dashboard-smooth-content" 
        className="relative z-10 w-full"
      >
        <div 
          className={cn(
            "dashboard-inner-container min-h-screen flex flex-col transition-[padding] duration-500 ease-in-out will-change-[padding]",
            isExpanded ? "lg:ps-64" : "lg:ps-20"
          )}
        >
          {/* Spacer for fixed header */}
          <div className="h-16 sm:h-20" />
          
          <main className="flex-1 relative">
            <div className="min-h-full p-4 sm:p-6 lg:p-10 flex flex-col">
              <div className="w-full flex-1">
                {children}
              </div>
              
              {/* Simple Dashboard Footer */}
              <footer className="mt-auto pt-10 pb-6 text-center opacity-60">
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.2em]">
                  &copy; {new Date().getFullYear()} Revia. All rights reserved.
                </p>
              </footer>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

