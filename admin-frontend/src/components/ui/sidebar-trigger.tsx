"use client";

import * as React from "react";
import { SidebarMinimalistic as PanelLeft } from "@solar-icons/react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useSidebar } from "./sidebar-provider";

const SidebarTrigger = React.forwardRef<
  React.ElementRef<typeof Button>,
  React.ComponentProps<typeof Button>
>(({ className, onClick, ...props }, ref) => {
  const { toggleSidebar } = useSidebar();

  return (
    <Button
      ref={ref}
      data-sidebar="trigger"
      variant="ghost"
      className={cn(
        "h-7 w-7 text-black hover:text-black focus:text-black [&>svg]:text-black [&>svg]:fill-black bg-gray-100 hover:bg-gray-200",
        className
      )}
      onClick={(event) => {
        onClick?.(event);
        toggleSidebar();
      }}
      {...props}
    >
      <PanelLeft className="h-4 w-4" />
      <span className="sr-only">Toggle Sidebar</span>
    </Button>
  );
});
SidebarTrigger.displayName = "SidebarTrigger";

export { SidebarTrigger };

