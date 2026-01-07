import { MonitorSmartphone } from "lucide-react";
import { Footer } from "./UI/Footer";
import { Navbar } from "./UI/Navbar";
import { useRouter } from "next/navigation";

export default function CardMobileNotUse() {
  const router = useRouter();
  return (
    <div className="flex flex-col min-h-screen ">
      <Navbar />

      <main className="flex-1 flex items-center justify-center p-4 my-8">
        <div className="relative w-full max-w-md overflow-hidden rounded-3xl bg-gradient-to-br from-base-200 to-base-300 shadow-lg">
          {/* Background grid */}
          <div className="absolute inset-0 opacity-[0.04] bg-[linear-gradient(to_right,theme(colors.base-content)_1px,transparent_1px),linear-gradient(to_bottom,theme(colors.base-content)_1px,transparent_1px)] bg-[size:32px_32px]" />

          <div className="relative p-8 flex flex-col items-center text-center space-y-5 my-12 mx-6">
            <div className="w-20 h-20 flex items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <MonitorSmartphone className="w-10 h-10" strokeWidth={1.8} />
            </div>
            <h1 className="text-xl font-semibold tracking-tight text-base-content">
              Disponível apenas em telas maiores
            </h1>

            <p className="text-sm text-base-content/75 leading-relaxed">
              O <strong>QuickBrick Studio</strong> foi projetado para
              planejamento e validação de estratégias avançadas da{" "}
              <strong>FIRST LEGO League Challenge</strong>.
              <br />
              <br />
              Para preservar precisão visual, leitura de dados e controle das
              ferramentas, esta funcionalidade está habilitada somente em
              computadores e tablets.
            </p>

            {/* Divider */}
            <div className="w-12 h-px bg-base-content/10" />

            {/* Hint */}
            <span className="text-xs text-base-content/60">
              Recomendado: notebook ou desktop
            </span>
            <button className="btn btn-soft" onClick={() => router.back()}>
              Voltar
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
