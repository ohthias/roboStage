"use client";
import React from "react";
import BottomSheetMobile from "./BottomSheetMobile";
import { RobotConfig } from "@/types/SharksSimulator.types";

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
    <div className="join w-full">
      <button
        className="join-item btn btn-sm btn-outline"
        onClick={() => onChange(Math.max(5, value - step))}
      >
        −
      </button>
      <div className="join-item flex-1 flex items-center justify-center border border-base-300 text-sm font-mono">
        {value} {unit}
      </div>
      <button className="join-item btn btn-sm btn-outline" onClick={() => onChange(value + step)}>
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
                className={`btn btn-sm ${robotConfig.shape === s.value ? "btn-primary" : "btn-outline"}`}
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
              className="textarea textarea-bordered textarea-sm w-full font-mono text-xs"
              rows={2}
            />
          </label>
        )}
      </div>
    </BottomSheetMobile>
  );
};

export default MobileRobotSheet;
