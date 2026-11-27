"use client";
import HeatmapPage from "@/features/quickbrick/heatmap/components/HeatmapPage";
import CardMobileNotUse from "@/components/stage/platform/MobileNotUse";
import { useEffect, useState } from "react";

export default function Page() {
  const [isMobile, setIsMobile] = useState<boolean | null>(null);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 720px)");

    const handleChange = () => {
      setIsMobile(mediaQuery.matches);
    };

    handleChange(); // verifica no mount
    mediaQuery.addEventListener("change", handleChange);

    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  if (isMobile === null) return null;

  if (isMobile) {
    return <CardMobileNotUse />;
  }

  return <HeatmapPage />;
}
