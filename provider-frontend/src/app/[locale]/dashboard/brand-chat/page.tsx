'use client';

import React, { useEffect, useState, useRef } from 'react';
import { brandChatService } from '@/services/brandChatService';
import { subscriptionService } from '@/services/subscriptionService';
import { ChatSession, ChatMessage } from '@/types/brandChat';
import { Subscription } from '@/types/subscription';
import { Button } from '@/components/ui/Button';
import { Portal } from '@/components/ui/Portal';
import { Card } from '@/components/ui/Card';
import { 
  Forward, 
  Gallery, 
  MagicStick, 
  LockPassword, 
  User,
  CloseCircle,
  ChatRoundLine,
  Stars,
  AddCircle,
  Microphone,
  Play,
  Pause,
  MusicNotes,
  DangerTriangle,
  CheckCircle,
  ClipboardList
} from '@solar-icons/react';
import VoiceRecorder from '@/components/media/VoiceRecorder';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';
import Image from 'next/image';
import Link from 'next/link';
import { getMediaUrl } from '@/lib/api';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { getSocket, disconnectSocket } from '@/lib/socket';
import { useTranslations, useLocale } from 'next-intl';
import { cn } from '@/lib/utils';

function isPlayableSrc(src: string): boolean {
  return Boolean(src) && (
    src.startsWith('http://') || src.startsWith('https://') ||
    src.startsWith('blob:') || src.startsWith('data:')
  );
}

function BrandAudioPlayer({ src, isUser }: { src: string; isUser: boolean }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);
  const validSrc = isPlayableSrc(src);

  const toggle = () => {
    if (!validSrc || !audioRef.current) return;
    if (isPlaying) { audioRef.current.pause(); } else { audioRef.current.play().catch(() => setIsPlaying(false)); }
    setIsPlaying(!isPlaying);
  };

  return (
    <div className={cn('flex items-center gap-3 px-4 py-3 min-w-[200px]', isUser ? 'text-white' : 'text-wf-blue')}>
      {validSrc && (
        <audio
          ref={audioRef}
          src={src}
          onTimeUpdate={() => {
            if (audioRef.current && audioRef.current.duration)
              setProgress((audioRef.current.currentTime / audioRef.current.duration) * 100);
          }}
          onEnded={() => setIsPlaying(false)}
          className="hidden"
        />
      )}
      <button
        onClick={toggle}
        disabled={!validSrc}
        className={cn(
          'size-9 rounded-wf flex items-center justify-center transition-all active:scale-90',
          isUser ? 'bg-white/20 text-white' : 'bg-wf-blue/10 text-wf-blue',
          !validSrc && 'opacity-40 cursor-not-allowed'
        )}
      >
        {!validSrc
          ? <div className="size-3 border border-current border-t-transparent rounded-full animate-spin" />
          : isPlaying
          ? <Pause className="size-4" />
          : <Play className="size-4 ml-0.5" />
        }
      </button>
      <div className="flex-1 flex flex-col gap-1">
        <div className={cn('h-1.5 rounded-full relative overflow-hidden', isUser ? 'bg-white/20' : 'bg-wf-blue/10')}>
          <div className={cn('absolute inset-y-0 left-0 transition-all duration-300', isUser ? 'bg-white' : 'bg-wf-blue')} style={{ width: `${progress}%` }} />
        </div>
        <div className="flex justify-between items-center px-0.5">
          <MusicNotes className="size-2.5 opacity-50" />
          <span className="text-[9px] font-bold tracking-widest opacity-70 uppercase">Voice</span>
        </div>
      </div>
    </div>
  );
}

interface DiagnosticReport {
  device_type?: string;
  device_brand?: string;
  model?: string;
  symptom?: string;
  diy_attempted?: string[];
  probable_cause?: string;
  urgency_level?: string;
  status?: string;
  diagnostic_report?: string[];
}

