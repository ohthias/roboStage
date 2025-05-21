import VoluntarioRoomClient from "@/components/VoluntarioRoomClient";

export default async function VoluntarioRoomPage({
  params,
}: {
  params: { codigo_sala: string };
}) {
  const codigoSala = params.codigo_sala;

  return (
    <div className="w-full h-full flex items-center justify-center p-6">
      <VoluntarioRoomClient codigoSala={codigoSala} />
    </div>
  );
}
