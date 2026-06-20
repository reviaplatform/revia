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
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { TableRowsSkeleton } from "@/components/table-skeleton";
import { SpinnerCustom } from "@/components/ui/spinner-custom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  MenuDots as MoreHorizontal,
  Magnifer as Search,
  Eye,
  Notes as ClipboardList,
  Restart as Refresh,
  Code as Terminal,
} from "@solar-icons/react";
import { repairRequestService, RepairRequestItem } from "@/services/repairRequestService";
import { toast } from "sonner";

export function RepairRequestTable() {
  const [data, setData] = useState<RepairRequestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Modal state
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [inspectionData, setInspectionData] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  const fetchList = async () => {
    setLoading(true);
    try {
      const res = await repairRequestService.getList(1, 100);
      let list: RepairRequestItem[] = [];
      if (Array.isArray(res)) list = res;
      else if (res?.data && Array.isArray(res.data)) list = res.data;
      else if ((res as any)?.items && Array.isArray((res as any).items)) list = (res as any).items;
      else if ((res as any)?.results && Array.isArray((res as any).results)) list = (res as any).results;
      
      setData(list);
    } catch (e: any) {
      toast.error(e.message || "Failed to fetch repair requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList();
  }, []);

  const handleViewDetails = async (id: string) => {
    setIsModalOpen(true);
    setIsLoadingDetails(true);
    setSelectedRequest(null);
    setInspectionData(null);
    try {
      const [reqDetails, inspection] = await Promise.all([
        repairRequestService.getSingle(id).catch(() => null),
        repairRequestService.getInspection(id).catch(() => null),
      ]);
      setSelectedRequest(reqDetails?.data || reqDetails);
      setInspectionData(inspection?.data || inspection);
    } catch (error: any) {
      toast.error("Failed to fetch full request details");
    } finally {
      setIsLoadingDetails(false);
    }
  };

  const getStatusBadgeStyle = (status: string) => {
    const s = (status || "").toLowerCase();
    if (s === "completed" || s === "resolved" || s === "payment_done" || s === "inspection_done") 
      return "bg-green-500/10 text-green-600 border-green-200/50 rounded-sm px-2 py-0 h-5 font-bold uppercase text-[10px]";
    
    if (s === "cancelled" || s === "rejected") 
      return "bg-red-500/10 text-red-600 border-red-200/50 rounded-sm px-2 py-0 h-5 font-bold uppercase text-[10px]";
    
    if (s.includes("pending") || s === "ai_assessing" || s === "offer_selected" || s.includes("inspection"))
      return "bg-amber-500/10 text-amber-600 border-amber-200/50 rounded-sm px-2 py-0 h-5 font-bold uppercase text-[10px]";
    
    return "bg-blue-500/10 text-blue-600 border-blue-200/50 rounded-sm px-2 py-0 h-5 font-bold uppercase text-[10px]";
  };

  const filteredData = data.filter((item) => {
    const term = searchTerm.toLowerCase();
    return (
      item.id?.toLowerCase().includes(term) ||
      item.status?.toLowerCase().includes(term) ||
      item.deviceName?.toLowerCase().includes(term) ||
      item.issueText?.toLowerCase().includes(term)
    );
  });

  const activeCount = data.filter(d => !['completed', 'resolved', 'cancelled', 'rejected'].includes((d.status || '').toLowerCase())).length;
  const historyCount = data.filter(d => ['completed', 'resolved', 'cancelled', 'rejected'].includes((d.status || '').toLowerCase())).length;

  return (
    <div className="w-full space-y-6">
      {/* Table Summary Section */}
      <div className="flex justify-end">
        <div className="flex items-center gap-3">
          <div className="flex -space-x-px">
            <div className="px-3 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-l-md flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
              <span className="text-xs font-semibold tabular-nums text-amber-600">{activeCount} Active</span>
            </div>
            <div className="px-3 py-1.5 bg-green-500/10 border border-green-500/20 border-l-0 rounded-r-md flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
              <span className="text-xs font-semibold tabular-nums text-green-600">{historyCount} History</span>
            </div>
          </div>
        </div>
      </div>

      {/* Unified Action Bar */}
      <div className="grid grid-cols-1 sm:flex items-center gap-3 p-1.5 bg-muted/30 border border-border/50 rounded-lg">
        <div className="relative flex-1 group">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <Input
            placeholder="Filter by request ID, status, or system logs..."
            className="pl-9 h-10 bg-background border-border/50 focus:border-primary/50 focus:ring-primary/10 transition-all text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={fetchList}
          className="h-10 px-4 bg-background border-border/50 hover:bg-muted/50 text-xs font-semibold transition-all"
        >
          <Refresh className="h-4 w-4 mr-2" />
          Refresh Requests
        </Button>
      </div>

      {/* Table Section */}
      <div className="rounded-md border border-border/50 bg-card overflow-x-auto transition-all duration-300">
        <Table className="w-full min-w-[1000px]">
            <TableHeader className="bg-muted/50">
              <TableRow className="hover:bg-transparent border-border/50">
                <TableHead className="w-[180px] text-[11px] font-bold uppercase tracking-wider">Request ID</TableHead>
                <TableHead className="min-w-[200px] md:min-w-[250px] text-[11px] font-bold uppercase tracking-wider">Device & Issue</TableHead>
                <TableHead className="w-[100px] md:w-[120px] text-[11px] font-bold uppercase tracking-wider text-center">Source</TableHead>
                <TableHead className="w-[100px] md:w-[120px] text-[11px] font-bold uppercase tracking-wider text-center">Status</TableHead>
                <TableHead className="text-[11px] font-bold uppercase tracking-wider">Created Date</TableHead>
                <TableHead className="text-right w-[80px] text-[11px] font-bold uppercase tracking-wider pr-6">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
               {loading ? (
                <TableRowsSkeleton columnCount={5} />
              ) : filteredData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-48 text-center bg-background/30 italic">
                     <div className="text-sm text-muted-foreground tracking-tight">No repair requests found matching your filters.</div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredData.map((item, idx) => (
                  <TableRow 
                    key={item.id}
                    className="group relative hover:bg-primary/[0.02] border-border/40 transition-all duration-300 animate-in fade-in slide-in-from-left-2"
                    style={{ animationDelay: `${idx * 40}ms` }}
                  >
                    <TableCell className="relative font-mono text-[10px] text-muted-foreground/70 tracking-tighter pl-6">
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary scale-y-0 group-hover:scale-y-100 transition-transform duration-300 origin-center" />
                      {item.id}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-semibold text-sm tracking-tight truncate max-w-[150px] md:max-w-[300px]">
                          {item.deviceName || "Unknown Device"}
                        </span>
                        <span className="text-[10px] text-muted-foreground line-clamp-1 max-w-[200px] md:max-w-[400px]">
                          {item.issueText || "No description provided"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex justify-center">
                        <Badge 
                          variant="outline" 
                          className={`text-[9px] h-4 font-bold uppercase px-1.5 ${item.flow === 'ai_chat' ? 'bg-primary/10 text-primary border-primary/20' : 'bg-muted text-muted-foreground border-border'}`}
                        >
                          {item.flow === 'ai_chat' ? 'AI Chat' : 'Direct'}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex justify-center">
                        <Badge variant="outline" className={getStatusBadgeStyle(item.status as string)}>
                          {item.status || "Unknown"}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs tabular-nums text-muted-foreground">
                      {item.createdAt ? new Date(item.createdAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }) : "N/A"}
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      <div className="flex justify-end opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-sm hover:bg-primary/10 hover:text-primary transition-all">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-[160px] border-border/50">
                            <DropdownMenuItem 
                              onClick={() => handleViewDetails(item.id)}
                              className="text-xs font-medium focus:bg-primary/10 focus:text-primary cursor-pointer px-3 py-2"
                            >
                              <Eye className="mr-2 h-3.5 w-3.5" />
                              View Details
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] p-0 overflow-hidden border-border/50 bg-background flex flex-col">
          <DialogHeader className="p-6 border-b border-border/50 bg-muted/30">
            <div className="flex items-center gap-3 mb-1">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-sm border border-primary/20">
                <Terminal className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-xl font-black tracking-tight text-foreground uppercase">Repair Request Details</DialogTitle>
                <DialogDescription className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 flex items-center gap-2">
                  Activity Log <span className="h-1 w-1 rounded-full bg-primary animate-pulse" /> ID: <span className="text-primary">{selectedRequest?.id || "PENDING"}</span>
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
            {isLoadingDetails ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <SpinnerCustom className="h-10 w-10 text-primary" />
                <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground animate-pulse">Loading request details...</span>
              </div>
            ) : (
              <div className="space-y-8 animate-in fade-in duration-500">
                {/* Structured UI */}
                {selectedRequest ? (
                  <div className="space-y-8">
                    {/* Device & Issue Overview */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="md:col-span-2 space-y-6">
                        <div className="p-5 bg-card border border-border/50 rounded-xl shadow-sm">
                          <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 mb-4 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                            Incident Report
                          </h4>
                          <div className="space-y-4">
                            <div>
                              <h2 className="text-2xl font-black tracking-tighter text-foreground mb-1">{selectedRequest.deviceName}</h2>
                              <Badge variant="outline" className={`text-[10px] h-5 font-bold uppercase ${selectedRequest.flow === 'ai_chat' ? 'bg-primary/5 text-primary border-primary/20' : 'bg-muted text-muted-foreground'}`}>
                                {selectedRequest.flow === 'ai_chat' ? 'AI Diagnostic Flow' : 'Direct Request'}
                              </Badge>
                            </div>
                            <div className="p-4 bg-muted/30 rounded-lg border border-border/40 italic text-sm text-foreground/80 leading-relaxed">
                              "{selectedRequest.issueText}"
                            </div>
                          </div>
                        </div>

                        {/* AI Report Section */}
                        {selectedRequest.aiReport && selectedRequest.aiReport.length > 0 && (
                          <div className="p-5 bg-primary/[0.02] border border-primary/10 rounded-xl">
                            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-4 flex items-center gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                              AI Analysis Output
                            </h4>
                            <div className="space-y-3">
                              {selectedRequest.aiReport.map((line: string, i: number) => (
                                <div key={i} className="flex gap-3 text-sm leading-relaxed">
                                  <span className="text-primary font-mono font-bold mt-0.5">[{i+1}]</span>
                                  <span className="text-foreground/90">{line}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Sidebar Details */}
                      <div className="space-y-6">
                        <div className="p-5 bg-muted/20 border border-border/40 rounded-xl space-y-4">
                          <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 mb-2">Service Context</h4>
                          
                          <div className="space-y-4">
                            <div className="space-y-1">
                              <p className="text-[9px] font-bold text-muted-foreground/50 uppercase tracking-widest">Status</p>
                              <Badge className={getStatusBadgeStyle(selectedRequest.status)}>{selectedRequest.status}</Badge>
                            </div>
                            <div className="space-y-1">
                              <p className="text-[9px] font-bold text-muted-foreground/50 uppercase tracking-widest">Initialization</p>
                              <p className="text-xs font-bold tabular-nums">
                                {new Date(selectedRequest.createdAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                              </p>
                            </div>
                            <div className="space-y-1">
                              <p className="text-[9px] font-bold text-muted-foreground/50 uppercase tracking-widest">Customer Reference</p>
                              <p className="text-[11px] font-mono bg-muted px-2 py-1 rounded truncate">{selectedRequest.customerId}</p>
                            </div>
                            {selectedRequest.selectedOfferId && (
                              <div className="space-y-1 pt-2 border-t border-border/40">
                                <p className="text-[9px] font-bold text-primary/70 uppercase tracking-widest">Selected Offer</p>
                                <p className="text-[11px] font-mono bg-primary/5 text-primary px-2 py-1 rounded truncate border border-primary/10">
                                  {selectedRequest.selectedOfferId}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Timeline */}
                        {selectedRequest.statusLogs && selectedRequest.statusLogs.length > 0 && (
                          <div className="p-5 bg-card border border-border/50 rounded-xl space-y-4">
                            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 mb-4">Event Logs</h4>
                            <div className="relative pl-4 space-y-6 before:absolute before:left-0 before:top-2 before:bottom-2 before:w-px before:bg-border/60">
                              {selectedRequest.statusLogs.map((log: any, i: number) => (
                                <div key={i} className="relative">
                                  <div className="absolute -left-[19px] top-1.5 w-2.5 h-2.5 rounded-full border-2 border-background bg-primary shadow-[0_0_0_4px_rgba(var(--primary),0.1)]" />
                                  <p className="text-[11px] font-bold uppercase tracking-tight text-foreground leading-none mb-1">{log.status.replace(/_/g, ' ')}</p>
                                  <p className="text-[10px] font-medium text-muted-foreground tabular-nums">
                                    {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </p>
                                </div>
                              )).reverse()}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Inspection Section */}
                    {inspectionData && (
                      <div className="p-6 bg-amber-500/[0.03] border border-amber-500/10 rounded-xl space-y-6">
                        <div className="flex items-center justify-between">
                          <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-600 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                            Technical Inspection Result
                          </h4>
                          <div className="flex items-center gap-2">
                            <span className="text-[9px] font-bold text-amber-600/60 uppercase">Final Assessment Cost</span>
                            <Badge className="bg-amber-500 text-white border-none font-bold tabular-nums">
                              {inspectionData.finalPrice?.toLocaleString()} EGP
                            </Badge>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-4">
                            <div className="p-4 bg-background border border-amber-500/10 rounded-lg shadow-sm">
                              <p className="text-[9px] font-bold text-amber-600/50 uppercase tracking-widest mb-2">Technician Notes</p>
                              <p className="text-sm text-foreground leading-relaxed">
                                {inspectionData.resultNotes || "No specific technical notes provided by the brand."}
                              </p>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                              <div className="p-3 bg-background border border-border/50 rounded-lg">
                                <p className="text-[9px] font-bold text-muted-foreground/50 uppercase tracking-widest mb-1">Brand Reference</p>
                                <p className="text-[10px] font-mono truncate">{inspectionData.brandId}</p>
                              </div>
                              <div className="p-3 bg-background border border-border/50 rounded-lg">
                                <p className="text-[9px] font-bold text-muted-foreground/50 uppercase tracking-widest mb-1">Inspection ID</p>
                                <p className="text-[10px] font-mono truncate">{inspectionData.id}</p>
                              </div>
                            </div>
                          </div>

                          {/* Inspection Images */}
                          {inspectionData.images && inspectionData.images.length > 0 && (
                            <div className="space-y-3">
                              <p className="text-[9px] font-bold text-amber-600/50 uppercase tracking-widest">Evidence Gallery</p>
                              <div className="grid grid-cols-2 gap-2">
                                {inspectionData.images.map((img: string, i: number) => (
                                  <div key={i} className="aspect-video rounded-lg overflow-hidden border border-border/50 bg-muted group relative">
                                    <img src={img} alt={`Inspection ${i}`} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-white hover:bg-white/20">
                                        <Eye className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-20 bg-muted/20 border border-border/30 border-dashed rounded-xl">
                    <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground">No request selected</p>
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="p-4 border-t border-border/50 bg-muted/30 flex justify-end">
            <Button 
              size="sm" 
              onClick={() => setIsModalOpen(false)}
              className="bg-primary text-primary-foreground font-bold text-xs px-6 h-8 hover:bg-primary/90 transition-all rounded-sm"
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
