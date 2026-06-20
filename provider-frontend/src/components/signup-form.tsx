"use client";

import React, { useState, useEffect, useRef } from 'react';
import { cn, isValidEgyptPhone } from "@/lib/utils"
import { Button } from "@/components/ui/Button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card"
import {
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/Input"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { apiClient } from '@/lib/api';
import toast from 'react-hot-toast';
import { useRouter, Link } from '@/navigation';
import Image from 'next/image';
import {
  CheckCircle,
  CloudUpload,
  AltArrowRight,
  AltArrowLeft,
  Eye,
  EyeClosed,
  AltArrowDown,
  Shop
} from '@solar-icons/react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { reverseGeocode } from '@/lib/geocoding';
import dynamic from 'next/dynamic';

const LocationPicker = dynamic(() => import('@/components/ui/LocationPicker'), {
  ssr: false,
  loading: () => <div className="h-64 bg-slate-100 rounded-wf-lg animate-pulse" />
});

interface Category {
  id: string;
  name: { en: string; ar: string };
}

const TRANSLATIONS = {
  en: {
    stepper: {
      manager: 'Manager',
      brand: 'Brand',
      branches: 'Branches',
    },
    title: {
      1: 'Provider Profile',
      2: 'Brand Identity',
      3: 'Store Setup',
    },
    desc: {
      1: 'Start your journey with Revia',
      2: 'Define your professional brand',
      3: 'Configure your physical locations',
    },
    step1: {
      securityTitle: 'Account Security',
      securityDesc: "Enter the primary manager's credentials.",
      fullName: 'Full Name',
      fullNamePlaceholder: 'e.g. Youssef Nour',
      email: 'Email Address',
      emailPlaceholder: 'manager@revia.com',
      phone: 'Phone Number',
      phonePlaceholder: '01X XXXXXXXX',
      password: 'Password',
      passwordPlaceholder: '••••••••',
    },
    step2: {
      brandEn: 'Brand Name (EN)',
      brandEnPlaceholder: 'My Revia Brand',
      brandAr: 'Brand Name (AR)',
      brandArPlaceholder: 'علامتي التجارية',
      crn: 'Commercial Registry (CRN)',
      crnPlaceholder: 'e.g. 1010XXXXXX',
      tin: 'Tax ID (TIN)',
      tinPlaceholder: 'Enter 15-digit TIN',
      categories: 'Business Categories',
      categoriesDesc: 'Select one or more categories',
      categoriesSearch: 'Search...',
      posLabel: 'Accept card machine payments in-person',
    },
    step3: {
      branchLocations: 'Branch Locations',
      branchLocationsDesc: 'Add at least one physical store',
      addBranchBtn: '+ Add Branch',
      branchNameEn: 'Branch Name (EN)',
      branchNameEnPlaceholder: 'Storefront A',
      branchNameAr: 'Branch Name (AR)',
      branchNameArPlaceholder: 'الفرع أ',
      locationDiscovery: 'Location Discovery',
      locationDiscoveryDesc: 'Pin your exact store location on the map',
      saveBranch: 'Save Branch',
      cancel: 'Cancel',
      brandLogo: 'Official Brand Logo',
      dropLogo: 'Drop brand identity',
      logoHint: 'Optimal: 800x800px PNG/JPG',
      rotateIdentity: 'Rotate Identity',
    },
    footer: {
      alreadyRegistered: 'Already registered?',
      signInHere: 'Sign in here',
      back: 'Back',
      continue: 'Continue',
      finalize: 'Finalize Registration',
    },
    success: {
      title: 'Registration Complete!',
      desc: 'Your provider account has been successfully created. Welcome aboard to the Revia Platform!',
      btn: 'Go to Dashboard',
    }
  },
  ar: {
    stepper: {
      manager: 'المدير',
      brand: 'العلامة التجارية',
      branches: 'الفروع',
    },
    title: {
      1: 'ملف المزود',
      2: 'هوية العلامة التجارية',
      3: 'إعداد المتجر',
    },
    desc: {
      1: 'ابدأ رحلتك مع ريفيا',
      2: 'حدد علامتك التجارية المهنية',
      3: 'قم بتهيئة مواقعك الفعلية',
    },
    step1: {
      securityTitle: 'أمن الحساب',
      securityDesc: 'أدخل بيانات الاعتماد الخاصة بالمدير الأساسي.',
      fullName: 'الاسم الكامل',
      fullNamePlaceholder: 'مثال: يوسف نور',
      email: 'البريد الإلكتروني',
      emailPlaceholder: 'manager@revia.com',
      phone: 'رقم الهاتف',
      phonePlaceholder: '01X XXXXXXXX',
      password: 'كلمة المرور',
      passwordPlaceholder: '••••••••',
    },
    step2: {
      brandEn: 'اسم العلامة التجارية (EN)',
      brandEnPlaceholder: 'My Revia Brand',
      brandAr: 'اسم العلامة التجارية (AR)',
      brandArPlaceholder: 'علامتي التجارية',
      crn: 'السجل التجاري (CRN)',
      crnPlaceholder: 'مثال: 1010XXXXXX',
      tin: 'الرقم الضريبي (TIN)',
      tinPlaceholder: 'أدخل الرقم الضريبي المكون من 15 رقمًا',
      categories: 'فئات العمل التجاري',
      categoriesDesc: 'اختر فئة واحدة أو أكثر',
      categoriesSearch: 'بحث...',
      posLabel: 'قبول دفع جهاز نقاط البيع (POS) حضوريًا',
    },
    step3: {
      branchLocations: 'مواقع الفروع',
      branchLocationsDesc: 'أضف متجراً فعلياً واحداً على الأقل',
      addBranchBtn: '+ إضافة فرع',
      branchNameEn: 'اسم الفرع (EN)',
      branchNameEnPlaceholder: 'Storefront A',
      branchNameAr: 'اسم الفرع (AR)',
      branchNameArPlaceholder: 'الفرع أ',
      locationDiscovery: 'اكتشاف الموقع',
      locationDiscoveryDesc: 'قم بتثبيت موقع متجرك بالضبط على الخريطة',
      saveBranch: 'حفظ الفرع',
      cancel: 'إلغاء',
      brandLogo: 'شعار العلامة التجارية الرسمي',
      dropLogo: 'أسقط هوية العلامة التجارية هنا',
      logoHint: 'الأمثل: 800x800 بكسل PNG/JPG',
      rotateIdentity: 'تغيير الهوية',
    },
    footer: {
      alreadyRegistered: 'مسجل بالفعل؟',
      signInHere: 'سجل الدخول من هنا',
      back: 'رجوع',
      continue: 'متابعة',
      finalize: 'إنهاء التسجيل',
    },
    success: {
      title: 'اكتمل التسجيل!',
      desc: 'تم إنشاء حساب المزود الخاص بك بنجاح. مرحبًا بك في منصة ريفيا!',
      btn: 'الذهاب إلى لوحة التحكم',
    }
  }
};

export function SignupForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter();
  const [step, setStep] = useState(1);

  // Data States
  const [languagePreference, setLanguagePreference] = useState<'ar' | 'en'>('en');
  const s = TRANSLATIONS[languagePreference];
  const [provider, setProvider] = useState({ name: '', email: '', phoneNumber: '', password: '' });
  const [brand, setBrand] = useState({
    nameEn: '',
    nameAr: '',
    crn: '',
    tin: '',
    allowPayUsePOS: false,
    categoryIds: [] as string[]
  });

  interface Branch {
    name: { en: string; ar: string };
    location: { latitude: number; longitude: number };
    address?: string;
  }

  const [branches, setBranches] = useState<Branch[]>([]);
  const [currentBranch, setCurrentBranch] = useState<Branch>({
    name: { en: '', ar: '' },
    location: { latitude: 30.0444, longitude: 31.2357 },
    address: ''
  });

  // File State
  const [showPassword, setShowPassword] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // API States
  const [categories, setCategories] = useState<Category[]>([]);
  const [categorySearch, setCategorySearch] = useState('');
  const [isFetchingCategories, setIsFetchingCategories] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showBranchForm, setShowBranchForm] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await apiClient.get('/category/list?page=1&limit=50');
        if (Array.isArray(res.data?.data)) {
          setCategories(res.data.data);
        }
      } catch (error) {
        console.error('Failed to fetch categories', error);
        toast.error('Failed to load business categories');
      } finally {
        setIsFetchingCategories(false);
      }
    };
    fetchCategories();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const validateStep = () => {
    if (step === 1) {
      if (!provider.name || !provider.email || !provider.phoneNumber || !provider.password) return false;
      if (provider.password.length < 8) {
        toast.error('Password must be at least 8 characters');
        return false;
      }
      if (!isValidEgyptPhone(provider.phoneNumber)) {
        toast.error('Phone number must be 11 digits and start with 010, 011, 012 or 015');
        return false;
      }
    } else if (step === 2) {
      if (!brand.nameEn || !brand.nameAr || !brand.crn || !brand.tin || brand.categoryIds.length === 0) return false;
    } else if (step === 3) {
      if (branches.length === 0 && (!currentBranch.name.en || !currentBranch.name.ar)) {
        toast.error('At least one branch is required');
        return false;
      }
      if (!logoFile) {
        toast.error('Brand logo is required');
        return false;
      }
    }
    return true;
  };

  const addBranch = () => {
    if (!currentBranch.name.en || !currentBranch.name.ar || !currentBranch.location.latitude || !currentBranch.location.longitude) {
      toast.error('Please fill in branch details');
      return;
    }
    setBranches([...branches, currentBranch]);
    setCurrentBranch({
      name: { en: '', ar: '' },
      location: { latitude: 30.0444, longitude: 31.2357 },
      address: ''
    });
    setShowBranchForm(false);
    toast.success('Branch added');
  };

  const removeBranch = (index: number) => {
    setBranches(branches.filter((_, i) => i !== index));
  };

  const nextStep = () => {
    if (validateStep()) {
      setStep((p) => p + 1);
    } else {
      toast.error('Please fill in all required fields');
    }
  };

  const prevStep = () => setStep((p) => p - 1);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Final validation for step 3
    let finalBranches = [...branches];
    if (currentBranch.name.en && currentBranch.name.ar) {
      finalBranches.push(currentBranch);
    }

    if (finalBranches.length === 0) {
      toast.error('Please add at least one branch');
      setIsLoading(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append('languagePreference', languagePreference);
      formData.append('providerData[name]', provider.name);
      formData.append('providerData[email]', provider.email);
      formData.append('providerData[phoneNumber]', provider.phoneNumber);
      formData.append('providerData[password]', provider.password);

      formData.append('brandData[name][en]', brand.nameEn);
      formData.append('brandData[name][ar]', brand.nameAr);
      formData.append('brandData[crn]', brand.crn);
      formData.append('brandData[tin]', brand.tin);
      formData.append('brandData[allowPayUsePOS]', String(brand.allowPayUsePOS));

      brand.categoryIds.forEach((id, index) => {
        formData.append(`brandData[categories][${index}]`, id);
      });

      finalBranches.forEach((b, index) => {
        formData.append(`brandData[branches][${index}][name][en]`, b.name.en);
        formData.append(`brandData[branches][${index}][name][ar]`, b.name.ar);
        formData.append(`brandData[branches][${index}][location][latitude]`, String(b.location.latitude));
        formData.append(`brandData[branches][${index}][location][longitude]`, String(b.location.longitude));
      });

      if (logoFile) {
        formData.append('logo', logoFile);
      }

      // Diagnostic: Log all keys being sent to help debug if it fails again
      const payloadKeys: string[] = [];
      formData.forEach((_, key) => payloadKeys.push(key));
      console.log('Signup payload keys:', payloadKeys);

      await apiClient.post('/auth/signup', formData);

      setIsSuccess(true);
      toast.success('Registration successful!');
    } catch (error: any) {
      console.error('Signup error detailed:', JSON.stringify({
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        headers: error.response?.headers
      }, null, 2));
      toast.error(error.response?.data?.message || error.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <Card dir={languagePreference === 'ar' ? 'rtl' : 'ltr'} className="card-clean p-8 text-center animate-in zoom-in-95 duration-500 shadow-xl border-none">
        <div className="mx-auto w-16 h-16 bg-primary/5 rounded-wf-lg flex items-center justify-center mb-6 border border-primary/10">
          <CheckCircle className="w-10 h-10 text-primary" />
        </div>
        <CardTitle className="text-2xl font-bold text-slate-900 mb-3">{s.success.title}</CardTitle>
        <CardDescription className="text-slate-500 text-base mb-8 max-w-[320px] mx-auto leading-relaxed">
          {s.success.desc}
        </CardDescription>
        <Button onClick={() => router.push('/login')} className="w-full h-12 text-base font-bold transition-all rounded-wf-lg">
          {s.success.btn}
        </Button>
      </Card>
    );
  }

  return (
    <div dir={languagePreference === 'ar' ? 'rtl' : 'ltr'} className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="card-clean border-none shadow-2xl md:shadow-xl overflow-hidden rounded-wf-lg bg-white/80 backdrop-blur-md">
        <CardHeader className="text-center pt-10 pb-6 relative border-b border-slate-100/50">
          {/* Technical Line Stepper */}
          <div className="w-full max-w-md mx-auto mb-10 px-4">
            <div className="flex items-center justify-between mb-3 animate-in fade-in duration-500">
              {[1, 2, 3].map((i) => (
                <div 
                  key={i} 
                  className={cn(
                    "text-[10px] font-black uppercase tracking-[0.2em] transition-colors duration-500",
                    step >= i ? "text-primary" : "text-slate-300"
                  )}
                >
                  {i === 1 ? s.stepper.manager : i === 2 ? s.stepper.brand : s.stepper.branches}
                </div>
              ))}
            </div>
            <div className="relative h-[2px] w-full bg-slate-100 rounded-full overflow-hidden">
              <div 
                className="absolute inset-y-0 left-0 bg-primary transition-all duration-700 ease-[var(--ease-out-expo)]"
                style={{ width: `${((step - 1) / 2) * 100}%` }}
              />
              <div className="absolute inset-0 flex justify-between">
                {[1, 2, 3].map((i) => (
                  <div 
                    key={i} 
                    className={cn(
                      "size-1.5 rounded-full transition-all duration-500 delay-300",
                      step >= i ? "bg-primary scale-125" : "bg-slate-200"
                    )}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-center mb-6">
            <div className="inline-flex items-center p-1 bg-slate-100/50 rounded-lg border border-slate-200/50">
              <button
                type="button"
                onClick={() => setLanguagePreference('ar')}
                className={cn(
                  "px-5 py-2 rounded-md text-[10px] font-black uppercase tracking-wider transition-all",
                  languagePreference === 'ar' ? "bg-white text-primary shadow-sm" : "text-slate-400 hover:text-slate-600"
                )}
              >
                العربية
              </button>
              <button
                type="button"
                onClick={() => setLanguagePreference('en')}
                className={cn(
                  "px-5 py-2 rounded-md text-[10px] font-black uppercase tracking-wider transition-all",
                  languagePreference === 'en' ? "bg-white text-primary shadow-sm" : "text-slate-400 hover:text-slate-600"
                )}
              >
                English
              </button>
            </div>
          </div>

          <CardTitle className="text-2xl font-bold tracking-tighter text-slate-950 font-display">
            {step === 1 ? s.title[1] : step === 2 ? s.title[2] : s.title[3]}
          </CardTitle>
          <CardDescription className="text-slate-500 text-sm mt-1 font-medium italic">
            {step === 1 ? s.desc[1] : step === 2 ? s.desc[2] : s.desc[3]}
          </CardDescription>
        </CardHeader>

        <CardContent className="pb-8 relative">
          <form onSubmit={step === 3 ? handleSubmit : (e) => { e.preventDefault(); nextStep(); }} className="space-y-6">
            <div className="min-h-[280px]">
              {step === 1 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 animate-in fade-in slide-in-from-right-4 duration-700 ease-[var(--ease-out-expo)]">
                  <div className="col-span-1 md:col-span-2 p-4 bg-primary/5 rounded-wf-lg border border-primary/10 mb-2 text-start">
                    <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-1 font-ui">{s.step1.securityTitle}</p>
                    <p className="text-xs text-slate-500 font-medium leading-relaxed">{s.step1.securityDesc}</p>
                  </div>
                  <div className="space-y-2 group/field text-start">
                    <FieldLabel htmlFor="fullName" className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 group-focus-within/field:text-primary transition-colors font-ui">{s.step1.fullName}</FieldLabel>
                    <Input
                      id="fullName"
                      value={provider.name}
                      onChange={e => setProvider({ ...provider, name: e.target.value })}
                      placeholder={s.step1.fullNamePlaceholder}
                      required
                      className="h-12 bg-slate-50/50 border-slate-200 focus:bg-white transition-all text-base px-4 rounded-wf border-wf-border shadow-sm shadow-black/[0.02]"
                    />
                  </div>
                  <div className="space-y-2 group/field text-start">
                    <FieldLabel htmlFor="email" className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 group-focus-within/field:text-primary transition-colors font-ui">{s.step1.email}</FieldLabel>
                    <Input
                      id="email"
                      type="email"
                      value={provider.email}
                      onChange={e => setProvider({ ...provider, email: e.target.value })}
                      placeholder={s.step1.emailPlaceholder}
                      required
                      className="h-12 bg-slate-50/50 border-slate-200 focus:bg-white transition-all text-base px-4 rounded-wf border-wf-border shadow-sm shadow-black/[0.02]"
                    />
                  </div>
                  <div className="space-y-2 group/field text-start">
                    <FieldLabel htmlFor="phone" className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 group-focus-within/field:text-primary transition-colors font-ui">{s.step1.phone}</FieldLabel>
                    <Input
                      id="phone"
                      type="tel"
                      value={provider.phoneNumber}
                      onChange={e => setProvider({ ...provider, phoneNumber: e.target.value.replace(/\D/g, '') })}
                      placeholder={s.step1.phonePlaceholder}
                      required
                      minLength={11}
                      maxLength={11}
                      className="h-12 bg-slate-50/50 border-slate-200 focus:bg-white transition-all text-base px-4 rounded-wf border-wf-border shadow-sm shadow-black/[0.02]"
                    />
                  </div>
                  <div className="space-y-2 group/field text-start">
                    <FieldLabel htmlFor="password" className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 group-focus-within/field:text-primary transition-colors font-ui">{s.step1.password}</FieldLabel>
                    <div className="relative group/input">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={provider.password}
                        onChange={e => setProvider({ ...provider, password: e.target.value })}
                        placeholder={s.step1.passwordPlaceholder}
                        className={cn("h-12 bg-slate-50/50 border-slate-200 focus:bg-white transition-all text-base px-4 rounded-wf border-wf-border shadow-sm shadow-black/[0.02]", languagePreference === 'ar' ? "pl-12 pr-4" : "pr-12 pl-4")}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className={cn("absolute top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary transition-colors focus:outline-none", languagePreference === 'ar' ? "left-4" : "right-4")}
                      >
                        {showPassword ? <EyeClosed className="size-5" /> : <Eye className="size-5" />}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 animate-in fade-in slide-in-from-right-4 duration-700 ease-[var(--ease-out-expo)]">
                  <div className="space-y-2 group/field text-start">
                    <FieldLabel htmlFor="brandEn" className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 group-focus-within/field:text-primary transition-colors font-ui">{s.step2.brandEn}</FieldLabel>
                    <Input
                      id="brandEn"
                      value={brand.nameEn}
                      onChange={e => setBrand({ ...brand, nameEn: e.target.value })}
                      placeholder={s.step2.brandEnPlaceholder}
                      required
                      className="h-12 bg-slate-50/50 border-slate-200 focus:bg-white transition-all text-base px-4 rounded-wf border-wf-border shadow-sm shadow-black/[0.02]"
                    />
                  </div>
                  <div className="space-y-2 group/field text-start">
                    <FieldLabel htmlFor="brandAr" className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 group-focus-within/field:text-primary transition-colors font-ui text-start">{s.step2.brandAr}</FieldLabel>
                    <Input
                      id="brandAr"
                      value={brand.nameAr}
                      onChange={e => setBrand({ ...brand, nameAr: e.target.value })}
                      placeholder={s.step2.brandArPlaceholder}
                      required
                      dir="rtl"
                      className="h-12 bg-slate-50/50 border-slate-200 focus:bg-white transition-all text-base px-4 rounded-wf border-wf-border text-start shadow-sm shadow-black/[0.02]"
                    />
                  </div>
                  <div className="space-y-2 group/field text-start">
                    <FieldLabel htmlFor="crn" className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 group-focus-within/field:text-primary transition-colors font-ui">{s.step2.crn}</FieldLabel>
                    <Input
                      id="crn"
                      value={brand.crn}
                      onChange={e => setBrand({ ...brand, crn: e.target.value })}
                      placeholder={s.step2.crnPlaceholder}
                      required
                      className="h-12 bg-slate-50/50 border-slate-200 focus:bg-white transition-all text-base px-4 rounded-wf border-wf-border shadow-sm shadow-black/[0.02]"
                    />
                  </div>
                  <div className="space-y-2 group/field text-start">
                    <FieldLabel htmlFor="tin" className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 group-focus-within/field:text-primary transition-colors font-ui">{s.step2.tin}</FieldLabel>
                    <Input
                      id="tin"
                      value={brand.tin}
                      onChange={e => setBrand({ ...brand, tin: e.target.value })}
                      placeholder={s.step2.tinPlaceholder}
                      required
                      className="h-12 bg-slate-50/50 border-slate-200 focus:bg-white transition-all text-base px-4 rounded-wf border-wf-border shadow-sm shadow-black/[0.02]"
                    />
                  </div>
                  <div className="col-span-1 md:col-span-2 space-y-4 group/field bg-slate-50/50 p-6 rounded-wf-lg border border-slate-100 text-start">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <FieldLabel className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 group-focus-within/field:text-primary transition-colors font-ui">{s.step2.categories}</FieldLabel>
                        <p className="text-[10px] text-slate-500 font-medium">{s.step2.categoriesDesc}</p>
                      </div>
                      <div className="relative">
                        <Input
                          placeholder={s.step2.categoriesSearch}
                          value={categorySearch}
                          onChange={(e) => setCategorySearch(e.target.value)}
                          className="h-9 text-xs w-full md:w-40 bg-white border-wf-border rounded-wf"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar min-h-[100px]">
                      {isFetchingCategories ? (
                        Array.from({ length: 4 }).map((_, i) => (
                          <div key={i} className="h-20 bg-white/50 rounded-wf animate-pulse border border-slate-100" />
                        ))
                      ) : categories
                        .filter(c =>
                          c.name.en.toLowerCase().includes(categorySearch.toLowerCase()) ||
                          c.name.ar.includes(categorySearch)
                        )
                        .map(c => {
                          const isSelected = brand.categoryIds.includes(c.id);
                          return (
                            <div
                              key={c.id}
                              onClick={() => {
                                if (isSelected) {
                                  setBrand({ ...brand, categoryIds: brand.categoryIds.filter(id => id !== c.id) });
                                } else {
                                  setBrand({ ...brand, categoryIds: [...brand.categoryIds, c.id] });
                                }
                              }}
                              className={cn(
                                "flex flex-col items-center justify-center p-4 rounded-wf border transition-all cursor-pointer text-center gap-2",
                                isSelected
                                  ? "bg-primary/5 border-primary shadow-sm ring-1 ring-primary/20 scale-[0.98]"
                                  : "bg-white border-wf-border hover:border-primary/40 hover:bg-slate-50"
                              )}
                            >
                              <Shop className={cn("size-5", isSelected ? "text-primary" : "text-slate-300")} />
                              <div className="flex flex-col gap-0.5">
                                <span className={cn("text-[10px] font-black uppercase tracking-tight truncate max-w-[80px]", isSelected ? "text-primary" : "text-slate-700")}>
                                  {languagePreference === 'ar' ? c.name.ar : c.name.en}
                                </span>
                                <span className={cn("text-[9px] font-medium opacity-60 truncate max-w-[80px]", isSelected ? "text-primary/70" : "text-slate-400")}>
                                  {languagePreference === 'ar' ? c.name.en : c.name.ar}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                  <div className="col-span-1 md:col-span-2 flex items-center gap-3 p-4 bg-primary/5 rounded-wf-lg border border-primary/10 transition-all hover:bg-primary/10 group/checkbox text-start">
                    <Checkbox
                      id="pos"
                      checked={brand.allowPayUsePOS}
                      onCheckedChange={(checked) => setBrand({ ...brand, allowPayUsePOS: checked === true })}
                      className="size-5 rounded-wf border-primary/50 data-[state=checked]:bg-primary"
                    />
                    <Label htmlFor="pos" className="text-xs font-black uppercase tracking-widest text-slate-700 cursor-pointer select-none group-hover/checkbox:text-primary transition-colors">{s.step2.posLabel}</Label>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-700 ease-[var(--ease-out-expo)]">
                  <div className="space-y-6">
                    <div className="flex items-center justify-between border-b border-slate-100/50 pb-3 text-start">
                      <div className="space-y-0.5">
                        <FieldLabel className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 font-ui">{s.step3.branchLocations}</FieldLabel>
                        <p className="text-[10px] text-slate-400 font-medium">{s.step3.branchLocationsDesc}</p>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setShowBranchForm(true)}
                        className="h-8 text-[10px] font-black uppercase tracking-widest rounded-wf border-primary/20 text-primary hover:bg-primary/5"
                      >
                        {s.step3.addBranchBtn}
                      </Button>
                    </div>

                    {branches.length > 0 && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-start">
                        {branches.map((b, i) => (
                          <div key={i} className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-wf-lg shadow-sm animate-in slide-in-from-bottom-2 transition-all hover:border-primary/20 group/branch">
                            <div className="flex items-center gap-3">
                              <div className="size-10 bg-primary/5 rounded-wf flex items-center justify-center text-primary border border-primary/10 group-hover/branch:bg-primary group-hover/branch:text-white transition-colors duration-300">
                                <Shop className="size-5" />
                              </div>
                              <div className="flex flex-col gap-0.5">
                                <span className="text-xs font-black uppercase tracking-tight text-slate-800">{languagePreference === 'ar' ? b.name.ar : b.name.en}</span>
                                <span className="text-[9px] text-slate-400 font-medium truncate max-w-[140px]">{b.address}</span>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeBranch(i)}
                              className="size-8 flex items-center justify-center text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-wf transition-all"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {showBranchForm && (
                      <div className="p-6 bg-slate-50/50 border border-slate-200 rounded-wf-lg space-y-6 animate-in fade-in zoom-in-95 duration-500 shadow-inner text-start">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2 group/field">
                            <FieldLabel className="text-[10px] font-black uppercase tracking-[0.1em] text-slate-400 font-ui">{s.step3.branchNameEn}</FieldLabel>
                            <Input
                              value={currentBranch.name.en}
                              onChange={e => setCurrentBranch({ ...currentBranch, name: { ...currentBranch.name, en: e.target.value } })}
                              placeholder={s.step3.branchNameEnPlaceholder}
                              className="h-10 text-xs bg-white border-wf-border rounded-wf text-start"
                            />
                          </div>
                          <div className="space-y-2 group/field">
                            <FieldLabel className="text-[10px] font-black uppercase tracking-[0.1em] text-slate-400 font-ui text-start">{s.step3.branchNameAr}</FieldLabel>
                            <Input
                              value={currentBranch.name.ar}
                              onChange={e => setCurrentBranch({ ...currentBranch, name: { ...currentBranch.name, ar: e.target.value } })}
                              placeholder={s.step3.branchNameArPlaceholder}
                              dir="rtl"
                              className="h-10 text-xs bg-white text-start border-wf-border rounded-wf"
                            />
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div className="flex flex-col gap-1 px-1">
                            <FieldLabel className="text-[10px] font-black uppercase tracking-[0.1em] text-slate-400 font-ui">{s.step3.locationDiscovery}</FieldLabel>
                            <p className="text-[10px] text-slate-400 font-medium italic">{s.step3.locationDiscoveryDesc}</p>
                          </div>
                          <div className="rounded-wf-lg overflow-hidden border border-slate-200 shadow-sm relative group/map">
                            <LocationPicker
                              initialLat={currentBranch.location.latitude}
                              initialLng={currentBranch.location.longitude}
                              onLocationSelect={async (lat, lng) => {
                                const address = await reverseGeocode(lat, lng);
                                setCurrentBranch({
                                  ...currentBranch,
                                  location: { latitude: lat, longitude: lng },
                                  address
                                });
                              }}
                            />
                          </div>
                        </div>

                        <div className="flex gap-3 pt-2">
                          <Button
                            type="button"
                            className="flex-1 h-11 text-xs font-black uppercase tracking-widest rounded-wf-lg shadow-lg shadow-primary/20 bg-primary hover:bg-primary-vibrant text-white"
                            onClick={addBranch}
                          >
                            {s.step3.saveBranch}
                          </Button>
                          {branches.length > 0 && (
                            <Button
                              type="button"
                              variant="ghost"
                              className="h-11 text-xs font-black uppercase tracking-widest rounded-wf-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                              onClick={() => setShowBranchForm(false)}
                            >
                              {s.step3.cancel}
                            </Button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-4 text-start">
                    <FieldLabel className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 font-ui px-1">{s.step3.brandLogo}</FieldLabel>
                    <div
                      className="border-2 border-dashed border-slate-200 rounded-wf-lg p-10 flex flex-col items-center justify-center bg-slate-50/50 hover:bg-white hover:border-primary hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500 cursor-pointer group/upload overflow-hidden relative"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      {logoPreview ? (
                        <div className="flex flex-col items-center gap-6 relative z-10 animate-in zoom-in-95 duration-700">
                          <div className="relative group/preview">
                            <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full opacity-0 group-hover/preview:opacity-100 transition-opacity duration-700" />
                            <img src={logoPreview} alt="Logo preview" className="size-40 object-contain rounded-wf-lg shadow-2xl border-4 border-white relative z-10 transition-transform duration-700 group-hover/preview:scale-110" />
                            <div className="absolute -top-3 -right-3 size-10 bg-primary rounded-full flex items-center justify-center text-white shadow-xl z-20 border-2 border-white">
                              <CheckCircle className="size-6" />
                            </div>
                          </div>
                          <span className="text-[10px] font-black uppercase tracking-widest text-primary px-6 py-2.5 bg-primary/5 rounded-full hover:bg-primary/10 transition-colors border border-primary/10">{s.step3.rotateIdentity}</span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-4 text-slate-300 text-center relative z-10">
                          <div className="size-20 bg-white rounded-wf-lg flex items-center justify-center shadow-sm border border-slate-100 group-hover/upload:scale-110 group-hover/upload:shadow-xl group-hover/upload:border-primary/20 transition-all duration-700">
                            <CloudUpload className="size-10 text-slate-200 group-hover/upload:text-primary transition-colors duration-500" />
                          </div>
                          <div className="space-y-1.5 px-4">
                            <p className="text-xs font-black uppercase tracking-widest text-slate-700">{s.step3.dropLogo}</p>
                            <p className="text-[10px] font-medium text-slate-400">{s.step3.logoHint}</p>
                          </div>
                        </div>
                      )}
                      <input type="file" className="hidden" ref={fileInputRef} accept="image/jpeg, image/png, image/webp" onChange={handleFileChange} />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between pt-10 gap-4 border-t border-slate-100/50 mt-4">
              {step > 1 ? (
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={prevStep} 
                  disabled={isLoading} 
                  className="flex-1 sm:flex-initial px-8 h-12 text-sm font-black uppercase tracking-widest bg-white border-slate-200 hover:bg-slate-50 transition-all rounded-wf-lg animate-in fade-in duration-500"
                >
                  <AltArrowLeft className={cn("size-4", languagePreference === 'ar' ? "ml-2" : "mr-2")} />
                  {s.footer.back}
                </Button>
              ) : (
                <div className="hidden sm:block" />
              )}

              <Button 
                type="submit" 
                isLoading={isLoading} 
                className="flex-1 sm:flex-initial px-10 h-12 text-sm font-black uppercase tracking-[0.2em] active:scale-[0.98] transition-all rounded-wf-lg shadow-xl shadow-primary/20 bg-primary hover:bg-primary-vibrant text-white"
              >
                {step === 3 ? s.footer.finalize : s.footer.continue}
                {step < 3 && <AltArrowRight className={cn("size-4", languagePreference === 'ar' ? "mr-2" : "ml-2")} />}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
      {step === 1 && (
        <div className="flex items-center justify-center gap-2 px-6 animate-in fade-in duration-500">
          <span className="text-[10px] text-white/60 font-black uppercase tracking-widest">{s.footer.alreadyRegistered}</span>
          <Link href="/login" className="text-[10px] font-black text-white uppercase tracking-widest hover:text-primary-light transition-colors underline underline-offset-4">{s.footer.signInHere}</Link>
        </div>
      )}
    </div>
  )
}
