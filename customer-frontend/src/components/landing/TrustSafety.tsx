"use client";

import { useRef } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function TrustSafety({ lang, t }: { lang: 'en' | 'ar', t: Record<string, any> }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    // Reveal items with stagger
    gsap.from(".trust-item", {
      opacity: 0,
      y: 20,
      scale: 0.95,
      duration: 0.5,
      stagger: 0.15,
      scrollTrigger: {
        trigger: ".trust-grid",
        start: "top 85%",
        toggleActions: "play none none none"
      }
    });

    // Reveal header
    gsap.from(".trust-header", {
      opacity: 0,
      y: 20,
      duration: 0.6,
      scrollTrigger: {
        trigger: ".trust-header",
        start: "top 90%",
        toggleActions: "play none none none"
      }
    });
  }, { scope: containerRef });

  return (
    <section className="py-32 bg-brand-50 relative overflow-hidden">
      {/* Top Bleed Gradient */}
      <div className="absolute top-0 left-0 right-0 h-[200px] bg-gradient-to-b from-white to-transparent z-20 pointer-events-none" />
      
      {/* Bottom Bleed Gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-[200px] bg-gradient-to-t from-white to-transparent z-20 pointer-events-none" />

      {/* Overlapping Blur Blobs for Merge */}
      <div className="absolute -top-32 left-1/4 w-[500px] h-[500px] bg-brand-200/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-32 right-1/4 w-[500px] h-[500px] bg-brand-200/20 rounded-full blur-[120px] pointer-events-none" />
      
      <div ref={containerRef} className="container mx-auto px-6 sm:px-12 lg:px-20 max-w-7xl">
        <div className="trust-header text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-brand-900 mb-6">
            {t.trust.title}
          </h2>
          <p className="text-xl text-brand-700">
            {t.trust.subtitle}
          </p>
        </div>

        <div className="trust-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {t.trust.features.map((feature: any, index: number) => (
            <div key={index} className="trust-item bg-white p-8 rounded-2xl text-center hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 mx-auto bg-brand-100 text-brand-600 rounded-full flex items-center justify-center mb-6">
                {/* Generic Check/Shield Icon */}
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-4">{feature.title}</h3>
              <p className="text-slate-600 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

