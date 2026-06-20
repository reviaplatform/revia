"use client";

import { useState } from "react";
import {
  MenuDots as MoreHorizontal,
  Pen as Edit,
  Forbidden as Ban,
  UserCheck,
  // TrashBinMinimalistic as Trash2, // Not needed as Ban/Unban covers destructive states based on docs
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { adminService } from "@/services/adminService";
import { toast } from "sonner";
import { SpinnerCustom } from "@/components/ui/spinner-custom";

interface AdminActionsDropdownProps {
  adminId: string;
  adminName: string;
  adminEmail: string;
  adminStatus: string;
  adminRole: string;
  onSuccess?: () => void;
}

export function AdminActionsDropdown({
  adminId,
  adminName,
  adminEmail,
  adminStatus,
  adminRole,
  onSuccess,
}: AdminActionsDropdownProps) {
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  
  const [isUpdating, setIsUpdating] = useState(false);
  const [editRole, setEditRole] = useState(adminRole);

  const isBanned = (adminStatus || "active").toLowerCase() === "banned";

  const submitEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      await adminService.updateAdmin(adminId, { role: editRole.toLowerCase() });
      toast.success("Admin Updated", {
        description: `Successfully updated ${adminName}'s role to ${editRole}.`,
      });
      setShowEditDialog(false);
      onSuccess?.();
    } catch (error: any) {
      toast.error("Update Failed", {
        description: error.message || "Failed to update admin role.",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const submitStatusToggle = async () => {
    setIsUpdating(true);
    try {
      if (isBanned) {
        await adminService.unbanAdmin(adminId);
        toast.success("Admin Activated", {
          description: `${adminName} has been fully unbanned.`,
        });
      } else {
        await adminService.banAdmin(adminId);
        toast.success("Admin Banned", {
          description: `${adminName} has been strictly banned.`,
        });
      }
      setShowStatusDialog(false);
      onSuccess?.();
    } catch (error: any) {
      toast.error("Action Failed", {
        description: error.message || "Failed to change admin status.",
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
        <DropdownMenuContent className="w-48" align="end">
          <DropdownMenuLabel>Admin Actions</DropdownMenuLabel>
          <DropdownMenuGroup>
            <DropdownMenuItem onSelect={() => setShowEditDialog(true)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit Role
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => setShowStatusDialog(true)}>
              {!isBanned ? (
                <>
                  <Ban className="mr-2 h-4 w-4 text-red-600" />
                  <span className="text-red-600">Ban Admin</span>
                </>
              ) : (
                <>
                  <UserCheck className="mr-2 h-4 w-4 text-green-600" />
                  <span className="text-green-600">Activate Admin</span>
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
              <DialogTitle>Edit Admin Role</DialogTitle>
              <DialogDescription>
                Update the role permissions for {adminName}. Other details cannot be changed from this view.
              </DialogDescription>
            </DialogHeader>
            <FieldGroup className="py-3">
              <Field>
                <FieldLabel htmlFor="edit-name">Name</FieldLabel>
                <Input id="edit-name" defaultValue={adminName} disabled />
              </Field>
              <Field>
                <FieldLabel htmlFor="edit-email">Email</FieldLabel>
                <Input id="edit-email" type="email" defaultValue={adminEmail} disabled />
              </Field>
              <Field>
                <FieldLabel htmlFor="edit-role">Role</FieldLabel>
                <Select value={editRole} onValueChange={setEditRole}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
            </FieldGroup>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowEditDialog(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isUpdating}>
                {isUpdating && <SpinnerCustom className="mr-2 h-4 w-4" />}
                Save Role
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
              {isBanned ? "Activate Admin" : "Ban Admin"}
            </DialogTitle>
            <DialogDescription>
              {isBanned
                ? `Are you sure you want to unban ${adminName}? They will regain access instantly.`
                : `Are you sure you want to ban ${adminName}? They will lose all access to the system.`}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm font-medium text-muted-foreground">
              Admin: <span className="text-foreground">{adminName} ({adminEmail})</span>
            </p>
          </div>
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
    </>
  );
}
