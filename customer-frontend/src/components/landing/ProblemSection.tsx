"use client";

import { useRef } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import SparkleStars from './SparkleStars';
import Image from 'next/image';

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const VisualHiddenCosts = () => {
  const imgRef = useRef<HTMLDivElement>(null);
  
  useGSAP(() => {
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;
    const targetOpacity = isMobile ? 0.22 : 0.6;

    gsap.fromTo(imgRef.current, 
      { x: 90, y: 60, opacity: 0, scale: 1.1 },
      { 
        x: 50, y: 20, opacity: targetOpacity, scale: 1, 
        duration: 1.2, 
        ease: "power2.out",
        scrollTrigger: {
          trigger: imgRef.current,
          start: "top 90%",
          toggleActions: "play none none none"
        }
      }
    );
  });

  return (
    <div className="absolute inset-0 w-full h-full pointer-events-none">
      <div 
        ref={imgRef}
        className="absolute right-0 bottom-0 w-[85%] sm:w-[115%] h-[85%] sm:h-[115%]"
      >
        <Image 
          src="/Hidden-cost.png" 
          alt="Hidden Costs" 
          fill
          className="object-contain object-right-bottom brightness-0 invert contrast-125"
          sizes="(max-width: 768px) 100vw, 50vw"
        />
      </div>
    </div>
  );
};

const VisualWaitTimes = () => {
  const circleRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    // Rotation
    gsap.to(circleRef.current, {
      rotate: 360,
      duration: 4,
      repeat: -1,
      ease: "none"
    });

    // Loading bar
    gsap.fromTo(barRef.current,
      { x: -128 },
      { x: 128, duration: 2, repeat: -1, ease: "power1.inOut" }
    );
  });

  return (
    <div className="relative w-full h-40 flex items-center justify-center bg-slate-50/50 rounded-2xl overflow-hidden mb-6">
      <div className="absolute inset-0 bg-gradient-to-br from-amber-50 to-transparent opacity-50" />
      <div className="relative z-10 flex flex-col items-center gap-4">
        <div className="relative">
          <svg className="w-16 h-16 text-amber-100" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 6v6l4 2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <div 
            ref={circleRef}
            className="absolute inset-0 flex items-center justify-center"
          >
            <div className="w-16 h-16 border-2 border-amber-500/30 border-t-amber-500 rounded-full" />
          </div>
        </div>
        <div className="w-32 h-2 bg-slate-200 rounded-full overflow-hidden">
          <div 
            ref={barRef}
            className="w-1/2 h-full bg-amber-400"
          />
        </div>
      </div>
      <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl" />
    </div>
  );
};

const VisualUnnecessary = () => (
  <div className="relative w-full h-40 flex items-center justify-center bg-slate-50/50 rounded-2xl overflow-hidden mb-6">
    <div className="absolute inset-0 bg-gradient-to-br from-orange-50 to-transparent opacity-50" />
    <div className="relative z-10 grid grid-cols-3 gap-2">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className={`w-8 h-8 rounded-lg border flex items-center justify-center ${i === 4 ? 'bg-orange-50 border-orange-200' : 'bg-white border-slate-100'}`}>
          {i === 4 && <div className="w-2 h-2 rounded-full bg-orange-500 animate-ping" />}
          {i !== 4 && <div className="w-2 h-2 rounded-full bg-slate-200" />}
        </div>
      ))}
    </div>
    <svg className="absolute z-20 w-12 h-12 text-orange-600/40 transform translate-x-4 -translate-y-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" strokeLinecap="round" />
    </svg>
  </div>
);

const VisualUncertainty = () => {
  const iconRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    gsap.to(iconRef.current, {
      opacity: 0.4,
      scale: 0.95,
      duration: 2,
      repeat: -1,
      yoyo: true,
      ease: "power1.inOut"
    });
  });

  return (
    <div className="relative w-full h-40 flex items-center justify-center bg-slate-50/50 rounded-2xl overflow-hidden mb-6">
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 to-transparent opacity-50" />
      <div className="relative z-10">
        <div className="w-24 h-24 rounded-3xl bg-white border border-slate-100 flex items-center justify-center p-4 relative overflow-hidden">
          <div className="absolute inset-0 bg-brand-500/5 rotate-12 -translate-y-8" />
          <div className="relative w-full h-full">
            <svg className="w-full h-full text-indigo-500 opacity-20 blur-[1px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            <div 
              ref={iconRef}
              className="absolute inset-0 flex items-center justify-center"
            >
              <svg className="w-10 h-10 text-brand-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <path d="m9 12 2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>
        </div>
      </div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-indigo-500/5 rounded-full blur-3xl" />
    </div>
  );
};

