"use client";
import { useState, useEffect } from "react";
import Equipes from "@/components/Equipes";
import Loader from "@/components/loader";
import SideBar from "@/components/ui/SideBar";
import TabelaEquipes from "@/components/TabelaEquipes";
import ThemeForm from "./subpages/ThemePage";
import ThemePreview from "../visitante/ThemePreview";
import ConfigPage from "./subpages/SettingsPage";
import iconeFundo1 from "@/public/images/icone_fundo_ppt_1.png";
import iconeFundo2 from "@/public/images/icone_fundo_ppt_2.png";
import protoboard from "@/public/protoboard.gif";
import CardDeliberationRound from "@/components/componentsAdmin/CardDeliberationRound";
import CardPowerPoint from "@/components/componentsAdmin/CardPowerPoint";
import CardCronograma from "@/components/componentsAdmin/CardCronograma";
import CardSystemRounds from "@/components/componentsAdmin/CardSystemRounds";
import GeneralPage from "./subpages/GeralPage";
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
  const [roomDetails, setRoomDetails] = useState<any>({});
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

    const fetchRoom_details = async () => {
      try {
        const res = await fetch(`/rooms/${codigoSala}/others/`);
        if (!res.ok) throw new Error("Erro ao buscar detalhes da sala");
        const data = await res.json();
        console.log("Detalhes da sala:", data);
        setRoomDetails(data);
      } catch (error) {
        console.error("Erro ao buscar detalhes da sala:", error);
      }
    }
    fetchRoom_details();
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
          <GeneralPage codigo_sala={codigoSala} />
        )
      case "ranking":
        // TODO: Transformar em componente separado, fazer os 2º details ser com base se o evento tem final/semifinal
        return (
          <div className="bg-white shadow-md w-full max-w-full rounded-lg overflow-hidden mt-4 p-6">
            <details
              className="flex flex-col justify-start gap-4 w-full mb-4"
              open
            >
              <summary className="text-lg font-semibold text-primary-dark cursor-pointer">
                Ranking das Equipes
              </summary>
              <p className="text-sm text-gray-500 mb-4">
                O ranking das equipes participantes do evento é atualizado em
                tempo real, com base nas pontuações obtidas durante as rodadas.
              </p>
              <TabelaEquipes codigoSala={codigoSala} cor={undefined} />
            </details>
            <details className="flex flex-col justify-start gap-4 max-w-full">
              <summary className="text-lg font-semibold text-primary-dark cursor-pointer">
                Eventos Rounds
              </summary>
              <p className="text-sm text-gray-500 mb-4">
                Ranking das equipes participantes em outros desafios/rodadas do
                evento.
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

      <main className="ml-56 px-6 py-2 bg-white min-h-screen bg-gradient-to-t from-gray-50 to-white">
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