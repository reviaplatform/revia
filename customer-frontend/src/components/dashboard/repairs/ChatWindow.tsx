"use client";

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { ChatMessage, ChatFinishedPayload } from '@/lib/api/types';
import { getChatMessages, sendChatMessage } from '@/lib/api/chat';
import { Plain, Gallery, Microphone, CloseCircle, StopCircle, Camera, MonitorCamera } from '@solar-icons/react';
import { io, Socket } from 'socket.io-client';
import { cn } from '@/lib/utils';
import VoiceRecorder from '@/components/media/VoiceRecorder';
import CameraCapture from '@/components/media/CameraCapture';
import ScreenCapture from '@/components/media/ScreenCapture';

interface ChatWindowProps {
  requestId: string;
  lang: 'en' | 'ar';
  onClose: () => void;
}

export default function ChatWindow({ requestId, lang, onClose }: ChatWindowProps) {
  const isAr = lang === 'ar';
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [showMediaOptions, setShowMediaOptions] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const data = await getChatMessages(requestId);
        setMessages(data.messages || []);
      } catch (err) {
        console.error('Failed to fetch messages', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchMessages();

    // Initialize Socket.io
    const socketUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:10001';
    const socket = io(socketUrl, {
      transports: ['websocket'],
      query: { requestId }
    });

    socket.on('connect', () => {
      console.log('Connected to chat socket');
      socket.emit('chat:join', { requestId });
    });

    socket.on('chat:newMessage', (msg: ChatMessage) => {
      setMessages(prev => {
        // Avoid duplicates if needed, but usually socket messages are new
        const exists = prev.some(m => m.id === msg.id && msg.id !== undefined);
        if (exists) return prev;
        return [...prev, msg];
      });
    });

    socket.on('chat:finished', (data: ChatFinishedPayload) => {
      console.log('Chat finished', data);
      // Handle finishing state if needed
    });

    socketRef.current = socket;

    return () => {
      socket.disconnect();
    };
  }, [requestId]);

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
  }, [messages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!newMessage.trim() && attachments.length === 0) return;

    setIsSending(true);
    try {
      const type = attachments.length > 0 
        ? (attachments[0].type.startsWith('image/') ? 'image' : 'voice') 
        : 'text';
      
      const msg = await sendChatMessage(requestId, newMessage, type, attachments);
      setMessages(prev => [...prev, msg]);
      setNewMessage('');
      setAttachments([]);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err) {
      console.error('Failed to send message', err);
    } finally {
      setIsSending(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setAttachments(files);
      // Auto send if it's just an image/voice? Maybe not, let user add text too.
    }
  };

  const stopRecording = () => {
    setIsRecording(false);
  };

  const handleMediaCapture = (file: File) => {
    setAttachments(prev => [...prev, file]);
    setShowCamera(false);
    setShowMediaOptions(false);
    setIsRecording(false);
  };

  if (!mounted) return null;

  return createPortal(
    <div className="fixed bottom-6 end-6 w-full max-w-sm h-[500px] bg-white rounded-3xl border border-gray-100 flex flex-col z-[999] overflow-hidden shadow-2xl" dir={isAr ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="p-4 bg-[#0254ff] text-white flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-bold">R</div>
          <div>
            <div className="text-sm font-bold">{isAr ? 'عامل صيانة ريفيا' : 'Revia Technician'}</div>
            <div className="text-[10px] text-blue-100">{isAr ? 'متصل الآن' : 'Online'}</div>
          </div>
        </div>
        <button onClick={onClose} className="text-blue-100 hover:text-white transition-colors">
          <CloseCircle size={24} />
        </button>
      </div>

      {/* Messages */}
      <div 
        className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50"
      >
        {isLoading ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#0254ff]"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-sm text-gray-500">{isAr ? 'ابدأ المحادثة مع الفني.' : 'Start a conversation with the technician.'}</p>
          </div>
        ) : (Array.isArray(messages) ? messages : []).map((msg) => {
            const isMe = msg.role === 'user';
            const date = msg.createdAt ? new Date(msg.createdAt) : (msg.timestamp ? new Date(msg.timestamp) : new Date());
            return (
              <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                  isMe 
                    ? 'bg-[#0254ff] text-white rounded-se-none' 
                    : 'bg-white text-gray-900 border border-gray-100 rounded-ss-none'
                }`}>
                  {msg.type === 'image' ? (
                    <div className="space-y-2">
                      <img 
                        src={msg.content} 
                        alt="attachment" 
                        className="rounded-lg max-w-full cursor-pointer hover:opacity-90 transition-opacity"
                        onClick={() => window.open(msg.content, '_blank')}
                      />
                      {msg.content.includes('signed') === false && <p className="text-xs italic opacity-70">Uploading...</p>}
                    </div>
                  ) : msg.type === 'voice' ? (
                    <div className="min-w-[200px]">
                      <audio src={msg.content} controls className="w-full h-8" />
                    </div>
                  ) : (
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  )}
                  <div className={`text-[10px] mt-1 ${isMe ? 'text-blue-100' : 'text-gray-400'}`}>
                    {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            );
          })
        }
        <div ref={messagesEndRef} />
      </div>

      {/* Attachments Preview */}
      {attachments.length > 0 && (
        <div className="px-4 py-2 bg-gray-50 border-t border-gray-100 flex items-center gap-2 overflow-x-auto">
          {attachments.map((file, i) => (
            <div key={i} className="relative group">
              <div className="w-12 h-12 rounded-lg bg-gray-200 flex items-center justify-center overflow-hidden border border-gray-300">
                {file.type.startsWith('image/') ? (
                  <img src={URL.createObjectURL(file)} className="object-cover w-full h-full" alt="preview" />
                ) : (
                  <Microphone size={20} className="text-gray-500" />
                )}
              </div>
              <button 
                onClick={() => setAttachments([])}
                className="absolute -top-1 -right-1 bg-white rounded-full text-red-500 shadow-sm"
              >
                <CloseCircle size={16} />
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

      {/* Media Options Menu */}
      {showMediaOptions && (
        <div className="px-4 py-3 bg-white border-t border-gray-100 flex flex-wrap gap-2 animate-in fade-in slide-in-from-bottom-2">
          <ScreenCapture onCapture={handleMediaCapture} isAr={isAr} />
          <button
            type="button"
            onClick={() => { setShowCamera(true); setShowMediaOptions(false); }}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-xl transition-colors border border-gray-200"
          >
            <Camera size={18} />
            {isAr ? 'فتح الكاميرا' : 'Open Camera'}
          </button>
        </div>
      )}

      {/* Input */}
      <div className="p-4 bg-white border-t border-gray-100 space-y-4">
        {isRecording ? (
          <VoiceRecorder onCapture={handleMediaCapture} onCancel={() => setIsRecording(false)} isAr={isAr} />
        ) : (
          <form onSubmit={handleSendMessage} className="flex items-center gap-2">
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              className="hidden" 
              accept="image/*,audio/*"
              multiple
            />
            
            <button 
              type="button"
              onClick={() => setShowMediaOptions(!showMediaOptions)}
              className={cn(
                "w-10 h-10 flex items-center justify-center rounded-xl transition-all",
                showMediaOptions ? "bg-gray-100 text-[#0254ff]" : "text-gray-400 hover:text-[#0254ff] hover:bg-gray-100"
              )}
            >
              <Gallery size={22} />
            </button>

            <button 
              type="button"
              onClick={() => setIsRecording(true)}
              className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-[#0254ff] hover:bg-gray-100 rounded-xl transition-colors"
            >
              <Microphone size={22} />
            </button>

            <input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder={isAr ? 'اكتب رسالتك...' : 'Type a message...'}
              className="flex-1 px-4 py-2 bg-gray-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#0254ff]/20 text-gray-900"
            />
            <button
              type="submit"
              disabled={isSending || (!newMessage.trim() && attachments.length === 0)}
              className="w-10 h-10 bg-[#0254ff] text-white rounded-xl flex items-center justify-center hover:bg-blue-600 disabled:opacity-50 transition-colors"
            >
              <Plain size={20} />
            </button>
          </form>
        )}
      </div>
    </div>,
    document.body
  );
}
