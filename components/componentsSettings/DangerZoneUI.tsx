interface Props {
  codigoSala: string;
}

export default function DangerZoneUI({ codigoSala }: Props) {
  const deletarSala = async () => {
    const confirmacao = confirm(
      "Você tem certeza que deseja deletar este evento?"
    );
    if (!confirmacao || !codigoSala) return;

    const emailAdmin = prompt("Digite seu e-mail para confirmar a exclusão:");

    if (!emailAdmin || !/\S+@\S+\.\S+/.test(emailAdmin)) {
      alert("E-mail inválido. A operação foi cancelada.");
      return;
    }

    try {
      console.log("Deletando sala:", codigoSala, "Email do admin:", emailAdmin);
      const res = await fetch("/rooms/deleteRoom", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          codigo: codigoSala,
          emailAdmin,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert("Erro ao deletar sala: " + (data.error || "Erro desconhecido"));
        return;
      }

      alert("Sala deletada com sucesso! Um e-mail de confirmação foi enviado.");
      window.location.href = "/";
    } catch (error) {
      alert("Erro inesperado ao tentar deletar a sala.");
      console.error(error);
    }
  };

  return (
    <div className="mb-6">
      <h2 className="text-2xl font-semibold mb-2 text-primary-dark">
        Zona de risco
      </h2>
      <p className="mb-4 text-gray-500">
        Qualquer alteração nessa área não tem como se desfazer.
      </p>
      <div className="flex flex-col gap-4">
        <div className="flex flex-row justify-between items-center">
          <div className="flex items-start flex-col text-gray-500">
            <span className="font-semibold">Deletar Evento</span>
            <p className="text-sm">
              Esta ação é irreversível. Certifique-se de que deseja excluir este
              evento permanentemente.
            </p>
          </div>
          <button
            className="bg-primary-light text-white px-4 py-2 rounded hover:bg-primary-dark transition-colors cursor-pointer"
            onClick={deletarSala}
          >
            Deletar Evento
          </button>
        </div>
        <div className="flex flex-row justify-between items-center">
          <div className="flex items-start flex-col text-gray-500">
            <span className="font-semibold">
              Excluir todas as fichas de avaliação
            </span>
            <p className="text-sm">
              Esta ação é irreversível. Certifique-se de que deseja excluir
              todas as fichas de avaliação deste evento permanentemente.
            </p>
          </div>
          <button
            className="bg-primary-light text-white px-4 py-2 rounded hover:bg-primary-dark transition-colors cursor-pointer"
            onClick={() => {
              // Implementar lógica de exclusão de fichas de avaliação
              alert(
                "Funcionalidade de exclusão de fichas de avaliação ainda não implementada."
              );
            }}
          >
            Deletar Fichas
          </button>
        </div>
        <div className="flex flex-row justify-between items-center">
          <div className="flex items-start flex-col text-gray-500">
            <span className="font-semibold">Resetar rounds</span>
            <p className="text-sm">
              Reset todas as rodadas do evento. Esta ação é irreversível e
              removerá todas as informações relacionadas às rodadas.
            </p>
          </div>
          <button className="bg-primary-light text-white px-4 py-2 rounded hover:bg-primary-dark transition-colors cursor-pointer">
            Deletar Rounds
          </button>
        </div>
        <div className="flex flex-row justify-between items-center">
          <div className="flex items-start flex-col text-gray-500">
            <span className="font-semibold">Excluir todas as equipes</span>
            <p className="text-sm">
              Esta ação é irreversível. Certifique-se de que deseja excluir
              todas as equipes deste evento permanentemente.
            </p>
          </div>
          <button
            className="bg-primary-light text-white px-4 py-2 rounded hover:bg-primary-dark transition-colors cursor-pointer"
            onClick={() => {
              // Implementar lógica de exclusão de equipes
              alert(
                "Funcionalidade de exclusão de equipes ainda não implementada."
              );
            }}
          >
            Deletar Equipes
          </button>
        </div>
      </div>
    </div>
  );
}
