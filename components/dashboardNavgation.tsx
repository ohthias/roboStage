interface DashboardNavigationProps {
  handleLogout: () => void;
}

export default function DashboardNavigation({
  handleLogout,
}: DashboardNavigationProps) {
  return (
    <aside className="p-4 rounded max-w-[220px] w-full bg-gray-50 rounded shadow h-full flex-shrink-1 flex flex-col justify-between">
      <nav className="space-y-2">
        <div className="font-bold text-zinc-900 text-2xl mb-4">
          Robo<span className="text-red-600">Stage</span>
        </div>
        <a
          href="#"
          className="block text-gray-600 hover:bg-gray-200 p-2 rounded flex items-center"
        >
          <i className="fi fi-rr-home mr-2" style={{ lineHeight: 0 }}></i>
          Dashboard
        </a>
        <a
          href="#showLive"
          className="block text-gray-600 hover:bg-gray-200 p-2 rounded flex items-center"
        >
          <i
            className="fi fi-rr-stage-theatre mr-2"
            style={{ lineHeight: 0 }}
          ></i>
          showLive
        </a>
        <hr className="border-gray-300" />
        <a
          href="#profile"
          className="block text-gray-600 hover:bg-gray-200 p-2 rounded flex items-center"
        >
          <i className="fi fi-rr-user mr-2" style={{ lineHeight: 0 }}></i>
          Perfil
        </a>
        <a
          href="#settings"
          className="block text-gray-600 hover:bg-gray-200 p-2 rounded flex items-center"
        >
          <i className="fi fi-rr-settings mr-2" style={{ lineHeight: 0 }}></i>
          Configurações
        </a>
      </nav>
      <button
        onClick={handleLogout}
        className="bg-gray-100 text-gray-600 border border-gray-300 p-2 rounded mt-auto hover:bg-gray-200 w-full flex items-center justify-center mt-4 cursor-pointer"
      >
        Sair
      </button>
    </aside>
  );
}
