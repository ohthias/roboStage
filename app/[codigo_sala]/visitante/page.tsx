"use client";
import { useParams, useSearchParams } from "next/navigation";
import TabelaEquipes from "@/components/TabelaEquipes";
import styles from "@/components/style/Visitante.module.css";

export default function VisitanteRoomPage({
  params,
}: {
  params: { codigo_sala: string };
}) {
  const { codigoSala } = useParams();
  const searchParams = useSearchParams();

  const isAdmin = searchParams.get("admin") !== null;

  return (
    <>
      <div className={styles.background}>
        <main style={{ padding: "2rem" }}>
          <TabelaEquipes codigoSala={codigoSala} />
        </main>
      </div>
    </>
  );
}
