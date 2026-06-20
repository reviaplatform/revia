"use client";

import React, { useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useSidebar } from '@/context/SidebarContext';
import {
  Widget5,
  Smartphone,
  Settings,
  User,
  DoubleAltArrowLeft,
  DoubleAltArrowRight,
  QuestionSquare
} from "@solar-icons/react";
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';

interface DashboardSidebarProps {
  lang: "en" | "ar";
  isMobile?: boolean;
}

export default function DashboardSidebar({ lang, isMobile }: DashboardSidebarProps) {
  const pathname = usePathname();
  const isAr = lang === 'ar';
  const { isExpanded, toggleExpanded, closeMobile } = useSidebar();

  const containerRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const toggleIconRef = useRef<HTMLDivElement>(null);

  const navLinks = [
    {
      name: isAr ? 'نظرة عامة' : 'Overview',
      href: `/${lang}/dashboard`,
      icon: <Widget5 size={24} />,
      exact: true
    },
    {
      name: isAr ? 'أجهزتي' : 'My Devices',
      href: `/${lang}/dashboard/devices`,
      icon: <Smartphone size={24} />,
    },
    {
      name: isAr ? 'طلبات الصيانة' : 'Repairs',
      href: `/${lang}/dashboard/repairs`,
      icon: <Settings size={24} />,
    },
    {
      name: isAr ? 'الملف الشخصي' : 'Profile',
      href: `/${lang}/dashboard/profile`,
      icon: <User size={24} />,
    },
    {
      name: isAr ? 'الاستكشاف' : 'Discovery',
      href: `/${lang}/dashboard/reels`,
      icon: <Widget5 size={24} />,
    }
  ];

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  };

  const showFull = isExpanded || isMobile;

  useGSAP(() => {
    if (logoRef.current) {
      gsap.fromTo(logoRef.current,
        { autoAlpha: 0, scale: 0.9 },
        { autoAlpha: 1, scale: 1, duration: 0.3, ease: "power2.out", force3D: true }
      );
    }
  }, [showFull]);

  useGSAP(() => {
    if (!toggleIconRef.current) return;

    gsap.to(toggleIconRef.current, {
      rotate: isExpanded ? 0 : 180,
      duration: 0.4,
      ease: "back.out(1.7)",
      force3D: true
    });
  }, { dependencies: [isExpanded], scope: containerRef });

  // Internal sidebar contents animation
  useGSAP(() => {
    const tl = gsap.timeline({
      defaults: { duration: 0.4, ease: "power2.inOut", force3D: true }
    });

    if (showFull) {
      // Expanding
      tl.from(".nav-label", {
        x: isAr ? 10 : -10,
        autoAlpha: 0,
        stagger: 0.05,
        clearProps: "all"
      }, "+=0.1")
        .from(".support-card", {
          y: 20,
          autoAlpha: 0,
          duration: 0.5
        }, "-=0.2");
    }
  }, { dependencies: [showFull], scope: containerRef });

  return (
    <aside ref={containerRef} className="bg-white/95 backdrop-blur-3xl h-full flex flex-col transition-all duration-300">
      {/* Logo Area */}
      <div className={`h-20 flex items-center border-b border-gray-100 bg-white/50 relative ${showFull ? 'px-4' : 'justify-center'}`}>
        <Link href={`/${lang}/dashboard`} className={`relative h-8 block group transition-all duration-300 ${showFull ? 'w-full' : 'w-8'}`}>
          <div
            ref={logoRef}
            className="absolute inset-0"
          >
            <Image
              src={showFull ? "/revia.png" : "/revia-icon.png"}
              alt="Revia Logo"
              fill
              className={`object-contain transition-transform duration-500 group-hover:scale-105 ${isAr && showFull ? 'object-right' : (showFull ? 'object-left' : 'object-center')}`}
            />
          </div>
        </Link>

        {/* Toggle Button for Desktop */}
        {!isMobile && (
          <button
            onClick={toggleExpanded}
            className={`absolute top-1/2 -translate-y-1/2 ${isAr ? '-left-4' : '-right-4'} w-8 h-8 bg-white border border-border rounded-md flex items-center justify-center text-foreground/40 hover:text-brand-500 z-30 transition-transform hover:scale-110 active:scale-95 shadow-sm`}
          >
            <div ref={toggleIconRef}>
              {isAr ? <DoubleAltArrowRight size={16} /> : <DoubleAltArrowLeft size={16} />}
            </div>
          </button>
        )}
      </div>

      {/* Navigation Links */}
      <nav
        className="flex-1 overflow-y-auto py-8 px-3 space-y-1.5 no-scrollbar scroll-smooth"
      >
        {navLinks.map((link) => {
          const active = isActive(link.href, link.exact);
          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => isMobile && closeMobile()}
              title={!showFull ? link.name : undefined}
              className={`group flex items-center transition-all duration-400 relative will-change-transform ${showFull ? 'gap-3 px-4 py-3 rounded-lg' : 'justify-center w-14 h-14 mx-auto rounded-md'
                } ${active
                  ? 'bg-brand-500 text-white font-semibold translate-x-1'
                  : `text-foreground/60 hover:bg-brand-500/5 hover:text-brand-500 font-medium`
                }`}
            >
              <div className={`transition-all duration-400 shrink-0 ${active ? 'text-white' : 'text-foreground/40 group-hover:text-brand-500 group-hover:scale-110'}`}>
                {link.icon}
              </div>

              {showFull && (
                <div className="nav-label flex items-center gap-3 overflow-hidden will-change-[transform,opacity]">
                  <span className="text-sm tracking-tight truncate">{link.name}</span>
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {showFull ? (
        <div className="support-card p-4 border-t border-border bg-foreground/[0.02] will-change-[transform,opacity]">
          <div className="bg-white rounded-lg p-5 border border-border">
            <p className="wf-uppercase-label text-brand-500 mb-1">
              {isAr ? 'الدعم الفني' : 'Technical Support'}
            </p>
            <p className="text-xs text-foreground/60 font-normal leading-relaxed">
              {isAr ? 'هل تواجه مشكلة؟ نحن هنا للمساعدة' : 'Having issues? We are here to help.'}
            </p>
            <Link
              href={`/${lang}/dashboard/support`}
              className="hover-translate block text-center mt-4 w-full py-3 bg-brand-500 text-white text-xs font-semibold rounded-md border border-brand-500 hover:bg-brand-600 transition-all duration-300 shadow-sm"
            >
              {isAr ? 'تواصل معنا' : 'Contact Support'}
            </Link>
          </div>
        </div>
      ) : (
        <div className="p-4 border-t border-border mt-auto flex justify-center">
          <Link
            href={`/${lang}/dashboard/support`}
            title={isAr ? 'الدعم الفني' : 'Technical Support'}
            className={`group flex items-center justify-center w-14 h-14 rounded-md transition-all duration-400 ${
              pathname.startsWith(`/${lang}/dashboard/support`)
                ? 'bg-brand-500 text-white font-semibold'
                : 'text-foreground/60 hover:bg-brand-500/5 hover:text-brand-500'
            }`}
          >
            <div className={`transition-all duration-400 shrink-0 ${pathname.startsWith(`/${lang}/dashboard/support`) ? 'text-white' : 'text-foreground/40 group-hover:text-brand-500 group-hover:scale-110'}`}>
              <QuestionSquare size={24} />
            </div>
          </Link>
        </div>
      )}
    </aside>
  );
}

