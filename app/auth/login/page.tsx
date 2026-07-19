export default function LoginPage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-muted p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-4xl">
        <div className="flex flex-col gap-6">
          <div className="card bg-base-100 shadow-xl overflow-hidden">
            <div className="grid md:grid-cols-2">
              <form className="p-6 md:p-8">
                <div className="space-y-6">
                  <div className="text-center">
                    <h1 className="text-2xl font-bold">Bem-vindo de volta!</h1>
                    <p className="text-base-content/70">
                      Logue-se na sua conta para continuar.
                    </p>
                  </div>

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
                    <div className="flex items-center justify-between">
                      <legend className="fieldset-legend">Senha</legend>
                      <a href="#" className="link link-hover text-sm">
                        Esqueceu sua senha?
                      </a>
                    </div>

                    <input
                      type="password"
                      className="input input-bordered w-full"
                      required
                    />
                  </fieldset>

                  <button type="submit" className="btn btn-primary w-full">
                    Login
                  </button>
                  <div className="divider" />
                  <p className="text-center text-sm text-base-content/70">
                    Não tem uma conta?{" "}
                    <a href="/auth/signup" className="link link-primary">
                      Cadastre-se
                    </a>
                  </p>
                </div>
              </form>

              <div className="relative hidden bg-base-200 md:block">
                <img
                  src="/placeholder.svg"
                  alt="Image"
                  className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
                />
              </div>
            </div>
          </div>

          <p className="px-6 text-center text-sm text-base-content/70">
            Ao clicar em continuar, você concorda com nossos{" "}
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
