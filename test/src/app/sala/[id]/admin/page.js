"use client";
import Equipes from "@/app/components/Equipes";
import ModalCodigos from "@/app/components/ModalCodigos";
import Navbar from "@/app/components/navbar";
import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import styles from "../../../../../styles/Admin.module.css";

export default function SalaAdmin() {
  const [sala, setSala] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [carregando, setCarregando] = useState(true);
  const { id } = useParams();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!id) return;

    const fetchSala = async () => {
      try {
        const res = await fetch(`/api/sala/${id}`);
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
  }, [id]);

  if (carregando) {
    return <p>Carregando dados da sala...</p>;
  }

  if (!sala) {
    return <p>Erro: Sala não encontrada</p>;
  }

  const visitante = sala.visitante;
  const voluntario = sala.voluntario;
  const admin = sala.admin;
  const nomeSala = sala?.nome || searchParams.get("nome");

  return (
    <>
      <Navbar mode={"admin"} id={id} admin={admin} />
      <h1 className={styles.title__admin}>
        Administração do evento: {nomeSala}
      </h1>
      <main className={styles.main}>
        <div className={styles.container_teams}>
          <Equipes idSala={id} />
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
