"use client";

import { useRef } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function Evidence({ lang, t }: { lang: 'en' | 'ar', t: Record<string, any> }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    // Reveal text content
    gsap.from(".evidence-content", {
      opacity: 0,
      x: lang === 'ar' ? 30 : -30,
      duration: 0.6,
      scrollTrigger: {
        trigger: ".evidence-content",
        start: "top 85%",
        toggleActions: "play none none none"
      }
    });

    // Reveal report visual
    gsap.from(".evidence-visual", {
      opacity: 0,
      scale: 0.95,
      duration: 0.6,
      delay: 0.2,
      scrollTrigger: {
        trigger: ".evidence-visual",
        start: "top 85%",
        toggleActions: "play none none none"
      }
    });
  }, { scope: containerRef });

  return (
    <section className="py-24">
      <div ref={containerRef} className="container mx-auto px-6 sm:px-12 lg:px-20 max-w-7xl">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          
          <div className="evidence-content w-full lg:w-1/2">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-6">
              {t.evidence.title}
            </h2>
            <p className="text-xl text-slate-600 mb-8 leading-relaxed">
              {t.evidence.description}
            </p>
            
            <div className="space-y-6">
              {t.evidence.points.map((point: string, idx: number) => (
                <div key={idx} className="flex items-start gap-4">
                  <div className="mt-1.5 w-6 h-6 rounded-full bg-brand-100 flex items-center justify-center flex-shrink-0">
                    <div className="w-2.5 h-2.5 rounded-full bg-brand-500"></div>
                  </div>
                  <p className="text-lg text-slate-700">{point}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="evidence-visual w-full lg:w-1/2">
            {/* Abstract report visual */}
            <div className="bg-slate-50 rounded-3xl p-8 border border-slate-200 relative max-w-md mx-auto transform rotate-1 hover:rotate-0 transition-transform duration-300">
              <div className="absolute top-0 right-0 p-4">
                <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                  {lang === 'ar' ? 'تم الإصلاح' : 'Fixed'}
                </span>
              </div>
              
              <div className="mb-8 border-b border-slate-200 pb-6">
                <div className="w-16 h-16 bg-slate-200 rounded-xl mb-4 animate-pulse"></div>
                <div className="h-6 w-3/4 bg-slate-200 rounded mb-2"></div>
                <div className="h-4 w-1/2 bg-slate-200 rounded"></div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="h-4 w-1/3 bg-slate-200 rounded"></div>
                  <div className="h-4 w-1/4 bg-brand-100 rounded"></div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="h-4 w-1/4 bg-slate-200 rounded"></div>
                  <div className="h-4 w-1/3 bg-brand-100 rounded"></div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="h-4 w-1/2 bg-slate-200 rounded"></div>
                  <div className="h-4 w-1/5 bg-brand-100 rounded"></div>
                </div>
              </div>
              
              <div className="mt-8 pt-6 border-t border-slate-200 flex justify-between items-center">
                <div className="h-6 w-1/3 bg-slate-300 rounded"></div>
                <div className="h-8 w-1/4 bg-slate-800 rounded"></div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

