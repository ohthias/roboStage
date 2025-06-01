import Link from "next/link";
import Button from "./Button";
import ExitButton from "./ExitButon";
import AccessModal from "../AccessModal";

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

      {validMode === "admin" && (
        <div className="flex items-center justify-end gap-5">
          <Button
            text="Visualização"
            onClick={() =>
              (window.location.href = `/${id}/visitante?admin=${admin}`)
            }
          />
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
        <div className="flex items-center justify-end gap-5">
          <p className="text-foreground font-bold text-lg">Voluntário</p>
          <ExitButton />
        </div>
      )}
    </nav>
  );
}
