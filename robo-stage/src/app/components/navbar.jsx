"use client";

import Link from "next/link";
import { useState } from "react";
import styles from "../styles/Navbar.module.css";

export default function Navbar({ mode }) {
  const validMode = mode ?? "default";
  const [overlayRoute, setOverlayRoute] = useState(null);

  const handleOverlay = (route, e) => {
    e.preventDefault(); // impede navegação
    setOverlayRoute(route);
  };

  return (
    <>

      <nav className={styles.navbar}>
        <div className={styles.navbar__logo}>
          <p>RoboStage</p>
        </div>
        {validMode === "default" && (
          <div className={styles.navbar__module}>
            <Link href="/criar" className={styles.navbar__buttons}>
              Criar
            </Link>
            <Link href="/embarcar" className={styles.navbar__buttons}>
              Embarcar
            </Link>
          </div>
        )}
      </nav>
    </>
  );
}
