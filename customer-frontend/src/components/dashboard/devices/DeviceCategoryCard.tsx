"use client";

import React, { useRef } from 'react';
import { Smartphone, Laptop, Widget5, Tablet, WatchRound } from '@solar-icons/react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';

interface DeviceCategoryCardProps {
  name: string;
  icon?: string;
  selected: boolean;
  onClick: () => void;
  lang: 'en' | 'ar';
}

export function DeviceCategoryCard({ name, icon, selected, onClick, lang }: DeviceCategoryCardProps) {
  const isAr = lang === 'ar';
  const checkmarkRef = useRef<HTMLDivElement>(null);
  
  const IconComponent = (() => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('phone') || lowerName.includes('mobile')) return Smartphone;
    if (lowerName.includes('laptop')) return Laptop;
    if (lowerName.includes('tablet')) return Tablet;
    if (lowerName.includes('watch')) return WatchRound;
    return Widget5;
  })();

  useGSAP(() => {
    if (selected && checkmarkRef.current) {
      gsap.fromTo(checkmarkRef.current, 
        { scale: 0, opacity: 0 }, 
        { scale: 1, opacity: 1, duration: 0.4, ease: "back.out(1.7)" }
      );
    }
  }, [selected]);

  return (
    <button
      onClick={onClick}
      role="radio"
      aria-checked={selected}
      className={`relative flex flex-col items-center justify-center p-6 rounded-lg border transition-all duration-300 outline-none focus-visible:ring-2 focus-visible:ring-brand-500/20 hover-translate hover:scale-[1.02] active:scale-[0.98] ${
        selected 
          ? 'border-brand-500 bg-brand-500/5 ring-2 ring-brand-500/10 shadow-sm' 
          : 'border-border bg-white hover:border-brand-500/20 hover:bg-foreground/[0.01]'
      }`}
    >
      <div className={`w-16 h-16 rounded-lg flex items-center justify-center mb-4 transition-all duration-300 ${
        selected ? 'bg-brand-500 text-white shadow-md shadow-brand-500/10' : 'bg-foreground/[0.03] text-foreground/40'
      }`}>
        <IconComponent size={32} />
      </div>
      
      <h3 className={`font-bold text-lg tracking-tight transition-colors duration-500 ${selected ? 'text-brand-500' : 'text-foreground'}`}>
        {name}
      </h3>
      
      {selected && (
        <div 
          ref={checkmarkRef}
          className="absolute top-4 right-4 w-6 h-6 bg-brand-500 rounded-full flex items-center justify-center text-white shadow-sm"
        >
          <div className="w-2.5 h-1.5 border-l-2 border-b-2 border-white -rotate-45 mb-0.5" />
        </div>
      )}

      {/* Subtle Bottom Accent for Luxury Feel */}
      {selected && (
        <div 
          className="absolute bottom-3 w-8 h-1 bg-brand-500 rounded-full animate-in fade-in slide-in-from-bottom-1 duration-500"
        />
      )}
    </button>
  );
}

