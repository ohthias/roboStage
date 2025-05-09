"use client";

import Link from "next/link";
import styles from "../../../styles/Navbar.module.css";

export default function Navbar({ mode, id, admin }) {
  const validMode = mode ?? "default";

  const handleLogout = () => {
    window.location.href = "/";
  };

  return (
    <nav className={styles.navbar}>
      <div className={styles.navbar__logo}>
        <Link href="/">RoboStage</Link>
      </div>

      {validMode === "default" && (
        <div className={styles.navbar__module}>
          <Link href="/nova-sala" className={styles.navbar__buttons}>
            Criar
          </Link>
          <Link href="/sala" className={styles.navbar__buttons}>
            Embarcar
          </Link>
        </div>
      )}

      {validMode === "admin" && (
        <div className={styles.navbar__module}>
          <Link
            className={styles.btn__header}
            href={`/sala/${id}/visitante?admin=${admin}`}
          >
            Visualização
          </Link>
          <button
            className={styles.btn__header}
            onClick={() => (window.location.hash = "#codigos")}
          >
            Ver Códigos de Acesso
          </button>
          <button className={styles.btn__header} onClick={handleLogout}>
            Sair
          </button>
        </div>
      )}

      {validMode === "visitante" && (
        <div className={styles.navbar__module}>
          <Link className={styles.btn__header} href="/">
            Início
          </Link>
        </div>
      )}
    </nav>
  );
}
