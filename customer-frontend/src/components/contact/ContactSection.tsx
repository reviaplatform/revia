"use client";

import Image from "next/image";
import { ClockCircle, AltArrowRight } from "@solar-icons/react";
import { AnimatedText } from "@/components/ui/button";

export default function ContactSection({ lang, t }: { lang: 'en' | 'ar', t: Record<string, any> }) {
  const isRtl = lang === "ar";
  const content = t.contact_us;

  return (
    <section className="bg-white min-h-screen pt-32 pb-20 lg:pt-40 lg:pb-32">
      <div className="container mx-auto px-6 sm:px-12 lg:px-24 max-w-full">
        
        {/* Top Header - Working Hours */}
        <div className="text-center max-w-2xl mx-auto mb-16 lg:mb-24">
          <div className="inline-flex items-center justify-center gap-2 text-brand-500 text-[12px] font-bold tracking-[0.2em] uppercase mb-6">
            <ClockCircle size={20} />
            {content.workingHours.badge}
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-7xl font-medium text-slate-900 mb-6 tracking-tight">
            {content.workingHours.time}
          </h1>
          <p className="text-lg md:text-xl text-slate-600 mb-8 whitespace-pre-line">
            {content.workingHours.description}
          </p>
          <a href="#" className="inline-flex items-center gap-2 text-brand-500 hover:text-brand-600 font-medium transition-colors">
            {content.workingHours.directions}
            <AltArrowRight size={20} className={isRtl ? "rotate-180" : ""} />
          </a>
        </div>

        {/* Main Content Area - Form & Image */}
        <div className={`flex flex-col lg:flex-row gap-8 lg:gap-12 items-stretch ${isRtl ? 'rtl' : 'ltr'}`}>
          
          {/* Form Container (Left Side) */}
          <div className="w-full lg:w-1/2 bg-slate-50/80 rounded-2xl border border-slate-100 p-8 md:p-12 flex flex-col justify-center">
            <div className="mb-10">
              <span className="text-[12px] font-bold tracking-[0.2em] text-brand-500 uppercase mb-4 block">
                {content.form.badge}
              </span>
              <h2 className="text-3xl md:text-5xl font-medium text-slate-900 tracking-tight mb-4">
                {content.form.title}
              </h2>
              <p className="text-slate-600 text-lg whitespace-pre-line">
                {content.form.description}
              </p>
            </div>

            <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
              <div className="space-y-2">
                <label className="text-[11px] font-bold tracking-widest text-slate-500 uppercase">
                  {content.form.labels.fullName}
                </label>
                <input 
                  type="text" 
                  placeholder={content.form.placeholders.fullName}
                  className="w-full bg-white border border-slate-200 rounded-md px-4 py-3.5 text-gray-900 placeholder:text-slate-400 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[11px] font-bold tracking-widest text-slate-500 uppercase">
                    {content.form.labels.email}
                  </label>
                  <input 
                    type="email" 
                    placeholder={content.form.placeholders.email}
                    className="w-full bg-white border border-slate-200 rounded-md px-4 py-3.5 text-gray-900 placeholder:text-slate-400 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-bold tracking-widest text-slate-500 uppercase">
                    {content.form.labels.phone}
                  </label>
                  <input 
                    type="tel" 
                    placeholder={content.form.placeholders.phone}
                    className={`w-full bg-white border border-slate-200 rounded-md px-4 py-3.5 text-gray-900 placeholder:text-slate-400 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all text-left ${isRtl ? "text-right" : ""}`}
                    dir="ltr"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-bold tracking-widest text-slate-500 uppercase">
                  {content.form.labels.inquiryType}
                </label>
                <select 
                  defaultValue=""
                  className={`w-full bg-white border border-slate-200 rounded-md px-4 py-3.5 text-gray-900 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all appearance-none cursor-pointer`}
                  style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2364748b'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundPosition: 'right 1rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.25rem' }}
                >
                  <option value="" disabled>
                    {content.form.placeholders.inquiryType}
                  </option>
                  <option value="repair">Repair Inquiry</option>
                  <option value="status">Check Status</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-bold tracking-widest text-slate-500 uppercase">
                  {content.form.labels.message}
                </label>
                <textarea 
                  placeholder={content.form.placeholders.message}
                  rows={4}
                  className="w-full bg-white border border-slate-200 rounded-md px-4 py-3.5 text-gray-900 placeholder:text-slate-400 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all resize-none"
                ></textarea>
              </div>

              <button 
                type="submit"
                className="group w-full bg-brand-500 text-white font-medium py-4 rounded-full hover:bg-brand-600 active:scale-[0.98] transition-all mt-4 relative overflow-hidden"
              >
                <AnimatedText text={content.form.button} />
              </button>
            </form>
          </div>

          {/* Image Container (Right Side) */}
          <div className="w-full lg:w-1/2 h-[400px] lg:h-auto min-h-[500px] relative rounded-2xl overflow-hidden">
            <Image
              src="/contact-us.png"
              alt="Customer support"
              fill
              className="object-cover"
              priority
            />
          </div>

        </div>
      </div>
    </section>
  );
}
