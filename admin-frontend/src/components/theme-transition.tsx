"use client";

import { useEffect, useState } from "react";

export function ThemeTransition() {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [themeDirection, setThemeDirection] = useState<"light" | "dark">(
    "light"
  );

  useEffect(() => {
    const handleThemeChange = (event: CustomEvent) => {
      const newTheme = event.detail.theme;
      setThemeDirection(newTheme === "dark" ? "dark" : "light");
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

  if (!isTransitioning) return null;

  return (
    <div
      className="fixed inset-0 pointer-events-none z-50 theme-change-indicator"
      style={{
        background:
          themeDirection === "dark"
            ? "linear-gradient(135deg, rgba(0, 0, 0, 0.1) 0%, rgba(59, 130, 246, 0.05) 50%, rgba(0, 0, 0, 0.1) 100%)"
            : "linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(59, 130, 246, 0.05) 50%, rgba(255, 255, 255, 0.1) 100%)",
        animation: "themeTransition 0.4s cubic-bezier(0.4, 0, 0.2, 1) forwards",
      }}
    />
  );
}
