"use client";

import type { ComponentProps } from "react";

/**
 * Botão de envio que pede confirmação no navegador antes de submeter o
 * formulário (a action roda no servidor, onde `confirm()` não existe).
 */
export function ConfirmSubmitButton({
  message,
  onClick,
  ...props
}: ComponentProps<"button"> & { message: string }) {
  return (
    <button
      type="submit"
      {...props}
      onClick={(event) => {
        if (!window.confirm(message)) event.preventDefault();
        onClick?.(event);
      }}
    />
  );
}
