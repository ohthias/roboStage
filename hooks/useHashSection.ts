"use client";
import { useEffect, useState } from "react";

export function useHashSection(defaultSection?: string) {
  const [currentSection, setCurrentSection] = useState<string>(
    defaultSection || ""
  );

  useEffect(() => {
    const hash = window.location.hash.replace("#", "");
    if (hash) setCurrentSection(hash);

    const handleHashChange = () => {
      const newHash = window.location.hash.replace("#", "");
      if (newHash) setCurrentSection(newHash);
    };

    window.addEventListener("hashchange", handleHashChange);
    return () => {
      window.removeEventListener("hashchange", handleHashChange);
    };
  }, []);

  return currentSection;
}
