'use client'
import { useSearchParams } from 'next/navigation'

export default function SalaAdmin({ params }) {
  const searchParams = useSearchParams()
  const visitante = searchParams.get('visitante')
  const voluntario = searchParams.get('voluntario')
  const admin = searchParams.get('admin')
  const id = params.id

  // Buscar o nome da sala do localStorage ou de outro lugar onde você armazenou
  const nomeSala = searchParams.get('nome')  // Esperamos que o nome da sala esteja na URL

  return (
    <div>
      <h1>Administração da Sala {id}</h1>
      <p><strong>Nome da Sala:</strong> {nomeSala}</p>  {/* Exibe o nome da sala */}
      <p><strong>Código do Visitante:</strong> {visitante}</p>
      <p><strong>Código do Voluntário:</strong> {voluntario}</p>
      <p><strong>Código do Admin:</strong> {admin}</p>

      {/* Adicionando um botão para sair */}
      <button onClick={() => window.location.href = '/sala'}>Sair da Sala</button>
    </div>
  )
}
