"use client";

import { useEffect, useState } from "react";
import Mensage from "@/components/Mensage";

interface RoomDetailsFormProps {
  idRoom: number;
  codigoSala?: string;
}

export default function RoomDetailsForm({
  idRoom,
  codigoSala,
}: RoomDetailsFormProps) {
  const [formData, setFormData] = useState({
    quantidade_arenas: 2,
    check_salas_avaliacao: false,
    salas_avaliacao: 1,
    inicio: "",
    fim: "",
    check_intervalos: false,
    tempo_intervalo: "",
    quantidade_intervalos: "",
    check_dividir_arenas: false,
    arenas_treino: "",
    arenas_oficiais: "",
  });

  const [isUpdate, setIsUpdate] = useState(false);
  const [mensagem, setMensagem] = useState("");
  const [tipoMensagem, setTipoMensagem] = useState<
    "sucesso" | "erro" | "aviso" | ""
  >("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!codigoSala) return;

    setLoading(true);
    const fetchData = async () => {
      try {
        const res = await fetch(`/rooms/${codigoSala}/details/get/`);
        const data = await res.json();
        console.log("Fetched data:", data);
        if (res.ok && data) {
          setIsUpdate(true);
          const dadosExtras = data.operacao.dados_extras ?? {};
          setFormData({
            quantidade_arenas: data.operacao.quantidade_arenas ?? 2,
            check_salas_avaliacao: data.operacao.check_salas_avaliacao ?? false,
            salas_avaliacao: dadosExtras.salas_avaliacao ?? 1,
            inicio: data.operacao.inicio ?? "",
            fim: data.operacao.fim ?? "",
            check_intervalos: data.operacao.check_intervalos ?? false,
            tempo_intervalo: data.intervalos.tempo_intervalo ?? "",
            quantidade_intervalos: data.intervalos.quantidade_intervalos ?? "",
            check_dividir_arenas: data.operacao.check_dividir_arenas ?? false,
            arenas_treino: data.arenas.arenas_treino ?? "",
            arenas_oficiais: data.arenas.arenas_oficiais ?? "",
          });
        } else {
          setMensagem("Nenhum dado encontrado, usando valores padrão.");
          setTipoMensagem("aviso");
        }
      } catch (err) {
        setMensagem("Erro ao buscar dados.");
        setTipoMensagem("erro");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [codigoSala]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const dadosExtras = formData.check_salas_avaliacao
      ? { salas_avaliacao: formData.salas_avaliacao }
      : { salas_avaliacao: 0 };

    const payload = {
      id_room: idRoom,
      quantidade_arenas: formData.quantidade_arenas,
      check_salas_avaliacao: formData.check_salas_avaliacao,
      check_intervalos: formData.check_intervalos,
      check_dividir_arenas: formData.check_dividir_arenas,
      inicio: formData.inicio,
      fim: formData.fim,
      tempo_intervalo: formData.check_intervalos
        ? formData.tempo_intervalo
        : null,
      quantidade_intervalos: formData.check_intervalos
        ? formData.quantidade_intervalos
        : null,
      arenas_treino: formData.check_dividir_arenas
        ? formData.arenas_treino
        : null,
      arenas_oficiais: formData.check_dividir_arenas
        ? formData.arenas_oficiais
        : null,
      dadosExtras: dadosExtras,
    };

    try {
      const res = await fetch(
        `/rooms/${codigoSala}/details/${isUpdate ? "put" : "post"}`,
        {
          method: isUpdate ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Erro ao salvar dados.");

      setTipoMensagem("sucesso");
      setMensagem("Dados salvos com sucesso!");
      setIsUpdate(true);
    } catch (err) {
      if (err instanceof Error) setMensagem(`Erro: ${err.message}`);
      else setMensagem("Erro desconhecido.");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-40">
        <span className="animate-pulse text-gray-400 text-lg">
          Carregando dados da sala...
        </span>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="p-4 flex flex-col gap-4">
      {mensagem && (
        <Mensage
          tipo={tipoMensagem}
          mensagem={mensagem}
          onClose={() => {
            setMensagem("");
            setTipoMensagem("");
          }}
        />
      )}

      {/* quantidade_arenas */}
      <label className="flex flex-col gap-2 text-md text-gray-500">
        Quantidade de Arenas:
        <input
          type="number"
          name="quantidade_arenas"
          value={formData.quantidade_arenas}
          onChange={handleChange}
          className="border border-gray-300 p-2 rounded w-full font-normal focus:border-primary-dark focus:ring-primary-dark focus:outline-none focus:ring-1 transition focus:text-gray-900"
          placeholder="Quantidade de arenas"
          min="1"
        />
      </label>

      {/* check_dividir_arenas */}
      <label className="flex items-center gap-2 text-md text-gray-500">
        <input
          type="checkbox"
          name="check_dividir_arenas"
          checked={formData.check_dividir_arenas}
          className="cursor-pointer accent-primary-dark transition w-4 h-4"
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              check_dividir_arenas: e.target.checked,
              arenas_treino: "",
              arenas_oficiais: "",
            }))
          }
        />
        Dividir arenas em treino e oficiais?
      </label>

      {formData.check_dividir_arenas && (
        <div className="flex flex-col gap-2">
          <div className="flex gap-4">
            <label className="text-sm text-gray-500 w-full">
              Arenas de Treino
              <input
                type="number"
                name="arenas_treino"
                min="0"
                value={formData.arenas_treino}
                onChange={handleChange}
                placeholder="Arenas treino"
                className="border border-gray-300 p-2 rounded w-full font-normal focus:border-primary-dark focus:ring-primary-dark focus:outline-none focus:ring-1 transition focus:text-gray-900"
              />
            </label>
            <label className="text-sm text-gray-500 w-full">
              Arenas Oficiais
              <input
                type="number"
                name="arenas_oficiais"
                min="0"
                value={formData.arenas_oficiais}
                onChange={handleChange}
                placeholder="Arenas oficiais"
                className="border border-gray-300 p-2 rounded w-full font-normal focus:border-primary-dark focus:ring-primary-dark focus:outline-none focus:ring-1 transition focus:text-gray-900"
              />
            </label>
          </div>
          {Number(formData.arenas_treino || 0) +
            Number(formData.arenas_oficiais || 0) !==
            Number(formData.quantidade_arenas) && (
            <span className="text-red-500 text-xs">
              A soma das arenas de treino e oficiais deve ser igual à quantidade
              de arenas.
            </span>
          )}
        </div>
      )}

      {/* check_salas_avaliacao */}
      <label className="flex items-center gap-2 text-md text-gray-500">
        <input
          type="checkbox"
          name="check_salas_avaliacao"
          checked={formData.check_salas_avaliacao}
          className="cursor-pointer accent-primary-dark transition w-4 h-4"
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              check_salas_avaliacao: e.target.checked,
              salas_avaliacao: e.target.checked ? prev.salas_avaliacao : 1,
            }))
          }
        />
        Incluir salas de avaliação?
      </label>

      {formData.check_salas_avaliacao && (
        <input
          type="number"
          name="salas_avaliacao"
          value={formData.salas_avaliacao}
          onChange={handleChange}
          min="1"
          placeholder="Quantidade de salas"
          className="border border-gray-300 p-2 rounded w-full font-normal focus:border-primary-dark focus:ring-primary-dark focus:outline-none focus:ring-1 transition focus:text-gray-900"
        />
      )}

      {/* início e fim */}
      <div className="flex gap-4">
        <input
          type="datetime-local"
          name="inicio"
          value={formData.inicio}
          onChange={handleChange}
          className="border border-gray-300 p-2 rounded w-full font-normal focus:border-primary-dark focus:ring-primary-dark focus:outline-none focus:ring-1 transition focus:text-gray-900"
        />
        <input
          type="datetime-local"
          name="fim"
          value={formData.fim}
          onChange={handleChange}
          className="border border-gray-300 p-2 rounded w-full font-normal focus:border-primary-dark focus:ring-primary-dark focus:outline-none focus:ring-1 transition focus:text-gray-900"
        />
      </div>

      {/* check_intervalos */}
      <label className="flex items-center gap-2 text-md text-gray-500">
        <input
          type="checkbox"
          name="check_intervalos"
          checked={formData.check_intervalos}
          className="cursor-pointer accent-primary-dark transition w-4 h-4"
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              check_intervalos: e.target.checked,
              tempo_intervalo: "",
              quantidade_intervalos: "",
            }))
          }
        />
        Incluir intervalos?
      </label>

      {formData.check_intervalos && (
        <div className="flex gap-4">
          <input
            type="number"
            name="tempo_intervalo"
            value={formData.tempo_intervalo}
            onChange={handleChange}
            placeholder="Duração (min)"
            className="border border-gray-300 p-2 rounded w-full font-normal focus:border-primary-dark focus:ring-primary-dark focus:outline-none focus:ring-1 transition focus:text-gray-900"
          />
          <input
            type="number"
            name="quantidade_intervalos"
            value={formData.quantidade_intervalos}
            onChange={handleChange}
            placeholder="Qtde de intervalos"
            className="border border-gray-300 p-2 rounded w-full font-normal focus:border-primary-dark focus:ring-primary-dark focus:outline-none focus:ring-1 transition focus:text-gray-900"
          />
        </div>
      )}

      <button
        type="submit"
        className="ml-auto px-4 py-2 bg-primary-light text-white rounded hover:bg-primary-dark transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isUpdate ? "Atualizar" : "Salvar"}
      </button>
    </form>
  );
}
