"use client";

import React, { useState } from 'react';
import { createSupportTicket } from '@/lib/api/support';
import { SupportTicketPriority } from '@/lib/api/types';
import { CloseCircle, AltArrowDown } from '@solar-icons/react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

interface CreateTicketFormProps {
  lang: 'en' | 'ar';
  onSuccess: () => void;
  onCancel: () => void;
}

export default function CreateTicketForm({ lang, onSuccess, onCancel }: CreateTicketFormProps) {
  const isAr = lang === 'ar';
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [priority, setPriority] = useState<SupportTicketPriority>(SupportTicketPriority.MEDIUM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim()) {
      setError(isAr ? 'يرجى إدخال الموضوع' : 'Please enter a subject');
      return;
    }
    if (!message.trim()) {
      setError(isAr ? 'يرجى إدخال الرسالة' : 'Please enter a message');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      await createSupportTicket({
        subject,
        message,
        priority,
      });
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.error?.message || (isAr ? 'فشل إنشاء التذكرة' : 'Failed to create ticket'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 bg-foreground/[0.01] p-8 rounded-lg border border-border">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-black text-foreground tracking-tight">
          {isAr ? 'تذكرة دعم جديدة' : 'New Support Ticket'}
        </h3>
        <button type="button" onClick={onCancel} className="text-foreground/20 hover:text-foreground/40 transition-colors">
          <CloseCircle size={28} />
        </button>
      </div>

      <div className="space-y-8">
        {/* Subject */}
        <div>
          <label className="wf-uppercase-label !text-[11px] text-foreground/40 mb-3 block">
            {isAr ? 'الموضوع' : 'Subject'}
          </label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            required
            className="w-full px-5 py-4 border border-border rounded-md focus:outline-none focus:ring-4 focus:ring-brand-500/5 focus:border-brand-500/40 transition-all text-foreground font-semibold text-[15px]"
            placeholder={isAr ? 'أدخل موضوع التذكرة...' : 'Enter ticket subject...'}
          />
        </div>

        {/* Priority Selection */}
        <div>
          <label className="wf-uppercase-label !text-[11px] text-foreground/40 mb-3 block">
            {isAr ? 'الأولوية' : 'Priority'}
          </label>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="w-full flex items-center justify-between px-5 py-4 border border-border rounded-md bg-white focus:outline-none focus:ring-4 focus:ring-brand-500/5 focus:border-brand-500/40 transition-all text-foreground font-semibold text-[15px]"
              >
                <div className="flex items-center gap-4">
                  <span className="tracking-tight">
                    {isAr 
                      ? (priority === SupportTicketPriority.LOW ? 'منخفضة' : priority === SupportTicketPriority.MEDIUM ? 'متوسطة' : 'عالية')
                      : priority}
                  </span>
                </div>
                <AltArrowDown size={18} className="text-foreground/20" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-[var(--radix-dropdown-menu-trigger-width)] bg-white rounded-md border-border p-1 shadow-2xl shadow-black/10 z-[60]">
              {[SupportTicketPriority.LOW, SupportTicketPriority.MEDIUM, SupportTicketPriority.HIGH].map((p) => (
                <DropdownMenuItem 
                  key={p}
                  onClick={() => setPriority(p)}
                  className={`cursor-pointer hover:bg-foreground/[0.02] focus:bg-foreground/[0.02] px-4 py-3 rounded-sm text-sm flex items-center gap-4 text-foreground outline-none transition-colors ${isAr ? 'justify-end' : ''}`}
                >
                  <div className="font-bold tracking-tight">
                    {isAr 
                      ? (p === SupportTicketPriority.LOW ? 'منخفضة' : p === SupportTicketPriority.MEDIUM ? 'متوسطة' : 'عالية')
                      : p}
                  </div>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Message */}
        <div>
          <label className="wf-uppercase-label !text-[11px] text-foreground/40 mb-3 block">
            {isAr ? 'الرسالة' : 'Message'}
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
            rows={4}
            className="w-full px-5 py-4 border border-border rounded-md focus:outline-none focus:ring-4 focus:ring-brand-500/5 focus:border-brand-500/40 transition-all text-foreground font-semibold text-[15px] resize-none"
            placeholder={isAr ? 'صف مشكلتك بالتفصيل...' : 'Describe your issue in detail...'}
          />
        </div>

        {error && (
          <div className="text-[11px] text-secondary-red font-bold bg-secondary-red/5 p-4 rounded-md border border-secondary-red/10 animate-shake flex items-center gap-3">
             <div className="w-1.5 h-1.5 rounded-full bg-secondary-red" />
             {error}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-4 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="flex-1 py-4 font-bold uppercase tracking-widest text-xs"
          >
            {isAr ? 'إلغاء' : 'Cancel'}
          </Button>
          <Button
            type="submit"
            isLoading={isSubmitting}
            loadingVariant="morph"
            className="flex-[2] bg-brand-500 hover:bg-brand-600 text-white font-bold py-4 rounded-md shadow-sm shadow-brand-500/20 uppercase tracking-widest text-xs"
          >
            {isAr ? 'إرسال التذكرة' : 'Submit Ticket'}
          </Button>
        </div>
      </div>
    </form>
  );
}
