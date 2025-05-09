export function gerarCodigoAleatorio(length = 3) {
  return Math.random().toString(36).substring(2, 2 + length).toUpperCase();
}

