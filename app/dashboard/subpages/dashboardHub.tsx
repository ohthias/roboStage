interface DashboardHubProps {
  profile: {
    username?: string;
    email?: string;
  } | null;
  session: {
    user?: {
      email?: string;
    };
  } | null;
}

export default function DashboardHubPage({
  profile,
  session,
}: DashboardHubProps) {
  return (
    <>
      <section className="bg-yellow-50 p-4 rounded">
        <div>
          <h2 className="text-yellow-600 font-bold mb-2 text-3xl">
            Bem-vindo {profile?.username || session?.user?.email} ao seu hub!
          </h2>
          <p className="text-sm text-gray-600">
            Aqui você pode gerenciar suas configurações, acessar seu perfil e
            muito mais.
          </p>
        </div>
      </section>

      <section className="flex gap-4 flex-wrap">
        <div className="bg-gray-100 border border-gray-200 p-4 rounded shadow w-full flex-1">
          <h3 className="text-md font-semibold mb-2 max-w-xs text-gray-600">
            Atividades Recentes
          </h3>
          <p className="text-gray-600">Nenhuma atividade recente.</p>
        </div>
        <div className="bg-gray-100 border border-gray-200 p-4 rounded shadow w-full flex-1">
          <h3 className="text-md font-semibold mb-2 max-w-xs text-gray-600">
            Mensagens
          </h3>
          <p className="text-gray-600">Você não tem mensagens.</p>
        </div>
        <div className="bg-gray-100 border border-gray-200 p-4 rounded shadow w-full flex-1">
          <h3 className="text-md font-semibold mb-2 max-w-xs text-gray-600">
            Eventos Criados
          </h3>
          <p className="text-gray-600">Nenhum evento criado.</p>
        </div>
        <div className="bg-gray-100 border border-gray-200 p-4 rounded shadow w-full flex-1">
          <h3 className="text-md font-semibold mb-2 max-w-xs text-gray-600">
            Laboratórios Criados
          </h3>
          <p className="text-gray-600">Você não tem laboratórios criados.</p>
        </div>
      </section>
    </>
  );
}
