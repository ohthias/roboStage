"use client";

import Hero from "@/components/hero";

export default function Page() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Hero />
      {/* Cabeçalho */}
      <header className="w-full p-4">
        <h1 className="text-2xl font-bold text-foreground">
          lab<span className="text-primary">Arena</span>
        </h1>
        <p className="text-gray-600">
          Bem-vindo ao <i>lab</i> de criação de estratégias de mesa da FIRST
          LEGO League na temporada Uneartherd.
        </p>
        <p className="text-gray-600">
          Crie, explore as possibilidades que o robo da sua equipe é capaz de
          alcançar.
        </p>
        <p className="text-gray-500 text-sm">
          *Os desenhos e informação não são salvos se fechar a aba.
        </p>
      </header>

      {/* Área principal */}
      <main className="flex flex-1 flex-col md:flex-row gap-4 p-4">
        {/* Barra de ferramentas - esquerda */}
        <aside className="w-full md:w-14 flex-shrink-0 bg-white border border-gray-200 rounded p-2 space-y-2">
          <div className="flex gap-1 flex-wrap justify-center">
            <button
              className="hover:bg-gray-100 p-2 rounded cursor-pointer"
              title="Quadrado"
            >
              <svg
                width="24"
                height="24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <rect x="4" y="4" width="16" height="16" rx="2" />
              </svg>
            </button>
            <button
              className="hover:bg-gray-100 p-2 rounded cursor-pointer"
              title="Círculo"
            >
              <svg
                width="24"
                height="24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="12" cy="12" r="8" />
              </svg>
            </button>
            <button
              className="hover:bg-gray-100 p-2 rounded cursor-pointer"
              title="Linha 2 pontos"
            >
              <svg
                width="24"
                height="24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <line x1="6" y1="18" x2="18" y2="6" />
                <circle cx="6" cy="18" r="1.5" fill="currentColor" />
                <circle cx="18" cy="6" r="1.5" fill="currentColor" />
              </svg>
            </button>
            <button
              className="hover:bg-gray-100 p-2 rounded cursor-pointer"
              title="Linha múltiplos pontos"
            >
              <svg
                width="24"
                height="24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <polyline points="4,20 10,14 14,18 20,8" />
                <circle cx="4" cy="20" r="1.2" fill="currentColor" />
                <circle cx="10" cy="14" r="1.2" fill="currentColor" />
                <circle cx="14" cy="18" r="1.2" fill="currentColor" />
                <circle cx="20" cy="8" r="1.2" fill="currentColor" />
              </svg>
            </button>
            <button
              className="hover:bg-gray-100 p-2 rounded cursor-pointer text-lg"
              title="Borracha"
              style={{ lineHeight: "0" }}
            >
              <i className="fi fi-rr-eraser"></i>
            </button>
            <button
              className="hover:bg-gray-100 p-2 rounded cursor-pointer text-lg"
              title="Lápis"
              style={{ lineHeight: "0" }}
            >
              <i className="fi fi-rr-attribution-pencil"></i>
            </button>
          </div>
        </aside>

        {/* Área de desenho - centro */}
        <section className="flex-1 bg-white border border-gray-200 rounded relative overflow-hidden flex items-center justify-center">
          <img
            src="https://pbs.twimg.com/media/Go7ivzEWoAAwCbN?format=jpg&name=4096x4096"
            alt="tapete"
            className="max-w-full max-h-full object-contain"
          />
          {/* Aqui você pode adicionar um <canvas> sobreposto se quiser */}
        </section>

        {/* Saídas e cores - direita */}
        <aside className="w-full md:w-56 flex-shrink-0 bg-white border border-gray-200 rounded p-2 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-primary-dark">Saídas</h2>
            <div className="relative group">
              <button className="text-primary-dark cursor-pointer hover:bg-red-100 p-2 rounded ">
                <i className="fi fi-rr-add"></i>
              </button>
              <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 rounded bg-red-50 text-red-800 text-xs opacity-0 group-hover:opacity-100 transition pointer-events-none z-10 max-w-xs break-words text-center">
                Adicionar nova saída
              </span>
            </div>
          </div>
          <hr className="border-gray-200" />
          <div className="flex flex-col gap-1">
            <div className="flex justify-between items-start border border-gray-200 rounded bg-red-100">
              <div className="p-2 flex flex-col gap-1 justify-between h-full">
                <span className="font-bold text-red-600">Vermelho</span>
                <span className="font-medium text-foreground text-xs">#1</span>
              </div>
              <div className="grid grid-cols-2 grid-rows-2 gap-1 bg-white w-20 rounded">
                <button
                  className="cursor-pointer p-2 hover:bg-light-smoke rounded"
                  title="Renomear"
                >
                  <i className="fi fi-rr-pencil"></i>
                </button>
                <button
                  className="cursor-pointer p-2 hover:bg-light-smoke rounded"
                  title="Ocultar"
                >
                  <i className="fi fi-rr-eye"></i>
                </button>
                <button
                  className="cursor-pointer p-2 hover:bg-light-smoke rounded"
                  title="Apagar"
                >
                  <i className="fi fi-rr-trash"></i>
                </button>
                <input type="color" defaultValue="#ff0000" className="w-full h-full" />
              </div>
            </div>
          </div>
        </aside>
      </main>

      {/* Barra de exportação e reset - rodapé */}
      <footer className="p-2 rounded bg-white flex flex-wrap gap-2 justify-center border border-gray-200 mx-4 mb-4">
        <button className="bg-gray-100 text-red-600 rounded p-2 cursor-pointer hover:bg-gray-200 transition">
          Exportar todas as saídas
        </button>
        <button className="bg-gray-100 text-red-600 rounded p-2 cursor-pointer hover:bg-gray-200 transition">
          Exportar em desenho único
        </button>
        <button className="bg-red-100 text-red-600 rounded p-2 cursor-pointer hover:bg-red-200 transition">
          Resetar
        </button>
      </footer>
    </div>
  );
}
