export default function VoluntarioRoomPage({ params }: { params: { codigo_sala: string } }) {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Sala {params.codigo_sala} - Acesso Voluntário</h1>
      {/* Conteúdo para voluntários */}
    </div>
  );
}
