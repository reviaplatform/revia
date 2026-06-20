"use client";

import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Magnifer, Filter, Letter, User, Box, ChatLine, ClockCircle, ShieldCheck } from "@solar-icons/react";
import { supportService, SupportTicket, SupportTicketStatus, SupportTicketPriority, SupportTicketSenderType } from "@/services/supportService";
import { SupportTicketActionsDropdown } from "@/components/support-ticket-actions-dropdown";
import { TableRowsSkeleton } from "@/components/table-skeleton";
import { SpinnerCustom } from "@/components/ui/spinner-custom";
import { toast } from "sonner";

export function SupportTicketTable() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [senderFilter, setSenderFilter] = useState<string>("all");
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchTickets = async () => {
    setIsLoading(true);
    try {
      const response = await supportService.getAllTickets();
      if (response.status === "success") {
        setTickets(response.data);
      } else {
        throw new Error("Failed to fetch tickets");
      }
    } catch (error: any) {
      toast.error("Failed to load tickets", {
        description: error.message || "Could not reach the server.",
      });
      setTickets([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const filteredTickets = tickets.filter((ticket) => {
    const searchString = `${ticket.subject} ${ticket.customerName || ""} ${ticket.brandName || ""} ${ticket.message} ${ticket.id}`.toLowerCase();
    const matchesSearch = searchString.includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || ticket.status === statusFilter;
    const matchesPriority = priorityFilter === "all" || ticket.priority === priorityFilter;
    const matchesSender = senderFilter === "all" || ticket.senderType === senderFilter;

    return matchesSearch && matchesStatus && matchesPriority && matchesSender;
  });

  const getStatusColor = (status: SupportTicketStatus) => {
    switch (status) {
      case SupportTicketStatus.OPEN:
        return "bg-wf-blue/10 text-wf-blue";
      case SupportTicketStatus.IN_PROGRESS:
        return "bg-wf-amber/10 text-wf-amber";
      case SupportTicketStatus.RESOLVED:
        return "bg-wf-green/10 text-wf-green";
      case SupportTicketStatus.CLOSED:
        return "bg-muted text-muted-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getPriorityColor = (priority: SupportTicketPriority) => {
    switch (priority) {
      case SupportTicketPriority.HIGH:
        return "bg-destructive/10 text-destructive";
      case SupportTicketPriority.MEDIUM:
        return "bg-wf-amber/10 text-wf-amber";
      case SupportTicketPriority.LOW:
        return "bg-wf-blue/10 text-wf-blue";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Table Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Letter className="h-5 w-5 text-primary" />
            <h3 className="text-xl font-semibold tracking-tight text-foreground">
              Support Tickets
            </h3>
          </div>
          <p className="text-sm text-muted-foreground max-w-md">
            Review and manage support requests from both customers and brands.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex -space-x-px">
            <div className="px-3 py-1.5 bg-wf-blue/10 border border-wf-blue/20 rounded-l-md flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-wf-blue animate-pulse" />
              <span className="text-xs font-semibold tabular-nums text-wf-blue">
                {tickets.filter(t => t.status === SupportTicketStatus.OPEN).length} Open
              </span>
            </div>
            <div className="px-3 py-1.5 bg-wf-green/10 border border-wf-green/20 border-l-0 rounded-r-md flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-wf-green" />
              <span className="text-xs font-semibold tabular-nums text-wf-green">
                {tickets.filter(t => t.status === SupportTicketStatus.RESOLVED).length} Resolved
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Unified Action Bar */}
      <div className="grid grid-cols-1 md:flex items-center gap-3 p-1.5 bg-muted/30 border border-border/50 rounded-lg">
        <div className="relative flex-1 group">
          <Magnifer className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <Input
            placeholder="Search by subject, message, or user..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 h-10 bg-background border-border/50 focus:border-primary/50 focus:ring-primary/10 transition-all text-sm"
          />
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          <Select value={senderFilter} onValueChange={setSenderFilter}>
            <SelectTrigger className="h-10 w-[120px] bg-background border-border/50 text-xs font-medium">
              <div className="flex items-center gap-2">
                <User className="h-3.5 w-3.5 text-muted-foreground" />
                <SelectValue placeholder="Sender" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Senders</SelectItem>
              <SelectItem value={SupportTicketSenderType.CUSTOMER}>Customers</SelectItem>
              <SelectItem value={SupportTicketSenderType.BRAND}>Brands</SelectItem>
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-10 w-[120px] bg-background border-border/50 text-xs font-medium">
              <div className="flex items-center gap-2">
                <Filter className="h-3.5 w-3.5 text-muted-foreground" />
                <SelectValue placeholder="Status" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value={SupportTicketStatus.OPEN}>Open</SelectItem>
              <SelectItem value={SupportTicketStatus.IN_PROGRESS}>In Progress</SelectItem>
              <SelectItem value={SupportTicketStatus.RESOLVED}>Resolved</SelectItem>
              <SelectItem value={SupportTicketStatus.CLOSED}>Closed</SelectItem>
            </SelectContent>
          </Select>

          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="h-10 w-[120px] bg-background border-border/50 text-xs font-medium">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priority</SelectItem>
              <SelectItem value={SupportTicketPriority.HIGH}>High</SelectItem>
              <SelectItem value={SupportTicketPriority.MEDIUM}>Medium</SelectItem>
              <SelectItem value={SupportTicketPriority.LOW}>Low</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table Section */}
      <div className="rounded-md border border-border/50 bg-card overflow-x-auto transition-all duration-300">
        <Table className="w-full min-w-[1000px]">
            <TableHeader className="bg-muted/50">
              <TableRow className="hover:bg-transparent border-border/50">
                <TableHead className="w-[80px] text-[11px] font-bold uppercase tracking-wider pl-6">ID</TableHead>
                <TableHead className="w-[150px] text-[11px] font-bold uppercase tracking-wider">Sender</TableHead>
                <TableHead className="min-w-[250px] text-[11px] font-bold uppercase tracking-wider">Issue & Message</TableHead>
                <TableHead className="w-[100px] text-[11px] font-bold uppercase tracking-wider text-center">Priority</TableHead>
                <TableHead className="w-[100px] text-[11px] font-bold uppercase tracking-wider text-center">Status</TableHead>
                <TableHead className="w-[140px] text-[11px] font-bold uppercase tracking-wider">Created At</TableHead>
                <TableHead className="text-right w-[80px] text-[11px] font-bold uppercase tracking-wider pr-6">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRowsSkeleton columnCount={6} />
              ) : filteredTickets.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-48 text-center bg-background/30 italic">
                     <div className="text-sm text-muted-foreground">No support tickets found matching your filters.</div>
                  </TableCell>
                </TableRow>
              ) : filteredTickets.map((ticket, idx) => (
                <TableRow 
                  key={ticket.id}
                  className="group hover:bg-primary/5 border-border/40 transition-colors animate-in fade-in slide-in-from-left-2 duration-300"
                  style={{ animationDelay: `${idx * 40}ms` }}
                >
                  <TableCell className="font-mono text-[10px] text-muted-foreground tracking-tighter pl-6">
                    #{ticket.id.slice(-6)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${ticket.senderType === SupportTicketSenderType.CUSTOMER ? 'bg-wf-blue/10 text-wf-blue' : 'bg-wf-amber/10 text-wf-amber'}`}>
                        {ticket.senderType === SupportTicketSenderType.CUSTOMER ? <User className="h-4 w-4" /> : <Box className="h-4 w-4" />}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-semibold text-sm tracking-tight truncate max-w-[120px]">
                          {ticket.customerName || ticket.brandName || "Unknown"}
                        </span>
                        <span className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">
                          {ticket.senderType}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1 max-w-[400px] min-w-0">
                      <span className="font-bold text-sm text-foreground line-clamp-1">{ticket.subject}</span>
                      <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed italic break-words">
                        "{ticket.message}"
                      </p>
                      {ticket.adminNote && (
                        <div className="mt-2 flex items-start gap-1.5 px-2 py-1 rounded bg-wf-green/5 border border-wf-green/10 max-w-full break-words">
                          <ShieldCheck className="h-3 w-3 text-wf-green shrink-0 mt-0.5" />
                          <span className="text-[10px] font-medium text-wf-green break-words">Admin Note: {ticket.adminNote}</span>
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge
                      variant="outline"
                      className={`text-[10px] px-2 py-0 h-5 border-none rounded-sm font-bold uppercase tracking-tight ${getPriorityColor(ticket.priority)}`}
                    >
                      {ticket.priority}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex justify-center">
                      <Badge
                        variant="outline"
                        className={`text-[10px] px-2 py-0 h-5 border-none rounded-sm font-bold uppercase tracking-tight ${getStatusColor(ticket.status)}`}
                      >
                        {ticket.status.replace("_", " ")}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-1.5 text-xs tabular-nums text-foreground font-medium">
                        <ClockCircle className="h-3 w-3 text-muted-foreground" />
                        {ticket.createdAt ? new Date(ticket.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : "N/A"}
                      </div>
                      <span className="text-[10px] text-muted-foreground pl-4">
                        {ticket.createdAt ? new Date(ticket.createdAt).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }) : ""}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right pr-6">
                    <div className="flex justify-end opacity-20 group-hover:opacity-100 transition-opacity">
                      <SupportTicketActionsDropdown
                        ticketId={ticket.id}
                        currentStatus={ticket.status}
                        currentNote={ticket.adminNote}
                        onSuccess={fetchTickets}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
      </div>
    </div>
  );
}
