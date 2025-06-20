import { useState } from "react";

export default function FormSistemaAvalia() {
  const [ativarAvaliacao, setAtivarAvaliacao] = useState(false);
  const [formatoAvaliacao, setFormatoAvaliacao] = useState("oficial");
  const [arquivo, setArquivo] = useState<File | null>(null);
  const [avaliacaoProjetoInovacao, setAvaliacaoProjetoInovacao] =
    useState(false);
  const [avaliacaoDesignRobo, setAvaliacaoDesignRobo] = useState(false);
  const [interligarAvaliacoes, setInterligarAvaliacoes] = useState(false);

  let fichas =
    formatoAvaliacao === "personalizado"
      ? document.querySelectorAll('[placeholder^="Título da Avaliação"]')
          .length || 1
      : Number(avaliacaoDesignRobo) + Number(avaliacaoProjetoInovacao);

  return (
    <div className="mb-6">
      <h2 className="text-2xl font-semibold text-primary-dark">
        Sistema de avaliação
      </h2>
      <p className="mb-4 text-gray-500">
        Adicione/configure o sistema de avaliação de fichas ao seu evento. Ao
        adicionar, todas as equipes deverão ser avaliadas com base em critérios
        estabelecidos, num sistema de "Avaliação de Sala". Você pode optar pelo
        formato da FIRST LEGO League ou personalizado, e definir se deseja
        interligar as avaliações para geração do cronograma (caso a função esteja ativada).
      </p>
      <form className="p-4 py-2 max-w-full flex flex-col gap-4">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            className="accent-primary h-4 w-4 rounded border-gray-300"
            checked={ativarAvaliacao}
            onChange={(e) => setAtivarAvaliacao(e.target.checked)}
          />
          Deseja acionar sistema de avaliação de sala?
        </label>

        {ativarAvaliacao && (
          <>
            <label className="flex flex-col gap-1 font-medium text-gray-700">
              Formato de avaliação:
              <select
                className="form-select mt-1 px-3 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-light transition bg-white"
                value={formatoAvaliacao}
                onChange={(e) => setFormatoAvaliacao(e.target.value)}
              >
                <option value="oficial">Formato FIRST LEGO League</option>
                <option value="personalizado">Personalizado</option>
              </select>
            </label>

            {formatoAvaliacao === "oficial" && (
              <>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    className="accent-primary h-4 w-4 rounded border-gray-300"
                    checked={avaliacaoProjetoInovacao}
                    onChange={(e) =>
                      setAvaliacaoProjetoInovacao(e.target.checked)
                    }
                  />
                  Haverá avaliação do projeto de inovação?
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    className="accent-primary h-4 w-4 rounded border-gray-300"
                    checked={avaliacaoDesignRobo}
                    onChange={(e) => setAvaliacaoDesignRobo(e.target.checked)}
                  />
                  Haverá avaliação do design do robô?
                </label>
              </>
            )}

            {formatoAvaliacao === "personalizado" && (
              <>
                <div className="flex items-center gap-2 mb-2">
                  <button
                    type="button"
                    className="bg-primary-light hover:bg-primary-dark text-white font-bold py-2 px-4 rounded transition-colors cursor-pointer w-max md:w-auto"
                    onClick={() => {
                      const modelo =
                        "# Modelo de Avaliação\n\n- Critério 1\n- Critério 2\n";
                      const blob = new Blob([modelo], {
                        type: "text/markdown",
                      });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement("a");
                      a.href = url;
                      a.download = "modelo-avaliacao.md";
                      document.body.appendChild(a);
                      a.click();
                      document.body.removeChild(a);
                      URL.revokeObjectURL(url);
                    }}
                  >
                    Baixar modelo (.md)
                  </button>
                  <span className="text-sm text-gray-500">
                    Baixe um modelo de avaliação para personalizar.
                  </span>
                </div>
                <AvaliacoesPersonalizadasForm />
              </>
            )}

            <VisualizarFichaButton
              formatoAvaliacao={formatoAvaliacao}
              arquivo={arquivo}
            />
          </>
        )}
        {/* Contador de fichas de avaliação e tempo total */}
        {ativarAvaliacao && (
          <>
            {avaliacaoProjetoInovacao && avaliacaoDesignRobo && (
              <label className="flex items-center gap-2">
              <input
                type="checkbox"
                className="accent-primary h-4 w-4 rounded border-gray-300"
                id="interligar-avaliacoes"
                checked={interligarAvaliacoes}
                onChange={(e) => setInterligarAvaliacoes(e.target.checked)}
                />
              As avaliações serão interligadas? (Desmarque para avaliações
              separadas)
            </label>
            )}

            <label className="flex flex-col gap-1 font-medium text-gray-700">
              Tempo de avaliação por ficha (em minutos):
              <input
                type="number"
                min={1}
                className="form-input mt-1 px-3 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-light transition"
                placeholder="Ex: 5"
                id="tempo-avaliacao"
                // Adicione um estado para armazenar essa opção se necessário
              />
            </label>

            <label className="flex flex-col gap-1 font-medium text-gray-700">
              Tempo de perguntas e respostas (em minutos):
              <input
                type="number"
                min={1}
                className="form-input mt-1 px-3 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-light transition"
                placeholder="Ex: 5"
                id="tempo-perguntas"
                // Adicione um estado para armazenar essa opção se necessário
              />
            </label>

            <label className="flex flex-col gap-1 font-medium text-gray-700">
              Tempo de pós avaliação (em minutos):
              <input
                type="number"
                min={1}
                className="form-input mt-1 px-3 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-light transition"
                placeholder="Ex: 5"
                id="tempo-pos-avaliacao"
                // Adicione um estado para armazenar essa opção se necessário
              />
            </label>
            <div className="flex flex-col gap-2 bg-gray-50 rounded p-3 border border-gray-200">
              <span className="font-medium text-gray-700">
                {formatoAvaliacao === "personalizado"
                  ? `Total de fichas de avaliação: ${
                      document.querySelectorAll(
                        '[placeholder^="Título da Avaliação"]'
                      ).length || 1
                    }`
                  : `Total de fichas de avaliação: ${fichas}`}
              </span>
              {(() => {
                const tempoAvaliacao = Number(
                  (
                    document.querySelector(
                      "#tempo-avaliacao"
                    ) as HTMLInputElement
                  )?.value || 0
                );
                const tempoPerguntas = Number(
                  (
                    document.querySelector(
                      "#tempo-perguntas"
                    ) as HTMLInputElement
                  )?.value || 0
                );
                const tempoPos = Number(
                  (
                    document.querySelector(
                      "#tempo-pos-avaliacao"
                    ) as HTMLInputElement
                  )?.value || 0
                );

                let tempoTotal = 0;
                if (interligarAvaliacoes) {
                  tempoTotal =
                    (tempoAvaliacao + tempoPerguntas + tempoPos) * fichas;
                } else {
                  tempoTotal = tempoAvaliacao + tempoPerguntas + tempoPos;
                }

                return (
                  <span className="text-gray-600 text-sm">
                    Tempo total estimado:{" "}
                    <span className="font-semibold">
                      {tempoTotal > 0
                        ? `${tempoTotal} minutos`
                        : "Preencha os tempos acima"}
                    </span>
                    {interligarAvaliacoes !== undefined &&
                      (interligarAvaliacoes
                        ? " (Avaliações interligadas)"
                        : " (Avaliações separadas /cada ficha)")}
                  </span>
                );
              })()}
            </div>
          </>
        )}

        <button
          type="submit"
          className="mt-4 ml-auto bg-primary-light hover:bg-primary-dark text-white font-bold py-2 px-4 rounded transition-colors cursor-pointer w-max md:w-auto"
        >
          Salvar
        </button>
      </form>
    </div>
  );
}

