import Link from "next/link";
import { Radio } from "lucide-react";

/** Abas do LabTest: testes gerais e laboratórios Anatix (telemetria ao vivo). */
export function LabTestTabs({ active }: { active: "geral" | "anatix" }) {
  return (
    <div role="tablist" className="tabs tabs-box bg-base-100">
      <Link
        role="tab"
        href="/dashboard/labtest"
        aria-selected={active === "geral"}
        className={`tab ${active === "geral" ? "tab-active" : ""}`}
      >
        Geral
      </Link>
      <Link
        role="tab"
        href="/dashboard/labtest/anatix"
        aria-selected={active === "anatix"}
        className={`tab gap-1.5 ${active === "anatix" ? "tab-active" : ""}`}
      >
        <Radio size={14} />
        Anatix
      </Link>
    </div>
  );
}