function extractDiagnosticReport(content: string): { report: DiagnosticReport; text: string } | null {
  const match = content.match(/```(?:json)?\n?([\s\S]*?)\n?```/);
  const raw = match ? match[1] : content.trim();
  if (!raw.trim().startsWith('{')) return null;
  try {
    const parsed = JSON.parse(raw);
    if (parsed && (parsed.status === 'technician_required' || parsed.status === 'resolved')) {
      const text = match ? content.replace(match[0], '').trim() : '';
      return { report: parsed as DiagnosticReport, text };
    }
  } catch {
    // not valid JSON, ignore
  }
  return null;
}

function urgencyStyles(level?: string) {
  switch ((level || '').toLowerCase()) {
    case 'high':
      return { dot: 'bg-wf-red', text: 'text-wf-red', bg: 'bg-wf-red/5', border: 'border-wf-red/20' };
    case 'medium':
      return { dot: 'bg-amber-500', text: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' };
    default:
      return { dot: 'bg-wf-green', text: 'text-wf-green', bg: 'bg-wf-green/5', border: 'border-wf-green/20' };
  }
}

function DiagnosticReportCard({ report }: { report: DiagnosticReport }) {
  const isResolved = report.status === 'resolved';
  const urgency = urgencyStyles(report.urgency_level);
  const deviceLine = [report.device_brand, report.model || report.device_type]
    .filter(Boolean)
    .join(' · ');

  return (
    <div className={cn(
      'rounded-wf border overflow-hidden max-w-full',
      isResolved ? 'bg-wf-green/5 border-wf-green/20' : 'bg-white border-wf-border'
    )}>
      <div className={cn(
        'flex items-center gap-3 px-4 md:px-5 py-3 border-b',
        isResolved ? 'border-wf-green/10' : 'border-wf-border'
      )}>
        <div className={cn(
          'size-9 rounded-wf flex items-center justify-center border shrink-0',
          isResolved ? 'bg-wf-green/10 text-wf-green border-wf-green/20' : 'bg-wf-blue/10 text-wf-blue border-wf-blue/20'
        )}>
          {isResolved ? <CheckCircle className="size-5" /> : <ClipboardList className="size-5" />}
        </div>
        <div className="min-w-0">
          <p className={cn('text-xs font-bold uppercase tracking-[1.5px]', isResolved ? 'text-wf-green' : 'text-wf-near-black')}>
            {isResolved ? 'Diagnostic Resolved' : 'Technician Required'}
          </p>
          {deviceLine && (
            <p className="text-[10px] font-semibold text-wf-gray-700 truncate">{deviceLine}</p>
          )}
        </div>
        {report.urgency_level && (
          <div className={cn('ml-auto flex items-center gap-1.5 px-2.5 py-1 rounded-wf border shrink-0', urgency.bg, urgency.border)}>
            <span className={cn('size-1.5 rounded-full', urgency.dot)} />
            <span className={cn('text-[9px] font-bold uppercase tracking-[1.5px]', urgency.text)}>{report.urgency_level}</span>
          </div>
        )}
      </div>

      <div className="px-4 md:px-5 py-4 space-y-4">
        {report.symptom && (
          <div className="flex items-start gap-2.5">
            <DangerTriangle className="size-4 text-wf-gray-700 mt-0.5 shrink-0" />
            <p className="text-xs md:text-sm font-medium text-wf-near-black leading-relaxed">{report.symptom}</p>
          </div>
        )}

        {report.diagnostic_report && report.diagnostic_report.length > 0 && (
          <ul className="space-y-2.5">
            {report.diagnostic_report.map((point, idx) => (
              <li key={idx} className="flex gap-2.5 text-xs md:text-sm text-wf-near-black font-medium leading-relaxed">
                <span className={cn('mt-1.5 size-1.5 rounded-full shrink-0', isResolved ? 'bg-wf-green' : 'bg-wf-blue')} />
                {point}
              </li>
            ))}
          </ul>
        )}

        {report.probable_cause && (
          <div className="bg-slate-50 border border-wf-border rounded-wf px-3.5 py-2.5">
            <p className="text-[9px] font-bold uppercase tracking-[1.5px] text-wf-gray-700 mb-1">Probable Cause</p>
            <p className="text-xs font-semibold text-wf-near-black leading-relaxed">{report.probable_cause}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function BrandChatPage() {
  const t = useTranslations('BrandChat');
  const locale = useLocale();
  const [session, setSession] = useState<ChatSession | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [messageContent, setMessageContent] = useState('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [showConfirmNewModal, setShowConfirmNewModal] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState<File | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [showMediaOptions, setShowMediaOptions] = useState(false);
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const [showLongWait, setShowLongWait] = useState(false);
  const [pendingLink, setPendingLink] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const socketRef = useRef<any>(null);
  const thinkingTimerRef = useRef<NodeJS.Timeout | null>(null);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const subData = await subscriptionService.getMySubscription();
      setSubscription(subData);

      if (subData?.status === 'active') {
        const sessionData = await brandChatService.getSession();
        setSession(sessionData);
        
        // Initialize socket after session is loaded
        const token = localStorage.getItem('providerAccessToken');
        if (token) {
          const socket = getSocket(token);
          socketRef.current = socket;

          socket.on('brandChat:newMessage', (message: ChatMessage) => {
            setSession(prev => {
              if (!prev) return prev;
              const exists = prev.messages.some(m =>
                m.role === message.role &&
                m.content === message.content &&
                m.type === message.type &&
                new Date(m.createdAt).getTime() === new Date(message.createdAt).getTime()
              );
              if (exists) return prev;
              return { ...prev, messages: [...prev.messages, message] };
            });
            if (message.role === 'assistant') {
              setIsSending(false);
              setActiveTool(null);
              setShowLongWait(false);
              if (thinkingTimerRef.current) clearTimeout(thinkingTimerRef.current);
            }
          });

          socket.on('brandChat:toolStarted', (payload: { toolName: string }) => {
            setActiveTool(payload.toolName);
          });
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error(t('messages.initError'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    return () => {
      disconnectSocket();
    };
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [session?.messages, isSending]);

  // 12s long-wait indicator (same as customer ChatPopup)
  useEffect(() => {
    if (isSending) {
      thinkingTimerRef.current = setTimeout(() => setShowLongWait(true), 12000);
    } else {
      if (thinkingTimerRef.current) clearTimeout(thinkingTimerRef.current);
      setShowLongWait(false);
    }
    return () => { if (thinkingTimerRef.current) clearTimeout(thinkingTimerRef.current); };
  }, [isSending]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleVoiceCapture = (file: File) => {
    setSelectedVoice(file);
    setIsRecording(false);
    setShowMediaOptions(false);
  };

  const removeVoice = () => setSelectedVoice(null);

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!messageContent.trim() && !selectedImage && !selectedVoice) return;
    if (isSending) return;

    // Capture before clearing state
    const capturedContent = messageContent;
    const capturedFile = selectedVoice || selectedImage || undefined;

    // Optimistic update — show user message immediately
    const fileBlobUrl = capturedFile ? URL.createObjectURL(capturedFile) : undefined;
    const optimisticMsg: ChatMessage = {
      role: 'user',
      content: capturedFile ? (fileBlobUrl ?? '') : capturedContent,
      type: capturedFile ? (capturedFile.type.startsWith('audio/') ? 'voice' : 'image') : 'text',
      imageUrl: capturedFile && capturedFile.type.startsWith('image/') ? fileBlobUrl : undefined,
      createdAt: new Date().toISOString(),
    };
    setSession(prev => prev ? { ...prev, messages: [...prev.messages, optimisticMsg] } : prev);

    try {
      setIsSending(true);
      setActiveTool(null);
      setShowLongWait(false);
      await brandChatService.sendMessage(capturedContent, capturedFile);
      setMessageContent('');
      removeImage();
      removeVoice();

      // Safety timeout: if AI doesn't reply in 45s, reset the sending state
      setTimeout(() => {
        setIsSending(current => {
          if (current) {
            console.warn('AI response timeout');
            return false;
          }
          return false;
        });
      }, 45000);
    } catch (error: any) {
      console.error('Error sending message:', error);
      setIsSending(false);
      if (error.response?.status === 402) {
        toast.error(t('messages.subRequired'));
        setSubscription(prev => prev ? { ...prev, status: 'expired' } : null);
      } else {
        toast.error(t('messages.sendError'));
      }
    }
  };

  const handleStartNewSession = () => {
    if (isSending) return;
    setShowConfirmNewModal(true);
  };

  const confirmNewSession = async () => {
    setShowConfirmNewModal(false);
    try {
      setIsLoading(true);
      setActiveTool(null);
      setShowLongWait(false);
      const newSession = await brandChatService.startNewSession();
      setSession(newSession);
      toast.success(t('messages.sessionSuccess'));
    } catch (error) {
      console.error('Error starting new session:', error);
      toast.error(t('messages.sessionError'));
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 border-2 border-wf-blue/20 border-t-wf-blue rounded-full animate-spin"></div>
      </div>
    );
  }

  if (subscription?.status !== 'active') {
    return (
      <div className="max-w-4xl mx-auto flex flex-col items-center justify-center min-h-[60vh] space-y-10 text-center px-6 py-12">
        <div className="reveal-item relative">
          <div className="relative size-24 md:size-32 bg-white rounded-wf border border-wf-border flex items-center justify-center">
            <LockPassword className="size-12 md:size-16 text-wf-gray-700" />
          </div>
          <div className="absolute -bottom-2 -right-2 size-10 bg-wf-red rounded-wf flex items-center justify-center border border-white">
            <MagicStick className="size-5 text-white" />
          </div>
        </div>

        <div className="reveal-item space-y-4 max-w-lg">
          <div className="inline-flex items-center gap-2 px-2 py-1 rounded-wf bg-wf-red/10 text-wf-red border border-wf-red/20 mx-auto">
            <LockPassword className="size-3.5" />
            <span className="text-[10px] font-bold uppercase tracking-[1.5px] font-ui">{t('restricted.badge')}</span>
          </div>
          <h1 className="text-wf-text-section font-semibold tracking-[-0.8px] text-wf-near-black leading-[1.04] uppercase">
            {t('restricted.title').split('Locked')[0]} <span className="text-wf-red">{locale === 'ar' ? 'مقفل' : 'Locked'}</span>
          </h1>
          <p className="text-wf-gray-700 text-lg font-medium leading-relaxed">
            {t('restricted.desc')}
          </p>
        </div>

        <div className="reveal-item flex flex-col sm:flex-row gap-4 w-full max-w-md">
          <Button 
            asChild
            className="flex-1 h-14 rounded-wf bg-wf-blue hover:bg-wf-blue/90 text-white font-semibold uppercase tracking-[1.5px] transition-all hover:translate-x-1.5 shadow-none"
          >
            <Link href="/dashboard/subscription">
              {t('restricted.upgrade')}
            </Link>
          </Button>
        </div>

        <div className="reveal-item grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
            {[t('prompts.pricing'), t('prompts.marketing'), t('prompts.trends'), t('prompts.complaint')].map((feature) => (
                <div key={feature} className="p-4 rounded-wf border border-wf-border bg-white flex flex-col items-center gap-3 group hover:border-wf-blue/50 transition-colors">
                    <div className="size-10 rounded-wf bg-wf-blue/5 flex items-center justify-center text-wf-blue border border-wf-blue/10">
                      <MagicStick className="size-5" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-[1px] text-wf-gray-700">{feature}</span>
                </div>
            ))}
        </div>
      </div>
    );
  }

  return (
    <div dir={locale === 'ar' ? 'rtl' : 'ltr'} className="flex flex-col h-[calc(100vh-7rem)] w-full bg-white rounded-wf border border-wf-border shadow-none overflow-hidden relative">
      <div className="p-4 md:p-6 border-b border-wf-border bg-white flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-3 md:gap-4">
          <div className="size-10 md:size-12 bg-wf-blue/10 rounded-wf flex items-center justify-center text-wf-blue border border-wf-blue/20 shrink-0">
            <MagicStick className="size-5 md:size-6" />
          </div>
          <div className="text-start">
            <h2 className="text-sm md:text-lg font-semibold tracking-tight text-wf-near-black uppercase">{t('title')}</h2>
            <div className="flex items-center gap-1.5">
              <div className="size-1.5 bg-wf-green rounded-full animate-pulse"></div>
              <span className="text-[9px] md:text-[10px] font-bold text-wf-gray-700 uppercase tracking-[1.5px]">{t('status')}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
            <button 
                onClick={handleStartNewSession}
                className="flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-wf bg-slate-50 border border-wf-border hover:bg-wf-blue/5 hover:border-wf-blue/20 transition-all group"
            >
                <AddCircle className="size-4 text-wf-gray-700 group-hover:text-wf-blue" />
                <span className="text-[10px] md:text-xs font-bold uppercase tracking-[1.5px] text-wf-gray-700 group-hover:text-wf-blue">{t('newSession')}</span>
            </button>
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-wf bg-slate-50 border border-wf-border">
                <Stars className="size-4 text-wf-purple" />
                <span className="text-[10px] font-bold uppercase tracking-[1.5px] text-wf-gray-700">{t('enterprise')}</span>
            </div>
        </div>
      </div>

      {/* Messages */}
      <div 
        ref={scrollRef}
        data-lenis-prevent
        className="flex-1 min-h-0 overflow-y-auto p-4 md:p-10 space-y-6 md:space-y-8 scroll-smooth bg-slate-50/30"
      >
        {session?.messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-8">
            <div className="size-16 md:size-20 bg-white rounded-wf flex items-center justify-center border border-wf-border">
                <ChatRoundLine className="size-8 md:size-10 text-wf-blue opacity-20" />
            </div>
            <div className="space-y-3">
                <h3 className="text-xl md:text-2xl font-semibold text-wf-near-black uppercase tracking-[-0.02em]">{t('howCanIHelp')}</h3>
                <p className="text-sm md:text-base text-wf-gray-700 font-medium max-w-md mx-auto">
                    {t('intro')}
                </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-xl">
                {[
                    t('prompts.pricing'),
                    t('prompts.marketing'),
                    t('prompts.trends'),
                    t('prompts.complaint')
                ].map((prompt) => (
                    <button 
                        key={prompt}
                        onClick={() => setMessageContent(prompt)}
                        className="p-4 text-start text-xs font-semibold text-wf-gray-700 border border-wf-border rounded-wf bg-white hover:border-wf-blue hover:text-wf-blue transition-all duration-300 group"
                    >
                        <div className="flex items-center justify-between">
                          <span>{prompt}</span>
                          <Forward className={cn("size-3.5 opacity-0 group-hover:opacity-100 transition-all", locale === 'ar' ? "translate-x-2 group-hover:translate-x-0 rotate-180" : "-translate-x-2 group-hover:translate-x-0")} />
                        </div>
                    </button>
                ))}
            </div>
          </div>
        ) : (
          session?.messages.map((msg, idx) => {
            const diagnosticReport = msg.role === 'assistant' && msg.type === 'text'
              ? extractDiagnosticReport(msg.content)
              : null;

            return (
            <div
              key={idx}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-4 duration-500`}
            >
              <div className={`flex gap-3 md:gap-4 max-w-[90%] md:max-w-[85%] ${msg.role === 'user' ? (locale === 'ar' ? 'flex-row' : 'flex-row-reverse') : (locale === 'ar' ? 'flex-row-reverse' : 'flex-row')}`}>
                <div className={`size-8 md:size-10 rounded-wf shrink-0 flex items-center justify-center border ${
                  msg.role === 'user'
                    ? 'bg-wf-blue border-white/10 text-white'
                    : 'bg-white border-wf-border text-wf-blue'
                }`}>
                  {msg.role === 'user' ? <User className="size-4 md:size-5" /> : <MagicStick className="size-4 md:size-5" />}
                </div>

                <div className={`space-y-2 ${msg.role === 'user' ? 'items-end' : 'items-start'} flex flex-col min-w-0`}>
                  {diagnosticReport ? (
                    <>
                      {diagnosticReport.text && (
                        <div className="p-4 md:p-5 rounded-wf border bg-white text-wf-near-black border-wf-border overflow-hidden text-start break-all max-w-full">
                          <div className="prose prose-sm prose-slate max-w-none break-all w-full prose-p:leading-relaxed prose-p:m-0 md:prose-base font-medium">
                            <ReactMarkdown
                              remarkPlugins={[remarkGfm]}
                              components={{
                                a: ({ href, children }) => (
                                  <a
                                    href={href}
                                    onClick={e => { e.preventDefault(); setPendingLink(href || ''); }}
                                    className="text-wf-blue underline underline-offset-2 cursor-pointer hover:text-wf-blue/70 transition-colors"
                                  >
                                    {children}
                                  </a>
                                ),
                              }}
                            >
                              {diagnosticReport.text}
                            </ReactMarkdown>
                          </div>
                        </div>
                      )}
                      <DiagnosticReportCard report={diagnosticReport.report} />
                    </>
                  ) : (
                  <div className={`p-4 md:p-5 rounded-wf border overflow-hidden text-start break-all max-w-full ${
                    msg.role === 'user'
                      ? 'bg-wf-blue text-white border-wf-blue'
                      : 'bg-white text-wf-near-black border-wf-border'
                  }`}>
                    {msg.type === 'image' && (msg.imageUrl || msg.content) && (
                      <div className="mb-4 rounded-wf overflow-hidden border border-wf-border max-w-full">
                        <img
                           src={getMediaUrl(msg.imageUrl || msg.content)}
                          alt={t('title')}
                          className="object-contain w-full max-h-[300px] md:max-h-[400px]"
                          onError={(e) => { (e.target as HTMLImageElement).src = '/revia-icon.png'; }}
                        />
                      </div>
                    )}
                    {msg.type === 'voice' && (msg.imageUrl || msg.content) && (
                      <BrandAudioPlayer
                        src={getMediaUrl(msg.imageUrl || msg.content)}
                        isUser={msg.role === 'user'}
                      />
                    )}
                    {msg.type === 'text' && (
                        <div className={`prose prose-sm max-w-none break-all w-full ${msg.role === 'user' ? 'prose-invert' : 'prose-slate'} prose-p:leading-relaxed prose-p:m-0 md:prose-base font-medium`}>
                        {msg.role === 'assistant' ? (
                            <ReactMarkdown
                              remarkPlugins={[remarkGfm]}
                              components={{
                                a: ({ href, children }) => (
                                  <a
                                    href={href}
                                    onClick={e => { e.preventDefault(); setPendingLink(href || ''); }}
                                    className="text-wf-blue underline underline-offset-2 cursor-pointer hover:text-wf-blue/70 transition-colors"
                                  >
                                    {children}
                                  </a>
                                ),
                              }}
                            >
                                {msg.content}
                            </ReactMarkdown>
                        ) : (
                            <p className="whitespace-pre-wrap break-all w-full">{msg.content}</p>
                        )}
                        </div>
                    )}
                  </div>
                  )}
                  <span className="text-[9px] md:text-[10px] font-bold text-wf-gray-300 uppercase tracking-[1.5px] px-1">
                    {new Date(msg.createdAt).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            </div>
            );
          })
        )}
        {isSending && (
          <div className="justify-start flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-2">
            <div className="flex gap-4 max-w-[80%]">
              <div className="size-8 md:size-10 rounded-wf bg-white border border-wf-border flex items-center justify-center text-wf-blue shrink-0">
                <MagicStick className="size-4 md:size-5" />
              </div>
              <div className="bg-white border border-wf-border p-4 md:p-5 rounded-wf flex items-center gap-3">
                <div className="flex gap-1.5">
                  <div className="size-1.5 bg-wf-blue/30 rounded-full animate-bounce"></div>
                  <div className="size-1.5 bg-wf-blue/60 rounded-full animate-bounce delay-75"></div>
                  <div className="size-1.5 bg-wf-blue rounded-full animate-bounce delay-150"></div>
                </div>
                {activeTool && (
                  <span className="text-[10px] font-bold text-wf-blue uppercase tracking-[1.5px] animate-pulse">
                    {activeTool === 'fetch_known_issues' ? 'Fetching Known Issues...' :
                     activeTool === 'search_repair_manuals' ? 'Consulting Repair Manuals...' :
                     'Analyzing...'}
                  </span>
                )}
              </div>
            </div>
            {showLongWait && (
              <div className="ml-14 bg-wf-blue/5 border border-wf-blue/20 rounded-wf px-5 py-3 flex items-start gap-3 max-w-[80%] animate-in fade-in slide-in-from-bottom-2">
                <MagicStick className="size-4 text-wf-blue shrink-0 mt-0.5" />
                <p className="text-[10px] font-bold text-wf-blue uppercase tracking-[1.5px] leading-relaxed">
                  Advisor is working on your query. This may take a moment — feel free to come back shortly.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 md:p-8 bg-white border-t border-wf-border relative z-10">
        {(imagePreview || selectedVoice) && (
          <div className="absolute bottom-full left-0 right-0 p-4 bg-white/90 backdrop-blur-md border-t border-wf-border animate-in slide-in-from-bottom-4 flex items-center gap-3">
            {imagePreview && (
              <div className="relative size-20 md:size-24 rounded-wf overflow-hidden border border-wf-blue">
                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                <button
                  onClick={removeImage}
                  className="absolute top-1 right-1 size-6 bg-wf-red text-white rounded-wf flex items-center justify-center hover:bg-wf-red/90 transition-colors"
                >
                  <CloseCircle className="size-4" />
                </button>
              </div>
            )}
            {selectedVoice && (
              <div className="flex items-center gap-3 bg-wf-blue/5 border border-wf-blue/20 rounded-wf px-4 py-2.5">
                <MusicNotes className="size-4 text-wf-blue" />
                <span className="text-xs font-semibold text-wf-blue">Voice Message Ready</span>
                <button onClick={removeVoice} className="text-wf-gray-300 hover:text-wf-red transition-colors ml-2">
                  <CloseCircle className="size-4" />
                </button>
              </div>
            )}
          </div>
        )}

        {isRecording && (
          <div className="absolute bottom-full left-0 right-0 p-4 bg-white/90 backdrop-blur-md border-t border-wf-border animate-in slide-in-from-bottom-4">
            <VoiceRecorder
              onCapture={handleVoiceCapture}
              onCancel={() => setIsRecording(false)}
            />
          </div>
        )}

        <form 
          onSubmit={handleSendMessage}
          className="relative flex items-center gap-3 md:gap-4"
        >
          <input 
            type="file" 
            ref={fileInputRef}
            onChange={handleImageSelect}
            className="hidden"
            accept="image/*"
          />
          
          <div className="flex-1 relative group">
            <textarea
              value={messageContent}
              onChange={(e) => setMessageContent(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              disabled={isSending}
              placeholder={isSending ? t('input.thinking') : t('input.placeholder')}
              className={cn(
                'w-full bg-slate-50 border border-wf-border rounded-wf px-4 md:px-6 py-4 focus:outline-none focus:border-wf-blue focus:ring-4 focus:ring-wf-blue/5 transition-all text-xs md:text-sm font-medium resize-none min-h-[56px] max-h-32 disabled:opacity-70 text-start',
                locale === 'ar' ? 'pl-24 md:pl-28' : 'pr-24 md:pr-28'
              )}
              rows={1}
            />
            <div className={cn(
              'absolute top-1/2 -translate-y-1/2 flex items-center gap-1',
              locale === 'ar' ? 'left-2 md:left-3' : 'right-2 md:right-3'
            )}>
              <button
                type="button"
                onClick={() => { setIsRecording(r => !r); setShowMediaOptions(false); }}
                className={cn(
                  'size-9 flex items-center justify-center rounded-wf transition-all',
                  isRecording ? 'text-wf-red bg-wf-red/10' : 'text-wf-gray-300 hover:text-wf-blue hover:bg-wf-blue/5'
                )}
              >
                <Microphone className="size-4 md:size-5" />
              </button>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="size-9 flex items-center justify-center rounded-wf text-wf-gray-300 hover:text-wf-blue hover:bg-wf-blue/5 transition-all"
              >
                <Gallery className="size-4 md:size-5" />
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSending || (!messageContent.trim() && !selectedImage && !selectedVoice)}
            className={cn(
              'size-14 bg-wf-blue hover:bg-wf-blue/90 text-white rounded-wf flex items-center justify-center shadow-none transition-all duration-300 shrink-0',
              locale === 'ar' ? 'hover:-translate-x-1.5' : 'hover:translate-x-1.5'
            )}
          >
            <Forward className={cn("size-6 md:size-7", locale === 'ar' && "rotate-180")} />
          </button>
        </form>
        <div className="mt-4 text-center">
            <p className="text-[8px] md:text-[9px] font-bold text-wf-gray-300 uppercase tracking-[0.2em] opacity-40">
                {t('disclaimer')}
            </p>
        </div>
      </div>
      {showConfirmNewModal && (
        <Portal>
          <div dir={locale === 'ar' ? 'rtl' : 'ltr'} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setShowConfirmNewModal(false)}>
            <Card onClick={(e) => e.stopPropagation()} className="w-full max-w-md p-10 text-center space-y-8 rounded-wf border border-wf-border bg-white shadow-none animate-in zoom-in-95" data-lenis-prevent>
              <div className="size-20 mx-auto rounded-wf flex items-center justify-center shrink-0 border border-wf-blue/20 bg-wf-blue/5 text-wf-blue">
                <MagicStick className="size-10" />
              </div>
              <div className="space-y-3">
                <h3 className="text-2xl font-black text-wf-near-black tracking-tighter uppercase leading-none">
                  {locale === 'ar' ? 'بدء جلسة جديدة؟' : 'Start fresh session?'}
                </h3>
                <p className="text-[11px] font-black uppercase tracking-widest text-wf-gray-700 leading-relaxed px-4 opacity-60">
                  {t('messages.confirmNew')}
                </p>
              </div>
              <div className="flex gap-3 pt-4">
                <Button variant="outline" className="flex-1 h-14 rounded-wf font-black uppercase tracking-widest bg-white border-wf-border text-wf-near-black hover:bg-slate-50" onClick={() => setShowConfirmNewModal(false)}>
                  {locale === 'ar' ? 'إلغاء' : 'Cancel'}
                </Button>
                <Button 
                  onClick={confirmNewSession}
                  className="flex-1 h-14 rounded-wf font-black uppercase tracking-widest bg-primary text-white hover:bg-primary-vibrant transition-all shadow-none"
                >
                  {locale === 'ar' ? 'تأكيد' : 'Confirm'}
                </Button>
              </div>
            </Card>
          </div>
        </Portal>
      )}

      {/* Link Warning Modal */}
      {pendingLink && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={() => setPendingLink(null)}>
          <div onClick={(e) => e.stopPropagation()} className="bg-white rounded-wf border border-wf-border shadow-2xl p-6 max-w-sm w-full space-y-4 animate-in zoom-in-95 slide-in-from-bottom-4 duration-300" data-lenis-prevent>
            <div className="flex items-start gap-3">
              <div className="size-10 bg-amber-50 border border-amber-200 rounded-wf flex items-center justify-center shrink-0">
                <MagicStick className="size-5 text-amber-500" />
              </div>
              <div>
                <p className="font-bold text-wf-near-black text-sm uppercase tracking-tight">External Link</p>
                <p className="text-[11px] text-wf-gray-300 font-medium mt-1 leading-relaxed">
                  You are about to leave the Revia platform.
                </p>
              </div>
            </div>
            <div className="bg-slate-50 border border-wf-border rounded-wf px-3 py-2">
              <p className="text-[10px] font-mono text-wf-gray-300 break-all leading-relaxed">{pendingLink}</p>
            </div>
            <div className="flex gap-3 pt-1">
              <button
                onClick={() => setPendingLink(null)}
                className="flex-1 h-10 rounded-wf border border-wf-border text-wf-gray-300 text-[10px] font-bold uppercase tracking-widest hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => { window.open(pendingLink, '_blank', 'noopener,noreferrer'); setPendingLink(null); }}
                className="flex-1 h-10 rounded-wf bg-wf-blue text-white text-[10px] font-bold uppercase tracking-widest hover:bg-wf-blue/90 transition-colors"
              >
                Open in New Tab
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