function VisualizarFichaButton({
  formatoAvaliacao,
  arquivo,
}: {
  formatoAvaliacao: string;
  arquivo: File | null;
}) {
  const handleVisualizar = () => {
    if (formatoAvaliacao === "oficial") {
      alert("Visualizando ficha de avaliação oficial.");
    } else if (formatoAvaliacao === "personalizado" && arquivo) {
      const reader = new FileReader();
      reader.onload = () => {
        const content = reader.result as string;
        alert(`Visualizando ficha personalizada:\n\n${content}`);
      };
      reader.readAsText(arquivo);
    } else {
      alert("Nenhum arquivo para visualizar.");
    }
  };

  return (
    <button
      type="button"
      onClick={handleVisualizar}
      className="mt-4 bg-primary-light hover:bg-primary-dark text-white font-bold py-2 px-4 rounded transition-colors cursor-pointer w-max md:w-auto"
    >
      Visualizar Ficha de Avaliação
    </button>
  );
}

type Ficha = {
  id: number;
  titulo: string;
  arquivo: File | null;
};

function AvaliacoesPersonalizadasForm() {
  const [fichas, setFichas] = useState<Ficha[]>([
    { id: Date.now(), titulo: "", arquivo: null },
  ]);

  const handleTituloChange = (id: number, value: string) => {
    setFichas((prev) =>
      prev.map((ficha) =>
        ficha.id === id ? { ...ficha, titulo: value } : ficha
      )
    );
  };

  const handleArquivoChange = (
    id: number,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0] || null;
    if (file && file.type !== "text/markdown") {
      alert("Por favor, envie um arquivo .md válido.");
      return;
    }
    setFichas((prev) =>
      prev.map((ficha) =>
        ficha.id === id ? { ...ficha, arquivo: file } : ficha
      )
    );
  };

  const handleAddFicha = () => {
    setFichas((prev) => [
      ...prev,
      { id: Date.now() + Math.random(), titulo: "", arquivo: null },
    ]);
  };

  const handleRemoveFicha = (id: number) => {
    setFichas((prev) => prev.filter((ficha) => ficha.id !== id));
  };

  return (
    <div className="flex flex-col gap-4 bg-white rounded-lg shadow p-4 border border-gray-200">
      {fichas.map((ficha, idx) => (
        <div
          key={ficha.id}
          className="flex flex-col gap-2 border-b pb-4 mb-4 last:border-b-0 last:pb-0 last:mb-0"
        >
          <input
            type="text"
            placeholder={`Título da Avaliação ${idx + 1}`}
            className="form-input mt-1 px-3 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-light transition"
            required
            value={ficha.titulo}
            onChange={(e) => handleTituloChange(ficha.id, e.target.value)}
          />
          <label className="flex flex-col gap-1 font-medium text-gray-700">
            Selecione o arquivo de avaliação:
            <input
              type="file"
              accept=".md"
              onChange={(e) => handleArquivoChange(ficha.id, e)}
              className="form-input mt-1 px-3 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-light transition file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-primary-light file:text-white hover:file:bg-primary-dark"
            />
          </label>
          <p className="text-sm text-gray-500 italic">
            O arquivo deve estar no formato{" "}
            <span className="font-semibold">Markdown (.md)</span>.
          </p>
          {fichas.length > 1 && (
            <button
              type="button"
              onClick={() => handleRemoveFicha(ficha.id)}
              className="self-end text-red-500 hover:underline text-sm"
            >
              Remover ficha
            </button>
          )}
        </div>
      ))}
      <button
        type="button"
        onClick={handleAddFicha}
        title="Adicionar Ficha de Avaliação"
        className="mt-2 ml-auto bg-primary-light hover:bg-primary-dark text-white font-bold py-2 px-4 rounded transition-colors cursor-pointer w-fit flex items-center gap-2"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width={20}
          height={20}
          fill="none"
          viewBox="0 0 20 20"
          aria-hidden="true"
        >
          <path
            d="M10 4v12M4 10h12"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        Adicionar Ficha de Avaliação
      </button>
    </div>
  );
}
