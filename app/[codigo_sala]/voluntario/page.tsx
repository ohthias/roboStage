"use client";
import { useParams } from "next/navigation";
import VoluntarioRoomClient from "@/components/VoluntarioRoomClient";

export default async function VoluntarioRoomPage() {
  const params = useParams();
  const codigo_sala = params?.codigo_sala as string;

  return (
    <div className="w-full h-full flex items-center justify-center p-6">
      <VoluntarioRoomClient codigoSala={codigo_sala} />
    </div>
  );
}
