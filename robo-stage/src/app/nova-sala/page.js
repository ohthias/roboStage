"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../components/navbar";
import Loader from "../components/Loader";
import style from "../../../styles/Login.module.css"; // ajuste conforme seu caminho

export default function NovaSala() {
  const [nomeSala, setNomeSala] = useState("");
  const [sala, setSala] = useState(null);
  const [loading, setLoading] = useState(false); // estado para o loader
  const router = useRouter();

  const handleNomeChange = (e) => {
    setNomeSala(e.target.value);
  };

  const criarSala = async () => {
    if (!nomeSala) {
      alert("Por favor, forneça o nome da sala!");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/criar-sala", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ nome: nomeSala }),
      });

      if (!res.ok) {
        throw new Error("Erro ao criar sala");
      }

      const data = await res.json();

      router.push(
        `/sala/${data.codigoSala}/admin?visitante=${data.codigoVisitante}&voluntario=${data.codigoVoluntario}&admin=${data.codigoAdmin}&nome=${data.nome}`
      );
    } catch (error) {
      console.error("Error creating room:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
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
            <h1>CRIE UM EVENTO DA FLL!</h1>
          </div>
          <div className={style.container_side_right}>
            <div className={style.group}>
              <input
                type="text"
                className={style.group__input}
                onChange={handleNomeChange}
                value={nomeSala}
              />
              <span className={style.group__highlight}></span>
              <span className={style.group__bar}></span>
              <label className={style.group__label}>Nome do Evento</label>
            </div>
            <button className={style.btn} onClick={criarSala}>
              Criar Sala
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
