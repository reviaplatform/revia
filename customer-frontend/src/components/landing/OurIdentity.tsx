"use client";

import { useRef } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Image from 'next/image';
import Link from 'next/link';
import SparkleStars from './SparkleStars';
import { AnimatedText } from '@/components/ui/button';

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function OurIdentity({ lang, t }: { lang: 'en' | 'ar', t: Record<string, any> }) {
  const isRtl = lang === 'ar';
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(() => {
    // Reveal badge
    gsap.from(".identity-badge", {
      opacity: 0,
      y: 10,
      duration: 0.5,
      scrollTrigger: {
        trigger: ".identity-badge",
        start: "top 90%",
        toggleActions: "play none none none"
      }
    });

    // Reveal title
    gsap.from(".identity-title", {
      opacity: 0,
      y: 20,
      duration: 0.6,
      scrollTrigger: {
        trigger: ".identity-title",
        start: "top 90%",
        toggleActions: "play none none none"
      }
    });

    // Reveal paragraphs
    gsap.from(".identity-text", {
      opacity: 0,
      y: 20,
      duration: 0.6,
      delay: 0.1,
      scrollTrigger: {
        trigger: ".identity-text",
        start: "top 90%",
        toggleActions: "play none none none"
      }
    });

    // Reveal buttons
    gsap.from(".identity-btns", {
      opacity: 0,
      y: 20,
      duration: 0.6,
      delay: 0.2,
      scrollTrigger: {
        trigger: ".identity-btns",
        start: "top 95%",
        toggleActions: "play none none none"
      }
    });

    // Reveal image
    gsap.from(".identity-image", {
      opacity: 0,
      scale: 0.95,
      duration: 0.8,
      ease: "power2.out",
      scrollTrigger: {
        trigger: ".identity-image",
        start: "top 85%",
        toggleActions: "play none none none"
      }
    });

    // Layered Pinning: Pin the section when its bottom hits the bottom of the viewport
    // Only on desktop to ensure content fits or scrolls naturally
    let mm = gsap.matchMedia();
    
    mm.add("(min-width: 1024px)", () => {
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: "bottom bottom",
        pin: true,
        pinSpacing: false,
      });
    });

    return () => mm.revert();
  }, { scope: sectionRef });

  return (
    <section 
      ref={sectionRef} 
      id="about" 
      className="min-h-screen py-24 lg:py-32 flex flex-col justify-center relative bg-white z-[1]"
    >
      <div className="container mx-auto px-6 sm:px-12 lg:px-10 max-w-[1440px] relative z-10">
        
        <div className={`grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24  ${isRtl ? 'lg:rtl' : 'lg:ltr'}`}>
          
          {/* Text Content - Order 2 on mobile, depends on RTL on desktop */}
          <div className={`order-2 ${isRtl ? 'lg:order-2 text-right' : 'lg:order-1 text-left'}`}>
            
            <div className={`identity-badge wf-uppercase-label mb-8 inline-flex items-center gap-2 text-brand-500 ${isRtl ? 'flex-row-reverse text-right' : 'flex-row text-left'}`}>
              <SparkleStars size={24} />
              {t.ourIdentity.badge}
            </div>

            <h2 className="identity-title text-4xl md:text-5xl lg:text-heading font-semibold text-foreground leading-[1.04] tracking-tight mb-8 sm:mb-12 lg:mb-32">
              {t.ourIdentity.title}
            </h2>

            <div className="identity-text space-y-6 text-foreground/70 text-lg leading-[1.6] mb-10 font-normal">
              <p>{t.ourIdentity.paragraph1}</p>
              <p>{t.ourIdentity.paragraph2}</p>
            </div>

            <div className={`identity-btns flex flex-wrap gap-4 ${isRtl ? 'justify-end lg:justify-start' : 'justify-start'}`}>
              <button className="group hover-translate px-8 py-4 bg-brand-500 text-white font-semibold rounded-md border border-brand-500 hover:bg-brand-600 transition-all duration-300">
                <AnimatedText text={t.ourIdentity.aboutBtn} />
              </button>
              <Link 
                href={`/${lang}/contact`}
                className="group px-8 py-4 bg-transparent text-brand-500 border border-border font-semibold rounded-md hover:bg-brand-50 transition-all duration-300"
              >
                <AnimatedText text={t.ourIdentity.contactBtn} />
              </Link>
            </div>
          </div>

          {/* Image Content - Order 1 on mobile, depends on RTL on desktop */}
          <div className={`order-1 ${isRtl ? 'lg:order-1' : 'lg:order-2'}`}>
            <div className="identity-image relative w-full aspect-[4/5] md:aspect-square lg:aspect-[4/5] rounded-lg overflow-hidden">
              <div className="absolute inset-0 bg-foreground/5 mix-blend-multiply z-10 rounded-lg"></div>
              <Image
                src="/landing/our_identity_hero.png"
                alt="Revia Technician"
                fill
                className="object-cover object-center"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

