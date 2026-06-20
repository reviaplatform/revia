import React from 'react';
import { SidebarProvider } from '@/context/SidebarContext';
import DashboardLayoutWrapper from '@/components/dashboard/layout/DashboardLayoutWrapper';
import LayoutWrapper from '@/components/layout/LayoutWrapper';
import { getDictionary } from '@/i18n';

export default async function DashboardLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}>) {
  const { lang: paramLang } = await params;
  const lang = paramLang as 'en' | 'ar';
  const t = await getDictionary(lang);

  return (
    <SidebarProvider>
      <DashboardLayoutWrapper lang={lang}>
        {children}
      </DashboardLayoutWrapper>
    </SidebarProvider>
  );
}
