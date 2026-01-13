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
        className={`absolute -left-3 top-1/2 -translate-y-1/2 z-10 transition-opacity ${
          isDragging ? "opacity-0" : "opacity-0 group-hover:opacity-100"
        }`}
      >
        <div className="bg-slate-900 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full shadow-sm border border-white">
          {index + 1}.{subIndex + 1}
        </div>
      </div>

      {/* Main Card */}
      <div
        className={`
        relative w-64 p-4 rounded-xl border-2 shadow-sm transition-all duration-200
        ${
          isDragging
            ? "shadow-xl ring-2 ring-primary-400 rotate-2 scale-105 z-50"
            : "hover:shadow-md hover:scale-[1.02] hover:-translate-y-0.5"
        }
        ${
          mission.status === "active" && !isDragging
            ? "ring-2 ring-blue-100 ring-offset-2"
            : ""
        }
        ${getStatusColor()}
      `}
      >
        {/* Header */}
        <div className="flex justify-between items-start mb-3">
          <button
            onClick={toggleStatus}
            className="p-1 rounded-full hover:bg-black/5 transition-colors"
            title={`Status: ${mission.status}`}
            onMouseDown={(e) =>
              e.stopPropagation()
            } /* Prevent drag start on button */
          >
            {getStatusIcon()}
          </button>

          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1 text-slate-400 hover:text-slate-600 rounded-md hover:bg-black/5 transition-colors"
              onMouseDown={(e) =>
                e.stopPropagation()
              } /* Prevent drag start on menu trigger */
            >
              <MoreHorizontal size={16} />
            </button>

            {showMenu && (
              <div
                className="absolute right-0 top-full mt-1 w-32 bg-white rounded-lg shadow-lg border border-slate-100 py-1 z-20 overflow-hidden animate-in fade-in zoom-in-95 duration-100 origin-top-right"
                onMouseDown={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => {
                    setIsEditing(true);
                    setShowMenu(false);
                  }}
                  className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                >
                  <Edit3 size={12} /> Rename
                </button>
                <button
                  onClick={() => {
                    onDelete(mission.id);
                    setShowMenu(false);
                  }}
                  className="w-full text-left px-3 py-2 text-xs text-red-600 hover:bg-red-50 flex items-center gap-2"
                >
                  <Trash2 size={12} /> Delete
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="space-y-2">
          {isEditing ? (
            <div
              className="flex flex-col gap-2"
              onMouseDown={(e) => e.stopPropagation()}
            >
              <input
                type="text"
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
                className="w-full text-sm font-semibold bg-white/50 border border-black/10 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary-500"
                autoFocus
                onKeyDown={(e) => e.key === "Enter" && handleSave()}
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setIsEditing(false)}
                  className="text-xs text-slate-500 hover:underline"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="text-xs font-medium text-primary-600 hover:underline"
                >
                  Save
                </button>
              </div>
            </div>
          ) : (
            <>
              <h3
                className="font-bold text-sm leading-tight pr-2 select-none"
                onDoubleClick={() => setIsEditing(true)}
              >
                {mission.name}
              </h3>
              <p className="text-xs opacity-70 leading-relaxed line-clamp-2 select-none">
                {mission.description || "No description provided."}
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};