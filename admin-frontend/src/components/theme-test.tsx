"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function ThemeTest() {
  const [currentTheme, setCurrentTheme] = useState<string>("system");
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    // Get initial theme
    const savedTheme = localStorage.getItem("theme");
    setCurrentTheme(savedTheme || "system");

    // Listen for theme changes
    const handleThemeChange = (event: CustomEvent) => {
      setCurrentTheme(event.detail.theme);
      setIsTransitioning(true);
      setTimeout(() => setIsTransitioning(false), 300);
    };

    window.addEventListener("themeChanged", handleThemeChange as EventListener);
    return () => {
      window.removeEventListener(
        "themeChanged",
        handleThemeChange as EventListener
      );
    };
  }, []);

  const testThemeChange = (theme: string) => {
    // Simulate theme change
    window.dispatchEvent(
      new CustomEvent("themeChanged", { detail: { theme } })
    );
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Theme Test
          {isTransitioning && (
            <div className="h-2 w-2 bg-blue-500 rounded-full animate-pulse" />
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Current Theme:</span>
          <Badge variant="outline" className="capitalize">
            {currentTheme}
          </Badge>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <Button
            size="sm"
            variant={currentTheme === "light" ? "default" : "outline"}
            onClick={() => testThemeChange("light")}
          >
            Light
          </Button>
          <Button
            size="sm"
            variant={currentTheme === "dark" ? "default" : "outline"}
            onClick={() => testThemeChange("dark")}
          >
            Dark
          </Button>
          <Button
            size="sm"
            variant={currentTheme === "system" ? "default" : "outline"}
            onClick={() => testThemeChange("system")}
          >
            System
          </Button>
        </div>

        <div className="text-xs text-muted-foreground">
          Theme changes should be smooth and instant. Check the settings in the
          user menu for the actual theme selector.
        </div>
      </CardContent>
    </Card>
  );
}




