"use client"

import React, { useState, useEffect, useRef } from 'react';
import { getMediaUrl, apiClient } from '@/lib/api';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/skeleton';
import toast from 'react-hot-toast';
import { BrandReview } from '@/types/brand';
import { cn } from '@/lib/utils';
import { 
  Hashtag, 
  Diskette, 
  Camera, 
  Palette, 
  Shop,
  MapPoint,
  AddCircle,
  Pen,
  CloseCircle,
  CheckCircle,
  Settings,
  Star,
  ChatLine
} from '@solar-icons/react';
import { Portal } from '@/components/ui/Portal';
import { LocationName } from '@/components/ui/LocationName';
import dynamic from 'next/dynamic';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';

const LocationPicker = dynamic(() => import('@/components/ui/LocationPicker'), { 
  ssr: false,
  loading: () => <div className="h-64 bg-slate-100 rounded-wf-lg animate-pulse" />
});

interface Branch {
  id?: string;
  name: { en: string; ar: string };
  location: { latitude: number; longitude: number };
  isActive: boolean;
}

type Tab = 'brand' | 'branches' | 'reviews';

export default function BrandPage() {
    const t = useTranslations('Brand');
    const locale = useLocale();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();

    const currentTab = (searchParams.get('tab') as Tab) || 'brand';
    const [activeTab, setActiveTab] = useState<Tab>(currentTab);

    useEffect(() => {
        if (currentTab !== activeTab) {
            setActiveTab(currentTab);
        }
    }, [currentTab]);

    const handleTabChange = (tab: Tab) => {
        setActiveTab(tab);
        const params = new URLSearchParams(searchParams.toString());
        params.set('tab', tab);
        router.push(`${pathname}?${params.toString()}`, { scroll: false });
    };

    const [formData, setFormData] = useState({
        nameEn: '',
        nameAr: '',
        allowPayUsePOS: false,
        tags: [] as string[]
    });
    const [logo, setLogo] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(true);

    const [branches, setBranches] = useState<Branch[]>([]);
    const [showBranchModal, setShowBranchModal] = useState(false);
    const [editingBranchIndex, setEditingBranchIndex] = useState<number | null>(null);
    const [branchForm, setBranchForm] = useState({
        nameEn: '', nameAr: '', lat: '', lng: '', isActive: true,
    });
    const [isBranchSubmitting, setIsBranchSubmitting] = useState(false);

    const [reviews, setReviews] = useState<any[]>([]);
    const [isFetchingReviews, setIsFetchingReviews] = useState(false);

    const [brandMeta, setBrandMeta] = useState({
        rating: 0,
        ratingCount: 0,
        completedRepairs: 0,
        crn: '',
        tin: '',
    });

    const TECH_TAGS = [
      "Phones", "Laptops", "Apple", "Samsung", "Xiaomi", "Oppo", "Huawei", "Android", "iOS",
      "Mac", "Windows", "Linux", "Pixel", "Tablet", "Screen Repair", "Battery", "Charging Port",
      "Motherboard", "Water Damage", "Software", "Hardware", "Data Recovery", "Asus", "HP", "Dell", "Lenovo"
    ];

    const fetchBrand = async () => {
        setIsFetching(true);
        try {
            const res = await apiClient.get('/brand');
            const data = res.data.data;
            setFormData({
                nameEn: data.name?.en || '',
                nameAr: data.name?.ar || '',
                allowPayUsePOS: data.allowPayUsePOS || false,
                tags: data.tags || []
            });
            setBrandMeta({
                rating: data.rating || 0,
                ratingCount: data.ratingCount || 0,
                completedRepairs: data.completedRepairs || 0,
                crn: data.crn || '',
                tin: data.tin || '',
            });
            if (data.logo) setPreviewUrl(getMediaUrl(data.logo));
            if (data.branches) setBranches(data.branches);
        } catch (error) {
            console.error('Failed to fetch brand', error);
        } finally {
            setIsFetching(false);
        }
    };

    const fetchReviews = async () => {
        setIsFetchingReviews(true);
        try {
            const res = await apiClient.get('/brand/reviews');
            setReviews(Array.isArray(res.data.data) ? res.data.data : []);
        } catch (error) {
            console.error('Failed to fetch reviews', error);
        } finally {
            setIsFetchingReviews(false);
        }
    };

    useEffect(() => {
        fetchBrand();
    }, []);

    useEffect(() => {
        if (activeTab === 'reviews') {
            fetchReviews();
        }
    }, [activeTab]);

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setLogo(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleBrandSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        const data = new FormData();
        data.append('name[en]', formData.nameEn);
        data.append('name[ar]', formData.nameAr);
        data.append('allowPayUsePOS', String(formData.allowPayUsePOS));
        
        formData.tags.forEach((tag, i) => {
          data.append(`tags[${i}]`, tag);
        });

        if (logo) data.append('logo', logo);
        
        try {
            const res = await apiClient.put('/brand/update', data);
            const updated = res.data.data;
            
            setFormData({
                nameEn: updated.name?.en || '',
                nameAr: updated.name?.ar || '',
                allowPayUsePOS: updated.allowPayUsePOS,
                tags: updated.tags || []
            });
            if (updated.logo) setPreviewUrl(getMediaUrl(updated.logo));
            
            toast.success(t('actions.saveSuccess') || 'Updated');
        } catch (error: any) {
            console.error('Brand update error', error);
            toast.error(error.response?.data?.message || 'Failed');
        } finally {
            setIsLoading(false);
        }
    };

    const openCreateBranch = () => {
        setEditingBranchIndex(null);
        setBranchForm({ nameEn: '', nameAr: '', lat: '', lng: '', isActive: true });
        setShowBranchModal(true);
    };

    const openEditBranch = (branch: Branch, index: number) => {
        setEditingBranchIndex(index);
        setBranchForm({
            nameEn: branch.name.en,
            nameAr: branch.name.ar,
            lat: String(branch.location.latitude),
            lng: String(branch.location.longitude),
            isActive: branch.isActive,
        });
        setShowBranchModal(true);
    };

    const handleBranchSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsBranchSubmitting(true);
        const payload = {
            name: { en: branchForm.nameEn, ar: branchForm.nameAr },
            location: { latitude: Number(branchForm.lat), longitude: Number(branchForm.lng) },
            isActive: branchForm.isActive,
        };
        try {
            let res;
            if (editingBranchIndex !== null) {
                res = await apiClient.patch(`/branch/${editingBranchIndex}/update`, payload);
            } else {
                res = await apiClient.post('/branch', payload);
            }
            toast.success(editingBranchIndex !== null ? 'Updated' : 'Created');
            setShowBranchModal(false);
            if (res.data.data.branches) setBranches(res.data.data.branches);
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed');
        } finally {
            setIsBranchSubmitting(false);
        }
    };

    if (isFetching) {
        return (
            <div className="p-3 md:p-6 space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto">
                <div className="pb-8 border-b border-wf-border flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <Skeleton className="size-10 rounded-wf" />
                            <Skeleton className="h-10 w-64" />
                        </div>
                        <Skeleton className="h-4 w-48" />
                    </div>
                    <Skeleton className="h-10 w-40 rounded-wf" />
                </div>

                <div className="flex gap-2 p-1 bg-slate-50 rounded-wf w-fit border border-wf-border">
                    <Skeleton className="h-10 w-32 rounded-wf" />
                    <Skeleton className="h-10 w-32 rounded-wf" />
                    <Skeleton className="h-10 w-32 rounded-wf" />
                </div>

                <div className="flex flex-col lg:flex-row gap-8 items-start">
                    <div className="w-full lg:w-[320px] shrink-0 space-y-6">
                        <Card className="p-6 space-y-8 border border-wf-border bg-white rounded-wf">
                            <Skeleton className="size-44 rounded-wf mx-auto" />
                            <div className="space-y-4">
                                <Skeleton className="h-8 w-3/4 mx-auto" />
                                <div className="space-y-2">
                                    <Skeleton className="h-8 w-full rounded-wf" />
                                    <Skeleton className="h-8 w-full rounded-wf" />
                                    <Skeleton className="h-8 w-full rounded-wf" />
                                </div>
                            </div>
                        </Card>
                        <Skeleton className="h-16 w-full rounded-wf" />
                    </div>

                    <div className="flex-1 w-full">
                        <Card className="p-6 md:p-10 space-y-10 border border-wf-border bg-white rounded-wf">
                            <div className="space-y-6">
                                <Skeleton className="h-8 w-48" />
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                                    <div className="space-y-3"><Skeleton className="h-3 w-24" /><Skeleton className="h-12 w-full rounded-wf" /></div>
                                    <div className="space-y-3"><Skeleton className="h-3 w-24" /><Skeleton className="h-12 w-full rounded-wf" /></div>
                                </div>
                            </div>
                            <div className="space-y-6">
                                <Skeleton className="h-8 w-48" />
                                <div className="flex flex-wrap gap-2">
                                    {Array.from({ length: 12 }).map((_, i) => <Skeleton key={i} className="h-8 w-24 rounded-wf" />)}
                                </div>
                            </div>
                            <div className="space-y-6">
                                <Skeleton className="h-8 w-48" />
                                <Skeleton className="h-20 w-full rounded-wf" />
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-3 md:p-6 space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-7xl mx-auto pb-24 md:pb-6">
        <div className="pb-8 border-b border-wf-border flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2 text-start">
            <div className="flex items-center gap-3">
              <div className="size-10 bg-primary/10 text-primary rounded-wf flex items-center justify-center">
                <Shop className="size-6" />
              </div>
              <h1 className="text-3xl md:text-5xl font-black text-wf-near-black tracking-tighter uppercase leading-none">
                {t('title')}
              </h1>
            </div>
            <p className="text-[11px] text-wf-gray-300 font-black uppercase tracking-[0.2em] leading-none opacity-80">
              {t('subtitle')}
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-6 text-[10px] font-black text-wf-gray-300 uppercase tracking-widest opacity-40">
              <div className="flex items-center gap-2">
                <div className="size-1 bg-indigo-500 rounded-full" />
                {t('status.network')}
              </div>
              <div className="flex items-center gap-2">
                <div className="size-1 bg-amber-500 rounded-full" />
                {t('status.profile')}
              </div>
            </div>
            <div className="flex items-center gap-3 px-5 py-2.5 bg-slate-50 border border-wf-border rounded-wf text-[11px] font-black text-wf-near-black uppercase tracking-widest transition-all hover:bg-white hover:border-primary shadow-sm">
              <div className="size-2 bg-emerald-500 rounded-full animate-pulse" />
              {t('status.verified')}
            </div>
          </div>
        </div>

            <div className="overflow-x-auto pb-2 -mx-3 px-3 scrollbar-hide">
              <div className="flex gap-1 p-1 bg-slate-50 rounded-wf w-fit border border-wf-border min-w-max">
                  {(['brand', 'branches', 'reviews'] as const).map((tab) => (
                      <button
                          key={tab}
                          onClick={() => handleTabChange(tab)}
                          className={cn(
                            "px-5 md:px-6 py-2 md:py-2.5 rounded-wf text-[10px] md:text-xs font-black capitalize transition-all duration-300 tracking-widest uppercase border border-transparent",
                            activeTab === tab 
                              ? "bg-primary text-white border-primary" 
                              : "text-wf-gray-300 hover:text-primary hover:bg-primary/5"
                          )}
                      >
                          {tab === 'brand' ? t('tabs.brand') : tab === 'branches' ? t('tabs.branches', { count: branches.length }) : t('tabs.reviews')}
                      </button>
                  ))}
              </div>
            </div>

            {/* ===== BRAND TAB ===== */}
            {activeTab === 'brand' && (
                <div className="flex flex-col lg:flex-row gap-8 items-start">
                    <div className="w-full lg:w-[320px] shrink-0 space-y-6">
                        <Card className="border border-wf-border bg-white rounded-wf overflow-hidden">
                            <div className="p-6 space-y-8">
                                <div className="relative group mx-auto w-fit">
                                    <div className="size-44 bg-slate-50 rounded-wf flex items-center justify-center border border-wf-border overflow-hidden transition-all duration-500 group-hover:bg-white group-hover:border-primary">
                                        {previewUrl ? (
                                            <div className="relative w-full h-full p-4 group-hover:scale-105 transition-transform duration-500">
                                                <Image
                                                    src={previewUrl}
                                                    alt="Logo Preview"
                                                    fill
                                                    unoptimized
                                                    className="object-contain"
                                                />
                                            </div>
                                        ) : (
                                            <Shop className="size-16 text-slate-200" />
                                        )}
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        className={cn("absolute -bottom-1 p-3 bg-cyan-500 text-white rounded-wf hover:bg-primary transition-all border border-wf-border", locale === 'ar' ? "-left-1" : "-right-1")}
                                    >
                                        <Camera className="size-5" />
                                    </button>
                                    <input type="file" ref={fileInputRef} onChange={handleLogoChange} accept="image/*" className="hidden" />
                                </div>

                                <div className="space-y-4 text-center">
                                    <h3 className="text-3xl font-black text-wf-near-black tracking-tighter leading-none">{locale === 'ar' ? formData.nameAr : formData.nameEn || t('generic')}</h3>
                                    <div className="flex flex-col gap-2">
                                      <div className="px-4 py-2 bg-indigo-50/50 text-indigo-600 text-[10px] font-black rounded-wf border border-indigo-100 uppercase tracking-widest flex justify-between items-center">
                                        <span className="opacity-60">{t('labels.legalId')}</span>
                                        <span>CRN: {brandMeta.crn || 'N/A'}</span>
                                      </div>
                                      <div className="px-4 py-2 bg-amber-50/50 text-amber-600 text-[10px] font-black rounded-wf border border-indigo-100 uppercase tracking-widest flex justify-between items-center">
                                        <span className="opacity-60">{t('labels.rating')}</span>
                                        <div className="flex items-center gap-1.5">
                                            <Star className="size-3 fill-amber-500 text-amber-500" />
                                            {brandMeta.rating} ({brandMeta.ratingCount})
                                        </div>
                                      </div>
                                      <div className="px-4 py-2 bg-emerald-50/50 text-emerald-600 text-[10px] font-black rounded-wf border border-emerald-100 uppercase tracking-widest flex justify-between items-center">
                                        <span className="opacity-60">{t('labels.history')}</span>
                                        <span>{t('labels.jobs', { count: brandMeta.completedRepairs })}</span>
                                      </div>
                                    </div>
                                </div>
                            </div>
                        </Card>
                        
                        <div className="p-5 bg-blue-50/30 border border-primary/10 rounded-wf text-start">
                             <p className="text-[10px] font-black text-primary uppercase tracking-widest leading-none mb-1">{t('status.system')}</p>
                             <p className="text-sm font-black text-wf-near-black tracking-tighter">{t('status.account')}</p>
                        </div>
                    </div>

                    <div className="flex-1 w-full">
                        <form onSubmit={handleBrandSubmit} className="space-y-8">
                            <Card className="border border-wf-border bg-white rounded-wf overflow-hidden">
                              <CardContent className="p-6 md:p-10 space-y-10">
                                <div className="space-y-6">
                                    <div className="flex items-center gap-3 pb-4 border-b border-wf-border">
                                        <div className="size-8 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center">
                                            <Hashtag className="size-4" />
                                        </div>
                                        <h4 className="text-lg font-black text-wf-near-black tracking-tighter uppercase">{t('labels.legal')}</h4>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                                        <div className="space-y-3 text-start">
                                            <label className="text-[11px] font-black text-wf-gray-300 uppercase tracking-widest">{t('labels.nameEn')}</label>
                                            <Input 
                                              className="h-12 text-sm font-black rounded-wf bg-slate-50 border-wf-border focus:bg-white transition-all" 
                                              placeholder={t('labels.placeholderEn')}
                                              value={formData.nameEn} 
                                              onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })} 
                                              required 
                                            />
                                        </div>
                                        <div className="space-y-3 text-start">
                                            <label className={cn("text-[11px] font-black text-wf-gray-300 uppercase tracking-widest block", locale === 'ar' ? "text-start" : "text-end")}>{t('labels.nameAr')}</label>
                                            <Input 
                                              className="h-12 text-sm font-black rounded-wf bg-slate-50 border-wf-border focus:bg-white text-right transition-all" 
                                              placeholder={t('labels.placeholderAr')}
                                              value={formData.nameAr} 
                                              onChange={(e) => setFormData({ ...formData, nameAr: e.target.value })} 
                                              dir="rtl" 
                                              required 
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div className="flex items-center gap-3 pb-4 border-b border-wf-border">
                                        <div className="size-8 bg-blue-50 text-primary rounded-lg flex items-center justify-center">
                                            <Palette className="size-4" />
                                        </div>
                                        <h4 className="text-lg font-black text-wf-near-black tracking-tighter uppercase">{t('labels.expertise')}</h4>
                                    </div>
                                    
                                    <div className="flex flex-wrap gap-2 justify-start">
                                        {TECH_TAGS.map(tag => {
                                          const isSelected = formData.tags.includes(tag);
                                          return (
                                            <button
                                              key={tag}
                                              type="button"
                                              onClick={() => {
                                                if (isSelected) {
                                                  setFormData({ ...formData, tags: formData.tags.filter(t => t !== tag) });
                                                } else {
                                                  setFormData({ ...formData, tags: [...formData.tags, tag] });
                                                }
                                              }}
                                              className={cn(
                                                "px-4 py-2 rounded-wf text-[10px] font-black transition-all border tracking-widest uppercase",
                                                isSelected 
                                                  ? "bg-primary text-white border-primary scale-[1.02] z-10" 
                                                  : "bg-white text-wf-gray-300 border-wf-border hover:border-primary hover:text-primary hover:bg-primary/5"
                                              )}
                                            >
                                              {tag}
                                            </button>
                                          );
                                        })}
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div className="flex items-center gap-3 pb-4 border-b border-wf-border">
                                        <div className="size-8 bg-slate-100 text-wf-near-black rounded-lg flex items-center justify-center">
                                            <Settings className="size-4" />
                                        </div>
                                        <h4 className="text-lg font-black text-wf-near-black tracking-tighter uppercase">{t('labels.operations')}</h4>
                                    </div>

                                    <div 
                                      className="flex items-center gap-5 p-6 rounded-wf border border-wf-border bg-blue-50/10 hover:bg-white hover:border-primary transition-all cursor-pointer group text-start" 
                                      onClick={() => setFormData({ ...formData, allowPayUsePOS: !formData.allowPayUsePOS })}
                                    >
                                         <div className={cn("p-3 rounded-wf transition-transform group-hover:rotate-6", formData.allowPayUsePOS ? "bg-primary text-white" : "bg-white text-slate-200 border border-wf-border")}>
                                            <CheckCircle className="size-6" />
                                         </div>
                                         <div className="flex-1">
                                            <p className="text-sm font-black text-wf-near-black tracking-tighter leading-none">{t('labels.pos')}</p>
                                            <p className="text-[10px] text-wf-gray-300 font-black tracking-widest uppercase opacity-60 mt-1">{t('labels.posDesc')}</p>
                                         </div>
                                         <div className={cn("w-12 h-7 rounded-full p-1 transition-colors relative shrink-0 flex items-center", formData.allowPayUsePOS ? "bg-primary" : "bg-slate-200")}>
                                            <div className={cn("size-5 bg-white rounded-full transition-transform", formData.allowPayUsePOS ? (locale === 'ar' ? "-translate-x-5" : "translate-x-5") : "translate-x-0")} />
                                         </div>
                                    </div>
                                </div>
                              </CardContent>
                            </Card>

                            <div className={cn("flex pt-2", locale === 'ar' ? "justify-start" : "justify-end")}>
                                <Button type="submit" isLoading={isLoading} className="w-full md:w-auto h-14 px-12 rounded-wf text-[11px] font-black uppercase tracking-widest transition-all hover:bg-primary hover:text-white border border-primary bg-primary text-white shadow-xl shadow-primary/20">
                                    <Diskette className={cn("size-5", locale === 'ar' ? "ml-3" : "mr-3")} />
                                    {isLoading ? t('actions.saving') : t('actions.save')}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ===== BRANCHES TAB ===== */}
            {activeTab === 'branches' && (
                <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div className="bg-primary/5 px-4 py-2 rounded-wf border border-primary/10">
                            <span className="text-[11px] font-black text-primary uppercase tracking-widest">{t('tabs.branches', { count: branches.length })}</span>
                        </div>
                        <Button onClick={openCreateBranch} className="w-full sm:w-auto h-12 rounded-wf px-8 font-black uppercase text-[10px] tracking-widest border border-primary bg-primary text-white shadow-xl shadow-primary/20 hover:bg-primary/90 transition-all">
                            <AddCircle className={cn("size-5", locale === 'ar' ? "ml-2" : "mr-2")} />
                            {t('actions.addBranch')}
                        </Button>
                    </div>

                    {branches.length === 0 ? (
                        <Card className="p-12 md:p-20 text-center border-dashed border bg-slate-50 rounded-wf border-wf-border">
                            <MapPoint className="size-12 md:size-16 text-slate-200 mx-auto mb-6" />
                            <p className="text-wf-near-black font-black text-xl md:text-2xl tracking-tighter leading-none uppercase">{t('noDataContent.branches')}</p>
                            <p className="text-wf-gray-300 text-[11px] mt-2 max-w-[280px] mx-auto font-black uppercase tracking-widest opacity-60">{t('noDataContent.branchesDesc')}</p>
                        </Card>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                            {branches.map((branch, index) => (
                                <Card key={index} className="border border-wf-border bg-white rounded-wf overflow-hidden group hover:border-primary transition-colors text-start">
                                    <div className="flex">
                                        <div className={cn("w-[1px] shrink-0", branch.isActive ? "bg-emerald-500/50" : "bg-slate-200/50")} />
                                        
                                        <div className="flex-1 p-6 space-y-6">
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="space-y-1">
                                                    <h4 className="text-xl font-black text-wf-near-black tracking-tighter leading-none uppercase">{locale === 'ar' ? branch.name?.ar : branch.name?.en || t('generic')}</h4>
                                                    <div className="flex items-center gap-2">
                                                        <div className={cn("size-2 rounded-full", branch.isActive ? "bg-emerald-500 animate-pulse" : "bg-slate-300")} />
                                                        <span className={cn("text-[10px] font-black uppercase tracking-widest", branch.isActive ? "text-emerald-600" : "text-wf-gray-300")}>
                                                            {branch.isActive ? t('branch.active') : t('branch.inactive')}
                                                        </span>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => openEditBranch(branch, index)}
                                                    className="size-10 rounded-wf bg-slate-50 text-wf-gray-300 hover:bg-cyan-500 hover:text-white transition-all flex items-center justify-center border border-wf-border"
                                                >
                                                    <Pen className="size-4" />
                                                </button>
                                            </div>

                                            <div className="space-y-3">
                                                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-wf border border-wf-border">
                                                   <div className="size-8 bg-white border border-wf-border rounded flex items-center justify-center text-primary">
                                                      <MapPoint className="size-4" />
                                                   </div>
                                                   <div className="flex-1 min-w-0">
                                                        <p className="text-[10px] font-black text-wf-gray-300 uppercase tracking-widest leading-none mb-1">{t('branch.location')}</p>
                                                        <p className="text-xs font-black text-wf-near-black truncate">{locale === 'ar' ? branch.name?.ar : branch.name?.en}</p>
                                                   </div>
                                                </div>
                                                
                                                <div className="flex items-center justify-between pt-2">
                                                    <div className={cn("flex", locale === 'ar' ? "-space-x-reverse space-x-3" : "-space-x-3")}>
                                                        <div className="size-8 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-[10px] font-black text-slate-400">G</div>
                                                        <div className="size-8 rounded-full bg-primary/10 border-2 border-white flex items-center justify-center text-[10px] font-black text-primary text-xs">M</div>
                                                    </div>
                                                    <span className="text-[9px] font-black text-slate-200 font-mono tracking-tighter">
                                                       SECURE_LOC_{(branch.id || String(index)).slice(-6).toUpperCase()}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {showBranchModal && (
                <Portal>
                    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setShowBranchModal(false)}>
                        <Card onClick={(e) => e.stopPropagation()} className="w-full max-w-xl p-0 overflow-hidden border border-wf-border animate-in slide-in-from-bottom sm:zoom-in-95 duration-500 rounded-t-wf sm:rounded-wf bg-white h-[90vh] sm:h-auto max-h-[90vh] sm:max-h-[85vh] overflow-y-auto" data-lenis-prevent>
                          <div className="p-6 md:p-10 space-y-6 md:space-y-8 pb-12 sm:pb-10 text-start">
                            <div className="flex items-start justify-between gap-4">
                                <div className="space-y-1">
                                    <h2 className="text-xl md:text-2xl font-black text-wf-near-black tracking-tighter leading-none uppercase">
                                        {editingBranchIndex !== null ? t('actions.editBranch') : t('actions.newBranch')}
                                    </h2>
                                    <p className="text-[11px] text-primary font-black uppercase tracking-widest leading-none">{t('labels.preciseMap')}</p>
                                </div>
                                <button onClick={() => setShowBranchModal(false)} className="size-10 rounded-wf bg-slate-50 text-wf-gray-300 hover:text-primary flex items-center justify-center transition-colors border border-wf-border hover:bg-primary/5">
                                    <CloseCircle className="size-6" />
                                </button>
                            </div>

                            <form onSubmit={handleBranchSubmit} className="space-y-6 md:space-y-8">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                                    <div className="space-y-3">
                                        <label className="text-[11px] font-black text-wf-gray-300 uppercase tracking-widest">{t('labels.nameEn')}</label>
                                        <Input className="h-12 bg-slate-50 rounded-wf border-wf-border font-black text-sm" placeholder={t('labels.placeholderEn')} value={branchForm.nameEn} onChange={e => setBranchForm({ ...branchForm, nameEn: e.target.value })} required />
                                    </div>
                                    <div className="space-y-3">
                                        <label className={cn("text-[11px] font-black text-wf-gray-300 uppercase tracking-widest block", locale === 'ar' ? "text-start" : "text-end")}>{t('labels.nameAr')}</label>
                                        <Input className="h-12 bg-slate-50 rounded-wf border-wf-border font-black text-sm text-right" placeholder={t('labels.placeholderAr')} value={branchForm.nameAr} onChange={e => setBranchForm({ ...branchForm, nameAr: e.target.value })} dir="rtl" required />
                                    </div>
                                </div>
                                
                                <div className="space-y-4">
                                    <label className="text-[11px] font-black text-wf-gray-300 uppercase tracking-widest">{t('labels.preciseMap')}</label>
                                    <div className="h-56 md:h-64 rounded-wf overflow-hidden border border-primary/20">
                                      <LocationPicker 
                                          initialLat={branchForm.lat ? Number(branchForm.lat) : 30.0444}
                                          initialLng={branchForm.lng ? Number(branchForm.lng) : 31.2357}
                                          onLocationSelect={(lat, lng) => setBranchForm({ ...branchForm, lat: String(lat), lng: String(lng) })}
                                      />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 pt-1">
                                       <div className="px-4 py-2 bg-indigo-50/50 rounded-wf border border-indigo-100">
                                          <p className="text-[8px] font-black text-indigo-400 uppercase">LAT</p>
                                          <p className="text-[11px] font-black text-indigo-600 truncate">{Number(branchForm.lat).toFixed(5)}</p>
                                       </div>
                                       <div className="px-4 py-2 bg-indigo-50/50 rounded-wf border border-indigo-100">
                                          <p className="text-[8px] font-black text-indigo-400 uppercase">LNG</p>
                                          <p className="text-[11px] font-black text-indigo-600 truncate">{Number(branchForm.lng).toFixed(5)}</p>
                                       </div>
                                    </div>
                                </div>

                                <div 
                                  className="flex items-center gap-4 p-5 md:p-6 bg-slate-50 rounded-wf border border-wf-border cursor-pointer hover:bg-white hover:border-primary transition-all group"
                                  onClick={() => setBranchForm({ ...branchForm, isActive: !branchForm.isActive })}
                                >
                                    <div className={cn("p-2.5 rounded-wf transition-transform group-hover:rotate-6", branchForm.isActive ? "bg-cyan-500 text-white" : "bg-white text-slate-200 border border-wf-border")}>
                                      <CheckCircle className="size-5" />
                                    </div>
                                    <div className="flex-1">
                                       <span className="text-sm font-black text-wf-near-black tracking-tighter leading-none block pt-0.5">{t('labels.liveOp')}</span>
                                       <p className="text-[11px] text-wf-gray-300 font-black uppercase tracking-widest mt-1 opacity-60">{t('labels.liveOpDesc')}</p>
                                    </div>
                                    <div className={cn("w-11 h-6 md:w-12 md:h-7 rounded-full p-1 transition-colors relative shrink-0 flex items-center", branchForm.isActive ? "bg-primary" : "bg-slate-200")}>
                                        <div className={cn("size-4 md:size-5 bg-white rounded-full transition-transform", branchForm.isActive ? (locale === 'ar' ? "-translate-x-5" : "translate-x-5") : "translate-x-0")} />
                                    </div>
                                </div>

                                <div className="flex flex-col sm:flex-row gap-4 pt-2">
                                    <Button type="button" variant="outline" className="order-2 sm:order-1 flex-1 h-14 rounded-wf font-black uppercase text-[10px] tracking-widest border border-wf-border hover:bg-slate-50 transition-all" onClick={() => setShowBranchModal(false)}>{t('actions.discard')}</Button>
                                    <Button type="submit" className="order-1 sm:order-2 flex-1 h-14 rounded-wf font-black uppercase text-[10px] tracking-widest hover:bg-cyan-500 hover:text-white transition-all border border-wf-border" isLoading={isBranchSubmitting}>
                                        {editingBranchIndex !== null ? t('actions.save') : t('actions.addBranch')}
                                    </Button>
                                </div>
                            </form>
                          </div>
                        </Card>
                    </div>
                </Portal>
            )}

            {/* ===== REVIEWS TAB ===== */}
            {activeTab === 'reviews' && (
                <div className="max-w-5xl py-2 space-y-4 md:space-y-6">
                    {isFetchingReviews ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                            {[1, 2, 3, 4].map(i => (
                                <Card key={i} className="p-6 md:p-8 space-y-4 animate-pulse bg-white border border-wf-border rounded-wf">
                                    <div className="flex gap-4">
                                      <div className="size-12 bg-slate-50 rounded-wf" />
                                      <div className="space-y-2 flex-1">
                                        <div className="h-4 bg-slate-50 w-1/3 rounded" />
                                        <div className="h-3 bg-slate-50 w-1/4 rounded" />
                                      </div>
                                    </div>
                                    <div className="h-20 bg-slate-50 rounded-wf" />
                                </Card>
                            ))}
                        </div>
                    ) : reviews.length === 0 ? (
                        <Card className="p-20 md:p-32 text-center border-dashed border bg-slate-50 flex flex-col items-center rounded-wf border-wf-border">
                            <div className="size-16 md:size-20 bg-white border border-wf-border rounded-wf flex items-center justify-center mb-6 md:mb-8 rotate-3 transition-transform hover:rotate-0">
                              <ChatLine className="size-10 text-wf-near-black" />
                            </div>
                            <p className="text-wf-near-black font-black text-xl md:text-2xl tracking-tighter leading-none uppercase">{t('noDataContent.reviews')}</p>
                            <p className="text-wf-gray-300 text-[11px] mt-3 font-black uppercase tracking-widest opacity-60">{t('noDataContent.reviewsDesc')}</p>
                        </Card>
                    ) : (
                        <div className="max-w-4xl mx-auto space-y-12 relative">
                            <div className={cn("absolute top-0 bottom-0 w-px bg-wf-border hidden sm:block", locale === 'ar' ? "right-6 md:right-10" : "left-6 md:left-10")} />

                            {reviews.map((review, i) => (
                                <div key={review.id} className={cn("relative", locale === 'ar' ? "pr-0 sm:pr-20 md:pr-24" : "pl-0 sm:pl-20 md:pl-24")}>
                                    <div className={cn("absolute top-8 size-3 bg-wf-border rounded-full hidden sm:block border-4 border-white", locale === 'ar' ? "right-6 md:right-10 translate-x-1/2" : "left-6 md:left-10 -translate-x-1/2")} />

                                    <Card className="p-6 md:p-10 space-y-8 transition-all duration-500 border border-wf-border group bg-white rounded-wf hover:border-primary hover:-translate-y-1 text-start">
                                        <div className="flex flex-col md:flex-row justify-between items-start gap-6">
                                            <div className="flex items-center gap-5">
                                                <div className={cn(
                                                    "size-14 md:size-16 rounded-wf flex items-center justify-center font-black text-xl md:text-2xl border transition-all duration-500",
                                                    review.rating >= 4 ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-primary/5 text-primary border-primary/20"
                                                )}>
                                                  {review.customerName?.charAt(0) || 'U'}
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="text-lg md:text-2xl font-black text-wf-near-black tracking-tighter leading-none">{review.customerName || t('reviews.anonymous')}</p>
                                                    <div className="flex gap-1">
                                                        {[...Array(5)].map((_, i) => (
                                                            <Star 
                                                                key={i} 
                                                                className={cn(
                                                                    "size-4 md:size-5",
                                                                    i < review.rating ? "text-amber-500 fill-amber-500" : "text-slate-200"
                                                                )} 
                                                            />
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className={cn("shrink-0", locale === 'ar' ? "text-right" : "text-left md:text-right")}>
                                              <p className="text-xs font-black text-primary uppercase tracking-widest mb-1">
                                                  {review.createdAt ? new Date(review.createdAt).toLocaleDateString(locale) : t('reviews.recent')}
                                              </p>
                                              <span className="px-3 py-1.5 bg-slate-50 text-wf-gray-300 text-[10px] font-black rounded-wf uppercase tracking-widest border border-wf-border">
                                                TRANS_REF_{review.repairRequestId?.slice(-6).toUpperCase()}
                                              </span>
                                            </div>
                                        </div>

                                        <div className={cn("relative", locale === 'ar' ? "pr-6" : "pl-6")}>
                                            <div className={cn("absolute top-0 bottom-0 w-1 bg-wf-border rounded-full group-hover:bg-primary transition-all", locale === 'ar' ? "right-0" : "left-0")} />
                                            <p className="text-wf-gray-300 text-sm md:text-lg font-black leading-relaxed tracking-widest uppercase opacity-60 group-hover:opacity-100 transition-opacity italic max-w-2xl">
                                                "{review.comment || t('reviews.noComment')}"
                                            </p>
                                        </div>
                                    </Card>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

const Separator = () => <div className="h-px w-full bg-wf-border" />;
