'use client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function EntradaSala() {
  const router = useRouter()
  const [codigo, setCodigo] = useState('')
  const [erro, setErro] = useState('')

  const entrar = async () => {
    setErro('')

    const res = await fetch('/api/verificar-codigo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ codigo }),
    })

    if (res.ok) {
      const { id, tipo } = await res.json()
      router.push(`/sala/${id}/${tipo}`)
    } else {
      const err = await res.text()
      setErro(err)
    }
  }

  return (
    <div>
      <h1>Digite seu código de acesso</h1>
      <input
        value={codigo}
        onChange={(e) => setCodigo(e.target.value)}
        placeholder="Código"
      />
      <button onClick={entrar}>Entrar</button>
      {erro && <p style={{ color: 'red' }}>{erro}</p>}
    </div>
  )
}
