export default function Banner() {
  return (
    <section className="bg-light-smoke lg:grid lg:h-screen lg:place-content-center">
      <div className="mx-auto w-full max-w-screen-xl px-10 py-16 sm:px-6 sm:py-24 md:grid md:grid-cols-2 md:items-center md:gap-4 lg:px-10 lg:py-32">
        <div className="max-w-prose text-left">
          <h1 className="text-4xl font-bold text-zinc-900 sm:text-5xl">
            Robo<strong className="text-primary">Stage</strong>
          </h1>

          <p className="mt-4 text-base text-pretty text-zinc-700 sm:text-lg/relaxed">
            Facilitando sua jornada na robótica.
          </p>

          <div className="mt-4 flex gap-4 sm:mt-6">
            <a
              className="inline-block rounded border border-primary bg-red-600 px-5 py-2 font-medium text-light shadow-sm transition-colors hover:bg-red-700"
              href="/create-room"
            >
              Criar evento
            </a>

            <a
              className="inline-block text-medium px-5 py-2 bg-white text-gray-700 border border-gray-700 rounded hover:bg-gray-200 hover:border-gray-400 transition cursor-pointer"
              href="/enter"
            >
              Entrar
            </a>
          </div>
        </div>
        <img
          src="/robo.gif"
          alt="Banner"
          className="mx-auto hidden w-150 text-gray-900 md:block"
        />
      </div>
    </section>
  );
}
