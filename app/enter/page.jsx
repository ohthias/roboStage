"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import style from "@/components/style/Login.module.css"

export default function EnterRoomPage() {
  const router = useRouter();
  const [codigo, setCodigo] = useState("");
  const [status, setStatus] = useState({
    loading: false,
    error: "",
    sucesso: "",
    nivelAcesso: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ loading: true, error: "", sucesso: "", nivelAcesso: "" });

    const res = await fetch("/rooms/enter-room", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ codigo }),
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
    <div className={style.container}>
      <div className={style.container__content}>
        <div className={style.container_side_left}>
          <h1 className={style.title}>EMBARQUE EM UM EVENTO EXISTENTE</h1>
        </div>
        <div className={style.container_side_right}>
          <form onSubmit={handleSubmit} className={style.form}>
            <div>
              <label className={style.group_label}>Código de Acesso:</label>
              <input
                value={codigo}
                onChange={(e) => setCodigo(e.target.value)}
                maxLength={6}
                className={`${style.group__input} & ${style.enter}`}
                required
              />
            </div>

            <button
              type="submit"
              disabled={status.loading}
              className={style.button}
            >
              {status.loading ? "Verificando..." : "Entrar"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
