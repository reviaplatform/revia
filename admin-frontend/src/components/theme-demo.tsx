"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function ThemeDemo() {
  const [currentTheme, setCurrentTheme] = useState<string>("system");

  useEffect(() => {
    // Get initial theme
    const savedTheme = localStorage.getItem("theme");
    setCurrentTheme(savedTheme || "system");

    // Listen for theme changes
    const handleThemeChange = (event: CustomEvent) => {
      setCurrentTheme(event.detail.theme);
    };

    window.addEventListener("themeChanged", handleThemeChange as EventListener);
    return () => {
      window.removeEventListener(
        "themeChanged",
        handleThemeChange as EventListener
      );
    };
  }, []);

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Theme Status</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Current Theme:</span>
          <Badge variant="outline" className="capitalize">
            {currentTheme}
          </Badge>
        </div>
        <div className="text-xs text-muted-foreground">
          Theme changes are applied instantly. You can change the theme in
          Settings → General → Theme.
        </div>
      </CardContent>
    </Card>
  );
}




