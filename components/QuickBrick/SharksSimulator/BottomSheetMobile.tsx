"use client";
import React from "react";
import { X } from "lucide-react";

interface BottomSheetMobileProps {
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  /** Optional element rendered next to the close button (e.g. an action button). */
  headerRight?: React.ReactNode;
}

const BottomSheetMobile: React.FC<BottomSheetMobileProps> = ({ open, title, onClose, children, headerRight }) => {
  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-200 ${
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      />
      {/* Sheet */}
      <div
        className={`fixed left-0 right-0 bottom-0 z-50 bg-base-100 rounded-t-2xl border-t border-base-content/10 shadow-2xl transition-transform duration-250 ease-out max-h-[80vh] flex flex-col ${
          open ? "translate-y-0" : "translate-y-full"
        }`}
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div className="flex items-center justify-center pt-2">
          <div className="w-10 h-1.5 rounded-full bg-base-content/20" />
        </div>
        <div className="flex items-center justify-between px-4 py-3 border-b border-base-content/10 shrink-0">
          <h3 className="text-sm font-bold uppercase tracking-wide">{title}</h3>
          <div className="flex items-center gap-2">
            {headerRight}
            <button onClick={onClose} className="btn btn-ghost btn-sm btn-circle" aria-label="Fechar">
              <X size={18} />
            </button>
          </div>
        </div>
        <div className="overflow-y-auto flex-1 p-4">{children}</div>
      </div>
    </>
  );
};

export default BottomSheetMobile;
