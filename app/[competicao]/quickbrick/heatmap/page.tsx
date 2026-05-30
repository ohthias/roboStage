"use client";
import HeatmapPage from '@/components/QuickBrick/heatmap/HeatmapPage';
import ToastProvider from '@/components/QuickBrick/heatmap/Toast';
import { Footer } from '@/components/UI/Footer';
import CardMobileNotUse from '@/components/MobileNotUse';
import { useState, useEffect } from 'react';

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
    
  return (
    <>
      <HeatmapPage />
      <ToastProvider />
      <Footer />
    </>
  );
}
