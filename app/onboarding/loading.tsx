/**
 * Mostrado durante a navegação client-side vinda do login/dashboard,
 * para a tela não ficar em branco enquanto o servidor monta o formulário.
 */
export default function OnboardingLoading() {
  return (
    <main className="flex min-h-screen items-center justify-center" aria-busy="true">
      <div className="flex flex-col items-center gap-3 text-base-content/60">
        <span className="loading loading-spinner loading-lg" />
        <p className="text-sm">Preparando suas boas-vindas…</p>
      </div>
    </main>
  );
}
