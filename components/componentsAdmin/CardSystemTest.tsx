interface Props {
  codigo_sala: string;
}

export default function CardSystemTest({codigo_sala} : Props) {
    return <div className="bg-white shadow-md w-full max-w-full rounded-lg overflow-hidden mt-4 p-6 flex flex-col justify-between min-h-[200px]">
    <div>
      <h2 className="text-2xl font-bold text-primary-dark">
        Fichas de Avaliação
      </h2>
      <p className="text-sm text-gray-500">
        Formato de avaliação: <strong>FIRST LEGO League</strong>
      </p>
      <p className="text-sm text-gray-500">
        Quantidade de fichas: <strong>2</strong>
      </p>
      <i className="text-xs text-gray-500 line-clamp-2">Para alterar as informações, acesse o painel de configurações, na aba "Sistema de Avaliação".</i>
    </div>
    <button className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-primary-dark hover:text-white transition-colors cursor-pointer w-full">
      Visualizar
    </button>
  </div>;
}