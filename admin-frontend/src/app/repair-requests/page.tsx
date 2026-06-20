"use client";

import { useState } from "react";
import { RepairRequestTable } from "@/components/repair-request-table";
import { PageTemplate } from "@/components/page-template";

export default function RepairRequestsPage() {
  const [currentPage, setCurrentPage] = useState("Repair Requests");

  return (
    <PageTemplate currentPage={currentPage}>
      <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out-expo text-foreground">
        <div className="border-l-2 border-primary/20 pl-6">
          <h1 className="text-3xl md:text-4xl font-black text-foreground tracking-tighter uppercase">
            Repair Requests
          </h1>
          <p className="text-muted-foreground text-sm font-medium max-w-[60ch] leading-relaxed">
            Track and manage device repair requests, technical diagnostic details, and inspection reports.
          </p>
        </div>
        
        <div className="mt-2">
          <RepairRequestTable />
        </div>
      </div>
    </PageTemplate>
  );
}
