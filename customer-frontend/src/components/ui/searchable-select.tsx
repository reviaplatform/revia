"use client";

import React, { useState, useMemo } from 'react';
import { AltArrowDown, Magnifer } from '@solar-icons/react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface SearchableSelectProps {
  options: string[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  isAr?: boolean;
  disabled?: boolean;
}

export function SearchableSelect({
  options,
  value,
  onChange,
  placeholder = "Select...",
  searchPlaceholder = "Search...",
  isAr = false,
  disabled = false,
}: SearchableSelectProps) {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);

  const filteredOptions = useMemo(() => {
    if (!search) return options;
    return options.filter(opt => 
      opt.toLowerCase().includes(search.toLowerCase())
    );
  }, [options, search]);

  return (
    <DropdownMenu open={open} onOpenChange={(val) => {
      setOpen(val);
      if (val) setSearch(""); // Reset search when opening
    }}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          disabled={disabled}
          className={`w-full flex items-center justify-between px-4 py-3 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 bg-white text-foreground transition-all font-semibold disabled:bg-foreground/5 disabled:text-foreground/40 disabled:cursor-not-allowed ${isAr ? 'flex-row-reverse' : ''}`}
        >
          <span className="truncate">{value || placeholder}</span>
          <AltArrowDown size={18} className="text-gray-400 flex-shrink-0" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        className="w-[var(--radix-dropdown-menu-trigger-width)] min-w-[200px] bg-white rounded-lg border border-border select-none z-[60] p-1 flex flex-col max-h-[300px] shadow-lg shadow-black/[0.05]"
        align="start"
      >
        <div className="p-2 sticky top-0 bg-white border-b border-border mb-1">
          <div className="relative">
            <Magnifer size={16} className={`absolute top-1/2 -translate-y-1/2 text-foreground/40 ${isAr ? 'right-3' : 'left-3'}`} />
            <input
              type="text"
              autoFocus
              placeholder={searchPlaceholder}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={`w-full bg-foreground/[0.02] border border-border rounded-md py-2.5 text-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none font-semibold ${isAr ? 'pr-10 pl-3 text-right' : 'pl-10 pr-3 text-left'}`}
              onKeyDown={(e) => {
                if (e.key === ' ') e.stopPropagation(); // Prevent dropdown from closing on space
              }}
            />
          </div>
        </div>
        <div className="overflow-y-auto flex-1 no-scrollbar">
          {filteredOptions.length > 0 ? (
            filteredOptions.map((opt) => (
              <DropdownMenuItem
                key={opt}
                onClick={() => {
                  onChange(opt);
                  setOpen(false);
                }}
                className={`cursor-pointer hover:bg-foreground/[0.02] focus:bg-foreground/[0.02] px-3 py-2.5 rounded-md text-sm font-semibold text-foreground/70 ${isAr ? 'text-right' : 'text-left'}`}
              >
                {opt}
              </DropdownMenuItem>
            ))
          ) : (
            <div className="px-3 py-4 text-center text-sm text-gray-400">
              {isAr ? 'لا توجد نتائج' : 'No results found'}
            </div>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
