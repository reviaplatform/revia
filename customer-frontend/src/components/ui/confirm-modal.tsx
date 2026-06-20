"use client";

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { CloseCircle, InfoCircle, CheckCircle, Danger } from '@solar-icons/react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'primary' | 'success';
  isLoading?: boolean;
}

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'primary',
  isLoading = false
}: ConfirmModalProps) {
  
  const [shouldRender, setShouldRender] = useState(false);
  const [mounted, setMounted] = useState(false);
  const backdropRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const colors = {
    danger: {
      bg: 'bg-red-50',
      icon: 'text-red-500',
      button: 'bg-red-500 hover:bg-red-600',
      border: 'border-red-100'
    },
    primary: {
      bg: 'bg-blue-50',
      icon: 'text-[#0254ff]',
      button: 'bg-[#0254ff] hover:bg-blue-600',
      border: 'border-blue-100'
    },
    success: {
      bg: 'bg-green-50',
      icon: 'text-green-500',
      button: 'bg-green-500 hover:bg-green-600',
      border: 'border-green-100'
    }
  };

  const config = colors[type];

  useGSAP(() => {
    if (isOpen) {
      setShouldRender(true);
    } else if (shouldRender) {
      const tl = gsap.timeline({
        onComplete: () => setShouldRender(false)
      });
      tl.to(backdropRef.current, { opacity: 0, duration: 0.2 })
        .to(modalRef.current, { opacity: 0, scale: 0.9, y: 20, duration: 0.2 }, "<");
    }
  }, [isOpen]);

  useGSAP(() => {
    if (shouldRender && isOpen) {
      const tl = gsap.timeline();
      tl.fromTo(backdropRef.current, { opacity: 0 }, { opacity: 1, duration: 0.3 })
        .fromTo(modalRef.current, 
          { opacity: 0, scale: 0.9, y: 20 }, 
          { opacity: 1, scale: 1, y: 0, duration: 0.4, ease: "back.out(1.7)" }, 
          "-=0.1"
        );
    }
  }, [shouldRender, isOpen]);

  if (!shouldRender || !mounted) return null;

  return createPortal(
    <>
      {/* Backdrop */}
      <div
        ref={backdropRef}
        onClick={onClose}
        className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-[200] opacity-0"
      />
      
      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center z-[201] p-4 pointer-events-none">
        <div
          ref={modalRef}
          className="bg-white rounded-lg w-full max-w-md overflow-hidden pointer-events-auto border border-border opacity-0"
        >
          <div className="p-8">
            <div className={`w-16 h-16 ${config.bg} rounded-lg flex items-center justify-center mb-6 border border-border`}>
              {type === 'danger' && <Danger size={32} className={config.icon} />}
              {type === 'primary' && <InfoCircle size={32} className={config.icon} />}
              {type === 'success' && <CheckCircle size={32} className={config.icon} />}
            </div>

            <h3 className="text-2xl font-black text-foreground tracking-tight mb-3">{title}</h3>
            <p className="text-foreground/50 leading-relaxed font-semibold text-xs mb-8">
              {message}
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={onClose}
                disabled={isLoading}
                className="flex-1 px-6 py-4 rounded-md font-black text-[11px] uppercase tracking-widest text-foreground/40 bg-foreground/5 hover:bg-foreground/10 transition-all hover-translate disabled:opacity-50"
              >
                {cancelText}
              </button>
              <button
                onClick={onConfirm}
                disabled={isLoading}
                className={`flex-1 px-6 py-4 rounded-md font-black text-[11px] uppercase tracking-widest text-white transition-all hover-translate flex items-center justify-center gap-2 disabled:opacity-50 ${config.button}`}
              >
                {isLoading && <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />}
                {confirmText}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>,
    document.body
  );
}

