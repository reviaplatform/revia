"use client";

import React from 'react';
import { SupportTicket, SupportTicketStatus, SupportTicketPriority } from '@/lib/api/types';
import { ChatDots, Calendar, InfoCircle } from '@solar-icons/react';

interface TicketListProps {
  tickets: SupportTicket[];
  lang: 'en' | 'ar';
}

export default function TicketList({ tickets, lang }: TicketListProps) {
  const isAr = lang === 'ar';

  const getStatusColor = (status: SupportTicketStatus) => {
    switch (status) {
      case SupportTicketStatus.OPEN: return 'bg-secondary-green/10 text-secondary-green';
      case SupportTicketStatus.IN_PROGRESS: return 'bg-secondary-orange/10 text-secondary-orange';
      case SupportTicketStatus.CLOSED: return 'bg-foreground/5 text-foreground/60';
      case SupportTicketStatus.RESOLVED: return 'bg-brand-500/10 text-brand-500';
      default: return 'bg-foreground/5 text-foreground/60';
    }
  };

  const getPriorityColor = (priority: SupportTicketPriority) => {
    switch (priority) {
      case SupportTicketPriority.HIGH: return 'text-secondary-red';
      case SupportTicketPriority.MEDIUM: return 'text-secondary-orange';
      case SupportTicketPriority.LOW: return 'text-secondary-green';
      default: return 'text-foreground/40';
    }
  };

  const getStatusLabel = (status: SupportTicketStatus) => {
    if (isAr) {
      switch (status) {
        case SupportTicketStatus.OPEN: return 'مفتوح';
        case SupportTicketStatus.IN_PROGRESS: return 'قيد التنفيذ';
        case SupportTicketStatus.CLOSED: return 'مغلق';
        case SupportTicketStatus.RESOLVED: return 'تم الحل';
        default: return status;
      }
    }
    return status;
  };

  const getPriorityLabel = (priority: SupportTicketPriority) => {
    if (isAr) {
      switch (priority) {
        case SupportTicketPriority.HIGH: return 'عالية';
        case SupportTicketPriority.MEDIUM: return 'متوسطة';
        case SupportTicketPriority.LOW: return 'منخفضة';
        default: return priority;
      }
    }
    return priority;
  };

  if (tickets.length === 0) {
    return (
      <div className="bg-white border border-border border-dashed rounded-lg p-12 text-center">
        <InfoCircle size={48} className="mx-auto text-foreground/20 mb-4" />
        <p className="text-foreground/40 font-medium">
          {isAr ? 'لا توجد تذاكر دعم حالية.' : 'No active support tickets.'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {tickets.map((ticket) => (
        <div key={ticket.id} className="group hover-translate bg-white border border-border rounded-lg p-5 sm:p-6 flex flex-col transition-all duration-300 hover:border-brand-500/30 hover:shadow-xl hover:shadow-brand-500/5">
          
          <div className="flex items-start gap-5 flex-1 min-w-0">
            <div className={`w-12 h-12 rounded-md flex items-center justify-center flex-shrink-0 transition-all duration-500 group-hover:scale-110 ${getStatusColor(ticket.status)} border border-current/10 shadow-sm`}>
              <ChatDots size={24} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <h3 className="text-base sm:text-lg font-bold text-foreground tracking-tight truncate max-w-[250px]">
                  {ticket.subject}
                </h3>
                <span className={`wf-uppercase-label !text-[10px] px-2 py-0.5 rounded-sm border border-current/10 ${getStatusColor(ticket.status)}`}>
                  {getStatusLabel(ticket.status)}
                </span>
                <span className={`text-[10px] font-black uppercase tracking-widest ${getPriorityColor(ticket.priority)} bg-foreground/[0.03] px-2 py-0.5 rounded-sm border border-current/5`}>
                  {getPriorityLabel(ticket.priority)}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-foreground/50 line-clamp-1 font-normal tracking-tight mb-3">{ticket.message}</p>
              
              {ticket.adminNote && (
                <div className="mt-4 p-4 bg-brand-500/5 border border-brand-500/10 rounded-md relative group/note">
                  <div className={`absolute top-0 ${isAr ? 'left-4' : 'right-4'} -translate-y-1/2 bg-brand-500 text-[10px] text-white px-2 py-0.5 rounded-full font-bold uppercase tracking-wider shadow-sm group-hover/note:scale-105 transition-transform`}>
                    {isAr ? 'رد الدعم' : 'Support Response'}
                  </div>
                  <p className="text-sm text-foreground/70 font-medium leading-relaxed italic break-words">
                    &quot;{ticket.adminNote}&quot;
                  </p>
                </div>
              )}

              <div className="flex items-center gap-4 mt-4 text-[11px] text-foreground/30 tabular-nums font-medium">
                <span className="flex items-center gap-1.5 bg-foreground/[0.03] px-2 py-0.5 rounded-sm">
                  <Calendar size={12} />
                  {new Date(ticket.createdAt).toLocaleDateString(isAr ? 'ar-EG' : 'en-US')}
                </span>
                <span className="opacity-60 uppercase tracking-widest bg-foreground/[0.03] px-2 py-0.5 rounded-sm">ID: {ticket.id.slice(-6)}</span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
