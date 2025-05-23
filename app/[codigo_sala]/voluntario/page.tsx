import VoluntarioRoomClient from "@/components/VoluntarioRoomClient";

interface VoluntarioPageProps {
  params: {
    codigo_sala: string;
  };
}

export default async function VoluntarioRoomPage({ params }: VoluntarioPageProps) {
  const codigo_sala = params.codigo_sala;

  return (
    <div className="w-full h-full flex items-center justify-center p-6">
      <VoluntarioRoomClient codigoSala={codigo_sala} />
    </div>
  );
}
