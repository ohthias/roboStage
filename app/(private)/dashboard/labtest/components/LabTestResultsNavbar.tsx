"use client";

import React from "react";
import { useRouter, useParams } from "next/navigation";
import { useLabTests } from "@/hooks/useLabTests";

export default function LabTestResultsNavbar() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string | undefined;

  const { tests, testTypes } = useLabTests();
  const test = tests.find((t) => t.id === id);

  return (
    <nav className="flex items-center gap-2 text-sm mb-4 flex-wrap justify-between w-full bg-base-200 p-4 border border-base-300 rounded-lg">
      <div className="breadcrumbs">
        <ul className="flex items-center gap-2">
          <li>
            <button
              onClick={() => router.push("/dashboard")}
            >
              Dashboard
            </button>
          </li>
          <li>
            <button
              onClick={() => router.push("/dashboard")}
            >
              LabTest
            </button>
          </li>
          <li aria-current="page" className="flex items-center">
            {test ? (
              <>
                <span className="font-medium">{test.name_test}</span>
                {test.type_id && testTypes[test.type_id] && (
                  <span className="badge badge-outline badge-sm ml-2">
                    {testTypes[test.type_id]}
                  </span>
                )}
              </>
            ) : (
              <span className="font-medium text-gray-500">
                Teste não encontrado
              </span>
            )}
          </li>
        </ul>
      </div>
      <div className="flex items-center gap-2">
        <p className="text-md font-bold text-center">
          Lab<span className="text-primary">Test</span>{" "}
          <span className="text-xs font-normal">Resultados</span>
        </p>
        <button
          onClick={() => router.back()}
          className="btn btn-accent btn-outline btn-sm"
        >
          Voltar
        </button>
      </div>
    </nav>
  );
}
