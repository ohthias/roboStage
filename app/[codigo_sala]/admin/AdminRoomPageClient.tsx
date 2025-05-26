"use client";

import { useState, useEffect } from "react";
import AccessModal from "@/components/AccessModal";
import Equipes from "@/components/Equipes";
import Loader from "@/components/loader";

interface Props {
  codigoSala: string;
}

interface Sala {
  codigo_visitante?: string;
  codigo_voluntario?: string;
  codigo_admin?: string;
  nome?: string;
}

export default function AdminRoomPageClient({ codigoSala }: Props) {
  const [sala, setSala] = useState<Sala | undefined>();
  const [showModal, setShowModal] = useState(false);
  const [carregando, setCarregando] = useState(true);
  const [atualizacoes, setAtualizacoes] = useState<string[]>([]);

  const adicionarAtualizacao = (texto: any) => {
    setAtualizacoes((prev) => [texto, ...prev]);
  };

  useEffect(() => {
    if (!codigoSala) return;

    const fetchSala = async () => {
      try {
        const res = await fetch(`/rooms/${codigoSala}/get/`);
        if (!res.ok) throw new Error("Sala não encontrada");
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
      <div className="fixed inset-0 bg-black bg-opacity-80 flex justify-center items-center z-50">
        <Loader />
      </div>
    );
  }

  if (!sala) return <p>Erro: Sala não encontrada</p>;

  const { codigo_visitante, codigo_voluntario, codigo_admin, nome } = sala;

  return (
    <div className="px-8">
      {showModal && (
        <AccessModal
          visitante={codigo_visitante}
          voluntario={codigo_voluntario}
          admin={codigo_admin}
          onClose={() => setShowModal(false)}
        />
      )}

      <h1 className="text-3xl font-bold text-left text-primary-dark mt-4">
        Administração do evento: {nome}
      </h1>

      <main className="mx-8 mt-8 grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-8">
        <div className="h-full">
          <Equipes codigoSala={codigoSala} onAtualizacao={adicionarAtualizacao} />
        </div>

        <div>
          <div className="bg-light-smoke rounded-md p-4 mb-8">
            <p className="text-xl font-bold text-primary-dark">Atualizações:</p>
            <ul>
              {atualizacoes.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </div>
          <div className="bg-light-smoke rounded-md p-4">asasa</div>
        </div>
      </main>
    </div>
  );
}
