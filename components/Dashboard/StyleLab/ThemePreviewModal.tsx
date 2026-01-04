import { StyleLabTheme } from "@/app/(private)/dashboard/hashPages/StyleLab";
import { FllRankingPreview } from "./FllRankingPreview";

interface ThemePreviewModalProps {
  theme: StyleLabTheme;
  onClose: () => void;
}

export function ThemePreviewModal({ theme, onClose }: ThemePreviewModalProps) {
  return (
    <dialog className="modal modal-open bg-black/50 backdrop-blur-sm">
      <div className="modal-box max-w-5xl p-0 overflow-hidden rounded-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-base-300">
          <h3 className="font-semibold text-lg">
            Pré-visualização • {theme.name || `Tema #${theme.id_theme}`}
          </h3>
          <button className="btn btn-sm btn-ghost" onClick={onClose}>
            ✕
          </button>
        </div>

        {/* Preview */}
        <FllRankingPreview theme={theme} />

      </div>

      <form method="dialog" className="modal-backdrop">
        <button onClick={onClose}>close</button>
      </form>
    </dialog>
  );
}
