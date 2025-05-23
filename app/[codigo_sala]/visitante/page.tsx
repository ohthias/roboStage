"use client";
import { useParams, useSearchParams } from "next/navigation";
import TabelaEquipes from "@/components/TabelaEquipes";
import styles from "@/style/Visitante.module.css";

interface VisitantePageProps {
  params: {
    codigo_sala: string;
  };
}

export default function VisitanteRoomPage({ params }: VisitantePageProps) {
  const codigo_sala  = params.codigo_sala;

  return (
    <>
      <div className={styles.background}>
        <main style={{ padding: "2rem" }}>
          <TabelaEquipes codigoSala={codigo_sala} />
        </main>
      </div>
    </>
  );
}
