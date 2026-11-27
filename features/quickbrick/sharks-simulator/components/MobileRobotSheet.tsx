"use client";
import React from "react";
import BottomSheetMobile from "./BottomSheetMobile";
import { RobotConfig } from "@/features/quickbrick/sharks-simulator/types";

interface MobileRobotSheetProps {
  open: boolean;
  onClose: () => void;
  robotConfig: RobotConfig;
  onChange: (config: RobotConfig) => void;
}

const SHAPES: { value: RobotConfig["shape"]; label: string }[] = [
  { value: "tank", label: "Esteiras" },
  { value: "4x4", label: "4x4" },
  { value: "fwd", label: "Dianteira" },
  { value: "rwd", label: "Traseira" },
  { value: "custom", label: "SVG custom" },
];

const PRESET_COLORS = ["#06b6d4", "#f97316", "#22c55e", "#ef4444", "#a855f7", "#eab308"];

const Stepper: React.FC<{ label: string; value: number; onChange: (v: number) => void; step?: number; unit?: string }> = ({
  label,
  value,
  onChange,
  step = 1,
  unit = "cm",
}) => (
  <div>
    <span className="text-[10px] font-medium text-base-content/50 mb-1 block">{label}</span>
    <div className="inline-flex items-center gap-0.5 rounded-md border border-base-300 bg-base-200/60 p-0.5 flex w-full">
      <button
        className="inline-flex items-center justify-center gap-1.5 rounded-md border font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primary disabled:pointer-events-none disabled:opacity-40 border-transparent text-base-content/75 hover:bg-base-content/[0.06] hover:text-base-content h-8 px-3 text-[13px]"
        onClick={() => onChange(Math.max(5, value - step))}
      >
        −
      </button>
      <div className="flex flex-1 items-center justify-center font-mono text-sm">
        {value} {unit}
      </div>
      <button className="inline-flex items-center justify-center gap-1.5 rounded-md border font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primary disabled:pointer-events-none disabled:opacity-40 border-transparent text-base-content/75 hover:bg-base-content/[0.06] hover:text-base-content h-8 px-3 text-[13px]" onClick={() => onChange(value + step)}>
        +
      </button>
    </div>
  </div>
);

const MobileRobotSheet: React.FC<MobileRobotSheetProps> = ({ open, onClose, robotConfig, onChange }) => {
  return (
    <BottomSheetMobile open={open} onClose={onClose} title="Configurar robô">
      <div className="space-y-5 pb-4">
        <div className="grid grid-cols-2 gap-3">
          <Stepper
            label="Largura"
            value={robotConfig.widthCm}
            onChange={(v) => onChange({ ...robotConfig, widthCm: v })}
          />
          <Stepper
            label="Comprimento"
            value={robotConfig.lengthCm}
            onChange={(v) => onChange({ ...robotConfig, lengthCm: v })}
          />
        </div>

        <div>
          <span className="text-[10px] font-medium text-base-content/50 mb-2 block">Chassi</span>
          <div className="grid grid-cols-2 gap-2">
            {SHAPES.map((s) => (
              <button
                key={s.value}
                onClick={() => onChange({ ...robotConfig, shape: s.value })}
                className={`inline-flex items-center justify-center gap-1.5 rounded-md border font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primary disabled:pointer-events-none disabled:opacity-40 h-9 px-3 text-[13px] ${robotConfig.shape === s.value ? "rounded-tl-lg rounded-br-lg rounded-tr-sm rounded-bl-sm border-transparent bg-primary text-primary-content hover:brightness-110" : "border-base-300 bg-base-100 hover:border-base-content/30 hover:bg-base-200/60"}`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <span className="text-[10px] font-medium text-base-content/50 mb-2 block">Cor</span>
          <div className="flex items-center gap-2 flex-wrap">
            {PRESET_COLORS.map((c) => (
              <button
                key={c}
                onClick={() => onChange({ ...robotConfig, color: c })}
                className={`w-9 h-9 rounded-full border-2 ${
                  robotConfig.color.toLowerCase() === c ? "border-base-content" : "border-transparent"
                }`}
                style={{ backgroundColor: c }}
                aria-label={c}
              />
            ))}
            <input
              type="color"
              value={robotConfig.color}
              onChange={(e) => onChange({ ...robotConfig, color: e.target.value })}
              className="w-9 h-9 rounded-full border border-base-content/20 bg-transparent cursor-pointer"
            />
          </div>
        </div>

        {robotConfig.shape === "custom" && (
          <label className="form-control w-full">
            <span className="text-[10px] font-medium text-base-content/50 mb-1">Path SVG</span>
            <textarea
              value={robotConfig.customPath}
              onChange={(e) => onChange({ ...robotConfig, customPath: e.target.value })}
              className="rounded-md border border-base-300 bg-base-100 px-2.5 transition-colors placeholder:text-base-content/40 hover:border-base-content/30 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 w-full py-1.5 font-mono text-xs"
              rows={2}
            />
          </label>
        )}
      </div>
    </BottomSheetMobile>
  );
};

export default MobileRobotSheet;
