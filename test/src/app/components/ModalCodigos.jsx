"use client";
import { useEffect, useState } from "react";
import styles from "../../../styles/Modal.module.css"; // crie esse CSS

export default function ModalCodigos({
  visitante,
  voluntario,
  admin,
  onClose,
}) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (window.location.hash === "#codigos") {
      setShow(true);
    }
  }, []);

  const handleClose = () => {
    setShow(false);
    window.location.hash = "";
    if (onClose) onClose();
  };

  if (!show) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h2>Códigos de Acesso</h2>
        <div className={styles.modalContent}>
          <p>
            <strong>Visitante:</strong> {visitante}
          </p>
          <p>
            <strong>Voluntário:</strong> {voluntario}
          </p>
          <p>
            <strong>Admin:</strong> {admin}
          </p>
        </div>
        <button className={styles.btn} onClick={handleClose}>Fechar</button>
      </div>
    </div>
  );
}
