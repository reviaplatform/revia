"use client";

import { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Image from 'next/image';
import { 
  CloseCircle, 
  CheckCircle,
  Danger,
  ClockCircle,
  ShieldWarning,
  CardSend,
  Magnifer,
  Box,
  Widget
} from '@solar-icons/react';

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const ConnectorPath = ({ d, id, isDashed = false }: { d: string, id: string, isDashed?: boolean }) => {
  const pathRef = useRef<SVGPathElement>(null);

  useGSAP(() => {
    const path = pathRef.current;
    if (path) {
      const length = path.getTotalLength();
      gsap.set(path, { strokeDasharray: length, strokeDashoffset: length, opacity: 0 });
      gsap.to(path, {
        strokeDashoffset: 0,
        opacity: 1,
        duration: 1.5,
        ease: "power2.inOut",
        scrollTrigger: {
          trigger: path,
          start: "top 80%",
          toggleActions: "play none none none"
        }
      });
    }
  });

  return (
    <path
      ref={pathRef}
      d={d}
      fill="none"
      stroke={`url(#${id})`}
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeDasharray={isDashed ? "8 6" : "0"}
      style={{ opacity: 0 }}
    />
  );
};

export default function ProblemSolution({ lang, t }: { lang: 'en' | 'ar', t: Record<string, any> }) {
  const isRtl = lang === 'ar';
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    // Reveal headers
    gsap.from(".ps-header", {
      opacity: 0,
      y: -10,
      duration: 0.5,
      stagger: 0.2,
      scrollTrigger: {
        trigger: ".ps-header",
        start: "top 90%",
      }
    });

    // Reveal left icons
    gsap.from(".ps-left-item", {
      opacity: 0,
      x: -20,
      duration: 0.5,
      stagger: 0.1,
      scrollTrigger: {
        trigger: ".ps-left-grid",
        start: "top 80%",
      }
    });

    // Reveal right icons
    gsap.from(".ps-right-item", {
      opacity: 0,
      x: 20,
      duration: 0.5,
      stagger: 0.1,
      delay: 0.5,
      scrollTrigger: {
        trigger: ".ps-right-grid",
        start: "top 80%",
      }
    });

    // Reveal illustration
    gsap.from(".ps-illustration", {
      scale: 0.8,
      opacity: 0,
      duration: 1,
      scrollTrigger: {
        trigger: ".ps-illustration",
        start: "top 75%",
      }
    });
  }, { scope: containerRef });

  return (
    <section className="py-32 relative overflow-hidden" id="analysis">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-brand-50/30 rounded-full blur-[120px] pointer-events-none" />

      <div ref={containerRef} className="container mx-auto px-6 max-w-7xl relative">
        <div className="relative w-full lg:h-[700px] flex flex-col lg:block">
          
          {/* HEADER (Mobile & Desktop) */}
          <div className="flex flex-col lg:flex-row justify-between w-full mb-16 lg:mb-0 lg:absolute lg:top-0 lg:left-0 z-30">
            <h3 className="ps-header text-3xl font-bold text-slate-400 text-center lg:text-left mb-8 lg:mb-0">
              {t.problem.badge}
            </h3>
            <h3 className="ps-header text-3xl font-bold text-brand-600 text-center lg:text-right">
              {t.solution.badge}
            </h3>
          </div>

          {/* UNIFIED SVG CONNECTOR SYSTEM (Desktop Only) */}
          <div className="hidden lg:block absolute inset-0 pointer-events-none z-10">
            <svg viewBox="0 0 1200 700" className="w-full h-full overflow-visible">
              <defs>
                <linearGradient id="line-left" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#e2e8f0" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#cbd5e1" stopOpacity="1" />
                </linearGradient>
                <linearGradient id="line-right" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity="1" />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.2" />
                </linearGradient>
              </defs>

              {/* LEFT CONNECTORS (Old Way) - Anchored from Icons to Center */}
              <ConnectorPath id="line-left" isDashed d="M150,115 Q350,120 450,250" />
              <ConnectorPath id="line-left" isDashed d="M150,270 Q400,280 430,350" />
              <ConnectorPath id="line-left" isDashed d="M150,425 Q400,420 430,400" />
              <ConnectorPath id="line-left" isDashed d="M150,580 Q350,580 450,450" />

              {/* RIGHT CONNECTORS (Revia Way) - Anchored from Center to Icons */}
              <ConnectorPath id="line-right" d="M750,250 Q850,120 1050,115" />
              <ConnectorPath id="line-right" d="M770,350 Q850,280 1050,270" />
              <ConnectorPath id="line-right" d="M770,400 Q850,420 1050,425" />
              <ConnectorPath id="line-right" d="M750,450 Q850,580 1050,580" />
            </svg>
          </div>

          {/* NODES GRID (Overlay above SVG) */}
          <div className="relative z-20 flex flex-col lg:flex-row items-center justify-between min-h-[600px] lg:h-full mt-12 lg:mt-0">
            
            {/* Left Icons */}
            <div className="ps-left-grid flex flex-col justify-between h-[600px] lg:w-[350px]">
              {[
                 { icon: <CardSend size={32} weight="Bold" />, label: t.problem.items[0], color: "text-rose-400" },
                 { icon: <ClockCircle size={32} weight="Bold" />, label: t.problem.items[1], color: "text-amber-400" },
                 { icon: <Danger size={32} weight="Bold" />, label: t.problem.items[2], color: "text-slate-400" },
                 { icon: <ShieldWarning size={32} weight="Bold" />, label: t.problem.items[3], color: "text-rose-300" }
              ].map((item, idx) => (
                <div 
                  key={idx}
                  className="ps-left-item flex items-center gap-4 lg:w-[300px]"
                >
                  <div className={`w-16 h-16 rounded-2xl bg-slate-100/50 flex items-center justify-center flex-shrink-0 z-30`}>
                    <div className={item.color}>{item.icon}</div>
                  </div>
                  <span className="text-slate-500 font-medium text-sm lg:text-base max-w-[180px]">{item.label}</span>
                </div>
              ))}
            </div>

            {/* Center Illustration */}
            <div className="flex items-center justify-center py-12 lg:py-0 relative z-20">
               <div className="ps-illustration relative w-[320px] h-[320px] sm:w-[500px] sm:h-[500px] rounded-full bg-gradient-to-tr from-[#106fff]/10 to-transparent p-4">
                <div className="relative w-full h-full rounded-full overflow-hidden border-[8px] border-white bg-white">
                  <Image 
                    src="/dual_character_illustration.png" 
                    alt="Comparison Illustration" 
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
            </div>

            {/* Right Icons */}
            <div className="ps-right-grid flex flex-col justify-between h-[600px] lg:w-[350px] items-end px-4">
               {[
                 { icon: <Magnifer size={32} weight="Bold" />, label: t.solution.items[0], theme: "bg-brand-500 text-white" },
                 { icon: <Box size={32} weight="Bold" />, label: t.solution.items[1], theme: "bg-brand-500 text-white" },
                 { icon: <Widget size={32} weight="Bold" />, label: t.solution.items[1], theme: "bg-brand-500 text-white" },
                 { icon: <CheckCircle size={32} weight="Bold" />, label: t.solution.items[3], theme: "bg-brand-500 text-white" }
              ].map((item, idx) => (
                <div 
                  key={idx}
                  className="ps-right-item flex flex-row-reverse items-center gap-4 lg:w-[300px] justify-start"
                >
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0 z-30 ${item.theme}`}>
                    {item.icon}
                  </div>
                  <span className="text-brand-900 font-semibold text-sm lg:text-base text-right max-w-[180px]">{item.label}</span>
                </div>
              ))}
            </div>

          </div>
          
        </div>
      </div>
    </section>
  );
}

