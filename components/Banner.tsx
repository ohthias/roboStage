export default function Banner() {
  return (
    <section className="bg-light-smoke lg:grid lg:h-screen lg:place-content-center">
      <div className="mx-auto w-full max-w-screen-xl px-4 py-16 sm:px-6 sm:py-24 md:grid md:grid-cols-2 md:items-center md:gap-4 lg:px-8 lg:py-32">
        <div className="max-w-prose text-left">
          <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl">
            Robo<strong className="text-primary">Stage</strong>
          </h1>

          <p className="mt-4 text-base text-pretty text-gray-700 sm:text-lg/relaxed">
            Crie micro eventos inspirado na First LEGO League, avalie equipes e
            faça a contagem de pontos de forma simples e rápida.
          </p>

          <div className="mt-4 flex gap-4 sm:mt-6">
            <a
              className="inline-block rounded border border-primary bg-primary px-5 py-3 font-medium text-light shadow-sm transition-colors hover:bg-primary-dark"
              href="/create-room"
            >
              Criar
            </a>

            <a
              className="inline-block rounded border border-gray-200 px-5 py-3 font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray hover:text-gray-900"
              href="/enter"
            >
              Entrar
            </a>
          </div>
        </div>
        <img
          src="https://static.wixstatic.com/media/3a1650_a7d1c334024840d8b642e62d02ebdaaf~mv2.gif"
          alt="Banner"
          className="mx-auto hidden w-80 text-gray-900 md:block"
        />
      </div>
    </section>
  );
}
