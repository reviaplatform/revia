"use client";

import { useState } from "react";
import { SupportTicketTable } from "@/components/support-ticket-table";
import { PageTemplate } from "@/components/page-template";

export default function SupportPage() {
  const [currentPage, setCurrentPage] = useState("Support Tickets");

  return (
    <PageTemplate currentPage={currentPage}>
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out-expo">
        <div className="border-l-2 border-primary/20 pl-6 mb-8">
          <h1 className="text-3xl md:text-4xl font-black text-foreground tracking-tighter uppercase mb-2">
            Support Tickets
          </h1>
          <p className="text-muted-foreground text-sm font-medium max-w-[60ch] leading-relaxed">
            Manage and resolve inquiries from customers and partners. Track status, assign priorities, and ensure high-quality service levels.
          </p>
        </div>
        <SupportTicketTable />
      </div>
    </PageTemplate>
  );
}
