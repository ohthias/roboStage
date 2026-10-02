"use client";
import React from "react";
import { ArrowUp, RotateCw, Trash2, MapPinOff } from "lucide-react";
import BottomSheetMobile from "./BottomSheetMobile";
import { Waypoint } from "./engine.service";

interface MobileWaypointsSheetProps {
  open: boolean;
  onClose: () => void;
  waypoints: Waypoint[];
  onRemove: (wp: Waypoint) => void;
  onUpdateSpeed: (wp: Waypoint, moveSpeed: number) => void;
  onClearAll: () => void;
}

const MobileWaypointsSheet: React.FC<MobileWaypointsSheetProps> = ({
  open,
  onClose,
  waypoints,
  onRemove,
  onUpdateSpeed,
  onClearAll,
}) => {
  return (
    <BottomSheetMobile
      open={open}
      onClose={onClose}
      title={`Pontos do percurso (${waypoints.length})`}
      headerRight={
        waypoints.length > 0 ? (
          <button onClick={onClearAll} className="btn btn-ghost btn-xs text-error gap-1">
            <MapPinOff size={14} /> Limpar
          </button>
        ) : null
      }
    >
      {waypoints.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 gap-3 text-base-content/50">
          <div className="w-14 h-14 rounded-full bg-base-200 flex items-center justify-center">
            <ArrowUp size={22} />
          </div>
          <p className="text-xs font-semibold text-center max-w-[220px]">
            Toque em qualquer lugar do tapete para criar o primeiro ponto do percurso.
          </p>
        </div>
      ) : (
        <div className="space-y-2 pb-4">
          {waypoints.map((wp, i) => (
            <div
              key={i}
              className="card card-compact bg-base-200 border border-base-content/10"
            >
              <div className="card-body p-3 gap-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-primary/15 text-primary flex items-center justify-center font-bold text-xs shrink-0">
                      {i + 1}
                    </div>
                    <div>
                      <p className="text-xs font-mono text-base-content/70">
                        X {wp.x.toFixed(0)} · Y {wp.y.toFixed(0)}
                      </p>
                      <p className="text-[10px] text-base-content/50 flex items-center gap-1">
                        {wp.turnIdx !== undefined && (
                          <span className="inline-flex items-center gap-0.5">
                            <RotateCw size={10} /> giro
                          </span>
                        )}
                        {wp.moveIdx !== undefined && (
                          <span className="inline-flex items-center gap-0.5">
                            <ArrowUp size={10} /> reto
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => onRemove(wp)}
                    className="btn btn-ghost btn-sm btn-circle text-error"
                    aria-label="Remover ponto"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                {wp.moveIdx !== undefined && (
                  <label className="form-control w-full pt-1">
                    <span className="text-[10px] font-medium text-base-content/50 mb-1">
                      Velocidade do trecho
                    </span>
                    <div className="flex items-center gap-2">
                      <input
                        type="range"
                        min={10}
                        max={100}
                        step={5}
                        value={wp.moveSpeed ?? 50}
                        onChange={(e) => onUpdateSpeed(wp, parseFloat(e.target.value))}
                        className="range range-xs range-primary flex-1"
                      />
                      <span className="text-[10px] font-mono w-8 text-right text-base-content/60">
                        {(wp.moveSpeed ?? 50).toFixed(0)}%
                      </span>
                    </div>
                  </label>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </BottomSheetMobile>
  );
};

export default MobileWaypointsSheet;
