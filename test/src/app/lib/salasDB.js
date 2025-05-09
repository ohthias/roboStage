// /app/lib/salasDB.js
import fs from 'fs/promises'
import path from 'path'

const caminhoArquivo = path.join(process.cwd(), '/salas.json')

export async function lerSalas() {
  try {
    const dados = await fs.readFile(caminhoArquivo, 'utf-8')
    return JSON.parse(dados)  // Retorna o objeto de salas
  } catch (error) {
    console.error('Erro ao ler salas:', error)
    return {}  // Retorna um objeto vazio em caso de erro
  }
}

export async function salvarSalas(salas) {
  try {
    await fs.writeFile(caminhoArquivo, JSON.stringify(salas, null, 2))
  } catch (error) {
    console.error('Erro ao salvar salas:', error)
  }
}
