"use client";
import { useState, useRef, KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import Hero from "@/components/hero";
import Loader from "@/components/loader";

export default function EnterRoomPage() {
  const router = useRouter();
  const [codigo, setCodigo] = useState(["", "", "", "", "", ""]);
  const [nomeUsuario, setNomeUsuario] = useState("");
  const [showUsernameInput, setShowUsernameInput] = useState(false);
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);
  const [status, setStatus] = useState({
    loading: false,
    error: "",
    sucesso: "",
    nivelAcesso: "",
  });

  const handleChange = (index: number, value: string) => {
    if (!/^[0-9a-zA-Z]*$/.test(value)) return;
    const newCodigo = [...codigo];
    newCodigo[index] = value.slice(-1);
    setCodigo(newCodigo);

    if (value && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !codigo[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pasteData = e.clipboardData.getData("Text").slice(0, 6);
    if (!/^[0-9a-zA-Z]+$/.test(pasteData)) return;

    const newCodigo = [...codigo];
    for (let i = 0; i < pasteData.length; i++) {
      newCodigo[i] = pasteData[i];
      if (inputsRef.current[i]) {
        inputsRef.current[i]!.value = pasteData[i];
      }
    }
    setCodigo(newCodigo);

    const nextIndex = Math.min(pasteData.length, 5);
    inputsRef.current[nextIndex]?.focus();
  };

  const verificarCodigo = async () => {
    const codigoCompleto = codigo.join("");

    if (codigoCompleto.length < 6) {
      setStatus({
        loading: false,
        error: "Digite todos os 6 dígitos do código.",
        sucesso: "",
        nivelAcesso: "",
      });
      return;
    }

    setStatus({ loading: true, error: "", sucesso: "", nivelAcesso: "" });

    const res = await fetch("/rooms/enter-room", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ codigo: codigoCompleto }),
    });

    const result = await res.json();

    if (res.ok) {
      setStatus({
        loading: false,
        error: "",
        sucesso: "Acesso permitido!",
        nivelAcesso: result.nivelAcesso,
      });
      setShowUsernameInput(true);
    } else {
      setStatus({
        loading: false,
        sucesso: "",
        error: result.error || "Código inválido",
        nivelAcesso: "",
      });
    }
  };

  const handleNomeSubmit = async () => {
    if (!nomeUsuario) return;

    setStatus((prev) => ({ ...prev, loading: true, error: "" }));

    const resSalvar = await fetch("/rooms/salvar-log", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        codigo: codigo,
        nome: nomeUsuario,
      }),
    });
    console.log(codigo.slice(0, 3).join(""));

    if (!resSalvar.ok) {
      const err = await resSalvar.json();
      setStatus((prev) => ({
        ...prev,
        loading: false,
        error: err.error || "Erro ao salvar log",
      }));
      return;
    }

    const resEnter = await fetch("/rooms/enter-room", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ codigo: codigo.join("") }),
    });

    if (!resEnter.ok) {
      const err = await resEnter.json();
      setStatus((prev) => ({
        ...prev,
        loading: false,
        error: err.error || "Erro ao verificar código após salvar log",
      }));
      return;
    }

    const result = await resEnter.json();
    console.log("Resultado do acesso:", result);

    setStatus({
      loading: false,
      error: "",
      sucesso: "Acesso permitido!",
      nivelAcesso: result.nivelAcesso,
    });

    console.log(codigo.join(""));
    router.push(`/${codigo.slice(0, 3).join("")}/${result.nivelAcesso}`);
  };

  if (status.loading) {
    return (
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          backgroundColor: "rgba(0, 0, 0, 0.8)",
          display: "flex",
          justifyContent: "center",
          backdropFilter: "blur(5px)",
          alignItems: "center",
          zIndex: 9999,
        }}
      >
        <Loader />
      </div>
    );
  }

  return (
    <>
      <Hero />
      <div className="relative flex h-[calc(100vh-64px)] items-center justify-center bg-gradient-to-t from-primary/50 to-light-smoke">
        <div className="relative mx-16 flex w-full max-w-md flex-col space-y-8 bg-light-smoke px-4 pt-8 pb-4 rounded-xl shadow-md animate-fadein-down">
          <div className="flex flex-col items-center justify-center text-center space-y-2">
            <p className="font-semibold text-3xl">Entrar</p>
            <p className="text-sm font-medium text-gray-400">
              Digite o código de acesso do evento
            </p>
          </div>

          <div className="flex flex-col space-y-8">
            <div className="flex flex-col space-y-8">
              {/* INPUT DO CÓDIGO */}
              {!showUsernameInput && (
                <>
                  <div className="flex flex-row items-center justify-between mx-auto w-full max-w-xs gap-4">
                    {codigo.map((char, index) => (
                      <div className="w-16 h-16" key={index}>
                        <input
                          className="w-full h-full text-center px-2 outline-none rounded-xl border border-gray-200 text-lg bg-white focus:bg-gray-50 focus:ring-1 ring-red-700"
                          type="text"
                          maxLength={1}
                          value={char}
                          onChange={(e) => handleChange(index, e.target.value)}
                          onKeyDown={(e) => handleKeyDown(index, e)}
                          onPaste={handlePaste}
                          ref={(el) => {
                            inputsRef.current[index] = el;
                          }}
                          required
                          disabled={status.loading}
                        />
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={verificarCodigo}
                    className="w-full py-3 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition"
                    disabled={status.loading || codigo.some((c) => !c)}
                  >
                    {status.loading ? "Verificando..." : "Verificar código"}
                  </button>
                </>
              )}

              {/* INPUT DO NOME */}
              {showUsernameInput && (
                <div className="flex flex-col space-y-4 pt-4">
                  <input
                    type="text"
                    placeholder="Seu nome"
                    value={nomeUsuario}
                    onChange={(e) => setNomeUsuario(e.target.value)}
                    className="w-full py-3 px-4 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    disabled={status.loading}
                  />
                  <button
                    type="button"
                    onClick={handleNomeSubmit}
                    className={`w-full py-3 text-white rounded-lg text-sm transition ${
                      status.loading
                        ? "bg-green-400 cursor-not-allowed"
                        : "bg-green-600 hover:bg-green-700"
                    }`}
                    disabled={status.loading || !nomeUsuario.trim()}
                  >
                    {status.loading ? "Entrando..." : "Confirmar nome"}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
