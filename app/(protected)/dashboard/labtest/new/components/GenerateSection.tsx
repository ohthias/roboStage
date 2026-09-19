import { CheckCircle2, Copy, Loader2, Play, Save, X } from "lucide-react";

export function GenerateSection({
  isSaving,
  saveError,
  saveSuccess,
  generated,
  copyLabel,
  onGenerate,
  onSave,
  onCopyGenerated,
}: {
  isSaving: boolean;
  saveError: string | null;
  saveSuccess: string | null;
  generated: Record<string, unknown> | null;
  copyLabel: string;
  onGenerate: () => void;
  onSave: () => void;
  onCopyGenerated: () => void;
}) {
  return (
    <section className="card border border-primary/20 bg-base-100 shadow-sm">
      <div className="card-body p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-content">
              <Play className="size-5" />
            </div>

            <div>
              <h2 className="font-semibold">Gerar teste</h2>
              <p className="text-xs text-base-content/50">
                Revise as configurações, confira o payload e salve no banco.
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <button type="button" className="btn btn-primary" disabled={isSaving} onClick={onSave}>
              {isSaving ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Save className="size-4" />
              )}
              Salvar teste
            </button>
          </div>
        </div>

        {saveError && (
          <div className="alert alert-error mt-4">
            <X className="size-5" />
            <span>{saveError}</span>
          </div>
        )}

        {saveSuccess && (
          <div className="alert alert-success mt-4">
            <CheckCircle2 className="size-5" />
            <span>{saveSuccess}</span>
          </div>
        )}
      </div>
    </section>
  );
}
