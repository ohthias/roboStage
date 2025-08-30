import ComingSoon from "./ComingSoon";
import ModalLabTest from "./ui/Modal/ModalLabTest";

export default function LabTestPage() {
  return (
    <div className="min-h-screen overflow-y-auto">
      <section className="bg-base-200 p-4 rounded-lg flex justify-between items-start shadow-md border border-base-300 mb-2">
        <div>
          <h2 className="text-base-content font-bold mb-2 text-3xl">
            Lab<span className="text-primary">Test</span>
          </h2>
          <p className="text-sm text-base-content">
            Crie e gerencie seus testes personalizados para avaliar o desempenho do robô.
          </p>
        </div>
      </section>
      <ComingSoon />
    </div>
  );
}
