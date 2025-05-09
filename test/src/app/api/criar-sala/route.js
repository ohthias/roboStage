// /api/criar-sala.js
import { gerarCodigoAleatorio } from '@/app/lib/utils'
import { salvarSalas, lerSalas } from '@/app/lib/salasDB'
import { NextResponse } from 'next/server'

export async function POST(req, res) {
  try {
    const { nome } = await req.json()  // Obtém o nome da sala enviado no corpo da requisição
    const idSala = gerarCodigoAleatorio(3)
    const codigoVisitante = idSala + gerarCodigoAleatorio(3)
    const codigoVoluntario = idSala + gerarCodigoAleatorio(3)
    const codigoAdmin = idSala + gerarCodigoAleatorio(3)

    // Lê as salas existentes
    const salas = await lerSalas()

    // Cria a nova sala
    salas[idSala] = {
      nome,  // Armazena o nome da sala
      visitante: codigoVisitante,
      voluntario: codigoVoluntario,
      admin: codigoAdmin
    }

    // Salva as salas atualizadas no arquivo
    await salvarSalas(salas)

    // Retorna a resposta com os dados da sala
    return NextResponse.json({
      idSala,
      nome,
      codigoVisitante,
      codigoVoluntario,
      codigoAdmin
    })
  } catch (error) {
    console.error('Error creating room:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
