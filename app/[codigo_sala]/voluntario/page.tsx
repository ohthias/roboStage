import VoluntarioRoomClient from "@/components/VoluntarioRoomClient";

export default async function VoluntarioRoomPage({
  params,
}: {
  params: { codigo_sala: string };
}) {
  const codigoSala = params.codigo_sala;

  return <VoluntarioRoomClient codigoSala={codigoSala} />;
}
