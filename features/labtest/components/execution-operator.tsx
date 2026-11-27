"use client";

import { createContext, useContext, type ReactNode } from "react";

/**
 * Operador escolhido na tela de execução (testes de equipe). Os formulários
 * de lançamento (genérico, Round FLL, Future Edition, OBR) leem daqui e
 * mandam junto em `createTestExecution` — assim a escolha fica num lugar só.
 * Null = quem está lançando.
 */
const ExecutionOperatorContext = createContext<string | null>(null);

export function ExecutionOperatorProvider({ operatorId, children }: { operatorId: string | null; children: ReactNode }) {
  return <ExecutionOperatorContext.Provider value={operatorId}>{children}</ExecutionOperatorContext.Provider>;
}

export function useExecutionOperator(): string | null {
  return useContext(ExecutionOperatorContext);
}
