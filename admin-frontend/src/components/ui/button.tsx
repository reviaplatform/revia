import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost" | "destructive";
  size?: "sm" | "md" | "lg" | "icon" | "icon-sm";
}

export const buttonVariants = (props: {
  variant?: "default" | "outline" | "ghost" | "destructive";
  size?: "sm" | "md" | "lg" | "icon" | "icon-sm";
}) => {
  const { variant = "default", size = "md" } = props;

  return cn(
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 btn-wf-hover",
    {
      // size variants
      "h-8 px-3 text-sm": size === "sm",
      "h-10 px-4 py-2 text-sm": size === "md",
      "h-12 px-6 text-base text-base font-semibold": size === "lg",
      "h-10 w-10 p-0": size === "icon",
      "h-8 w-8 p-0": size === "icon-sm",
    },
    {
      "bg-primary text-primary-foreground hover:bg-primary/90":
        variant === "default",
      "border border-border bg-background text-foreground hover:bg-muted hover:border-muted-foreground/50":
        variant === "outline",
      "hover:bg-muted text-foreground":
        variant === "ghost",
      "bg-destructive text-destructive-foreground hover:bg-destructive/90":
        variant === "destructive",
    }
  );

};

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "md", ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size }), className)}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button };
