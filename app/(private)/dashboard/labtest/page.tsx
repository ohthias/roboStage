"use client";
import CreateTest from "@/components/Dashboard/LabTest/CreateTest";
import { SignalIcon } from "lucide-react";
import { useState } from "react";

export default function LabTest() {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div>
      <section
        className="
          relative overflow-hidden
          rounded-3xl
          border border-base-300
          bg-gradient-to-br
          from-primary/10
          via-base-100
          to-base-200/40
          p-6 md:p-8
        "
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div
              className="
                hidden sm:flex
                h-14 w-14
                rounded-2xl
                bg-primary/10
                text-primary
                items-center justify-center
              "
            ></div>

            <div className="space-y-2">
              <div>
                <h1 className="text-2xl font-bold">LabTest</h1>

                <p className="text-sm text-base-content/60 max-w-2xl mt-1">
                  Crie e gerencie testes personalizados para avaliar o
                  desempenho dos robôs em diferentes missões e variáveis. Ideal
                  para experimentação e desenvolvimento iterativo.
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={() => setModalOpen(true)}
            className="
              btn btn-primary
              rounded-2xl
              gap-2
              shadow-sm
            "
          >
            <SignalIcon className="w-4 h-4" />
            Novo Teste
          </button>
        </div>
      </section>
      {modalOpen && <CreateTest onCancel={() => setModalOpen(false)} />}
    </div>
  );
}
