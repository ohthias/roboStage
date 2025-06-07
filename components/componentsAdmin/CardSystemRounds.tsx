interface Props {
  codigo_sala: string;
}

export default function CardSystemRounds({ codigo_sala }: Props) {
  return (
    <div className="bg-white shadow-md w-full max-w-full rounded-lg overflow-hidden mt-4 p-6 gap-4 flex flex-col justify-between">
      <div>
        <h2 className="text-2xl font-bold text-primary-dark">
          Sistema de Rounds
        </h2>
        <p className="text-sm text-gray-500">
          Semifinais e Final: <strong>Desativado</strong>
        </p>
        <p className="text-sm text-gray-500">
          Desafio de alianças{" "}
          <strong className="text-red-400">
            Não há equipes suficientes para realizar
          </strong>
        </p>
        <i className="text-xs text-gray-500 line-clamp-2">
          Para alterar as informações, acesse o painel de configurações, na aba
          "Sistema de Rounds".
        </i>
      </div>
      <p className="text-sm text-gray-500">
        Visualize o chaveamento das rodadas/desafios extras do evento. Podendo
        exibir para os visitantes{" "}
      </p>
      <button
        className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 hover:text-white transition-colors w-full cursor-not-allowed"
        disabled
      >
        Visualizar
      </button>
    </div>
  );
}
