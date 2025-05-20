import React, { useEffect, useState } from "react";
import RubricaMatrix from "./RubricaMatrix";
import { RubricaJson, LinhaCriterio } from "./RubricaTypes";

const RubricaForm: React.FC = () => {
  const [rubrica, setRubrica] = useState<RubricaJson | null>(null);

  useEffect(() => {
    fetch("/data/avaliacaoProjeto.json")
      .then((res) => {
        if (!res.ok) {
          throw new Error("Erro ao buscar as missões");
        }
        return res.json();
      })
      .then((data) => {
        setRubrica(data);
      })
      .catch((error) => {
        console.error("Erro:", error);
      });
  }, []);

  const handleUpdate = (
    secaoKey: string,
    linhaIndex: number,
    nivel: number,
    comentario?: string
  ) => {
    setRubrica((prev) => {
      if (!prev) return prev;

      const novaSecao = { ...prev[secaoKey] };
      const novasLinhas = [...novaSecao.linhas];
      novasLinhas[linhaIndex] = {
        ...novasLinhas[linhaIndex],
        nivel,
        comentario,
      };

      return {
        ...prev,
        [secaoKey]: { ...novaSecao, linhas: novasLinhas },
      };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rubrica) {
      console.log("Rubrica enviada:", rubrica);
      // Aqui você pode adicionar envio via API ou salvar localmente
      // ex: localStorage.setItem("rubrica", JSON.stringify(rubrica));
    }
  };

  const headers = [
    "FASE INICIAL\n1",
    "EM DESENVOLVIMENTO\n2",
    "FINALIZADO\n3",
    "EXCEDENTE\n4\nDe que maneiras a equipe demonstrou excelência?",
  ];
  const headerColors = [
    "bg-blue-100",
    "bg-blue-200",
    "bg-blue-300",
    "bg-blue-400",
  ];

  if (!rubrica) {
    return <div className="p-4 text-gray-500">Carregando rubrica...</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="p-4">
      <h2 className="text-blue-700 font-bold text-lg">
        Rubrica Projeto de Inovação
      </h2>
      <div className="flex">
        {headers.map((label, i) => (
          <div
            key={i}
            className={`${headerColors[i]} text-xs text-center font-bold p-2 flex-1 whitespace-pre-line border-r last:border-r-0`}
          >
            {label}
          </div>
        ))}
      </div>
      {Object.entries(rubrica).map(([key, secao]) => (
        <RubricaMatrix
          key={key}
          titulo={secao.titulo}
          subtitulo={secao.subtitulo}
          linhas={secao.linhas}
          onUpdate={(index, nivel, comentario) =>
            handleUpdate(key, index, nivel, comentario)
          }
        />
      ))}
      <button
        type="submit"
        className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
      >
        Enviar Rubrica
      </button>
    </form>
  );
};

export default RubricaForm;
