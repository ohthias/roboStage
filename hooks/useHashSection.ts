'use client';
import { useEffect, useState } from "react";

export function useHashSection(defaultValue: string): [string, (value: string) => void] {
  const [section, setSection] = useState<string>(() => {
    // Pega do localStorage se estiver disponível
    if (typeof window !== "undefined") {
      return localStorage.getItem("roboStage-last-section") || defaultValue;
    }
    return defaultValue;
  });

  useEffect(() => {
    if (section) {
      localStorage.setItem("roboStage-last-section", section);
    }
  }, [section]);

  return [section, setSection];
}
