"use client";

import { useState } from "react";
import {
  MenuDots as MoreHorizontal,
  Pen as Edit,
  Forbidden as Ban,
  UserCheck,
  Eye,
  Dollar,
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
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { providerService } from "@/services/providerService";
import { toast } from "sonner";
import { SpinnerCustom } from "@/components/ui/spinner-custom";

interface ProviderActionsDropdownProps {
  providerId: string;
  businessName: string;
  email: string;
  status: string;
  totalEarnings: string;
  onSuccess?: () => void;
}

export function ProviderActionsDropdown({
  providerId,
  businessName,
  email,
  status,
  totalEarnings,
  onSuccess,
}: ProviderActionsDropdownProps) {
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [showEarningsDialog, setShowEarningsDialog] = useState(false);

  const [isUpdating, setIsUpdating] = useState(false);
  const [editBusinessName, setEditBusinessName] = useState(businessName);
  const [editEmail, setEditEmail] = useState(email);

  const isSuspended = (status || "active").toLowerCase() === "suspended" || (status || "active").toLowerCase() === "banned";

  const submitEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      await providerService.updateProvider(providerId, {
        businessName: editBusinessName,
        email: editEmail,
      });
      toast.success("Provider Updated", {
        description: `Successfully updated ${businessName}.`,
      });
      setShowEditDialog(false);
      onSuccess?.();
    } catch (error: any) {
      toast.error("Update Failed", {
        description: error.message || "Failed to update provider information.",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const submitStatusToggle = async () => {
    setIsUpdating(true);
    try {
      if (isSuspended) {
        await providerService.activateProvider(providerId);
        toast.success("Provider Activated", {
          description: `${businessName} has been fully activated.`,
        });
      } else {
        await providerService.suspendProvider(providerId);
        toast.success("Provider Suspended", {
          description: `${businessName} has been suspended.`,
        });
      }
      setShowStatusDialog(false);
      onSuccess?.();
    } catch (error: any) {
      toast.error("Action Failed", {
        description: error.message || "Failed to change provider status.",
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
          <DropdownMenuLabel>Provider Actions</DropdownMenuLabel>
          <DropdownMenuGroup>
            <DropdownMenuItem onSelect={() => setShowEditDialog(true)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit Provider
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => setShowEarningsDialog(true)}>
               <Dollar className="mr-2 h-4 w-4" />
               View Earnings
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => setShowStatusDialog(true)}>
              {!isSuspended ? (
                <>
                  <Ban className="mr-2 h-4 w-4 text-red-600" />
                  <span className="text-red-600">Suspend Provider</span>
                </>
              ) : (
                <>
                  <UserCheck className="mr-2 h-4 w-4 text-emerald-600" />
                  <span className="text-emerald-600">Activate Provider</span>
                </>
              )}
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <form onSubmit={submitEdit}>
            <DialogHeader>
              <DialogTitle>Edit Provider</DialogTitle>
              <DialogDescription>
                Update the provider information below.
              </DialogDescription>
            </DialogHeader>
            <FieldGroup className="py-3">
              <Field>
                <FieldLabel htmlFor="edit-name">Business Name</FieldLabel>
                <Input 
                  id="edit-name" 
                  value={editBusinessName} 
                  onChange={(e) => setEditBusinessName(e.target.value)} 
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="edit-email">Email</FieldLabel>
                <Input 
                  id="edit-email" 
                  type="email" 
                  value={editEmail} 
                  onChange={(e) => setEditEmail(e.target.value)} 
                />
              </Field>
            </FieldGroup>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowEditDialog(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isUpdating}>
                {isUpdating && <SpinnerCustom className="mr-2 h-4 w-4" />}
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Status Change Dialog */}
      <Dialog open={showStatusDialog} onOpenChange={setShowStatusDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {isSuspended ? "Activate Provider" : "Suspend Provider"}
            </DialogTitle>
            <DialogDescription>
              {isSuspended
                ? `Are you sure you want to activate ${businessName}? They will regain access to the platform.`
                : `Are you sure you want to suspend ${businessName}? They will temporarily lose access.`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowStatusDialog(false)}>
              Cancel
            </Button>
            <Button 
               variant={isSuspended ? "default" : "destructive"} 
               onClick={submitStatusToggle} 
               disabled={isUpdating}
             >
              {isUpdating && <SpinnerCustom className="mr-2 h-4 w-4" />}
              {isSuspended ? "Confirm Activation" : "Confirm Suspension"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Earnings Summary Dialog */}
      <Dialog open={showEarningsDialog} onOpenChange={setShowEarningsDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Provider Earnings Summary</DialogTitle>
            <DialogDescription>
              Current earnings breakdown for {businessName}.
            </DialogDescription>
          </DialogHeader>
          <div className="py-6 flex flex-col items-center justify-center space-y-2">
            <div className="bg-green-100 dark:bg-green-900/30 p-4 rounded-full">
               <Dollar className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-3xl font-bold text-foreground">
              {String(totalEarnings).includes("EGP") ? totalEarnings : `EGP ${totalEarnings}`}
            </h2>
            <p className="text-sm text-muted-foreground">Total Lifetime Earnings</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEarningsDialog(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </>
  );
}
