import { Restart as LoaderIcon } from "@solar-icons/react";

import { cn } from "@/lib/utils";

function Spinner({ className, ...props }: React.ComponentProps<"svg">) {
  return (
    <LoaderIcon
      role="status"
      aria-label="Loading"
      className={cn("size-4 animate-spin", className)}
      {...props}
    />
  );
}

export function SpinnerCustom({ className, ...props }: React.ComponentProps<typeof Spinner>) {
  return (
    <div className="flex items-center gap-4">
      <Spinner className={className} {...props} />
    </div>
  );
}
