'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { Rocket, Users, Target, BookOpen } from 'lucide-react'

const goals = [
  { label: 'Criar eventos de robótica', icon: Rocket },
  { label: 'Realizar testes e estratégias', icon: Target },
  { label: 'Documentar seus avanços', icon: BookOpen },
]

const roles = [
  'Competidor',
  'Mentor/Técnico',
  'Estudante',
  'Professor',
  'Outro',
]

export default function OnboardingPage() {
  const router = useRouter()

  const { completeOnboarding, loading } =
    useAuth()

  const [fullName, setFullName] =
    useState('')

  const [goal, setGoal] = useState('')
  const [role, setRole] = useState('')

  async function handleSubmit(
    e: React.FormEvent<HTMLFormElement>
  ): Promise<void> {
    e.preventDefault()

    await completeOnboarding({
      full_name: fullName,
      platform_goal: goal,
      user_role: role,
    })

    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-base-100 via-secondary/10 to-base-200">
      <div className="grid min-h-screen w-full lg:grid-cols-[1.05fr_0.95fr]">
        <div className="hidden lg:flex flex-col justify-between bg-base-900 p-10 xl:p-14 text-base-content">
          <div>
            <div className="badge badge-lg badge-outline badge-secondary gap-2">
              RoboStage
            </div>

            <h1 className="mt-4 max-w-lg text-5xl font-bold leading-tight text-secondary">
              Bem-vindo ao seu próximo passo.
            </h1>

            <p className="mt-5 max-w-md text-base leading-7">
              Conte um pouco sobre você para personalizarmos sua experiência.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-center p-6 sm:p-8 lg:p-10 text-base-content">
          <div className="card w-full max-w-xl bg-base-100 shadow-xl border border-base-200">
            <div className="card-body p-6 sm:p-8 lg:p-10 overflow-y-auto max-h-[80vh]">
              <div className="mb-8 lg:hidden">
                <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl text-secondary">
                  Bem-vindo 🚀
                </h1>

                <p className="mt-3 text-sm leading-6 sm:text-base text-base-content">
                  Queremos entender melhor seu perfil.
                </p>
              </div>

              <div className="mb-4 hidden lg:block">
                <h2 className="text-3xl font-bold tracking-tight">
                  Vamos começar
                </h2>
                <p className="mt-2 text-sm leading-6">
                  Preencha as informações abaixo em poucos segundos.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-7">
                <div>
                  <label className="form-control w-full">
                    <div className="label mb-2">
                      <span className="label-text font-medium">Qual seu nome?</span>
                    </div>
                    <input
                      type="text"
                      className="input input-bordered w-full focus:input-primary"
                      placeholder="Seu nome"
                      value={fullName}
                      onChange={(e) =>
                        setFullName(e.target.value)
                      }
                    />
                  </label>
                </div>

                <div>
                  <label className="form-control w-full">
                    <div className="label mb-2">
                      <span className="label-text font-medium">O que deseja fazer?</span>
                    </div>
                    <div className="flex flex-col gap-3">
                      {goals.map((item) => {
                        const Icon = item.icon
                        return (
                          <button
                            key={item.label}
                            type="button"
                            onClick={() => setGoal(item.label)}
                            className={`btn btn-lg justify-start text-left ${
                              goal === item.label
                                ? 'btn-soft btn-primary'
                                : 'btn-soft'
                            }`}
                          >
                            <Icon className="mr-3 h-5 w-5" />
                            {item.label}
                          </button>
                        )
                      })}
                    </div>
                  </label>
                </div>

                <div>
                  <label className="form-control w-full">
                    <div className="label mb-2">
                      <span className="label-text font-medium">Você é:</span>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      {roles.map((item) => (
                        <button
                          key={item}
                          type="button"
                          onClick={() => setRole(item)}
                          className={`btn btn-md ${
                            role === item
                              ? 'btn-soft btn-primary'
                              : 'btn-soft btn-default'
                          }`}
                        >
                          {item}
                        </button>
                      ))}
                    </div>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={
                    loading ||
                    !fullName ||
                    !goal ||
                    !role
                  }
                  className="btn btn-primary btn-lg w-full"
                >
                  {loading ? 'Finalizando...' : 'Continuar'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}