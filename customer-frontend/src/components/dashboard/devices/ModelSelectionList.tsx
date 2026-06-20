"use client";

import React, { useState, useMemo, useRef } from 'react';
import { Magnifer } from '@solar-icons/react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';

interface ModelSelectionListProps {
  models: string[];
  selectedModel: string;
  onSelect: (model: string) => void;
  lang: 'en' | 'ar';
}

export function ModelSelectionList({ models, selectedModel, onSelect, lang }: ModelSelectionListProps) {
  const isAr = lang === 'ar';
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  const filteredModels = useMemo(() => {
    if (!search) return models;
    return models.filter(m => m.toLowerCase().includes(search.toLowerCase()));
  }, [models, search]);

  useGSAP(() => {
    if (containerRef.current) {
      const items = containerRef.current.querySelectorAll('.model-item');
      gsap.fromTo(items, 
        { 
          opacity: 0, 
          x: isAr ? 20 : -20 
        }, 
        { 
          opacity: 1, 
          x: 0, 
          duration: 0.4, 
          stagger: 0.03, 
          ease: "power2.out",
          clearProps: "all"
        }
      );
    }
  }, { dependencies: [filteredModels.length], scope: containerRef });

  return (
    <div className="space-y-6">
      <div className="relative group">
        <Magnifer 
          size={18} 
          className={`absolute top-1/2 -translate-y-1/2 text-foreground/20 group-focus-within:text-brand-500 transition-colors ${isAr ? 'right-4' : 'left-4'}`} 
        />
        <input
          type="text"
          placeholder={isAr ? 'بحث عن الموديل (مثلاً: iPhone 15 Pro)' : 'Search for model (e.g. Galaxy S24)'}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={`w-full bg-foreground/[0.015] border border-border/60 rounded-lg py-3 focus:ring-2 focus:ring-brand-500/10 focus:border-brand-500/50 outline-none font-bold transition-all placeholder:text-foreground/20 shadow-sm ${
            isAr ? 'pr-12 pl-4 text-right' : 'pl-12 pr-4 text-left'
          }`}
        />
      </div>

      <div 
        ref={containerRef}
        className="space-y-2 max-h-[300px] overflow-y-auto no-scrollbar pr-1"
        role="radiogroup"
      >
        {filteredModels.map((model) => (
          <button
            key={model}
            onClick={() => onSelect(model)}
            role="radio"
            aria-checked={selectedModel === model}
            className={`model-item w-full flex items-center justify-between p-4 rounded-lg border transition-all duration-300 outline-none focus-visible:ring-2 focus-visible:ring-brand-500/20 hover-translate bg-white ${
              selectedModel === model
                ? 'border-brand-500 bg-brand-500/5 ring-2 ring-brand-500/10'
                : 'border-border hover:border-brand-500/20'
            }`}
          >
            <span className={`font-bold tracking-tight transition-colors duration-300 ${selectedModel === model ? 'text-brand-500' : 'text-foreground/70'}`}>
              {model}
            </span>
            {selectedModel === model && (
               <div className="w-5 h-5 bg-brand-500 rounded-full flex items-center justify-center text-white shadow-sm animate-in zoom-in duration-300">
                  <div className="w-2.5 h-1.5 border-l-2 border-b-2 border-white -rotate-45 mb-0.5" />
               </div>
            )}
          </button>
        ))}

        <button
          onClick={() => onSelect("Manual Input")}
          role="radio"
          aria-checked={selectedModel === "Manual Input"}
          className={`model-item w-full flex items-center justify-between p-4 rounded-lg border border-dashed transition-all duration-300 outline-none focus-visible:ring-2 focus-visible:ring-brand-500/20 hover-translate bg-white ${
            selectedModel === "Manual Input"
              ? 'border-brand-500 bg-brand-500/5 ring-2 ring-brand-500/10'
              : 'border-border hover:border-brand-500/20'
          }`}
        >
          <span className={`font-bold tracking-tight transition-colors duration-300 ${selectedModel === "Manual Input" ? 'text-brand-500' : 'text-foreground/40'}`}>
            {isAr ? 'موديل آخر / غير موجود للقائمة' : "Other model / Not listed"}
          </span>
          <span className="text-foreground/20 text-[10px] font-black uppercase tracking-[0.2em]">{isAr ? 'يدوي' : 'Manual'}</span>
        </button>
      </div>

      {filteredModels.length === 0 && (
        <div className="text-center py-8 text-foreground/40 font-bold">
          {isAr ? 'لم نجد الموديل. جرب كتابته يدوياً.' : "Model not found. Try manual input."}
        </div>
      )}
    </div>
  );
}
