"use client";
import { useState, useEffect } from "react";
import AccessModal from "@/components/AccessModal";
import Equipes from "@/components/Equipes";
import Loader from "@/components/loader";
import Hero from "@/components/hero";

interface Props {
  codigoSala: string;
}

interface Sala {
  equipes: any;
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
      }
    };

    fetchSala();

    const fetchLogs = async () => {
      try {
        const res = await fetch(`/rooms/salvar-log/get`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ codigo: codigoSala }),
        });
        if (!res.ok) throw new Error("Erro ao buscar logs");
        const data = await res.json();
        const ultimosLogs = (data.logs || [])
          .slice(0, 7)
          .map((log: any) => log.descricao);
        setAtualizacoes(ultimosLogs);
      } catch (err) {
        console.error(err);
      }
    };

    fetchLogs();
  }, [codigoSala]);

  useEffect(() => {
    const checkHash = () => {
      if (window?.location.hash === "#codigos") {
        setShowModal(true);
      } else {
        setShowModal(false);
      }
    };

    checkHash();
    window.addEventListener("hashchange", checkHash);

    return () => window.removeEventListener("hashchange", checkHash);
  }, []);

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
    <>
      <Hero admin={codigo_admin} />
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
            <Equipes
              codigoSala={codigoSala}
              onAtualizacao={adicionarAtualizacao}
            />
          </div>

          <div>
            <div className="bg-light-smoke rounded-md p-4 mb-8">
              <p className="text-xl font-bold text-primary-dark">
                Atualizações:
              </p>
              {atualizacoes.length === 0 ? (
                <p className="text-sm text-gray-500 mt-2">Sem atualizações</p>
              ) : (
                <ul className="max-h-64 overflow-y-auto list-disc list-inside mt-2 space-y-1">
                  {atualizacoes.slice(0, 7).map((item, idx) => (
                    <li key={idx} className="text-sm text-gray-700">
                      {item}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="bg-light-smoke rounded-md p-4">
              <p className="text-xl font-bold text-primary-dark">
                Estatísticas
              </p>
              <div className="mt-2 text-sm text-gray-600">
                <p>Equipes</p>
                <p>{sala?.equipes?.length || 0}</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
