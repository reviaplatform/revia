"use client";

import React, { useState } from 'react';
import { submitReview } from '@/lib/api/repairs';
import { Star, CheckCircle, InfoCircle } from '@solar-icons/react';
import { Button } from "@/components/ui/button";

interface ReviewFormProps {
  requestId: string;
  lang: 'en' | 'ar';
  onSuccess: () => void;
}

export default function ReviewForm({ requestId, lang, onSuccess }: ReviewFormProps) {
  const isAr = lang === 'ar';
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      setError(isAr ? 'يرجى اختيار تقييم' : 'Please select a rating');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      await submitReview(requestId, rating, comment);
      setSubmitted(true);
      setTimeout(onSuccess, 3000);
    } catch (err) {
      setError(isAr ? 'فشل إرسال التقييم' : 'Failed to submit review');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="bg-secondary-green/5 border border-secondary-green/10 rounded-lg p-10 text-center">
        <div className="w-16 h-16 bg-secondary-green/10 text-secondary-green rounded-lg flex items-center justify-center mx-auto mb-6">
          <CheckCircle size={40} />
        </div>
        <h3 className="wf-uppercase-label !text-[14px] text-foreground font-black mb-3">
          {isAr ? 'شكراً لتقييمك!' : 'Thank you for your feedback!'}
        </h3>
        <p className="text-secondary-green/80 text-xs font-semibold leading-relaxed">
          {isAr ? 'تم إرسال تقييمك بنجاح ونحن نقدر رأيك.' : 'Your review has been submitted successfully. We appreciate your input.'}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-border rounded-lg p-10">
      <h3 className="wf-uppercase-label !text-[11px] text-foreground/40 mb-10 text-center tracking-widest">
        {isAr ? 'كيف كانت تجربتك؟' : 'How was your experience?'}
      </h3>

      <div className="flex justify-center gap-3 mb-12">
        {[1, 2, 3, 4, 5].map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setRating(s)}
            className={`w-14 h-14 flex items-center justify-center rounded-lg transition-all border border-border ${
              rating >= s ? 'text-secondary-yellow bg-secondary-yellow/5 border-secondary-yellow/20 shadow-sm shadow-secondary-yellow/10' : 'text-foreground/10 hover:text-secondary-yellow/50'
            }`}
          >
            <Star size={32} fill={rating >= s ? 'currentColor' : 'none'} />
          </button>
        ))}
      </div>

      <div className="space-y-6">
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={4}
          maxLength={500}
          className="w-full px-6 py-5 bg-foreground/[0.01] border border-border rounded-md focus:ring-1 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all text-foreground resize-none text-sm font-semibold tracking-tight placeholder:text-foreground/20"
          placeholder={isAr ? 'اكتب تعليقك هنا (اختياري)...' : 'Write your comment here (optional)...'}
        />

        {error && (
          <div className="flex items-center gap-2.5 text-secondary-red text-[10px] font-black uppercase tracking-widest">
            <InfoCircle size={16} />
            {error}
          </div>
        )}

        <Button
          type="submit"
          isLoading={isSubmitting}
          loadingText={isAr ? 'جاري الإرسال...' : 'Submitting...'}
          className="w-full bg-brand-500 hover:bg-brand-600 text-white font-black py-6 rounded-md shadow-lg shadow-brand-500/10 text-xs uppercase tracking-[0.15em]"
        >
          {isAr ? 'إرسال التقييم' : 'Submit Review'}
        </Button>
      </div>
    </form>
  );
}
