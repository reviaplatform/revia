'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Microphone, StopCircle, TrashBinMinimalistic } from '@solar-icons/react';

interface VoiceRecorderProps {
  onCapture: (file: File) => void;
  onCancel?: () => void;
}

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

export default function VoiceRecorder({ onCapture, onCancel }: VoiceRecorderProps) {
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
        onCapture(new File([blob], `voice_message.${ext}`, { type: actualMime }));
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      timerRef.current = setInterval(() => setRecordingTime(t => t + 1), 1000);
    } catch {
      alert('Microphone access failed. Please allow microphone permissions.');
    }
  };

  const stopRecording = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    stopStream();
    setIsRecording(false);
  };

  const fmt = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  return (
    <div className="flex items-center gap-3 bg-slate-50 p-2 rounded-wf border border-wf-border animate-in fade-in slide-in-from-bottom-2">
      {isRecording ? (
        <>
          <div className="flex items-center gap-2 px-3 flex-1">
            <div className="size-2 rounded-full bg-wf-red animate-pulse" />
            <span className="text-sm font-mono font-medium text-wf-near-black">{fmt(recordingTime)}</span>
          </div>
          <button
            type="button"
            onClick={stopRecording}
            className="size-10 bg-wf-red text-white rounded-wf flex items-center justify-center hover:bg-wf-red/90 transition-colors"
          >
            <StopCircle className="size-5" />
          </button>
        </>
      ) : (
        <>
          <button
            type="button"
            onClick={startRecording}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-wf-blue hover:bg-wf-blue/5 rounded-wf transition-colors"
          >
            <Microphone className="size-4" />
            Start Recording
          </button>
          {onCancel && (
            <button type="button" onClick={onCancel} className="text-wf-gray-300 hover:text-wf-red transition-colors">
              <TrashBinMinimalistic className="size-4" />
            </button>
          )}
        </>
      )}
    </div>
  );
}
