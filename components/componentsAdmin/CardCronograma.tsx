import protoboard from '@/public/protoboard.gif';

interface Props {
  codigo_sala: string;
}

export default function CardCronograma({ codigo_sala }: Props) {
  return (
    <div className="bg-white shadow-md w-full max-w-full rounded-lg overflow-hidden mt-4 p-6">
      <h2 className="text-2xl font-bold text-primary-dark">Cronograma</h2>
      <div className="flex flex-row items-start justify-between">
        <p className="text-sm text-gray-500 mt-2 w-2/4">
          Clique no botão e gere o cronograma do evento criado com base nas
          configurações passadas no painel de operação nas configurações.
        </p>
        <img src={protoboard.src} alt="Protoboard" className="w-1/4 max-w-md" />
      </div>
      <button className="mt-4 bg-transparent text-primary border-2 border-primary-dark px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors cursor-pointer w-full hover:text-white">
        Gerar Cronograma
      </button>
    </div>
  );
}
