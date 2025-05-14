export default function AdminRoomPage({ params }: { params: { codigo_sala: string } }) {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Painel Administrativo - Sala {params.codigo_sala}</h1>
      {/* Conteúdo exclusivo para admin */}
    </div>
  );
}
