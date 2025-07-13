"use client";
import Cookies from "js-cookie";
import DeleteModal from "../ui/deleteModal";
import { useState } from "react";
import ToggleSwitch from "@/components/ui/toggleButton";

interface Props {
  codigoSala: string;
}

export default function DangerZoneUI({ codigoSala }: Props) {
  const [userEmail, setUserEmail] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleteSuccess, setDeleteSuccess] = useState(false);
  const [buttonIsOne, setButtonIsOne] = useState(false);

  const handleToggleButton = async () => {
    setButtonIsOne(!buttonIsOne);

    try {
       const res = await fetch (`/rooms/${codigoSala}/others/`, {
        method: "POST",
        headers: {
          "Content-Type" : "application/json",
        },
        body: JSON.stringify ({
          data_teams_switch: !buttonIsOne
        })
       })

       if(!res.ok) {
        setButtonIsOne(false);
         throw new Error("Erro ao atualizar configuração");
       }
        const data = await res.json();
        if (data.error) {
          setButtonIsOne(false);
          throw new Error(data.error);
        }
        console.log("Configuração atualizada com sucesso:", data);
    } catch (error) {
      setButtonIsOne(false);
      console.error("Erro ao atualizar configuração:", error);
    }
  };

  const handleConfirmEmail = async (email: string): Promise<boolean> => {
    setUserEmail(email);
    return true;
  };

  const deletarSala = async (emailParam: string) => {
    setIsDeleting(true);
    setDeleteError(null);
    setDeleteSuccess(false);

    try {
      const res = await fetch(`/rooms/deleteRoom/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          codigo: codigoSala,
          emailAdmin: emailParam,
        }),
      });

      if (!res.ok) throw new Error("Erro ao deletar sala");

      const data = await res.json();
      if (data.error) throw new Error(data.error);

      Cookies.set("codigo_sala", "", { expires: new Date(0) });
      Cookies.set("nivel_acesso", "", { expires: new Date(0) });
      setDeleteSuccess(true);
    } catch (error: any) {
      console.error("Erro ao deletar sala:", error);
      setDeleteError(error.message || "Erro desconhecido");
    } finally {
      setIsDeleting(false);
    }
  };

  const removerEquipes = async (emailParam: string) => {
    setIsDeleting(true);
    setDeleteError(null);
    setDeleteSuccess(false);

    try {
      const res = await fetch(`/rooms/${codigoSala}/deleteTeams/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          codigo: codigoSala,
          emailAdmin: emailParam,
        }),
      });

      if (!res.ok) throw new Error("Erro ao remover equipes");

      const data = await res.json();
      if (data.error) throw new Error(data.error);

      setDeleteSuccess(true);
    } catch (error: any) {
      console.error("Erro ao remover equipes:", error);
      setDeleteError(error.message || "Erro desconhecido");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="my-8 p-6 bg-red-50 bg-opacity-50 border border-red-300 rounded-lg">
      <h2 className="text-lg font-bold text-red-700 mb-4">Zona de Perigo</h2>
      
      <div className="mt-6 mb-4 flex flex-row items-center gap-2 w-full justify-between">
        <p className="text-sm text-red-800 max-w-[80%]">
          <strong>Ativar/desativar</strong> edição de dados das equipes. Quando desativado, os dados das equipes não poderão ser editados.
        </p>
        <ToggleSwitch isOn={buttonIsOne} onClick={handleToggleButton} />
      </div>

      <div className="mt-6 mb-4 flex flex-row items-center gap-2 w-full justify-between">
        <p className="text-sm text-red-800 max-w-[80%]">
          <strong>Remover equipes</strong> Deseja apenas remover as equipes da sala, mantendo-a ativa?
        </p>
        <DeleteModal
          textBox="equipes"
          onConfirm={handleConfirmEmail}
          onDelete={removerEquipes}
        />
      </div>
      
      <div className="mb-4 flex flex-row items-center gap-2 w-full justify-between">
        <p className="text-sm text-red-800 max-w-[80%]">
          Deletar a sala apagará todos os dados vinculados a ela de forma
          permanente.
        </p>
        <DeleteModal
          textBox="sala"
          onConfirm={handleConfirmEmail}
          onDelete={deletarSala}
        />
      </div>

      {isDeleting && (
        <p className="text-sm text-yellow-600 mt-4 text-right">Processando exclusão...</p>
      )}
      {deleteError && (
        <p className="text-sm text-red-600 mt-2 text-right">Erro: {deleteError}</p>
      )}
      {deleteSuccess && (
        <p className="text-sm text-green-600 mt-2 text-right">
          Ação concluída com sucesso!
        </p>
      )}
    </div>
  );
}
