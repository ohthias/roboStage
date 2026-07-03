"use client";

import { BackgroundStars } from "@/components/UI/BackgroundStars";
import { useRouter } from "next/navigation";

export default function NotFound() {
  const router = useRouter();
  return (
    <div className="bg-base-200 h-screen flex items-center justify-center">
      <BackgroundStars />
      <div className="text-center">
        <h1 className="text-9xl font-bold text-base-content">404</h1>
        <p className="text-2xl font-light text-primary mt-4">
          Oops! Página não encontrada
        </p>
        <p className="text-base-content/70 mt-4 mb-8 max-w-md mx-auto">
          A página que você está procurando pode ter sido removida ou está
          temporariamente indisponível.
        </p>
        <button
          onClick={() => router.back()}
          className="btn btn-primary"
        >
          Voltar para a página anterior
        </button>
      </div>
    </div>
  );
}
