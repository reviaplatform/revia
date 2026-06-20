"use client";

import { useState, useEffect } from "react";
import { SidebarMinimalistic as PanelLeft } from "@solar-icons/react";
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
import { ThemeToggle } from "@/components/theme-toggle";
import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP);

interface PageTemplateProps {
  currentPage: string;
  children: React.ReactNode;
  isLoading?: boolean;
}

export function PageTemplate({
  currentPage,
  children,
  isLoading = false,
}: PageTemplateProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!isLoading) {
        gsap.from(".gsap-entrance", {
          y: 20,
          opacity: 0,
          duration: 0.8,
          stagger: 0.05,
          ease: "power4.out",
          clearProps: "all",
        });
      }
    },
    { scope: containerRef, dependencies: [isLoading, currentPage] }
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <SpinnerCustom />
      </div>
    );
  }

  return (
    <SidebarProvider>
      <AppSidebar onPageSelect={() => {}} currentPage={currentPage} />
      <SidebarInset className="bg-background">
        <div className="flex flex-col h-screen overflow-hidden">
          <header className="sticky top-0 z-10 flex h-14 md:h-16 shrink-0 items-center gap-2 px-4 bg-background/80 backdrop-blur-md border-b border-border/50">
            <div className="flex items-center gap-2">
              <SidebarTrigger className="-ml-1 text-muted-foreground hover:text-foreground transition-colors" />
              <Separator
                orientation="vertical"
                className="mx-2 h-4 hidden sm:block opacity-50"
              />
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem className="hidden lg:block">
                    <BreadcrumbLink href="#" className="text-xs font-medium uppercase tracking-wider text-muted-foreground hover:text-primary transition-colors">
                      Admin Dashboard
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator className="hidden lg:block opacity-30" />
                  <BreadcrumbItem>
                    <BreadcrumbPage className="text-sm font-semibold tracking-tight">
                      {currentPage}
                    </BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
            <div className="ml-auto">
              <ThemeToggle />
            </div>
          </header>

          <ScrollArea className="flex-1 w-full" ref={containerRef}>
            <div className="flex flex-col gap-4 p-4 md:p-6 lg:p-8 pt-4 md:pt-6 gsap-entrance">
              {children}
            </div>
          </ScrollArea>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

