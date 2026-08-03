import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Copy, KeyRound, RefreshCw, ShieldOff, ShieldCheck } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { ActionButton, Chip, Row } from "@/components/os/ui";
import { ACCESSES, ACCESS_STATE_LABEL } from "@/data/os";
import { useI18n, type Lang } from "@/lib/i18n";
import { createAccessLink, listAccessLinks, revokeAccessLink } from "@/lib/access.functions";
import { useServerFn } from "@tanstack/react-start";

const pick = (b: { pt: string; en: string }, lang: Lang) => (lang === "pt" ? b.pt : b.en);

function fmtRemaining(iso: string) {
  const ms = new Date(iso).getTime() - Date.now();
  if (ms <= 0) return "00:00";
  const m = Math.floor(ms / 60_000);
  const s = Math.floor((ms % 60_000) / 1000);
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function AccessWidget() {
  const { lang } = useI18n();
  const fetchLinks = useServerFn(listAccessLinks);
  const { data: links } = useQuery({
    queryKey: ["access-links"],
    queryFn: () => fetchLinks(),
  });

  const active = links?.find((l) => !l.revoked && new Date(l.expires_at).getTime() > Date.now());

  return (
    <div className="space-y-2">
      {active ? (
        <>
          <Row label={active.game} value={fmtRemaining(active.expires_at)} glow="var(--neon-green)" />
          <p className="truncate text-[10px] tracking-wider text-muted-foreground uppercase">
            seev.link/{active.token}
          </p>
        </>
      ) : (
        <>
          {ACCESSES.slice(0, 3).map((a) => (
            <Row
              key={a.id}
              label={a.game}
              value={pick(ACCESS_STATE_LABEL[a.state], lang)}
              glow={a.state === "protected" ? "var(--neon-green)" : a.state === "review" ? "var(--neon-gold)" : undefined}
            />
          ))}
        </>
      )}
    </div>
  );
}

export function AccessFull() {
  const { lang, t } = useI18n();
  const queryClient = useQueryClient();
  const fetchLinks = useServerFn(listAccessLinks);
  const createFn = useServerFn(createAccessLink);
  const revokeFn = useServerFn(revokeAccessLink);
  const [game, setGame] = useState("Valorant");

  const { data: links, isLoading } = useQuery({
    queryKey: ["access-links"],
    queryFn: () => fetchLinks(),
  });

  const create = useMutation({
    mutationFn: () => createFn({ data: { game, minutes: 15 } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["access-links"] });
      toast.success(lang === "pt" ? "Link criado" : "Link created");
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : t("auth.error")),
  });

  const revoke = useMutation({
    mutationFn: (id: string) => revokeFn({ data: { id } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["access-links"] });
      toast.success(t("secure.revoked"));
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : t("auth.error")),
  });

  const sorted = useMemo(() => {
    const base = links ?? [];
    return [...base].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [links]);

  return (
    <div className="space-y-4">
      <p className="text-[11px] text-muted-foreground">
        {lang === "pt"
          ? "Sessões autorizadas por você, com links cifrados e revogação imediata. Use sempre de acordo com os termos de cada jogo."
          : "Sessions you authorized, with encrypted links and instant revocation. Always use within each game's terms of service."}
      </p>

      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-border/50 bg-surface-2/40 p-3">
        <KeyRound className="h-4 w-4 text-neon-green" />
        <select
          value={game}
          onChange={(e) => setGame(e.target.value)}
          className="min-w-[8rem] rounded-md border border-border bg-background px-2 py-1.5 text-xs"
        >
          {ACCESSES.map((a) => (
            <option key={a.id} value={a.game}>
              {a.game}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={() => create.mutate()}
          disabled={create.isPending}
          className="ml-auto flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 font-display text-[11px] tracking-[0.16em] text-primary-foreground uppercase transition-transform active:scale-95 disabled:opacity-50"
        >
          <RefreshCw className={create.isPending ? "h-3.5 w-3.5 animate-spin" : "h-3.5 w-3.5"} />
          {t("secure.new")}
        </button>
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        {isLoading && <p className="text-xs text-muted-foreground">{t("common.loading")}</p>}
        {sorted.map((link) => {
          const expired = new Date(link.expires_at).getTime() <= Date.now();
          const active = !link.revoked && !expired && !link.used_at;
          const url = `https://seev.link/${link.token}`;
          return (
            <div key={link.id} className="rounded-xl border border-border/50 bg-surface-2/40 p-3">
              <div className="flex items-center justify-between gap-2">
                <p className="font-display text-[12px]">{link.game}</p>
                <Chip glow={active ? "var(--neon-green)" : "var(--muted-foreground)"}>
                  {active
                    ? lang === "pt"
                      ? "Ativo"
                      : "Active"
                    : link.revoked
                      ? lang === "pt"
                        ? "Revogado"
                        : "Revoked"
                      : lang === "pt"
                        ? "Expirado"
                        : "Expired"}
                </Chip>
              </div>
              <Row label={lang === "pt" ? "Link" : "Link"} value={`seev.link/${link.token}`} />
              <Row label={lang === "pt" ? "Expira" : "Expires"} value={fmtRemaining(link.expires_at)} />
              <div className="mt-2 flex gap-2">
                <button
                  type="button"
                  disabled={!active}
                  onClick={() => {
                    void navigator.clipboard?.writeText(url);
                    toast.success(t("secure.copied"));
                  }}
                  className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-[11px] font-semibold tracking-wider uppercase disabled:opacity-40"
                >
                  <Copy className="h-3.5 w-3.5" />
                  {t("secure.copy")}
                </button>
                <button
                  type="button"
                  disabled={!active || revoke.isPending}
                  onClick={() => revoke.mutate(link.id)}
                  className="flex items-center gap-1.5 rounded-lg border border-destructive/60 px-3 py-1.5 text-[11px] font-semibold tracking-wider text-destructive uppercase disabled:opacity-40"
                >
                  <ShieldOff className="h-3.5 w-3.5" />
                  {t("secure.revoke")}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <p className="flex items-center gap-1.5 text-[10px] tracking-wider text-muted-foreground uppercase">
        <ShieldCheck className="h-3.5 w-3.5 text-neon-green" />
        {lang === "pt" ? "Proteção de conta ativa" : "Account protection active"}
      </p>
    </div>
  );
}
