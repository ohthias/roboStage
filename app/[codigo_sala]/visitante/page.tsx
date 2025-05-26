"use client";
import { useParams } from "next/navigation";
import TabelaEquipes from "@/components/TabelaEquipes";
import styles from "@/style/Visitante.module.css";
import Hero from "@/components/hero";

export default function VisitanteRoomPage() {
  const params = useParams();
  const codigo_sala = params?.codigo_sala as string;

  return (
    <>
      <Hero />
      <div className={styles.background}>
        <main style={{ padding: "2rem" }}>
          <TabelaEquipes codigoSala={codigo_sala} />
        </main>
      </div>
    </>
  );
}
