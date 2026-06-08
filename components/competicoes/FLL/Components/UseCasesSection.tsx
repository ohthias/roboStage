const users = [
  {
    title: "Equipes iniciantes",
    description: "Aprendam estratégia sem se perder",
    image: "/images/icons/EquipesIniciantes.svg",
  },
  {
    title: "Técnicos",
    description: "Centralizem treinos e análises",
    image: "/images/icons/Tecnicos.svg",
  },
  {
    title: "Organizadores",
    description: "Criem torneios completos em minutos",
    image: "/images/icons/Organizadores.svg",
  },
  {
    title: "Equipes avançadas",
    description: "Validem consistência e desempenho",
    image: "/images/icons/EquipesAvancadas.svg",
  },
];

export default function UseCasesSection() {
  return (
    <section className="bg-base-100 py-24">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Ilustração */}
          <div className="flex justify-center">
            <img
              src="/images/icons/Equipe.svg"
              alt="Equipe RoboStage"
              className="w-full max-w-xl lg:max-w-2xl object-contain"
            />
          </div>

          {/* Conteúdo */}
          <div>
            <span className="badge badge-primary badge-outline mb-4">
              Para todos os níveis
            </span>

            <h2 className="text-4xl md:text-5xl font-black leading-tight">
              Como as equipes usam o RoboStage
            </h2>

            <p className="mt-4 text-base-content/70 text-lg">
              Planeje, teste, organize e evolua sua equipe em uma única
              plataforma.
            </p>

            <div className="grid sm:grid-cols-2 gap-4 mt-10">
              {users.map((user) => (
                <div
                  key={user.title}
                  className="bg-base-100/80 backdrop-blur-sm rounded-3xl p-6 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1"
                >
                  <img
                    src={user.image}
                    alt={user.title}
                    className="h-20 w-20 object-contain mb-4"
                  />

                  <h3 className="font-bold text-base">{user.title}</h3>

                  <p className="text-sm text-base-content/60 mt-2">
                    {user.description}
                  </p>
                </div>
              ))}
            </div>

            <button className="btn btn-primary mt-10 rounded-2xl px-8">
              Comece a usar hoje
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
