"use client";

import { Button } from "@/components/ui/button";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/app/providers";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const isDark = () => {
    if (theme === "system") {
      return window.matchMedia("(prefers-color-scheme: dark)").matches;
    }
    return theme === "dark";
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label="Toggle theme"
      onClick={() => setTheme(isDark() ? "light" : "dark")}
    >
      <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
    </Button>
  );
}

export function MobileThemeToggle() {
  const { theme, setTheme } = useTheme();

  const isDark = () => {
    if (theme === "system") {
      return window.matchMedia("(prefers-color-scheme: dark)").matches;
    }
    return theme === "dark";
  };

  return (
    <Button
      variant="ghost"
      className="w-full justify-start"
      onClick={() => setTheme(isDark() ? "light" : "dark")}
    >
      {isDark() ? "Light" : "Dark"} Mode
    </Button>
  );
}
