"use client";

import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ThemeToggle({ className }: { className?: string }) {
  const { setTheme, resolvedTheme } = useTheme();

  const toggle = () => {
    const isDark = resolvedTheme === "dark";
    setTheme(isDark ? "light" : "dark");
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggle}
      className={`relative h-9 w-9 text-zinc-300 hover:bg-zinc-800 hover:text-white ${className ?? ""}`}
      aria-label="Toggle theme"
      title="Toggle light / dark"
    >
      {/* Sun: visible in light, hidden in dark (CSS-driven, no hydration flash) */}
      <Sun className="h-[18px] w-[18px] rotate-0 scale-100 transition-all duration-300 dark:-rotate-90 dark:scale-0 dark:opacity-0" />
      {/* Moon: hidden in light, visible in dark */}
      <Moon className="absolute h-[18px] w-[18px] rotate-90 scale-0 opacity-0 transition-all duration-300 dark:rotate-0 dark:scale-100 dark:opacity-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}

export default ThemeToggle;
