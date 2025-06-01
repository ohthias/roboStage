"use client";
import { useState, useEffect } from "react";
import Equipes from "@/components/Equipes";
import Loader from "@/components/loader";
import SideBar from "@/components/ui/SideBar";
import TabelaEquipes from "@/components/TabelaEquipes";
import { supabase } from "@/lib/supabaseClient";
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
  const [carregando, setCarregando] = useState(true);
  const [atualizacoes, setAtualizacoes] = useState<string[]>([]);

  const adicionarAtualizacao = (texto: any) => {
    setAtualizacoes((prev) => [texto, ...prev]);
  };

  const deletarSala = async () => {
    const confirmacao = confirm(
      "Você tem certeza que deseja deletar este evento?"
    );
    if (!confirmacao || !codigoSala) return;

    const emailAdmin = prompt("Digite seu e-mail para confirmar a exclusão:");

    if (!emailAdmin || !/\S+@\S+\.\S+/.test(emailAdmin)) {
      alert("E-mail inválido. A operação foi cancelada.");
      return;
    }

    try {
      console.log("Deletando sala:", codigoSala, "Email do admin:", emailAdmin);
      const res = await fetch("/rooms/deleteRoom", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          codigo: codigoSala,
          emailAdmin,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert("Erro ao deletar sala: " + (data.error || "Erro desconhecido"));
        return;
      }

      alert("Sala deletada com sucesso! Um e-mail de confirmação foi enviado.");
      window.location.href = "/";
    } catch (error) {
      alert("Erro inesperado ao tentar deletar a sala.");
      console.error(error);
    }
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

  const [conteudo, setConteudo] = useState<"geral" | "ranking">("geral");

  const renderContent = () => {
    switch (conteudo) {
      case "geral":
        return (
          <>
            <Equipes
              codigoSala={codigoSala}
              onAtualizacao={adicionarAtualizacao}
            />
            <div className="bg-light-smoke rounded-md p-4 my-8 shadow-md">
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
          </>
        );
      case "ranking":
        return (
          <div className="text-gray-700 bg-light-smoke rounded-md p-4 my-8 shadow-md">
            <h2 className="text-2xl font-bold mb-4 text-primary-dark">
              Ranking
            </h2>
            <TabelaEquipes codigoSala={codigoSala} />
          </div>
        );
      default:
        return null;
    }
  };

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
    <div className="w-full bg-white">
      <SideBar
        codVisitante={codigo_visitante}
        codVoluntario={codigo_voluntario}
        codAdmin={codigo_admin}
        setConteudo={setConteudo}
        onDelete={deletarSala}
      />

      <main className="max-w-7xl mx-auto px-4 py-8 ml-[180px]">
        <div className="my-4 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-left text-primary-dark">
            {nome}
          </h1>
        </div>

        <div className="my-4">{renderContent()}</div>
      </main>
    </div>
  );
}
