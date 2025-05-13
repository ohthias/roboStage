"use client";
import Equipes from "@/app/components/Equipes";
import ModalCodigos from "@/app/components/ModalCodigos";
import Navbar from "@/app/components/navbar";
import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import styles from "../../../../../styles/Admin.module.css";
import Loader from "@/app/components/Loader";

export default function SalaAdmin() {
  const [sala, setSala] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [carregando, setCarregando] = useState(true);
  const { codigoSala } = useParams();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!codigoSala) return;

    const fetchSala = async () => {
      try {
        const res = await fetch(`/api/sala/${codigoSala}`);
        if (!res.ok) {
          throw new Error("Sala não encontrada");
        }
        const data = await res.json();
        setSala(data);
      } catch (err) {
        console.error(err);
      } finally {
        setCarregando(false);

        if (typeof window !== "undefined") {
          const hash = window.location.hash;
          if (hash === "#codigos") {
            setShowModal(true);
          }
        }
      }
    };

    fetchSala();

    const handleHashChange = () => {
      setShowModal(window.location.hash === "#codigos");
    };

    window.addEventListener("hashchange", handleHashChange);

    return () => {
      window.removeEventListener("hashchange", handleHashChange);
    };
  }, [codigoSala]);

  if (carregando) {
    return (
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          backgroundColor: "rgba(0, 0, 0, 0.8)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 9999,
        }}
      >
        <Loader />
      </div>
    );
  }

  if (!sala) {
    return <p>Erro: Sala não encontrada</p>;
  }

  const visitante = sala.codigoVisitante;
  const voluntario = sala.codigoVoluntario;
  const admin = sala.codigoAdmin;
  const nomeSala = sala?.nome || searchParams.get("nome");

  return (
    <>
      <Navbar mode={"admin"} codigoSala={codigoSala} admin={admin} />
      <h1 className={styles.title__admin}>
        Administração do evento: {nomeSala}
      </h1>
      <main className={styles.main}>
        <div className={styles.container_teams}>
          <Equipes codigoSala={codigoSala} />
        </div>
        {showModal && (
          <ModalCodigos
            visitante={visitante}
            voluntario={voluntario}
            admin={admin}
            onClose={() => setShowModal(false)}
          />
        )}
      </main>
    </>
  );
}
