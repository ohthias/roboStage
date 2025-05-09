"use client";
import { useParams, useSearchParams } from "next/navigation";
import Navbar from "@/app/components/navbar";
import TabelaEquipes from "@/app/components/TabelaEquipes"; // ajuste o caminho se necessário

export default function Visitante() {
  const { id } = useParams();
  const searchParams = useSearchParams();

  const isAdmin = searchParams.get("admin") !== null;

  return (
    <div>
      <Navbar mode={isAdmin ? "admin" : "visitante"} />

      <main style={{ padding: "2rem" }}>
        <TabelaEquipes idSala={id} />
      </main>
    </div>
  );
}
