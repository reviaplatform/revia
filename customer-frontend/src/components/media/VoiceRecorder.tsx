"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Microphone, StopCircle, TrashBinMinimalistic } from '@solar-icons/react';
import { cn } from '@/lib/utils';

interface VoiceRecorderProps {
  onCapture: (file: File) => void;
  onCancel?: () => void;
  isAr?: boolean;
}

// Pick the first MIME type the browser actually supports
function getSupportedMimeType(): string {
  const candidates = [
    'audio/webm;codecs=opus',
    'audio/webm',
    'audio/ogg;codecs=opus',
    'audio/ogg',
    'audio/mp4',
  ];
  return candidates.find(t => typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported(t)) ?? '';
}

function mimeToExtension(mimeType: string): string {
  if (mimeType.includes('ogg')) return 'ogg';
  if (mimeType.includes('mp4')) return 'mp4';
  return 'webm';
}

export default function VoiceRecorder({ onCapture, onCancel, isAr }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      stopStream();
    };
  }, []);

  const stopStream = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(t => t.stop());
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = getSupportedMimeType();
      const mediaRecorder = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream);

      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const actualMime = mediaRecorder.mimeType || mimeType || 'audio/webm';
        const ext = mimeToExtension(actualMime);
        const blob = new Blob(audioChunksRef.current, { type: actualMime });
        const file = new File([blob], `voice_message.${ext}`, { type: actualMime });
        onCapture(file);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      timerRef.current = setInterval(() => setRecordingTime(t => t + 1), 1000);
    } catch (err: any) {
      console.error('Failed to start recording:', err);
      alert(isAr ? 'فشل الوصول إلى الميكروفون' : 'Microphone access failed. Please allow microphone permissions.');
    }
  };

  const stopRecording = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    stopStream();
    setIsRecording(false);
  };

  const fmt = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  return (
    <div className="flex items-center gap-3 bg-gray-50 p-2 rounded-2xl border border-gray-100 animate-in fade-in slide-in-from-bottom-2">
      {isRecording ? (
        <>
          <div className="flex items-center gap-2 px-3 flex-1">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-sm font-medium text-gray-700 font-mono">{fmt(recordingTime)}</span>
          </div>
          <button
            type="button"
            onClick={stopRecording}
            className="w-10 h-10 bg-red-500 text-white rounded-xl flex items-center justify-center hover:bg-red-600 transition-colors"
          >
            <StopCircle size={20} />
          </button>
        </>
      ) : (
        <>
          <button
            type="button"
            onClick={startRecording}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-[#0254ff] hover:bg-[#0254ff]/5 rounded-xl transition-colors"
          >
            <Microphone size={18} />
            {isAr ? 'بدء التسجيل' : 'Start Recording'}
          </button>
          {onCancel && (
            <button type="button" onClick={onCancel} className="text-gray-400 hover:text-red-500 transition-colors">
              <TrashBinMinimalistic size={18} />
            </button>
          )}
        </>
      )}
    </div>
  );
}
