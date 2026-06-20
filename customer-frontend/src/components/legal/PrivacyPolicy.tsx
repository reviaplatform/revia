"use client";

import Image from 'next/image';
import { LockKeyhole } from '@solar-icons/react';

export default function PrivacyPolicy({ lang, t }: { lang: 'en' | 'ar', t: Record<string, any> }) {
  const isRtl = lang === 'ar';
  const content = t.privacy_policy;

  if (!content) return null;

  return (
    <div className={`bg-white min-h-screen pt-32 pb-24 ${isRtl ? 'rtl' : 'ltr'}`}>
      <div className="container mx-auto px-6 sm:px-12 max-w-4xl">
        
        {/* Header Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 text-brand-500 text-xs font-bold tracking-widest uppercase mb-6">
            <LockKeyhole size={16} />
            {content.header.badge}
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-medium text-slate-900 tracking-tight mb-6">
            {content.header.title}
          </h1>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed">
            {content.header.subtitle}
          </p>
        </div>

        {/* Hero Image */}
        <div className="w-full h-[300px] md:h-[450px] relative rounded-md overflow-hidden mb-16">
          <Image
            src="/privacy-policy.png"
            alt="Privacy Policy"
            fill
            className="object-cover"
            priority
          />
        </div>

        {/* Content Body */}
        <div className="bg-transparent prose prose-lg prose-slate max-w-none">
          <p className="text-slate-500 text-sm font-medium tracking-wider uppercase mb-12">
            {content.header.lastUpdated}
          </p>

          <div className="space-y-16">
            {content.content.map((section: any, idx: number) => (
              <div key={idx} className="space-y-6">
                <h2 className="text-3xl font-medium text-slate-900 tracking-tight">
                  {section.title}
                </h2>
                
                {/* Main Body Paragraphs - Handle bullet points gracefully */}
                <div className="text-slate-700 leading-relaxed space-y-4">
                  {section.body.split('\n\n').map((paragraph: string, pIdx: number) => {
                    if (paragraph.startsWith('•')) {
                      return (
                        <ul key={pIdx} className="list-disc ps-6 space-y-2 mt-4 text-slate-600">
                          {paragraph.split('\n').map((item, iIdx) => (
                            <li key={iIdx}>{item.replace('• ', '')}</li>
                          ))}
                        </ul>
                      );
                    }
                    return <p key={pIdx}>{paragraph}</p>;
                  })}
                </div>

                {/* Optional Subsections */}
                {section.subsections && (
                  <div className="space-y-10 mt-8">
                    {section.subsections.map((sub: any, subIdx: number) => (
                      <div key={subIdx} className="space-y-3">
                        <h3 className="text-xl font-medium text-slate-800">
                          {sub.title}
                        </h3>
                        <p className="text-slate-700 leading-relaxed">
                          {sub.body}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
