"use client";

import { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark" | "system";

interface ThemeContextType {
  theme: Theme; // The current preference (light, dark, or system)
  resolvedTheme: "light" | "dark"; // The actual rendered theme
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("light");
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("light");
  const [mounted, setMounted] = useState(false);

  // Initialize theme from storage
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as Theme | null;
    if (savedTheme === "light" || savedTheme === "dark" || savedTheme === "system") {
      setThemeState(savedTheme);
    } else {
      setThemeState("light"); // Default to light
    }
    setMounted(true);
  }, []);

  // Update resolved theme and document classes when preference or system changes
  useEffect(() => {
    if (!mounted) return;

    const updateResolvedTheme = () => {
      let actual: "light" | "dark";
      
      if (theme === "system") {
        actual = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
      } else {
        actual = theme === "dark" ? "dark" : "light";
      }

      setResolvedTheme(actual);
      localStorage.setItem("theme", theme);

      // Apply classes to document
      const root = window.document.documentElement;
      root.classList.remove("light", "dark");
      root.classList.add(actual);

      // Add transition effects
      root.classList.add("theme-changing");
      root.style.transition = "background-color 0.4s cubic-bezier(0.4, 0, 0.2, 1), color 0.4s cubic-bezier(0.4, 0, 0.2, 1)";
      
      setTimeout(() => {
        root.style.transition = "";
        root.classList.remove("theme-changing");
      }, 400);

      // Notify other components
      window.dispatchEvent(
        new CustomEvent("themeChanged", {
          detail: { theme, actualTheme: actual },
        })
      );
    };

    updateResolvedTheme();

    // Listen for system changes if in system mode
    if (theme === "system") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      const handleChange = () => updateResolvedTheme();
      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    }
  }, [theme, mounted]);

  const toggleTheme = () => {
    setThemeState((prev) => (prev === "light" ? "dark" : "light"));
  };

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  // Maintain compatibility during SSR and initial hydration
  return (
    <ThemeContext.Provider 
      value={{ 
        theme: mounted ? theme : "light", 
        resolvedTheme: mounted ? resolvedTheme : "light", 
        toggleTheme, 
        setTheme 
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
