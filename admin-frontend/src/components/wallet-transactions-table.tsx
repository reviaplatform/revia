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
import { Magnifer } from "@solar-icons/react";
import { payoutService, WalletTransactionItem } from "@/services/payoutService";
import { TableRowsSkeleton } from "@/components/table-skeleton";
import { SpinnerCustom } from "@/components/ui/spinner-custom";
import { toast } from "sonner";

export function WalletTransactionsTable() {
  const [searchTerm, setSearchTerm] = useState("");
  const [transactionsData, setTransactionsData] = useState<WalletTransactionItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchTransactions = async () => {
    setIsLoading(true);
    try {
      const response = await payoutService.getWalletTransactions(1, 100);
      let list: WalletTransactionItem[] = [];
      if (Array.isArray(response)) {
        list = response;
      } else if (response?.data && Array.isArray(response.data)) {
        list = response.data;
      } else if (response?.items && Array.isArray(response.items)) {
        list = response.items;
      } else if (response?.results && Array.isArray(response.results)) {
        list = response.results;
      }
      setTransactionsData(list);
    } catch (error: any) {
      toast.error("Failed to load wallet transactions", {
        description: error.message || "Could not reach the server.",
      });
      setTransactionsData([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const filteredTransactions = transactionsData.filter((txn) => {
    const rawId = txn.id || "";
    const rawNote = txn.note || "";
    const rawType = txn.type || "";

    return (
      rawId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rawNote.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rawType.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div className="w-full">
      <div className="mb-4 space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Magnifer className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search by ID, Type or Note..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-9"
            />
          </div>
        </div>
      </div>

      <div className="rounded-md border border-border bg-card overflow-x-auto">
        <Table className="min-w-[900px]">
          <TableCaption>Review recent wallet transactions</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Txn ID</TableHead>
              <TableHead className="min-w-[150px]">Type & Note</TableHead>
              <TableHead>Linked Entities</TableHead>
              <TableHead className="text-center">Direction</TableHead>
              <TableHead>Created Date</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="text-right">Balance After</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRowsSkeleton columnCount={7} showAction={false} />
            ) : filteredTransactions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center">
                  <div className="text-sm text-muted-foreground">No wallet transactions found.</div>
                </TableCell>
              </TableRow>
            ) : (
              filteredTransactions.map((txn) => (
                <TableRow key={txn.id} className="hover:bg-muted/30 transition-colors">
                  <TableCell className="font-mono text-[10px] text-muted-foreground">
                    {txn.id.slice(-6).toUpperCase()}
                  </TableCell>
                  <TableCell>
                    <div className="font-bold text-sm capitalize truncate max-w-[120px] md:max-w-none">{txn.type.replace(/_/g, " ")}</div>
                    <div className="text-[10px] md:text-xs text-muted-foreground truncate max-w-[150px] md:max-w-none">{txn.note}</div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {txn.payoutId && (
                        <div className="flex items-center gap-1">
                          <Badge variant="outline" className="text-[8px] h-3 font-bold px-1">PAYOUT</Badge>
                          <span className="text-[10px] font-mono text-muted-foreground">{txn.payoutId.slice(-6).toUpperCase()}</span>
                        </div>
                      )}
                      {txn.repairRequestId && (
                        <div className="flex items-center gap-1">
                          <Badge variant="outline" className="text-[8px] h-3 font-bold px-1">REPAIR</Badge>
                          <span className="text-[10px] font-mono text-muted-foreground">{txn.repairRequestId.slice(-6).toUpperCase()}</span>
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge 
                      variant={txn.direction === "credit" ? "default" : "outline"}
                      className={`text-[8px] md:text-[9px] font-bold uppercase tracking-widest px-1.5 py-0 ${txn.direction === "credit" ? "bg-wf-green text-white" : "text-destructive border-destructive/20"}`}
                    >
                      {txn.direction}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {new Date(txn.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className={`text-right font-mono font-bold text-xs md:text-sm ${txn.direction === "credit" ? "text-wf-green" : "text-destructive"}`}>
                    {txn.direction === "credit" ? "+" : "-"} <span className="hidden sm:inline">EGP </span>{txn.amount.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right font-mono text-[10px] md:text-xs font-semibold">
                    <span className="hidden md:inline">EGP </span>{txn.balanceAfter.toLocaleString()}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
