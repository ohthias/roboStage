'use client'
import Equipes from '@/app/components/Equipes'
import { useEffect, useState } from 'react'

export default function SalaAdmin({ params }) {
  const [sala, setSala] = useState(null)
  const [carregando, setCarregando] = useState(true)
  const id = params.id

  useEffect(() => {
    const fetchSala = async () => {
      try {
        const res = await fetch(`/api/sala/${id}`)
        if (!res.ok) {
          throw new Error('Sala não encontrada')
        }
        const data = await res.json()
        setSala(data)
      } catch (err) {
        console.error(err)
      } finally {
        setCarregando(false)
      }
    }

    fetchSala()
  }, [id])

  if (carregando) {
    return <p>Carregando dados da sala...</p>
  }

  if (!sala) {
    return <p>Erro: Sala não encontrada</p>
  }

  return (
    <div>
      <h1>Administração da Sala {id}</h1>
      <p><strong>Nome da Sala:</strong> {sala.nome}</p>
      <p><strong>Código do Visitante:</strong> {sala.visitante}</p>
      <p><strong>Código do Voluntário:</strong> {sala.voluntario}</p>
      <p><strong>Código do Admin:</strong> {sala.admin}</p>

      <Equipes idSala={id} />
      <button onClick={() => window.location.href = '/'}>Sair da Sala</button>
    </div>
  )
}
