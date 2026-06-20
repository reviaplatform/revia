"use client";

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { CreateDevicePayload, Device, Category } from '@/lib/api/types';
import { CloseCircle, AltArrowLeft, AltArrowRight, CheckCircle } from '@solar-icons/react';
import { createPortal } from 'react-dom';
import { getCategoryList } from '@/lib/api/category';
import { DEVICE_DATA } from '@/lib/device-data';
import { DeviceCategoryCard } from './DeviceCategoryCard';
import { BrandSelectionGrid } from './BrandSelectionGrid';
import { ModelSelectionList } from './ModelSelectionList';
import { Button } from '@/components/ui/button';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';

interface DeviceFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  initialData?: Device;
  lang: 'en' | 'ar';
}

const STEPS = [
  { id: 'category', en: 'Category', ar: 'الفئة' },
  { id: 'brand', en: 'Brand', ar: 'الشركة' },
  { id: 'model', en: 'Model', ar: 'الموديل' },
  { id: 'confirm', en: 'Finish', ar: 'تأكيد' },
];

export default function DeviceFormModal({ isOpen, onClose, onSubmit, initialData, lang }: DeviceFormModalProps) {
  const isAr = lang === 'ar';
  const [step, setStep] = useState(0);
  const [prevStep, setPrevStep] = useState(0);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [manualMode, setManualMode] = useState({ brand: false, model: false });
  const [mounted, setMounted] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);

  const backdropRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const breadcrumbsRef = useRef<HTMLElement>(null);
  const successIconRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState<CreateDevicePayload>({
    categoryId: '',
    name: '',
    manufacturer: '',
    platform: 'ios',
    deviceModel: '',
    osVersion: ''
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  // Sync shouldRender with isOpen
  useEffect(() => {
    if (isOpen) setShouldRender(true);
  }, [isOpen]);

  useGSAP(() => {
    if (isOpen && shouldRender) {
      const tl = gsap.timeline();
      tl.fromTo(backdropRef.current, { opacity: 0 }, { opacity: 1, duration: 0.4 })
        .fromTo(modalRef.current, 
          { opacity: 0, scale: 0.98, y: 20 }, 
          { opacity: 1, scale: 1, y: 0, duration: 0.5, ease: "power3.out" }, 
          "-=0.2"
        );
      
      // Breadcrumbs stagger
      if (breadcrumbsRef.current) {
        const items = breadcrumbsRef.current.children;
        gsap.fromTo(items, 
          { opacity: 0, y: 10 }, 
          { opacity: 1, y: 0, duration: 0.4, stagger: 0.05, ease: "power2.out", delay: 0.3 }
        );
      }
    }
  }, [isOpen, shouldRender]);

  const handleClose = () => {
    const tl = gsap.timeline({
      onComplete: () => {
        setShouldRender(false);
        setFormData({
          categoryId: '',
          name: '',
          manufacturer: '',
          platform: 'ios',
          deviceModel: '',
          osVersion: ''
        });
        setStep(0);
        setPrevStep(0);
        setManualMode({ brand: false, model: false });
        setIsSubmitting(false);
        onClose();
      }
    });
    tl.to(modalRef.current, { opacity: 0, scale: 0.98, y: 10, duration: 0.3, ease: "power3.in" })
      .to(backdropRef.current, { opacity: 0, duration: 0.3 }, "-=0.2");
  };

  // Step transition animation
  useGSAP(() => {
    if (contentRef.current && shouldRender) {
      const direction = step > prevStep ? 1 : -1;
      const xOffset = direction * (isAr ? -30 : 30);
      
      gsap.fromTo(contentRef.current,
        { opacity: 0, x: xOffset },
        { opacity: 1, x: 0, duration: 0.4, ease: "power2.out" }
      );
    }
  }, [step]);

  // Success icon animation
  useGSAP(() => {
    if (step === 3 && successIconRef.current) {
      gsap.fromTo(successIconRef.current,
        { scale: 0.5, rotate: -10 },
        { scale: 1, rotate: 0, duration: 0.6, ease: "back.out(1.7)" }
      );
    }
  }, [step]);

  useEffect(() => {
    const fetchCats = async () => {
      try {
        const list = await getCategoryList();
        // Only show categories we actually have brand/model data for (DEVICE_DATA).
        // The API can return unrelated/placeholder categories (e.g. seed/test data)
        // that would dead-end the brand/model steps, so those are dropped here.
        const supportedList = list.reduce<Category[]>((acc, cat) => {
          const lowerName = cat.name.en.toLowerCase();
          if (lowerName.includes('phone') || lowerName.includes('mobile')) {
            acc.push({ ...cat, name: { en: 'Smartphones', ar: 'الهواتف الذكية' } });
          } else if (lowerName.includes('laptop') || lowerName.includes('notebook')) {
            acc.push({ ...cat, name: { en: 'Laptops', ar: 'أجهزة المحمول' } });
          }
          return acc;
        }, []);
        setCategories(supportedList);
      } catch (err) {
        console.error("Failed to fetch categories", err);
      }
    };
    fetchCats();
  }, []);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({
          categoryId: initialData.category?.id || '',
          name: initialData.name,
          manufacturer: initialData.manufacturer || '',
          platform: initialData.platform,
          deviceModel: initialData.deviceModel,
          osVersion: initialData.osVersion || ''
        });
        setStep(3); 
        setPrevStep(3);
      } else {
        setFormData({
          categoryId: '',
          name: '',
          manufacturer: '',
          platform: 'ios',
          deviceModel: '',
          osVersion: ''
        });
        setStep(0);
        setPrevStep(0);
        setManualMode({ brand: false, model: false });
      }
    }
  }, [isOpen, initialData]);

  const selectedCategoryObj = useMemo(() => 
    categories.find(c => c.id === formData.categoryId)
  , [categories, formData.categoryId]);

  const activeDataKey = useMemo(() => {
    if (!selectedCategoryObj) return null;
    const name = selectedCategoryObj.name.en.toLowerCase();
    if (name.includes('phone') || name.includes('mobile') || name.includes('smartphone')) return 'Smartphones';
    if (name.includes('laptop')) return 'Laptops';
    return null;
  }, [selectedCategoryObj]);

  const categoryData = activeDataKey ? DEVICE_DATA[activeDataKey] : null;

  const brands = useMemo(() => 
    categoryData ? categoryData.manufacturers.map(m => m.name) : []
  , [categoryData]);

  const models = useMemo(() => {
    if (!categoryData || !formData.manufacturer) return [];
    const mData = categoryData.manufacturers.find(m => m.name === formData.manufacturer);
    return mData?.models || [];
  }, [categoryData, formData.manufacturer]);

  const handleCategorySelect = (catId: string) => {
    setFormData(prevData => ({ ...prevData, categoryId: catId, manufacturer: '', deviceModel: '' }));
    setPrevStep(step);
    setStep(1);
  };

  const handleBrandSelect = (brand: string) => {
    if (brand === "Other") {
      setManualMode(prev => ({ ...prev, brand: true }));
      setFormData(prevData => ({ ...prevData, manufacturer: '', deviceModel: '' }));
    } else {
      const mData = categoryData?.manufacturers.find(m => m.name === brand);
      setFormData(prevData => ({ 
        ...prevData, 
        manufacturer: brand, 
        platform: mData?.defaultPlatform.toLowerCase() || prevData.platform,
        deviceModel: '' 
      }));
      setManualMode(prev => ({ ...prev, brand: false }));
      setPrevStep(step);
      setStep(2);
    }
  };

  const handleModelSelect = (model: string) => {
    if (model === "Manual Input") {
      setManualMode(prev => ({ ...prev, model: true }));
      setFormData(prevData => ({ ...prevData, deviceModel: '' }));
    } else {
      setFormData(prevData => ({ ...prevData, deviceModel: model, name: `${formData.manufacturer} ${model}` }));
      setManualMode(prev => ({ ...prev, model: false }));
      setPrevStep(step);
      setStep(3);
    }
  };

  const goToStep = (targetStep: number) => {
    if (targetStep < step) {
      setPrevStep(step);
      setStep(targetStep);
    }
  };

  const nextStep = () => {
    if (step < STEPS.length - 1) {
      setPrevStep(step);
      setStep(step + 1);
    }
  };

  const prevStepHandler = () => {
    if (step > 0) {
      setPrevStep(step);
      setStep(step - 1);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isOpen || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      handleClose();
    } catch (err) {
      console.error("Failed to submit device form", err);
      setIsSubmitting(false);
    }
  };

  if (!shouldRender || !mounted) return null;

  const modalContent = (
    <div ref={backdropRef} className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
      <div 
        ref={modalRef}
        className={`bg-white rounded-lg w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] shadow-2xl ${isAr ? 'rtl' : 'ltr'}`}
      >
        <div className="relative pt-8 pb-4 px-8 border-b border-border/5">
          <div className="flex justify-between items-start mb-6">
            <div className="space-y-1">
              <h3 className="text-2xl font-black text-foreground tracking-tight leading-none">
                {initialData ? (isAr ? 'تعديل الجهاز' : 'Edit Device') : (isAr ? 'تسجيل جهاز جديد' : 'Connect Device')}
              </h3>
              <p className="text-[11px] text-foreground/30 font-black uppercase tracking-[0.2em]">
                {isAr ? 'مدعوم بأنظمة ريفيا الذكية' : 'Powered by Revia AI Systems'}
              </p>
            </div>
            <button 
              onClick={isSubmitting || !isOpen ? undefined : handleClose} 
              disabled={isSubmitting || !isOpen}
              className="text-foreground/20 hover:text-brand-500 hover:bg-brand-500/5 p-2 rounded-xl transition-all active:scale-95 outline-none focus-visible:ring-2 focus-visible:ring-brand-500/20 disabled:pointer-events-none disabled:opacity-50"
              aria-label="Close"
            >
              <CloseCircle size={28} />
            </button>
          </div>
 
          <nav ref={breadcrumbsRef} className="flex items-center gap-1 overflow-x-auto no-scrollbar pb-2" aria-label="Progress">
            {STEPS.map((s, i) => (
              <React.Fragment key={s.id}>
                <button
                  disabled={i >= step || isSubmitting || !isOpen}
                  onClick={() => goToStep(i)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all whitespace-nowrap outline-none focus-visible:ring-2 focus-visible:ring-brand-500/20 ${
                    i === step 
                      ? 'bg-brand-500/10 text-brand-500' 
                      : i < step 
                        ? 'text-foreground/40 hover:text-brand-500 hover:bg-brand-500/5' 
                        : 'text-foreground/20 cursor-default'
                  }`}
                >
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black border transition-colors ${
                    i === step ? 'bg-brand-500 text-white border-transparent' : 'border-current'
                  }`}>
                    {i + 1}
                  </span>
                  <span className="text-xs font-black uppercase tracking-widest">{isAr ? s.ar : s.en}</span>
                </button>
                {i < STEPS.length - 1 && (
                  <div className={`w-4 h-px bg-foreground/10 transition-colors duration-500 ${i < step ? 'bg-brand-500/20' : ''}`} />
                )}
              </React.Fragment>
            ))}
          </nav>
        </div>
 
        <div ref={contentRef} className="p-8 overflow-y-auto no-scrollbar flex-1 bg-foreground/[0.01]">
          {step === 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 h-full content-start pt-4">
              {categories.map((cat) => (
                <DeviceCategoryCard 
                  key={cat.id}
                  name={isAr ? cat.name.ar : cat.name.en}
                  selected={formData.categoryId === cat.id}
                  onClick={() => handleCategorySelect(cat.id)}
                  lang={lang}
                />
              ))}
            </div>
          )}
 
          {step === 1 && (
            <div>
               {manualMode.brand ? (
                  <div className="space-y-6 py-8">
                     <label className="wf-uppercase-label !text-[11px] px-1">{isAr ? 'أدخل اسم الشركة يدوياً' : 'Brand Name (Manual)'}</label>
                     <input 
                       autoFocus
                       type="text"
                       value={formData.manufacturer}
                       onChange={(e) => setFormData(prevData => ({ ...prevData, manufacturer: e.target.value }))}
                       placeholder={isAr ? 'مثلاً: هواوي' : 'e.g. Huawei'}
                       className="w-full bg-white border border-border rounded-md px-5 py-4 font-semibold outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/5 transition-all text-[15px]"
                     />
                     <button 
                       onClick={() => setManualMode(prev => ({ ...prev, brand: false }))}
                       className="text-brand-500 text-xs font-black uppercase tracking-widest px-1 hover:underline outline-none focus-visible:ring-2 focus-visible:ring-brand-500/20 rounded-md"
                     >
                       {isAr ? 'العودة للاستكشاف' : 'Return to discovery'}
                     </button>
                  </div>
               ) : (
                  <BrandSelectionGrid 
                    brands={brands}
                    selectedBrand={formData.manufacturer}
                    onSelect={handleBrandSelect}
                    lang={lang}
                  />
               )}
            </div>
          )}
 
          {step === 2 && (
            <div>
              {manualMode.model ? (
                <div className="space-y-6 py-8">
                  <label className="wf-uppercase-label !text-[11px] px-1">{isAr ? 'أدخل موديل الجهاز يدوياً' : 'Model Name (Manual)'}</label>
                  <input 
                    autoFocus
                    type="text"
                    value={formData.deviceModel}
                    onChange={(e) => setFormData(prevData => ({ ...prevData, deviceModel: e.target.value, name: `${formData.manufacturer} ${e.target.value}` }))}
                    placeholder={isAr ? 'مثلاً: ميت 60' : 'e.g. Mate 60 Pro'}
                    className="w-full bg-white border border-border rounded-md px-5 py-4 font-semibold outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/5 transition-all text-[15px]"
                  />
                  <button 
                       onClick={() => setManualMode(prev => ({ ...prev, model: false }))}
                       className="text-brand-500 text-xs font-black uppercase tracking-widest px-1 hover:underline outline-none focus-visible:ring-2 focus-visible:ring-brand-500/20 rounded-md"
                     >
                       {isAr ? 'العودة للقائمة' : 'Return to list'}
                     </button>
                </div>
              ) : (
                <ModelSelectionList 
                  models={models}
                  selectedModel={formData.deviceModel}
                  onSelect={handleModelSelect}
                  lang={lang}
                />
              )}
            </div>
          )}

          {step === 3 && (
            <div className="space-y-8 py-2">
              <div className="bg-brand-500/[0.03] border border-brand-500/10 rounded-lg p-8 flex flex-col items-center text-center">
                <div 
                  ref={successIconRef}
                  className="w-16 h-16 bg-brand-500 rounded-md flex items-center justify-center text-white mb-6 shadow-xl shadow-brand-500/20"
                >
                  <CheckCircle size={32} />
                </div>
                <h4 className="text-xl font-black text-foreground mb-2 tracking-tight">
                  {isAr ? 'اكتملت البيانات تقريباً!' : 'Connection Ready'}
                </h4>
                <p className="text-[13px] text-foreground/40 font-medium max-w-sm leading-relaxed">
                  {isAr ? 'لقد قمنا بتحديد المواصفات بذكاء. يمكنك تخصيص كنية جهازك الآن.' : "Our systems have identified your hardware specifications. Finalize with a nickname below."}
                </p>
              </div>

              <div className="space-y-6">
                 <div className="space-y-2">
                    <label className="wf-uppercase-label !text-[11px] font-black text-foreground/40 px-1">{isAr ? 'كنية الجهاز' : 'Device Nickname'}</label>
                    <input 
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData(prevData => ({ ...prevData, name: e.target.value }))}
                      className="w-full bg-white border border-border rounded-md px-5 py-4 font-semibold outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/5 transition-all text-[15px]"
                      placeholder={isAr ? 'مثال: هاتف العمل' : 'e.g. Work Laptop'}
                    />
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="wf-uppercase-label !text-[11px] font-black text-foreground/40 px-1">{isAr ? 'نظام التشغيل' : 'Platform'}</label>
                      <div className="bg-foreground/[0.03] border border-border/10 rounded-md p-3.5 font-black text-foreground/30 uppercase tracking-[0.2em] text-[11px]">
                        {formData.platform || 'Detected'}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="wf-uppercase-label !text-[11px] font-black text-foreground/40 px-1">{isAr ? 'إصدار النظام (اختياري)' : 'OS Version'}</label>
                      <input 
                        type="text"
                        value={formData.osVersion}
                        onChange={(e) => setFormData(prevData => ({ ...prevData, osVersion: e.target.value }))}
                        className="w-full bg-white border border-border rounded-md px-4 py-3 font-semibold outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/5 transition-all text-[13px]"
                        placeholder="e.g. 17.4.1"
                      />
                    </div>
                 </div>
              </div>
            </div>
          )}
        </div>

        <div className="shrink-0 p-6 border-t border-border bg-white/80 backdrop-blur-sm flex justify-between items-center">
          <Button
            variant="ghost"
            onClick={step === 0 ? handleClose : prevStepHandler}
            disabled={isSubmitting || !isOpen}
            className="flex items-center gap-2 text-foreground/50 hover:text-brand-500 font-bold px-4 rounded-md transition-all"
          >
            {isAr ? <AltArrowRight size={20} /> : <AltArrowLeft size={20} />}
            {isAr ? (step === 0 ? 'إلغاء' : 'السابق') : (step === 0 ? 'Cancel' : 'Previous')}
          </Button>

          <div className="flex gap-4">
            {step > 0 && step < 3 && (
               <Button
                  disabled={isSubmitting || !isOpen || (manualMode.brand ? !formData.manufacturer : (step === 2 && !formData.deviceModel))}
                  onClick={nextStep}
                  size="lg"
                  className="rounded-md px-10 font-bold shadow-lg shadow-brand-500/20 active:scale-95 transition-all flex items-center gap-2"
                >
                  {isAr ? 'المتابعة' : 'Continue'}
                  {isAr ? <AltArrowLeft size={20} /> : <AltArrowRight size={20} />}
               </Button>
            )}

            {step === 3 && (
               <Button
                size="lg"
                onClick={handleSubmit}
                isLoading={isSubmitting}
                loadingText={isAr ? 'جاري الإرسال...' : (initialData ? 'Updating...' : 'Finalizing...')}
                disabled={!formData.name || isSubmitting || !isOpen}
                className="rounded-md px-12 font-bold shadow-xl shadow-brand-500/20 min-w-[160px] active:scale-95 transition-all flex items-center justify-center text-sm"
              >
                {initialData ? (
                  isAr ? 'تحديث البيانات' : 'Update Core'
                ) : (
                  isAr ? 'إتمام الربط' : 'Finalize Link'
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}

