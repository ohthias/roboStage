import { BookOpenIcon } from "@heroicons/react/24/outline";

export default function InnoLab() {
    return (
        <>
              <section className="bg-base-100 p-4 rounded-lg flex justify-between items-start shadow-md border border-base-300 mb-4">
                <div className="flex items-center gap-4">
                  <BookOpenIcon className="size-16 text-secondary/75" />
                  <div>
                    <h2 className="text-base-content font-bold mb-2 text-3xl">
                      Inno<span className="text-secondary">Lab</span>
                    </h2>
                    <p className="text-sm text-base-content">
                      Dê vida às suas ideias: crie diagramas diversos para impulsionar seu projeto!
                    </p>
                  </div>
                </div>
                <button className="btn btn-secondary">
                  Criar Diagrama
                </button>
              </section>
        </>
    );
}