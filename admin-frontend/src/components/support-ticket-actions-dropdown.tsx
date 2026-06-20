"use client";

import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { MenuDots, PenNewSquare, CheckCircle, ChatLine, TrashBinMinimalistic } from "@solar-icons/react";
import { supportService, SupportTicketStatus } from "@/services/supportService";
import { toast } from "sonner";
import { SpinnerCustom } from "@/components/ui/spinner-custom";

interface SupportTicketActionsDropdownProps {
  ticketId: string;
  currentStatus: SupportTicketStatus;
  currentNote?: string;
  onSuccess: () => void;
}

export function SupportTicketActionsDropdown({
  ticketId,
  currentStatus,
  currentNote,
  onSuccess,
}: SupportTicketActionsDropdownProps) {
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [status, setStatus] = useState<SupportTicketStatus>(currentStatus);
  const [adminNote, setAdminNote] = useState(currentNote || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleUpdateStatus = async () => {
    setIsSubmitting(true);
    try {
      await supportService.updateTicketStatus(ticketId, {
        status,
        adminNote: adminNote || undefined,
      });
      toast.success("Ticket updated successfully");
      setIsUpdateDialogOpen(false);
      onSuccess();
    } catch (error: any) {
      toast.error("Failed to update ticket", {
        description: error.message || "An unexpected error occurred.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-primary/10 transition-colors">
            <span className="sr-only">Open menu</span>
            <MenuDots className="h-4 w-4 text-muted-foreground" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48 p-1.5 border-border/50 bg-background/95 backdrop-blur-md">
          <DropdownMenuLabel className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-2 py-1.5">
            Ticket Actions
          </DropdownMenuLabel>
          <DropdownMenuSeparator className="bg-border/50" />
          <DropdownMenuItem
            className="flex items-center gap-2 px-2 py-2 text-xs font-medium cursor-pointer rounded-md focus:bg-primary/10 focus:text-primary transition-colors"
            onClick={() => setIsUpdateDialogOpen(true)}
          >
            <PenNewSquare className="h-3.5 w-3.5" />
            Update Status
          </DropdownMenuItem>
          <DropdownMenuItem
            className="flex items-center gap-2 px-2 py-2 text-xs font-medium cursor-pointer rounded-md focus:bg-wf-green/10 focus:text-wf-green transition-colors"
            onClick={() => {
              setStatus(SupportTicketStatus.RESOLVED);
              setIsUpdateDialogOpen(true);
            }}
          >
            <CheckCircle className="h-3.5 w-3.5" />
            Mark as Resolved
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={isUpdateDialogOpen} onOpenChange={setIsUpdateDialogOpen}>
        <DialogContent className="sm:max-w-[450px] border-border/50 bg-background/95 backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold tracking-tight">Update Ticket</DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              Modify the ticket status and add internal notes for other admins.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            <div className="grid gap-2">
              <Label htmlFor="status" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Status
              </Label>
              <Select
                value={status}
                onValueChange={(value) => setStatus(value as SupportTicketStatus)}
              >
                <SelectTrigger id="status" className="h-11 bg-muted/30 border-border/50">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={SupportTicketStatus.OPEN}>Open</SelectItem>
                  <SelectItem value={SupportTicketStatus.IN_PROGRESS}>In Progress</SelectItem>
                  <SelectItem value={SupportTicketStatus.RESOLVED}>Resolved</SelectItem>
                  <SelectItem value={SupportTicketStatus.CLOSED}>Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="note" className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <ChatLine className="h-3.5 w-3.5" />
                Admin Note
              </Label>
              <Textarea
                id="note"
                placeholder="Enter internal note here..."
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                className="min-h-[120px] bg-muted/30 border-border/50 focus:border-primary/50 focus:ring-primary/10 transition-all resize-none"
              />
              <p className="text-[10px] text-muted-foreground italic text-right">
                {adminNote.length}/1000 characters
              </p>
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="ghost"
              onClick={() => setIsUpdateDialogOpen(false)}
              className="text-xs font-semibold hover:bg-muted"
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdateStatus}
              disabled={isSubmitting}
              className="px-6 text-xs font-bold uppercase tracking-wider h-10 shadow-lg shadow-primary/20 transition-all active:scale-95"
            >
              {isSubmitting ? (
                <>
                  <SpinnerCustom className="mr-2 h-3 w-3" />
                  Updating...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
