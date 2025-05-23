import Link from "next/link";
import Button from "./Button";
import ExitButton from "./ExitButon";

interface NavbarProps {
  mode?: string;
  id?: string;
  admin?: string;
}

export default function Navbar({ mode, id, admin }: NavbarProps) {
  const validMode = mode ?? "default";

  return (
    <nav className="flex justify-between items-center w-full px-10 py-2 relative z-10">
      {validMode === "default" && (
        <div className="flex items-center justify-end gap-5">
          <Button text="Criar" onClick={() => window.location.href = "/create-room"}/>
          <Button text="Entrar" onClick={() => window.location.href = "/enter"}/>
        </div>
      )}

      {validMode === "admin" && (
        <div className="flex items-center justify-end gap-5">
          <Button text="Visualização" onClick={() => window.location.href = `/${id}/visitante?admin=${admin}`}/>
          <Button text="Códigos" onClick={() => window.location.hash = "#codigos"}/>
          <ExitButton />
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

      {validMode === "voluntario" && (
        <ExitButton />
      )}
    </nav>
  );
}
