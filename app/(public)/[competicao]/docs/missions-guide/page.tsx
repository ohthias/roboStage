import Header from "@/components/UI/Header";

export default function MissionsGuidePage() {
  return (
    <div className="py-8 px-4 bg-base-200">
      <div className="mx-auto max-w-6xl px-4 space-y-8 pb-8 pt-4">
        <Header
          name="Guia de Missões"
          highlight="FLL Challenge"
          type="Documentação"
          description="Guia de missões da FLL Challenge"
        />
        <div className="max-w-4xl mx-auto">
          <p className="mt-4 text-lg text-center">
            Este guia fornece informações detalhadas sobre as missões da FLL
            Challenge, incluindo regras, objetivos e dicas para equipes
            participantes.
          </p>
        </div>
      </div>
    </div>
  );
}
