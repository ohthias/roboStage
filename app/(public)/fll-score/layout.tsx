"use client";
import { useEffect } from "react";

export default function FllScoreLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  document.title = "FLL Score";
  useEffect(() => {
    const updateTitle = () => {
      const hash = window.location.hash.replace("#", "");
      if (hash) {
        const formatted =
          hash.charAt(0).toUpperCase() + hash.slice(1).toLowerCase();
        document.title = `FLL Score - ${formatted}`;
      } else {
        document.title = "FLL Score";
      }
    };
    updateTitle();
    window.addEventListener("hashchange", updateTitle);
    return () => window.removeEventListener("hashchange", updateTitle);
  }, []);

  return <section className="min-h-screen bg-base-100">{children}</section>;
}
