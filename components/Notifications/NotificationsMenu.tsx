"use client";

import { useState } from "react";
import { Bell, ChevronLeft } from "lucide-react";

export type Notification = {
  id: string;
  title: string;
  description?: string;
  read: boolean;
  created_at: string;
};

interface NotificationsMenuProps {
  notifications: Notification[];
  onNotificationClick?: (notification: Notification) => void;
}

export function NotificationsMenu({
  notifications,
  onNotificationClick,
}: NotificationsMenuProps) {
  const [open, setOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  function handleToggle() {
    if (window.innerWidth < 640) {
      setMobileOpen(true);
    } else {
      setOpen((v) => !v);
    }
  }

  function handleClick(notification: Notification) {
    onNotificationClick?.(notification);
    setOpen(false);
    setMobileOpen(false);
  }

  return (
    <>
      {/* Botão */}
      <div className="relative">
        <button
          onClick={handleToggle}
          className="btn btn-ghost btn-circle btn-sm relative hover:bg-base-200 transition"
        >
          <Bell size={18} />

          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full rounded-full bg-primary opacity-75 animate-ping" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary" />
            </span>
          )}
        </button>

        {/* Desktop Dropdown */}
        {open && (
          <div className="absolute right-0 mt-5 w-80 bg-base-100 rounded-2xl shadow-2xl border border-base-300 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-4 py-3 font-semibold border-b border-base-300 bg-base-100">
              Notificações
            </div>

            <div className="max-h-96 overflow-y-auto divide-y divide-base-200">
              {notifications.length === 0 && (
                <div className="px-4 py-8 text-sm opacity-60 text-center">
                  Nenhuma notificação
                </div>
              )}

              {notifications.map((n) => (
                <button
                  key={n.id}
                  onClick={() => handleClick(n)}
                  className={`
                    group w-full px-4 py-3 text-left transition
                    hover:bg-base-200/60
                    focus:outline-none
                    ${!n.read ? "bg-primary/5" : ""}
                  `}
                >
                  <div className="flex items-start gap-3">
                    {!n.read && (
                      <span className="mt-1 h-2 w-2 rounded-full bg-primary flex-shrink-0" />
                    )}

                    <div className="flex-1">
                      <div className="font-medium leading-tight group-hover:underline">
                        {n.title}
                      </div>

                      {n.description && (
                        <div className="text-xs opacity-60 mt-1 line-clamp-2">
                          {n.description}
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Mobile Fullscreen */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm flex flex-col animate-in fade-in duration-200">
          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3 bg-base-100 border-b shadow-sm">
            <button
              className="btn btn-ghost btn-circle btn-sm"
              onClick={() => setMobileOpen(false)}
            >
              <ChevronLeft size={20} />
            </button>

            <h2 className="font-semibold text-lg">Notificações</h2>
          </div>

          {/* Lista */}
          <div className="flex-1 overflow-y-auto px-4 py-5 space-y-3">
            {notifications.length === 0 && (
              <div className="flex flex-col items-center justify-center gap-3 py-16 opacity-60 text-sm">
                <Bell size={32} />
                Nenhuma notificação
              </div>
            )}

            {notifications.map((n) => (
              <button
                key={n.id}
                onClick={() => handleClick(n)}
                className={`
                  w-full text-left
                  bg-base-100
                  rounded-2xl
                  px-4 py-3
                  border border-base-300
                  shadow-sm
                  transition
                  active:scale-[0.98]
                  hover:shadow-md
                  ${!n.read ? "ring-1 ring-primary/30" : ""}
                `}
              >
                <div className="flex items-start gap-3">
                  {!n.read && (
                    <span className="mt-1 h-2.5 w-2.5 rounded-full bg-primary flex-shrink-0" />
                  )}

                  <div>
                    <div className="font-medium leading-tight">
                      {n.title}
                    </div>

                    {n.description && (
                      <div className="text-xs opacity-60 mt-1">
                        {n.description}
                      </div>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
}