"use client";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Hero from "@/components/hero";
import ThemePreview from "./ThemePreview";

export default function VisitanteRoomPage() {
  const params = useParams();
  const codigo_sala = params?.codigo_sala as string;

  const [theme, setTheme] = useState(null);

  useEffect(() => {
    if (!codigo_sala) return;
    const fetchTheme = async () => {
      const res = await fetch(`/rooms/${codigo_sala}/theme/get`);
      const theme = await res.json();
      console.log("Tema da sala:", theme);
      if (res.ok) {
        setTheme(theme);
      } else {
        console.error("Erro ao buscar tema da sala");
      }
    };
    fetchTheme();
  }, [codigo_sala]);

  return (
    <>
      <Hero />
        {theme && <ThemePreview theme={theme} codigo_sala={codigo_sala} />}
    </>
  );
}