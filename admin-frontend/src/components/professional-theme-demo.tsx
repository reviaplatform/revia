"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sun, Moon, Monitor } from "@solar-icons/react";

export function ProfessionalThemeDemo() {
  const [currentTheme, setCurrentTheme] = useState<string>("system");
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    setCurrentTheme(savedTheme || "system");

    const handleThemeChange = (event: CustomEvent) => {
      setCurrentTheme(event.detail.theme);
      setIsTransitioning(true);
      setTimeout(() => setIsTransitioning(false), 400);
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
    window.dispatchEvent(
      new CustomEvent("themeChanged", { detail: { theme } })
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
    <Card className="w-full max-w-md theme-change-indicator">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Professional Theme Demo
          {isTransitioning && (
            <div className="h-2 w-2 bg-blue-500 rounded-full animate-pulse" />
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Current Theme:</span>
          <Badge
            variant="outline"
            className={`capitalize flex items-center gap-1 ${getThemeColor(
              currentTheme
            )}`}
          >
            {getThemeIcon(currentTheme)}
            {currentTheme}
          </Badge>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <Button
            size="sm"
            variant={currentTheme === "light" ? "default" : "outline"}
            onClick={() => testThemeChange("light")}
            className="transition-all duration-300"
          >
            <Sun className="h-4 w-4 mr-1" />
            Light
          </Button>
          <Button
            size="sm"
            variant={currentTheme === "dark" ? "default" : "outline"}
            onClick={() => testThemeChange("dark")}
            className="transition-all duration-300"
          >
            <Moon className="h-4 w-4 mr-1" />
            Dark
          </Button>
          <Button
            size="sm"
            variant={currentTheme === "system" ? "default" : "outline"}
            onClick={() => testThemeChange("system")}
            className="transition-all duration-300"
          >
            <Monitor className="h-4 w-4 mr-1" />
            System
          </Button>
        </div>

        <div className="text-xs text-muted-foreground">
          Professional theme switching with smooth cubic-bezier transitions and
          visual feedback.
        </div>
      </CardContent>
    </Card>
  );
}




