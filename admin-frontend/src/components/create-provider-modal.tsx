"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { providerService } from "@/services/providerService";
import { toast } from "sonner";
import { SpinnerCustom } from "@/components/ui/spinner-custom";

export function CreateProviderModal({ onSuccess }: { onSuccess?: () => void }) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    businessName: "",
    email: "",
    phoneNumber: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.businessName || !formData.email || !formData.phoneNumber) {
      toast.error("Validation Error", {
        description: "Please fill in all required fields.",
      });
      return;
    }

    setIsLoading(true);
    try {
      await providerService.createProvider({
        ...formData,
        name: formData.businessName // API might expect 'name' from previous admin payload format
      });
      toast.success("Provider Created", {
        description: `${formData.businessName} has been successfully created.`,
      });
      setOpen(false);
      setFormData({ businessName: "", email: "", phoneNumber: "" });
      onSuccess?.();
    } catch (error: any) {
      toast.error("Failed to create provider", {
        description: error.message || "An unexpected error occurred.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Add Provider</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create New Provider</DialogTitle>
            <DialogDescription>
              Add a new business provider to the platform.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="businessName" className="text-right">
                Business Name
              </Label>
              <Input
                id="businessName"
                value={formData.businessName}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, businessName: e.target.value }))
                }
                className="col-span-3"
                placeholder="Acme Corp"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, email: e.target.value }))
                }
                className="col-span-3"
                placeholder="contact@acme.com"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="phoneNumber" className="text-right">
                Phone
              </Label>
              <Input
                id="phoneNumber"
                value={formData.phoneNumber}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, phoneNumber: e.target.value }))
                }
                className="col-span-3"
                placeholder="+1 555 0123"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <SpinnerCustom className="mr-2 h-4 w-4" />}
              Create
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
