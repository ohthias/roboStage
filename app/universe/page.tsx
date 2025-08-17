"use client";

import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/ui/Footer";
import { supabase } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function UniversePage() {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const trimmedCode = code.trim();

    if (!trimmedCode) {
      setError("Digite um código válido.");
      setLoading(false);
      return;
    }

    const { data, error: fetchError } = await supabase
      .from("public_event_lookup")
      .select("code_event, code")
      .eq("code", trimmedCode)
      .maybeSingle();

    if (fetchError) {
      console.error(fetchError);
      setError("Erro ao buscar o evento. Tente novamente.");
      setLoading(false);
      return;
    }

    if (!data) {
      setError("Código não encontrado.");
      setLoading(false);
      return;
    }


    router.push(`/${data.code_event}/${data.code}`);
    setLoading(false);
  };

  return (
    <div className="flex flex-col min-h-screen justify-between">
      <Navbar />

      <main
        className="
    flex-1 relative bg-cover bg-center
    before:content-[''] before:absolute before:inset-0 before:bg-black/50
    flex items-center justify-center
  "
        style={{
          backgroundImage: "url('/images/fundoPadrao.gif')",
        }}
      >
        <div className="hero">
          <div className="hero-content text-center text-base-content bg-base-100 border border-base-200 rounded-lg">
            <div className="max-w-md w-full">
              <h1 className="mb-4 text-4xl font-bold text-primary">
                Embarque num evento!
              </h1>
              <p className="mb-6">
                Insira o código disponibilizado pelo administrador do evento e
                aproveite!
              </p>
              <form className="form-control" onSubmit={handleSubmit}>
                <input
                  type="text"
                  placeholder="Código do evento"
                  maxLength={6}
                  required
                  disabled={loading}
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="input input-primary w-full mb-4 text-center"
                />

                <button
                  className="btn btn-primary w-full"
                  disabled={loading}
                  type="submit"
                >
                  Embarcar
                </button>
                {error && <p className="text-red-500 text-sm">{error}</p>}
              </form>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
