"use client";

import React, { useState, useMemo, useRef } from 'react';
import { Magnifer } from '@solar-icons/react';
import { Apple } from 'lucide-react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';

interface BrandSelectionGridProps {
  brands: string[];
  selectedBrand: string;
  onSelect: (brand: string) => void;
  lang: 'en' | 'ar';
}

export function BrandSelectionGrid({ brands, selectedBrand, onSelect, lang }: BrandSelectionGridProps) {
  const isAr = lang === 'ar';
  const [search, setSearch] = useState("");
  const gridRef = useRef<HTMLDivElement>(null);

  const filteredBrands = useMemo(() => {
    if (!search) return brands;
    return brands.filter(b => b.toLowerCase().includes(search.toLowerCase()));
  }, [brands, search]);

  const BrandIcon = ({ name }: { name: string }) => {
    const lowerName = name.toLowerCase();
    if (lowerName === 'apple') return <Apple size={24} />;
    return <span className="text-xl font-black">{name.charAt(0)}</span>;
  };

  useGSAP(() => {
    if (gridRef.current) {
      const items = gridRef.current.querySelectorAll('.brand-item');
      gsap.fromTo(items, 
        { 
          opacity: 0, 
          scale: 0.8, 
          y: 10 
        }, 
        { 
          opacity: 1, 
          scale: 1, 
          y: 0, 
          duration: 0.4, 
          stagger: 0.05, 
          ease: "power3.out",
          clearProps: "all"
        }
      );
    }
  }, { dependencies: [filteredBrands.length], scope: gridRef });

  return (
    <div className="space-y-6">
      <div className="relative group">
        <Magnifer 
          size={18} 
          className={`absolute top-1/2 -translate-y-1/2 text-foreground/20 group-focus-within:text-brand-500 transition-colors ${isAr ? 'right-4' : 'left-4'}`} 
        />
        <input
          type="text"
          placeholder={isAr ? 'بحث عن الشركة (مثلاً: Apple)' : 'Search for a brand (e.g. Samsung)'}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={`w-full bg-foreground/[0.015] border border-border/60 rounded-lg py-3 focus:ring-2 focus:ring-brand-500/10 focus:border-brand-500/50 outline-none font-bold transition-all placeholder:text-foreground/20 shadow-sm ${
            isAr ? 'pr-12 pl-4 text-right' : 'pl-12 pr-4 text-left'
          }`}
        />
      </div>

      <div 
        ref={gridRef}
        className="grid grid-cols-2 sm:grid-cols-3 gap-4"
        role="radiogroup"
      >
        {filteredBrands.map((brand) => (
          <button
            key={brand}
            onClick={() => onSelect(brand)}
            role="radio"
            aria-checked={selectedBrand === brand}
            className={`brand-item flex flex-col items-center justify-center p-6 rounded-lg border transition-all duration-300 outline-none focus-visible:ring-2 focus-visible:ring-brand-500/20 hover-translate bg-white ${
              selectedBrand === brand
                ? 'border-brand-500 bg-brand-500/5 ring-2 ring-brand-500/10 shadow-sm'
                : 'border-border hover:border-brand-500/20'
            }`}
          >
            <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 transition-all duration-300 ${
              selectedBrand === brand ? 'bg-brand-500 text-white shadow-md shadow-brand-500/10' : 'bg-foreground/[0.03] text-foreground/40 font-bold'
            }`}>
              <BrandIcon name={brand} />
            </div>
            <span className={`text-sm font-bold tracking-tight transition-colors duration-300 ${selectedBrand === brand ? 'text-brand-500' : 'text-foreground/70'}`}>
              {brand}
            </span>
          </button>
        ))}

        {/* Other / Manual Fallback Option */}
        <button
          onClick={() => onSelect("Other")}
          role="radio"
          aria-checked={selectedBrand === "Other"}
          className={`brand-item flex flex-col items-center justify-center p-6 rounded-lg border border-dashed transition-all duration-300 outline-none focus-visible:ring-2 focus-visible:ring-brand-500/20 hover-translate bg-white ${
            selectedBrand === "Other"
              ? 'border-brand-500 bg-brand-500/5 ring-2 ring-brand-500/10 shadow-sm'
              : 'border-border hover:border-brand-500/20'
          }`}
        >
          <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 border border-dashed transition-all duration-300 ${
            selectedBrand === "Other" ? 'bg-brand-500 text-white border-transparent shadow-md shadow-brand-500/10' : 'border-border text-foreground/20'
          }`}>
            <span className="text-xl font-bold">?</span>
          </div>
          <span className={`text-sm font-bold tracking-tight transition-colors duration-300 ${selectedBrand === "Other" ? 'text-brand-500' : 'text-foreground/40'}`}>
            {isAr ? 'أخرى / غير متوفر' : 'Other / Unlisted'}
          </span>
        </button>
      </div>

      {filteredBrands.length === 0 && (
        <div className="text-center py-12 text-foreground/40 font-bold">
          {isAr ? 'لم نجد هذه الشركة. جرب الضغط على "أخرى".' : "Brand not found. Try selecting 'Other'."}
        </div>
      )}
    </div>
  );
}

