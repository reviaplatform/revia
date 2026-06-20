"use client";

import { useState } from "react";
import {
  MenuDots as MoreHorizontal,
  Forbidden as RejectIcon,
  CheckCircle as SendIcon,
} from "@solar-icons/react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { payoutService } from "@/services/payoutService";
import { toast } from "sonner";
import { SpinnerCustom } from "@/components/ui/spinner-custom";

interface PayoutActionsDropdownProps {
  payoutId: string;
  amount: number;
  status: string;
  onSuccess?: () => void;
}

export function PayoutActionsDropdown({
  payoutId,
  amount,
  status,
  onSuccess,
}: PayoutActionsDropdownProps) {
  const [showSendDialog, setShowSendDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // Status checks to disable actions
  const isPending = (status || "").toLowerCase() === "pending";

  const submitSend = async () => {
    setIsUpdating(true);
    try {
      await payoutService.markAsSent(payoutId);
      toast.success("Payout Sent", {
        description: `Successfully marked payout EGP ${amount} as sent.`,
      });
      setShowSendDialog(false);
      onSuccess?.();
    } catch (error: any) {
      toast.error("Failed to send payout", {
        description: error.message || "Something went wrong.",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const submitReject = async () => {
    setIsUpdating(true);
    try {
      await payoutService.reject(payoutId);
      toast.success("Payout Rejected", {
        description: `Successfully rejected payout EGP ${amount}.`,
      });
      setShowRejectDialog(false);
      onSuccess?.();
    } catch (error: any) {
      toast.error("Failed to reject payout", {
        description: error.message || "Something went wrong.",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  if (!isPending) return null; // Action dropdown only makes sense for Pending items

  return (
    <>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" aria-label="Open menu" size="sm">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end">
          <DropdownMenuLabel>Payout Actions</DropdownMenuLabel>
          <DropdownMenuGroup>
            <DropdownMenuItem onSelect={() => setShowSendDialog(true)}>
              <SendIcon className="mr-2 h-4 w-4 text-green-600" />
              <span className="text-green-600">Mark as Sent</span>
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => setShowRejectDialog(true)}>
              <RejectIcon className="mr-2 h-4 w-4 text-red-600" />
              <span className="text-red-600">Reject Payout</span>
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Send Dialog */}
      <Dialog open={showSendDialog} onOpenChange={setShowSendDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Mark Payout as Sent</DialogTitle>
            <DialogDescription>
              Are you sure you want to mark this payout for EGP {amount} as sent? This action indicates the funds have been successfully disbursed.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSendDialog(false)}>
              Cancel
            </Button>
            <Button variant="default" onClick={submitSend} disabled={isUpdating}>
              {isUpdating && <SpinnerCustom className="mr-2 h-4 w-4" />}
              Confirm Send
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Reject Payout</DialogTitle>
            <DialogDescription>
              Are you sure you want to reject this EGP {amount} payout? The target account will not be credited.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={submitReject} disabled={isUpdating}>
              {isUpdating && <SpinnerCustom className="mr-2 h-4 w-4" />}
              Confirm Reject
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
