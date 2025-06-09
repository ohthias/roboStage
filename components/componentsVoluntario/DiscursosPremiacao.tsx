import { useEffect, useState } from "react";
import Loader from "../loader";

interface Premio {
  equipePremiada: string;
  nome: string;
  descricao: string;
  discurso: string;
}

interface DiscursosPremiacaoProps {
  codigo_sala: string;
}

export default function DiscursosPremiacao({
  codigo_sala,
}: DiscursosPremiacaoProps) {
  const [premios, setPremios] = useState<Premio[]>([]);
  const [enviando, setEnviando] = useState(false);
  const [discursosPadroes, setDiscursosPadroes] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [equipes, setEquipes] = useState<Equipe[]>([]);

  interface Equipe {
    nome_equipe: string;
    [key: string]: any;
  }

  useEffect(() => {
    setLoading(true);

    async function fetchEquipes() {
      try {
        const response = await fetch(`/rooms/${codigo_sala}/get/`);
        const data = await response.json();
        if (data.teams) {
          setEquipes(data.teams || []);
        } else {
          console.error("Nenhuma equipe encontrada.");
        }
      } catch (error) {
        console.error("Erro ao carregar equipes:", error);
      }
    }

    fetchEquipes();

    async function fetchData() {
      try {
        const premiosPromise = fetch(`/rooms/${codigo_sala}/others/`).then(
          (res) => res.json()
        );
        const discursosPromise = fetch("/data/discursos.json").then((res) =>
          res.json()
        );

        const [premiosResponse, discursosData] = await Promise.all([
          premiosPromise,
          discursosPromise,
        ]);

        const premiosBrutos = premiosResponse.dados_extras.premios || [];
        const premiosLimpos: Premio[] = premiosBrutos
          .flatMap((item: any) =>
            Array.isArray(item.premios) ? item.premios : [item]
          )
          .map((p: any) => ({
            nome: p.nome || "",
            descricao: p.descricao || "",
            discurso: p.discurso || "",
            equipePremiada: p.equipePremiada || "",
          }));
        setPremios(premiosLimpos);
        setDiscursosPadroes(discursosData || []);
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [codigo_sala]);

  const handleDiscursoChange = (index: number, value: string) => {
    const novos = [...premios];
    novos[index].discurso = value;
    setPremios(novos);
  };

  const enviarDiscursos = async () => {
    setEnviando(true);
    setLoading(true);
    try {
      const payload = {
        premios: premios.map(
          ({ nome, descricao, discurso, equipePremiada }) => ({
            nome,
            descricao,
            discurso,
            equipePremiada,
          })
        ),
      };

      const response = await fetch(`/rooms/${codigo_sala}/others/premios/`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Erro ao salvar discursos.");
      }

      alert("Discursos salvos com sucesso!");
    } catch (error) {
      console.error(error);
      alert("Erro ao salvar discursos.");
    } finally {
      setEnviando(false);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50 backdrop-blur-sm">
        <Loader />
      </div>
    );
  }

  return (
    <div className="flex flex-col justify-center w-full h-full p-4 px-16 mt-4">
      <p className="text-sm text-gray-600 max-w-2/1 text-left">
        Aqui você pode registrar os discursos de premiação e ver as equipes
        premiadas. Use os botões para adicionar um discurso pronto, ou escreva o
        seu próprio.
      </p>
      <p className="text-sm mb-3 text-gray-600 max-w-2/1 text-left">
        Em seguida, você pode selecionar a equipe premiada para cada prêmio.
      </p>
      <p className="text-md mb-3 text-details-primary">Atenção: o envio só pode ser feito após a deliberação das avaliações realizadas.</p>

      <div>
        <li className="mb-10 flex flex-col gap-2 bg-gray-100 p-4 rounded shadow">
          <p className="text-gray-600 font-bold">Modelo</p>
          <p>
            <strong className="text-details-primary">Nome do premio:</strong>{" "}
            descrição do premio
          </p>
          <div className="flex flex-wrap gap-2">
            {discursosPadroes.map((texto, idx) => (
              <button
                key={idx}
                className="cursor-not-allowed px-3 py-1 rounded bg-light-smoke hover:bg-gray-200 border border-gray-300 text-sm transition colors duration-200 focus:outline-none focus:ring-2 focus:ring-secondary-details"
                title={`Usar discurso ${idx + 1}`}
                disabled={true}
              >
                {["✨", "💡", "🎉", "🔥", "🤝"][idx] || "🗨️"}
              </button>
            ))}
          </div>

          <textarea
            className="cursor-not-allowed border border-gray-300 rounded p-2 mt-1 bg-white text-foreground focus:outline-none focus:ring-2 focus:ring-secondary-details transition-colors duration-200 focus:border-transparent w-auto"
            rows={2}
            placeholder="Digite seu discurso aqui..."
            readOnly={true}
            disabled
          ></textarea>

          <div className="flex items-start gap-2 flex-col w-full">
            <label className="text-sm text-gray-600">
              Selecione a equipe premiada:
            </label>
            <select disabled className="cursor-not-allowed w-full border border-gray-300 rounded p-2 mt-1 bg-white text-foreground focus:outline-none focus:ring-2 focus:ring-secondary-details transition-colors duration-200 focus:border-transparent w-auto">
              <option value="" disabled>
                Selecione a equipe
              </option>
            </select>
          </div>
        </li>
      </div>
      {premios.length > 0 && (
        <div className="flex flex-col items-center justify-start animate-fade-in w-full">
          <ul className="w-full list-none">
            {premios.map((premio, index) => (
              <li
                key={index}
                className="mb-10 flex flex-col gap-2 bg-white p-4 rounded shadow"
              >
                <p>
                  <strong className="text-details-primary">
                    {premio.nome}:
                  </strong>{" "}
                  {premio.descricao}
                </p>
                <div className="flex flex-wrap gap-2">
                  {discursosPadroes.map((texto, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleDiscursoChange(index, texto)}
                      className="px-3 py-1 rounded bg-light-smoke hover:bg-gray-200 border border-gray-300 text-sm transition colors duration-200 focus:outline-none focus:ring-2 focus:ring-secondary-details cursor-pointer"
                      title={`Usar discurso ${idx + 1}`}
                    >
                      {["✨", "💡", "🎉", "🔥", "🤝"][idx] || "🗨️"}
                    </button>
                  ))}
                </div>

                <textarea
                  className="border border-gray-300 rounded p-2 mt-1 bg-white text-foreground focus:outline-none focus:ring-2 focus:ring-secondary-details transition-colors duration-200 focus:border-transparent w-auto"
                  name={`discurso_${index}`}
                  rows={4}
                  placeholder="Digite seu discurso aqui..."
                  value={premio.discurso}
                  onChange={(e) => handleDiscursoChange(index, e.target.value)}
                ></textarea>

                <div className="flex items-start gap-2 flex-col w-full">
                  <label className="text-sm text-gray-600">
                    Selecione a equipe premiada:
                  </label>
                  <select
                    className="w-full border border-gray-300 rounded p-2 mt-1 bg-white text-foreground focus:outline-none focus:ring-2 focus:ring-secondary-details transition-colors duration-200 focus:border-transparent w-auto"
                    value={premio.equipePremiada || ""}
                    onChange={(e) => {
                      const novos = [...premios];
                      novos[index].equipePremiada = e.target.value;
                      setPremios(novos);
                    }}
                  >
                    <option value="" disabled>
                      Selecione a equipe
                    </option>
                    {equipes.map((equipe, idx) => (
                      <option key={idx} value={equipe.nome_equipe}>
                        {equipe.nome_equipe}
                      </option>
                    ))}
                  </select>
                </div>
              </li>
            ))}
          </ul>
          <div className="mt-4">
            <button
              onClick={enviarDiscursos}
              disabled={enviando}
              className="bg-details-primary text-white px-4 py-2 rounded hover:bg-primary transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50 cursor-pointer disabled:opacity-50"
            >
              {enviando ? "Enviando..." : "Salvar Discursos"}
            </button>
          </div>
        </div>
      )}
      {premios.length === 0 && (
        <div className="flex items-center justify-center w-full h-full p-4">
          <p className="text-gray-500">Nenhum prêmio encontrado.</p>
        </div>
      )}
    </div>
  );
}
