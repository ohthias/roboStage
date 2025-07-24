import Link from "next/link";
import Button from "./Button";

interface NavbarProps {
  mode?: string;
  id?: string;
  admin?: string;
}

export default function Navbar({ mode, id, admin }: NavbarProps) {
  const validMode = mode ?? "default";

  return (
    <nav className="flex justify-between items-center max-w-full px-10 py-2 relative z-10">
      {validMode === "default" && (
        <div className="flex items-center justify-end gap-5">
          <Button
            text="Cadastrar"
            onClick={() => (window.location.href = "/sign")}
          />
          <Button
            text="Entrar"
            onClick={() => (window.location.href = "/login")}
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
