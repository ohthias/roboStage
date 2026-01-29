"use client";
import { forwardRef, useImperativeHandle, useRef, useState } from "react";

export interface ModalPointsRef {
  open: (
    teamName: string,
    points: { [key: string]: number },
    onConfirm: (newPoints: { [key: string]: number }) => void
  ) => void;
}

interface ModalPointsProps {
  title?: string;
}

const ModalPoints = forwardRef<ModalPointsRef, ModalPointsProps>(
  ({ title = "Editar Pontos" }, ref) => {
    const modalRef = useRef<HTMLDialogElement | null>(null);
    const [localPoints, setLocalPoints] = useState<{ [key: string]: number }>({});
    const [teamName, setTeamName] = useState("");
    const [confirmStep, setConfirmStep] = useState(false);

    const confirmFn = useRef<((newPoints: { [key: string]: number }) => void) | null>(null);

    useImperativeHandle(ref, () => ({
      open: (
        name: string,
        points: { [key: string]: number },
        onConfirm: (newPoints: { [key: string]: number }) => void
      ) => {
        setTeamName(name);
        setLocalPoints(points);
        confirmFn.current = onConfirm;
        setConfirmStep(false);
        modalRef.current?.showModal();
      },
    }));

    const closeModal = () => modalRef.current?.close();

    const handleSave = () => {
      if (!confirmStep) {
        setConfirmStep(true);
        return;
      }
      if (confirmFn.current) confirmFn.current(localPoints);
      closeModal();
    };

    const handleChange = (round: string, value: string) => {
      setLocalPoints((prev) => ({
        ...prev,
        [round]: value === "" ? -1 : parseInt(value, 10),
      }));
    };

    return (
      <dialog ref={modalRef} className="modal modal-bottom sm:modal-middle">
        <div className="modal-box max-w-lg">
          <h3 className="font-bold text-lg">{title}</h3>
          <p className="py-2 text-sm">
            Editando pontos da equipe <b>{teamName}</b>
          </p>

          <div className="overflow-x-auto max-h-[300px] my-4">
            <table className="table table-zebra w-full">
              <thead>
                <tr>
                  <th>Rodada</th>
                  <th>Pontos</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(localPoints).map(([round, value]) => (
                  <tr key={round}>
                    <td className="font-medium">{round}</td>
                    <td>
                      <input
                        type="number"
                        className="input input-bordered input-sm w-24"
                        value={value === -1 ? "" : value}
                        onChange={(e) => handleChange(round, e.target.value)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {confirmStep && (
            <p className="text-warning font-semibold text-sm">
              Tem certeza que deseja salvar estas alterações?
            </p>
          )}

          <div className="modal-action flex gap-2">
            <button className="btn" onClick={closeModal}>
              Cancelar
            </button>
            <button
              className={`btn ${confirmStep ? "btn-error" : "btn-primary"}`}
              onClick={handleSave}
            >
              {confirmStep ? "Confirmar mudanças" : "Salvar alterações"}
            </button>
          </div>
        </div>
      </dialog>
    );
  }
);

export default ModalPoints;