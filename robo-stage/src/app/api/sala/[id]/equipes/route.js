import { NextResponse } from 'next/server'
import { lerSalas, salvarSalas } from '@/app/lib/salasDB'

export async function POST(req, { params }) {
  const { id } = params
  const { equipes } = await req.json()

  try {
    const salas = await lerSalas()

    if (!salas[id]) {
      return NextResponse.json({ error: 'Sala não encontrada' }, { status: 404 })
    }

    salas[id].equipes = equipes

    await salvarSalas(salas)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erro ao salvar equipes:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
