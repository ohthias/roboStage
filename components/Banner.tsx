export default function Banner() {
  return (
    <section className="bg-light-smoke lg:grid lg:h-screen">
      <div className="mx-auto w-full max-w-screen-xl px-10 py-16 sm:px-6 sm:py-24 md:grid md:grid-cols-2 md:items-center md:gap-4 lg:px-2 lg:py-32">
        <div className="max-w-prose text-left">
          <h1 className="text-3xl font-bold text-zinc-900 sm:text-5xl lg:text-8xl">
            Robo<strong className="text-primary">Stage</strong>
          </h1>

          <p className="mt-4 text-base text-pretty text-zinc-700 sm:text-lg/relaxed lg:text-xl">
            Facilitando sua jornada na robótica.
          </p>

          <div className="mt-4 flex gap-4 sm:mt-6">
            
          </div>
        </div>
        <img
          src="https://static.wixstatic.com/media/381ad3_dca9f615988c479ca24a9b0b0e5bc1b0~mv2.gif"
          alt="Banner"
          className="mx-auto hidden text-gray-900 md:block w-full max-w-md"
        />
      </div>
    </section>
  );
}
