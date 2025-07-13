import { useState, useEffect } from "react";
import CardSystemRounds from "@/components/componentsAdmin/CardSystemRounds";
import CardCronograma from "@/components/componentsAdmin/CardCronograma";
import CardDeliberationRound from "@/components/componentsAdmin/CardDeliberationRound";
import CardPowerPoint from "@/components/componentsAdmin/CardPowerPoint";
import Loader from "@/components/loader";
import ModalTeamsEdit from "@/components/componentsAdmin/ModalTeamsEdit";

interface Props {
  codigo_sala: string;
}

export default function GeneralPage({ codigo_sala }: Props) {
  const [room, setRoom] = useState<any>("");
  const [roomDetails, setRoomDetails] = useState<any>("");
  const [atualizacoes, setAtualizacoes] = useState<string[]>([]);
  const [loader, setLoader] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    const fetchRoom = async () => {
      const res = await fetch(`/rooms/${codigo_sala}/get/`);
      if (!res.ok) {
        console.error("Erro ao buscar sala");
        return;
      } else {
        const data = await res.json();
        setRoom(data);
      }
    };

    const fetchRoomDetails = async () => {
      const res = await fetch(`/rooms/${codigo_sala}/others`);
      if (!res.ok) {
        console.error("Erro ao buscar sala");
        return;
      } else {
        const data = await res.json();
        setRoomDetails(data);
      }
    };

    const fetchLogs = async () => {
      try {
        const res = await fetch(`/rooms/salvar-log/get`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ codigo: codigo_sala }),
        });
        if (!res.ok) throw new Error("Erro ao buscar logs");
        const data = await res.json();
        const ultimosLogs = (data.logs || [])
          .slice(0, 7)
          .map((log: any) => log.descricao);
        setAtualizacoes(ultimosLogs);
      } catch (err) {
        console.error(err);
      } finally {
        setLoader(false);
      }
    };

    fetchRoom();
    fetchRoomDetails();
    fetchLogs();
  }, [codigo_sala]);

    if (loader) {
        return (
        <div className="flex items-center justify-center h-screen">
            <Loader />
        </div>
        );
    }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Card - nome evento */}
      <div className="bg-white shadow-md w-full max-w-full rounded-lg overflow-hidden mt-4 flex flex-row items-center justify-between">
        <div className="p-6">
          <h3 className="text-lg font-semibold">Nome do evento: {room.nome}</h3>
          <p className="mt-2 text-sm text-slate-500 leading-relaxed">
            FIRST LEGO League Challenge
          </p>
        </div>
        <img
          src="https://www.firstinspires.org/sites/default/files/uploads/resource_library/brand/thumbnails/FLL-Vertical.png"
          alt="Logo"
        />
      </div>
      {/* Card - atualizações */}
      <div className="bg-white shadow-md w-full max-w-full rounded-lg overflow-hidden mt-4 min-h-[200px]">
        <div className="p-6">
          <p className="text-xl font-bold text-primary-dark">Atualizações:</p>
          {atualizacoes.length === 0 ? (
            <p className="text-sm text-gray-500 mt-2">Sem atualizações</p>
          ) : (
            <ul className="max-h-64 overflow-y-auto list-disc list-inside mt-2 space-y-1">
              {atualizacoes.slice(0, 7).map((item, idx) => (
                <li
                  key={idx}
                  className={`text-sm ${idx === 0 ? "text-primary-dark" : "text-gray-400"}`}
                >
                  {item}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Card - Fichas de Avaliação */}

      {/* Card - Sistema de Rounds*/}
      {(roomDetails?.check_eventos_round ||
        roomDetails?.check_desafios_round) && (
        <CardSystemRounds codigo_sala={codigo_sala} />
      )}
      {/* Card - Cronograma */}
      {roomDetails?.check_gerar_cronograma && (
        <CardCronograma codigo_sala={codigo_sala} />
      )}

      {/* Card - Deliberação dos Resultados */}
      {roomDetails?.check_deliberacao_resultados && (
        <CardDeliberationRound codigo_sala={codigo_sala} />
      )}

      {/* Card - PowerPoint do Evento */}
      {roomDetails?.check_gerar_ppt_premiacao && (
        <CardPowerPoint codigo_sala={codigo_sala} />
      )}
      {/* Painel de Edição */}
      {roomDetails?.data_teams_switch && (
        <div className="bg-red-50 shadow-md w-full max-w-full rounded-lg overflow-hidden min-h-[200px]">
          <div className="p-6">
            <p className="text-xl font-bold text-primary-dark">Zona de Perigo:</p>
            <div className="mt-2 flex flex-row items-center justify-between bg-white rounded p-2">
              <p className="text-md text-gray-600 font-semibold">Edição de pontuação</p>
              <button
                className="px-4 py-2 bg-gray-100 text-gray-600 rounded
                hover:bg-gray-200 transition-colors cursor-pointer"
                onClick={() => setShowEditModal(true)}
              >
                Abrir
              </button>
            </div>
          </div>
        </div>
      )}

      {showEditModal && (
        <ModalTeamsEdit
          codigo_sala={codigo_sala}
          onClose={() => setShowEditModal(false)}
        />
      )}
    </div>
  );
}
