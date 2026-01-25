import Breadcrumbs from "@/components/UI/Breadcrumbs";
import { Footer } from "@/components/UI/Footer";
import { Navbar } from "@/components/UI/Navbar";

export default function PlanejadorDeAnexosPage() {
  return (
    <div>
      <Navbar />
      <div className="px-4 md:px-8">
        <Breadcrumbs />

        <section className="space-y-2">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-primary">
            Planejador de Anexos
          </h1>
          <p className="text-base md:text-lg text-base-content/80 max-w-3xl leading-relaxed">
            Organize estrategicamente os anexos do robô, relacionando missões,
            rodadas, risco operacional e tempo de troca.
          </p>
        </section>

        <div className="flex justify-center mt-8 mb-16">
          <div className="w-full h-64 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg">
            <span className="text-gray-500">
              Em breve, esta funcionalidade estará disponível.
            </span>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
