import fs from 'fs';
import path from 'path';

const salasFilePath = path.join(process.cwd(), 'salas.json');

export async function PUT({ params, request }) {
  if (!params || !params.id) {
    console.error('ID não fornecido na URL', params);
    return new Response(JSON.stringify({ error: 'ID não fornecido na URL' }), {
      status: 400,
    });
  }

  const { id } = params;
  const dadosAtualizados = await request.json();

  console.log('ID recebido:', id); // Log para verificar se o ID está correto
  console.log('Dados recebidos para atualização:', dadosAtualizados); // Log para depuração

  try {
    // Leitura do arquivo JSON
    const salasData = JSON.parse(fs.readFileSync(salasFilePath, 'utf-8'));
    console.log('Dados carregados do arquivo salas.json:', salasData); // Log dos dados carregados

    // Encontra a sala pelo ID
    const sala = salasData[id]; // Modificado para pegar diretamente pela chave (ID)
    if (!sala) {
      console.error('Sala não encontrada com ID:', id); // Log de erro
      return new Response(JSON.stringify({ error: 'Sala não encontrada' }), {
        status: 404,
      });
    }

    // Agora, encontra a equipe dentro da sala
    const equipeIndex = sala.equipes.findIndex((equipe) => equipe.nomeEquipe === dadosAtualizados.nomeEquipe);
    if (equipeIndex === -1) {
      console.error('Equipe não encontrada com nome:', dadosAtualizados.nomeEquipe); // Log de erro
      return new Response(JSON.stringify({ error: 'Equipe não encontrada' }), {
        status: 404,
      });
    }

    // Atualiza a pontuação da equipe no round selecionado
    const { round, pontos } = dadosAtualizados;  // Exemplo de estrutura de dados
    if (round === 1) {
      sala.equipes[equipeIndex].round1 = pontos;
    } else if (round === 2) {
      sala.equipes[equipeIndex].round2 = pontos;
    } else if (round === 3) {
      sala.equipes[equipeIndex].round3 = pontos;
    }

    // Escreve os dados atualizados no arquivo
    fs.writeFileSync(salasFilePath, JSON.stringify(salasData, null, 2), 'utf-8');
    console.log('Dados atualizados salvos com sucesso.'); // Log de sucesso

    return new Response(JSON.stringify({ sucesso: true }), { status: 200 });
  } catch (error) {
    console.error('Erro ao processar a requisição:', error); // Log de erro detalhado
    return new Response(JSON.stringify({ error: 'Erro ao atualizar equipe' }), {
      status: 500,
    });
  }
}
