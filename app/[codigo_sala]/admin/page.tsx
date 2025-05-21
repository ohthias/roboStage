"use client";
import { useState, useEffect } from "react";
import AccessModal from "@/components/AccessModal";
import Equipes from "@/components/Equipes";
import styles from "@/components/style/Admin.module.css";
import Loader from "@/components/loader";

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

  const visitante = sala?.codigo_visitante;
  const voluntario = sala?.codigo_voluntario;
  const admin = sala?.codigo_admin;
  const nomeSala = sala?.nome;

  return (
    <div className="h-full">
      {showModal && (
        <AccessModal
          visitante={visitante}
          voluntario={voluntario}
          admin={admin}
          onClose={() => setShowModal(false)}
        />
      )}
      <h1 className="text-3xl font-bold text-center text-primary-dark dark:text-white mt-4">
        Administração do evento: {nomeSala}
      </h1>
      <main className="mx-8 mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-8">
        <div className="h-full">
          <Equipes codigoSala={codigoSala} />
        </div>
        <div>
          <div className="bg-white rounded-md p-4 mb-8">
            <p className="text-3x1 font-bold text-primary-dark">Atualizações:</p>
            <ul>
              <li>Atualização 1</li>
              <li>Atualização 2</li>
              <li>Atualização 3</li>
            </ul>
            </div>
          <div className="bg-white rounded-md p-4">
            asasa
            </div>
        </div>
      </main>
    </div>
  );
}
