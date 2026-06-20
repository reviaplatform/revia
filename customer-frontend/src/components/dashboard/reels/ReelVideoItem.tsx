"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Reel } from '@/lib/api/types';
import { likeReel, viewReel } from '@/lib/api/reels';
import { Heart, Play, Eye, Plain, VolumeLoud, VolumeCross } from '@solar-icons/react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { getTranslation } from '@/lib/utils';

interface ReelVideoItemProps {
  reel: Reel;
  lang: 'en' | 'ar';
  isActive: boolean;
}

export default function ReelVideoItem({ reel, lang, isActive }: ReelVideoItemProps) {
  const isAr = lang === 'ar';
  const containerRef = useRef<HTMLDivElement>(null);
  const playIconRef = useRef<HTMLDivElement>(null);
  const likeButtonRef = useRef<HTMLButtonElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const [isLiked, setIsLiked] = useState(reel.isLiked);
  const [likesCount, setLikesCount] = useState(reel.likesCount);
  const [viewsCount, setViewsCount] = useState(reel.viewsCount);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [hasViewed, setHasViewed] = useState(false);
  const [showFlash, setShowFlash] = useState<'play' | 'pause' | null>(null);
  const [duration, setDuration] = useState(0);
  const [played, setPlayed] = useState(0);
  const [isLiking, setIsLiking] = useState(false);

  const autoPlayTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync muted to the DOM element — React's `muted` prop is not reactive after mount
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = isMuted;
    }
  }, [isMuted]);

  // Auto-play / pause when active state changes
  useEffect(() => {
    if (autoPlayTimerRef.current) {
      clearTimeout(autoPlayTimerRef.current);
      autoPlayTimerRef.current = null;
    }

    if (!isActive) {
      setIsPlaying(false);
      setPlayed(0);
      const video = videoRef.current;
      if (video) {
        video.pause();
        video.currentTime = 0;
      }
    } else if (isActive && isReady) {
      autoPlayTimerRef.current = setTimeout(() => {
        const video = videoRef.current;
        if (!video) return;
        setIsPlaying(true);
        video.play().catch((err) => {
          if (err.name !== 'AbortError') console.error('[ReelVideoItem] play error:', err);
        });
      }, 350);
    }

    return () => {
      if (autoPlayTimerRef.current) {
        clearTimeout(autoPlayTimerRef.current);
        autoPlayTimerRef.current = null;
      }
    };
  }, [isActive, isReady]);

  // ── Entrance animation ────────────────────────────────────────
  useGSAP(() => {
    if (isActive && containerRef.current) {
      gsap.fromTo(
        containerRef.current,
        { opacity: 0, scale: 0.97 },
        { opacity: 1, scale: 1, duration: 0.4, ease: 'power2.out' }
      );
    }
  }, [isActive]);

  // ── Play/Pause flash animation ────────────────────────────────
  useGSAP(() => {
    if (showFlash && playIconRef.current) {
      gsap.killTweensOf(playIconRef.current);
      const tl = gsap.timeline({ onComplete: () => setShowFlash(null) });
      tl.fromTo(
        playIconRef.current,
        { scale: 0.6, opacity: 0 },
        { scale: 1.05, opacity: 1, duration: 0.18, ease: 'back.out(3)' }
      ).to(playIconRef.current, {
        scale: 1.4,
        opacity: 0,
        duration: 0.35,
        delay: 0.15,
        ease: 'power2.in',
      });
    }
  }, [showFlash]);

  // ── Like bounce animation ─────────────────────────────────────
  const animateLike = useCallback(() => {
    if (!likeButtonRef.current) return;
    gsap.timeline()
      .to(likeButtonRef.current, { scale: 1.3, duration: 0.15, ease: 'back.out(3)' })
      .to(likeButtonRef.current, { scale: 1, duration: 0.2, ease: 'elastic.out(1, 0.4)' });
  }, []);

  // ── Progress bar animation ────────────────────────────────────
  useEffect(() => {
    if (progressRef.current) {
      gsap.to(progressRef.current, {
        scaleX: played,
        duration: 0.5,
        ease: 'none',
        transformOrigin: isAr ? 'right center' : 'left center',
      });
    }
  }, [played, isAr]);

  // ─────────────────────────────────────────────────────────────
  // Handlers
  // ─────────────────────────────────────────────────────────────

  const handleTogglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (isPlaying) {
      video.pause();
      setIsPlaying(false);
      setShowFlash('pause');
    } else {
      video.play().catch((err) => {
        if (err.name !== 'AbortError') console.error('[ReelVideoItem] play error:', err);
      });
      setIsPlaying(true);
      setShowFlash('play');
    }
  };

  const handleToggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMuted((prev) => !prev);
  };

  const handleLoadedMetadata = () => {
    const video = videoRef.current;
    if (video && !isNaN(video.duration) && video.duration > 0) {
      setDuration(video.duration);
    }
    setIsReady(true);
  };

  const handleCanPlay = () => {
    if (!isReady) setIsReady(true);
  };

  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (!video || !video.duration) return;
    const fraction = video.currentTime / video.duration;
    setPlayed(fraction);
    if (duration === 0 && !isNaN(video.duration)) {
      setDuration(video.duration);
    }
  };

  const handlePlay = () => {
    setIsPlaying(true);
    if (!hasViewed) {
      viewReel(reel.id).catch(() => {});
      setViewsCount((v) => v + 1);
      setHasViewed(true);
    }
  };

  const handlePause = () => setIsPlaying(false);

  const handleEnded = () => {
    setPlayed(0);
    const video = videoRef.current;
    if (video) {
      video.currentTime = 0;
      video.play().catch(() => {});
    }
  };

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isLiking) return;
    setIsLiking(true);

    const prevLiked = isLiked;
    const prevCount = likesCount;
    setIsLiked(!prevLiked);
    setLikesCount(prevCount + (prevLiked ? -1 : 1));
    animateLike();

    try {
      const data = await likeReel(reel.id);
      if (data) {
        setIsLiked(data.isLiked);
        setLikesCount(data.likesCount);
      }
    } catch {
      setIsLiked(prevLiked);
      setLikesCount(prevCount);
    } finally {
      setIsLiking(false);
    }
  };



  const formatCount = (n: number) => {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
    return String(n);
  };

  // ─────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────

  // ─────────────────────────────────────────────────────────────
  // Responsive check
  // ─────────────────────────────────────────────────────────────
  const [isMobileLayout, setIsMobileLayout] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobileLayout(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // ─────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────

  return (
    <div ref={containerRef} className="h-full w-full flex items-center justify-center relative bg-transparent">
      {/* 9:16 column — height/width drives size */}
      <div 
        className="relative h-full aspect-[9/16] group transition-all duration-500 flex items-center justify-center" 
        style={{ 
          maxHeight: '80dvh',
          width: isMobileLayout ? '95%' : 'auto' 
        }}
      >

        {/* ── Video Container ─────────────────────────────────── */}
        <div
          className="h-full w-full bg-black rounded-2xl overflow-hidden border border-border/60 group-hover:border-brand-500/30 transition-all duration-500 relative cursor-pointer select-none"
          onClick={handleTogglePlay}
        >
          {/* Native video element */}
          <video
            ref={videoRef}
            src={reel.videoUrl || reel.video}
            poster={reel.thumbnailUrl || reel.thumbnail}
            playsInline
            preload="metadata"
            onLoadedMetadata={handleLoadedMetadata}
            onCanPlay={handleCanPlay}
            onTimeUpdate={handleTimeUpdate}
            onPlay={handlePlay}
            onPause={handlePause}
            onEnded={handleEnded}
            style={{
              objectFit: 'cover',
              width: '100%',
              height: '100%',
              position: 'absolute',
              inset: 0,
              display: 'block',
            }}
          />

          {/* Top gradient + metadata */}
          <div className="absolute top-0 inset-x-0 p-5 bg-gradient-to-b from-black/80 to-transparent pointer-events-none z-10">
            <p className="wf-uppercase-label !text-[8px] sm:text-[9px] tracking-[0.2em] text-brand-400 font-black mb-1">
              {isAr ? 'بث الاستكشاف' : 'Discovery Stream'}
            </p>
            <h4 className="text-white font-bold tracking-tight text-sm sm:text-base truncate max-w-[70%]">
              {reel.creatorName || (isAr ? 'مستخدم ريفيا' : 'Revia Creator')}
            </h4>
          </div>

          {/* Bottom gradient + description + progress */}
          <div className="absolute bottom-0 inset-x-0 z-10 pointer-events-none">
            <div className={`px-5 pb-6 sm:pb-8 pt-20 bg-gradient-to-t from-black/90 via-black/40 to-transparent ${isMobileLayout ? 'pr-16 rtl:pl-16' : ''}`}>
              <h3 className="text-white font-black text-sm sm:text-base mb-1.5 leading-tight truncate">
                {getTranslation(reel.title, lang)}
              </h3>
              <p className="text-[11px] sm:text-xs text-white/70 leading-relaxed font-medium line-clamp-2 max-w-[90%]">
                {getTranslation(reel.description, lang) || (isAr ? 'استكشف عالم الصيانة الذكي مع ريفيا.' : 'Exploring the smart side of device repair.')}
              </p>
            </div>

            {/* Progress bar */}
            <div className="h-[2px] sm:h-[3px] w-full bg-white/10 relative overflow-hidden">
              <div
                ref={progressRef}
                className="absolute inset-y-0 left-0 right-0 bg-brand-500 origin-left"
                style={{ transform: 'scaleX(0)' }}
              />
            </div>
          </div>

          {/* Play/Pause flash overlay */}
          {showFlash && (
            <div
              ref={playIconRef}
              className="absolute inset-0 m-auto z-20 pointer-events-none w-[64px] h-[64px] sm:w-[72px] sm:h-[72px] rounded-2xl bg-black/40 backdrop-blur-md flex items-center justify-center border border-white/20 text-white"
            >
              {showFlash === 'play' ? (
                <Play size={28} />
              ) : (
                <div className="flex gap-1.5">
                  <div className="w-[4px] sm:w-[5px] h-6 sm:h-8 rounded-full bg-white" />
                  <div className="w-[4px] sm:w-[5px] h-6 sm:h-8 rounded-full bg-white" />
                </div>
              )}
            </div>
          )}

          {/* Initial play prompt */}
          {!isPlaying && !showFlash && isActive && isReady && (
            <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
              <div className="w-[64px] h-[64px] sm:w-[72px] sm:h-[72px] rounded-2xl bg-black/40 backdrop-blur-md flex items-center justify-center border border-white/20 text-white animate-pulse">
                <Play size={28} />
              </div>
            </div>
          )}

          {/* ── Mobile Action Sidebar (Inside Overlay) ────────────── */}
          {isMobileLayout && (
            <div className={`absolute bottom-12 ${isAr ? 'left-3' : 'right-3'} flex flex-col items-center gap-6 z-20`}>
              {/* Like */}
              <div className="flex flex-col items-center gap-1">
                <button
                  onClick={handleLike}
                  disabled={isLiking}
                  className={`w-11 h-11 rounded-full flex items-center justify-center transition-all active:scale-90 ${
                    isLiked ? 'text-brand-500' : 'text-white'
                  }`}
                >
                  <Heart size={26} fill={isLiked ? 'currentColor' : 'none'} strokeWidth={isLiked ? 0 : 2} />
                </button>
                <span className="text-[10px] font-black text-white tabular-nums">{formatCount(likesCount)}</span>
              </div>



              {/* Volume */}
              <button
                onClick={handleToggleMute}
                className="w-11 h-11 flex items-center justify-center text-white active:scale-90 transition-transform"
              >
                {isMuted ? <VolumeCross size={22} /> : <VolumeLoud size={22} />}
              </button>
            </div>
          )}
        </div>

        {/* ── Desktop Action Sidebar (Outside) ─────────────────── */}
        {!isMobileLayout && (
          <div className={`absolute bottom-10 ${isAr ? 'right-[calc(100%+24px)]' : 'left-[calc(100%+24px)]'} flex flex-col items-center gap-6 z-10`}>

            {/* Volume */}
            <ActionButton
              onClick={handleToggleMute}
              active={!isMuted}
              label={isMuted ? (isAr ? 'كتم' : 'Muted') : (isAr ? 'صوت' : 'Audio')}
            >
              {isMuted ? <VolumeCross size={22} /> : <VolumeLoud size={22} />}
            </ActionButton>

            {/* Like */}
            <div className="flex flex-col items-center gap-1.5">
              <button
                ref={likeButtonRef}
                onClick={handleLike}
                disabled={isLiking}
                className={`w-14 h-14 rounded-xl flex items-center justify-center transition-all duration-300 ${
                  isLiked
                    ? 'bg-brand-500 text-white scale-105'
                    : 'bg-white text-foreground/50 hover:text-brand-500 border border-border hover:border-brand-500/30'
                }`}
              >
                <Heart size={22} fill={isLiked ? 'currentColor' : 'none'} strokeWidth={isLiked ? 0 : 1.8} />
              </button>
              <span className="wf-uppercase-label !text-[10px] text-foreground/50 font-black tabular-nums">
                {formatCount(likesCount)}
              </span>
            </div>

            {/* Views */}
            <div className="flex flex-col items-center gap-1.5">
              <div className="w-14 h-14 rounded-xl bg-white text-foreground/30 flex items-center justify-center border border-border">
                <Eye size={22} />
              </div>
              <span className="wf-uppercase-label !text-[10px] text-foreground/50 font-black tabular-nums">
                {formatCount(viewsCount)}
              </span>
            </div>



          </div>
        )}

        {/* Duration badge */}
        {duration > 0 && (
          <div className="absolute top-4 right-4 z-10 px-2 py-0.5 rounded-md bg-black/50 backdrop-blur-sm text-white text-[10px] font-bold tracking-wide pointer-events-none">
            {formatDuration(duration * (1 - played))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Helpers ──────────────────────────────────────────────────── */

function ActionButton({
  onClick,
  active,
  label,
  children,
}: {
  onClick: (e: React.MouseEvent) => void;
  active: boolean;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <button
        onClick={onClick}
        className={`w-14 h-14 rounded-xl flex items-center justify-center transition-colors duration-200 ${
          active
            ? 'bg-brand-500 text-white'
            : 'bg-white text-foreground/50 hover:text-brand-500 border border-border hover:border-brand-500/30'
        }`}
      >
        {children}
      </button>
      <span className="wf-uppercase-label !text-[10px] text-foreground/50 font-black">{label}</span>
    </div>
  );
}

function formatDuration(seconds: number): string {
  const s = Math.max(0, Math.floor(seconds));
  const m = Math.floor(s / 60);
  const rem = s % 60;
  return `${m}:${rem.toString().padStart(2, '0')}`;
}
