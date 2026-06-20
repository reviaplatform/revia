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
import { 
  Magnifer as Search, 
  Filter, 
  CheckCircle, 
  ClockCircle as Clock, 
  CloseCircle as Expired,
  Wallet,
  Calendar,
  Buildings
} from "@solar-icons/react";
import { subscriptionService, Subscription, SubscriptionStatus } from "@/services/subscriptionService";
import { TableRowsSkeleton } from "@/components/table-skeleton";
import { SpinnerCustom } from "@/components/ui/spinner-custom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function SubscriptionTable() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<SubscriptionStatus | "all">("all");
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState<string | null>(null);

  const fetchSubscriptions = async () => {
    setIsLoading(true);
    try {
      const response = await subscriptionService.getSubscriptions(
        statusFilter === "all" ? undefined : statusFilter
      );
      setSubscriptions(response.data || []);
    } catch (error: any) {
      toast.error("Failed to load subscriptions", {
        description: error.message,
      });
      setSubscriptions([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptions();
  }, [statusFilter]);

  const handleMarkAsPaid = async (id: string) => {
    setIsProcessing(id);
    try {
      await subscriptionService.markAsPaid(id);
      toast.success("Subscription marked as paid and activated!");
      fetchSubscriptions();
    } catch (error: any) {
      toast.error("Failed to mark as paid", {
        description: error.message,
      });
    } finally {
      setIsProcessing(null);
    }
  };

  const filteredSubscriptions = subscriptions.filter((sub) => {
    const brandNameEn = sub.brandName?.en || "";
    const brandNameAr = sub.brandName?.ar || "";
    const id = sub.id || "";
    
    return (
      brandNameEn.toLowerCase().includes(searchTerm.toLowerCase()) ||
      brandNameAr.toLowerCase().includes(searchTerm.toLowerCase()) ||
      id.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const getStatusBadge = (status: SubscriptionStatus) => {
    switch (status) {
      case "active":
        return (
          <Badge className="bg-green-500/10 text-green-600 border-green-500/20 hover:bg-green-500/20 px-2 py-0.5 rounded-sm font-bold uppercase text-[10px] tracking-tight">
            <CheckCircle className="h-3 w-3 mr-1" />
            Active
          </Badge>
        );
      case "pending_payment":
        return (
          <Badge className="bg-orange-500/10 text-orange-600 border-orange-500/20 hover:bg-orange-500/20 px-2 py-0.5 rounded-sm font-bold uppercase text-[10px] tracking-tight">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        );
      case "expired":
        return (
          <Badge className="bg-red-500/10 text-red-600 border-red-500/20 hover:bg-red-500/20 px-2 py-0.5 rounded-sm font-bold uppercase text-[10px] tracking-tight">
            <Expired className="h-3 w-3 mr-1" />
            Expired
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDate = (date: string | null) => {
    if (!date) return "--";
    try {
      return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }).format(new Date(date));
    } catch {
      return date;
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Action Bar */}
      <div className="grid grid-cols-1 sm:flex items-center gap-3 p-1.5 bg-muted/30 border border-border/50 rounded-lg">
        <div className="relative flex-1 group">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <Input
            placeholder="Search by brand name or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 h-10 bg-background border-border/50 focus:border-primary/50 focus:ring-primary/10 transition-all text-sm"
          />
        </div>
        
        <div className="flex items-center gap-2 pr-1.5">
          <Select value={statusFilter} onValueChange={(val) => setStatusFilter(val as any)}>
            <SelectTrigger className="h-10 w-[150px] bg-background border-border/50 text-xs font-medium">
              <div className="flex items-center gap-2">
                <Filter className="h-3.5 w-3.5 text-muted-foreground" />
                <SelectValue placeholder="Status" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="pending_payment">Pending Payment</SelectItem>
              <SelectItem value="expired">Expired</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border border-border/50 bg-card overflow-x-auto transition-all duration-300 shadow-sm">
        <Table className="w-full min-w-[1000px]">
            <TableHeader className="bg-muted/50">
              <TableRow className="hover:bg-transparent border-border/50">
                <TableHead className="w-[100px] text-[11px] font-bold uppercase tracking-wider">ID</TableHead>
                <TableHead className="min-w-[150px] md:min-w-[200px] text-[11px] font-bold uppercase tracking-wider">Brand</TableHead>
                <TableHead className="w-[110px] md:w-[120px] text-[11px] font-bold uppercase tracking-wider text-center">Status</TableHead>
                <TableHead className="text-[11px] font-bold uppercase tracking-wider">Pricing Details</TableHead>
                <TableHead className="text-[11px] font-bold uppercase tracking-wider">Activated At</TableHead>
                <TableHead className="text-[11px] font-bold uppercase tracking-wider">Expires At</TableHead>
                <TableHead className="text-right w-[120px] md:w-[150px] text-[11px] font-bold uppercase tracking-wider pr-6">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRowsSkeleton columnCount={6} />
              ) : filteredSubscriptions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-48 text-center bg-background/30 italic">
                     <div className="text-sm text-muted-foreground">No subscriptions found.</div>
                  </TableCell>
                </TableRow>
              ) : filteredSubscriptions.map((sub, idx) => (
                <TableRow 
                  key={sub.id}
                  className="group relative hover:bg-primary/[0.02] border-border/40 transition-all duration-300 animate-in fade-in slide-in-from-left-2"
                  style={{ animationDelay: `${idx * 40}ms` }}
                >
                  <TableCell className="relative font-mono text-[10px] text-muted-foreground/70 tracking-tighter pl-6">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary scale-y-0 group-hover:scale-y-100 transition-transform duration-300 origin-center" />
                    {sub.id.substring(0, 8).toUpperCase()}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                        <Buildings className="h-4 w-4" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-semibold text-sm tracking-tight truncate max-w-[120px] md:max-w-none">{sub.brandName?.en || "Unknown Brand"}</span>
                        <span className="text-[11px] text-muted-foreground font-medium hidden md:inline">{sub.brandName?.ar}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex justify-center">
                      {getStatusBadge(sub.status)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-1.5 text-[11px] md:text-xs font-medium">
                        <Wallet className="h-3 w-3 text-muted-foreground" />
                        <span>{sub.price.toLocaleString()} EGP</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[9px] md:text-[10px] text-muted-foreground uppercase font-bold">
                        <Calendar className="h-3 w-3" />
                        <span>{sub.durationDays} Days</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-[11px] tabular-nums text-muted-foreground">
                    {formatDate(sub.activatedAt)}
                  </TableCell>
                  <TableCell className="text-[11px] tabular-nums text-muted-foreground">
                    <span className={sub.status === 'expired' ? 'text-red-500 font-medium' : ''}>
                      {formatDate(sub.expiresAt)}
                    </span>
                  </TableCell>
                  <TableCell className="text-right pr-6">
                    {sub.status === "pending_payment" && (
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={isProcessing === sub.id}
                        onClick={() => handleMarkAsPaid(sub.id)}
                        className="h-8 text-[9px] md:text-[10px] font-bold uppercase tracking-wider border-primary/20 text-primary hover:bg-primary hover:text-primary-foreground transition-all px-2 md:px-3"
                      >
                        {isProcessing === sub.id ? (
                          <SpinnerCustom className="h-3 w-3 mr-1" />
                        ) : (
                          <CheckCircle className="h-3 w-3 mr-1" />
                        )}
                        <span className="hidden sm:inline">Mark Paid</span>
                        <span className="sm:hidden">Pay</span>
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
      </div>
    </div>
  );
}
