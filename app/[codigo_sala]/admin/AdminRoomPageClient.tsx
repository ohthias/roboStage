"use client";
import { useState, useEffect } from "react";
import Equipes from "@/components/Equipes";
import Loader from "@/components/loader";
import SideBar from "@/components/ui/SideBar";
import TabelaEquipes from "@/components/TabelaEquipes";
import ThemeForm from "./subpages/ThemePage";
import ThemePreview from "../visitante/ThemePreview";
import ConfigPage from "./subpages/SettingsPage";
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
  const [tema, setTema] = useState<any>({});

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

    const theme = async () => {
      try {
        const res = await fetch(`/rooms/${codigoSala}/theme/get/`);
        const data = await res.json();
        setTema(data);
      } catch (error) {
        console.error("Erro ao buscar tema:", error);
      }
    };

    theme();
  }, [codigoSala]);

  const [conteudo, setConteudo] = useState<
    | "geral"
    | "ranking"
    | "equipes"
    | "personalização"
    | "visualização"
    | "configurações"
  >("geral");

  const renderContent = () => {
    switch (conteudo) {
      case "geral":
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white shadow-md w-full max-w-full rounded-lg overflow-hidden mt-4 flex flex-row items-center justify-between">
              <div className="p-6">
                <h3 className="text-lg font-semibold">
                  Nome do evento: {nome}
                </h3>
                <p className="mt-2 text-sm text-slate-500 leading-relaxed">
                  FIRST LEGO League Challenge
                </p>
              </div>
              <img
                src="https://www.firstinspires.org/sites/default/files/uploads/resource_library/brand/thumbnails/FLL-Vertical.png"
                alt="Logo"
              />
            </div>
            <div className="bg-white shadow-md w-full max-w-full rounded-lg overflow-hidden mt-4 min-h-[200px]">
              <div className="p-6">
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
            </div>
          </div>
        );
      case "ranking":
        // TODO: Transformar em componente separado, fazer os 2º details ser com base se o evento tem final/semifinal
        return (
          <div className="bg-white shadow-md w-full max-w-full rounded-lg overflow-hidden mt-4 p-6">
            <details className="flex flex-col justify-start gap-4 w-full mb-4" open>
              <summary className="text-lg font-semibold text-primary-dark cursor-pointer">
                Ranking das Equipes
              </summary>
              <p className="text-sm text-gray-500 mb-4">
                O ranking das equipes participantes do evento é atualizado em tempo real, com base nas pontuações obtidas durante as rodadas.
              </p>
              <TabelaEquipes codigoSala={codigoSala} cor={undefined} />
            </details>
            <details className="flex flex-col justify-start gap-4 max-w-full">
              <summary className="text-lg font-semibold text-primary-dark cursor-pointer">
                Eventos Rounds
              </summary>
              <p className="text-sm text-gray-500 mb-4">
                Ranking das equipes participantes em outros desafios/rodadas do evento.
              </p>
              <TabelaEquipes codigoSala={codigoSala} cor={undefined} />
            </details>
          </div>
        );
      case "equipes":
        return (
          <div className="bg-white shadow-md w-full max-w-full rounded-lg overflow-hidden mt-4 p-6">
            <h2 className="text-2xl font-bold mb-4 text-primary-dark">
              Equipes
            </h2>
            <Equipes
              codigoSala={codigoSala}
              onAtualizacao={adicionarAtualizacao}
            />
          </div>
        );
      case "personalização":
        return (
          <div className="bg-white shadow-md w-full max-w-full rounded-lg overflow-hidden mt-4 p-6">
            <h2 className="text-2xl font-bold mb-4 text-primary-dark">
              Personalização
            </h2>
            <ThemeForm
              roomId={codigoSala}
              defaultPrimaryColor={tema?.primary_color}
              defaultSecondaryColor={tema?.secondary_color}
              defaultWallpaperUrl={tema?.wallpaper_url}
            />
          </div>
        );
      case "visualização":
        return (
          <div className="bg-white shadow-md w-full max-w-full rounded-lg overflow-hidden mt-4 p-6">
            <h2 className="text-2xl font-bold mb-4 text-primary-dark">
              Visualização
            </h2>
            <div className="rounded-[24px] border border-none overflow-hidden">
              <ThemePreview theme={tema} codigo_sala={codigoSala} />
            </div>
          </div>
        );
      case "configurações":
        return (
          <div className="bg-white shadow-md w-full max-w-full rounded-lg overflow-hidden mt-4 p-6">
            <ConfigPage codigoSala={codigoSala} />
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

  if (!sala) return (window.location.href = "/enter");

  const { codigo_visitante, codigo_voluntario, codigo_admin, nome } = sala;

  return (
    <div className="w-full bg-white relative">
      <SideBar
        codVisitante={codigo_visitante}
        codVoluntario={codigo_voluntario}
        codAdmin={codigo_admin}
        setConteudo={setConteudo}
      />

      <main className="ml-56 px-6 py-2 bg-white min-h-screen">
        <div className="my-4 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-left text-primary-dark">
            Administração
          </h1>
        </div>

        <div className="my-4">{renderContent()}</div>
      </main>
    </div>
  );
}
