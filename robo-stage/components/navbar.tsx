import Link from  "next/link";
import ROBOSTAGE from "@/public/robostage_logo.svg"
import Image from "next/image";

interface NavbarProps {
  mode?: string;
  id?: string;
  admin?: string;
}

export default function Navbar({ mode, id, admin } : NavbarProps) {
  const validMode = mode ?? "default";

  const handleLogout = () => {
    window.location.href = "/";
  };

  return (
    <nav className="flex justify-between items-center w-full px-10 py-2 bg-[#f3f3f35b] backdrop-blur-sm relative z-10">
      <div className="text-2xl font-bold text-primary">
        <Link href="/"><Image src={ROBOSTAGE} alt="robostage-logo" width={150}/></Link>
      </div>

      {validMode === "default" && (
        <div className="flex items-center justify-end gap-5">
          <Link
            href="/create-room"
            className="px-4 py-2 border-2 border-foreground rounded-full font-bold text-center hover:bg-[#e60046] hover:border-[#e60046] hover:text-white transition-colors duration-250"
          >
            Criar
          </Link>
          <Link
            href="/enter"
            className="px-4 py-2 border-2 border-foreground rounded-full font-bold text-center hover:bg-[#e60046] hover:border-[#e60046] hover:text-white transition-colors duration-250"
          >
            Embarcar
          </Link>
        </div>
      )}

      {validMode === "admin" && (
        <div className="flex items-center justify-end gap-5">
          <Link
            href={`/room/${id}/visitante?admin=${admin}`}
            className="px-4 py-2 border-2 border-foreground rounded-full font-bold text-center hover:bg-[#e60046] hover:border-[#e60046] hover:text-white transition-colors duration-250"
          >
            Visualização
          </Link>
          <button
            className="px-4 py-2 border-2 border-foreground rounded-full font-bold text-center hover:bg-[#e60046] hover:border-[#e60046] hover:text-white transition-colors duration-250"
            onClick={() => (window.location.hash = "#codigos")}
          >
            Ver Códigos de Acesso
          </button>
          <button
            className="px-4 py-2 border-2 border-foreground rounded-full font-bold text-center hover:bg-[#e60046] hover:border-[#e60046] hover:text-white transition-colors duration-250"
            onClick={handleLogout}
          >
            Sair
          </button>
        </div>
      )}

      {validMode === "visitante" && (
        <div className="flex items-center justify-end gap-5">
          <Link
            href="/"
            className="text-foreground font-bold text-lg hover:underline"
          >
            Início
          </Link>
        </div>
      )}
    </nav>
  );
}
