import { useRouter } from "next/navigation";

interface NavgationBarProps {
  code_volunteer: string;
  code_visitor: string;
}

export default function NavgationBar({
  code_volunteer,
  code_visitor,
}: NavgationBarProps) {
  const router = useRouter();

  return (
    <aside className="p-4 rounded max-w-[220px] w-full bg-gray-50 rounded shadow h-full flex-shrink-1 flex flex-col justify-between h-screen">
      <nav className="space-y-2">
        <div className="font-bold text-zinc-900 text-2xl mb-4">
          Robo<span className="text-red-600">Stage</span>
        </div>
        <div>
          <p className="text-gray-600 text-sm mb-2">Códigos</p>
            <div className="flex items-center justify-between bg-gray-100 p-2 rounded">
              <span className="text-gray-800 text-xs">Voluntário</span>
              <p className="text-gray-500 text-sm">{code_volunteer}</p>
              </div>
            <div className="flex items-center justify-between bg-gray-100 p-2 rounded">
              <span className="text-gray-800 text-xs">Visitante</span>
              <p className="text-gray-500 text-sm">{code_visitor}</p>
              </div>
        </div>
        <a
          href="#"
          className="block text-gray-600 hover:bg-gray-200 p-2 rounded flex items-center"
        >
          <i className="fi fi-rr-apps mr-2" style={{ lineHeight: 0 }}></i>
          Geral
        </a>
        <a
          href="#equipes"
          className="block text-gray-600 hover:bg-gray-200 p-2 rounded flex items-center"
        >
          <i className="fi fi-rr-employees-woman-man mr-2" style={{ lineHeight: 0 }}></i>
          Equipes
        </a>
        <a
          href="#ranking"
          className="block text-gray-600 hover:bg-gray-200 p-2 rounded flex items-center"
        >
          <i className="fi fi-rr-ranking-star mr-2" style={{ lineHeight: 0 }}></i>
          Ranking
        </a>
        <a
          href="#visualizacao"
          className="block text-gray-600 hover:bg-gray-200 p-2 rounded flex items-center"
        >
          <i className="fi fi-rr-eye mr-2" style={{ lineHeight: 0 }}></i>
          Visualização
        </a>
        <hr className="border-gray-300 my-4" />
        <a
          href="#personalizacao"
          className="block text-gray-600 hover:bg-gray-200 p-2 rounded flex items-center"
        >
          <i className="fi fi-rr-customize-edit mr-2" style={{ lineHeight: 0 }}></i>
          Personalização
        </a>
        <a
          href="#configuracoes"
          className="block text-gray-600 hover:bg-gray-200 p-2 rounded flex items-center"
        >
          <i className="fi fi-rr-settings mr-2" style={{ lineHeight: 0 }}></i>
          Configurações
        </a>
      </nav>
      <hr className="border-gray-300 my-4" />
      <button
        className="bg-gray-100 text-gray-600 border border-gray-300 p-2 rounded mt-auto hover:bg-gray-200 w-full flex items-center justify-center mt-4 cursor-pointer"
        onClick={() => router.push("/dashboard#showLive")}
      >
        Voltar ao Hub
      </button>
    </aside>
  );
}
