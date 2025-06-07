import iconeFundo1 from '@/public/images/icone_fundo_ppt_1.png';
import iconeFundo2 from '@/public/images/icone_fundo_ppt_2.png';

interface Props {
  codigo_sala: string;
}

export default function CardPowerPoint({ codigo_sala }: Props) {
  return (
    <div className="bg-white shadow-md w-full max-w-full rounded-lg overflow-hidden mt-4 p-6">
      <h2 className="text-2xl font-bold text-primary-dark">
        PowerPoint do Evento
      </h2>
      <p className="text-sm text-gray-500 mb-4">
        Escolha um modelo para gerar o slide de premiação
      </p>
      <div className="flex flex-row gap-4">
        <button className="rounded-lg transition-colors border border-gray-300 hover:bg-gray-100 flex items-center cursor-pointer">
          <img
            src={iconeFundo1.src}
            alt="PowerPoint Icon"
            className="inline-block mr-2 rounded-lg hover:scale-105 transition-transform hover:shadow-lg"
          />
        </button>
        <button className="rounded-lg transition-colors border border-gray-300 hover:bg-gray-100 flex items-center cursor-pointer">
          <img
            src={iconeFundo2.src}
            alt="PowerPoint Icon"
            className="inline-block mr-2 rounded-lg hover:scale-105 transition-transform hover:shadow-lg"
          />
        </button>
      </div>
    </div>
  );
}
