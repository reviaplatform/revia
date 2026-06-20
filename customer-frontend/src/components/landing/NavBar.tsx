"use client";

import { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { gsap } from "gsap";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { AnimatedText } from "@/components/ui/button";
import { useAuth } from '@/context/AuthContext';

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollSmoother, ScrollTrigger);
}

export default function NavBar({ lang, t }: { lang: 'en' | 'ar', t: Record<string, any> }) {
  const { openAuthModal } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();

  const { contextSafe } = useGSAP();
  const headerRef = useRef<HTMLElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    let prevIsScrolled = false;
    let prevDirection = 0;

    const showAnim = gsap.fromTo(headerRef.current, 
      { yPercent: -100 },
      { 
        yPercent: 0,
        paused: true,
        duration: 0.3,
        ease: "power2.out",
        force3D: true
      }
    ).progress(1);

    const st = ScrollTrigger.create({
      start: "top top",
      end: "max",
      onUpdate: (self) => {
        // Transparency logic (Throttled to avoid redundant React renders)
        const currentIsScrolled = self.scroll() > 20;
        if (currentIsScrolled !== prevIsScrolled) {
          setIsScrolled(currentIsScrolled);
          prevIsScrolled = currentIsScrolled;
        }

        // Directional awareness
        if (isMenuOpen) return;
        
        // Handle top of page separately
        if (self.scroll() < 100) {
          if (prevDirection !== -2) { // Dummy state for top
            showAnim.play();
            prevDirection = -2;
          }
          return;
        }

        // Handle direction changes (Throttled)
        if (self.direction !== prevDirection) {
          if (self.direction === -1) {
            showAnim.play();
          } else if (self.direction === 1) {
            showAnim.reverse();
          }
          prevDirection = self.direction;
        }
      }
    });

    return () => {
      st.kill();
      showAnim.kill();
    };
  }, { scope: headerRef, dependencies: [isMenuOpen] });

  // Mobile menu animation
  useGSAP(() => {
    if (!menuRef.current) return;
    if (isMenuOpen) {
      gsap.fromTo(menuRef.current, 
        { height: 0, opacity: 0 },
        { height: 'auto', opacity: 1, duration: 0.3, ease: 'power2.out' }
      );
    } else {
      gsap.to(menuRef.current, { height: 0, opacity: 0, duration: 0.2, ease: 'power2.in' });
    }
  }, { dependencies: [isMenuOpen] });

  const isHomePage = pathname === `/${lang}` || pathname === `/${lang}/`;
  const isTransparent = isHomePage && !isScrolled && !isMenuOpen;

  // Close menu on resize if screen becomes large
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const navLinks = [
    { href: '#about', label: t.navbar?.about || (lang === 'ar' ? 'من نحن' : 'About') },
    { href: '#features', label: t.navbar?.features || (lang === 'ar' ? 'المميزات' : 'Features') },
    { href: '#how-it-works', label: t.navbar?.howItWorks || (lang === 'ar' ? 'كيف نعمل' : 'How it Works') },
    { href: '#blog', label: t.navbar?.blog || (lang === 'ar' ? 'المدونة' : 'Blog') },
  ];

  const handleNavClick = contextSafe((e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    // Only intercept if we are already on the home page and clicking a hash link
    if (isHomePage && href.startsWith('#')) {
      e.preventDefault();
      setIsMenuOpen(false); // Close mobile menu if open
      
      const targetElement = document.querySelector(href);
      if (targetElement) {
        // Use GSAP's ScrollSmoother to scroll to the element
        const smoother = ScrollSmoother.get();
        if (smoother) {
          smoother.scrollTo(targetElement, true, "top top");
        } else {
          // Fallback if smoother isn't ready
          targetElement.scrollIntoView({ behavior: 'smooth' });
        }
        // Update URL hash without causing a page jump
        window.history.pushState(null, '', `/${lang}${href}`);
      }
    }
    // If not on homepage or not a hash link, let Next.js navigate normally
    else {
      setIsMenuOpen(false);
    }
  });

  return (
    <header
      ref={headerRef}
      data-speed="fixed"
      style={{ willChange: 'transform' }}
      className={`fixed top-0 w-full z-50 transition-[background-color,padding,border-color,backdrop-filter] duration-500 ease-in-out ${
        isTransparent 
          ? 'bg-transparent py-8'
          : 'bg-brand-500/95 backdrop-blur-md py-4 border-b border-white/10'
      }`}
    >
      <div className="container mx-auto px-6 sm:px-12 lg:px-20">
        <div className="flex justify-between items-center">
          <div className="flex-1 flex items-center gap-2">
            <Link href={`/${lang}`} className="relative h-9 w-28 sm:h-12 sm:w-38 transition-all duration-300">
                <Image
                  src="/revia.png"
                  alt="Revia Logo"
                  fill
                  className="object-contain brightness-0 invert transition-all duration-300"
                  priority
                  sizes="(max-width: 768px) 112px, 152px"
                />
            </Link>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => {
              const href = (link as any).isExternal ? `/${lang}${link.href}` : `/${lang}${link.href}`;
              return (
              <Link 
                key={link.href}
                href={href} 
                onClick={(e) => handleNavClick(e, link.href)}
                className="text-sm font-semibold text-white/80 hover:text-white transition-colors tracking-tight"
              >
                {link.label}
              </Link>
            )})}
          </nav>

          {/* Actions & Mobile Toggle */}
          <div className="flex-1 flex justify-end items-center gap-4">
            <Link
              href={`/${lang}?auth=required`}
              onClick={(e) => {
                e.preventDefault();
                openAuthModal();
              }}
              className="hidden group md:inline-flex justify-center items-center gap-2 px-6 py-2.5 text-sm font-semibold rounded-md transition-all duration-300 bg-white text-brand-500 hover:bg-white"
            >
              <AnimatedText text={lang === 'ar' ? 'تسجيل الدخول' : 'Sign in'} />
              <svg 
                className={`w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 ${lang === 'ar' ? 'rotate-180' : ''}`} 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 7l-10 10M17 7H7M17 7v10" />
              </svg>
            </Link>

            {/* Hamburger Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-3 transition-colors text-white"
              aria-label="Toggle Menu"
            >
              <div className="w-6 h-5 relative flex flex-col justify-between">
                <span className={`w-full h-0.5 bg-current transition-all duration-300 origin-left ${isMenuOpen ? 'rotate-45 translate-x-1' : ''}`} />
                <span className={`w-full h-0.5 bg-current transition-all duration-300 ${isMenuOpen ? 'opacity-0' : ''}`} />
                <span className={`w-full h-0.5 bg-current transition-all duration-300 origin-left ${isMenuOpen ? '-rotate-45 translate-x-1' : ''}`} />
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <div
        ref={menuRef}
        className={`md:hidden border-t border-white/10 overflow-hidden ${isMenuOpen ? 'block' : 'hidden'} ${
          isTransparent ? 'bg-black/90 backdrop-blur-md' : 'bg-brand-500/95 backdrop-blur-md'
        }`}
      >
        <div className="container mx-auto px-6 py-8 flex flex-col items-center gap-6 text-center">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={`/${lang}${link.href}`}
              onClick={(e) => handleNavClick(e, link.href)}
              className="text-base font-medium text-white/90 hover:text-white transition-colors w-full"
            >
              {link.label}
            </Link>
          ))}
          <hr className="border-white/20 w-full max-w-[200px]" />
          <Link
            href={`/${lang}?auth=required`}
            onClick={(e) => {
              e.preventDefault();
              setIsMenuOpen(false);
              openAuthModal();
            }}
            className="group inline-flex justify-center items-center gap-2 px-8 py-3.5 text-base font-semibold rounded-md text-brand-500 bg-white hover:bg-white transition-all active:scale-95"
          >
            <AnimatedText text={lang === 'ar' ? 'تسجيل الدخول' : 'Sign in'} />
            <svg 
              className={`w-5 h-5 ${lang === 'ar' ? 'rotate-180' : ''}`} 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 7l-10 10M17 7H7M17 7v10" />
            </svg>
          </Link>
        </div>
      </div>
    </header>
  );
}

