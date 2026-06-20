"use client";

import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { Camera, CloseCircle, Refresh, CameraAdd } from "@solar-icons/react";
import { cn } from "@/lib/utils";

interface CameraCaptureProps {
  onCapture: (file: File) => void;
  onClose: () => void;
  isAr?: boolean;
}

export default function CameraCapture({
  onCapture,
  onClose,
  isAr,
}: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [showPermissionPrompt, setShowPermissionPrompt] = useState(true);
  const [mounted, setMounted] = useState(false);

  const startCamera = async () => {
    setShowPermissionPrompt(false);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment",
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setHasPermission(true);
        setIsStreaming(true);
      }
    } catch (err) {
      console.error("Failed to access camera", err);
      setHasPermission(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
    }
  };

  useEffect(() => {
    setMounted(true);
    // Prevent background scrolling
    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = "hidden";

    return () => {
      stopCamera();
      document.body.style.overflow = originalStyle;
    };
  }, []);

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const file = new File([blob], `capture_${Date.now()}.jpg`, {
                type: "image/jpeg",
              });
              onCapture(file);
            }
          },
          "image/jpeg",
          0.9
        );
      }
    }
  };

  if (!mounted) return null;

  return createPortal(
    <div className="fixed inset-0 bg-[#080808]/90 z-[1000] flex flex-col items-center justify-center p-4 transition-opacity animate-in fade-in duration-300">
      {showPermissionPrompt ? (
        <div className="w-full max-w-sm bg-white rounded-lg border border-[#d8d8d8] p-8 flex flex-col items-center text-center shadow-sm">
          <div className="w-16 h-16 bg-[#146ef5]/10 text-[#146ef5] rounded-lg flex items-center justify-center mb-6">
            <Camera size={32} />
          </div>

          <h3 className="text-2xl font-semibold text-[#080808] mb-3">
            {isAr ? "الكاميرا مطلوبة" : "Camera Access Needed"}
          </h3>

          <p className="text-[16px] text-[#5a5a5a] mb-8 leading-relaxed max-w-xs">
            {isAr
              ? "نحتاج للوصول إلى الكاميرا لالتقاط صور واضحة للعطل ومساعدتنا في التشخيص."
              : "We need camera access to capture clear photos of the issue for accurate AI diagnosis."}
          </p>

          <div className="w-full flex flex-col gap-3">
            <button
              onClick={startCamera}
              className="w-full py-3.5 bg-[#146ef5] text-white font-medium text-[16px] tracking-[-0.16px] rounded-lg transition-transform hover:-translate-y-1.5 active:translate-y-0"
            >
              {isAr ? "السماح بالوصول" : "Allow Camera Access"}
            </button>
            <button
              onClick={onClose}
              className="w-full py-3.5 bg-transparent text-[#080808] font-medium text-[16px] tracking-[-0.16px] rounded-lg border border-transparent hover:border-[#d8d8d8] transition-all"
            >
              {isAr ? "ليس الآن" : "Not Now"}
            </button>
          </div>
        </div>
      ) : hasPermission === false ? (
        <div className="w-full max-w-sm bg-white rounded-lg border border-[#d8d8d8] p-8 flex flex-col items-center text-center shadow-sm">
          <div className="w-16 h-16 bg-[#ee1d36]/10 text-[#ee1d36] rounded-lg flex items-center justify-center mb-6">
            <CloseCircle size={32} />
          </div>

          <h3 className="text-2xl font-semibold text-[#080808] mb-3">
            {isAr ? "فشل الوصول" : "Access Denied"}
          </h3>

          <p className="text-[16px] text-[#5a5a5a] mb-8 leading-relaxed max-w-xs">
            {isAr
              ? "يرجى تفعيل الكاميرا من إعدادات المتصفح للمتابعة."
              : "Please enable camera access in your browser settings to proceed."}
          </p>

          <button
            onClick={onClose}
            className="w-full py-3.5 bg-white text-[#080808] font-medium text-[16px] tracking-[-0.16px] rounded-lg border border-[#d8d8d8] transition-transform hover:-translate-y-1.5 active:translate-y-0"
          >
            {isAr ? "إغلاق" : "Close"}
          </button>
        </div>
      ) : (
        <div className="w-full max-w-lg aspect-[3/4] sm:aspect-square bg-[#080808] rounded-lg overflow-hidden relative border border-[#d8d8d8]">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover transition-opacity duration-700 ease-in-out"
          />

          {/* Flat Viewfinder Overlay */}
          <div className="absolute inset-8 border border-white/30 pointer-events-none flex items-center justify-center">
            <div className="w-8 h-8 border-t-[3px] border-l-[3px] border-white absolute -top-[1.5px] -left-[1.5px]" />
            <div className="w-8 h-8 border-t-[3px] border-r-[3px] border-white absolute -top-[1.5px] -right-[1.5px]" />
            <div className="w-8 h-8 border-b-[3px] border-l-[3px] border-white absolute -bottom-[1.5px] -left-[1.5px]" />
            <div className="w-8 h-8 border-b-[3px] border-r-[3px] border-white absolute -bottom-[1.5px] -right-[1.5px]" />
          </div>

          {/* Top Actions */}
          <div className="absolute top-4 right-4 z-30">
            <button
              onClick={onClose}
              className="w-10 h-10 bg-white text-[#080808] rounded-full flex items-center justify-center hover:-translate-y-1.5 transition-transform active:translate-y-0 shadow-sm"
            >
              <CloseCircle size={24} />
            </button>
          </div>

          {isStreaming && (
            <div className="absolute bottom-8 inset-x-0 flex justify-center items-center z-20 animate-in slide-in-from-bottom-4 duration-300">
              <button
                onClick={capturePhoto}
                className="w-20 h-20 rounded-full border-[4px] border-white/50 flex items-center justify-center group hover:scale-105 active:scale-95 transition-all duration-200"
              >
                <div className="w-16 h-16 bg-white rounded-full" />
              </button>
            </div>
          )}
        </div>
      )}

      <canvas ref={canvasRef} className="hidden" />

      {!showPermissionPrompt && hasPermission !== false && (
        <div className="mt-6 text-center space-y-1">
          <p className="text-white font-medium text-[16px]">
            {isAr ? "التقط صورة للعطل" : "Capture the Issue"}
          </p>
          <p className="text-[#ababab] text-[12.8px] font-[550] uppercase tracking-[1.5px]">
            {isAr
              ? "تأكد من وجود إضاءة جيدة"
              : "Ensure good lighting for better diagnosis"}
          </p>
        </div>
      )}
    </div>,
    document.body
  );
}
