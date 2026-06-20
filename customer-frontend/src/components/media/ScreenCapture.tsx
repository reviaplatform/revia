"use client";

import React from 'react';
import { MonitorCamera, CloseCircle } from '@solar-icons/react';

interface ScreenCaptureProps {
  onCapture: (file: File) => void;
  isAr?: boolean;
}

export default function ScreenCapture({ onCapture, isAr }: ScreenCaptureProps) {
  const captureScreen = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { displaySurface: 'browser' }
      });
      
      const video = document.createElement('video');
      video.srcObject = stream;
      video.onloadedmetadata = () => {
        video.play();
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          canvas.toBlob((blob) => {
            if (blob) {
              const file = new File([blob], `screenshot_${Date.now()}.jpg`, { type: 'image/jpeg' });
              onCapture(file);
              // Stop stream
              stream.getTracks().forEach(track => track.stop());
            }
          }, 'image/jpeg', 0.9);
        }
      };
    } catch (err) {
      console.error('Failed to capture screen', err);
    }
  };

  return (
    <button
      type="button"
      onClick={captureScreen}
      className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-xl transition-colors border border-gray-200"
    >
      <MonitorCamera size={18} />
      {isAr ? 'التقاط شاشة' : 'Screen Capture'}
    </button>
  );
}
