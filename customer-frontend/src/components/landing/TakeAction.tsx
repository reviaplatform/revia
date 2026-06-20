"use client";

import { useRef } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Image from 'next/image';
import Link from 'next/link';
import { Power } from '@solar-icons/react';
import { AnimatedText } from '@/components/ui/button';

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function TakeAction({ lang, t }: { lang: 'en' | 'ar', t: Record<string, any> }) {
  const isRtl = lang === 'ar';
  const sectionRef = useRef<HTMLElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    // Reveal badge
    gsap.from(".take-action-badge", {
      opacity: 0,
      y: 10,
      duration: 0.5,
      scrollTrigger: {
        trigger: ".take-action-badge",
        start: "top 90%",
        toggleActions: "play none none none"
      }
    });

    // Reveal title
    gsap.from(".take-action-title", {
      opacity: 0,
      y: 20,
      duration: 0.6,
      delay: 0.1,
      scrollTrigger: {
        trigger: ".take-action-title",
        start: "top 90%",
        toggleActions: "play none none none"
      }
    });

    // Reveal description
    gsap.from(".take-action-description", {
      opacity: 0,
      y: 20,
      duration: 0.6,
      delay: 0.2,
      scrollTrigger: {
        trigger: ".take-action-description",
        start: "top 90%",
        toggleActions: "play none none none"
      }
    });

    // Reveal button
    gsap.from(".take-action-btn", {
      opacity: 0,
      scale: 0.95,
      duration: 0.5,
      delay: 0.3,
      scrollTrigger: {
        trigger: ".take-action-btn",
        start: "top 95%",
        toggleActions: "play none none none"
      }
    });

    // Reveal hero image
    gsap.from(".take-action-hero", {
      opacity: 0,
      scale: 0.98,
      duration: 0.7,
      delay: 0.4,
      scrollTrigger: {
        trigger: ".take-action-hero",
        start: "top 90%",
        toggleActions: "play none none none"
      }
    });

    // Layered Pinning: Pin the section when its bottom hits the bottom of the viewport
    // This allows the Footer (which follows it in the DOM) to slide over it.
    // Only pin on desktop to avoid truncating content on smaller viewports.
    let mm = gsap.matchMedia();

    mm.add("(min-width: 1024px)", () => {
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: "bottom bottom",
        pin: true,
        pinSpacing: false,
        invalidateOnRefresh: true,
        preventOverlaps: true,
      });
    });

    return () => mm.revert();
  }, { scope: containerRef });

  return (
    <section 
      ref={sectionRef}
      className="min-h-screen py-24 lg:py-32 relative overflow-hidden bg-slate-50 flex flex-col justify-center z-[1]"
    >
      <div ref={containerRef} className="container mx-auto px-6 sm:px-12 lg:px-10 max-w-[1600px]">
        {/* Constrained Background Container */}
        <div className="relative overflow-hidden rounded-lg px-3 py-3 md:px-4 md:py-4">
          <Image
            src="/TakeAction-bg.png"
            alt=""
            fill
            className="object-cover object-center z-0"
            sizes="100vw"
          />
          {/* Dark Overlay for Contrast */}
          <div className="absolute inset-0 bg-black/60 z-0"></div>

          {/* Inner Content Wrapper */}
          <div className="relative z-10 w-full">
         
            {/* Top Text Content Area */}
            <div className={`flex flex-col md:flex-row justify-between items-start md:items-center px-6 py-10 md:px-4 md:py-4 gap-10 mb-16 ${isRtl ? 'rtl' : 'ltr'}`}>
              
              {/* Left Column: Title & Badge */}
              <div className="flex-1 max-w-2xl">
                <div className="take-action-badge wf-uppercase-label mb-6 inline-flex items-center gap-2 text-brand-500">
                  <Power weight="Bold" size={20} className="text-brand-500" />
                  {t.takeAction.badge}
                </div>
                
                <h2 className="take-action-title text-4xl sm:text-5xl lg:text-heading font-semibold text-white leading-[1.04] tracking-tight whitespace-pre-line">
                  {t.takeAction.title}
                </h2>
              </div>

              {/* Right Column: Description & Button */}
              <div className="flex-1 max-w-md md:pl-8 lg:pl-16 flex flex-col items-start">
                <p className="take-action-description text-lg sm:text-[20px] text-white/80 leading-[1.4] mb-8 font-normal">
                  {t.takeAction.description}
                </p>
                
                <div className="take-action-btn">
                  <Link
                    href={`/${lang}/diagnosis`}
                    className="group hover-translate inline-flex justify-center items-center px-8 py-4 bg-brand-500 text-white font-semibold rounded-md border border-brand-500 hover:bg-brand-600 transition-all duration-300"
                  >
                    <AnimatedText text={t.takeAction.contactBtn} />
                  </Link>
                </div>
              </div>
              
            </div>

            {/* Bottom Hero Image */}
            <div className="take-action-hero relative w-full aspect-[16/9] md:aspect-[21/9] rounded-lg overflow-hidden border border-white/10">
              <Image
                src="/landing/take_action_hero.png"
                alt="Take Action"
                fill
                className="object-cover transition-transform duration-700 hover:scale-105"
              />
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}

