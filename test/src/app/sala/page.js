"use client";
import { useRouter } from "next/navigation";
import { useState, useRef } from "react";
import style from "../../../styles/Login.module.css"; // ajuste conforme seu caminho
import Navbar from "../components/navbar";

export default function EntradaSala() {
  const router = useRouter();
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);
  const inputRefs = useRef([]);

  const handleChange = (e, index) => {
    const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "");
    if (!value) return;

    e.target.value = value[0];
    if (index < inputRefs.current.length - 1) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !e.target.value && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData("text").slice(0, 6).toUpperCase();
    for (let i = 0; i < pasteData.length; i++) {
      const input = inputRefs.current[i];
      if (input) input.value = pasteData[i];
    }
    inputRefs.current[Math.min(pasteData.length, 5)].focus();
  };

  const entrar = async () => {
    setErro("");
    const codigo = inputRefs.current.map((input) => input.value).join("");

    if (inputRefs.current.some((input) => input.value.trim() === "")) {
      setErro("Digite todos os 6 caracteres do código.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/verificar-codigo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ codigo }),
      });

      if (res.ok) {
        const { id, role } = await res.json();
        router.push(`/sala/${id}/${role}`);
      } else {
        const err = await res.json();
        setErro(err.error || "Erro ao acessar a sala");
      }
    } catch (e) {
      setErro("Erro de conexão.");
    }
  };

  return (
    <>
      <Navbar />
      <div className={style.container}>
        <div className={style.container__content}>
          <div className={style.container_side_left}>
            <h1>EMBARQUE EM UM EVENTO EXISTENTE</h1>
          </div>
          <div className={style.container_side_right}>
            <h2>Digite o código do evento</h2>
            <div className={style.otp__field} onPaste={handlePaste}>
              {[...Array(6)].map((_, i) => (
                <input
                  key={i}
                  maxLength={1}
                  onChange={(e) => handleChange(e, i)}
                  onKeyDown={(e) => handleKeyDown(e, i)}
                  ref={(el) => (inputRefs.current[i] = el)}
                  className={style.input}
                />
              ))}
            </div>

            <button className={style.btn} onClick={entrar} disabled={loading}>
              {loading ? <span className={style.loader}></span> : "Entrar"}
            </button>

            {erro && <p style={{ color: "red" }}>{erro}</p>}
          </div>
        </div>
      </div>
    </>
  );
}
