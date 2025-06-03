import RoomDetailsForm from "@/components/RoomDetailsForm";

interface Props {
  codigoSala: string;
}

import { useEffect, useState } from "react";

export default function OperacaoUI({ codigoSala }: Props) {
  const [idRoom, setIdRoom] = useState<number | null>(null);

  useEffect(() => {
    const fetchRoomId = async () => {
      try {
        const res = await fetch(`/rooms/${codigoSala}/get`);
        const data = await res.json();
        setIdRoom(data.id);
      } catch (error) {
        console.error("Erro ao buscar o ID da sala:", error);
        setIdRoom(0);
      }
    };
    fetchRoomId();
  }, [codigoSala]);

  return (
    <div className="mb-6">
      <h2 className="text-2xl font-semibold mb-2 text-primary-dark">
        Operação
      </h2>
      <p className="mb-4 text-gray-500">
        Ajuste a operação do evento conforme necessário. Você pode alterar a
        quantidade de arenas, salas de avaliação, horários de início e fim, e
        outras configurações específicas do evento, para geração do cronograma e
        organização das partidas.
      </p>
      {idRoom !== null && <RoomDetailsForm idRoom={idRoom} codigoSala={codigoSala} />}
    </div>
  );
}
