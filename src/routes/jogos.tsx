import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Gamepad2, Plus, ShieldCheck, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { HudPanel } from "@/components/hud/hud-panel";
import { ActionButton, Chip } from "@/components/os/ui";
import { amIAdmin, createGame, deleteGame, listGames, updateGame } from "@/lib/games.functions";
import { useHud } from "@/lib/hud-state";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/jogos")({
  head: () => ({
    meta: [
      { title: "Jogos suportados e regras de acesso — Solo Eleveng" },
      {
        name: "description",
        content:
          "Catálogo de jogos suportados pelo HUD, com as regras de acesso às contas e as regras de proteção anti-ban de cada jogo.",
      },
      { property: "og:title", content: "Jogos suportados e regras de acesso — Solo Eleveng" },
      {
        property: "og:description",
        content: "Regras de acesso e proteção de contas por jogo dentro do HUD gamer.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/jogos" }],
  }),
  component: GamesPage,
});

const EMPTY = {
  slug: "",
  name: "",
  hue: "var(--neon-cyan)",
  elevation_enabled: true,
  access_rules_pt: "",
  access_rules_en: "",
  protection_rules_pt: "",
  protection_rules_en: "",
  max_sessions: 1,
  sort_order: 10,
};

function GamesPage() {
  const { lang } = useI18n();
  const { userId } = useHud();
  const queryClient = useQueryClient();

  const fetchGames = useServerFn(listGames);
  const { data: games, isLoading } = useQuery({ queryKey: ["games"], queryFn: () => fetchGames() });

  const checkAdmin = useServerFn(amIAdmin);
  const { data: role } = useQuery({
    queryKey: ["am-i-admin"],
    queryFn: () => checkAdmin(),
    enabled: Boolean(userId),
  });
  const isAdmin = Boolean(role?.admin);

  const createFn = useServerFn(createGame);
  const updateFn = useServerFn(updateGame);
  const deleteFn = useServerFn(deleteGame);
  const [form, setForm] = useState(EMPTY);
  const [editing, setEditing] = useState<string | null>(null);

  const invalidate = () => void queryClient.invalidateQueries({ queryKey: ["games"] });

  const save = useMutation({
    mutationFn: () =>
      editing
        ? updateFn({ data: { id: editing, patch: form } })
        : createFn({ data: { ...form, slug: form.slug || form.name.toLowerCase().replace(/[^a-z0-9]+/g, "-") } }),
    onSuccess: () => {
      invalidate();
      setForm(EMPTY);
      setEditing(null);
      toast.success(lang === "pt" ? "Jogo gravado" : "Game saved");
    },
    onError: () => toast.error(lang === "pt" ? "Não foi possível gravar" : "Could not save"),
  });

  const remove = useMutation({
    mutationFn: (id: string) => deleteFn({ data: { id } }),
    onSuccess: () => {
      invalidate();
      toast.success(lang === "pt" ? "Jogo removido" : "Game removed");
    },
    onError: () => toast.error(lang === "pt" ? "Não foi possível remover" : "Could not remove"),
  });

  const input = "w-full rounded-md border border-border bg-background px-2 py-1.5 text-xs";

  return (
    <div className="space-y-4">
      <h1 className="font-display text-2xl">
        {lang === "pt" ? "Jogos suportados" : "Supported games"}
      </h1>
      <p className="text-[12px] text-muted-foreground">
        {lang === "pt"
          ? "Cada jogo define como a conta é partilhada com segurança e quais limites protegem contra banimento."
          : "Each game defines how the account is shared safely and which limits protect against bans."}
      </p>

      {isAdmin && (
        <HudPanel title={editing ? (lang === "pt" ? "Editar jogo" : "Edit game") : lang === "pt" ? "Novo jogo" : "New game"}>
          <div className="grid gap-2 sm:grid-cols-2">
            <input
              className={input}
              placeholder={lang === "pt" ? "Nome do jogo" : "Game name"}
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            />
            <input
              className={input}
              placeholder="identificador (ex.: valorant)"
              value={form.slug}
              onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
            />
            <textarea
              className={input}
              rows={2}
              placeholder={lang === "pt" ? "Regras de acesso (PT)" : "Access rules (PT)"}
              value={form.access_rules_pt}
              onChange={(e) => setForm((f) => ({ ...f, access_rules_pt: e.target.value }))}
            />
            <textarea
              className={input}
              rows={2}
              placeholder="Access rules (EN)"
              value={form.access_rules_en}
              onChange={(e) => setForm((f) => ({ ...f, access_rules_en: e.target.value }))}
            />
            <textarea
              className={input}
              rows={2}
              placeholder={lang === "pt" ? "Regras de proteção (PT)" : "Protection rules (PT)"}
              value={form.protection_rules_pt}
              onChange={(e) => setForm((f) => ({ ...f, protection_rules_pt: e.target.value }))}
            />
            <textarea
              className={input}
              rows={2}
              placeholder="Protection rules (EN)"
              value={form.protection_rules_en}
              onChange={(e) => setForm((f) => ({ ...f, protection_rules_en: e.target.value }))}
            />
            <input
              className={input}
              inputMode="numeric"
              placeholder={lang === "pt" ? "Sessões simultâneas" : "Simultaneous sessions"}
              value={String(form.max_sessions)}
              onChange={(e) => setForm((f) => ({ ...f, max_sessions: Number(e.target.value) || 1 }))}
            />
            <label className="flex items-center gap-2 text-[11px] text-muted-foreground">
              <input
                type="checkbox"
                checked={form.elevation_enabled}
                onChange={(e) => setForm((f) => ({ ...f, elevation_enabled: e.target.checked }))}
              />
              {lang === "pt" ? "Aceita elevação" : "Elevation allowed"}
            </label>
          </div>
          <div className="mt-3 flex gap-2">
            <ActionButton onClick={() => save.mutate()}>
              <span className="inline-flex items-center gap-1.5">
                <Plus className="h-3.5 w-3.5" />
                {lang === "pt" ? "Gravar" : "Save"}
              </span>
            </ActionButton>
            {editing && (
              <ActionButton
                variant="ghost"
                onClick={() => {
                  setEditing(null);
                  setForm(EMPTY);
                }}
              >
                {lang === "pt" ? "Cancelar" : "Cancel"}
              </ActionButton>
            )}
          </div>
        </HudPanel>
      )}

      {isLoading && <p className="text-xs text-muted-foreground">{lang === "pt" ? "A carregar..." : "Loading..."}</p>}

      <div className="grid gap-3 sm:grid-cols-2">
        {(games ?? []).map((g) => (
          <HudPanel key={g.id} glow={g.hue}>
            <div className="flex items-center gap-2">
              <Gamepad2 className="h-4 w-4" style={{ color: g.hue }} />
              <p className="flex-1 font-display text-sm">{g.name}</p>
              <Chip glow={g.elevation_enabled ? "var(--neon-green)" : "var(--muted-foreground)"}>
                {g.elevation_enabled
                  ? lang === "pt"
                    ? "Elevação ativa"
                    : "Elevation on"
                  : lang === "pt"
                    ? "Pausado"
                    : "Paused"}
              </Chip>
            </div>
            <p className="mt-2 text-[11px] text-muted-foreground">
              <span className="font-display text-foreground">{lang === "pt" ? "Acesso: " : "Access: "}</span>
              {lang === "pt" ? g.access_rules_pt : g.access_rules_en}
            </p>
            <p className="mt-1.5 flex gap-1.5 text-[11px] text-muted-foreground">
              <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-neon-green" />
              {lang === "pt" ? g.protection_rules_pt : g.protection_rules_en}
            </p>
            <p className="mt-1.5 text-[10px] tracking-wider text-muted-foreground uppercase">
              {lang === "pt" ? "Sessões simultâneas" : "Simultaneous sessions"}: {g.max_sessions}
            </p>
            {isAdmin && (
              <div className="mt-3 flex gap-2">
                <ActionButton
                  variant="ghost"
                  onClick={() => {
                    setEditing(g.id);
                    setForm({
                      slug: g.slug,
                      name: g.name,
                      hue: g.hue,
                      elevation_enabled: g.elevation_enabled,
                      access_rules_pt: g.access_rules_pt,
                      access_rules_en: g.access_rules_en,
                      protection_rules_pt: g.protection_rules_pt,
                      protection_rules_en: g.protection_rules_en,
                      max_sessions: g.max_sessions,
                      sort_order: g.sort_order,
                    });
                  }}
                >
                  {lang === "pt" ? "Editar" : "Edit"}
                </ActionButton>
                <ActionButton variant="ghost" onClick={() => remove.mutate(g.id)}>
                  <span className="inline-flex items-center gap-1.5">
                    <Trash2 className="h-3.5 w-3.5" />
                    {lang === "pt" ? "Remover" : "Remove"}
                  </span>
                </ActionButton>
              </div>
            )}
          </HudPanel>
        ))}
      </div>

      {!userId && (
        <Link to="/auth">
          <ActionButton>{lang === "pt" ? "Entrar" : "Sign in"}</ActionButton>
        </Link>
      )}
    </div>
  );
}
