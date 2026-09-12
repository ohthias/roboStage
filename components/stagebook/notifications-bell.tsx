"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Bell, CheckCheck } from "lucide-react";
import {
  markAllNotificationsRead,
  markNotificationRead,
} from "@/lib/stagebook/actions/notifications";
import type { NotificationRow } from "@/db/schema";

function formatRelative(date: Date) {
  const diffMs = Date.now() - new Date(date).getTime();
  const minutes = Math.round(diffMs / 60000);
  if (minutes < 1) return "agora";
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} h`;
  const days = Math.round(hours / 24);
  return `${days} d`;
}

export function NotificationsBell({
  initialNotifications,
}: {
  initialNotifications: NotificationRow[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function readOne(id: string) {
    startTransition(async () => {
      await markNotificationRead(id);
      router.refresh();
    });
  }

  function readAll() {
    startTransition(async () => {
      await markAllNotificationsRead();
      router.refresh();
    });
  }

  return (
    <div className="dropdown dropdown-end">
      <button
        type="button"
        tabIndex={0}
        className="btn btn-ghost btn-sm btn-square relative"
        aria-label="Notificações"
      >
        <Bell size={18} />
        {initialNotifications.length > 0 && (
          <span className="absolute right-1 top-1 flex h-2 w-2 rounded-full bg-primary" />
        )}
      </button>

      <div
        tabIndex={0}
        className="dropdown-content z-50 mt-2 w-80 rounded-xl border border-base-300 bg-base-100 p-2 shadow-xl"
      >
        <div className="flex items-center justify-between px-2 pb-1 pt-1">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-base-content/40">
            Notificações
          </span>
          {initialNotifications.length > 0 && (
            <button
              type="button"
              className="flex items-center gap-1 text-[11px] text-base-content/50 hover:text-base-content"
              onClick={readAll}
              disabled={isPending}
            >
              <CheckCheck size={12} />
              Marcar todas como lidas
            </button>
          )}
        </div>

        {initialNotifications.length === 0 ? (
          <div className="px-3 py-8 text-center text-xs text-base-content/40">
            Você está em dia — nenhuma notificação nova.
          </div>
        ) : (
          <ul className="flex max-h-96 flex-col gap-0.5 overflow-y-auto">
            {initialNotifications.map((n) => (
              <li key={n.id}>
                <button
                  type="button"
                  className="flex w-full flex-col gap-0.5 rounded-lg px-2 py-2 text-left text-sm transition-colors hover:bg-base-200"
                  onClick={() => readOne(n.id)}
                >
                  <span className="flex items-center justify-between gap-2">
                    <span className="font-medium">{n.title}</span>
                    <span className="shrink-0 text-[10px] text-base-content/40">
                      {formatRelative(n.createdAt)}
                    </span>
                  </span>
                  {n.message && (
                    <span className="text-xs text-base-content/60">
                      {n.message}
                    </span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
