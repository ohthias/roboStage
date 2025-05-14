export default function VisitanteRoomPage({ params }: { params: { codigo_sala: string } }) {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Sala {params.codigo_sala} - Acesso Visitante</h1>
      {/* Conteúdo restrito para visualização */}
    </div>
  );
}
