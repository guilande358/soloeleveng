import { createFileRoute } from "@tanstack/react-router";

import { NotificationsPanel } from "@/components/hud/notifications-panel";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/notificacoes")({
  head: () => ({
    meta: [
      { title: "Notificações do HUD — Solo Eleveng Evolution" },
      {
        name: "description",
        content: "Acompanhe pedidos aceitos, entrada do treinador, medalhas e lives em andamento.",
      },
      { property: "og:title", content: "Notificações do HUD" },
      { property: "og:description", content: "Pedidos, treinadores, medalhas e lives." },
      { property: "og:url", content: "/notificacoes" },
    ],
    links: [{ rel: "canonical", href: "/notificacoes" }],
  }),
  component: NotificationsPage,
});

function NotificationsPage() {
  const { t } = useI18n();
  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <h1 className="font-display text-2xl">{t("notif.title")}</h1>
      <NotificationsPanel />
    </div>
  );
}
