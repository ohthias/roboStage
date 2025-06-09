import Link from "next/link";
import Button from "./Button";

interface NavbarProps {
  mode?: string;
  id?: string;
  admin?: string;
}

export default function Navbar({ mode, id, admin }: NavbarProps) {
  const validMode = mode ?? "default";

  function setShowModal(arg0: boolean): void {
    throw new Error("Function not implemented.");
  }

  return (
    <nav className="flex justify-between items-center max-w-full px-10 py-2 relative z-10">
      {validMode === "default" && (
        <div className="flex items-center justify-end gap-5">
          <Button
            text="Criar"
            onClick={() => (window.location.href = "/create-room")}
          />
          <Button
            text="Entrar"
            onClick={() => (window.location.href = "/enter")}
          />
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
