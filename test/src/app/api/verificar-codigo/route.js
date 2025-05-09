// /api/verificar-codigo/route.js
import { NextResponse } from 'next/server'
import { lerSalas, salvarSalas } from '@/app/lib/salasDB'

export async function POST(request) {
  try {
    const { codigo, idSala } = await request.json()

    // Lê as salas do arquivo JSON
    const salas = await lerSalas()

    // Verifica se a sala existe
    const sala = salas[idSala]

    if (!sala) {
      return NextResponse.json({ error: 'Sala não encontrada' }, { status: 404 })
    }

    // Verifica o código informado
    if (codigo === sala.visitante) {
      return NextResponse.json({ success: true, role: 'visitante' })
    } else if (codigo === sala.voluntario) {
      return NextResponse.json({ success: true, role: 'voluntario' })
    } else if (codigo === sala.admin) {
      return NextResponse.json({ success: true, role: 'admin' })
    } else {
      return NextResponse.json({ error: 'Código inválido' }, { status: 400 })
    }
  } catch (error) {
    console.error('Erro ao verificar código:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
