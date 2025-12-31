"use client";

import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

export function ThemeController() {
  const [theme, setTheme] = useState<string>("bumblebee");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedTheme = localStorage.getItem("theme") || "bumblebee";
      setTheme(savedTheme);
      document.documentElement.setAttribute("data-theme", savedTheme);
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "lightScheme" ? "darkScheme" : "lightScheme";
    setTheme(newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);
  };

  return (
    <label className="swap swap-rotate cursor-pointer hover:bg-base-300 p-2 rounded-full transition-colors duration-300">
      <input
        type="checkbox"
        checked={theme === "darkScheme"}
        onChange={toggleTheme}
      />

      <Sun className="swap-off h-6 w-6 text-base-content" />

      <Moon className="swap-on h-6 w-6 text-base-content" />
    </label>
  );
}