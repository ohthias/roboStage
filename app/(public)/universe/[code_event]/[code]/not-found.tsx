import Link from "next/link";

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="card bg-base-100 shadow-xl w-full max-w-md">
        <div className="card-body text-center gap-4">
          <h1 className="text-4xl font-black">
            Evento não encontrado
          </h1>

          <p className="opacity-70">
            O código informado é inválido
            ou o evento está indisponível.
          </p>

          <Link
            href="/universe"
            className="btn btn-primary"
          >
            Voltar
          </Link>
        </div>
      </div>
    </div>
  );
}