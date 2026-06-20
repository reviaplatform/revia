"use client";

import { useState } from "react";
import {
  Pen as Edit,
  TrashBinMinimalistic as Trash2,
  MenuDots as MoreHorizontal,
  Eye,
  EyeClosed as EyeOff,
  Tag,
  Dollar,
} from "@solar-icons/react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { SpinnerCustom } from "@/components/ui/spinner-custom";
import { CategoryListItem, categoryAdminApi } from "@/services/categoryService";
import { toast } from "sonner";

interface CategoryCardProps {
  category: CategoryListItem;
  onRefresh: () => void;
}

export function CategoryCard({ category, onRefresh }: CategoryCardProps) {
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  
  const [editData, setEditData] = useState({
    nameEn: category.name?.en || "",
    nameAr: category.name?.ar || "",
    commissionPerRequest: category.commissionPerRequest || 0,
    isActive: category.isActive !== false,
  });

  const handleUpdate = async () => {
    setIsUpdating(true);
    try {
      await categoryAdminApi.update(category.id, {
        name: {
          en: editData.nameEn,
          ar: editData.nameAr,
        },
        commissionPerRequest: editData.commissionPerRequest,
        isActive: editData.isActive,
      });
      toast.success("Category updated successfully.");
      setShowEditDialog(false);
      onRefresh();
    } catch (error: any) {
      toast.error("Failed to update category", { description: error.message });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleToggleStatus = async () => {
    setIsUpdating(true);
    try {
      await categoryAdminApi.update(category.id, {
        isActive: category.isActive === false,
      });
      toast.success("Category status updated.");
      onRefresh();
    } catch (error: any) {
      toast.error("Failed to update status", { description: error.message });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    setIsUpdating(true);
    try {
      await categoryAdminApi.delete(category.id);
      toast.success("Category deleted.");
      setShowDeleteDialog(false);
      onRefresh();
    } catch (error: any) {
      toast.error("Failed to delete category", { description: error.message });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <>
      <div 
        className="group bg-card rounded-md border border-border flex flex-col items-between h-full transition-all duration-300 hover:border-primary/40 hover:bg-accent/5"
      >
        <div className="p-4 flex-1">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-muted rounded-md border border-border group-hover:border-primary/20 transition-colors">
                <Tag className="h-4 w-4 text-primary/70" />
              </div>
              <div className="space-y-0.5">
                <h3 className="font-bold text-foreground text-sm tracking-tight">
                  {category.name?.en || "Unnamed"}
                </h3>
                <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">{category.name?.ar || ""}</p>
              </div>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-7 w-7 p-0 rounded-md hover:bg-muted">
                  <MoreHorizontal className="h-3.5 w-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 rounded-md border-border">
                <DropdownMenuLabel className="label-micro text-muted-foreground">Actions</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => {
                  setEditData({
                    nameEn: category.name?.en || "",
                    nameAr: category.name?.ar || "",
                    commissionPerRequest: category.commissionPerRequest || 0,
                    isActive: category.isActive !== false,
                  });
                  setShowEditDialog(true);
                }}
                className="text-sm"
                >
                  <Edit className="mr-2 h-3.5 w-3.5" />
                  Edit Category
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleToggleStatus} disabled={isUpdating} className="text-sm">
                  {category.isActive !== false ? (
                    <>
                      <EyeOff className="mr-2 h-3.5 w-3.5" />
                      Hide Category
                    </>
                  ) : (
                    <>
                      <Eye className="mr-2 h-3.5 w-3.5" />
                      Show Category
                    </>
                  )}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => setShowDeleteDialog(true)}
                  className="text-red-600 text-sm focus:text-red-600 focus:bg-red-500/10"
                >
                  <Trash2 className="mr-2 h-3.5 w-3.5" />
                  Delete Category
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="space-y-3 mt-4">
            {/* Commission Rate */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-primary/40" />
                <span className="text-xs font-medium text-muted-foreground label-uppercase tracking-[0.05em]">Commission</span>
              </div>
              <Badge variant="outline" className="text-[10px] font-bold tracking-tight rounded-sm bg-muted/30 border-border px-1.5 h-5">
                {category.commissionPerRequest || 0}%
              </Badge>
            </div>
          </div>

          {/* Status Label & ID */}
          <div className="flex items-center justify-between mt-6 pt-3 border-t border-border/60">
            <div className="flex items-center gap-2">
              <div className={`h-1.5 w-1.5 rounded-full ${category.isActive !== false ? "bg-green-500" : "bg-orange-500"}`} />
              <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-foreground/70">
                {category.isActive !== false ? "Active" : "Hidden"}
              </span>
            </div>
            <span className="label-micro text-muted-foreground/40 font-mono tracking-tighter">
              ID:{category.id.slice(-6).toUpperCase()}
            </span>
          </div>
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>
            <DialogDescription>
              Update the category information below.
            </DialogDescription>
          </DialogHeader>
          <FieldGroup className="py-3">
            <Field>
              <FieldLabel htmlFor="edit-name-en">Name (English)</FieldLabel>
              <Input
                id="edit-name-en"
                value={editData.nameEn}
                onChange={(e) =>
                  setEditData({ ...editData, nameEn: e.target.value })
                }
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="edit-name-ar">Name (Arabic)</FieldLabel>
              <Input
                id="edit-name-ar"
                value={editData.nameAr}
                onChange={(e) =>
                  setEditData({ ...editData, nameAr: e.target.value })
                }
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="edit-commission">
                Commission per request
              </FieldLabel>
              <div className="relative">
                <Input
                  id="edit-commission"
                  type="number"
                  min="0"
                  step="0.1"
                  value={editData.commissionPerRequest}
                  onChange={(e) =>
                    setEditData({
                      ...editData,
                      commissionPerRequest: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="pr-8"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/50 font-bold">%</span>
              </div>
            </Field>
            <div className="flex items-center mt-2 gap-2">
               <input 
                  type="checkbox" 
                  id="edit-active-status" 
                  checked={editData.isActive} 
                  onChange={(e) => setEditData({ ...editData, isActive: e.target.checked })} 
                />
               <label htmlFor="edit-active-status">Active Status</label>
            </div>
          </FieldGroup>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleUpdate} disabled={isUpdating}>
              {isUpdating && <SpinnerCustom className="mr-2 h-4 w-4" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete Category</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete the
              category and all associated data.
            </DialogDescription>
          </DialogHeader>
          <FieldGroup className="py-3">
            <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
              <div>
                <div className="font-medium text-red-900">{category.name?.en}</div>
              </div>
            </div>
          </FieldGroup>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button variant="destructive" onClick={handleDelete} disabled={isUpdating}>
              {isUpdating && <SpinnerCustom className="mr-2 h-4 w-4" />}
              Yes, Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