const visuals = [VisualHiddenCosts, VisualWaitTimes, VisualUnnecessary, VisualUncertainty];

export default function ProblemSection({ lang, t }: { lang: 'en' | 'ar', t: Record<string, any> }) {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(() => {
    // Reveal badge
    gsap.from(".problem-badge", {
      opacity: 0,
      y: 10,
      duration: 0.5,
      scrollTrigger: {
        trigger: ".problem-badge",
        start: "top 90%",
        toggleActions: "play none none none"
      }
    });

    // Reveal title
    gsap.from(".problem-title", {
      opacity: 0,
      y: 20,
      duration: 0.6,
      scrollTrigger: {
        trigger: ".problem-title",
        start: "top 90%",
        toggleActions: "play none none none"
      }
    });

    // Reveal subtitle
    gsap.from(".problem-subtitle", {
      opacity: 0,
      y: 20,
      duration: 0.6,
      delay: 0.1,
      scrollTrigger: {
        trigger: ".problem-subtitle",
        start: "top 90%",
        toggleActions: "play none none none"
      }
    });

    // Reveal cards grid items
    gsap.from(".problem-card", {
      opacity: 0,
      y: 30,
      duration: 0.6,
      stagger: 0.2,
      scrollTrigger: {
        trigger: ".problem-cards-grid",
        start: "top 85%",
        toggleActions: "play none none none"
      }
    });
  }, { scope: sectionRef });

  return (
    <section ref={sectionRef} className="py-24 lg:py-32 relative overflow-hidden" id="problem">
      {/* Top Merge Gradient */}
      <div className="absolute top-0 left-0 right-0 h-[150px] bg-gradient-to-b from-white to-transparent z-30 pointer-events-none" />
      <div className="container mx-auto px-6 sm:px-12 lg:px-20 max-w-7xl relative z-10">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <div className="problem-badge wf-uppercase-label mb-8 inline-flex items-center gap-3 bg-brand-500/5 text-brand-500 px-4 py-2 border border-brand-500/10">
            <SparkleStars size={18} />
            {t.problem_section.badge}
          </div>
          <h2 className="problem-title text-4xl sm:text-5xl lg:text-heading font-semibold text-foreground mb-8 tracking-tighter leading-[1.04]">
            {t.problem_section.title}
          </h2>
          <p className="problem-subtitle text-lg sm:text-[20px] text-foreground/70 leading-[1.4] max-w-2xl mx-auto">
            {t.problem_section.subtitle}
          </p>
        </div>

        {/* Cards Grid */}
        <div className="problem-cards-grid grid grid-cols-1 md:grid-cols-2 gap-10 max-w-6xl mx-auto">
          {t.problem_section.cards.map((card: any, idx: number) => {
            const Visual = visuals[idx];
            return (
              <div 
                key={idx}
                className="problem-card group hover-translate relative rounded-lg overflow-hidden border border-slate-100 transition-all duration-500 flex flex-col items-start text-start"
                style={{ backgroundColor: idx === 0 ? 'var(--color-brand-500, #318ffd)' : 'white' }}
              >
                <div className="relative w-full h-full p-6 sm:p-10 min-h-[380px] sm:min-h-[440px] flex flex-col items-start">
                  <Visual />
                  <div className="relative z-10 mt-auto">
                    <h3 className={`text-2xl font-semibold mb-4 tracking-tight leading-[1.3] ${idx === 0 ? 'text-white' : 'text-foreground'}`}>{card.title}</h3>
                    <p className={`text-base leading-[1.6] ${idx === 0 ? 'text-white/80' : 'text-foreground/70'}`}>
                      {card.description}
                    </p>
                  </div>
                  {idx === 0 && (
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl -mr-10 -mt-10" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

