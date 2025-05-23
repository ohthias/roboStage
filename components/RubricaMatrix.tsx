import React from "react";
import { LinhaCriterio } from "./RubricaTypes";

interface Props {
  titulo: string;
  subtitulo: string;
  linhas: LinhaCriterio[];
  onUpdate: (index: number, nivel: number, comentario?: string) => void;
}

const RubricaMatrix: React.FC<Props> = ({ titulo, subtitulo, linhas, onUpdate }) => {


  return (
    <div className="border overflow-hidden">

      <div className="bg-gray-100 px-4 py-2 text-sm font-semibold border-b">
        {titulo.toUpperCase()} <span className="font-normal">- {subtitulo}</span>
      </div>

      <table className="w-full text-sm">
        <tbody>
          {linhas.map((linha, index) => (
            <tr key={index} className="border-b">
              {linha.descricoes.map((descricao, nivelIndex) => (
                <td key={nivelIndex} className="text-left p-2 border-r last:border-r-0 align-top w-32">
                  <label className="flex items-start gap-2">
                    <input
                      type="radio"
                      name={`${titulo}-${index}`}
                      checked={linha.nivel === nivelIndex + 1}
                      onChange={() => onUpdate(index, nivelIndex + 1)}
                    />
                    <span>{descricao}</span>
                    {linha.nivel === 4 && nivelIndex === 3 && (
                      <span role="img" aria-label="engrenagem">⚙️</span>
                    )}
                  </label>
                  {linha.nivel === 4 && nivelIndex === 3 && (
                    <textarea
                      placeholder="Comentário (excelente)"
                      className="w-full mt-2 border rounded p-1 text-xs"
                      onChange={(e) => onUpdate(index, 4, e.target.value)}
                      value={linha.comentario || ""}
                    />
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default RubricaMatrix;
