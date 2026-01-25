import React, { useState, useRef, useEffect } from "react";
import { Mission } from "./types";
import {
  MoreHorizontal,
  Trash2,
  CheckCircle2,
  Circle,
  Clock,
  Edit3,
} from "lucide-react";

interface MissionNodeProps {
  mission: Mission;
  index: number;
  subIndex: number;
  onUpdate: (id: string, updates: Partial<Mission>) => void;
  onDelete: (id: string) => void;
  isDragging?: boolean;
}

export const MissionNode: React.FC<MissionNodeProps> = ({
  mission,
  index,
  subIndex,
  onUpdate,
  onDelete,
  isDragging,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(mission.name);
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSave = () => {
    onUpdate(mission.id, { name: editedName });
    setIsEditing(false);
  };

  const toggleStatus = () => {
    const nextStatus =
      mission.status === "pending"
        ? "active"
        : mission.status === "active"
        ? "completed"
        : "pending";
    onUpdate(mission.id, { status: nextStatus });
  };

  const getStatusColor = () => {
    switch (mission.status) {
      case "completed":
        return "bg-emerald-50 border-emerald-200 text-emerald-700";
      case "active":
        return "bg-blue-50 border-blue-200 text-blue-700";
      default:
        return "bg-white border-slate-200 text-slate-600";
    }
  };

  const getStatusIcon = () => {
    switch (mission.status) {
      case "completed":
        return <CheckCircle2 size={16} className="text-emerald-500" />;
      case "active":
        return <Clock size={16} className="text-blue-500 animate-pulse" />;
      default:
        return <Circle size={16} className="text-slate-300" />;
    }
  };

  return (
    <div className="relative group">
      {/* Node Number Badge */}
      <div
        className={`absolute -left-3 top-1/2 -translate-y-1/2 z-10 transition-opacity
      ${isDragging ? "opacity-0" : "opacity-0 group-hover:opacity-100"}
    `}
      >
        <div className="badge badge-neutral text-[9px] font-bold shadow border border-base-100">
          {index + 1}.{subIndex + 1}
        </div>
      </div>

      {/* Main Card */}
      <div
        className={`
      card w-64 bg-base-100 border-2 transition-all duration-200
      ${
        isDragging
          ? "shadow-xl ring-2 ring-primary rotate-2 scale-105 z-50"
          : "hover:shadow-md hover:scale-[1.02] hover:-translate-y-0.5"
      }
      ${
        mission.status === "active" && !isDragging
          ? "ring-2 ring-info/20 ring-offset-2"
          : ""
      }
      ${getStatusColor()}
    `}
      >
        <div className="card-body p-4 gap-3">
          {/* Header */}
          <div className="flex justify-between items-start">
            <button
              onClick={toggleStatus}
              title={`Status: ${mission.status}`}
              onMouseDown={(e) => e.stopPropagation()}
              className="btn btn-ghost btn-xs btn-circle"
            >
              {getStatusIcon()}
            </button>

            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setShowMenu(!showMenu)}
                onMouseDown={(e) => e.stopPropagation()}
                className="btn btn-ghost btn-xs btn-circle"
              >
                <MoreHorizontal size={16} />
              </button>

              {showMenu && (
                <ul
                  className="menu menu-sm absolute right-0 mt-1 w-36 bg-base-100 border border-base-300 rounded-box shadow z-20"
                  onMouseDown={(e) => e.stopPropagation()}
                >
                  <li>
                    <button
                      onClick={() => {
                        onDelete(mission.id);
                        setShowMenu(false);
                      }}
                      className="text-error flex items-center gap-2"
                    >
                      <Trash2 size={12} />
                      Excluir
                    </button>
                  </li>
                </ul>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="space-y-2">
            <img
              src={mission.image}
              alt={mission.name}
              className="w-full h-24 object-contain rounded-box bg-base-200"
            />

            <h3
              className="font-bold text-sm leading-tight select-none"
              onDoubleClick={() => setIsEditing(true)}
            >
              {mission.name}
            </h3>

            <p className="text-xs opacity-70 leading-relaxed line-clamp-2 select-none">
              {mission.description || "No description provided."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
