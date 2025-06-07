import React, { useEffect, useState } from "react";
import Mensage from "@/components/Mensage";
import Loader from "@/components/loader";
import OperacaoUI from "@/components/componentsSettings/OpercaoUI";
import DangerZoneUI from "@/components/componentsSettings/DangerZoneUI";
import OthersSettingsUI from "@/components/componentsSettings/OthersSettingsUI";
import FormSistemaAvalia from "@/components/componentsSettings/FormSistemaAvalia";

export default function ConfigPage({ codigoSala }: { codigoSala: string }) {
  const [nomeEvento, setNomeEvento] = useState<string>("");
  const [tempNomeEvento, setTempNomeEvento] = useState<string>("");
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [mensagem, setMensagem] = useState("");
  const [tipoMensagem, setTipoMensagem] = useState<
    "sucesso" | "erro" | "aviso" | ""
  >("");
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchNomeEvento = async () => {
      try {
        const res = await fetch(`/rooms/${codigoSala}/get`);
        const data = await res.json();
        setNomeEvento(data.nome);
        setTempNomeEvento(data.nome);
      } catch (error) {
        console.error("Erro ao buscar o nome do evento:", error);
        setNomeEvento("Nome do Evento");
        setTempNomeEvento("Nome do Evento");
        setTipoMensagem("erro");
        setMensagem("Erro ao carregar o nome do evento. Tente novamente.");
      }
    };
    fetchNomeEvento();
  }, [codigoSala]);

  const handleEditOrSave = async () => {
    if (isEditing) {
      setLoading(true);
      try {
        const res = await fetch(`/rooms/${codigoSala}/updateRoom`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ nome: tempNomeEvento }),
        });
        if (!res.ok) {
          setTempNomeEvento(nomeEvento);
          throw new Error("Erro ao salvar o nome do evento");
        }
        setTipoMensagem("sucesso");
        setMensagem("Novo nome do evento carregado com sucesso!");
        console.log("Nome do evento salvo com sucesso:", tempNomeEvento);
      } catch (error) {
        console.error("Erro ao salvar o nome do evento:", error);
        setTipoMensagem("erro");
        setMensagem("Erro ao salvar o novo nome do evento.");
      }
      setNomeEvento(tempNomeEvento);
      setLoading(false);
      console.log("Novo nome do evento:", tempNomeEvento);
    }
    setIsEditing(!isEditing);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Mensage
        tipo={tipoMensagem}
        mensagem={mensagem}
        onClose={() => {
          setMensagem("");
          setTipoMensagem("");
        }}
      />
      <h1 className="text-3xl font-bold mb-4">Configurações do Evento</h1>
      <div className="mb-6 flex flex-row gap-4">
        <label className="text-gray-500">
          Código da Sala:
          <input
            type="text"
            value={codigoSala}
            readOnly
            className="border border-gray-300 p-2 rounded w-full mb-4 cursor-not-allowed text-gray-500 text-center"
            placeholder="Código da Sala"
          />
        </label>
        <label className="text-gray-500 w-full">
          Nome do Evento:
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={tempNomeEvento}
              readOnly={!isEditing}
              onChange={(e) => setTempNomeEvento(e.target.value)}
              className={`border border-gray-300 p-2 rounded w-full ${
                isEditing ? "" : "cursor-not-allowed text-gray-500"
              }`}
              placeholder="Nome do Evento"
            />
            <button
              type="button"
              className="p-2 rounded bg-gray-200 hover:bg-gray-300 transition-colors cursor-pointer"
              title={isEditing ? "Salvar Nome" : "Editar Nome"}
              onClick={handleEditOrSave}
            >
              {isEditing ? (
                // Ícone de check
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-gray-600 all-transition"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 00-1.414 0L8 12.586 4.707 9.293a1 1 0 00-1.414 1.414l4 4a1 1 0 001.414 0l8-8a1 1 0 000-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : (
                // Ícone de lápis
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-gray-600 all-transition"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M17.414 2.586a2 2 0 00-2.828 0l-9.086 9.086a2 2 0 00-.516.878l-1.414 4.243a1 1 0 001.263 1.263l4.243-1.414a2 2 0 00.878-.516l9.086-9.086a2 2 0 000-2.828zm-2.121 1.415l2.121 2.121-9.086 9.086-2.121-2.121 9.086-9.086z" />
                </svg>
              )}
            </button>
          </div>
        </label>
      </div>
      <hr className="my-4 border-gray-300" />
      <OperacaoUI codigoSala={codigoSala} />
      <hr className="my-4 border-gray-300" />
      <FormSistemaAvalia />
      <hr className="my-4 border-gray-300" />
      <OthersSettingsUI codigoSala={codigoSala} />
      <hr className="my-4 border-gray-300" />
      <DangerZoneUI codigoSala={codigoSala} />
    </div>
  );
}
