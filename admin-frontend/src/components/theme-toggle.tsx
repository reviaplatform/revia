"use client";

import { Moon, Sun } from "@solar-icons/react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/contexts/theme-context";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleTheme}
      className="h-9 w-9 p-0"
    >
      {theme === "light" ? (
        <Moon className="h-4 w-4" />
      ) : (
        <Sun className="h-4 w-4" />
      )}
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}

export function ThemeToggleWithLabel() {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button
      variant="outline"
      onClick={toggleTheme}
      className="flex items-center gap-2"
    >
      {theme === "light" ? (
        <>
          <Moon className="h-4 w-4" />
          Dark Mode
        </>
      ) : (
        <>
          <Sun className="h-4 w-4" />
          Light Mode
        </>
      )}
    </Button>
  );
}

