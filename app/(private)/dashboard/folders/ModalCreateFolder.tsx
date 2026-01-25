import { useState } from "react";
import { FolderPlus, X } from "lucide-react";

export default function NewFolderButton({
  createFolder,
}: {
  createFolder: (name: string) => void;
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");

  const handleCreate = () => {
    if (!newFolderName.trim()) return;
    createFolder(newFolderName);
    setNewFolderName("");
    setIsModalOpen(false);
  };

  return (
    <>
      {/* Botão principal */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="flex items-center gap-2 btn btn-default btn-soft"
      >
        <FolderPlus size={16} />
        Nova pasta
      </button>

      {/* Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/50 bg-backdrop-blur-sm flex items-center justify-center h-screen"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="bg-base-100 rounded-xl p-6 w-full max-w-md shadow-lg relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Botão de fechar */}
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-3 right-3 text-base-content/70 hover:text-base-content transition duration-200"
            >
              <X size={20} />
            </button>

            <h2 className="font-semibold text-lg mb-4 flex items-center gap-2 text-base-content/90">
              <FolderPlus size={16} />
              Criar nova pasta
            </h2>

            <div className="flex gap-2">
              <input
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="Nome da pasta"
                className="input input-sm input-bordered flex-1"
              />
              <button onClick={handleCreate} className="btn btn-sm btn-primary">
                Criar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
