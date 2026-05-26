import ComingSoon from "@/components/ComingSoon";
import Breadcrumbs from "@/components/UI/Breadcrumbs";
import { Footer } from "@/components/UI/Footer";

export default function Page() {
  return (
    <>
      <div className="px-4 md:px-8">
        <Breadcrumbs />

        <section className="space-y-2">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-primary">
            Sharks Simulator
          </h1>
          <p className="text-base md:text-lg text-base-content/80 max-w-3xl leading-relaxed">
            Simule visualmente as trajetórias para robôs da FLL. Defina
            movimentos retos e giros, visualizando a trajetória resultante sobre
            o tapete de competição.
          </p>
        </section>

        <div className="flex justify-center mt-8 mb-16">
          <ComingSoon />
        </div>
      </div>
      <Footer />
    </>
  );
}
