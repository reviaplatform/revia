"use client";

import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCaption,
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
import { Magnifer, Filter } from "@solar-icons/react";
import { payoutService, PayoutListItem } from "@/services/payoutService";
import { TableRowsSkeleton } from "@/components/table-skeleton";
import { SpinnerCustom } from "@/components/ui/spinner-custom";
import { toast } from "sonner";
import { PayoutActionsDropdown } from "@/components/payout-actions-dropdown";

export function PayoutTable() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [payoutsData, setPayoutsData] = useState<PayoutListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPayouts = async () => {
    setIsLoading(true);
    try {
      const response = await payoutService.getPayouts(1, 100);
      let list: PayoutListItem[] = [];
      if (Array.isArray(response)) {
        list = response;
      } else if (response?.data && Array.isArray(response.data)) {
        list = response.data;
      } else if (response?.items && Array.isArray(response.items)) {
        list = response.items;
      } else if (response?.results && Array.isArray(response.results)) {
        list = response.results;
      }
      setPayoutsData(list);
    } catch (error: any) {
      toast.error("Failed to load payouts", {
        description: error.message || "Could not reach the server.",
      });
      setPayoutsData([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPayouts();
  }, []);

  const filteredPayouts = payoutsData.filter((payout) => {
    const rawId = payout.id || "";
    const rawBrand = payout.brand.name.en || "";
    const rawRequestedBy = payout.requestedBy.name || "";
    const rawStatus = (payout.status || "pending").toLowerCase();

    const matchesSearch =
      rawId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rawBrand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rawRequestedBy.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "all" || rawStatus === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getDestinationInfo = (payout: PayoutListItem) => {
    if (payout.method === "bank" && payout.bankDestination) {
      return {
        provider: payout.bankDestination.bankName,
        detail: `IBAN: ${payout.bankDestination.iban}`,
        holder: payout.bankDestination.accountHolderName
      };
    }
    if (payout.method === "wallet" && payout.walletDestination) {
      return {
        provider: payout.walletDestination.walletProvider,
        detail: payout.walletDestination.phoneNumber,
        holder: payout.walletDestination.accountHolderName
      };
    }
    if (payout.method === "instapay" && payout.instapayDestination) {
      return {
        provider: "Instapay",
        detail: payout.instapayDestination.identifier,
        holder: payout.instapayDestination.accountHolderName
      };
    }
    return { provider: "N/A", detail: "N/A", holder: "N/A" };
  };

  return (
    <div className="w-full">
      <div className="mb-4 space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Magnifer className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search by ID, Brand or Requester..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-9 text-xs w-full sm:w-[150px]">
              <Filter className="h-3 w-3 mr-1" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="sent">Sent</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="rounded-md border border-border bg-card overflow-x-auto">
        <Table className="min-w-[800px]">
          <TableCaption>Manage and review payout records</TableCaption>
          <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Payout ID</TableHead>
                <TableHead className="min-w-[120px]">Brand</TableHead>
                <TableHead>Requested By</TableHead>
                <TableHead>Destination</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead>Created Date</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRowsSkeleton columnCount={7} />
              ) : filteredPayouts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-32 text-center">
                    <div className="text-sm text-muted-foreground">No payout records found.</div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredPayouts.map((payout) => {
                  const dest = getDestinationInfo(payout);
                  return (
                    <TableRow key={payout.id} className="group transition-colors hover:bg-muted/50">
                      <TableCell className="font-mono text-[10px] text-muted-foreground">
                        {payout.id.slice(-6).toUpperCase()}
                      </TableCell>
                      <TableCell>
                        <div className="font-bold text-sm truncate max-w-[100px] md:max-w-none">{payout.brand.name.en}</div>
                      </TableCell>
                      <TableCell>
                        <div className="text-xs font-medium">{payout.requestedBy.name}</div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-[8px] h-3.5 md:h-4 font-bold uppercase tracking-tighter px-1">
                              {payout.method}
                            </Badge>
                            <span className="text-[10px] md:text-xs font-semibold capitalize truncate max-w-[60px] md:max-w-none">{dest.provider}</span>
                          </div>
                          <div className="text-[9px] md:text-[10px] font-mono text-muted-foreground truncate max-w-[80px] md:max-w-none">{dest.detail}</div>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge
                          variant={
                            (payout.status || "").toLowerCase() === "sent"
                              ? "default"
                              : (payout.status || "").toLowerCase() === "rejected"
                              ? "destructive"
                              : "secondary" // Pending
                          }
                          className="text-[9px] md:text-[10px] font-bold px-1.5 py-0"
                        >
                          {(payout.status || "pending").toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {new Date(payout.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right font-mono font-bold text-xs md:text-sm">
                        <span className="hidden sm:inline">EGP </span>{payout.amount.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end md:opacity-20 group-hover:opacity-100 transition-opacity">
                          <PayoutActionsDropdown
                            payoutId={payout.id}
                            amount={payout.amount}
                            status={payout.status}
                            onSuccess={fetchPayouts}
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
        </Table>
      </div>
    </div>
  );
}
