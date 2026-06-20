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

export default function ArticlesSection({ lang, t }: { lang: 'en' | 'ar', t: Record<string, any> }) {
  const isRtl = lang === 'ar';
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(() => {
    // Reveal header badge
    gsap.from(".article-header-badge", {
      opacity: 0,
      y: 10,
      duration: 0.5,
      scrollTrigger: {
        trigger: ".article-header-badge",
        start: "top 90%",
        toggleActions: "play none none none"
      }
    });

    // Reveal header title
    gsap.from(".article-header-title", {
      opacity: 0,
      y: 20,
      duration: 0.6,
      scrollTrigger: {
        trigger: ".article-header-title",
        start: "top 90%",
        toggleActions: "play none none none"
      }
    });

    // Reveal grid items
    gsap.from(".article-card-item", {
      opacity: 0,
      y: 30,
      duration: 0.6,
      stagger: 0.15,
      ease: "power2.out",
      scrollTrigger: {
        trigger: ".article-cards-grid",
        start: "top 85%",
        toggleActions: "play none none none"
      }
    });

    // Reveal footer button
    gsap.from(".article-footer-btn", {
      opacity: 0,
      scale: 0.95,
      duration: 0.5,
      delay: 0.3,
      scrollTrigger: {
        trigger: ".article-footer-btn",
        start: "top 95%",
        toggleActions: "play none none none"
      }
    });
  }, { scope: sectionRef });

  return (
    <section ref={sectionRef} id="blog" className="py-24 lg:py-32 relative overflow-hidden bg-white">
      <div className="container mx-auto px-6 sm:px-12 lg:px-10 max-w-[1440px] relative z-10">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16 relative">
          <div className="article-header-badge inline-flex items-center gap-2 text-slate-900 text-md font-medium tracking-wide uppercase mb-6">
            <SparkleStars size={28} color="#318ffd" />
            {t.articles.badge}
          </div>
          <h2 className="article-header-title text-4xl md:text-5xl font-medium text-slate-900 leading-[1.15] tracking-tight whitespace-pre-line">
            {t.articles.title}
          </h2>
        </div>

        {/* Cards Grid */}
        <div className={`article-cards-grid grid grid-cols-1 lg:grid-cols-3 gap-8 ${isRtl ? 'rtl' : 'ltr'}`}>
          {t.articles.items.slice(0, 3).map((article: any, index: number) => (
            <div key={index} className="article-card-item">
              <Link
                href={`/${lang}/blog/${article.slug}`}
                className="flex flex-col md:flex-row lg:flex-col rounded-md overflow-hidden bg-[#f5f6f8] hover:bg-slate-200 transition-colors duration-300 h-full border border-slate-100 cursor-pointer"
              >
                {/* Text Top/Left Half */}
                <div className="p-8 pb-10 flex flex-col flex-grow md:w-1/2 lg:w-full md:justify-center">
                  <span className="text-xs font-medium tracking-widest text-slate-500 uppercase mb-4">
                    {article.date}
                  </span>
                  <h3 className="text-2xl font-semibold text-slate-900 leading-tight mb-4 line-clamp-2">
                    {article.title}
                  </h3>
                  <p className="text-slate-500 leading-relaxed max-w-[95%]">
                    {article.description}
                  </p>
                </div>
  
                {/* Image Bottom/Right Half */}
                <div className="relative aspect-[4/3] md:aspect-auto lg:aspect-[4/3] w-full md:w-1/2 lg:w-full md:min-h-[300px] mt-auto md:mt-0 lg:mt-auto">
                  <Image
                    src={article.image}
                    alt={article.title}
                    fill
                    className="object-cover"
                  />
                </div>
              </Link>
            </div>
          ))}
        </div>

        {/* View All Button */}
        <div className="mt-16 text-center">
          <div className="article-footer-btn">
            <Link 
              href={`/${lang}/knowledge-hub`}
              className="group inline-block px-10 py-3.5 bg-brand-500 text-white font-medium rounded-full hover:bg-brand-600 transition-colors duration-300"
            >
              <AnimatedText text={t.articles.viewAllBtn} />
            </Link>
          </div>
        </div>

      </div>
    </section>
  );
}

