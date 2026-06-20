"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Monitor, Sun, Moon } from "@solar-icons/react";

export function SystemThemeIndicator() {
  const [systemTheme, setSystemTheme] = useState<string>("light");
  const [isSystemMode, setIsSystemMode] = useState(false);

  useEffect(() => {
    // Get current system theme
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;
    setSystemTheme(prefersDark ? "dark" : "light");

    // Check if we're in system mode
    const savedTheme = localStorage.getItem("theme");
    setIsSystemMode(savedTheme === "system" || !savedTheme);

    // Listen for system theme changes
    const handleSystemThemeChange = (e: MediaQueryListEvent) => {
      setSystemTheme(e.matches ? "dark" : "light");
    };

    // Listen for theme preference changes
    const handleThemeChange = (event: CustomEvent) => {
      setIsSystemMode(event.detail.theme === "system");
    };

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    mediaQuery.addEventListener("change", handleSystemThemeChange);
    window.addEventListener("themeChanged", handleThemeChange as EventListener);

    return () => {
      mediaQuery.removeEventListener("change", handleSystemThemeChange);
      window.removeEventListener(
        "themeChanged",
        handleThemeChange as EventListener
      );
    };
  }, []);

  const getThemeIcon = () => {
    if (!isSystemMode) return null;
    return systemTheme === "dark" ? (
      <Moon className="h-3 w-3" />
    ) : (
      <Sun className="h-3 w-3" />
    );
  };

  const getThemeColor = () => {
    if (!isSystemMode)
      return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400";
    return systemTheme === "dark"
      ? "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
      : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400";
  };

  if (!isSystemMode) return null;

  return (
    <Badge
      variant="outline"
      className={`flex items-center gap-1 text-xs ${getThemeColor()}`}
    >
      <Monitor className="h-3 w-3" />
      System
    </Badge>
  );
}
