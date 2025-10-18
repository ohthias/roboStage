"use client";
import React from "react";

export default function TestTabs({
  active,
  onChange,
}: {
  active: "tests" | "results";
  onChange: (v: "tests" | "results") => void;
}) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div role="tablist" className="tabs tabs-border">
        <button
          role="tab"
          className={`tab ${active === "tests" ? "tab-active" : ""}`}
          onClick={() => onChange("tests")}
        >
          Testes
        </button>
        <button
          role="tab"
          className={`tab ${active === "results" ? "tab-active" : ""}`}
          onClick={() => onChange("results")}
        >
          Resultados
        </button>
      </div>
    </div>
  );
}
