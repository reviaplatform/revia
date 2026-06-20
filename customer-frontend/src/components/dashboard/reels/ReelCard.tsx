"use client";

import React, { useState, useEffect } from 'react';
import { Reel } from '@/lib/api/types';
import { likeReel, viewReel } from '@/lib/api/reels';
import { Heart, Play, Eye } from '@solar-icons/react';
import { getTranslation } from '@/lib/utils';

interface ReelCardProps {
  reel: Reel;
  lang: 'en' | 'ar';
}

export default function ReelCard({ reel, lang }: ReelCardProps) {
  const isAr = lang === 'ar';
  const [isLiked, setIsLiked] = useState(reel.isLiked);
  const [likesCount, setLikesCount] = useState(reel.likesCount);

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const data = await likeReel(reel.id);
      setIsLiked(data.isLiked);
      setLikesCount(data.likesCount);
    } catch (err) {
      console.error('Failed to like reel', err);
    }
  };

  return (
    <div 
      className="group relative aspect-[9/16] bg-black rounded-3xl overflow-hidden cursor-pointer transition-all hover:scale-[1.02]"
      onClick={() => viewReel(reel.id)}
    >
      <img 
        src={reel.thumbnailUrl || reel.thumbnail} 
        alt={getTranslation(reel.title, lang)}
        className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
      />
      
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-6">
        <h3 className="text-white font-bold mb-3 line-clamp-2">{getTranslation(reel.title, lang)}</h3>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-white/90">
            <button 
              onClick={handleLike}
              className={`flex items-center gap-1.5 transition-colors ${isLiked ? 'text-red-500' : 'hover:text-red-400'}`}
            >
              <Heart size={20} fill={isLiked ? 'currentColor' : 'none'} />
              <span className="text-xs font-bold">{likesCount}</span>
            </button>
            <div className="flex items-center gap-1.5">
              <Eye size={20} />
              <span className="text-xs font-bold">{reel.viewsCount}</span>
            </div>
          </div>
          
          <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white">
            <Play size={20} />
          </div>
        </div>
      </div>
    </div>
  );
}
