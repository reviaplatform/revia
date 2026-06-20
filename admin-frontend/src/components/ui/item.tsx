import * as React from "react";
import { cn } from "@/lib/utils";

const Item = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    variant?: "default" | "muted";
  }
>(({ className, variant = "default", ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex items-center gap-3 rounded-lg border p-3",
      {
        "border-border bg-background": variant === "default",
        "border-border bg-muted": variant === "muted",
      },
      className
    )}
    {...props}
  />
));
Item.displayName = "Item";

const ItemMedia = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("flex-shrink-0", className)} {...props} />
));
ItemMedia.displayName = "ItemMedia";

const ItemContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-1 items-center gap-2", className)}
    {...props}
  />
));
ItemContent.displayName = "ItemContent";

const ItemTitle = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("font-medium text-sm", className)} {...props} />
));
ItemTitle.displayName = "ItemTitle";

export { Item, ItemContent, ItemMedia, ItemTitle };




