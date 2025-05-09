import { NextResponse } from 'next/server'
import { lerSalas } from '@/app/lib/salasDB'

export async function POST(request) {
  try {
    const { codigo } = await request.json()

    const salas = await lerSalas()
    let salaEncontrada = null
    let role = null
    let idSala = null

    for (const id in salas) {
      const sala = salas[id]
      if (codigo === sala.visitante) {
        salaEncontrada = sala
        role = 'visitante'
        idSala = id
        break
      } else if (codigo === sala.voluntario) {
        salaEncontrada = sala
        role = 'voluntario'
        idSala = id
        break
      } else if (codigo === sala.admin) {
        salaEncontrada = sala
        role = 'admin'
        idSala = id
        break
      }
    }

    if (!salaEncontrada) {
      return NextResponse.json({ error: 'Código inválido' }, { status: 404 })
    }

    return NextResponse.json({ success: true, role, id: idSala }) // <-- corrigido aqui
  } catch (error) {
    console.error('Erro ao verificar código:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}