import Header from "@/components/UI/Header";

export default function CheklistPage() {
  return (
    <div className="bg-base-200">
      <div className="mx-auto max-w-6xl px-4 space-y-8 pb-8 pt-4">
        <Header
          type="Checklist"
          name="Confia,"
          highlight="mas Confira!"
          description="Checklist de verificação de itens para competições, seja para preparação ou para avaliação pós-evento."
        />
        <div className="max-w-4xl mx-auto">
          <p className="mt-4 text-lg text-center">
            Esta é uma lista de verificação para ajudar você a acompanhar o
            progresso do seu projeto.
          </p>
        </div>
      </div>
    </div>
  );
}
