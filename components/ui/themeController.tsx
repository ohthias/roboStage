"use client";

import { useEffect, useState } from "react";
import { SunIcon, MoonIcon } from "@heroicons/react/24/solid";

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
    const newTheme = theme === "bumblebee" ? "darkScheme" : "bumblebee";
    setTheme(newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);
  };

  return (
    <label className="swap swap-rotate cursor-pointer w-10 h-10">
      <input
        type="checkbox"
        checked={theme === "darkScheme"}
        onChange={toggleTheme}
      />

      <SunIcon className="swap-off h-7 w-7 text-yellow-500" />

      <MoonIcon className="swap-on h-7 w-7 text-slate-700" />
    </label>
  );
}
