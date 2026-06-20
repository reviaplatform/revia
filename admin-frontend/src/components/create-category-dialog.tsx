"use client";

import { useState } from "react";
import { AddCircle as Plus } from "@solar-icons/react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { categoryAdminApi } from "@/services/categoryService";
import { toast } from "sonner";
import { SpinnerCustom } from "@/components/ui/spinner-custom";

interface CreateCategoryDialogProps {
  onSuccess: () => void;
}

export function CreateCategoryDialog({ onSuccess }: CreateCategoryDialogProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    nameEn: "",
    nameAr: "",
    commissionPerRequest: 0,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.nameEn.trim() && formData.nameAr.trim() && formData.commissionPerRequest >= 0) {
      setIsSubmitting(true);
      try {
        await categoryAdminApi.create({
          name: {
            en: formData.nameEn,
            ar: formData.nameAr,
          },
          commissionPerRequest: formData.commissionPerRequest,
        });
        toast.success("Category created successfully");
        setFormData({ nameEn: "", nameAr: "", commissionPerRequest: 0 });
        setOpen(false);
        onSuccess();
      } catch (error: any) {
        toast.error("Failed to create category", { description: error.message });
      } finally {
        setIsSubmitting(false);
      }
    } else {
      toast.error("Please fill all required fields correctly.");
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      // Reset form when dialog closes
      setFormData({
        nameEn: "",
        nameAr: "",
        commissionPerRequest: 0,
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2 rounded-md h-10 px-6 font-bold tracking-tight bg-primary hover:bg-primary/90 transition-all active:scale-[0.98]">
          <Plus className="h-4 w-4" />
          Create Category
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] rounded-md border-border p-6">
        <DialogHeader className="space-y-2">
          <DialogTitle className="text-xl font-bold tracking-tight">Create New Category</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Add a new product category with commission rate and visibility rules.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <FieldGroup className="py-6 space-y-5">
            <Field className="space-y-2">
              <FieldLabel htmlFor="nameEn" className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80">Name (English) *</FieldLabel>
              <Input
                id="nameEn"
                value={formData.nameEn}
                onChange={(e) =>
                  setFormData({ ...formData, nameEn: e.target.value })
                }
                placeholder="e.g. Electronics"
                className="h-10 rounded-md border-border bg-background focus:ring-primary/20 transition-all font-medium"
                required
              />
            </Field>
            <Field className="space-y-2">
              <FieldLabel htmlFor="nameAr" className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80">Name (Arabic) *</FieldLabel>
              <Input
                id="nameAr"
                value={formData.nameAr}
                onChange={(e) =>
                  setFormData({ ...formData, nameAr: e.target.value })
                }
                placeholder="e.g. إلكترونيات"
                className="h-10 rounded-md border-border bg-background focus:ring-primary/20 transition-all font-medium text-right"
                required
                dir="rtl"
              />
            </Field>
            <Field className="space-y-2">
              <FieldLabel htmlFor="commission" className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80">
                Commission per request *
              </FieldLabel>
              <div className="relative">
                <Input
                  id="commission"
                  type="number"
                  min="0"
                  step="0.1"
                  value={formData.commissionPerRequest === 0 && !formData.commissionPerRequest.toString().includes('.') ? '' : formData.commissionPerRequest}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      commissionPerRequest: parseFloat(e.target.value) || 0,
                    })
                  }
                  placeholder="0.00"
                  className="h-10 rounded-md border-border bg-background focus:ring-primary/20 transition-all font-medium pr-8"
                  required
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/50 font-bold">%</span>
              </div>
            </Field>
          </FieldGroup>
          <DialogFooter className="gap-3 sm:gap-0">
            <DialogClose asChild>
              <Button type="button" variant="outline" className="rounded-md h-10 px-6 font-semibold" disabled={isSubmitting}>Cancel</Button>
            </DialogClose>
            <Button type="submit" className="rounded-md h-10 px-6 font-bold bg-primary hover:bg-primary/90" disabled={isSubmitting}>
              {isSubmitting && <SpinnerCustom className="mr-2 h-4 w-4" />}
              Create Category
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
