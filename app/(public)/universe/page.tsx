"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/utils/supabase/client";

import Logo from "@/components/ui/Logo";
import { BackgroundStars } from "@/components/ui/BackgroundStars";

import {
  ArrowRight,
  AlertCircle,
  Info,
  Rocket,
  Radio,
  Users,
} from "lucide-react";

export default function UniversePage() {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const trimmedCode = code.trim().toUpperCase();
    if (!trimmedCode) {
      setError("Digite um código válido.");
      return;
    }

    setLoading(true);

    const { data, error: fetchError } = await supabase
      .from("public_event_lookup")
      .select("code_event, code")
      .eq("code", trimmedCode)
      .maybeSingle();

    if (fetchError || !data) {
      setError("Código inválido ou evento indisponível.");
      setLoading(false);
      return;
    }

    router.push(`/${data.code_event}/${data.code}`);
  };

  return (
    <div className="relative min-h-screen flex flex-col selection:bg-primary/30">
      <BackgroundStars />
      <div className="absolute top-4 left-4 md:top-8 md:left-8 z-50 hidden md:flex">
        <Logo logoSize="md" redirectIndex={true} />
      </div>

      <main className="flex-1 flex items-center justify-center p-4 md:p-8 z-10">
        <div className="hero w-full">
          <div className="hero-content flex-col lg:flex-row-reverse gap-14 max-w-6xl w-full">

            <div className="text-center lg:text-left flex-1">
              <Logo logoSize="md" redirectIndex={true} />

              <span className="badge badge-primary badge-outline gap-2 ml-2 hidden md:inline-flex">
                <Radio size={16} />
                ShowLive • Ao vivo
              </span>

              <h1 className="mt-6 text-5xl md:text-7xl font-black leading-tight">
                Entre no <span className="text-primary italic">ShowLive</span>
              </h1>

              <p className="py-2 text-lg md:text-xl text-base-content/70 max-w-xl">
                Conecte-se a eventos interativos em tempo real, participe com
                outras equipes e viva experiências sincronizadas com o RoboStage.
              </p>

              <div className="hidden lg:flex gap-4 mt-4">
                <div className="badge badge-outline badge-lg gap-2">
                  <Users className="w-4 h-4 text-secondary" />
                  Público ao vivo
                </div>
                <div className="badge badge-outline badge-lg gap-2">
                  <Info className="w-4 h-4 text-primary" />
                  Experiência sincronizada
                </div>
              </div>
            </div>

            {/* CARD – ENTRADA DO SHOWLIVE */}
            <div className="card w-full max-w-md bg-base-100/70 backdrop-blur-xl border border-base-300 shadow-2xl">
              <div className="card-body gap-6 p-8">
                <div className="flex flex-col items-center text-center">
                  <div className="bg-primary text-primary-content rounded-full w-16 h-16 shadow-lg flex items-center justify-center mb-4">
                    <Rocket />
                  </div>

                  <h2 className="text-2xl font-bold">
                    Entrada do ShowLive
                  </h2>
                  <p className="text-sm text-base-content/60">
                    Código de acesso do evento
                  </p>
                </div>

                <form className="form-control gap-4" onSubmit={handleSubmit}>
                  <div className="relative mb-2">
                    <input
                      type="text"
                      placeholder="ABC123"
                      maxLength={6}
                      required
                      disabled={loading}
                      value={code}
                      onChange={(e) =>
                        setCode(e.target.value.toUpperCase())
                      }
                      className={`input input-lg w-full text-center text-2xl font-mono tracking-widest uppercase
                        ${error ? "input-error" : "input-primary"}`}
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs opacity-50">
                      {code.length}/6
                    </span>
                  </div>

                  {error && (
                    <div className="alert alert-error text-sm">
                      <AlertCircle className="w-4 h-4" />
                      <span>{error}</span>
                    </div>
                  )}

                  <button
                    className="btn btn-primary btn-lg w-full gap-2"
                    type="submit"
                    disabled={loading}
                  >
                    {loading ? (
                      <span className="loading loading-spinner" />
                    ) : (
                      <>
                        Entrar no evento
                        <ArrowRight className="w-5 h-5" />
                      </>
                    )}
                  </button>
                </form>

                <p className="text-xs text-center opacity-50 mt-2">
                  O acesso libera a participação no evento público.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}