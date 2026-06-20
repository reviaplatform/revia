"use client";

import Link from 'next/link';
import Image from 'next/image';
import { useRef } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { SplitText } from 'gsap/SplitText';
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin';
import { AnimatedText } from '@/components/ui/button';
import SparkleStars from './SparkleStars';
import { useAuth } from '@/context/AuthContext';

gsap.registerPlugin(SplitText, DrawSVGPlugin);

export default function Hero({ lang, t }: { lang: 'en' | 'ar', t: Record<string, any> }) {
  const { openAuthModal } = useAuth();
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    let splitTitle: any = null;
    let innerSplit: any = null;

    const runAnimations = () => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out", duration: 1, force3D: true } });

      tl.from(".hero-content", {
        y: 30,
        autoAlpha: 0,
      })
      .from(".hero-badge", {
        scale: 0.8,
        autoAlpha: 0,
        duration: 0.6,
      }, "-=0.6");

      splitTitle = new SplitText(".hero-title", { type: "lines", linesClass: "overflow-hidden" });
      innerSplit = new SplitText(splitTitle.lines, { type: "lines" });

      tl.from(innerSplit.lines, {
        yPercent: 100,
        autoAlpha: 0,
        stagger: 0.1,
        duration: 1.2,
        ease: "power4.out",
      }, "-=0.7");

      tl.from(".hero-subtitle", {
        autoAlpha: 0,
      }, "-=0.8")
      .from(".hero-cta", {
        scale: 0.9,
        autoAlpha: 0,
        duration: 0.5,
      }, "-=0.7");

      // Continuous star rotation
      gsap.to(".hero-star", {
        rotation: 360,
        force3D: true,
        repeat: -1,
        ease: "linear",
        duration: 8
      });

      // DrawSVG Path Animation - Traveling Laser Effect
      const paths = gsap.utils.toArray(".animated-path");
      
      paths.forEach((path: any, i: number) => {
        const tl = gsap.timeline({
          repeat: -1,
          yoyo: true,
          delay: i * 0.6
        });

        tl.fromTo(path, 
          { drawSVG: "0% 0%" },
          { drawSVG: "0% 15%", duration: 0.6, ease: "power2.in" }
        )
        .to(path, {
          drawSVG: "85% 100%", duration: 2.5, ease: "none"
        })
        .to(path, {
          drawSVG: "100% 100%", duration: 0.6, ease: "power2.out"
        });
      });

      // Badge SVG Laser Animation
      gsap.set(".badge-laser", { drawSVG: "0% 15%" });
      gsap.to(".badge-laser", {
        drawSVG: "100% 115%",
        duration: 3,
        ease: "none",
        repeat: -1,
      });
    };

    if (typeof window !== "undefined" && document.fonts) {
      document.fonts.ready.then(runAnimations);
    } else {
      runAnimations();
    }

    return () => {
      if (splitTitle) splitTitle.revert();
      if (innerSplit) innerSplit.revert();
    };
  }, { scope: containerRef });

  return (
    <section ref={containerRef} className="hide-dots relative overflow-hidden pt-32 pb-24 lg:pt-48 lg:pb-32">
      {/* Background Container */}
      <div className="absolute inset-0 w-full h-full z-0">
        <Image
          src="/hero-bg.png"
          alt="Hero Background"
          fill
          priority
          quality={90}
          sizes="100vw"
          className="object-cover object-top"
        />
        {/* Webflow Blue Overlay */}
        <div className="absolute inset-0 w-full h-full bg-brand-500/10"></div>

        {/* Animated SVG Path Background perfectly aligned with Next Image object-top */}
        <div className="absolute inset-0 w-full h-full z-0 opacity-100 pointer-events-none">
          <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="xMidYMin slice" viewBox="0 0 1378 1380" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Soft glowing dropshadow filter */}
            <filter id="dropshadow-glow" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="0" dy="0" stdDeviation="6" floodColor="#318ffd" floodOpacity="1"></feDropShadow>
            </filter>
            
            {/* Base Faded Static Paths (Original) */}
            <path d="M0 691.532H132.479C230.046 691.532 305.097 616.482 305.097 518.915V113.639C305.097 70.2738 319.924 31.3564 344.964 1.5" stroke="rgba(255,255,255,0.15)" strokeWidth="1"></path>
            <path d="M305.094 1379.5V863.214C305.094 765.647 380.145 690.596 477.711 690.596H897.997C995.564 690.596 1070.61 615.545 1070.61 517.979V112.703C1070.61 69.6162 1085.25 30.9206 1110 1.14062" stroke="rgba(255,255,255,0.15)" strokeWidth="1"></path> 
            <path d="M1378 691.532L1243.23 691.532C1145.67 691.532 1070.62 766.583 1070.62 864.15V1379.5" stroke="rgba(255,255,255,0.15)" strokeWidth="1"></path> 

            {/* Additional Custom Random Paths */}
            <path d="M150 0 V300 A 150 150 0 0 0 300 450 H1000 A 150 150 0 0 1 1150 600 V1380" stroke="rgba(255,255,255,0.15)" strokeWidth="1"></path>
            <path d="M1378 350 H1100 A 100 100 0 0 0 1000 450 V800 A 100 100 0 0 1 900 900 H0" stroke="rgba(255,255,255,0.15)" strokeWidth="1"></path>
            <path d="M1000 1380 V1000 A 150 150 0 0 0 850 850 H650 A 150 150 0 0 1 500 700 V0" stroke="rgba(255,255,255,0.15)" strokeWidth="1"></path>
            <path d="M0 150 H200 A 100 100 0 0 1 300 250 V1100 A 100 100 0 0 0 400 1200 H1378" stroke="rgba(255,255,255,0.15)" strokeWidth="1"></path>
            
            {/* Top Layer - Highlight Paths controlled by GSAP DrawSVG */}
            <path className="animated-path" filter="url(#dropshadow-glow)" d="M0 691.532H132.479C230.046 691.532 305.097 616.482 305.097 518.915V113.639C305.097 70.2738 319.924 31.3564 344.964 1.5" stroke="#318ffd" strokeWidth="1.5"></path> 
            <path className="animated-path" filter="url(#dropshadow-glow)" d="M305.094 1379.5V863.214C305.094 765.647 380.145 690.596 477.711 690.596H897.997C995.564 690.596 1070.61 615.545 1070.61 517.979V112.703C1070.61 69.6162 1085.25 30.9206 1110 1.14062" stroke="#318ffd" strokeWidth="1.5"></path> 
            <path className="animated-path" filter="url(#dropshadow-glow)" d="M1378 691.532L1243.23 691.532C1145.67 691.532 1070.62 766.583 1070.62 864.15V1379.5" stroke="#318ffd" strokeWidth="1.5"></path> 
            <path className="animated-path" filter="url(#dropshadow-glow)" d="M150 0 V300 A 150 150 0 0 0 300 450 H1000 A 150 150 0 0 1 1150 600 V1380" stroke="#318ffd" strokeWidth="1.5"></path>
            <path className="animated-path" filter="url(#dropshadow-glow)" d="M1378 350 H1100 A 100 100 0 0 0 1000 450 V800 A 100 100 0 0 1 900 900 H0" stroke="#318ffd" strokeWidth="1.5"></path>
            <path className="animated-path" filter="url(#dropshadow-glow)" d="M1000 1380 V1000 A 150 150 0 0 0 850 850 H650 A 150 150 0 0 1 500 700 V0" stroke="#318ffd" strokeWidth="1.5"></path>
            <path className="animated-path" filter="url(#dropshadow-glow)" d="M0 150 H200 A 100 100 0 0 1 300 250 V1100 A 100 100 0 0 0 400 1200 H1378" stroke="#318ffd" strokeWidth="1.5"></path> 
          </svg>
        </div>
      </div>
      
      <div className="container mx-auto px-6 sm:px-12 lg:px-20 relative z-10">
        <div className="hero-content text-center max-w-5xl mx-auto flex flex-col items-center">
          {/* Top Badge matching reference style */}
          <div className="hero-badge relative inline-flex justify-center items-center mb-10 group">
            {/* Animated SVG Border perfectly matching pill shape */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible" xmlns="http://www.w3.org/2000/svg">
               <rect x="0" y="0" width="100%" height="100%" rx="20" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1" className="transition-colors group-hover:stroke-white/30"></rect>
               <rect className="badge-laser" x="0" y="0" width="100%" height="100%" rx="20" fill="none" stroke="#318ffd" strokeWidth="2" filter="url(#dropshadow-glow)"></rect>
            </svg>
            
            <div className="relative z-10 inline-flex items-center gap-2 px-6 py-2 rounded-full bg-white/5 backdrop-blur-xl text-white text-sm font-medium cursor-default">
              <SparkleStars size={18} color="#93c5fd" className="hero-star" />
              <span>{t.hero.badge}</span>
            </div>
          </div>

          <h1 className="hero-title text-4xl sm:text-5xl lg:text-heading font-semibold text-white tracking-tight leading-[1.04] mb-10 max-w-4xl">
            {t.hero.title}
          </h1>
          
          <p className="hero-subtitle text-lg sm:text-xl lg:text-[20px] text-white/80 mb-12 max-w-3xl mx-auto leading-[1.4] font-normal">
            {t.hero.subtitle}
          </p>
          
          <div className="hero-cta flex flex-col sm:flex-row justify-center gap-4">
            <Link
              href={`/${lang}?auth=required`}
              onClick={(e) => {
                e.preventDefault();
                openAuthModal();
              }}
              className={`group hover-translate relative inline-flex items-center rounded-lg bg-white h-16 overflow-hidden transition-all duration-500 ${lang === 'ar' ? 'pl-8 pr-1.5' : 'pr-8 pl-1.5'}`}
            >
              {/* Expanding Webflow Blue Background */}
              <div className={`absolute top-1 bottom-1 ${lang === 'ar' ? 'right-1' : 'left-1'} z-0 bg-brand-500 rounded-md transition-all duration-500 ease-in-out w-14 group-hover:w-full group-hover:top-0 group-hover:bottom-0 group-hover:left-0 group-hover:right-0 group-hover:rounded-none`} />
              
              {/* Icon Container */}
              <div className={`relative z-10 text-white rounded-md transition-all duration-300 ${lang === 'ar' ? 'ml-3' : 'mr-3'}`}>
                <div className="bg-brand-500/0 p-3 rounded-md">
                  <svg 
                    className="w-5 h-5 transition-transform duration-500 group-hover:rotate-45" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 7l-10 10M17 7H7M17 7v10" />
                  </svg>
                </div>
              </div>
              
              {/* Text */}
              <span className="relative z-10 text-foreground text-lg font-medium transition-colors duration-500 group-hover:text-white">
                <AnimatedText text={t.hero.cta} />
              </span>
            </Link>
          </div>
          
        </div>
      </div>
      
      {/* Bottom Fade-out Gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-[200px] bg-gradient-to-t from-[#ffffff] to-transparent z-20 pointer-events-none" />
    </section>
  );
}
