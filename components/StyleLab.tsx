import { useState } from "react";
import StyleLabModal from "./StyleLabModal";

export function StyleLab() {
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="min-h-screen">
      <section className="bg-base-200 p-4 rounded-lg flex justify-between items-start shadow-md border border-base-300">
        <div>
          <h2 className="text-base-content font-bold mb-2 text-3xl">
            Style<span className="text-violet-700">Lab</span>
          </h2>
          <p className="text-sm text-base-content">
            Crie temas personalizados para seus eventos no showLive.
          </p>
        </div>
        <button
          className="btn btn-soft btn-accent"
          onClick={() => setShowModal(true)}
        >
          Criar Tema
        </button>
      </section>
      {showModal && (
        <StyleLabModal onClose={() => setShowModal(false)} />
      )}
    </div>
  );
}
