"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import { createPortal } from 'react-dom';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { 
  ChatLine, 
  CloseCircle, 
  Maximize, 
  Minimize, 
  Plain,
  CheckRead,
  InfoCircle,
  Stethoscope,
  Gallery,
  Camera,
  Microphone,
  StopCircle,
  MonitorCamera,
  Play,
  Pause,
  MusicNotes
} from '@solar-icons/react';
import { ChatMessage, ChatFinishedPayload } from '@/lib/api/types';
import { getChatMessages, sendChatMessage } from '@/lib/api/chat';
import { useSocket } from '@/hooks/useSocket';
import { useSidebar } from '@/context/SidebarContext';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import VoiceRecorder from '@/components/media/VoiceRecorder';
import CameraCapture from '@/components/media/CameraCapture';
import ScreenCapture from '@/components/media/ScreenCapture';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ChatPopupProps {
  requestId: string;
  lang: 'en' | 'ar';
  isOpen?: boolean;
  onClose?: () => void;
  onSessionFinished?: () => void;
  defaultFullScreen?: boolean;
}

export default function ChatPopup({ 
  requestId, 
  lang, 
  isOpen: externalIsOpen, 
  onClose,
  onSessionFinished,
  defaultFullScreen = false 
}: ChatPopupProps) {
  const isAr = lang === 'ar';
  const { socket, isConnected } = useSocket();
  const { isExpanded } = useSidebar();
  
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;
  const [shouldRender, setShouldRender] = useState(false);
  
  const [isMinimized, setIsMinimized] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(defaultFullScreen);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isFinished, setIsFinished] = useState(false);
  const [aiReport, setAiReport] = useState<string[]>([]);
  const [hasNoSession, setHasNoSession] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [showCamera, setShowCamera] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [showMediaOptions, setShowMediaOptions] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const searchParams = useSearchParams();
  const isFirstMsg = searchParams?.get('firstMsg') === 'true';
  const [showThinking, setShowThinking] = useState(isFirstMsg);
  const [showLongWait, setShowLongWait] = useState(false);
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const [pendingLink, setPendingLink] = useState<string | null>(null);
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);
  const [mounted, setMounted] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const thinkingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const triggerButtonRef = useRef<HTMLButtonElement>(null);
  const longWaitRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Window Animation Logic
  useGSAP(() => {
    if (isOpen) {
      setShouldRender(true);
    } else if (shouldRender) {
      gsap.to(containerRef.current, {
        opacity: 0,
        y: 20,
        scale: 0.95,
        duration: 0.3,
        ease: "power2.in",
        onComplete: () => setShouldRender(false)
      });
    }
  }, [isOpen]);

  useGSAP(() => {
    if (shouldRender && isOpen && containerRef.current) {
      gsap.fromTo(containerRef.current,
        { opacity: 0, y: 20, scale: 0.95 },
        { 
          opacity: 1, 
          y: 0, 
          scale: 1, 
          duration: 0.5, 
          ease: "elastic.out(1, 0.85)" 
        }
      );
    }
  }, [shouldRender, isOpen]);

  // Animate new messages
  useGSAP(() => {
    if (messages.length > 0 && containerRef.current) {
      const lastMsg = containerRef.current.querySelector('.chat-message:last-child');
      if (lastMsg && !lastMsg.getAttribute('data-animated')) {
        gsap.fromTo(lastMsg, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.3 });
        lastMsg.setAttribute('data-animated', 'true');
      }
    }
  }, { dependencies: [messages], scope: containerRef });

  // Animate Thinking Indicator Wait Warning
  useEffect(() => {
    if (longWaitRef.current) {
      if (showLongWait) {
        gsap.fromTo(longWaitRef.current, 
          { opacity: 0, height: 0 }, 
          { opacity: 1, height: 'auto', duration: 0.3, ease: "power2.out" }
        );
      }
    }
  }, [showLongWait]);

  // Initialize and load history
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const data = await getChatMessages(requestId);
        if (data.messages) {
          // Merge: history is source of truth, but preserve any socket messages
          // that arrived before this fetch completed (race condition guard)
          setMessages(prev => {
            const socketOnly = prev.filter(pm =>
              !data.messages.some(hm => hm.content === pm.content && hm.role === pm.role)
            );
            const merged = [...data.messages, ...socketOnly];
            const lastMsg = merged[merged.length - 1];
            if (lastMsg && lastMsg.role === 'user' && !data.isFinished) {
              setTimeout(() => setShowThinking(true), 0);
            }
            return merged;
          });
        }
        if (data.isFinished) setIsFinished(true);
        if (data.aiReport) setAiReport(data.aiReport);
      } catch (err: any) {
        if (err.response?.status === 404 && err.response?.data?.error?.message === 'notFoundChatSession') {
          setHasNoSession(true);
        }
        console.error('[Chat] Failed to fetch history:', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (requestId) fetchHistory();
  }, [requestId]);

  // Strip JSON block from assistant message content (processAiResponse)
  const processContent = (content: string): string => {
    const markdownMatch = content.match(/```(?:json)?\n([\s\S]*?)\n```/);
    if (markdownMatch) {
      try {
        const parsed = JSON.parse(markdownMatch[1]);
        if (parsed.status === 'technician_required' || parsed.status === 'resolved') {
          const cleaned = content.replace(/```(?:json)?\n[\s\S]*?\n```/g, '')
            .replace(/```json\n\n```/g, '').replace(/```\n\n```/g, '')
            .replace(/```json/g, '').replace(/```/g, '').trim();
          return cleaned || (parsed.status === 'resolved'
            ? "I'm glad we could resolve this issue! I've generated a resolution report for your records."
            : "I've documented the issue and a repair ticket is being created for our technicians.");
        }
      } catch { /* not valid JSON, show as-is */ }
    }
    return content;
  };

  const toolLabel = (tool: string | null): string => {
    if (tool === 'fetch_known_issues') return isAr ? 'جارٍ البحث عن المشاكل المعروفة...' : 'Fetching Known Issues...';
    if (tool === 'search_repair_manuals') return isAr ? 'جارٍ البحث في أدلة الإصلاح...' : 'Consulting Repair Manuals...';
    return isAr ? 'جارٍ التحليل...' : 'Analyzing...';
  };

  // Socket listeners
  useEffect(() => {
    if (!socket || !isConnected) return;

    const handleNewMessage = (payload: ChatMessage) => {
      const processed = payload.role === 'assistant'
        ? { ...payload, content: processContent(payload.content) }
        : payload;
      setMessages((prev) => [...prev, processed]);
      if (payload.role === 'assistant') {
        setShowThinking(false);
        setActiveTool(null);
      }
    };

    const handleChatFinished = (payload: ChatFinishedPayload) => {
      setIsFinished(true);
      setShowThinking(false);
      setActiveTool(null);
      if (payload.diagnosticReport) setAiReport(payload.diagnosticReport);
      if (onSessionFinished) onSessionFinished();
    };

    const handleToolStarted = (payload: { toolName: string }) => {
      setActiveTool(payload.toolName);
    };

    socket.on('chat:newMessage', handleNewMessage);
    socket.on('chat:finished', handleChatFinished);
    socket.on('chat:toolStarted', handleToolStarted);

    return () => {
      socket.off('chat:newMessage', handleNewMessage);
      socket.off('chat:finished', handleChatFinished);
      socket.off('chat:toolStarted', handleToolStarted);
    };
  }, [socket, isConnected, onSessionFinished, isAr]);

  // Handle thinking timer for long waits
  useEffect(() => {
    if (showThinking) {
      thinkingTimerRef.current = setTimeout(() => {
        setShowLongWait(true);
      }, 12000); 
    } else {
      if (thinkingTimerRef.current) clearTimeout(thinkingTimerRef.current);
      setShowLongWait(false);
    }
    return () => {
      if (thinkingTimerRef.current) clearTimeout(thinkingTimerRef.current);
    };
  }, [showThinking]);

  useEffect(() => {
    const el = messagesEndRef.current?.parentElement;
    if (!el) return;

    const stopScroll = (e: WheelEvent | TouchEvent) => {
      const isScrollable = el.scrollHeight > el.clientHeight;
      if (isScrollable) {
        e.stopPropagation();
      }
    };

    el.addEventListener('wheel', stopScroll, { passive: false });
    el.addEventListener('touchstart', stopScroll, { passive: true });
    el.addEventListener('touchmove', stopScroll, { passive: false });

    return () => {
      el.removeEventListener('wheel', stopScroll);
      el.removeEventListener('touchstart', stopScroll);
      el.removeEventListener('touchmove', stopScroll);
    };
  }, [isOpen, messages]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen, isMinimized, showThinking]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if ((!input.trim() && attachments.length === 0) || isFinished || isSending) return;

    setIsSending(true);

    // For media attachments create a local object URL so the player/img work immediately
    const attachment = attachments.length > 0 ? attachments[0] : null;
    const attachmentBlobUrl = attachment ? URL.createObjectURL(attachment) : null;
    const optimisticMsg: ChatMessage = {
      role: 'user',
      content: attachment
        ? (attachmentBlobUrl ?? '')
        : input,
      createdAt: new Date().toISOString(),
      type: attachment
        ? (attachment.type.startsWith('image/') ? 'image' : 'voice')
        : 'text',
    };

    setMessages((prev) => [...prev, optimisticMsg]);
    setShowThinking(true);
    setActiveTool(null);
    setInput('');
    const currentAttachments = [...attachments];
    setAttachments([]);
    setShowMediaOptions(false);

    try {
      const type = currentAttachments.length > 0 
        ? (currentAttachments[0].type.startsWith('image/') ? 'image' : 'voice') 
        : 'text';
      await sendChatMessage(requestId, input, type, currentAttachments);
    } catch (err) {
      setShowThinking(false);
    } finally {
      setIsSending(false);
    }
  };

  const handleMediaCapture = (file: File) => {
    setAttachments(prev => [...prev, file]);
    setShowCamera(false);
    setShowMediaOptions(false);
    setIsRecording(false);
  };

  const toggleOpen = () => {
    if (onClose && isOpen) {
      onClose();
    } else {
      setInternalIsOpen(!internalIsOpen);
    }
    setIsMinimized(false);
  };

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      setInternalIsOpen(false);
    }
  };

  // Sidebar awareness width
  const isDesktop = windowWidth >= 1024;
  const currSidebarWidth = isDesktop ? (isExpanded ? 256 : 80) : 0;

  if (!mounted) return null;

  const chatJSX = (
    <div 
      className={cn(
        "fixed bottom-6 z-[999] flex flex-col items-end gap-4",
        isAr ? "left-6" : "right-6",
        !isOpen && "pointer-events-none"
      )}
      dir={isAr ? 'rtl' : 'ltr'}
    >
      {/* Trigger Button (Only if not controlled externally) */}
      {externalIsOpen === undefined && !shouldRender && (
        <button
          ref={triggerButtonRef}
          onClick={toggleOpen}
          className="hover-translate pointer-events-auto w-16 h-16 bg-brand-500 text-white rounded-lg flex items-center justify-center hover:bg-brand-600 transition-all relative shadow-sm shadow-brand-500/10 active:scale-95"
        >
          <ChatLine size={32} />
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-secondary-green border-2 border-white rounded-full" />
        </button>
      )}

      {/* Chat Window */}
      {shouldRender && (
        <div
          style={{
            height: isMinimized ? '64px' : (isFullScreen ? 'calc(100vh - 128px)' : '600px'),
            width: isFullScreen 
              ? `calc(100vw - ${currSidebarWidth + 48}px)` 
              : '400px',
            maxWidth: isFullScreen ? '100vw' : '90vw',
            bottom: 0,
            right: 0,
            left: 0
          }}
          className={cn(
            "pointer-events-auto bg-white border border-border rounded-lg flex flex-col overflow-hidden relative shadow-2xl transition-[height,width] duration-300 ease-out",
            isFullScreen && "rounded-none"
          )}
          ref={containerRef}
        >
          {/* Header */}
          <div className={cn(
            "h-16 px-6 bg-brand-500 text-white flex items-center justify-between shrink-0",
            isAr ? "flex-row-reverse" : "flex-row"
          )}>
            <div className={cn("flex items-center gap-3", isAr ? "flex-row-reverse" : "flex-row")}>
              <div className="w-10 h-10 rounded-md bg-white/20 backdrop-blur-md flex items-center justify-center">
                <Stethoscope size={24} />
              </div>
              <div className={isAr ? "text-right" : "text-left"}>
                <h3 className="font-black text-sm leading-tight tracking-tight text-white">
                  {isAr ? 'مساعد ريفيا الذكي' : 'Revia AI Assistant'}
                </h3>
                <div className={cn("flex items-center gap-1.5", isAr ? "flex-row-reverse" : "flex-row")}>
                  <span className={cn("w-1 h-1 rounded-full animate-pulse", isConnected ? "bg-secondary-green" : "bg-secondary-red")} />
                  <span className="wf-uppercase-label !text-[9px] !text-white font-black tracking-widest">
                    {isConnected ? (isAr ? 'متصل' : 'ONLINE') : (isAr ? 'غير متصل' : 'OFFLINE')}
                  </span>
                </div>
              </div>
            </div>

            <div className={cn("flex items-center gap-1", isAr ? "flex-row-reverse" : "flex-row")}>
              <button 
                onClick={() => setIsFullScreen(!isFullScreen)}
                className="hover-translate p-2 hover:bg-white/10 rounded-md transition-colors hidden sm:block"
              >
                {isFullScreen ? <Minimize size={20} /> : <Maximize size={20} />}
              </button>
              <button 
                onClick={handleClose}
                className="hover-translate p-2 hover:bg-white/10 rounded-md transition-colors"
              >
                <CloseCircle size={24} />
              </button>
            </div>
          </div>

          {/* Content Area */}
          {!isMinimized && (
            <>
              <div 
                className="flex-1 min-h-0 overflow-y-auto p-8 space-y-8 bg-[#f8faff]/30 custom-scrollbar relative"
              >
                {isLoading ? (
                  <div className="space-y-6 animate-pulse">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className={cn(
                        "flex flex-col gap-2",
                        i % 2 === 0 ? "items-start" : "items-end"
                      )}>
                        <div className={cn(
                          "h-12 rounded-2xl bg-gray-100",
                          i % 2 === 0 ? "w-[70%] rounded-tl-none" : "w-[60%] rounded-tr-none bg-blue-50"
                        )} />
                        <div className="h-3 w-12 bg-gray-50 rounded" />
                      </div>
                    ))}
                  </div>
                ) : hasNoSession ? (
                  <div className="flex flex-col items-center justify-center py-12 px-8 text-center">
                    <div className="w-20 h-20 bg-foreground/5 rounded-lg flex items-center justify-center mb-6 text-foreground/40 border border-border">
                      <Stethoscope size={40} />
                    </div>
                    <h4 className="text-xl font-black text-foreground tracking-tight mb-3">
                      {isAr ? 'لا توجد جلسة ذكاء اصطناعي' : 'No AI Session Found'}
                    </h4>
                    <p className="text-xs text-foreground/40 font-medium leading-relaxed mb-10 max-w-xs mx-auto">
                      {isAr 
                        ? 'هذا الطلب تم إنشاؤه عبر الطلب المباشر، لذلك لا توجد جلسة تشخيص ذكي متاحة له حالياً.' 
                        : 'This request was created via Direct Flow. AI diagnostic session is not available for direct requests.'}
                    </p>
                    <div className="bg-brand-500/5 p-5 rounded-md flex items-center gap-4 text-[10px] text-brand-500 font-black border border-brand-500/10 uppercase tracking-widest leading-relaxed">
                      <InfoCircle size={20} className="shrink-0" />
                      {isAr ? 'يمكنك رؤية العروض في صفحة التفاصيل.' : 'You can view available offers in the details page.'}
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Welcome Message with Disclaimer */}
                    <div className="bg-white border border-border rounded-lg p-5">
                      <div className="flex gap-4 mb-4">
                        <div className="w-10 h-10 bg-brand-500/5 text-brand-500 rounded-md flex items-center justify-center shrink-0 border border-brand-500/10">
                          <InfoCircle size={22} />
                        </div>
                        <div className="space-y-1">
                          <p className="font-black text-foreground text-sm tracking-tight">{isAr ? 'مرحباً بك' : 'Welcome to Revia AI'}</p>
                          <p className="text-foreground/40 text-[12px] leading-relaxed font-medium">
                            {isAr 
                              ? 'أنا مساعدك الذكي لتحديد أعطال الجهاز. صف المشكلة بدقة لأتمكن من مساعدتك.' 
                              : 'I can help identify what’s wrong with your device. Please describe the symptoms clearly.'}
                          </p>
                        </div>
                      </div>
                      <div className="bg-foreground/[0.02] p-3 rounded-md flex items-center gap-2.5 text-[10px] font-black text-foreground/40 uppercase tracking-widest border border-border">
                        <CheckRead size={14} className="shrink-0 text-brand-500" />
                        {isAr ? 'قد يخطئ الذكاء الاصطناعي، يرجى التأكد دائماً.' : 'REVIA AI can make mistakes. Please double check accuracy.'}
                      </div>
                    </div>

                    {/* Message List */}
                    {messages.map((msg, idx) => {
                      const isAssistant = msg.role === 'assistant' || msg.role === 'system';
                      const time = msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
                      
                      return (
                        <div
                          key={idx}
                          className={cn(
                            "chat-message flex flex-col gap-1.5 w-full",
                            isAssistant 
                              ? (isAr ? "items-end text-right" : "items-start text-left") 
                              : (isAr ? "items-start text-left" : "items-end text-right")
                          )}
                        >
                          <div className={cn(
                            "max-w-[80%] break-words overflow-hidden transition-all duration-300 hover:shadow-md",
                            isAssistant 
                              ? "bg-white border border-border text-foreground rounded-2xl rounded-tl-none" 
                              : "bg-brand-500 text-white rounded-2xl rounded-tr-none"
                          )}>
                            {/* Image Rendering */}
                            {(msg.type === 'image' || (msg.content.match(/\.(jpeg|jpg|gif|png|webp)/i) && msg.content.startsWith('http'))) ? (
                              <div className="relative group">
                                <img 
                                  src={msg.content} 
                                  alt="attachment" 
                                  className="w-full max-h-[240px] object-cover cursor-pointer transition-transform duration-500 group-hover:scale-105"
                                  onClick={() => window.open(msg.content, '_blank')}
                                />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors pointer-events-none" />
                                {!msg.content.startsWith('http') && !msg.content.startsWith('blob:') && !msg.content.startsWith('data:') && !msg.content.includes('signed') && (
                                  <div className="absolute inset-0 flex items-center justify-center bg-white/40 backdrop-blur-sm">
                                    <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
                                  </div>
                                )}
                              </div>
                            ) : (msg.type === 'voice' || (msg.content.match(/\.(webm|mp3|wav|ogg)/i) && msg.content.startsWith('http'))) ? (
                              /* Custom Audio Player */
                              <CustomAudioPlayer src={msg.content} isAssistant={isAssistant} />
                            ) : (
                              /* Text Rendering */
                              <div className="px-5 py-3.5">
                                {isAssistant ? (
                                  <div className="prose prose-sm max-w-none text-[13px] leading-relaxed font-medium tracking-tight prose-p:my-1 prose-ul:my-1 prose-ol:my-1 prose-li:my-0.5 prose-headings:font-black prose-headings:tracking-tight prose-headings:text-foreground prose-a:text-brand-500 prose-a:no-underline hover:prose-a:underline prose-code:text-brand-500 prose-code:bg-brand-500/5 prose-code:px-1 prose-code:rounded prose-strong:font-black">
                                    <ReactMarkdown
                                      components={{
                                        a: ({ href, children }) => (
                                          <a
                                            href={href}
                                            onClick={e => { e.preventDefault(); setPendingLink(href || ''); }}
                                            className="text-brand-500 underline underline-offset-2 cursor-pointer hover:text-brand-600 transition-colors"
                                          >
                                            {children}
                                          </a>
                                        ),
                                      }}
                                    >{msg.content}</ReactMarkdown>
                                  </div>
                                ) : (
                                  <p className="whitespace-pre-wrap text-[13px] leading-relaxed font-medium tracking-tight">
                                    {msg.content}
                                  </p>
                                )}
                              </div>
                            )}
                          </div>
                          <span className="text-[9px] text-foreground/30 font-bold px-1 uppercase tracking-tighter">
                            {time}
                          </span>
                        </div>
                      );
                    })}

                    {/* Thinking Indicator */}
                    {showThinking && (
                      <div className={cn("flex flex-col gap-3", isAr ? "items-end" : "items-start")}>
                        <div className="px-5 py-4 bg-white border border-border rounded-md rounded-tl-none flex items-center gap-3 shadow-sm shadow-black/[0.02]">
                          <div className="flex gap-1.5">
                            <div className="w-1.5 h-1.5 bg-brand-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                            <div className="w-1.5 h-1.5 bg-brand-500/60 rounded-full animate-bounce [animation-delay:-0.15s]" />
                            <div className="w-1.5 h-1.5 bg-brand-500/30 rounded-full animate-bounce" />
                          </div>
                          {activeTool && (
                            <span className="text-[10px] font-black text-brand-500 uppercase tracking-widest animate-pulse">
                              {toolLabel(activeTool)}
                            </span>
                          )}
                        </div>

                        <div
                          ref={longWaitRef}
                          style={{ opacity: 0, height: 0, overflow: 'hidden' }}
                          className="bg-brand-500/5 text-brand-500 px-5 py-3 rounded-md text-[10px] font-black uppercase tracking-widest flex items-center gap-3 max-w-[85%] border border-brand-500/10 leading-relaxed shadow-sm shadow-brand-500/5"
                        >
                          <InfoCircle size={16} className="shrink-0" />
                          <span>
                            {isAr
                              ? 'المحلل يعمل الآن، يمكنك المتابعة لاحقا إذا تأخر الرد، المحلل يقوم بمراجعة البيانات.'
                              : 'Analyzing now. You can come back in a few minutes, the model is analyzing your issue.'}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* AI Report Card */}
                    {isFinished && aiReport.length > 0 && (
                      <div className="bg-secondary-green/5 border border-secondary-green/20 rounded-lg p-8 relative overflow-hidden">
                        <div className="flex items-center gap-4 text-secondary-green font-black mb-6 relative z-10 wf-uppercase-label !text-[11px]">
                          <CheckRead size={24} className="text-secondary-green" />
                          <span>{isAr ? 'تقرير الحالة النهائي' : 'Final Assessment Report'}</span>
                        </div>
                        <ul className="space-y-4 relative z-10">
                          {aiReport.map((point, idx) => (
                            <li key={idx} className="flex gap-4 text-[13px] text-foreground font-semibold leading-relaxed tracking-tight">
                              <div className="mt-2 w-1.5 h-1.5 bg-secondary-green rounded-full shrink-0 shadow-sm shadow-secondary-green/20" />
                              {point}
                            </li>
                          ))}
                        </ul>
                        <div className="mt-8 pt-6 border-t border-secondary-green/10 flex items-center justify-between relative z-10">
                          <span className="wf-uppercase-label !text-[9px] text-secondary-green/60 font-black tracking-[0.2em]">{isAr ? 'الجلسة مغلقة' : 'SESSION COMPLETE'}</span>
                          <div className="wf-uppercase-label !text-[8.5px] px-3 py-1.5 bg-secondary-green/10 rounded-md text-secondary-green font-black tracking-widest border border-secondary-green/10">REVIA CERTIFIED</div>
                        </div>
                      </div>
                    )}
                    
                    <div ref={messagesEndRef} className="h-2" />
                  </>
                )}
              </div>

              {/* Input Area */}
              <div className="p-8 bg-white border-t border-border shrink-0 space-y-4">
                {/* Attachments Preview */}
                {attachments.length > 0 && (
                  <div className="flex flex-wrap gap-2 animate-in fade-in slide-in-from-bottom-2">
                    {attachments.map((file, i) => (
                      <div key={i} className="relative group">
                        <div className="w-14 h-14 rounded-lg bg-foreground/[0.02] border border-border flex items-center justify-center overflow-hidden">
                          {file.type.startsWith('image/') ? (
                            <img src={URL.createObjectURL(file)} className="object-cover w-full h-full" alt="preview" />
                          ) : (
                            <Microphone size={24} className="text-brand-500" />
                          )}
                        </div>
                        <button 
                          onClick={() => setAttachments([])}
                          className="absolute -top-1 -right-1 bg-white rounded-full text-secondary-red shadow-sm border border-border"
                        >
                          <CloseCircle size={18} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {showCamera && (
                  <CameraCapture 
                    onCapture={handleMediaCapture} 
                    onClose={() => setShowCamera(false)} 
                    isAr={isAr} 
                  />
                )}

                {showMediaOptions && (
                  <div className="flex flex-wrap gap-2 animate-in fade-in slide-in-from-bottom-2 pb-2">
                    <ScreenCapture onCapture={handleMediaCapture} isAr={isAr} />
                    <button
                      type="button"
                      onClick={() => { setShowCamera(true); setShowMediaOptions(false); }}
                      className="flex items-center gap-2 px-4 py-2 text-xs font-black uppercase tracking-widest text-foreground/40 hover:text-brand-500 hover:bg-brand-500/5 rounded-md transition-all border border-border"
                    >
                      <Camera size={16} />
                      {isAr ? 'الكاميرا' : 'Camera'}
                    </button>
                  </div>
                )}

                {isRecording ? (
                  <VoiceRecorder onCapture={handleMediaCapture} onCancel={() => setIsRecording(false)} isAr={isAr} />
                ) : (
                  <form 
                    onSubmit={handleSend}
                    className={cn(
                      "flex items-center gap-2 bg-foreground/[0.01] p-2 rounded-md border border-border focus-within:border-brand-500/50 transition-all",
                      (isFinished || hasNoSession) && "opacity-50 pointer-events-none grayscale"
                    )}
                  >
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      onChange={(e) => { if (e.target.files) setAttachments(Array.from(e.target.files)); }} 
                      className="hidden" 
                      accept="image/*,audio/*"
                    />

                    <button 
                      type="button"
                      onClick={() => setShowMediaOptions(!showMediaOptions)}
                      className={cn(
                        "w-11 h-11 flex items-center justify-center rounded-md transition-all hover:bg-foreground/[0.03]",
                        showMediaOptions ? "text-brand-500" : "text-foreground/20 hover:text-brand-500"
                      )}
                    >
                      <Gallery size={22} />
                    </button>

                    <button 
                      type="button"
                      onClick={() => setIsRecording(true)}
                      className="w-11 h-11 flex items-center justify-center text-foreground/20 hover:text-brand-500 hover:bg-foreground/[0.03] rounded-md transition-all"
                    >
                      <Microphone size={22} />
                    </button>

                    <input
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder={isAr ? 'اوصف لنا المشكلة...' : 'Describe the issue...'}
                      disabled={isFinished || isSending}
                      className="flex-1 bg-transparent border-none outline-none text-[13px] font-semibold text-foreground px-4 placeholder:text-foreground/20 tracking-tight"
                    />
                    <button
                      type="submit"
                      disabled={(!input.trim() && attachments.length === 0) || isFinished || isSending}
                      className="hover-translate w-11 h-11 bg-brand-500 text-white rounded-md flex items-center justify-center disabled:bg-foreground/5 disabled:shadow-none transition-all shadow-lg shadow-brand-500/10 active:scale-95"
                    >
                      <Plain size={20} className={cn((!input.trim() && attachments.length === 0) && "text-foreground/20")} />
                    </button>
                  </form>
                )}
                <div className="mt-6 flex items-center justify-center gap-1.5">
                  <span className="wf-uppercase-label !text-[9px] text-foreground/20 font-black tracking-[0.25em]">Powered by Revia AI Diagnostic Engine</span>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Link Warning Modal */}
      {pendingLink && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl p-6 max-w-sm w-full space-y-4 animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-amber-50 border border-amber-200 rounded-lg flex items-center justify-center shrink-0">
                <InfoCircle size={20} className="text-amber-500" />
              </div>
              <div>
                <p className="font-black text-foreground text-sm tracking-tight">{isAr ? 'فتح رابط خارجي' : 'Opening External Link'}</p>
                <p className="text-[11px] text-foreground/40 font-medium mt-1 leading-relaxed">
                  {isAr ? 'أنت على وشك مغادرة تطبيق ريفيا.' : 'You are about to leave the Revia app.'}
                </p>
              </div>
            </div>
            <div className="bg-foreground/[0.03] border border-border rounded-md px-3 py-2">
              <p className="text-[10px] font-mono text-foreground/50 break-all leading-relaxed">{pendingLink}</p>
            </div>
            <div className="flex gap-3 pt-1">
              <button
                onClick={() => setPendingLink(null)}
                className="flex-1 h-10 rounded-lg border border-border text-foreground/50 text-xs font-black uppercase tracking-widest hover:bg-foreground/[0.03] transition-colors"
              >
                {isAr ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                onClick={() => { window.open(pendingLink, '_blank', 'noopener,noreferrer'); setPendingLink(null); }}
                className="flex-1 h-10 rounded-lg bg-brand-500 text-white text-xs font-black uppercase tracking-widest hover:bg-brand-600 transition-colors"
              >
                {isAr ? 'فتح في تبويب جديد' : 'Open in New Tab'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #cbd5e1;
        }
      `}</style>
    </div>
  );

  return createPortal(chatJSX, document.body);
}

function isPlayableSrc(src: string): boolean {
  return Boolean(src) && (
    src.startsWith('http://') ||
    src.startsWith('https://') ||
    src.startsWith('blob:') ||
    src.startsWith('data:')
  );
}

function CustomAudioPlayer({ src, isAssistant }: { src: string; isAssistant: boolean }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);
  const validSrc = isPlayableSrc(src);

  const togglePlay = () => {
    if (!validSrc || !audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(() => setIsPlaying(false));
    }
    setIsPlaying(!isPlaying);
  };

  const onTimeUpdate = () => {
    if (audioRef.current && audioRef.current.duration) {
      setProgress((audioRef.current.currentTime / audioRef.current.duration) * 100);
    }
  };

  return (
    <div className={cn(
      "flex items-center gap-3 px-4 py-3 min-w-[220px]",
      isAssistant ? "text-brand-500" : "text-white"
    )}>
      {validSrc && (
        <audio
          ref={audioRef}
          src={src}
          onTimeUpdate={onTimeUpdate}
          onEnded={() => setIsPlaying(false)}
          className="hidden"
        />
      )}
      <button 
        onClick={togglePlay}
        disabled={!validSrc}
        className={cn(
          "w-9 h-9 rounded-full flex items-center justify-center transition-all active:scale-90 shadow-sm",
          isAssistant ? "bg-brand-500/10 text-brand-500" : "bg-white/20 text-white",
          !validSrc && "opacity-40 cursor-not-allowed"
        )}
      >
        {!validSrc
          ? <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
          : isPlaying
          ? <Pause size={18} />
          : <Play size={18} className="ml-0.5" />
        }
      </button>
      <div className="flex-1 flex flex-col gap-1">
        <div className={cn(
          "h-1.5 rounded-full relative overflow-hidden",
          isAssistant ? "bg-brand-500/10" : "bg-white/20"
        )}>
          <div
            className={cn("absolute inset-y-0 left-0 transition-all duration-300", isAssistant ? "bg-brand-500" : "bg-white")}
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex justify-between items-center px-0.5">
          <MusicNotes size={10} className="opacity-50" />
          <span className="text-[9px] font-black tracking-widest opacity-70 uppercase">Voice Message</span>
        </div>
      </div>
    </div>
  );
}

