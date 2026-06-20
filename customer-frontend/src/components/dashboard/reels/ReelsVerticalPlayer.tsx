"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Reel } from '@/lib/api/types';
import { getAllReels } from '@/lib/api/reels';
import ReelVideoItem from './ReelVideoItem';
import { Widget5, AltArrowUp, AltArrowDown } from '@solar-icons/react';
import { gsap } from 'gsap';
import { ScrollTrigger, Draggable } from 'gsap/all';
import { useGSAP } from '@gsap/react';

// Register plugins
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, Draggable);
}

/* ─── Skeleton ────────────────────────────────────────────────── */
function ReelSkeleton({ isAr }: { isAr: boolean }) {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  return (
    <div className="h-full w-full flex items-center justify-center relative animate-pulse bg-transparent">
      <div 
        className="relative h-full aspect-[9/16]"
        style={{ 
          maxHeight: '80dvh',
          width: isMobile ? '95%' : 'auto'
        }}
      >
        <div className="h-full w-full bg-foreground/5 rounded-2xl border border-border" />
        <div className={`absolute bottom-10 ${isMobile ? (isAr ? 'left-6' : 'right-6') : (isAr ? 'right-[calc(100%+24px)]' : 'left-[calc(100%+24px)]')} flex flex-col items-center gap-5`}>
          {[...Array(isMobile ? 3 : 4)].map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-1">
              <div className={`w-12 h-12 sm:w-14 sm:h-14 ${isMobile ? 'rounded-full' : 'rounded-xl'} bg-foreground/10`} />
              <div className="h-3 w-8 bg-foreground/5 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Slide wrapper ───────────────────────────────────────────── */
function ReelSlide({
  reel,
  lang,
  isActive,
  className,
}: {
  reel: Reel;
  lang: 'en' | 'ar';
  isActive: boolean;
  className?: string;
}) {
  return (
    <div
      className={`w-full h-full flex items-center justify-center flex-shrink-0 absolute top-0 left-0 ${className}`}
    >
      <ReelVideoItem reel={reel} lang={lang} isActive={isActive} />
    </div>
  );
}

/* ─── Main player ─────────────────────────────────────────────── */
export default function ReelsVerticalPlayer({ lang }: { lang: 'en' | 'ar' }) {
  const isAr = lang === 'ar';
  const [reels, setReels] = useState<Reel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isDesktop, setIsDesktop] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const loopRef = useRef<any>(null);
  const activeIdRef = useRef(activeId);

  useEffect(() => {
    activeIdRef.current = activeId;
  }, [activeId]);

  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= 1024);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => {
    getAllReels()
      .then((res) => {
        setReels(res);
        if (res.length > 0) setActiveId(res[0].id);
      })
      .catch((err) => console.error('Failed to fetch reels', err))
      .finally(() => setIsLoading(false));
  }, []);

  // ── GSAP Infinite Loop Logic (Desktop Only) ──────────────────
  useGSAP(() => {
    if (isLoading || reels.length === 0 || !isDesktop || !wrapperRef.current) return;

    const items = gsap.utils.toArray('.reel-slide') as HTMLElement[];
    const totalItems = items.length;
    if (totalItems < 2) return;

    const spacing = 100; // percent height
    const totalHeight = totalItems * spacing;

    // Set initial positions
    gsap.set(items, {
      yPercent: (i) => i * spacing,
      visibility: 'visible'
    });

    // Create a finite timeline
    const loop = gsap.timeline({
      paused: true,
      onUpdate: () => {
        const p = loop.progress();
        const activeIdx = Math.round(p * (totalItems - 1));
        const currentActiveId = activeIdRef.current;
        if (reels[activeIdx] && currentActiveId !== reels[activeIdx].id) {
          setActiveId(reels[activeIdx].id);
        }
      }
    });

    loop.to(items, {
      yPercent: (i) => i * spacing - (totalHeight - spacing),
      duration: totalItems,
      ease: 'none',
    });

    loopRef.current = loop;

    // Draggable Proxy
    const proxy = document.createElement('div');
    Draggable.create(proxy, {
      type: 'y',
      trigger: wrapperRef.current,
      bounds: { minY: -totalHeight + spacing, maxY: 0 },
      onDrag: function() {
        const p = gsap.utils.normalize(-totalHeight + spacing, 0, this.y);
        loop.progress(1 - p);
      },
      onDragEnd: function() {
        const p = loop.progress();
        const snap = Math.round(p * (totalItems - 1)) / (totalItems - 1);
        gsap.to(loop, { progress: snap, duration: 0.4, ease: 'power2.out' });
      }
    });

    // ScrollTrigger for wheel
    const observer = ScrollTrigger.observe({
      target: wrapperRef.current,
      type: 'wheel,touch',
      onUp: () => {
        const currentActiveId = activeIdRef.current;
        const activeIdx = reels.findIndex(r => r.id === currentActiveId);
        if (activeIdx < reels.length - 1) {
          const nextIdx = activeIdx + 1;
          const targetProgress = nextIdx / (reels.length - 1);
          gsap.to(loop, { 
            progress: targetProgress, 
            duration: 0.6, 
            ease: 'expo.out' 
          });
        }
      },
      onDown: () => {
        const currentActiveId = activeIdRef.current;
        const activeIdx = reels.findIndex(r => r.id === currentActiveId);
        if (activeIdx > 0) {
          const prevIdx = activeIdx - 1;
          const targetProgress = prevIdx / (reels.length - 1);
          gsap.to(loop, { 
            progress: targetProgress, 
            duration: 0.6, 
            ease: 'expo.out' 
          });
        }
      },
      tolerance: 20,
      preventDefault: true
    });

    return () => {
      loop.kill();
      observer.kill();
    };
  }, [isLoading, reels, isDesktop]);

  const activeIdx = reels.findIndex(r => r.id === activeId);
  const hasPrev = activeIdx > 0;
  const hasNext = activeIdx < reels.length - 1;



  const handleNext = () => {
    if (!loopRef.current || reels.length < 2) return;
    const currentIdx = reels.findIndex(r => r.id === activeId);
    if (currentIdx >= reels.length - 1) return;
    
    const nextIdx = currentIdx + 1;
    const targetProgress = nextIdx / (reels.length - 1);
    gsap.to(loopRef.current, { 
      progress: targetProgress, 
      duration: 0.6, 
      ease: 'expo.out' 
    });
  };

  const handlePrev = () => {
    if (!loopRef.current || reels.length < 2) return;
    const currentIdx = reels.findIndex(r => r.id === activeId);
    if (currentIdx <= 0) return;

    const prevIdx = currentIdx - 1;
    const targetProgress = prevIdx / (reels.length - 1);
    gsap.to(loopRef.current, { 
      progress: targetProgress, 
      duration: 0.6, 
      ease: 'expo.out' 
    });
  };

  if (isLoading) return <ReelSkeleton isAr={isAr} />;

  if (reels.length === 0) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center text-center p-8">
        <div className="w-24 h-24 bg-brand-500/5 rounded-2xl flex items-center justify-center mb-8 text-brand-500">
          <Widget5 size={48} />
        </div>
        <h3 className="text-xl font-black text-foreground mb-3 tracking-tight">
          {isAr ? 'لا توجد فيديوهات متاحة' : 'Discovery Vault Empty'}
        </h3>
        <p className="text-xs text-foreground/40 font-medium max-w-xs leading-relaxed">
          {isAr
            ? 'يبدو أن مخزن الفيديوهات فارغ حالياً. سنقوم بإضافة محتوى جديد قريباً.'
            : 'The discovery engine is currently cooling down. New flagship content is arriving soon.'}
        </p>
      </div>
    );
  }

  // ── Mobile Layout (Simple Snap) ─────────────────────────────
  if (!isDesktop) {
    return (
      <div
        className="h-full w-full overflow-y-auto snap-y snap-mandatory no-scrollbar touch-pan-y"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', scrollSnapType: 'y mandatory', WebkitOverflowScrolling: 'touch' }}
      >
        {reels.map((reel) => (
          <div key={reel.id} className="w-full h-full snap-start snap-always flex-shrink-0 relative flex items-center justify-center">
            <ReelVideoItem reel={reel} lang={lang} isActive={activeId === reel.id} />
          </div>
        ))}
      </div>
    );
  }

  // ── Desktop Layout (GSAP Finite) ────────────────────────────
  return (
    <div className="h-full w-full relative overflow-hidden bg-transparent select-none flex items-center justify-center">
      {/* Scrollable Area */}
      <div 
        ref={wrapperRef}
        className="h-full w-full relative"
      >
        {reels.map((reel) => (
          <ReelSlide
            key={reel.id}
            reel={reel}
            lang={lang}
            isActive={activeId === reel.id}
            className="reel-slide"
          />
        ))}
      </div>

      {/* Navigation Buttons */}
      <div className={`absolute top-1/2 -translate-y-1/2 ${isAr ? 'left-4' : 'right-4'} flex flex-col gap-4 z-50`}>
        <button 
          id="reel-prev-btn"
          onClick={handlePrev}
          className={`w-12 h-12 rounded-full bg-brand-500 text-white flex items-center justify-center hover:bg-brand-600 transition-all duration-300 hover:scale-110 active:scale-95 group ${
            hasPrev ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-50 pointer-events-none'
          }`}
          aria-label={isAr ? 'السابق' : 'Previous'}
        >
          <AltArrowUp size={24} className="group-hover:-translate-y-0.5 transition-transform" />
        </button>
        <button 
          id="reel-next-btn"
          onClick={handleNext}
          className={`w-12 h-12 rounded-full bg-brand-500 text-white flex items-center justify-center hover:bg-brand-600 transition-all duration-300 hover:scale-110 active:scale-95 group ${
            hasNext ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-50 pointer-events-none'
          }`}
          aria-label={isAr ? 'التالي' : 'Next'}
        >
          <AltArrowDown size={24} className="group-hover:translate-y-0.5 transition-transform" />
        </button>
      </div>
    </div>
  );
}
