"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabase/client";
import Link from "next/link";

export default function ConfirmEmailPage() {
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");

  useEffect(() => {
    const checkSession = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) throw error;

        if (session) {
          setStatus("success");
        } else {
          // se não tiver sessão, provavelmente o token expirou
          setStatus("error");
        }
      } catch (err) {
        console.error(err);
        setStatus("error");
      }
    };

    checkSession();
  }, []);

  return (
    <div className="flex h-screen items-center justify-center bg-base-200">
      <div className="card w-full max-w-md shadow-2xl">
        <div className="card-body text-center">
          {status === "loading" && (
            <p className="text-gray-500">Confirmando seu e-mail...</p>
          )}

          {status === "success" && (
            <>
              <h2 className="text-2xl font-bold text-green-600 mb-4">
                E-mail confirmado com sucesso! 🎉
              </h2>
              <Link href="/auth/login" className="btn btn-primary w-full">
                Ir para o Login
              </Link>
            </>
          )}

          {status === "error" && (
            <>
              <h2 className="text-2xl font-bold text-red-600 mb-4">
                Erro ao confirmar e-mail 😢
              </h2>
              <p className="mb-4">
                O link pode ter expirado ou já ter sido usado.
              </p>
              <Link href="/auth/login" className="btn btn-primary w-full">
                Voltar ao Login
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}