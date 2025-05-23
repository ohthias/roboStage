"use client";
import { useEffect, useState } from "react";
import Mensage from "./Mensage";

export default function Equipes({ codigoSala, onAtualizacao }) {
  const [equipes, setEquipes] = useState([]);
  const [nome_equipe, setNomeEquipe] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [mensagem, setMensagem] = useState("");
  const [tipoMensagem, setTipoMensagem] = useState(
    "sucesso" | "erro" | "aviso" | ""
  );

  useEffect(() => {
    const carregarEquipes = async () => {
      try {
        const res = await fetch(`/rooms/${codigoSala}/get/`);
        const data = await res.json();
        setEquipes(data.teams || []);
      } catch (error) {
        console.error("Erro ao carregar equipes:", error);
        setMensagem("Erro ao carregar as equipes.");
        setTipoMensagem("erro");
      }
    };

    carregarEquipes();
  }, [codigoSala]);

  const adicionarEquipe = async () => {
    if (!nome_equipe.trim()) {
      setMensagem("Digite o nome da equipe!");
      setTipoMensagem("aviso");
      return;
    }

    const novaEquipe = {
      nome_equipe,
      round1: 0,
      round2: 0,
      round3: 0,
    };

    const novasEquipes = [...equipes, novaEquipe];
    setEquipes(novasEquipes);
    setNomeEquipe("");
    setCarregando(true);

    try {
      const res = await fetch(`/rooms/${codigoSala}/post/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teams: novasEquipes }),
      });

      if (!res.ok) throw new Error("Erro ao salvar equipes");

      setMensagem("Equipe salva com sucesso!");
      setTipoMensagem("sucesso");
      onAtualizacao?.(`Equipe "${nome_equipe}" adicionada.`);
    } catch (error) {
      console.error(error);
      setMensagem("Erro ao salvar equipe!");
      setTipoMensagem("erro");
    } finally {
      setCarregando(false);
    }
  };

  const removerEquipe = async (index) => {
    const novasEquipes = equipes.filter((_, i) => i !== index);
    setEquipes(novasEquipes);
    setCarregando(true);

    try {
      const res = await fetch(`/rooms/${codigoSala}/post/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teams: novasEquipes }),
      });

      if (!res.ok) throw new Error("Erro ao atualizar equipes");

      setMensagem("Equipe removida com sucesso.");
      setTipoMensagem("sucesso");
      onAtualizacao?.(`Equipe "${nome_equipe}" removida.`);
    } catch (error) {
      console.error("Erro ao remover equipe:", error);
      setMensagem("Erro ao remover equipe.");
      setTipoMensagem("erro");
    } finally {
      setCarregando(false);
    }
  };

  return (
    <>
      <Mensage
        tipo={tipoMensagem}
        mensagem={mensagem}
        onClose={() => {
          setMensagem("");
          setTipoMensagem("");
        }}
      />
      <div className="bg-gray-100 p-4 rounded-lg shadow-md h-[400px] flex flex-col">
        <h2 className="text-xl font-bold mb-4 text-primary-dark">Equipes</h2>

        <div className="flex flex-row gap-4 mb-4">
          <input
            type="text"
            value={nome_equipe}
            placeholder="Nome da Equipe"
            className="p-2 border border-gray-300 rounded w-full"
            onChange={(e) => setNomeEquipe(e.target.value)}
          />
          <button
            onClick={adicionarEquipe}
            disabled={carregando}
            className="w-50 bg-primary text-white p-2 rounded hover:bg-primary-dark transition duration-200 cursor-pointer"
          >
            {carregando ? "Salvando..." : "Adicionar Equipe"}
          </button>
        </div>

        <div className="overflow-auto flex-1">
          <table className="w-full border-collapse border border-gray-300">
            <thead className="bg-primary text-white sticky top-0 z-10">
              <tr>
                <th className="p-2">Nº</th>
                <th className="p-2">Equipe</th>
                <th className="p-2 w-32">Ações</th>
              </tr>
            </thead>
            <tbody>
              {equipes.length === 0 ? (
                <tr>
                  <td colSpan="3" className="text-center text-gray-500 p-4">
                    Nenhuma equipe cadastrada.
                  </td>
                </tr>
              ) : (
                equipes.map((eq, idx) => (
                  <tr key={idx} className="border-b border-gray-300">
                    <td className="text-center text-gray-400 p-2">{idx + 1}</td>
                    <td className="p-2">{eq.nome_equipe}</td>
                    <td className="text-center p-2">
                      <button
                        onClick={() => removerEquipe(idx)}
                        disabled={carregando}
                        className="bg-light text-primary-dark px-2 rounded hover:bg-primary-light hover:text-white transition duration-200 cursor-pointer"
                      >
                        Remover
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
