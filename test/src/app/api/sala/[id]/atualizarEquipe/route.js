import fs from "fs";
import path from "path";

const salasFilePath = path.join(process.cwd(), "salas.json");

export async function PUT(request, { params }) {
  const { id } = params;
  if (!params || !params.id) {
    console.error("ID não fornecido na URL", params);
    return new Response(JSON.stringify({ error: "ID não fornecido na URL" }), {
      status: 400,
    });
  }

  const dadosAtualizados = await request.json();

  console.log("ID recebido:", id); // Log para verificar se o ID está correto
  console.log("Dados recebidos para atualização:", dadosAtualizados); // Log para depuração

  try {
    // Leitura do arquivo JSON
    const salasData = JSON.parse(fs.readFileSync(salasFilePath, "utf-8"));
    console.log("Dados carregados do arquivo salas.json:", salasData); // Log dos dados carregados

    // Encontra a sala pelo ID
    const sala = salasData[id]; // Modificado para pegar diretamente pela chave (ID)
    if (!sala) {
      console.error("Sala não encontrada com ID:", id); // Log de erro
      return new Response(JSON.stringify({ error: "Sala não encontrada" }), {
        status: 404,
      });
    }

    // Agora, encontra a equipe dentro da sala
    const equipeIndex = sala.equipes.findIndex(
      (equipe) => equipe.nomeEquipe === dadosAtualizados.nomeEquipe
    );
    if (equipeIndex === -1) {
      console.error(
        "Equipe não encontrada com nome:",
        dadosAtualizados.nomeEquipe
      ); // Log de erro
      return new Response(JSON.stringify({ error: "Equipe não encontrada" }), {
        status: 404,
      });
    }

    // Atualiza o campo do round dinamicamente
    const roundKey = Object.keys(dadosAtualizados).find((k) =>
      k.startsWith("round")
    );
    if (roundKey) {
      sala.equipes[equipeIndex][roundKey] = dadosAtualizados[roundKey];
    } else {
      console.error(
        "Nenhum campo de round encontrado nos dados recebidos:",
        dadosAtualizados
      );
      return new Response(JSON.stringify({ error: "Campo de round ausente" }), {
        status: 400,
      });
    }

    // Escreve os dados atualizados no arquivo
    fs.writeFileSync(
      salasFilePath,
      JSON.stringify(salasData, null, 2),
      "utf-8"
    );
    console.log("Arquivo final salvo:", JSON.stringify(salasData, null, 2));
    console.log("Dados atualizados salvos com sucesso."); // Log de sucesso

    return new Response(JSON.stringify({ sucesso: true }), { status: 200 });
  } catch (error) {
    console.error("Erro ao processar a requisição:", error); // Log de erro detalhado
    return new Response(JSON.stringify({ error: "Erro ao atualizar equipe" }), {
      status: 500,
    });
  }
}
