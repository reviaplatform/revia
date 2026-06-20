import { getDictionary } from '@/i18n';
import Link from 'next/link';

import { AnimatedText } from '@/components/ui/button';

export default async function CTA({ lang }: { lang: 'en' | 'ar' }) {
  const t = await getDictionary(lang);

  return (
    <section className="bg-brand-900 py-32 relative overflow-hidden">
      {/* Top Merge Gradient */}
      <div className="absolute top-0 left-0 right-0 h-[250px] bg-gradient-to-b from-brand-50 to-transparent z-20 pointer-events-none" />
      
      {/* Overlapping Blur Blobs for Merge */}
      <div className="absolute -top-32 left-1/3 w-96 h-96 bg-brand-400/10 rounded-full blur-[120px] pointer-events-none z-10" />

      {/* Background decoration */}
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-brand-400 via-brand-900 to-brand-950" />
      
      <div className="container mx-auto px-6 sm:px-12 lg:px-20 relative z-10 text-center">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-6">
          {t.cta.title}
        </h2>
        
        <p className="text-xl text-brand-100 mb-10 max-w-2xl mx-auto">
          {t.cta.subtitle}
        </p>
        
        <Link
          href={`/${lang}/diagnosis`}
          className="group inline-flex justify-center items-center gap-3 px-12 py-8 text-2xl font-bold rounded-full text-white bg-black hover:bg-slate-900 transition-all duration-300 transform hover:-translate-y-1"
        >
          <AnimatedText text={t.cta.button} />
          <svg 
            className="w-6 h-6 transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M17 7l-10 10M17 7H7M17 7v10" />
          </svg>
        </Link>
      </div>
    </section>
  );
}
