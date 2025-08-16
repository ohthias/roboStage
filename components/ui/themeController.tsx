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
      <div tabIndex={0} role="button" className="btn btn-default leading-none">
        <i className="fi fi-br-palette text-base-content"></i>
      </div>
      <ul
        tabIndex={0}
        className="dropdown-content bg-base-200 rounded-box z-10 w-50 p-1 shadow-2xl right-0"
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
