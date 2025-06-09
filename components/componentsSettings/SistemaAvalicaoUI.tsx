import FormSistemaAvalia from "./FormSistemaAvalia";

export default function SistemaAvaliacaoUI() {
  return (
    <div className="mb-6">
      <h2 className="text-2xl font-semibold mb-2 text-primary-dark">
        Sistema de avaliação
      </h2>
      <p className="mb-4 text-gray-500">
        Configure o sistema de avaliação do evento. Você pode adicionar fichas
        de avaliação, definir critérios e anexar arquivos de avaliação.
        Certifique-se de que as fichas estejam no formato Markdown (.md).
      </p>
      <FormSistemaAvalia />
    </div>
  );
}
