"use client";
import { useParams, useSearchParams } from "next/navigation";
import TabelaEquipes from "@/components/TabelaEquipes";
import styles from "@/style/Visitante.module.css";

export default function VisitanteRoomPage({
  params,
}: {
  params: { codigo_sala: string };
}) {
  const { codigo_sala } = useParams();

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
