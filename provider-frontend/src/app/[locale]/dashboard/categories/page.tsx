"use client"

import React, { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import {
    Hashtag,
    Settings,
    CheckCircle,
    CloseCircle,
    Magnifer,
    Widget6 as CategoryIcon,
    AltArrowDown,
    InfoCircle
} from '@solar-icons/react';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';
import { useTranslations, useLocale } from 'next-intl';

interface Category {
    id: string;
    name: {
        en: string;
        ar: string;
    };
    commissionPerRequest: number;
    isActive: boolean;
}

export default function CategoriesPage() {
    const t = useTranslations('Categories');
    const locale = useLocale();
    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    const fetchCategories = async () => {
        setIsLoading(true);
        try {
            const res = await apiClient.get('/category/list');
            setCategories(res.data.data || []);
        } catch (error) {
            console.error('Failed to fetch categories', error);
            toast.error(t('noResults'));
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const filteredCategories = categories.filter(cat =>
        cat.name.en.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cat.name.ar.includes(searchQuery)
    );

    return (
        <div dir={locale === 'ar' ? 'rtl' : 'ltr'} className="p-4 md:p-8 space-y-8 md:space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-wf-border">
                <div className="space-y-2">
                    <div className="flex items-center gap-3">
                        <div className="size-10 bg-primary/10 text-primary rounded-wf flex items-center justify-center">
                            <CategoryIcon className="size-6" />
                        </div>
                            {t('title')}
                    </div>
                        {t('subtitle')}
                </div>
                <div className="bg-blue-50/50 text-primary flex items-center gap-3 px-4 py-2.5 rounded-wf border border-primary/20">
                    <div className="size-2 bg-primary rounded-full animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-widest">{t('activeCategories', { count: categories.length })}</span>
                </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4 items-center">
                <div className="relative w-full md:max-w-md group">
                    <Input
                        placeholder={t('filterPlaceholder')}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className={cn(
                            "h-14 rounded-wf bg-slate-50 border-wf-border focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all text-sm font-black uppercase tracking-widest",
                            locale === 'ar' ? "pr-12" : "pl-12"
                        )}
                    />
                    <Magnifer className={cn(
                        "absolute top-1/2 -translate-y-1/2 size-5 text-wf-gray-300 group-focus-within:text-primary transition-colors",
                        locale === 'ar' ? "right-4" : "left-4"
                    )} />
                </div>
            </div>

            {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(6)].map((_, i) => (
                        <Card key={i} className="animate-pulse bg-white border border-wf-border rounded-wf h-40" />
                    ))}
                </div>
            ) : filteredCategories.length === 0 ? (
                <Card className="py-20 flex flex-col items-center justify-center bg-slate-50 border-dashed border border-wf-border rounded-wf">
                    <Magnifer className="size-16 text-wf-gray-300 opacity-20 mb-4" />
                    <p className="font-black text-wf-gray-300 tracking-widest uppercase text-xs">{t('noResults')}</p>
                </Card>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredCategories.map((cat) => (
                        <Card key={cat.id} className="border border-wf-border bg-white rounded-wf overflow-hidden group hover:border-primary transition-all duration-300">
                         {/* Refined Status Indicator (Subtle 1px Top) */}
                         <div className={cn("h-[1px] w-full", cat.isActive ? "bg-emerald-500/50" : "bg-slate-200/50")} />
                             
                             <div className="p-6 space-y-6">
                                <div className="flex justify-between items-start gap-4">
                                    <div className="space-y-1">
                                        <h3 className="text-xl font-black text-wf-near-black tracking-tighter uppercase leading-none group-hover:text-primary transition-colors">
                                            {cat.name[locale as keyof typeof cat.name]}
                                        </h3>
                                        <p className="text-[11px] text-wf-gray-300 font-black uppercase tracking-widest opacity-60">
                                            ID: {cat.id?.slice(-8).toUpperCase()}
                                        </p>
                                    </div>
                                    <div className={cn(
                                        "size-10 rounded-wf flex items-center justify-center border transition-colors",
                                        cat.isActive ? "border-emerald-100 bg-emerald-50 text-emerald-600" : "border-wf-border bg-slate-50 text-wf-gray-300"
                                    )}>
                                        {cat.isActive ? <CheckCircle className="size-5" /> : <CloseCircle className="size-5" />}
                                    </div>
                                </div>

                                <div className="space-y-3 pt-2">
                                    <div className="flex justify-between items-end pb-3">
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-black text-wf-gray-300 uppercase tracking-widest leading-none">{t('commissionRate')}</p>
                                            <p className="text-2xl font-black text-wf-near-black tracking-tighter leading-none">{cat.commissionPerRequest}%</p>
                                        </div>
                                        <span className="text-[10px] font-black text-primary uppercase tracking-widest px-2 py-1 bg-primary/5 rounded-wf">{t('platformFee')}</span>
                                    </div>

                                    <div className="flex justify-between items-center pt-1">
                                        <span className={cn(
                                            "text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-wf",
                                            cat.isActive ? "bg-emerald-50 text-emerald-600" : "bg-slate-50 text-wf-gray-300"
                                        )}>
                                            {cat.isActive ? t('status.active') : t('status.inactive')}
                                        </span>
                                        <div className="flex -space-x-2">
                                            <div className="size-7 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-[10px] font-black text-slate-400">G</div>
                                            <div className="size-7 rounded-full bg-primary/10 border-2 border-white flex items-center justify-center text-[10px] font-black text-primary">M</div>
                                        </div>
                                    </div>
                                </div>
                             </div>
                        </Card>
                    ))}
                </div>
            )}

            <div className="flex flex-col md:flex-row items-start md:items-center gap-6 p-6 md:p-10 bg-blue-50/30 rounded-wf border border-primary/10">
                <div className="size-16 bg-white border border-primary/20 rounded-wf flex items-center justify-center text-primary shrink-0 transition-transform hover:scale-105 duration-500">
                    <InfoCircle className="size-8" />
                </div>
                <div className="space-y-2">
                    <p className="text-sm font-black text-wf-near-black tracking-tighter uppercase">{t('policyTitle')}</p>
                    <p className="text-xs text-wf-gray-300 font-black tracking-widest leading-relaxed uppercase opacity-60 max-w-3xl">
                        {t('policyDescription')}
                    </p>
                </div>
            </div>
        </div>
    );
}
