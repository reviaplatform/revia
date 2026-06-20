"use client";

import React, { useState, useEffect } from 'react';
import { Reel } from '@/lib/api/types';
import { getAllReels } from '@/lib/api/reels';
import ReelCard from './ReelCard';

export default function ReelsGrid({ lang }: { lang: 'en' | 'ar' }) {
  const [reels, setReels] = useState<Reel[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchReels = async () => {
      try {
        const res = await getAllReels();
        setReels(res);
      } catch (err) {
        console.error('Failed to fetch reels', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchReels();
  }, []);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="aspect-[9/16] bg-gray-100 rounded-3xl animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {reels.map((reel) => (
        <ReelCard key={reel.id} reel={reel} lang={lang} />
      ))}
    </div>
  );
}
