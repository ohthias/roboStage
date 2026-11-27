/**
 * Erro de autorização do Stagebook. Vive fora de `scope.ts` (que é
 * `server-only`) para poder ser importado por helpers compartilhados sem
 * arrastar o código de servidor junto. `scope.ts` re-exporta a classe.
 */
export class StagebookAuthError extends Error {
  constructor(message = "Você não tem acesso a este recurso.") {
    super(message);
    this.name = "StagebookAuthError";
  }
}
