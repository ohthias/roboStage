export function gerarCodigoAleatorio(length = 3) {
  let codigo = "";
  for (let i = 0; i < length; i++) {
    codigo += Math.floor(Math.random() * 10)
  }
  return codigo;
}