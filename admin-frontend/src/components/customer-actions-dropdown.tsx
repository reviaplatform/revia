"use client";

import { useState } from "react";
import {
  MenuDots as MoreHorizontal,
  Forbidden as Ban,
  UserCheck,
  Refresh as Restore,
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { customerService } from "@/services/customerService";
import { toast } from "sonner";
import { SpinnerCustom } from "@/components/ui/spinner-custom";

interface CustomerActionsDropdownProps {
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerStatus: string;
  onSuccess?: () => void;
}

export function CustomerActionsDropdown({
  customerId,
  customerName,
  customerEmail,
  customerStatus,
  onSuccess,
}: CustomerActionsDropdownProps) {
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [showRestoreDialog, setShowRestoreDialog] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const isBanned = (customerStatus || "active").toLowerCase() === "banned";
  const isDeleted = (customerStatus || "active").toLowerCase() === "deleted";

  const submitStatusToggle = async () => {
    setIsUpdating(true);
    try {
      if (isBanned) {
        await customerService.unbanCustomer(customerId);
        toast.success("Customer Unbanned", {
          description: `${customerName} can now access their account again.`,
        });
      } else {
        await customerService.banCustomer(customerId);
        toast.success("Customer Banned", {
          description: `${customerName} has been restricted from the platform.`,
        });
      }
      setShowStatusDialog(false);
      onSuccess?.();
    } catch (error: any) {
      toast.error("Action Failed", {
        description: error.message || "Failed to change customer status.",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const submitRestoreToggle = async () => {
    setIsUpdating(true);
    try {
      await customerService.restoreCustomer(customerId);
      toast.success("Customer Restored", {
         description: `${customerName}'s account has been successfully recovered.`,
      });
      setShowRestoreDialog(false);
      onSuccess?.();
    } catch (error: any) {
      toast.error("Restore Failed", {
        description: error.message || "Failed to restore customer.",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" aria-label="Open menu" size="sm">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end">
          <DropdownMenuLabel>Customer Actions</DropdownMenuLabel>
          <DropdownMenuGroup>
            <DropdownMenuItem onSelect={() => setShowStatusDialog(true)}>
              {!isBanned ? (
                <>
                  <Ban className="mr-2 h-4 w-4 text-red-600" />
                  <span className="text-red-600">Ban Customer</span>
                </>
              ) : (
                <>
                  <UserCheck className="mr-2 h-4 w-4 text-emerald-600" />
                  <span className="text-emerald-600">Unban Customer</span>
                </>
              )}
            </DropdownMenuItem>

            {isDeleted && (
               <DropdownMenuItem onSelect={() => setShowRestoreDialog(true)}>
                 <Restore className="mr-2 h-4 w-4 text-blue-600" />
                 <span className="text-blue-600">Restore Customer</span>
               </DropdownMenuItem>
            )}
            
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Status Change Dialog */}
      <Dialog open={showStatusDialog} onOpenChange={setShowStatusDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {isBanned ? "Unban Customer" : "Ban Customer"}
            </DialogTitle>
            <DialogDescription>
              {isBanned
                ? `Are you sure you want to unban ${customerName} (${customerEmail})? They will regain access to their account.`
                : `Are you sure you want to ban ${customerName} (${customerEmail})? They will immediately lose access.`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowStatusDialog(false)}>
              Cancel
            </Button>
            <Button 
               variant={isBanned ? "default" : "destructive"} 
               onClick={submitStatusToggle} 
               disabled={isUpdating}
             >
              {isUpdating && <SpinnerCustom className="mr-2 h-4 w-4" />}
              {isBanned ? "Confirm Unban" : "Confirm Ban"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Restore Dialog */}
      <Dialog open={showRestoreDialog} onOpenChange={setShowRestoreDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Restore Customer</DialogTitle>
            <DialogDescription>
              Are you sure you want to recover {customerName}'s account from deletion? Their previous access and data will be fully reinstated.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
             <Button variant="outline" onClick={() => setShowRestoreDialog(false)}>
               Cancel
             </Button>
             <Button variant="default" onClick={submitRestoreToggle} disabled={isUpdating}>
               {isUpdating && <SpinnerCustom className="mr-2 h-4 w-4" />}
               Confirm Restore
             </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </>
  );
}
