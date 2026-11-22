import { isClerkAPIResponseError, isReverificationCancelledError } from "@clerk/nextjs/errors";

/** Mensagens em português para os erros mais comuns do Clerk. */
const MESSAGES: Record<string, string> = {
  form_password_incorrect: "Senha incorreta.",
  form_password_pwned: "Essa senha apareceu em vazamentos de dados. Escolha outra.",
  form_password_length_too_short: "A senha é curta demais (mínimo de 8 caracteres).",
  form_password_length_too_long: "A senha é longa demais.",
  form_password_not_strong_enough: "A senha é fraca. Misture letras, números e símbolos.",
  form_password_size_in_bytes_exceeded: "A senha é longa demais.",
  form_password_validation_failed: "Senha incorreta.",
  form_identifier_exists: "Esse endereço já está em uso por outra conta.",
  form_email_address_exists: "Esse e-mail já está em uso.",
  form_param_format_invalid: "Formato inválido.",
  form_param_nil: "Preencha o campo.",
  form_code_incorrect: "Código incorreto.",
  verification_expired: "O código expirou. Peça um novo.",
  verification_failed: "Muitas tentativas. Peça um novo código.",
  form_username_invalid_length: "O nome de usuário precisa ter entre 4 e 64 caracteres.",
  form_username_invalid_character: "Use só letras, números, “_” e “-” no nome de usuário.",
  form_username_exists: "Esse nome de usuário já está em uso.",
  form_param_unknown: "Esse campo não está habilitado na sua conta.",
  too_many_requests: "Muitas tentativas. Espere um pouco e tente de novo.",
  session_reverification_required: "Confirme sua identidade para continuar.",
  form_param_value_invalid: "Valor inválido.",
  totp_already_enabled: "O app autenticador já está ativo.",
};

export function clerkErrorMessage(error: unknown, fallback = "Não foi possível concluir. Tente de novo."): string {
  if (isReverificationCancelledError(error)) return "Verificação cancelada.";
  if (isClerkAPIResponseError(error)) {
    const first = error.errors[0];
    if (!first) return fallback;
    if (first.code === "form_param_unknown" && first.meta?.paramName === "username") {
      return "Nome de usuário não está habilitado. Fale com a equipe do RoboStage.";
    }
    return MESSAGES[first.code] ?? first.longMessage ?? first.message ?? fallback;
  }
  return fallback;
}

export function wasCancelled(error: unknown) {
  return isReverificationCancelledError(error);
}
