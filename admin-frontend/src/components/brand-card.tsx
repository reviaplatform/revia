"use client";

import { useState } from "react";
import {
  Pen as Edit,
  TrashBinMinimalistic as Trash2,
  MenuDots as MoreHorizontal,
  Eye,
  EyeClosed as EyeOff,
  CheckCircle,
  CloseCircle as XCircle,
  Forbidden as Ban,
  Shield,
  Gallery as ImageIcon,
  Calendar,
  User,
} from "@solar-icons/react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SpinnerCustom } from "@/components/ui/spinner-custom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { BrandListItem, brandAdminApi, BrandReview } from "@/services/brandService";
import { toast } from "sonner";

interface BrandCardProps {
  brand: BrandListItem;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onBan: (id: string) => void;
  onUnban: (id: string) => void;
}

export function BrandCard({
  brand,
  onApprove,
  onReject,
  onBan,
  onUnban,
}: BrandCardProps) {
  const [showActionDialog, setShowActionDialog] = useState(false);
  const [actionType, setActionType] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  const [showReviewsDialog, setShowReviewsDialog] = useState(false);
  const [reviews, setReviews] = useState<BrandReview[] | null>(null);
  const [isReviewsLoading, setIsReviewsLoading] = useState(false);

  const fetchBrandReviews = async () => {
    setIsReviewsLoading(true);
    try {
      const response = await brandAdminApi.getSpecificReviews(brand.id);
      let list: BrandReview[] = [];
      if (Array.isArray(response)) {
        list = response;
      } else if ((response as any)?.data && Array.isArray((response as any).data)) {
        list = (response as any).data;
      }
      setReviews(list);
    } catch (e: any) {
      toast.error("Failed to load reviews", { description: e.message });
    } finally {
      setIsReviewsLoading(false);
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <span
            key={i}
            className={`text-sm ${
              i < rating ? "text-amber-500" : "text-muted-foreground/30"
            }`}
          >
            ★
          </span>
        ))}
      </div>
    );
  };

  const getDisplayStr = (val: any): string => {
    if (!val) return "—";
    if (typeof val === "string") return val;
    return val.en || val.ar || Object.values(val)[0] || "—";
  };



  const handleAction = (type: string) => {
    setActionType(type);
    setShowActionDialog(true);
  };

  const confirmAction = async () => {
    setIsLoading(true);
    try {
      switch (actionType) {
        case "approve":
          await onApprove(brand.id);
          break;
        case "reject":
          await onReject(brand.id);
          break;
        case "ban":
          await onBan(brand.id);
          break;
        case "unban":
          await onUnban(brand.id);
          break;
      }
      setShowActionDialog(false);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = () => {
    if (brand.isBanned || brand.status === "banned") {
      return <Badge variant="destructive" className="rounded-sm px-1.5 h-5 text-[10px] font-bold uppercase tracking-wider">Banned</Badge>;
    }
    const status = (brand.status || "").toLowerCase();
    switch (status) {
      case "approved":
        return <Badge className="bg-green-100 text-green-700 hover:bg-green-200 border-none rounded-sm px-1.5 h-5 text-[10px] font-bold uppercase tracking-wider">Approved</Badge>;
      case "pending":
        return <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-200 border-none rounded-sm px-1.5 h-5 text-[10px] font-bold uppercase tracking-wider">Pending</Badge>;
      case "rejected":
        return <Badge variant="destructive" className="rounded-sm px-1.5 h-5 text-[10px] font-bold uppercase tracking-wider">Rejected</Badge>;
      default:
        return <Badge variant="outline" className="rounded-sm px-1.5 h-5 text-[10px] font-bold uppercase tracking-wider">{brand.status}</Badge>;
    }
  };

  const getVisibilityBadge = () => {
    return brand.visibility === "Visible" ? (
      <Badge variant="outline" className="text-green-600/70 border-green-200/20 rounded-sm px-1.5 h-5 text-[10px] font-bold uppercase tracking-wider">
        Visible
      </Badge>
    ) : (
      <Badge variant="outline" className="text-muted-foreground/60 border-border rounded-sm px-1.5 h-5 text-[10px] font-bold uppercase tracking-wider">
        Hidden
      </Badge>
    );
  };

  return (
    <>
      <div className="group bg-card rounded-md border border-border flex flex-col h-full transition-all duration-300 hover:border-primary/40 hover:bg-accent/5">
        <div className="p-4 flex-1 flex flex-col">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-muted rounded-md border border-border flex items-center justify-center overflow-hidden group-hover:border-primary/20 transition-colors">
                {brand.logo ? (
                  <img
                    src={brand.logo}
                    alt={getDisplayStr(brand.name)}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <ImageIcon className="h-6 w-6 text-muted-foreground/40" />
                )}
              </div>
              <div className="space-y-0.5">
                <h3 className="font-bold text-foreground text-sm tracking-tight leading-none mb-1">
                  {getDisplayStr(brand.name)}
                </h3>
                <div className="flex flex-col gap-0.5">
                  <span className="label-micro text-muted-foreground/60 tracking-tighter">ID:{brand.id.slice(-6).toUpperCase()}</span>
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-primary/70">CRN:{brand.crn || "—"}</span>
                  </div>
                </div>
              </div>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-7 w-7 p-0 rounded-md hover:bg-muted">
                  <MoreHorizontal className="h-3.5 w-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 rounded-md border-border">
                <DropdownMenuLabel className="label-micro text-muted-foreground">Brand Actions</DropdownMenuLabel>

                {(brand.status === "pending" || !brand.status) && (
                  <>
                    <DropdownMenuItem onClick={() => handleAction("approve")} className="text-sm">
                      <CheckCircle className="mr-2 h-3.5 w-3.5 text-green-600" />
                      Approve Brand
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                )}

                {(brand.status === "approved" && !brand.isBanned) && (
                  <DropdownMenuItem onClick={() => handleAction("ban")} className="text-sm">
                    <Ban className="mr-2 h-3.5 w-3.5 text-red-600" />
                    Ban Brand
                  </DropdownMenuItem>
                )}

                {(brand.isBanned || brand.status === "banned") && (
                  <DropdownMenuItem onClick={() => handleAction("unban")} className="text-sm">
                    <Shield className="mr-2 h-3.5 w-3.5 text-green-600" />
                    Unban Brand
                  </DropdownMenuItem>
                )}

                <DropdownMenuSeparator />

                <DropdownMenuItem
                  onClick={() => {
                    fetchBrandReviews();
                    setShowReviewsDialog(true);
                  }}
                  className="text-sm"
                >
                  <Eye className="mr-2 h-3.5 w-3.5 text-blue-600" />
                  View Reviews
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Status */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-1.5">
              {getStatusBadge()}
            </div>
            {brand.rating !== undefined && brand.rating > 0 && (
              <button
                onClick={() => {
                  fetchBrandReviews();
                  setShowReviewsDialog(true);
                }}
                className="flex items-center gap-1 bg-green-500/5 px-1.5 py-0.5 rounded-sm border border-green-500/10 hover:bg-green-500/10 transition-colors cursor-pointer"
              >
                <span className="text-[10px] font-black text-green-600">{brand.rating.toFixed(1)}</span>
                <span className="text-[8px] font-bold text-green-600/60">★</span>
              </button>
            )}
          </div>

          {/* Business Info */}
          <div className="mb-4 flex-1 space-y-1">
            <div className="flex items-center justify-between text-[10px] font-bold text-muted-foreground/80 uppercase tracking-widest">
              <span>TIN</span>
              <span className="text-foreground">{brand.tin || "—"}</span>
            </div>
            <div className="flex items-center justify-between text-[10px] font-bold text-muted-foreground/80 uppercase tracking-widest">
              <span>Repairs</span>
              <span className="text-foreground">{brand.completedRepairs || 0}</span>
            </div>
          </div>

          {/* Metrics */}
          <div className="grid grid-cols-2 gap-2 mb-4">
            <div className="bg-muted/30 rounded-sm p-2 border border-border/50">
              <span className="label-micro text-muted-foreground/60 block mb-0.5 uppercase">Branches</span>
              <span className="text-sm font-bold tabular-nums">{brand.branches?.length || 0}</span>
            </div>
            <div className="bg-muted/30 rounded-sm p-2 border border-border/50">
              <span className="label-micro text-muted-foreground/60 block mb-0.5 uppercase">Categories</span>
              <span className="text-sm font-bold tabular-nums">{brand.categories?.length || 0}</span>
            </div>
          </div>

          {/* Footer Info */}
          <div className="pt-3 border-t border-border/60">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-muted-foreground/60">
                <Calendar className="h-3 w-3" />
                <span className="text-[10px] font-medium">{brand.createdAt ? new Date(brand.createdAt).toLocaleDateString() : "—"}</span>
              </div>
              <Badge variant="outline" className="text-[9px] font-black tracking-widest uppercase border-none bg-primary/5 text-primary">
                {brand.allowPayUsePOS ? "POS Active" : "POS Disabled"}
              </Badge>
            </div>
          </div>
        </div>
      </div>


      {/* Action Confirmation Dialog */}
      <Dialog open={showActionDialog} onOpenChange={setShowActionDialog}>
        <DialogContent className="sm:max-w-[425px] rounded-md border-border p-6 font-jakarta">
          <DialogHeader className="space-y-1.5">
            <DialogTitle className="text-xl font-bold tracking-tight capitalize">
              {actionType === "approve" && "Approve Brand"}
              {actionType === "ban" && "Ban Brand"}
              {actionType === "unban" && "Unban Brand"}
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              {actionType === "approve" &&
                "Are you sure you want to approve this brand? It will become visible to users."}
              {actionType === "ban" &&
                "Are you sure you want to ban this brand? They will lose access to the platform."}
              {actionType === "unban" &&
                "Are you sure you want to unban this brand? They will regain access to the platform."}
            </DialogDescription>
          </DialogHeader>
          <div className="py-6">
            <div className="flex items-center gap-3 p-4 bg-muted/40 rounded-md border border-border border-dashed">
              <div className="w-10 h-10 bg-muted rounded-md border border-border flex items-center justify-center overflow-hidden">
                {brand.logo ? (
                  <img
                    src={brand.logo}
                    alt={getDisplayStr(brand.name)}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <ImageIcon className="h-5 w-5 text-muted-foreground/50" />
                )}
              </div>
              <div className="flex-1">
                <div className="text-sm font-bold tracking-tight">{getDisplayStr(brand.name)}</div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60">ID:{brand.id.slice(-6).toUpperCase()}</div>
              </div>
              {getStatusBadge()}
            </div>
          </div>
          <DialogFooter className="gap-3 sm:gap-0">
            <DialogClose asChild>
              <Button variant="outline" className="rounded-md h-10 px-6 font-semibold" disabled={isLoading}>Cancel</Button>
            </DialogClose>
            <Button
              onClick={confirmAction}
              disabled={isLoading}
              className="rounded-md h-10 px-6 font-bold"
              variant={
                actionType === "ban"
                  ? "destructive"
                  : "default"
              }
            >
              {isLoading && <SpinnerCustom className="mr-2 h-4 w-4" />}
              {actionType === "approve" && "Approve Brand"}
              {actionType === "ban" && "Ban Brand"}
              {actionType === "unban" && "Unban Brand"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reviews Dialog */}
      <Dialog open={showReviewsDialog} onOpenChange={setShowReviewsDialog}>
        <DialogContent className="sm:max-w-[480px] rounded-md border-border p-6">
          <DialogHeader className="space-y-1.5">
            <DialogTitle className="text-xl font-bold tracking-tight">
              Reviews & Ratings
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              Customer reviews and feedback for <span className="font-bold text-foreground">{getDisplayStr(brand.name)}</span>
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 my-2 max-h-[350px] overflow-y-auto pr-1 space-y-4">
            {isReviewsLoading ? (
              <div className="flex flex-col items-center justify-center py-10 gap-2">
                <SpinnerCustom className="h-6 w-6 text-primary animate-spin" />
                <span className="text-xs text-muted-foreground">Fetching reviews...</span>
              </div>
            ) : !reviews || reviews.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground text-sm">
                No reviews found for this brand yet.
              </div>
            ) : (
              reviews.map((review) => (
                <div key={review.id} className="p-3 bg-muted/30 border border-border/50 rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">
                        {review.customerName ? review.customerName.slice(0, 2).toUpperCase() : "U"}
                      </div>
                      <span className="text-xs font-semibold text-foreground">
                        {review.customerName || `Customer #${review.customerId.slice(-6).toUpperCase()}`}
                      </span>
                    </div>
                    <span className="text-[10px] text-muted-foreground font-mono">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    {renderStars(review.rating)}
                    <span className="text-[9px] text-muted-foreground font-mono">
                      Req ID: {review.repairRequestId.slice(-6).toUpperCase()}
                    </span>
                  </div>
                  {review.comment && (
                    <p className="text-xs text-muted-foreground bg-background/50 p-2 rounded border border-border/20 italic">
                      "{review.comment}"
                    </p>
                  )}
                </div>
              ))
            )}
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" className="rounded-md h-10 px-6 font-semibold w-full sm:w-auto" onClick={() => setShowReviewsDialog(false)}>
                Close
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

