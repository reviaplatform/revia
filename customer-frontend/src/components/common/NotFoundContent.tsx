"use client";

import React from 'react';
import Link from 'next/link';
import { InfoCircle, Home2, ArrowLeft, Stars } from '@solar-icons/react';

export default function NotFoundContent({ lang }: { lang: 'en' | 'ar' }) {
  const isAr = lang === 'ar';

  const content = {
    en: {
      title: "Page Not Found",
      subtitle: "The page you are looking for might have been moved, deleted, or never existed.",
      backHome: "Back to Home",
      goBack: "Go Back",
      error: "404",
      description: "Oops! We can't find that page."
    },
    ar: {
      title: "الصفحة غير موجودة",
      subtitle: "الصفحة التي تبحث عنها قد تم نقلها، حذفها، أو لم تكن موجودة من الأساس.",
      backHome: "العودة للرئيسية",
      goBack: "رجوع",
      error: "٤٠٤",
      description: "عذراً! لم نتمكن من العثور على هذه الصفحة."
    }
  };

  const t = content[lang];

  return (
    <div 
      className={`min-h-[80vh] flex flex-col items-center justify-center px-4 overflow-hidden relative font-sans`} 
      dir={isAr ? 'rtl' : 'ltr'}
    >
      {/* Background Decorative Elements */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-50 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-indigo-50 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse delay-700" />
      
      <div className="relative mb-8 text-center">
        <div className="text-[12rem] md:text-[16rem] font-black text-gray-50/80 leading-none select-none tracking-tighter">
          {t.error}
        </div>
        <div className="absolute inset-0 flex flex-col items-center justify-center pt-8">
          <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center text-blue-600 mb-4 transform -rotate-12">
            <InfoCircle size={40} />
          </div>
          <div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest border border-blue-100">
            <Stars size={16} />
            {t.description}
          </div>
        </div>
      </div>
      
      <div className="max-w-xl mx-auto text-center relative z-10">
        <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-6 tracking-tight">
          {t.title}
        </h1>
        <p className="text-gray-500 text-lg md:text-xl mb-12 leading-relaxed font-medium">
          {t.subtitle}
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link 
            href={`/${lang}`}
            className="w-full sm:w-auto flex items-center justify-center gap-3 bg-[#0254ff] text-white px-10 py-5 rounded-2xl font-black hover:bg-blue-600 transition-all hover:scale-105 active:scale-95"
          >
            <Home2 size={24} />
            {t.backHome}
          </Link>
          <button 
            onClick={() => window.history.back()}
            className="w-full sm:w-auto flex items-center justify-center gap-3 bg-white text-gray-700 px-10 py-5 rounded-2xl font-black hover:bg-gray-50 transition-all border border-gray-100 hover:scale-105 active:scale-95"
          >
            <ArrowLeft size={24} className={isAr ? 'rotate-180' : ''} />
            {t.goBack}
          </button>
        </div>
      </div>

      <div className="mt-20 flex flex-wrap justify-center gap-8 opacity-40 grayscale hover:grayscale-0 transition-all duration-700">
         <div className="flex items-center gap-2 font-bold text-gray-400">
           <Stars size={20} />
           REVIA AI
         </div>
      </div>
    </div>
  );
}
