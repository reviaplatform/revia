"use client";

import { useRef, useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { MorphSVGPlugin } from "gsap/MorphSVGPlugin";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, MorphSVGPlugin, ScrollSmoother);
}

export default function Footer({ lang, t }: { lang: 'en' | 'ar', t: Record<string, any> }) {
  const isRtl = lang === 'ar';
  const pathname = usePathname();
  const router = useRouter();
  const isHomePage = pathname === `/${lang}` || pathname === `/${lang}/`;
  const footerRef = useRef<HTMLElement>(null);
  const langDropdownRef = useRef<HTMLDivElement>(null);
  
  const [isLangOpen, setIsLangOpen] = useState(false);

  const toggleLanguage = (targetLang: 'en' | 'ar') => {
    if (targetLang === lang) return;
    const newPath = pathname.replace(`/${lang}`, `/${targetLang}`);
    router.push(newPath);
    setIsLangOpen(false);
  };

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = () => setIsLangOpen(false);
    if (isLangOpen) {
      window.addEventListener('click', handleClickOutside);
    }
    return () => window.removeEventListener('click', handleClickOutside);
  }, [isLangOpen]);

  const { contextSafe } = useGSAP(() => {
    const down = 'M0-0.3C0-0.3,464,156,1139,156S2278-0.3,2278-0.3V683H0V-0.3z';
    const center = 'M0-0.3C0-0.3,464,0,1139,0s1139-0.3,1139-0.3V683H0V-0.3z';

    ScrollTrigger.create({
      trigger: footerRef.current,
      start: 'top bottom',
      onEnter: self => {
        const velocity = Math.abs(self.getVelocity());
        const variation = velocity / 10000;

        gsap.fromTo('#bouncy-path', 
          { morphSVG: down }, 
          {
            duration: 2.5, 
            morphSVG: center, 
            ease: `elastic.out(${1 + (variation * 0.5)}, ${0.8 - (variation * 0.2)})`, 
            overwrite: 'auto'
          }
        );
      }
    });
  }, { scope: footerRef });

  useEffect(() => {
    if (langDropdownRef.current) {
      if (isLangOpen) {
        gsap.to(langDropdownRef.current, {
          autoAlpha: 1,
          y: 0,
          scale: 1,
          duration: 0.2,
          ease: "power2.out"
        });
      } else {
        gsap.to(langDropdownRef.current, {
          autoAlpha: 0,
          y: 10,
          scale: 0.95,
          duration: 0.2,
          ease: "power2.in"
        });
      }
    }
  }, [isLangOpen]);

  const handleNavClick = contextSafe((e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (isHomePage && href.startsWith('#')) {
      e.preventDefault();
      const targetElement = document.querySelector(href);
      if (targetElement) {
        const smoother = ScrollSmoother.get();
        if (smoother) {
          smoother.scrollTo(targetElement, true, "top top");
        } else {
          targetElement.scrollIntoView({ behavior: 'smooth' });
        }
        window.history.pushState(null, '', `/${lang}${href}`);
      }
    }
  });

  return (
    <footer 
      ref={footerRef}
      dir={isRtl ? 'rtl' : 'ltr'}
      className={`relative bg-[#232324] min-h-screen flex flex-col pt-48 pb-20 ${isRtl ? 'rtl' : 'ltr'} border-t border-white/5 overflow-hidden z-10`}
    >
      {/* Bouncy Decoration */}
      <div className="absolute top-0 left-0 w-full overflow-hidden leading-[0] pointer-events-none" style={{ transform: 'translateY(-99%)' }}>
        <svg 
          width="100%" 
          height="120" 
          viewBox="0 0 2278 683" 
          preserveAspectRatio="none" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          className="block"
        >
          <path 
            id="bouncy-path"
            d="M0-0.3C0-0.3,464,0,1139,0s1139-0.3,1139-0.3V683H0V-0.3z" 
            fill="#232324" 
          />
        </svg>
      </div>

      {/* Large Backdrop Logo */}
      <div className="absolute bottom-[-3%] left-0 w-full md:w-[75%] h-[60%] pointer-events-none select-none z-0 opacity-10">
        <div className="relative w-full h-full">
          <Image
            src="/revia.png"
            alt=""
            fill
            className="object-contain object-bottom brightness-0 invert"
            priority
          />
        </div>
      </div>

      <div className="container mx-auto px-6 sm:px-12 lg:px-10 max-w-[1440px] relative z-10">
        
        {/* Top Grid: 4 Columns */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-16 mb-32">
          
          {/* Column 1: Product */}
          <div className="flex flex-col gap-8">
             <div className="border-t border-white/10 pt-4">
                <h4 className="text-white/40 text-sm font-medium mb-8">
                  {t.footer?.columns?.menu?.title || 'Product'}
                </h4>
                <div className="flex flex-col gap-4">
                  <Link href={`/${lang}`} className="text-white text-base hover:text-brand-500 transition-colors">
                    {t.footer?.columns?.menu?.home || 'Home'}
                  </Link>
                  <Link href={`/${lang}#features`} onClick={(e) => handleNavClick(e, '#features')} className="text-white text-base hover:text-brand-500 transition-colors">
                    {t.footer?.columns?.menu?.features || 'Features'}
                  </Link>
                </div>
             </div>
          </div>

          {/* Column 2: Resources */}
          <div className="flex flex-col gap-8">
             <div className="border-t border-white/10 pt-4">
                <h4 className="text-white/40 text-sm font-medium mb-8">
                  {t.footer?.columns?.company?.title || 'Resources'}
                </h4>
                <div className="flex flex-col gap-4">
                  <Link href={`/${lang}#blog`} onClick={(e) => handleNavClick(e, '#blog')} className="text-white text-base hover:text-brand-500 transition-colors">
                    {t.footer?.columns?.company?.blog || 'Blog'}
                  </Link>
                  <Link href={`/${lang}#how-it-works`} onClick={(e) => handleNavClick(e, '#how-it-works')} className="text-white text-base hover:text-brand-500 transition-colors">
                    {t.footer?.columns?.company?.howItWorks || 'How it Works'}
                  </Link>
                  <Link href="https://github.com" className="group inline-flex items-center gap-1.5 text-white text-base hover:text-brand-500 transition-colors">
                    GitHub
                    <svg className="w-3 h-3 text-white/40 group-hover:text-brand-500 transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M7 17L17 7M17 7H7M17 7v10" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </Link>
                </div>
             </div>
          </div>

          {/* Column 3: About */}
          <div className="flex flex-col gap-8">
             <div className="border-t border-white/10 pt-4">
                <h4 className="text-white/40 text-sm font-medium mb-8">
                  About
                </h4>
                <div className="flex flex-col gap-4">
                  <Link href={`/${lang}#about`} onClick={(e) => handleNavClick(e, '#about')} className="text-white text-base hover:text-brand-500 transition-colors">
                    {t.footer?.columns?.menu?.about || 'Our Identity'}
                  </Link>
                  <Link href={`/${lang}/contact`} className="text-white text-base hover:text-brand-500 transition-colors">
                    {t.footer?.columns?.company?.contact || 'Contact'}
                  </Link>
                  <Link href={`/${lang}/privacy`} className="text-white text-base hover:text-brand-500 transition-colors">
                    {t.footer?.privacy || 'Privacy Policy'}
                  </Link>
                </div>
             </div>
          </div>

          {/* Column 4: Community */}
          <div className="flex flex-col gap-8">
             <div className="border-t border-white/10 pt-4">
                <h4 className="text-white/40 text-sm font-medium mb-8">
                  Community
                </h4>
                <div className="flex flex-col gap-4">
                  <a href="#" className="group inline-flex items-center gap-1.5 text-white text-base hover:text-brand-500 transition-colors">
                    LinkedIn
                    <svg className="w-3 h-3 text-white/40 group-hover:text-brand-500 transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M7 17L17 7M17 7H7M17 7v10" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </a>
                  <a href="#" className="group inline-flex items-center gap-1.5 text-white text-base hover:text-brand-500 transition-colors">
                    X / Twitter
                    <svg className="w-3 h-3 text-white/40 group-hover:text-brand-500 transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M7 17L17 7M17 7H7M17 7v10" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </a>
                  <a href="#" className="group inline-flex items-center gap-1.5 text-white text-base hover:text-brand-500 transition-colors">
                    Discord
                    <svg className="w-3 h-3 text-white/40 group-hover:text-brand-500 transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M7 17L17 7M17 7H7M17 7v10" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </a>
                </div>
             </div>
          </div>
        </div>

        {/* Bottom Section: Socials, Tagline, Controls */}
        <div className="flex flex-col md:flex-row justify-between items-center md:items-end gap-12">
          
          {/* Logo & Copyright */}
          <div className="flex flex-col items-center md:items-start gap-4 text-center md:text-start">
            <Link href={`/${lang}`} className="inline-block mb-2">
              <Image
                src="/revia.png"
                alt="Revia Logo"
                width={100}
                height={35}
                className="object-contain brightness-0 invert opacity-80"
              />
            </Link>
            <p className="text-xs text-white/30 tracking-widest uppercase mb-4">
              {t.footer.copyright}
            </p>
          </div>

          {/* Socials & Tagline & Switchers Group (Bottom Right) */}
          <div className="flex flex-col items-center md:items-end gap-6 text-center md:text-end">
            {/* Social Icons */}
            <div className="flex items-center gap-6 text-white/60">
               <a href="#" className="hover:text-white transition-colors">
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.045 4.126H5.078z"/></svg>
               </a>
               <a href="#" className="hover:text-white transition-colors">
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
               </a>
               <a href="#" className="hover:text-white transition-colors">
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/></svg>
               </a>
               <a href="#" className="hover:text-white transition-colors">
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>
               </a>
            </div>

            {/* Tagline */}
            <p className="text-sm text-white/40 max-w-sm mt-2">
              Fix your device with AI precision. No hidden fees. Live tracking.
            </p>

            {/* Language & Theme Controls */}
            <div className="flex items-center gap-3 mt-4">
               {/* Controls Mockup */}
               <div className="flex items-center bg-white/5 rounded-md p-1 border border-white/10">
                  <button className="px-2 py-1 text-white/60 hover:text-white transition-colors" aria-label="Theme Toggle">
                     <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707M12 5a7 7 0 1 0 0 14 7 7 0 0 0 0-14z"/></svg>
                  </button>
                  <button className="px-2 py-1 text-white/20" disabled>|</button>
                  <button className="px-2 py-1 text-white/60 hover:text-white transition-colors" aria-label="Theme Toggle Dark">
                     <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
                  </button>
               </div>
               
               <div className="relative">
                 <button 
                   onClick={(e) => {
                     e.stopPropagation();
                     setIsLangOpen(!isLangOpen);
                   }}
                   className="bg-white/5 rounded-md px-4 py-1.5 border border-white/10 flex items-center gap-2 text-sm text-white/80 cursor-pointer hover:bg-white/10 transition-colors"
                 >
                    {lang === 'en' ? (
                      <svg width="16" height="16" viewBox="0 0 512 512" className="rounded-full"><path fill="#eee" d="M0 0h512v512H0z"/><path fill="#d80027" d="M0 36.6h512v36.6H0zm0 73.2h512v36.6H0zm0 73.2h512v36.6H0zm0 73.2h512v36.6H0zm0 73.2h512v36.6H0zm0 73.2h512v36.6H0z"/><path fill="#0052b4" d="M0 0h284.4v256.1H0z"/><g fill="#eee"><path d="M37.3 33.3l5.8 17.8H62l-15.1 11 5.8 17.8L37.3 69l-15.1 11 5.8-17.8-15.1-11h18.9zM100 33.3l5.8 17.8h18.9l-15.1 11 5.8 17.8L100 69l-15.1 11 5.8-17.8-15.1-11h18.9zm62.7 0l5.8 17.8h18.9l-15.1 11 5.8 17.8-15.1-11-15.1 11 5.8-17.8-15.1-11h18.9zm62.7 0l5.8 17.8h18.9l-15.1 11 5.8 17.8-15.1-11-15.1 11 5.8-17.8-15.1-11h18.9zM68.7 82.1l5.8 17.8h18.9l-15.1 11 5.8 17.8-15.1-11-15.1 11 5.8-17.8-15.1-11h18.9z"/></g></svg>
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 512 512" className="rounded-full"><path fill="#69b53f" d="M0 0h512v512H0z"/><path fill="#fff" d="M141.6 288.7c-5 0-9 4-9 9s4 9 9 9h228.8c5 0 9-4 9-9s-4-9-9-9z"/><path fill="#fff" d="M141.6 288.7v18L110 297.7l31.6-9z"/></svg>
                    )}
                    <span>{lang === 'ar' ? 'العربية' : 'English'}</span>
                    <svg className={`w-3 h-3 text-white/30 transition-transform duration-300 ${isLangOpen ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M6 9l6 6 6-6"/></svg>
                 </button>

                 <div 
                   ref={langDropdownRef}
                   style={{ opacity: 0, visibility: 'hidden', transform: 'translateY(10px) scale(0.95)' }}
                   className={`absolute bottom-full mb-2 ${isRtl ? 'left-0' : 'right-0'} bg-[#2a2a2b] border border-white/10 rounded-lg overflow-hidden shadow-2xl z-50 min-w-[140px]`}
                 >
                    <button 
                      onClick={() => toggleLanguage('en')}
                      className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors text-sm ${lang === 'en' ? 'text-brand-500' : 'text-white/70'} ${isRtl ? 'flex-row-reverse text-end' : 'text-start'}`}
                    >
                       <svg width="16" height="16" viewBox="0 0 512 512" className="rounded-full"><path fill="#eee" d="M0 0h512v512H0z"/><path fill="#d80027" d="M0 36.6h512v36.6H0zm0 73.2h512v36.6H0zm0 73.2h512v36.6H0zm0 73.2h512v36.6H0zm0 73.2h512v36.6H0zm0 73.2h512v36.6H0z"/><path fill="#0052b4" d="M0 0h284.4v256.1H0z"/><g fill="#eee"><path d="M37.3 33.3l5.8 17.8H62l-15.1 11 5.8 17.8L37.3 69l-15.1 11 5.8-17.8-15.1-11h18.9zM100 33.3l5.8 17.8h18.9l-15.1 11 5.8 17.8L100 69l-15.1 11 5.8-17.8-15.1-11h18.9z"/></g></svg>
                       English
                    </button>
                    <button 
                      onClick={() => toggleLanguage('ar')}
                      className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors text-sm ${lang === 'ar' ? 'text-brand-500' : 'text-white/70'} ${isRtl ? 'flex-row-reverse text-end' : 'text-start'}`}
                    >
                       <svg width="16" height="16" viewBox="0 0 512 512" className="rounded-full"><path fill="#69b53f" d="M0 0h512v512H0z"/><path fill="#fff" d="M141.6 288.7c-5 0-9 4-9 9s4 9 9 9h228.8c5 0 9-4 9-9s-4-9-9-9z"/><path fill="#fff" d="M141.6 288.7v18L110 297.7l31.6-9z"/></svg>
                       العربية
                    </button>
                 </div>
               </div>
            </div>
          </div>
        </div>

      </div>
    </footer>
  );
}

