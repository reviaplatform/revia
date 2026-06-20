"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Monitor, Sun, Moon, Restart } from "@solar-icons/react";

export function SystemThemeDemo() {
  const [systemTheme, setSystemTheme] = useState<string>("light");
  const [currentTheme, setCurrentTheme] = useState<string>("system");
  const [isSystemMode, setIsSystemMode] = useState(true);

  useEffect(() => {
    // Get current system theme
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;
    setSystemTheme(prefersDark ? "dark" : "light");

    // Get current theme preference
    const savedTheme = localStorage.getItem("theme");
    setCurrentTheme(savedTheme || "system");
    setIsSystemMode(savedTheme === "system" || !savedTheme);

    // Listen for system theme changes
    const handleSystemThemeChange = (e: MediaQueryListEvent) => {
      setSystemTheme(e.matches ? "dark" : "light");
    };

    // Listen for theme preference changes
    const handleThemeChange = (event: CustomEvent) => {
      setCurrentTheme(event.detail.theme);
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

  const testSystemTheme = () => {
    // Simulate system theme change
    const currentSystemTheme = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;
    const newSystemTheme = !currentSystemTheme;

    // This is just for demo - in real usage, the system theme is controlled by the OS
    console.log(
      `System theme would change to: ${newSystemTheme ? "dark" : "light"}`
    );
  };

  const getThemeIcon = (theme: string) => {
    switch (theme) {
      case "light":
        return <Sun className="h-4 w-4" />;
      case "dark":
        return <Moon className="h-4 w-4" />;
      default:
        return <Monitor className="h-4 w-4" />;
    }
  };

  const getThemeColor = (theme: string) => {
    switch (theme) {
      case "light":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400";
      case "dark":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400";
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Monitor className="h-5 w-5" />
          System Theme Tracking
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Current Theme Preference</h3>
            <Badge
              variant="outline"
              className={`capitalize flex items-center gap-1 w-fit ${getThemeColor(
                currentTheme
              )}`}
            >
              {getThemeIcon(currentTheme)}
              {currentTheme}
            </Badge>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-medium">System Theme</h3>
            <Badge
              variant="outline"
              className={`capitalize flex items-center gap-1 w-fit ${getThemeColor(
                systemTheme
              )}`}
            >
              {getThemeIcon(systemTheme)}
              {systemTheme}
            </Badge>
          </div>
        </div>

        {/* System Mode Status */}
        <div className="p-4 rounded-lg bg-muted">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">System Mode</h4>
              <p className="text-sm text-muted-foreground">
                {isSystemMode
                  ? "Following system theme automatically"
                  : "Using manual theme selection"}
              </p>
            </div>
            <Badge variant={isSystemMode ? "default" : "secondary"}>
              {isSystemMode ? "Active" : "Inactive"}
            </Badge>
          </div>
        </div>

        {/* Demo Actions */}
        <div className="space-y-4">
          <h4 className="font-medium">Demo Actions</h4>
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() =>
                window.dispatchEvent(
                  new CustomEvent("themeChanged", {
                    detail: { theme: "light" },
                  })
                )
              }
            >
              <Sun className="h-4 w-4 mr-1" />
              Force Light
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() =>
                window.dispatchEvent(
                  new CustomEvent("themeChanged", { detail: { theme: "dark" } })
                )
              }
            >
              <Moon className="h-4 w-4 mr-1" />
              Force Dark
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() =>
                window.dispatchEvent(
                  new CustomEvent("themeChanged", {
                    detail: { theme: "system" },
                  })
                )
              }
            >
              <Monitor className="h-4 w-4 mr-1" />
              Use System
            </Button>
            <Button size="sm" variant="outline" onClick={testSystemTheme}>
              <Restart className="h-4 w-4 mr-1" />
              Test System Change
            </Button>
          </div>
        </div>

        {/* Instructions */}
        <div className="text-xs text-muted-foreground space-y-1">
          <p>
            <strong>How to test:</strong>
          </p>
          <p>
            1. Change your OS theme (Windows: Settings → Personalization →
            Colors)
          </p>
          <p>2. Select "System" in the theme dropdown</p>
          <p>3. Watch the dashboard automatically follow your system theme</p>
        </div>
      </CardContent>
    </Card>
  );
}




