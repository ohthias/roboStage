"use client";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import ModalCodigos from "@/components/ModalCodigos";
import Equipes from "@/components/Equipes";
import styles from "@/components/style/Admin.module.css";

export default function AdminRoomPage({
  params,
}: {
  params: { codigo_sala: string };
}) {
  interface Sala {
    codigo_visitante?: string;
    codigo_voluntario?: string;
    codigo_admin?: string;
    nome?: string;
  }

  const [sala, setSala] = useState<Sala | undefined>();
  const [showModal, setShowModal] = useState(false);
  const [carregando, setCarregando] = useState(true);
  const searchParams = useSearchParams();
  const codigoSala = params.codigo_sala;

  useEffect(() => {
    if (!codigoSala) return;

    const fetchSala = async () => {
      try {
        const res = await fetch(`/rooms/${codigoSala}/get/`);
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

  const visitante = sala?.codigo_visitante;
  const voluntario = sala?.codigo_voluntario;
  const admin = sala?.codigo_admin;
  const nomeSala = sala?.nome;

  return (
    <>
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
