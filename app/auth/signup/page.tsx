export default function RegisterPage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-muted p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-4xl">
        <div className="flex flex-col gap-6">
          <div className="card bg-base-100 shadow-xl overflow-hidden">
            <div className="grid md:grid-cols-2">
              <form className="p-6 md:p-8">
                <div className="space-y-6">
                  <div className="text-center">
                    <h1 className="text-2xl font-bold">Crie sua conta</h1>
                    <p className="text-base-content/70">
                      Junte-se ao RoboStage e comece a usar a plataforma
                    </p>
                  </div>

                  <fieldset className="fieldset">
                    <legend className="fieldset-legend">Username</legend>
                    <input
                      type="text"
                      placeholder="Digite seu nome de usuário"
                      className="input input-bordered w-full"
                      required
                    />
                  </fieldset>

                  <fieldset className="fieldset">
                    <legend className="fieldset-legend">Email</legend>
                    <input
                      type="email"
                      placeholder="Digite seu email"
                      className="input input-bordered w-full"
                      required
                    />
                  </fieldset>

                  <fieldset className="fieldset">
                    <legend className="fieldset-legend">Senha</legend>
                    <input
                      type="password"
                      placeholder="••••••••"
                      className="input input-bordered w-full"
                      required
                    />
                  </fieldset>

                  <fieldset className="fieldset">
                    <legend className="fieldset-legend">Confirmar Senha</legend>
                    <input
                      type="password"
                      placeholder="••••••••"
                      className="input input-bordered w-full"
                      required
                    />
                  </fieldset>

                  <button type="submit" className="btn btn-primary w-full">
                    Crie sua conta
                  </button>

                  <div className="divider" />

                  <p className="text-center text-sm text-base-content/70">
                    Já tem uma conta?{" "}
                    <a href="/auth/login" className="link link-primary">
                      Entrar
                    </a>
                  </p>
                </div>
              </form>

              <div className="relative hidden bg-base-200 md:block">
                <img
                  src="/placeholder.svg"
                  alt="Register"
                  className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
                />
              </div>
            </div>
          </div>

          <p className="px-6 text-center text-sm text-base-content/70">
            Ao criar uma conta, você concorda com nossos{" "}
            <a href="#" className="link">
              Termos de Serviço
            </a>{" "}
            e{" "}
            <a href="#" className="link">
              Política de Privacidade
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
