"use client";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";

export default function EnterRoomPage() {
  const router = useRouter();
  const [codigo, setCodigo] = useState(["", "", "", "", "", ""]);
  const inputsRef = useRef([]);
  const [status, setStatus] = useState({
    loading: false,
    error: "",
    sucesso: "",
    nivelAcesso: "",
  });

  const handleChange = (index, value) => {
    if (!/^[0-9a-zA-Z]*$/.test(value)) return; // Apenas caracteres válidos
    const newCodigo = [...codigo];
    newCodigo[index] = value.slice(-1); // Garante 1 caractere
    setCodigo(newCodigo);

    if (value && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !codigo[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const codigoCompleto = codigo.join("");

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
      router.push(`/${result.codigo_sala}/${result.nivelAcesso}`);
    } else {
      setStatus({
        loading: false,
        sucesso: "",
        error: result.error || "Código inválido",
        nivelAcesso: "",
      });
    }
  };

  return (
      <div className="relative flex h-[calc(100vh-64px)] items-center justify-center bg-gradient-to-t from-primary/50 to-light-smoke">
        <div className="relative mx-16 flex w-full max-w-md flex-col space-y-8 bg-light-smoke px-4 pt-8 pb-4 rounded-xl shadow-md animate-fadein-down">
          <div className="flex flex-col items-center justify-center text-center space-y-2">
            <p className="font-semibold text-3xl">Entrar</p>
            <p className="text-sm font-medium text-gray-400">
              Digite o código de acesso do evento
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="flex flex-col space-y-16">
              <div className="flex flex-row items-center justify-between mx-auto w-full max-w-xs gap-4">
                {codigo.map((char, index) => (
                  <div className="w-16 h-16" key={index}>
                    <input
                      ref={(el) => (inputsRef.current[index] = el)}
                      className="w-full h-full text-center px-2 outline-none rounded-xl border border-gray-200 text-lg bg-white focus:bg-gray-50 focus:ring-1 ring-red-700"
                      type="text"
                      maxLength={1}
                      value={char}
                      onChange={(e) => handleChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      required
                    />
                  </div>
                ))}
              </div>

              <div className="flex flex-col space-y-5">
                <button
                  className="w-full py-5 bg-primary text-white rounded-xl text-sm shadow-sm cursor-pointer transition-colors hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                  disabled={status.loading}
                  type="submit"
                >{status.loading ? "Verificando..." : "Entrar"}
                </button>

                {status.error && (
                  <p className="text-red-600 text-sm text-center">{status.error}</p>
                )}
                {status.sucesso && (
                  <p className="text-green-600 text-sm text-center">{status.sucesso}</p>
                )}
              </div>
            </div>
          </form>
        </div>
      </div>
  );
}