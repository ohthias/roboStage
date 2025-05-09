'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function NovaSala() {
  const [nomeSala, setNomeSala] = useState('')  // Estado para o nome da sala
  const [sala, setSala] = useState(null)
  const router = useRouter()

  const handleNomeChange = (e) => {
    setNomeSala(e.target.value)  // Atualiza o nome da sala conforme o usuário digita
  }

  const criarSala = async () => {
    if (!nomeSala) {
      alert('Por favor, forneça o nome da sala!')  // Verificação simples para garantir que o nome da sala foi inserido
      return
    }

    try {
      const res = await fetch('/api/criar-sala', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ nome: nomeSala })  // Envia o nome da sala na requisição
      })

      if (!res.ok) {
        throw new Error('Network response was not ok')
      }

      const data = await res.json()
      setSala(data)

      // Redirecionando para a página de administração da sala com os códigos de acesso e o nome da sala
      router.push(`/sala/${data.idSala}/admin?visitante=${data.codigoVisitante}&voluntario=${data.codigoVoluntario}&admin=${data.codigoAdmin}&nome=${data.nome}`)
    } catch (error) {
      console.error('Error creating room:', error)
    }
  }

  return (
    <div>
      <h1>Criar Nova Sala</h1>
      
      {/* Campo de input para o nome da sala */}
      <input
        type="text"
        placeholder="Nome da sala"
        value={nomeSala}
        onChange={handleNomeChange}
      />
      <button onClick={criarSala}>Criar Sala</button>
    </div>
  )
}
