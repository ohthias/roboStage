"use client";

import { useState } from "react";

interface RoomDetailsFormProps {
  codigoSala: string;
}

export default function RoomDetailsForm({ codigoSala }: RoomDetailsFormProps) {
  const [formData, setFormData] = useState({
    quantidade_arenas: 2,
    incluirSalasAvaliacao: false,
    salas_avaliacao: 1,
    inicio: "",
    fim: "",
    temIntervalos: false,
    tempo_intervalo: "",
    quantidade_intervalos: "",
    dividirArenas: false,
    arenas_treino: "",
    arenas_oficial: "",
  });

  const [status, setStatus] = useState<string | null>(null);

  const handleChange = (e: { target: { name: any; value: any } }) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    setStatus("Carregando...");

    try {
      const res = await fetch(`/rooms/${codigoSala}/details/post`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Erro ao inserir dados");
      }

      setStatus("Dados inseridos com sucesso!");
      setFormData({
        quantidade_arenas: 2,
        dividirArenas: false,
        arenas_treino: "",
        arenas_oficial: "",
        incluirSalasAvaliacao: false,
        salas_avaliacao: 1,
        inicio: "",
        fim: "",
        temIntervalos: false,
        tempo_intervalo: "",
        quantidade_intervalos: "",
      });
    } catch (err) {
      if (err instanceof Error) {
        setStatus(`Erro: ${err.message}`);
      } else {
        setStatus("Erro desconhecido");
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 py-2 max-w-full flex flex-col gap-4">
      <label className="block mb-2 text-sm font-medium text-gray-500">
        Quantidade de Arenas:
        <input
          type="number"
          name="quantidade_arenas"
          value={formData.quantidade_arenas}
          onChange={handleChange}
          className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
        />
      </label>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="dividirArenas"
          name="dividirArenas"
          min={0}
          checked={!!formData.dividirArenas}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              dividirArenas: e.target.checked,
              arenas_treino: "",
              arenas_oficial: "",
            }))
          }
          className="accent-primary h-4 w-4 rounded border-gray-300"
        />
        <label htmlFor="dividirArenas" className="text-sm font-medium text-gray-500 cursor-pointer">
          Dividir arenas em treino e oficial?
        </label>
      </div>
      {formData.dividirArenas && (
        <div className="flex gap-4">
          <label className="block text-sm font-medium text-gray-500 w-full">
            Arenas de treino:
            <input
              type="number"
              name="arenas_treino"
              value={formData.arenas_treino || ""}
              min={0}
              max={formData.quantidade_arenas - (parseInt(formData.arenas_oficial || "0") || 0)}
              onChange={(e) => {
                const treino = parseInt(e.target.value) || 0;
                const oficial = parseInt(formData.arenas_oficial || "0") || 0;
                if (treino + oficial > formData.quantidade_arenas) return;
                setFormData((prev) => ({
                  ...prev,
                  arenas_treino: e.target.value,
                }));
              }}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
            />
          </label>
          <label className="block text-sm font-medium text-gray-500 w-full">
            Arenas oficiais:
            <input
              type="number"
              name="arenas_oficial"
              value={formData.arenas_oficial || ""}
              min={0}
              max={formData.quantidade_arenas - (parseInt(formData.arenas_treino || "0") || 0)}
              onChange={(e) => {
                const oficial = parseInt(e.target.value) || 0;
                const treino = parseInt(formData.arenas_treino || "0") || 0;
                if (treino + oficial > formData.quantidade_arenas) return;
                setFormData((prev) => ({
                  ...prev,
                  arenas_oficial: e.target.value,
                }));
              }}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
            />
          </label>
          <div className="flex items-center text-xs text-gray-400 text-center">
            {((parseInt(formData.arenas_treino || "0") || 0) +
              (parseInt(formData.arenas_oficial || "0") || 0) !==
              formData.quantidade_arenas) && (
              <span>
                Tem que ser divida entre as {formData.quantidade_arenas} arenas
              </span>
            )}
          </div>
        </div>
      )}

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="incluirSalasAvaliacao"
          name="incluirSalasAvaliacao"
          checked={!!formData.incluirSalasAvaliacao}
          onChange={(e) =>
        setFormData((prev) => ({
          ...prev,
          incluirSalasAvaliacao: e.target.checked,
          salas_avaliacao: e.target.checked ? prev.salas_avaliacao : 1,
        }))
          }
          className="accent-primary h-4 w-4 rounded border-gray-300"
        />
        <label htmlFor="incluirSalasAvaliacao" className="text-sm font-medium text-gray-500 cursor-pointer">
          Incluir salas de avaliação?
        </label>
      </div>
      {formData.incluirSalasAvaliacao && (
        <label className="block mb-2 text-sm font-medium text-gray-500">
          Salas de Avaliação:
          <input
        type="number"
        name="salas_avaliacao"
        value={formData.salas_avaliacao}
        onChange={handleChange}
        className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
          />
        </label>
      )}

      <div className="flex items-center justify-between mb-2 gap-4">
        <label className="block text-sm font-medium text-gray-500 w-full">
          Início:
          <input
            type="datetime-local"
            name="inicio"
            value={formData.inicio}
            onChange={handleChange}
            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
          />
        </label>
        <label className="block text-sm font-medium text-gray-500 w-full">
          Fim:
          <input
            type="datetime-local"
            name="fim"
            value={formData.fim}
            onChange={handleChange}
            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
          />
        </label>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="temIntervalos"
          name="temIntervalos"
          checked={!!formData.temIntervalos}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              temIntervalos: e.target.checked,
              tempo_intervalo: "",
              quantidade_intervalos: "",
            }))
          }
          className="accent-primary h-4 w-4 rounded border-gray-300"
        />
        <label htmlFor="temIntervalos" className="text-sm font-medium text-gray-500 cursor-pointer">
          A competição terá intervalos?
        </label>
      </div>
      {formData.temIntervalos && (
        <div className="flex gap-4">
          <label className="block text-sm font-medium text-gray-500 w-full">
            Tempo de cada intervalo (minutos):
            <input
              type="number"
              name="tempo_intervalo"
              value={formData.tempo_intervalo || ""}
              onChange={handleChange}
              min={1}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
            />
          </label>
          <label className="block text-sm font-medium text-gray-500 w-full">
            Quantidade de intervalos:
            <input
              type="number"
              name="quantidade_intervalos"
              value={formData.quantidade_intervalos || ""}
              onChange={handleChange}
              min={1}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
            />
          </label>
        </div>
      )}

      <button
        type="submit"
        className="bg-primary-light text-white px-4 py-2 rounded ml-auto hover:bg-primary-dark transition-colors cursor-pointer"
      >
        Salvar
      </button>
    </form>
  );
}
