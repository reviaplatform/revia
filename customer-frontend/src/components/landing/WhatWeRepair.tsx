"use client";

import Image from 'next/image';
import { useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

import { SplitText } from 'gsap/SplitText';
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin';
import SparkleStars from './SparkleStars';

gsap.registerPlugin(ScrollTrigger, SplitText, DrawSVGPlugin);

export default function WhatWeRepair({ lang, t }: { lang: 'en' | 'ar', t: Record<string, any> }) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const isRTL = lang === 'ar';
  
  useGSAP(() => {
    // Only apply horizontal scroll on desktop where cards don't naturally fit
    let mm = gsap.matchMedia();

    mm.add("(min-width: 1024px)", () => {
      const sec = sectionRef.current;
      const pinWrap = scrollContainerRef.current;
      if (!sec || !pinWrap) return;
      let pinWrapWidth: number;
      let horizontalScrollLength: number;

      function refresh() {
        if (!pinWrap) return;
        pinWrapWidth = pinWrap.scrollWidth;
        horizontalScrollLength = pinWrapWidth - window.innerWidth;
        console.log("WhatWeRepair refresh:", { pinWrapWidth, windowWidth: window.innerWidth, horizontalScrollLength });
      }

      refresh();
      
      gsap.to(pinWrap, {
        x: () => isRTL ? horizontalScrollLength : -horizontalScrollLength,
        ease: "none",
        scrollTrigger: {
          trigger: sec,
          pin: sec,
          scrub: 1, // Luxurious "follow" feel
          start: "top top",
          end: () => `+=${horizontalScrollLength}`, 
          invalidateOnRefresh: true,
        },
        force3D: true,
      });

      ScrollTrigger.addEventListener("refreshInit", refresh);

      // Horizontal Image Parallax (Window Effect) - Only on desktop where horizontal scroll happens
      gsap.utils.toArray(".category-image").forEach((img: any) => {
        gsap.fromTo(img, 
          { xPercent: isRTL ? 15 : -15 },
          { 
            xPercent: isRTL ? -15 : 15,
            ease: "none",
            scrollTrigger: {
              trigger: sec,
              start: "top top",
              end: () => `+=${horizontalScrollLength}`,
              scrub: true,
            },
            force3D: true,
          }
        );
      });

      // Scroll-synced icon rotation
      gsap.to(".repair-icon", {
        rotate: isRTL ? -360 : 360,
        ease: "none",
        scrollTrigger: {
          trigger: sec,
          start: "top top",
          end: () => `+=${horizontalScrollLength}`,
          scrub: true,
        },
        force3D: true,
      });

      return () => {
        ScrollTrigger.removeEventListener("refreshInit", refresh);
      };
    });

    // Cinematic SplitText reveal for the header
    let splitTitle: any = null;
    let innerTitle: any = null;
    let splitSubtitle: any = null;
    let innerSubtitle: any = null;

    const runAnimations = () => {
      splitTitle = new SplitText(".repair-title", { type: "lines", linesClass: "overflow-hidden" });
      innerTitle = new SplitText(splitTitle.lines, { type: "lines" });
      splitSubtitle = new SplitText(".repair-subtitle", { type: "lines", linesClass: "overflow-hidden" });
      innerSubtitle = new SplitText(splitSubtitle.lines, { type: "lines" });

      const headerTl = gsap.timeline({
        scrollTrigger: {
          trigger: ".repair-header",
          start: "top 85%",
        }
      });

      headerTl.from(".repair-badge", {
        y: 10,
        autoAlpha: 0,
        duration: 0.8
      })
      .from(innerTitle.lines, {
        yPercent: 100,
        autoAlpha: 0,
        stagger: 0.1,
        duration: 1,
        ease: "power4.out"
      }, "-=0.6")
      .from(innerSubtitle.lines, {
        yPercent: 100,
        autoAlpha: 0,
        stagger: 0.05,
        duration: 0.8,
        ease: "power3.out"
      }, "-=0.8");
    };

    if (typeof window !== "undefined" && document.fonts) {
      document.fonts.ready.then(runAnimations);
    } else {
      runAnimations();
    }

    ScrollTrigger.refresh();

    return () => {
      mm.revert();
      if (splitTitle) splitTitle.revert();
      if (innerTitle) innerTitle.revert();
      if (splitSubtitle) splitSubtitle.revert();
      if (innerSubtitle) innerSubtitle.revert();
    };
  }, { scope: sectionRef, dependencies: [lang], revertOnUpdate: true });

  // ... rest of the component ...
  const categoryImages = [
    '/landing/smartphones.png',
    '/landing/tablets.png',
    '/landing/laptops.png',
    '/landing/watches.png',
    '/landing/desktop_pcs.png',
    '/landing/macbooks_imacs.png',
    '/landing/keyboards_and_mice_new.png',
  ];

  return (
    <section ref={sectionRef} className="py-24 lg:py-0 relative overflow-hidden min-h-screen lg:h-screen flex flex-col justify-center" id="what-we-repair">
      <div className="container mx-auto px-6 sm:px-12 lg:px-10 max-w-[1600px] relative z-10 w-full shrink-0">
        
        {/* Premium Header */}
        <div className="repair-header text-center max-w-3xl mx-auto mb-16 relative">
          <div className="repair-badge inline-flex items-center gap-2 text-slate-900 text-md font-medium tracking-wide uppercase mb-4">
            <SparkleStars size={28} color="#318ffd" className="repair-icon" />
            {t.whatWeRepair.badge}
          </div>
          <h2 className="repair-title text-4xl sm:text-5xl md:text-6xl font-semibold text-slate-900 mb-6 tracking-tight">
            {t.whatWeRepair.title}
          </h2>
          <p className="repair-subtitle text-xl text-slate-600 leading-relaxed">
            {t.whatWeRepair.subtitle}
          </p>
        </div>
      </div>

      {/* Responsive Container: Vertical grid on mobile, horizontal scroll on desktop */}
      <div className="w-full relative lg:overflow-visible">
        <div 
          ref={scrollContainerRef}
          className={`flex flex-col md:flex-row pb-8 gap-8 lg:gap-16 ${
            lang === 'ar' ? 'md:flex-row-reverse' : 'md:flex-row'
          } flex-wrap lg:flex-nowrap w-full lg:w-max px-6 sm:px-12 lg:px-[calc((100vw-min(100vw,1600px))/2+2.5rem)]`}
        >
          {t.whatWeRepair.categories.map((cat: any, index: number) => (
            <div 
              key={index} 
              className="flex-none w-full md:w-[calc(50%-1rem)] lg:w-[450px] group"
            >
              {/* Image Container */}
              <div className="relative aspect-[4/5] lg:aspect-[3/2] overflow-hidden rounded-md mb-6 bg-slate-50">
                <div className="category-image absolute inset-0 scale-125" style={{ willChange: 'transform' }}>
                  <Image
                    src={categoryImages[index]}
                    alt={cat.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 450px"
                  />
                </div>
              </div>

              {/* Text Content */}
              <div className={lang === 'ar' ? 'text-right' : 'text-left'}>
                <h3 className="text-2xl font-bold text-slate-900 mb-2 tracking-tight">
                  {cat.title}
                </h3>
                <p className="text-slate-500 text-lg leading-relaxed">
                  {cat.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
