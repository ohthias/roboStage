import { Suspense } from "react";
import ResetPasswordClient from "./reset-password-client";

interface ResetPasswordPageProps {
  searchParams: Promise<{
    code?: string;
  }>;
}

export default async function ResetPasswordPage({
  searchParams,
}: ResetPasswordPageProps) {
  const params = await searchParams;

  const code = params?.code ?? null;

  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          Carregando...
        </div>
      }
    >
      <ResetPasswordClient code={code} />
    </Suspense>
  );
}