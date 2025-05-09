"use client";

import Link from "next/link";
import styles from "../../../styles/Navbar.module.css";

export default function Navbar({ mode }) {
  const validMode = mode ?? "default";

  return (
    <>

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
      </nav>
    </>
  );
}
