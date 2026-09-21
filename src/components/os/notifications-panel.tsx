import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";

import { ActionButton, Chip, Row } from "@/components/os/ui";
import { useHud } from "@/lib/hud-state";
import { useI18n } from "@/lib/i18n";
import {
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "@/lib/notifications.functions";

function fmt(iso: string, lang: string) {
  const d = new Date(iso);
  return d.toLocaleString(lang === "pt" ? "pt-PT" : "en-GB", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function useNotifications() {
  const { userId } = useHud();
  const fetchNotifications = useServerFn(listNotifications);
  return useQuery({
    queryKey: ["notifications"],
    queryFn: () => fetchNotifications(),
    enabled: Boolean(userId),
  });
}

export function NotificationsWidget() {
  const { lang } = useI18n();
  const { userId } = useHud();
  const { data } = useNotifications();

  if (!userId) {
    return (
      <p className="text-[11px] text-muted-foreground">
        {lang === "pt" ? "Entre para ver as suas notificações." : "Sign in to see your notifications."}
      </p>
    );
  }

  return (
    <div>
      {(data ?? []).slice(0, 3).map((n) => (
        <Row
          key={n.id}
          label={lang === "pt" ? n.title_pt : n.title_en}
          value={fmt(n.created_at, lang)}
          glow={n.read ? undefined : "var(--neon-cyan)"}
        />
      ))}
      {data && data.length === 0 && (
        <p className="text-[11px] text-muted-foreground">
          {lang === "pt" ? "Sem notificações." : "No notifications."}
        </p>
      )}
    </div>
  );
}

export function NotificationsFull() {
  const { lang } = useI18n();
  const { userId } = useHud();
  const { data, isLoading } = useNotifications();
  const queryClient = useQueryClient();
  const readFn = useServerFn(markNotificationRead);
  const readAllFn = useServerFn(markAllNotificationsRead);

  const invalidate = () => void queryClient.invalidateQueries({ queryKey: ["notifications"] });
  const markOne = useMutation({ mutationFn: (id: string) => readFn({ data: { id } }), onSuccess: invalidate });
  const markAll = useMutation({ mutationFn: () => readAllFn(), onSuccess: invalidate });

  if (!userId) {
    return (
      <div className="space-y-3 text-center">
        <p className="text-[11px] text-muted-foreground">
          {lang === "pt"
            ? "As notificações acompanham pagamentos, cartas, missões e presentes."
            : "Notifications follow payments, cards, missions and gifts."}
        </p>
        <Link to="/auth">
          <ActionButton>{lang === "pt" ? "Entrar" : "Sign in"}</ActionButton>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {isLoading && (
        <p className="text-xs text-muted-foreground">{lang === "pt" ? "A carregar..." : "Loading..."}</p>
      )}
      {(data ?? []).map((n) => (
        <button
          key={n.id}
          type="button"
          onClick={() => (n.read ? undefined : markOne.mutate(n.id))}
          className="w-full rounded-xl border border-border/50 bg-surface-2/40 p-3 text-left"
        >
          <div className="flex items-center justify-between gap-2">
            <p className="truncate font-display text-[12px]">{lang === "pt" ? n.title_pt : n.title_en}</p>
            {n.read ? (
              <span className="text-[10px] text-muted-foreground">{fmt(n.created_at, lang)}</span>
            ) : (
              <Chip glow="var(--neon-cyan)">{lang === "pt" ? "Nova" : "New"}</Chip>
            )}
          </div>
          <p className="text-[11px] text-muted-foreground">{lang === "pt" ? n.body_pt : n.body_en}</p>
        </button>
      ))}
      {data && data.length === 0 && (
        <p className="text-[11px] text-muted-foreground">
          {lang === "pt" ? "Sem notificações." : "No notifications."}
        </p>
      )}
      <div className="flex gap-2 pt-1">
        <ActionButton variant="ghost" onClick={() => markAll.mutate()}>
          {lang === "pt" ? "Marcar todas" : "Mark all read"}
        </ActionButton>
        <Link to="/notificacoes">
          <ActionButton variant="ghost">{lang === "pt" ? "Central completa" : "Full center"}</ActionButton>
        </Link>
      </div>
    </div>
  );
}
