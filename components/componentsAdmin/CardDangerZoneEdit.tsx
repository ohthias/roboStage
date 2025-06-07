interface Props {
  codigo_sala: string;
}

export default function CardDangerZoneEdit({ codigo_sala }: Props) {
  return (
    <div className="bg-red-100 shadow-md w-full max-w-full rounded-lg overflow-hidden mt-4 p-6 border border-2 border-red-200">
      <h2 className="text-2xl font-bold mb-4 text-primary-dark">
        Painel de edição
      </h2>
      <div className="flex flex-col gap-4">
        <div className="flex flex-row justify-between items-center w-full bg-white p-4 rounded-lg">
          <p className="font-semibold text-primary-dark">Rounds equipes</p>
          <button className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-primary-dark hover:text-white transition-colors cursor-pointer">
            Abrir
          </button>
        </div>
        <div className="flex flex-row justify-between items-center w-full bg-white p-4 rounded-lg">
          <p className="font-semibold text-primary-dark">Discursos enviados</p>
          <button className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-primary-dark hover:text-white transition-colors cursor-pointer">
            Abrir
          </button>
        </div>
        <div className="flex flex-row justify-between items-center w-full bg-white p-4 rounded-lg">
          <p className="font-semibold text-primary-dark">
            Reset de dados personalizados
          </p>
          <button className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-primary-dark hover:text-white transition-colors cursor-pointer">
            Abrir
          </button>
        </div>
      </div>
    </div>
  );
}
