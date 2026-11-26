"use client";

import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

const LIGHT_THEME = "lightScheme";
const DARK_THEME = "darkScheme";
const DEFAULT_THEME = LIGHT_THEME;
const THEME_STORAGE_KEY = "theme";

export function ThemeController() {
  const [theme, setTheme] = useState<string>(DEFAULT_THEME);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedTheme = sessionStorage.getItem(THEME_STORAGE_KEY) || DEFAULT_THEME;
      setTheme(savedTheme);
      document.documentElement.setAttribute("data-theme", savedTheme);
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === LIGHT_THEME ? DARK_THEME : LIGHT_THEME;
    setTheme(newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
    sessionStorage.setItem(THEME_STORAGE_KEY, newTheme);
  };

  return (
    <label className="swap swap-rotate cursor-pointer hover:bg-base-300 p-2 rounded-full transition-colors duration-300">
      <input
        type="checkbox"
        checked={theme === DARK_THEME}
        onChange={toggleTheme}
      />

      <Sun className="swap-off h-6 w-6 text-base-content" />

      <Moon className="swap-on h-6 w-6 text-base-content" />
    </label>
  );
}