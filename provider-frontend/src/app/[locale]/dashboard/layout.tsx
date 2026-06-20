'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { Logout, User, Widget, Settings } from '@solar-icons/react';
import Link from 'next/link';
import Image from 'next/image';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter, usePathname } from '@/navigation';
import { Global } from '@solar-icons/react';
import { cn } from '@/lib/utils';

import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { Separator } from "@/components/ui/separator"
import { BottomNav } from "@/components/BottomNav"
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const { user, brand, logout, isLoading } = useAuth();
    const pathname = usePathname();
    const t = useTranslations("Navigation");
    const locale = useLocale() as 'en' | 'ar';
    const router = useRouter();
    const isRTL = locale === 'ar';



    const navItems = [
        { name: t('dashboard'), href: '/dashboard' },
        { name: t('brand'), href: '/dashboard/brand' },
        { name: t('categories'), href: '/dashboard/categories' },
        { name: t('accounts'), href: '/dashboard/accounts' },
        { name: t('payouts'), href: '/dashboard/payouts' },
        { name: t('repairRequests'), href: '/dashboard/repair-requests' },
        { name: t('reels'), href: '/dashboard/reels' },
        { name: t('settings'), href: '/dashboard/settings' },
        { name: t('subscription'), href: '/dashboard/subscription' },
        { name: t('reviaAssistant'), href: '/dashboard/brand-chat' },
    ];

    const PAGE_METADATA: Record<string, { type: string; status: string }> = {
        '/dashboard': { type: 'DASHBOARD_CENTER', status: 'SYNCHRONIZED' },
        '/dashboard/brand': { type: 'IDENTITY_REGISTRY', status: 'VERIFIED' },
        '/dashboard/categories': { type: 'SERVICE_MATRIX', status: 'ACTIVE' },
        '/dashboard/accounts': { type: 'GOVERNANCE_HUB', status: 'ENCRYPTED' },
        '/dashboard/payouts': { type: 'PAYOUT_LEDGER', status: 'SETTLED' },
        '/dashboard/repair-requests': { type: 'REPAIR_REQUESTS', status: 'ACTIVE' },
        '/dashboard/reels': { type: 'CONTENT_NODES', status: 'LIVE' },
        '/dashboard/settings': { type: 'SYSTEM_SETTINGS', status: 'INITIALIZED' },
        '/dashboard/subscription': { type: 'REVENUE_ENGINE', status: 'ACTIVE' },
        '/dashboard/brand-chat': { type: 'NEURAL_PROCESSOR', status: 'ONLINE' },
    };

    const registryData = React.useMemo(() => {
        const getRegistryData = (path: string) => {
            // Remove locale prefix from path for matching if present
            const cleanPath = path.replace(/^\/(en|ar)/, '') || '/';
            const entry = Object.entries(PAGE_METADATA).find(([key]) => cleanPath === key || cleanPath.startsWith(`${key}/`));
            return entry ? entry[1] : { type: 'REVIA_OPERATING_SYSTEM', status: 'CONNECTED' };
        };
        return getRegistryData(pathname || '');
    }, [pathname]);
    
    const pageTitle = React.useMemo(() => {
        const cleanPath = pathname?.replace(/^\/(en|ar)/, '') || '/';
        const currentPage = navItems.find(item => cleanPath === item.href || cleanPath.startsWith(`${item.href}/`));
        return currentPage?.name || t('dashboard');
    }, [pathname, t, navItems]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <SidebarProvider dir={isRTL ? 'rtl' : 'ltr'}>
            <AppSidebar />
            <SidebarInset className="relative bg-bg-surface-tint overflow-x-clip">
                {/* Visual Warmth: Subtle Mesh Gradient Backdrop */}
                <div className="absolute top-0 inset-x-0 h-[500px] pointer-events-none z-0 opacity-40 will-change-transform">
                    <div className="absolute top-[-10%] inline-end-[-10%] w-[600px] h-[600px] bg-primary/20 blur-[120px] rounded-full animate-pulse opacity-50" />
                    <div className="absolute bottom-[20%] inline-start-[-10%] w-[500px] h-[500px] bg-blue-400/10 blur-[100px] rounded-full animate-pulse opacity-30 delay-1000" />
                </div>

                <header className="flex h-20 shrink-0 items-center justify-between px-4 md:px-8 bg-white/60 backdrop-blur-xl border-b border-wf-border/50 sticky top-0 z-40 transition-all duration-300">
                    <div className="flex items-center gap-6">
                        <SidebarTrigger className="-ms-2 size-10 rounded-wf hover:bg-primary/5 hover:text-primary transition-all" />
                        <Separator orientation="vertical" className="ms-2 h-8 hidden md:block opacity-20" />
                        <div className="flex flex-col">
                            <h1 className={cn(
                                "text-xl md:text-2xl font-black tracking-tighter text-wf-near-black uppercase leading-none",
                                isRTL && "font-arabic"
                            )}>
                                {pageTitle}
                            </h1>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="text-[9px] font-black text-wf-gray-300 uppercase tracking-[0.2em] opacity-60">
                                    {registryData.type}
                                </span>
                                <div className="size-1 bg-wf-border rounded-full" />
                                <span className="text-[9px] font-black text-primary uppercase tracking-[0.2em]">
                                    {registryData.status}
                                </span>
                            </div>
                        </div>
                    </div>
                    
                    {/* Personnel Identity Registry */}
                    <div className="flex items-center gap-4 md:gap-8">
                        {/* Quick Locale Switcher */}
                        <Button
                            variant="ghost"
                            onClick={() => router.replace(pathname, { locale: locale === 'en' ? 'ar' : 'en' })}
                            className="h-10 px-3 md:px-4 rounded-wf border border-wf-border hover:bg-slate-50 transition-all gap-2 group/lang"
                        >
                            <Global className="size-4 text-wf-gray-300 group-hover/lang:text-primary transition-colors" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-wf-near-black">
                                {locale === 'en' ? 'AR' : 'EN'}
                            </span>
                        </Button>

                        <div className="flex items-center gap-6">
                        <div className="hidden lg:flex flex-col items-end gap-1">
                            <div className="flex items-center gap-2">
                                <div className="size-1.5 bg-emerald-500 rounded-full animate-pulse" />
                                <span className="text-[11px] font-black text-wf-near-black uppercase tracking-wider">{user?.name || 'Personnel'}</span>
                            </div>
                            <span className="text-[9px] font-black text-wf-gray-300 uppercase tracking-[0.15em] opacity-60">
                                {brand?.name?.[locale] || user?.email || 'OFFLINE'}
                            </span>
                        </div>
                        <div className="relative group">
                            <div className={cn("absolute -inset-1 rounded-wf blur opacity-0 group-hover:opacity-20 transition duration-500", isRTL ? "bg-gradient-to-l from-primary to-blue-600" : "bg-gradient-to-r from-primary to-blue-600")}></div>
                            <Avatar className="h-10 w-10 md:h-12 md:w-12 rounded-wf relative border border-wf-border bg-white p-0.5 transition-all duration-500 group-hover:border-primary">
                                <AvatarImage 
                                    src={brand?.logo || user?.picture || undefined} 
                                    alt={user?.name || 'P'} 
                                    className="rounded-[2px] object-cover" 
                                />
                                <AvatarFallback className="rounded-[2px] bg-slate-50 text-wf-near-black font-black text-lg">
                                    {(user?.name?.[0] || 'P').toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                        </div>
                    </div>
                </div>
            </header>
                
                <main dir={isRTL ? 'rtl' : 'ltr'} className="flex flex-1 flex-col gap-4 p-4 md:p-8 pb-24 md:pb-8 relative z-10">
                    <div className="w-full animate-in fade-in duration-500">
                        {children}
                    </div>
                </main>
                <BottomNav />
                
            </SidebarInset>
        </SidebarProvider>
    );
}
