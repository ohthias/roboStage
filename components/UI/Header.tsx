export default function Header({type, name, highlight, description} : {type: string; name: string; highlight: string; description: string}) {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-base-200 bg-gradient-to-br from-base-100 via-base-100 to-base-200/40">
      {/* Decorative grid */}
      <div className="absolute inset-0 opacity-[0.04] bg-[linear-gradient(to_right,theme(colors.base-content)_1px,transparent_1px),linear-gradient(to_bottom,theme(colors.base-content)_1px,transparent_1px)] bg-[size:24px_24px]" />

      <div className="relative px-6 py-12 md:px-12 md:py-16">
        <div className="max-w-3xl">
          <span className="inline-block mb-4 rounded-full border border-primary/30 bg-primary/10 px-4 py-1 text-sm font-medium text-primary">
            RoboStage · {type}
          </span>

          <h1 className="text-4xl md:text-5xl font-bold tracking-tight leading-tight">
            {name} <br />
            <span className="text-primary">{highlight}</span>
          </h1>

          <p className="mt-4 text-base-content/70 max-w-xl">
            {description}
          </p>
        </div>
      </div>
    </section>
  );
}
