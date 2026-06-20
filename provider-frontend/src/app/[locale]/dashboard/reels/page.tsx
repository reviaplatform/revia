"use client"

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { api, getMediaUrl } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/Input';
import { Portal } from '@/components/ui/Portal';
import toast from 'react-hot-toast';
import { Reel, UpdateReelRequest } from '@/types/reel';
import {
  Videocamera,
  CloudUpload,
  TrashBinMinimalistic,
  Pen,
  Eye,
  EyeClosed,
  CloseCircle,
  AddCircle,
  Heart,
  Forward,
} from '@solar-icons/react';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { useTranslations, useLocale } from 'next-intl';

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

export default function ReelsPage() {
  const t = useTranslations('Reels');
  const locale = useLocale();

  const DUMMY_REELS: Reel[] = [
    { id: 'rl1', videoUrl: '', thumbnailUrl: 'https://picsum.photos/seed/reel1/400/711', caption: { en: 'Quick screen repair in under 10 minutes! 📱', ar: 'إصلاح الشاشة في أقل من 10 دقائق' }, tags: ['mobile', 'tutorial', 'screen'], isVisible: true,  createdAt: '2026-03-10T10:00:00Z' },
    { id: 'rl2', videoUrl: '', thumbnailUrl: 'https://picsum.photos/seed/reel2/400/711', caption: { en: 'Battery replacement — before and after 🔋',   ar: 'استبدال البطارية — قبل وبعد' },           tags: ['mobile', 'tutorial', 'battery'], isVisible: true,  createdAt: '2026-03-12T12:00:00Z' },
    { id: 'rl3', videoUrl: '', thumbnailUrl: 'https://picsum.photos/seed/reel3/400/711', caption: { en: 'Water damage recovery success story 💧',     ar: 'قصة نجاح انتشال جهاز من الماء' },          tags: ['mobile', 'general'], isVisible: false, createdAt: '2026-03-13T09:30:00Z' },
    { id: 'rl4', videoUrl: '', thumbnailUrl: 'https://picsum.photos/seed/reel4/400/711', caption: { en: 'Our new branch opening — Cairo Festival City 🎉', ar: 'افتتاح فرعنا الجديد — فستيفال سيتي' }, tags: ['general'], isVisible: true,  createdAt: '2026-03-15T15:00:00Z' },
    { id: 'rl5', videoUrl: '', thumbnailUrl: 'https://picsum.photos/seed/reel5/400/711', caption: { en: 'MacBook keyboard cleaning and replacement ⌨️',  ar: 'تنظيف واستبدال لوحة مفاتيح ماك بوك' },   tags: ['laptop', 'tutorial', 'hardware'], isVisible: true,  createdAt: '2026-03-16T11:00:00Z' },
    { id: 'rl6', videoUrl: '', thumbnailUrl: 'https://picsum.photos/seed/reel6/400/711', caption: { en: 'Samsung AMOLED panel swap — flawless finish ✨',  ar: 'استبدال شاشة سامسونج — نتيجة مثالية' },  tags: ['mobile', 'tutorial', 'screen', 'Samsung'], isVisible: true,  createdAt: '2026-03-17T08:00:00Z' },
  ];

  const [reels, setReels] = useState<Reel[]>(DUMMY_REELS);
  const [isFetching, setIsFetching] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingReel, setEditingReel] = useState<Reel | null>(null);

  // Create form
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [captionEn, setCaptionEn] = useState('');
  const [captionAr, setCaptionAr] = useState('');
  const [category, setCategory] = useState<'mobile' | 'laptop'>('mobile');
  const [reelType, setReelType] = useState<'general' | 'tutorial'>('general');
  const [deviceName, setDeviceName] = useState('');
  const [repairTask, setRepairTask] = useState('');

  // Edit form
  const [editCaptionEn, setEditCaptionEn] = useState('');
  const [editCaptionAr, setEditCaptionAr] = useState('');
  const [editIsVisible, setEditIsVisible] = useState(true);
  const [editTags, setEditTags] = useState<string[]>([]);
  const [editTagInput, setEditTagInput] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const normalizeReel = (raw: any): Reel => ({
    id:           raw.id ?? raw._id,
    videoUrl:     getMediaUrl(raw.videoUrl     ?? raw.video_url     ?? raw.video     ?? ''),
    thumbnailUrl: getMediaUrl(raw.thumbnailUrl ?? raw.thumbnail_url ?? raw.thumbnail ?? ''),
    caption: {
      en: raw.caption?.en ?? raw.caption_en ?? '',
      ar: raw.caption?.ar ?? raw.caption_ar ?? '',
    },
    isVisible: raw.isVisible ?? raw.is_visible ?? true,
    createdAt: raw.createdAt ?? raw.created_at ?? '',
    tags: Array.isArray(raw.tags) ? raw.tags : [],
    likesCount: raw.likesCount ?? raw.likes_count ?? raw.likes ?? 0,
    viewsCount: raw.viewsCount ?? raw.views_count ?? raw.views ?? 0,
    sharesCount: raw.sharesCount ?? raw.shares_count ?? raw.shares ?? 0,
  });

  const [selectedReel, setSelectedReel] = useState<Reel | null>(null);

  const fetchReels = async () => {
    setIsFetching(true);
    try {
      const res = await api.get('/reel/');
      const raw: any[] = Array.isArray(res.data.data)
        ? res.data.data
        : res.data.data?.data ?? res.data ?? [];
      setReels(raw.map(normalizeReel));
    } catch (error) {
      console.error('Failed to fetch reels', error);
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => { fetchReels(); }, []);

  const handleCreateReel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoFile) {
      toast.error(t('messages.selectVideo'));
      return;
    }

    const MAX_SIZE = 10 * 1024 * 1024;
    if (videoFile.size > MAX_SIZE) {
      toast.error(t('messages.videoTooLarge', { size: (videoFile.size / (1024 * 1024)).toFixed(1) }));
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('video', videoFile);
      formData.append('caption[en]', captionEn);
      formData.append('caption[ar]', captionAr);
      
      const tags: string[] = [category, reelType];
      if (deviceName.trim()) tags.push(deviceName.trim());
      if (reelType === 'tutorial' && repairTask) tags.push(repairTask);

      tags.forEach((tag, index) => {
        formData.append(`tags[${index}]`, tag);
      });
      
      await api.post('/reel', formData);

      toast.success(t('messages.createSuccess'));
      setShowCreateModal(false);
      setVideoFile(null);
      setCaptionEn('');
      setCaptionAr('');
      setCategory('mobile');
      setReelType('general');
      setDeviceName('');
      setRepairTask('');
      fetchReels();
    } catch (error: any) {
      toast.error(error.response?.data?.message || t('messages.createFail'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateReel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingReel) return;
    setIsSubmitting(true);
    try {
      const payload: UpdateReelRequest = {
        caption: { en: editCaptionEn, ar: editCaptionAr },
        isVisible: editIsVisible,
        tags: editTags,
      };
      await api.patch(`/reel/${editingReel.id}`, payload);
      toast.success(t('messages.updateSuccess'));
      setEditingReel(null);
      fetchReels();
    } catch (error: any) {
      toast.error(error.response?.data?.message || t('messages.updateFail'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteReel = async (id: string) => {
    if (!confirm(t('messages.deleteConfirm'))) return;
    try {
      await api.delete(`/reel/${id}`);
      toast.success(t('messages.deleteSuccess'));
      fetchReels();
    } catch (error: any) {
      toast.error(error.response?.data?.message || t('messages.deleteFail'));
    }
  };

  const handleToggleVisibility = async (reel: Reel) => {
    try {
      await api.patch(`/reel/${reel.id}`, { isVisible: !reel.isVisible });
      toast.success(t('messages.visibilitySuccess', { status: reel.isVisible ? t('status.hidden').toLowerCase() : t('status.visible').toLowerCase() }));
      fetchReels();
    } catch (error: any) {
      toast.error(t('messages.visibilityFail'));
    }
  };

  const openEditModal = (reel: Reel) => {
    setEditingReel(reel);
    setEditCaptionEn(reel.caption?.en || '');
    setEditCaptionAr(reel.caption?.ar || '');
    setEditIsVisible(reel.isVisible);
    setEditTags(reel.tags ?? []);
    setEditTagInput('');
  };

  return (
    <div dir={locale === 'ar' ? 'rtl' : 'ltr'} className="p-4 md:p-8 space-y-8 md:space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-7xl mx-auto pb-24 md:pb-8">
      <div className="pb-6 border-b border-wf-border flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2 text-start">
          <div className="flex items-center gap-3">
            <div className="size-10 bg-primary/10 text-primary rounded-wf flex items-center justify-center">
              <Videocamera className="size-6" />
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-wf-near-black tracking-tighter uppercase leading-none">
              {t('title')}
            </h1>
          </div>
          <p className="text-[11px] text-wf-gray-300 font-black uppercase tracking-[0.2em] leading-none opacity-80">
            {t('subtitle')}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-6 text-[10px] font-black text-wf-gray-300 uppercase tracking-widest opacity-40">
          <div className="flex items-center gap-2">
            <div className="size-1 bg-emerald-500 rounded-full" />
            {t('status.sync')}
          </div>
          <div className="flex items-center gap-2">
            <div className="size-1 bg-blue-500 rounded-full" />
            {t('status.published', { count: reels.length })}
          </div>
          <Button 
            onClick={() => setShowCreateModal(true)}
            className="h-10 px-6 rounded-wf border-b-2 border-primary/20 active:border-b-0 active:translate-y-0.5 transition-all"
          >
            <AddCircle className={cn("size-4", locale === 'ar' ? "ms-2" : "me-2")} />
            {t('actions.upload')}
          </Button>
        </div>
      </div>

      {/* Reels Grid */}
      {isFetching ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="aspect-[9/16] bg-wf-near-black rounded-wf overflow-hidden border border-wf-border relative">
              <Skeleton className="h-full w-full opacity-10" />
              <div className={cn("absolute top-4", locale === 'ar' ? "right-4" : "left-4")}>
                <Skeleton className="h-6 w-16 rounded-wf bg-white/10" />
              </div>
              <div className="absolute inset-x-0 bottom-0 p-4 space-y-4 bg-gradient-to-t from-black/80 to-transparent">
                <Skeleton className="h-4 w-3/4 bg-white/20" />
                <div className="flex gap-2">
                  <Skeleton className="h-10 flex-1 rounded-wf bg-white/20" />
                  <Skeleton className="size-10 rounded-wf bg-white/10" />
                  <Skeleton className="size-10 rounded-wf bg-white/10" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : reels.length === 0 ? (
        <Card className="p-16 md:p-24 text-center border border-dashed border-wf-border bg-slate-50/30 rounded-wf shadow-none">
          <div className="size-20 bg-white border border-wf-border rounded-wf flex items-center justify-center mx-auto mb-6">
            <Videocamera className="size-10 text-wf-gray-300 opacity-20" />
          </div>
          <p className="text-xs font-black text-wf-gray-300 uppercase tracking-widest mb-6">{t('noData.title')}</p>
          <Button 
            variant="outline"
            className="px-8 rounded-wf border-wf-border hover:bg-white" 
            onClick={() => setShowCreateModal(true)}
          >
            <AddCircle className={cn("size-4", locale === 'ar' ? "ms-2" : "me-2")} />
            {t('actions.createFirst')}
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
          {reels.map((reel, index) => (
            <ReelCard 
              key={reel.id} 
              reel={reel} 
              index={index}
              onToggleVisibility={() => handleToggleVisibility(reel)}
              onEdit={() => openEditModal(reel)}
              onDelete={() => handleDeleteReel(reel.id)}
              onViewDetails={() => setSelectedReel(reel)}
            />
          ))}
        </div>
      )}

      {/* Registry Portals */}
      {selectedReel && (
        <ReelDetailsModal 
          reel={selectedReel}
          onClose={() => setSelectedReel(null)}
        />
      )}
      {showCreateModal && (
        <CreateReelModal 
          onClose={() => { setShowCreateModal(false); setVideoFile(null); }}
          onFileSelect={setVideoFile}
          videoFile={videoFile}
          captionEn={captionEn}
          setCaptionEn={setCaptionEn}
          captionAr={captionAr}
          setCaptionAr={setCaptionAr}
          category={category}
          setCategory={setCategory}
          reelType={reelType}
          setReelType={setReelType}
          deviceName={deviceName}
          setDeviceName={setDeviceName}
          repairTask={repairTask}
          setRepairTask={setRepairTask}
          onSubmit={handleCreateReel}
          isSubmitting={isSubmitting}
          fileInputRef={fileInputRef}
        />
      )}

      {editingReel && (
        <EditReelModal
          editingReel={editingReel}
          onClose={() => setEditingReel(null)}
          editCaptionEn={editCaptionEn}
          setEditCaptionEn={setEditCaptionEn}
          editCaptionAr={editCaptionAr}
          setEditCaptionAr={setEditCaptionAr}
          editIsVisible={editIsVisible}
          setEditIsVisible={setEditIsVisible}
          editTags={editTags}
          setEditTags={setEditTags}
          editTagInput={editTagInput}
          setEditTagInput={setEditTagInput}
          onSubmit={handleUpdateReel}
          isSubmitting={isSubmitting}
        />
      )}
    </div>
  );
}

const ReelCard = React.memo(({ reel, index, onToggleVisibility, onEdit, onDelete, onViewDetails }: { 
  reel: Reel; 
  index: number; 
  onToggleVisibility: () => void; 
  onEdit: () => void; 
  onDelete: () => void; 
  onViewDetails: () => void;
}) => {
  const t = useTranslations('Reels');
  const locale = useLocale();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsIntersecting(true);
          observer.unobserve(entry.target);
        }
      },
      { rootMargin: '200px' }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const togglePlay = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation();
    const video = videoRef.current;
    if (!video) return;
    try {
      if (video.paused) {
        await video.play();
        setIsPlaying(true);
      } else {
        video.pause();
        setIsPlaying(false);
      }
    } catch (err) {
      console.warn('Video playback error:', err);
    }
  }, []);

  const handleCardClick = useCallback((e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button')) return;
    onViewDetails();
  }, [onViewDetails]);

  const hasVideo = Boolean(reel.videoUrl);
  const hasThumbnail = Boolean(reel.thumbnailUrl);

  return (
    <div 
      ref={containerRef}
      onClick={handleCardClick}
      className="relative group rounded-wf overflow-hidden bg-wf-near-black aspect-[9/16] border border-wf-border animate-in fade-in slide-in-from-bottom-4 duration-500 cursor-pointer"
      style={{ 
        animationDelay: `${index * 50}ms`,
        willChange: 'transform, opacity'
      }}
    >
      {hasVideo && isIntersecting ? (
        <video
          ref={videoRef}
          src={reel.videoUrl}
          poster={reel.thumbnailUrl || undefined}
          className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-all duration-700"
          muted
          loop
          playsInline
          preload="none"
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onEnded={() => setIsPlaying(false)}
        />
      ) : hasThumbnail ? (
        <Image 
          src={reel.thumbnailUrl!} 
          alt="Reel thumbnail" 
          fill
          sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 20vw"
          className="object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-700"
          priority={index < 5}
        />
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center gap-3 bg-slate-900 border border-wf-border">
          <Videocamera className="size-10 text-wf-gray-300 opacity-10" />
          <p className="text-[9px] font-black text-wf-gray-300 uppercase tracking-widest opacity-20">{t('labels.noPreview')}</p>
        </div>
      )}

      {hasVideo && isIntersecting && (
        <div
          className="absolute inset-x-0 top-0 bottom-[30%] flex items-center justify-center z-10 bg-transparent"
        >
          <button
            onClick={togglePlay}
            className={cn(
              "size-14 rounded-full bg-black/50 backdrop-blur-sm border border-white/20 flex items-center justify-center transition-all duration-300",
              isPlaying ? "opacity-0 group-hover:opacity-100 scale-75 group-hover:scale-100" : "opacity-100 scale-100"
            )}
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <svg className="size-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                <rect x="6" y="4" width="4" height="16" rx="1" />
                <rect x="14" y="4" width="4" height="16" rx="1" />
              </svg>
            ) : (
              <svg className="size-6 text-white translate-x-0.5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>
        </div>
      )}

      <div className={cn("absolute top-0 bottom-0 w-[1px] flex flex-col", locale === 'ar' ? "right-0" : "left-0")}>
        <div className={`flex-1 ${reel.isVisible ? 'bg-emerald-500/50' : 'bg-slate-700/50'} transition-colors duration-500`} />
      </div>

      <div className={cn("absolute top-4", locale === 'ar' ? "right-4" : "left-4")}>
        <div className={cn(
          "px-3 py-1 bg-black/60 backdrop-blur-md rounded-wf border border-white/10 text-[9px] font-black uppercase tracking-widest text-white transition-all duration-500",
          !reel.isVisible && "opacity-40"
        )}>
          {reel.isVisible ? t('status.visible') : t('status.hidden')}
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-500 bg-gradient-to-t from-black via-black/80 to-transparent text-start">
        <div className="space-y-3">
          <p className="text-white text-[11px] font-black uppercase tracking-wider line-clamp-2 leading-relaxed opacity-90">
            {(locale === 'ar' ? reel.caption?.ar : reel.caption?.en) || t('labels.untitled')}
          </p>
          {reel.tags && reel.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {reel.tags.slice(0, 3).map((tag, i) => (
                <span key={i} className="px-2 py-0.5 bg-white/10 text-white/80 rounded-full text-[8px] font-black uppercase tracking-widest border border-white/10">
                  #{tag}
                </span>
              ))}
              {reel.tags.length > 3 && (
                <span className="px-2 py-0.5 bg-white/10 text-white/60 rounded-full text-[8px] font-black uppercase tracking-widest">
                  +{reel.tags.length - 3}
                </span>
              )}
            </div>
          )}
          <div className="flex gap-2">
            <button
              onClick={onToggleVisibility}
              className="flex-1 h-10 flex items-center justify-center gap-2 bg-white text-wf-near-black hover:bg-primary hover:text-white rounded-wf text-[10px] font-black uppercase tracking-widest transition-all"
            >
               {reel.isVisible ? <EyeClosed className="size-3.5" /> : <Eye className="size-3.5" />}
              {reel.isVisible ? t('actions.hide') : t('actions.publish')}
            </button>
            <div className="flex gap-1.5">
              <button
                onClick={onEdit}
                className="size-10 flex items-center justify-center bg-white/10 hover:bg-white text-white hover:text-black rounded-wf border border-white/10 transition-all"
              >
                <Pen className="size-4" />
              </button>
              <button
                onClick={onDelete}
                className="size-10 flex items-center justify-center bg-rose-500/20 hover:bg-rose-500 text-rose-500 hover:text-white rounded-wf border border-rose-500/20 transition-all"
              >
                <TrashBinMinimalistic className="size-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

ReelCard.displayName = 'ReelCard';

function CreateReelModal({ 
  onClose, 
  onFileSelect, 
  videoFile, 
  captionEn, 
  setCaptionEn, 
  captionAr, 
  setCaptionAr, 
  category,
  setCategory,
  reelType,
  setReelType,
  deviceName,
  setDeviceName,
  repairTask,
  setRepairTask,
  onSubmit, 
  isSubmitting,
  fileInputRef 
}: any) {
  const t = useTranslations('Reels');
  const locale = useLocale();
  return (
    <Portal>
      <div dir={locale === 'ar' ? 'rtl' : 'ltr'} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={onClose}>
        <Card onClick={(e) => e.stopPropagation()} className="w-full max-w-2xl bg-white rounded-wf shadow-none p-10 md:p-12 animate-in zoom-in-95 slide-in-from-bottom-4 duration-500 text-start overflow-y-auto max-h-[95vh]" data-lenis-prevent>
          <div className="flex items-center justify-between mb-10 pb-6 border-b border-wf-border">
            <div className="space-y-1">
              <h2 className="text-2xl font-black text-wf-near-black uppercase tracking-tight flex items-center gap-3">
                <CloudUpload className="text-primary" />
                {t('labels.uploadTitle')}
              </h2>
              <p className="text-[11px] text-wf-gray-300 font-black uppercase tracking-widest opacity-60">{t('labels.uploadDesc')}</p>
            </div>
            <button onClick={onClose} className="text-wf-gray-300 hover:text-wf-near-black transition-colors">
              <CloseCircle className="size-7" />
            </button>
          </div>
          
          <form onSubmit={onSubmit} className="space-y-8">
            <div
              className={cn(
                "border-2 border-dashed rounded-wf p-10 flex flex-col items-center justify-center transition-all cursor-pointer group",
                videoFile ? "border-primary bg-primary/5" : "border-slate-100 bg-slate-50 hover:bg-white hover:border-primary/40"
              )}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                type="file"
                ref={fileInputRef}
                accept="video/mp4,video/mov,video/quicktime"
                className="hidden"
                onChange={e => onFileSelect(e.target.files?.[0] || null)}
              />
              
              {videoFile ? (
                <div className="flex flex-col items-center gap-4 text-center">
                  <div className="size-14 bg-white border border-primary/20 rounded-wf flex items-center justify-center shadow-sm">
                    <Videocamera className="size-7 text-primary" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-wf-near-black uppercase tracking-widest truncate max-w-[200px]">{videoFile.name}</p>
                    <p className="text-[9px] text-primary font-black uppercase tracking-widest">
                      {(videoFile.size / (1024 * 1024)).toFixed(1)} MB // {t('labels.ready')}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-4 text-center">
                  <div className="size-14 bg-white border border-wf-border rounded-wf flex items-center justify-center group-hover:border-primary/20 transition-all">
                    <CloudUpload className="size-7 text-wf-gray-300 group-hover:text-primary transition-all" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-wf-near-black uppercase tracking-widest">{t('labels.uploadVideo')}</p>
                    <p className="text-[8px] text-wf-gray-300 font-black uppercase tracking-widest opacity-40">{t('labels.uploadHint')}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Tags Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-slate-50 rounded-wf border border-wf-border">
                <div className="space-y-2">
                    <label className="text-[9px] font-black text-wf-gray-300 uppercase tracking-widest">{t('labels.category')}</label>
                    <Select value={category} onValueChange={(val: any) => setCategory(val)}>
                        <SelectTrigger className="h-12 bg-white border-wf-border rounded-wf text-xs font-black uppercase tracking-widest">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="mobile">{t('labels.categoryMobile')}</SelectItem>
                            <SelectItem value="laptop">{t('labels.categoryLaptop')}</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <label className="text-[9px] font-black text-wf-gray-300 uppercase tracking-widest">{t('labels.type')}</label>
                    <Select value={reelType} onValueChange={(val: any) => setReelType(val)}>
                        <SelectTrigger className="h-12 bg-white border-wf-border rounded-wf text-xs font-black uppercase tracking-widest">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="general">{t('labels.typeGeneral')}</SelectItem>
                            <SelectItem value="tutorial">{t('labels.typeTutorial')}</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <label className="text-[9px] font-black text-wf-gray-300 uppercase tracking-widest">{t('labels.deviceName')}</label>
                    <Input 
                        className="h-12 bg-white border-wf-border rounded-wf text-xs font-black uppercase tracking-widest" 
                        placeholder={t('labels.deviceNamePlaceholder')}
                        value={deviceName}
                        onChange={e => setDeviceName(e.target.value)}
                    />
                </div>
                {reelType === 'tutorial' && (
                    <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                        <label className="text-[9px] font-black text-wf-gray-300 uppercase tracking-widest">{t('labels.repairType')}</label>
                        <Select value={repairTask} onValueChange={setRepairTask}>
                            <SelectTrigger className="h-12 bg-white border-wf-border rounded-wf text-xs font-black uppercase tracking-widest">
                                <SelectValue placeholder="Select Task" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="screen">{t('labels.repairScreen')}</SelectItem>
                                <SelectItem value="battery">{t('labels.repairBattery')}</SelectItem>
                                <SelectItem value="hardware">{t('labels.repairHardware')}</SelectItem>
                                <SelectItem value="software">{t('labels.repairSoftware')}</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-wf-gray-300 uppercase tracking-[0.25em]">{t('labels.captionEn')}</label>
                <Input className="h-14 bg-slate-50 border-wf-border focus:bg-white focus:border-primary transition-all font-black uppercase tracking-widest text-xs rounded-wf text-start" placeholder={t('labels.captionPlaceholderEn')} value={captionEn} onChange={e => setCaptionEn(e.target.value)} />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black text-wf-gray-300 uppercase tracking-[0.25em]">{t('labels.captionAr')}</label>
                <Input className="h-14 bg-slate-50 border-wf-border focus:bg-white focus:border-primary transition-all font-black uppercase tracking-widest text-xs rounded-wf text-start" placeholder={t('labels.captionPlaceholderAr')} value={captionAr} onChange={e => setCaptionAr(e.target.value)} dir="rtl" />
              </div>
            </div>

            <div className="flex gap-4 pt-6 border-t border-wf-border">
              <Button type="button" variant="outline" className="flex-1 h-14 rounded-wf font-black uppercase tracking-widest" onClick={onClose}>
                {t('actions.cancel')}
              </Button>
              <Button type="submit" className="flex-1 h-14 rounded-wf font-black uppercase tracking-widest bg-primary text-white shadow-none border-b-4 border-primary/20 transition-all active:border-b-0 active:translate-y-1" isLoading={isSubmitting}>
                {t('actions.uploadNow')}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </Portal>
  );
}

function EditReelModal({ onClose, editingReel, editCaptionEn, setEditCaptionEn, editCaptionAr, setEditCaptionAr, editIsVisible, setEditIsVisible, editTags, setEditTags, editTagInput, setEditTagInput, onSubmit, isSubmitting }: any) {
  const t = useTranslations('Reels');
  const locale = useLocale();

  const addTag = () => {
    const tag = editTagInput.trim().toLowerCase();
    if (tag && !editTags.includes(tag) && editTags.length < 10) {
      setEditTags([...editTags, tag]);
      setEditTagInput('');
    }
  };

  const removeTag = (tag: string) => setEditTags(editTags.filter((t: string) => t !== tag));

  return (
    <Portal>
      <div dir={locale === 'ar' ? 'rtl' : 'ltr'} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={onClose}>
        <Card onClick={(e) => e.stopPropagation()} className="w-full max-w-xl bg-white border border-wf-border rounded-wf shadow-none p-10 md:p-12 animate-in zoom-in-95 slide-in-from-bottom-4 duration-500 text-start overflow-y-auto max-h-[95vh]" data-lenis-prevent>
          <div className="flex items-center justify-between mb-10 pb-6 border-b border-wf-border">
            <div className="space-y-1">
              <h2 className="text-2xl font-black text-wf-near-black uppercase tracking-tight">{t('labels.editTitle')}</h2>
              <p className="text-[11px] text-wf-gray-300 font-black uppercase tracking-widest opacity-60">{t('labels.editDesc', { id: editingReel?.id })}</p>
            </div>
            <button onClick={onClose} className="text-wf-gray-300 hover:text-wf-near-black transition-colors">
              <CloseCircle className="size-7" />
            </button>
          </div>

          <form onSubmit={onSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-wf-gray-300 uppercase tracking-[0.25em]">{t('labels.captionEn')}</label>
                <Input className="h-14 bg-slate-50 border-wf-border focus:bg-white focus:border-primary transition-all font-black uppercase tracking-widest text-xs rounded-wf text-start" value={editCaptionEn} onChange={(e: any) => setEditCaptionEn(e.target.value)} />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black text-wf-gray-300 uppercase tracking-[0.25em]">{t('labels.captionAr')}</label>
                <Input className="h-14 bg-slate-50 border-wf-border focus:bg-white focus:border-primary transition-all font-black uppercase tracking-widest text-xs rounded-wf text-start" value={editCaptionAr} onChange={(e: any) => setEditCaptionAr(e.target.value)} dir="rtl" />
              </div>
            </div>

            {/* Tags Editor */}
            <div className="space-y-3 p-5 bg-slate-50 border border-wf-border rounded-wf">
              <label className="text-[9px] font-black text-wf-gray-300 uppercase tracking-widest">Tags</label>
              {editTags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {editTags.map((tag: string, i: number) => (
                    <span key={i} className="flex items-center gap-1.5 px-3 py-1 bg-primary/5 text-primary border border-primary/10 rounded-full text-[9px] font-black uppercase tracking-widest">
                      #{tag}
                      <button type="button" onClick={() => removeTag(tag)} className="hover:text-wf-red transition-colors">
                        <CloseCircle className="size-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
              <div className="flex gap-2">
                <Input
                  className="flex-1 h-10 bg-white border-wf-border rounded-wf text-xs font-black uppercase tracking-widest"
                  placeholder="Add tag..."
                  value={editTagInput}
                  onChange={(e: any) => setEditTagInput(e.target.value)}
                  onKeyDown={(e: any) => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
                />
                <button
                  type="button"
                  onClick={addTag}
                  className="px-4 h-10 bg-primary/5 text-primary border border-primary/10 rounded-wf text-[10px] font-black uppercase tracking-widest hover:bg-primary/10 transition-colors"
                >
                  <AddCircle className="size-4" />
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between p-6 bg-slate-50 border border-wf-border rounded-wf">
              <div className="space-y-1">
                <p className="text-[11px] font-black text-wf-near-black uppercase tracking-widest">{t('labels.visibility')}</p>
                <p className="text-[9px] text-wf-gray-300 font-black uppercase tracking-widest opacity-40">{t('labels.visibilityDesc')}</p>
              </div>
              <button
                type="button"
                onClick={() => setEditIsVisible(!editIsVisible)}
                className={cn(
                  "relative h-8 w-14 rounded-full transition-all border shadow-inner",
                  editIsVisible ? "bg-primary border-primary/20" : "bg-slate-200 border-slate-300"
                )}
              >
                <span className={cn(
                  "absolute top-1/2 -translate-y-1/2 w-6 h-6 bg-white rounded-full shadow-md transition-all",
                  editIsVisible ? (locale === 'ar' ? "right-7" : "left-7") : (locale === 'ar' ? "right-1" : "left-1")
                )} />
              </button>
            </div>

            <div className="flex gap-4 pt-6 border-t border-wf-border">
              <Button type="button" variant="outline" className="flex-1 h-14 rounded-wf font-black uppercase tracking-widest" onClick={onClose}>
                {t('actions.cancel')}
              </Button>
              <Button type="submit" className="flex-1 h-14 rounded-wf font-black uppercase tracking-widest bg-wf-near-black text-white hover:bg-primary transition-all shadow-none border-b-4 border-slate-700 active:border-b-0 active:translate-y-1" isLoading={isSubmitting}>
                {t('actions.saveChanges')}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </Portal>
  );
}

function ReelDetailsModal({ reel, onClose }: { reel: Reel; onClose: () => void }) {
  const t = useTranslations('Reels');
  const locale = useLocale();
  const videoRef = useRef<HTMLVideoElement>(null);

  return (
    <Portal>
      <div dir={locale === 'ar' ? 'rtl' : 'ltr'} className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300" onClick={onClose}>
        <div onClick={(e) => e.stopPropagation()} className="relative w-full max-w-4xl max-h-[85vh] bg-white rounded-wf overflow-hidden shadow-2xl flex flex-col md:flex-row animate-in zoom-in-95 duration-500" data-lenis-prevent>
          <button 
            onClick={onClose} 
            className={cn("absolute top-4 z-20 size-10 bg-black/20 hover:bg-black/40 text-white rounded-full flex items-center justify-center transition-all", locale === 'ar' ? "left-4" : "right-4")}
          >
            <CloseCircle className="size-6" />
          </button>

          {/* Video Preview Section */}
          <div className="w-full md:w-1/2 bg-black relative flex items-center justify-center">
            {reel.videoUrl ? (
              <video 
                ref={videoRef}
                src={reel.videoUrl} 
                poster={reel.thumbnailUrl}
                className="w-full h-full object-contain max-h-[85vh]"
                controls
                autoPlay
                loop
              />
            ) : (
              <div className="w-full aspect-[9/16] flex flex-col items-center justify-center gap-4 text-white/40">
                <Videocamera className="size-16 opacity-20" />
                <p className="text-xs uppercase tracking-widest font-black">{t('labels.mediaUnavailable')}</p>
              </div>
            )}
          </div>

          {/* Details Section */}
          <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-between overflow-y-auto text-start">
            <div className="space-y-8">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="size-1.5 bg-primary rounded-full animate-pulse" />
                  <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">{t('labels.reelDetails')}</p>
                </div>
                <h2 className="text-3xl font-black text-wf-near-black uppercase tracking-tighter leading-none break-words">
                  {(locale === 'ar' ? reel.caption?.ar : reel.caption?.en) || t('labels.untitled')}
                </h2>
                <p className="text-sm font-medium text-wf-gray-300 leading-relaxed" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
                  {locale === 'ar' ? reel.caption?.en : reel.caption?.ar}
                </p>
              </div>

              {/* Tags Display */}
              {reel.tags && reel.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {reel.tags.map((tag, i) => (
                    <span key={i} className="px-3 py-1 bg-primary/5 text-primary border border-primary/10 rounded-full text-[9px] font-black uppercase tracking-widest">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Engagement Metrics Grid */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-slate-50 border border-wf-border p-5 rounded-wf space-y-3 group hover:border-primary/40 transition-all">
                  <div className="size-10 bg-rose-500/10 text-rose-500 rounded-wf flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Heart className="size-5" />
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-2xl font-black text-wf-near-black tracking-tight">{reel.likesCount?.toLocaleString()}</p>
                    <p className="text-[9px] font-black text-wf-gray-300 uppercase tracking-widest">{t('labels.totalLikes')}</p>
                  </div>
                </div>

                <div className="bg-slate-50 border border-wf-border p-5 rounded-wf space-y-3 group hover:border-primary/40 transition-all">
                  <div className="size-10 bg-blue-500/10 text-blue-500 rounded-wf flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Eye className="size-5" />
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-2xl font-black text-wf-near-black tracking-tight">{reel.viewsCount?.toLocaleString()}</p>
                    <p className="text-[9px] font-black text-wf-gray-300 uppercase tracking-widest">{t('labels.totalViews')}</p>
                  </div>
                </div>

                <div className="bg-slate-50 border border-wf-border p-5 rounded-wf space-y-3 group hover:border-primary/40 transition-all">
                  <div className="size-10 bg-emerald-500/10 text-emerald-500 rounded-wf flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Forward className={cn("size-5", locale === 'ar' && "rotate-180")} />
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-2xl font-black text-wf-near-black tracking-tight">{reel.sharesCount?.toLocaleString()}</p>
                    <p className="text-[9px] font-black text-wf-gray-300 uppercase tracking-widest">{t('labels.totalShares')}</p>
                  </div>
                </div>
              </div>

              {/* Additional Metadata */}
              <div className="space-y-4 pt-4 border-t border-wf-border">
                <div className="flex items-center justify-between py-2 border-b border-wf-border/50">
                  <span className="text-[10px] font-black text-wf-gray-300 uppercase tracking-widest">{t('labels.reelId')}</span>
                  <span className="text-[11px] font-mono font-bold text-wf-near-black truncate max-w-[120px]">{reel.id}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-wf-border/50">
                  <span className="text-[10px] font-black text-wf-gray-300 uppercase tracking-widest">{t('labels.capturedAt')}</span>
                  <span className="text-[11px] font-bold text-wf-near-black">
                    {new Date(reel.createdAt).toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' })}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-[10px] font-black text-wf-gray-300 uppercase tracking-widest">{t('labels.statusLabel')}</span>
                  <span className={cn(
                    "text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border",
                    reel.isVisible ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-slate-100 text-wf-gray-300 border-wf-border"
                  )}>
                    {reel.isVisible ? t('status.visible') : t('status.hidden')}
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-8">
              <Button 
                onClick={onClose}
                variant="outline"
                className="w-full h-14 rounded-wf font-black uppercase tracking-widest border-2"
              >
                {t('actions.close')}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Portal>
  );
}
