"use client";

import { useEffect, useState } from "react";

export function ThemeController() {
  const [theme, setTheme] = useState<string>("bumblebee");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedTheme = localStorage.getItem("theme") || "bumblebee";
      setTheme(savedTheme);
      document.documentElement.setAttribute("data-theme", savedTheme);
    }
  }, []);

  const changeTheme = (newTheme: string) => {
    setTheme(newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);
  };

  return (
    <div className="dropdown">
      <div tabIndex={0} role="button" className="btn">
        Temas
        <svg
          width="12px"
          height="12px"
          className="inline-block h-2 w-2 fill-current opacity-60"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 2048 2048"
        >
          <path d="M1799 349l242 241-1017 1017L7 590l242-241 775 775 775-775z"></path>
        </svg>
      </div>
      <ul
        tabIndex={0}
        className="dropdown-content bg-base-200 rounded-box z-10 w-full p-1 shadow-2xl"
      >
        <li>
          <label className="w-full btn btn-sm btn-block btn-ghost justify-start">
            <input
              type="radio"
              name="theme-dropdown"
              className="theme-controller hidden"
              checked={theme === "bumblebee"}
              onChange={() => changeTheme("bumblebee")}
            />
            Claro
          </label>
        </li>
        <li>
          <label className="w-full btn btn-sm btn-block btn-ghost justify-start">
            <input
              type="radio"
              name="theme-dropdown"
              className="theme-controller hidden"
              checked={theme === "darkScheme"}
              onChange={() => changeTheme("darkScheme")}
            />
            Escuro
          </label>
        </li>
      </ul>
    </div>
  );
}
