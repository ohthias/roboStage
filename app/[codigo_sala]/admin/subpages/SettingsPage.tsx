import React, { useEffect, useState } from "react";
import Mensage from "@/components/Mensage";
import Loader from "@/components/loader";
import OperacaoUI from "@/components/componentsSettings/OpercaoUI";
import DangerZoneUI from "@/components/componentsSettings/DangerZoneUI";
import OthersSettingsUI from "@/components/componentsSettings/OthersSettingsUI";

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
      <div className="flex items-center gap-2 mb-2 h-48 justify-center flex-row bg-gray-100 rounded-lg">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-10 h-10 animate-bounce text-primary-dark"
          viewBox="0 0 64 64"
          fill="currentColor"
          aria-hidden="true"
          xmlSpace="preserve"
        >
          <path d="M32 12.449c.84 1.056 2.125 1.748 3.582 1.748 2.524 0 4.577-2.043 4.577-4.553S38.105 5.09 35.582 5.09c-1.457 0-2.742.692-3.582 1.748-.839-1.056-2.123-1.748-3.578-1.748-2.526 0-4.581 2.043-4.581 4.554s2.055 4.553 4.58 4.553c1.456 0 2.74-.692 3.58-1.748zm3.581-5.36c1.422 0 2.578 1.146 2.578 2.554s-1.156 2.554-2.578 2.554c-1.423 0-2.581-1.145-2.581-2.553s1.158-2.554 2.581-2.554zm-9.74 2.555c0-1.409 1.158-2.554 2.58-2.554C29.844 7.09 31 8.235 31 9.644s-1.157 2.553-2.578 2.553c-1.424 0-2.581-1.145-2.581-2.553z" />
          <path d="M52.49 22.78h-5.013a2.234 2.234 0 0 0-2.223-2.096h-6.54v-2.472a7.196 7.196 0 0 0 5.598-4.274h2.622c1.78 0 3.23-1.449 3.23-3.23V8.319c0-1.78-1.45-3.23-3.23-3.23h-2.748C43.028 2.676 40.566 1 37.714 1H26.286c-2.8 0-5.225 1.615-6.409 3.958h-2.811a3.231 3.231 0 0 0-3.226 3.23v2.392a3.23 3.23 0 0 0 3.226 3.227h2.57a7.197 7.197 0 0 0 5.65 4.407v2.47h-6.54a2.234 2.234 0 0 0-2.223 2.095h-5.012a5.154 5.154 0 0 0-5.149 5.149v2.686a2.465 2.465 0 0 0 2.463 2.462h3.051v7.01a2.324 2.324 0 0 0-1.237 2.047v4.321a2.334 2.334 0 0 0 2.33 2.331h4.446a2.334 2.334 0 0 0 2.331-2.33v-2.06h1.384v11.772c-1.454.423-2.526 1.752-2.526 3.34v1.891c0 .883.72 1.602 1.605 1.602h23.58a1.61 1.61 0 0 0 1.607-1.608v-1.884c0-1.589-1.072-2.918-2.526-3.34V44.394h1.384v2.06a2.334 2.334 0 0 0 2.331 2.33h4.445a2.334 2.334 0 0 0 2.331-2.33v-4.322c0-.888-.505-1.653-1.237-2.046v-7.01h3.051a2.465 2.465 0 0 0 2.463-2.463v-2.686a5.154 5.154 0 0 0-5.149-5.149zM19.14 11.806h-2.074c-.676 0-1.226-.55-1.226-1.227V8.188c0-.678.55-1.23 1.226-1.23h2.15a7.173 7.173 0 0 0-.112 1.223v2.925c0 .236.014.47.036.7zM44.813 7.09h2.121c.678 0 1.23.552 1.23 1.23v2.388c0 .678-.552 1.23-1.23 1.23h-2.086c.002-.015 0-.03.002-.046a7.21 7.21 0 0 0 .046-.786V8.18c0-.33-.03-.651-.074-.969-.005-.04-.003-.082-.009-.122zM21.34 12.568c-.005-.02.002-.04-.004-.059-.01-.03-.031-.063-.043-.094a5.125 5.125 0 0 1-.188-1.309V8.181A5.187 5.187 0 0 1 26.285 3h11.43c2.399 0 4.404 1.648 4.99 3.865.03.115.07.227.092.344.06.316.098.64.098.972v2.925c0 .322-.038.633-.095.939-.016.09-.04.18-.061.269-.547 2.275-2.585 3.977-5.025 3.977H26.286c-2.347 0-4.31-1.58-4.946-3.723zm5.946 5.723h9.428v2.393h-9.428v-2.393zM8.362 30.614v-2.686a3.152 3.152 0 0 1 3.149-3.149h4.998v6.297H8.825a.469.469 0 0 1-.463-.462zm8.147 2.462v6.726h-2.632v-6.726h2.632zm1.237 13.378c0 .18-.151.331-.331.331H12.97a.335.335 0 0 1-.331-.33v-4.322c0-.18.151-.331.33-.331h4.446c.18 0 .331.151.331.33v4.322zM31 56.014h-7.87v-11.62H31v11.62zm-10.396 3.494c0-.823.669-1.493 1.492-1.493H31V61H20.604v-1.492zm22.793 0V61H33v-2.985h8.904c.823 0 1.492.67 1.492 1.493zm-2.527-3.493H33v-11.62h7.87v11.62zm-21.124-13.62v-.262c0-.888-.505-1.652-1.237-2.046V22.922a.24.24 0 0 1 .237-.238h26.508a.24.24 0 0 1 .237.238v17.165a2.324 2.324 0 0 0-1.237 2.046v.262H19.746zm31.615 4.06c0 .179-.151.33-.33.33h-4.446a.335.335 0 0 1-.331-.33v-4.322c0-.18.151-.331.331-.331h4.445c.18 0 .331.151.331.33v4.322zm-1.237-6.653H47.49v-6.726h2.632v6.726zm5.514-9.188c0 .25-.212.462-.463.462h-7.684V24.78h4.998a3.152 3.152 0 0 1 3.149 3.149v2.686z" />
          <path d="M38.602 25.59H25.398c-2.353 0-4.268 1.914-4.268 4.266s1.915 4.267 4.268 4.267h13.205c2.353 0 4.267-1.914 4.267-4.267s-1.914-4.266-4.267-4.266zm0 6.533H25.398c-1.25 0-2.268-1.017-2.268-2.267s1.018-2.266 2.268-2.266h13.205c1.25 0 2.267 1.016 2.267 2.266s-1.017 2.267-2.267 2.267z" />
        </svg>
        <h2 className="text-2xl font-semibold text-gray-400">Em breve...</h2>
      </div>
      <hr className="my-4 border-gray-300" />
      <OthersSettingsUI codigoSala={codigoSala} />
      <hr className="my-4 border-gray-300" />
      <DangerZoneUI codigoSala={codigoSala} />
    </div>
  );
}
