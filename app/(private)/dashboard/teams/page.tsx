import { Users, Settings, Search, Plus, LogIn, Filter } from "lucide-react";

export default function TeamSpacePage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="relative overflow-hidden bg-gradient-to-br from-base-100 to-base-300 text-base-content rounded-3xl">
        <div className="absolute inset-0 opacity-[0.04] bg-[linear-gradient(to_right,theme(colors.base-content)_1px,transparent_1px),linear-gradient(to_bottom,theme(colors.base-content)_1px,transparent_1px)] bg-[size:24px_24px]" />

        <div className="relative max-w-7xl mx-auto px-6 py-12">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
            Suas Equipes
          </h1>
          <p className="mt-3 max-w-2xl text-base md:text-lg opacity-90">
            Espaço para gerenciar todas as equipes associadas à sua conta
          </p>
        </div>
      </header>

      {/* NAV: Busca, Filtro e Ações */}
      <section>
        <div className="bg-base-100 border border-base-200 rounded-2xl shadow-sm p-4 flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between">
          {/* Busca + Filtro */}
          <div className="flex flex-1 flex-col sm:flex-row gap-3">
            {/* Busca */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-base-content/60 z-2" />
              <input
                type="text"
                placeholder="Buscar equipe pelo nome ou descrição..."
                className="input input-bordered w-full pl-10"
              />
            </div>

            {/* Filtro */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-base-content/60 z-2" />
              <select className="select select-bordered pl-10 w-full sm:w-56 rounded-lg">
                <option value="all">Todas as equipes</option>
                <option value="admin">Sou administrador</option>
                <option value="member">Sou membro</option>
              </select>
            </div>
          </div>

          {/* Ações */}
          <div className="flex gap-3 justify-end">
            <button className="btn btn-outline">
              <LogIn className="w-4 h-4" />
              Entrar em equipe
            </button>

            <button className="btn btn-info text-info-content">
              <Plus className="w-4 h-4" />
              Criar equipe
            </button>
          </div>
        </div>
      </section>

      {/* Grid de Equipes */}
      <section>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card de Equipe */}
          <div className="group bg-base-100 rounded-2xl border border-base-200 shadow-md hover:shadow-xl transition-all duration-300 p-6 flex flex-col justify-between">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-xl bg-info/10 text-info flex items-center justify-center text-xl font-bold">
                T
              </div>

              <div className="flex-1">
                <h3 className="text-lg font-semibold group-hover:text-info transition-colors">
                  Nome da Equipe
                </h3>
                <p className="text-sm text-base-content/70 mt-1 line-clamp-2">
                  Descrição curta da equipe explicando o foco ou objetivo
                </p>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-base-content/70">
                <Users className="w-4 h-4" />
                <span>5 membros</span>
              </div>

              <div className="flex items-center gap-2">
                <button className="btn btn-sm btn-ghost">
                  <Settings className="w-4 h-4" />
                </button>
                <button className="btn btn-sm btn-info text-info-content">
                  Entrar
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}