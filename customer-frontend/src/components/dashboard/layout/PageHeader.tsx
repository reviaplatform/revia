"use client";

import React from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { useRef } from 'react';

interface PageHeaderProps {
  title: string;
  description: string;
  label: string;
  isAr?: boolean;
  children?: React.ReactNode;
}

export default function PageHeader({ title, description, label, isAr, children }: PageHeaderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const circleRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (circleRef.current) {
      gsap.to(circleRef.current, {
        x: 'random(-40, 40)',
        y: 'random(-40, 40)',
        duration: 'random(4, 6)',
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut'
      });
    }
  }, { scope: containerRef });

  return (
    <div 
      ref={containerRef}
      className="dashboard-item relative overflow-hidden bg-brand-500 rounded-lg p-6 sm:p-10 text-white border border-brand-500/10 transition-all duration-300"
    >
      {/* Dynamic Glassmorphic Background */}
      <div 
        ref={circleRef}
        className="absolute top-0 end-0 w-[300px] sm:w-[450px] h-[300px] sm:h-[450px] bg-white opacity-[0.06] rounded-full -translate-y-1/2 translate-x-1/3 rtl:-translate-x-1/3 pointer-events-none blur-3xl" 
      />
      
      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
        <div className="max-w-xl">
          <p className="wf-uppercase-label !text-brand-50/70 mb-3 tracking-[0.2em] leading-none">
            {label}
          </p>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight mb-4 text-white">
            {title}
          </h1>
          <p className="text-brand-50/80 leading-relaxed font-medium text-sm sm:text-base max-w-md">
            {description}
          </p>
        </div>
        
        {children && (
          <div className="flex flex-col sm:flex-row gap-3">
            {children}
          </div>
        )}
      </div>
    </div>
  );
}
