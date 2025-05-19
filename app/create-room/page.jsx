"use client";
import { useState } from "react";
import { gerarCodigoAleatorio } from "@/utils/gerarCodigoAleatorio";
import Loader from "@/components/loader";
import { useRouter } from "next/navigation";
import style from "@/components/style/Login.module.css";

export default function CreateRoomPage() {
  const router = useRouter();
  const codigo_sala = gerarCodigoAleatorio();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    codigo_sala: codigo_sala,
    nome: "",
    codigo_admin: codigo_sala + gerarCodigoAleatorio(),
    codigo_visitante: codigo_sala + gerarCodigoAleatorio(),
    codigo_voluntario: codigo_sala + gerarCodigoAleatorio(),
  });

  const [status, setStatus] = useState({
    success: "",
    error: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    setLoading(true);
    e.preventDefault();
    setStatus({ loading: true, success: "", error: "" });

    const res = await fetch("/rooms/create-room", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const result = await res.json();
    if (res.ok) {
      setStatus({
        success: "Sala criada com sucesso!",
        error: "",
      });
      setLoading(false);
      router.push(`/${result.room.codigo_sala}/admin`);
    } else {
      setStatus({
        success: "",
        error: result.error || "Erro ao criar sala",
      });
      setLoading(false);
    }
  };

  return (
    <>
      {loading && (
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
            alignItems: "center",
            zIndex: 9999,
          }}
        >
          <Loader />
        </div>
      )}
      <div className={style.container}>
        <div className={style.container__content}>
          <div className={`${style.container_side_left} ${style.blue__box}`}>
            <h1 className={style.title}>CRIE UM EVENTO DA FLL!</h1>
          </div>
          <div className={style.container_side_right}>
            <form onSubmit={handleSubmit} className={style.form}>
              <div className={style.group}>
                <label className={style.group__label}>Nome do evento:</label>
                <input
                  name="nome"
                  value={form.nome}
                  className={style.group__input}
                  onChange={handleChange}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={status.loading}
                className={`${style.button} ${style.create}`}
              >
                {status.loading ? "Criando..." : "Criar Sala"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
