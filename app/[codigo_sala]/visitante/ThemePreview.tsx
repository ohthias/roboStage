// ThemePreview.tsx
"use client";

import TabelaEquipes from "@/components/TabelaEquipes";
import { after } from "node:test";
import { useEffect } from "react";
import { useState } from "react";

export default function ThemePreview({
  theme,
  codigo_sala,
}: {
  theme: any;
  codigo_sala: string;
}) {
  const [evento, setEvento] = useState<any>(null);
  if (!theme) {
    return <div>Carregando tema...</div>;
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`/rooms/${codigo_sala}/get/`);
        if (!res.ok) {
          throw new Error("Erro ao buscar dados da sala");
        }
        const data = await res.json();
        console.log("Dados da sala:", data);
        setEvento(data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchData();
  }, [codigo_sala]);

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-start"
      style={{
      backgroundImage: `url(${theme.wallpaper_url})`,
      backgroundPosition: "center",
      backgroundSize: "cover",
      backgroundRepeat: "no-repeat",
      color: theme.secondary_color,
      position: "relative",
      }}
    >
      <div
      style={{
        position: "absolute",
        inset: 0,
        background: "rgba(0,0,0,0.35)",
        backdropFilter: "blur(2px)",
        zIndex: 0,
        pointerEvents: "none",
      }}
      />
      <div
      style={{
        position: "absolute",
        inset: 0,
        background: `linear-gradient(to bottom, ${theme.secondary_color}33 0%, transparent 60%)`,
        zIndex: 1,
        pointerEvents: "none",
      }}
      />
      <div className="w-full max-w-3xl p-6 z-10 relative">
      <h1
        className="text-5xl font-bold mt-8 mb-6 drop-shadow text-center"
        style={{ color: theme.primary_color }}
      >
        {evento?.nome}
      </h1>
      <div className="w-full max-w-3xl p-6">
        <TabelaEquipes codigoSala={evento?.codigo_sala} cor={theme.secondary_color} />
      </div>
      </div>
    </div>
  );
}
