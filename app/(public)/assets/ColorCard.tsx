"use client";

import { Copy } from "lucide-react";

export default function ColorCard({
  name,
  value,
  description,
  className,
  textClass,
}: {
  name: string;
  value: string;
  description: string;
  className: string;
  textClass: string;
}) {
  return (
    <div className="rounded-3xl overflow-hidden border border-base-content/10 bg-base-200">
      <div className={`h-40 ${className} ${textClass} p-6 flex items-end`}>
        <span className="font-mono text-sm opacity-80">{value}</span>
      </div>

      <div className="p-6">
        <h3 className="font-bold text-lg">{name}</h3>

        <p className="text-sm text-base-content/50 mt-1">
          {description}
        </p>

        <div className="flex items-center justify-between mt-5">
          <code className="text-xs bg-base-300 px-2 py-1 rounded">
            {value}
          </code>

          <button
            className="btn btn-ghost btn-xs"
            title={`Copiar ${value}`}
            onClick={() => navigator.clipboard?.writeText(value)}
          >
            <Copy size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
