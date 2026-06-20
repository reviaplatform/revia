"use client";

import Image from 'next/image';
import { useRef } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { 
  Settings, 
  Bolt, 
  Star, 
  Heart, 
  Widget, 
  ShieldCheck 
} from '@solar-icons/react';
import { SplitText } from 'gsap/SplitText';
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin';
import SparkleStars from './SparkleStars';

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, SplitText, DrawSVGPlugin);
}



const icons = [Settings, Bolt, Star, Heart, Widget, ShieldCheck];

export default function FeaturesSection({ lang, t }: { lang: 'en' | 'ar', t: Record<string, any> }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    let splitTitle: any = null;
    let innerTitle: any = null;

    const runAnimations = () => {
      // Header reveal
      splitTitle = new SplitText(".features-title", { type: "lines", linesClass: "overflow-hidden" });
      innerTitle = new SplitText(splitTitle.lines, { type: "lines" });

      const headerTl = gsap.timeline({
        scrollTrigger: {
          trigger: ".features-header",
          start: "top 85%",
        }
      });

      headerTl.from(".features-badge", {
        y: 10,
        autoAlpha: 0,
        duration: 0.6
      })
      .from(innerTitle.lines, {
        yPercent: 100,
        autoAlpha: 0,
        stagger: 0.1,
        duration: 1,
        ease: "power4.out"
      }, "-=0.4")
      .from(".features-subtitle", {
        y: 20,
        autoAlpha: 0,
        duration: 0.8,
        ease: "power3.out"
      }, "-=0.6");
    };

    if (typeof window !== "undefined" && document.fonts) {
      document.fonts.ready.then(runAnimations);
    } else {
      runAnimations();
    }

    // Grid reveal
    gsap.from(".feature-card", {
      scrollTrigger: {
        trigger: ".features-grid",
        start: "top 80%",
      },
      y: 30,
      autoAlpha: 0,
      duration: 0.8,
      stagger: 0.1,
    });

    return () => {
      if (splitTitle) splitTitle.revert();
      if (innerTitle) innerTitle.revert();
    };
  }, { scope: containerRef });
  return (
    <section 
      ref={containerRef}
      id="features" 
      className="min-h-screen py-24 lg:py-32 relative overflow-hidden z-10" 
    >
      <Image
        src="/Features-bg.png"
        alt=""
        fill
        className="object-cover object-center z-0"
        sizes="100vw"
      />

      <div className="container mx-auto px-6 sm:px-12 lg:px-20 max-w-7xl relative z-10">
        
        {/* Header (Keep centered and clear) */}
        <div className="features-header text-center max-w-4xl mx-auto mb-20">
          <div className="features-badge wf-uppercase-label mb-6 inline-flex items-center gap-2 text-white/80">
            <SparkleStars size={24} color="#318ffd" />
            {t.features_section.badge}
          </div>
          <h2 className="features-title text-4xl sm:text-5xl lg:text-heading font-semibold text-white mb-6 tracking-tight leading-[1.04]">
            {t.features_section.title}
          </h2>
          <p className="features-subtitle text-lg sm:text-[20px] text-white/80 leading-[1.4] max-w-3xl mx-auto font-normal">
            {t.features_section.subtitle}
          </p>
        </div>

        {/* Features Grid */}
        <div className="features-grid grid grid-cols-1 md:grid-cols-3 gap-8">
          {t.features_section.cards.map((card: any, idx: number) => {
            const Icon = icons[idx] || Settings;
            return (
              <div 
                key={idx}
                className="feature-card group hover-translate flex flex-col items-center text-center p-10 rounded-lg bg-white border border-border transition-all duration-300"
              >
                {/* Icon Container */}
                <div className="mb-6 flex items-center justify-center">
                  <Icon 
                    size={40} 
                    className="text-brand-500 transition-transform duration-500 group-hover:scale-110" 
                  />
                </div>

                {/* Content */}
                <div className="space-y-4">
                  <span className="wf-uppercase-label text-brand-600">
                    {card.badge}
                  </span>
                  <h3 className="text-2xl font-semibold text-foreground tracking-tight leading-[1.3]">
                    {card.title}
                  </h3>
                  <p className="text-foreground/70 leading-[1.6] max-w-[280px] mx-auto font-normal">
                    {card.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
