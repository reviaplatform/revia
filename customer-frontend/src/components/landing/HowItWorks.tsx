"use client";

import Image from 'next/image';
import { useRef, useState, useEffect } from 'react';
import { flushSync } from 'react-dom';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { SplitText } from 'gsap/SplitText';
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin';
// @ts-ignore
import { Flip } from 'gsap/Flip';
import { AltArrowLeft, AltArrowRight } from '@solar-icons/react';
import SparkleStars from './SparkleStars';

gsap.registerPlugin(SplitText, DrawSVGPlugin, Flip);

export default function HowItWorks({ lang, t }: { lang: 'en' | 'ar', t: Record<string, any> }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const isRtl = lang === 'ar';

  useGSAP(() => {
    let splitTitle: any = null;
    let innerTitle: any = null;
    let splitSubtitle: any = null;
    let innerSubtitle: any = null;

    const runAnimations = () => {
      // Header reveal
      splitTitle = new SplitText(".how-title", { type: "lines", linesClass: "overflow-hidden" });
      innerTitle = new SplitText(splitTitle.lines, { type: "lines" });
      splitSubtitle = new SplitText(".how-subtitle", { type: "lines", linesClass: "overflow-hidden" });
      innerSubtitle = new SplitText(splitSubtitle.lines, { type: "lines" });

      const headerTl = gsap.timeline({
        scrollTrigger: {
          trigger: ".how-header",
          start: "top 85%",
        }
      });

      headerTl.from(".how-badge", {
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
      .from(innerSubtitle.lines, {
        yPercent: 100,
        autoAlpha: 0,
        stagger: 0.05,
        duration: 0.8,
        ease: "power3.out"
      }, "-=0.6");
    };

    if (typeof window !== "undefined" && document.fonts) {
      document.fonts.ready.then(runAnimations);
    } else {
      runAnimations();
    }

    // Process Line Reveal (Desktop Only)
    gsap.fromTo(".how-connector-path", 
      { drawSVG: "0%" },
      {
        drawSVG: "100%",
        ease: "none",
        scrollTrigger: {
          trigger: ".how-grid",
          start: "top 70%",
          end: "bottom 80%",
          scrub: 1,
        }
      }
    );

    // Cards reveal
    gsap.from(".how-step-card", {
      scrollTrigger: {
        trigger: ".how-grid",
        start: "top 80%",
      },
      y: 40,
      autoAlpha: 0,
      duration: 1,
      stagger: 0.1,
    });

    return () => {
      if (splitTitle) splitTitle.revert();
      if (innerTitle) innerTitle.revert();
      if (splitSubtitle) splitSubtitle.revert();
      if (innerSubtitle) innerSubtitle.revert();
    };
  }, { scope: containerRef });

  const stepImages = [
    '/landing/step1.png',
    '/landing/step2.png',
    '/landing/step3.png',
    '/landing/step4.png',
  ];

  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const isAnimating = useRef(false);
  const { contextSafe } = useGSAP({ scope: containerRef });

  const handleCardClick = contextSafe((index: number) => {
    if (window.innerWidth < 1024) return; // Disable interactive accordion on mobile
    if (isAnimating.current) return;
    isAnimating.current = true;

    const elements = gsap.utils.toArray(".how-step-card, .how-step-image-wrap, .how-step-content") as Element[];
    const state = Flip.getState(elements);

    flushSync(() => {
      setActiveIndex(activeIndex === index ? null : index);
    });

    Flip.from(state, {
      duration: 0.8,
      ease: "power2.inOut",
      absolute: true,
      nested: true,
      onComplete: () => {
        isAnimating.current = false;
      }
    });
  });

  return (
    <section ref={containerRef} id="how-it-works" className="py-24 lg:py-32 bg-white relative overflow-hidden">
      <div className="container mx-auto px-6 sm:px-12 lg:px-10 max-w-[1440px] relative z-10">
        
        {/* Premium Header */}
        <div className="how-header text-center max-w-3xl mx-auto mb-20">
          <div className="how-badge wf-uppercase-label mb-6 inline-flex items-center gap-2 text-foreground/40">
            <SparkleStars size={28} color="#318ffd" />
            {t.howItWorks.badge}
          </div>
          <h2 className="how-title text-4xl sm:text-5xl lg:text-heading font-semibold text-foreground mb-6 tracking-tight leading-[1.04]">
            {t.howItWorks.title}
          </h2>
          <p className="how-subtitle text-lg sm:text-[20px] text-foreground/70 leading-[1.4] font-normal">
            {t.howItWorks.subtitle}
          </p>
        </div>

        {/* Connecting Process Line (Desktop Only) */}
        <div className="hidden lg:block absolute top-[40%] left-0 w-full h-40 z-0 pointer-events-none opacity-20">
          <svg width="100%" height="100%" viewBox="0 0 1000 100" fill="none" preserveAspectRatio="none">
            <path 
              className="how-connector-path"
              d="M100,50 Q250,-20 400,50 T700,50 T1000,50" 
              stroke="#318ffd" 
              strokeWidth="2" 
              strokeDasharray="8 8" 
              strokeLinecap="round"
            />
          </svg>
        </div>

        {/* Cards Flex Gallery */}
        <div className="how-grid relative flex flex-col lg:flex-row gap-6 z-10 w-full min-h-[460px]">
          {t.howItWorks.steps.map((step: any, index: number) => {
            const isActive = activeIndex === index;
            
            return (
              <div 
                key={index} 
                onClick={() => handleCardClick(index)}
                className={`how-step-card group bg-white rounded-lg overflow-hidden border cursor-pointer transition-colors flex ${
                  isActive 
                    ? "lg:w-[50%] flex-shrink-0 flex-col md:flex-row md:items-stretch border-border" 
                    : "lg:flex-1 flex-col border-border hover:border-brand-500/30"
                }`}
              >
                {/* Image Container */}
                <div className={`how-step-image-wrap p-2 flex-shrink-0 ${isActive ? "md:w-[42%] lg:w-[45%]" : "w-full"}`}>
                  <div className={`relative w-full overflow-hidden rounded-md bg-slate-50 transition-all duration-700 h-full ${isActive ? "aspect-square md:aspect-auto md:h-full" : "aspect-[4/3]"}`}>
                    <Image
                      src={stepImages[index]}
                      alt={step.title}
                      fill
                      className={`object-cover transition-transform duration-700 ease-out ${
                        isActive ? "scale-100" : "scale-[1.03] group-hover:scale-105"
                      }`}
                    />
                    <div className={`absolute inset-0 transition-opacity duration-700 ${
                      isActive ? "bg-transparent" : "bg-black/5 lg:group-hover:bg-transparent"
                    }`} />
                  </div>
                </div>

                {/* Content area */}
                <div className={`how-step-content p-6 lg:p-8 flex flex-col justify-center ${isActive ? "md:w-[58%] lg:w-[55%]" : "w-full"}`}>
                  <div className={`wf-uppercase-label mb-4 transition-colors ${
                    isActive ? "text-brand-500" : "text-slate-400"
                  }`}>
                    {lang === 'ar' ? `الخطوة 0${index + 1}` : `STEP 0${index + 1}`}
                  </div>
                  <h3 className={`font-semibold mb-3 leading-tight tracking-tight transition-all duration-700 ${
                    isActive ? "text-3xl lg:text-4xl text-slate-900" : "text-2xl lg:text-xl text-slate-700"
                  }`}>
                    {step.title}
                  </h3>
                  <p className={`leading-[1.6] text-base font-normal transition-all duration-500 overflow-hidden ${
                    isActive ? "text-slate-600 opacity-100" : "text-slate-600 lg:text-slate-500 opacity-100 lg:opacity-80 line-clamp-none lg:line-clamp-2"
                  }`}>
                    {step.description}
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
