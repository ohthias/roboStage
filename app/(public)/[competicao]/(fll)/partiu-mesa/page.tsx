import Header from "@/components/UI/Header";

export default function PartiuMesaPage() {
  return (
    <div className="bg-base-200">
      <div className="mx-auto max-w-6xl px-4 space-y-8 pb-8 pt-4">
        <Header
          type="Testes"
          name="Partiu"
          highlight="Mesa!"
          description="Simulador de simples para teste de saídas. Para análise de desempenho do robô durante um teste de saída."
        />
        <div className="max-w-4xl mx-auto">
          <p className="mt-4 text-lg text-center">
            Esta ferramenta permite simular o comportamento do robô em uma mesa de teste, ajudando a identificar possíveis melhorias e ajustes necessários para otimizar o desempenho durante as competições.
          </p>
        </div>
      </div>
    </div>
  );
}