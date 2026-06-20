import * as React from "react";
import { cn } from "@/lib/utils";

const InputOTP = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    maxLength?: number;
    id?: string;
    required?: boolean;
  }
>(({ className, maxLength, id, required, ...props }, ref) => (
  <div ref={ref} className={cn("flex flex-col", className)} {...props} />
));
InputOTP.displayName = "InputOTP";

const InputOTPGroup = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("flex items-center", className)} {...props} />
));
InputOTPGroup.displayName = "InputOTPGroup";

const InputOTPSlot = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement> & {
    index: number;
  }
>(({ index, className, ...props }, ref) => (
  <input
    ref={ref}
    className={cn(
      "relative h-12 w-12 appearance-none rounded-md border border-input bg-background text-center text-sm transition-all duration-200 first:ml-0 last:mr-0 shadow-sm hover:shadow-md hover:border-secondary/50 focus:z-10 focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-2 focus:shadow-lg focus:shadow-secondary/25 focus:border-secondary disabled:cursor-not-allowed disabled:opacity-50",
      className
    )}
    {...props}
  />
));
InputOTPSlot.displayName = "InputOTPSlot";

export { InputOTP, InputOTPGroup, InputOTPSlot };
