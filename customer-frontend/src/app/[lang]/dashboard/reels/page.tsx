"use client";

import React from 'react';
import ReelsVerticalPlayer from '@/components/dashboard/reels/ReelsVerticalPlayer';
import { useSidebar } from '@/context/SidebarContext';

import { createPortal } from 'react-dom';

export default function ReelsPage({ params }: { params: Promise<{ lang: 'en' | 'ar' }> }) {
  const lang = (React.use(params)).lang;
  const isAr = lang === 'ar';
  const { isExpanded } = useSidebar();
  const [isDesktop, setIsDesktop] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);
  const sidebarWidth = isExpanded ? 256 : 80;

  React.useEffect(() => {
    setMounted(true);
    const checkDesktop = () => setIsDesktop(window.innerWidth >= 1024);
    checkDesktop();
    window.addEventListener('resize', checkDesktop);
    return () => window.removeEventListener('resize', checkDesktop);
  }, []);

  const content = (
    <div
      dir={isAr ? 'rtl' : 'ltr'}
      className="fixed z-[90] w-full pointer-events-none flex items-center justify-center bg-transparent"
      style={{
        top: isDesktop ? '80px' : '64px',
        bottom: 0,
        left: isDesktop ? (isAr ? 0 : sidebarWidth) : 0,
        right: isDesktop ? (isAr ? sidebarWidth : 0) : 0,
        width: isDesktop ? `calc(100% - ${sidebarWidth}px)` : '100%',
      }}
    >
      <div className="h-full w-full pointer-events-auto flex items-center justify-center">
        <ReelsVerticalPlayer lang={lang} />
      </div>
    </div>
  );

  return (
    <main className="relative min-h-[calc(100vh-64px)] sm:min-h-[calc(100vh-80px)] overflow-hidden bg-transparent">
      {/* SEO H1 */}
      <h1 className="sr-only">{isAr ? 'بث الاستكشاف ريفيا' : 'Revia Discovery Stream'}</h1>

      {/* Portal to dashboard wrapper to escape parent transforms while respecting layout stacking contexts */}
      {mounted && createPortal(content, document.getElementById('dashboard-smooth-wrapper') || document.body)}

      {/* Spacer for fixed header */}
      <div className="h-16 sm:h-20" />

      {/* Flow placeholder */}
      <div className="h-[calc(100vh-64px)] sm:h-[calc(100vh-80px)] w-full" aria-hidden="true" />
    </main>
  );
}
