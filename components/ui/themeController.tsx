"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { SunIcon, MoonIcon, SwatchIcon } from "@heroicons/react/24/solid";

const themes = [
  "Claro",
  "Escuro",
  "bumblebee",
  "lemonade",
  "lofi",
  "fantasy",
  "black",
];
const publicRoutes = [
  "/",
  "/auth/",
  "/quickbrick/",
  "/flash-qa",
  "/fll-docs",
  "/help",
  "/universe",
  "/timers",
  "/fll-score/",
];

export function ThemeController() {
  const pathname = usePathname();
  const isPublicRoute = publicRoutes.some((route) =>
    pathname.startsWith(route)
  );

  const [theme, setTheme] = useState<string>("Claro");

  useEffect(() => {
    if (typeof window === "undefined") return;

    const saved = localStorage.getItem("theme") || "Claro";

    if (isPublicRoute) {
      setTheme("Claro");
      document.documentElement.setAttribute("data-theme", "Claro");
      return;
    }

    setTheme(saved);
    document.documentElement.setAttribute("data-theme", saved);
  }, [isPublicRoute, pathname]);

  const applyTheme = (newTheme: string) => {
    setTheme(newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);
  };

  if (isPublicRoute) {
    const toggle = () => applyTheme(theme === "Claro" ? "Escuro" : "Claro");

    return (
      <label className="swap swap-rotate cursor-pointer w-10 h-10">
        <input type="checkbox" checked={theme === "Escuro"} onChange={toggle} />
        <SunIcon className="swap-off h-7 w-7 text-yellow-500" />
        <MoonIcon className="swap-on h-7 w-7 text-slate-700" />
      </label>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <div className="dropdown dropdown-end">
        <label tabIndex={0} className="btn btn-sm btn-neutral gap-2">
          <SwatchIcon className="w-5 h-5" />
          Tema
        </label>
        <ul
          tabIndex={0}
          className="dropdown-content z-[999] menu p-2 shadow bg-base-200 rounded-box w-40"
        >
          {themes.map((t) => (
            <li key={t}>
              <button
                onClick={() => applyTheme(t)}
                className={`capitalize ${
                  theme === t ? "font-bold text-primary" : ""
                }`}
              >
                {t}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
