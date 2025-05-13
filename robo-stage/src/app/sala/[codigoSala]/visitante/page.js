"use client";
import { useParams, useSearchParams } from "next/navigation";
import Navbar from "@/app/components/navbar";
import TabelaEquipes from "@/app/components/TabelaEquipes";
import styles from "../../../../../styles/Visitante.module.css";

export default function Visitante() {
  const { codigoSala } = useParams();
  const searchParams = useSearchParams();

  const isAdmin = searchParams.get("admin") !== null;

  return (
    <div className={styles.background}>
      <Navbar mode={isAdmin ? "admin" : "visitante"} />

      <main style={{ padding: "2rem" }}>
        <TabelaEquipes codigoSala={codigoSala} />
      </main>
    </div>
  );
}
