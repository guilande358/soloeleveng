import { Link } from "@tanstack/react-router";
import {
  Bell,
  Brain,
  CalendarDays,
  Coffee,
  CreditCard,
  Film,
  Gamepad2,
  Heart,
  KeyRound,
  Play,
  Radio,
  Settings,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Store,
  Target,
  Trophy,
  UserRound,
  Users,
  Wallet,
} from "lucide-react";

import { ActionButton, Avatar, Chip, Meter, Row, Sparkline, StatTile } from "@/components/os/ui";
import {
  ACCESSES,
  ACCESS_STATE_LABEL,
  ACHIEVEMENTS,
  AI_INSIGHTS,
  AI_TIMELINE,
  EVENTS,
  FRIENDS,
  GUILD,
  GUILD_CHAT,
  HIGHLIGHTS,
  LIVES,
  LIVE_CHAT,
  MARKET,
  MISSIONS,
  MISSION_CYCLE_LABEL,
  SETTINGS_GROUPS,
  STATS,
  STAT_TREND,
  WALLET,
  WALLET_HISTORY,
  type Bi,
} from "@/data/os";
import { CARDS, CONTRACTS, MEDALS, NOTIFICATIONS, VIDEOS, findCard } from "@/data/game";
import { useHud } from "@/lib/hud-state";
import { useI18n, type Lang } from "@/lib/i18n";

const pick = (b: Bi, lang: Lang) => (lang === "pt" ? b.pt : b.en);

export type PanelDef = {
  id: string;
  title: Bi;
  Icon: React.ComponentType<{ className?: string }>;
  glow: string;
  span: string;
  Widget: () => React.ReactElement;
  Full: () => React.ReactElement;
};

/* ── 1. IA Highlights ─────────────────────────────────────────────────── */

function HighlightsWidget() {
  const { lang } = useI18n();
  const top = HIGHLIGHTS[0]!;
  return (
    <div className="space-y-3">
      <div className="relative aspect-video overflow-hidden rounded-lg border border-border/60 bg-[linear-gradient(140deg,var(--surface-2),var(--background))]">
        <span className="os-fog absolute inset-0 -z-0 opacity-60" aria-hidden />
        <div className="absolute inset-0 grid place-items-center">
          <span className="grid h-14 w-14 place-items-center rounded-full border border-primary/70 bg-background/60 shadow-[0_0_30px_-4px_var(--neon)] transition-transform group-hover:scale-110">
            <Play className="h-6 w-6 text-primary" />
          </span>
        </div>
        <div className="absolute top-2 left-2 flex items-center gap-1.5">
          <Chip glow="var(--neon-pink)">IA</Chip>
          <Chip>{top.game}</Chip>
        </div>
        <span className="absolute right-2 bottom-2 rounded-sm bg-background/80 px-1.5 font-display text-[10px]">
          {top.duration}
        </span>
      </div>
      <div>
        <p className="truncate font-display text-sm">{pick(top.title, lang)}</p>
        <p className="text-[10px] tracking-widest text-muted-foreground uppercase">
          {top.map} · {top.date} · KDA {top.kda}
        </p>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {top.tags.map((tg) => (
          <Chip key={tg} glow="var(--neon-gold)">
            {tg}
          </Chip>
        ))}
      </div>
    </div>
  );
}

function HighlightsFull() {
  const { lang } = useI18n();
  return (
    <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
      <div className="space-y-3">
        <div className="relative aspect-video overflow-hidden rounded-xl border border-border/60 bg-[linear-gradient(140deg,var(--surface-2),var(--background))]">
          <div className="absolute inset-0 grid place-items-center">
            <Play className="h-10 w-10 text-primary" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {HIGHLIGHTS.map((h) => (
            <div key={h.id} className="rounded-lg border border-border/50 bg-surface-2/40 p-2">
              <p className="truncate font-display text-[11px]">{pick(h.title, lang)}</p>
              <p className="text-[9px] tracking-wider text-muted-foreground uppercase">
                {h.game} · {h.duration}
              </p>
            </div>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          <ActionButton>{lang === "pt" ? "Baixar" : "Download"}</ActionButton>
          <ActionButton variant="ghost">{lang === "pt" ? "Compartilhar" : "Share"}</ActionButton>
          <ActionButton variant="ghost">{lang === "pt" ? "Editar" : "Edit"}</ActionButton>
        </div>
      </div>
      <div className="space-y-3">
        <div className="rounded-xl border border-border/50 bg-surface-2/40 p-3">
          <p className="mb-2 flex items-center gap-1.5 font-display text-[11px] tracking-[0.18em] uppercase">
            <Brain className="h-3.5 w-3.5 text-neon-cyan" /> Timeline IA
          </p>
          {AI_TIMELINE.map((e) => (
            <Row key={e.at} label={pick(e, lang)} value={e.at} glow="var(--neon-cyan)" />
          ))}
        </div>
        <div className="rounded-xl border border-border/50 bg-surface-2/40 p-3">
          <p className="mb-2 flex items-center gap-1.5 font-display text-[11px] tracking-[0.18em] uppercase">
            <Sparkles className="h-3.5 w-3.5 text-neon-gold" />
            {lang === "pt" ? "Análise" : "Analysis"}
          </p>
          <ul className="space-y-1.5 text-[11px] text-muted-foreground">
            {AI_INSIGHTS.map((i) => (
              <li key={i.en}>· {pick(i, lang)}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

/* ── 2. Lives ─────────────────────────────────────────────────────────── */

function LivesWidget() {
  return (
    <div className="scroll-hidden flex gap-2 overflow-x-auto">
      {LIVES.map((l) => (
        <div
          key={l.id}
          className="w-32 shrink-0 rounded-lg border border-border/50 bg-surface-2/40 p-2"
        >
          <div
            className="mb-2 grid h-14 place-items-center rounded-md border border-border/50"
            style={{ background: `radial-gradient(circle at 50% 40%, ${l.hue}33, transparent)` }}
          >
            <Radio className="h-4 w-4" style={{ color: l.hue }} />
          </div>
          <div className="flex items-center gap-1.5">
            <Avatar name={l.user} glow={l.hue} />
            <div className="min-w-0">
              <p className="truncate font-display text-[10px]">{l.user}</p>
              <p className="truncate text-[9px] text-muted-foreground">{l.game}</p>
            </div>
          </div>
          <p className="mt-1.5 text-[9px] tracking-wider text-muted-foreground uppercase">
            {l.viewers} · {l.uptime}
          </p>
        </div>
      ))}
    </div>
  );
}

function LivesFull() {
  const { lang } = useI18n();
  const live = LIVES[0]!;
  return (
    <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
      <div className="space-y-3">
        <div className="relative aspect-video overflow-hidden rounded-xl border border-border/60 bg-[linear-gradient(140deg,var(--surface-2),var(--background))]">
          <span className="absolute top-2 left-2">
            <Chip glow="var(--neon-pink)">LIVE</Chip>
          </span>
          <div className="absolute inset-0 grid place-items-center">
            <Radio className="h-10 w-10 text-neon-pink" />
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <ActionButton>
            <span className="flex items-center gap-1.5">
              <Coffee className="h-3.5 w-3.5" /> {lang === "pt" ? "Enviar café" : "Send coffee"}
            </span>
          </ActionButton>
          <ActionButton variant="ghost">
            <span className="flex items-center gap-1.5">
              <Heart className="h-3.5 w-3.5" /> {lang === "pt" ? "Curtir" : "Like"}
            </span>
          </ActionButton>
          <ActionButton variant="ghost">{lang === "pt" ? "Compartilhar" : "Share"}</ActionButton>
          <span className="text-[10px] tracking-wider text-muted-foreground uppercase">
            {live.user} · {live.viewers}
          </span>
        </div>
      </div>
      <div className="rounded-xl border border-border/50 bg-surface-2/40 p-3">
        <p className="mb-2 font-display text-[11px] tracking-[0.18em] uppercase">Chat</p>
        <ul className="space-y-2 text-[11px]">
          {LIVE_CHAT.map((c) => (
            <li key={c.user} className="flex gap-2">
              <span className="font-display text-neon-cyan">{c.user}</span>
              <span className="text-muted-foreground">{pick(c, lang)}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/* ── 3. Minha Carta ───────────────────────────────────────────────────── */

function MyCardWidget() {
  const { activeCardId } = useHud();
  const card = findCard(activeCardId ?? undefined) ?? CARDS[5]!;
  return (
    <div className="flex items-center gap-3">
      <div
        className="os-float-card grid h-24 w-16 shrink-0 place-items-center rounded-lg border font-display text-[10px]"
        style={{
          borderColor: card.glow,
          background: `linear-gradient(160deg, ${card.glow}33, transparent)`,
          boxShadow: `0 0 26px -6px ${card.glow}`,
        }}
      >
        {card.name}
      </div>
      <div className="min-w-0 flex-1 space-y-1.5">
        <p className="font-display text-sm" style={{ color: card.glow }}>
          {card.name} Card
        </p>
        <Meter value={12450} max={18000} glow={card.glow} />
        <p className="text-[10px] tracking-wider text-muted-foreground uppercase">
          Lv 82 · {card.medals} med · {card.targetRank}
        </p>
      </div>
    </div>
  );
}

function MyCardFull() {
  const { lang } = useI18n();
  const { activeCardId } = useHud();
  const card = findCard(activeCardId ?? undefined) ?? CARDS[5]!;
  return (
    <div className="grid gap-4 sm:grid-cols-[auto_1fr]">
      <div
        className="os-float-card mx-auto grid h-64 w-44 place-items-center rounded-2xl border font-display"
        style={{
          borderColor: card.glow,
          background: `linear-gradient(160deg, ${card.glow}44, transparent 70%)`,
          boxShadow: `0 0 60px -12px ${card.glow}`,
          transform: "perspective(900px) rotateY(-10deg)",
        }}
      >
        {card.name}
      </div>
      <div className="space-y-2">
        <Row label={lang === "pt" ? "Rank atual" : "Current rank"} value={card.currentRank} />
        <Row label={lang === "pt" ? "Rank objetivo" : "Target rank"} value={card.targetRank} glow={card.glow} />
        <Row label={lang === "pt" ? "Medalhas" : "Medals"} value={card.medals} />
        <Row label={lang === "pt" ? "Tempo restante" : "Time left"} value={`${card.days} ${lang === "pt" ? "dias" : "days"}`} />
        <Row label="XP" value="12 450 / 18 000" />
        <div className="flex flex-wrap gap-2 pt-2">
          <Link to="/cartas">
            <ActionButton>{lang === "pt" ? "Upgrade" : "Upgrade"}</ActionButton>
          </Link>
          <Link to="/perfil">
            <ActionButton variant="ghost">{lang === "pt" ? "Histórico" : "History"}</ActionButton>
          </Link>
        </div>
      </div>
    </div>
  );
}

/* ── 4. Guilda ────────────────────────────────────────────────────────── */

function GuildWidget() {
  const { lang } = useI18n();
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Avatar name={GUILD.tag} glow="var(--neon-gold)" />
        <div className="min-w-0">
          <p className="truncate font-display text-[12px]">{GUILD.name}</p>
          <p className="text-[9px] tracking-wider text-muted-foreground uppercase">
            Rank {GUILD.rank} · {GUILD.online} online
          </p>
        </div>
      </div>
      <Meter value={GUILD.xp} max={GUILD.xpMax} glow="var(--neon-gold)" />
      <p className="text-[10px] text-muted-foreground">
        {GUILD.members} {lang === "pt" ? "membros" : "members"}
      </p>
    </div>
  );
}

function GuildFull() {
  const { lang } = useI18n();
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="space-y-2">
        <Row label="Ranking" value={GUILD.rank} glow="var(--neon-gold)" />
        <Row label="XP" value={`${GUILD.xp} / ${GUILD.xpMax}`} />
        <Row label={lang === "pt" ? "Membros" : "Members"} value={GUILD.members} />
        <Row label={lang === "pt" ? "Online" : "Online"} value={GUILD.online} glow="var(--neon-green)" />
        <div className="pt-2">
          <p className="mb-1.5 font-display text-[11px] tracking-[0.18em] uppercase">
            {lang === "pt" ? "Eventos" : "Events"}
          </p>
          {EVENTS.map((e) => (
            <Row key={e.id} label={pick(e.label, lang)} value={pick(e.when, lang)} glow={e.hue} />
          ))}
        </div>
      </div>
      <div className="rounded-xl border border-border/50 bg-surface-2/40 p-3">
        <p className="mb-2 font-display text-[11px] tracking-[0.18em] uppercase">Chat</p>
        <ul className="space-y-2 text-[11px]">
          {GUILD_CHAT.map((c) => (
            <li key={c.user} className="flex gap-2">
              <span className="font-display text-neon-gold">{c.user}</span>
              <span className="text-muted-foreground">{pick(c, lang)}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/* ── 5. Acessos ───────────────────────────────────────────────────────── */

function AccessWidget() {
  const { lang } = useI18n();
  return (
    <div>
      {ACCESSES.map((a) => (
        <Row
          key={a.id}
          label={a.game}
          value={pick(ACCESS_STATE_LABEL[a.state], lang)}
          glow={a.state === "protected" ? "var(--neon-green)" : a.state === "review" ? "var(--neon-gold)" : undefined}
        />
      ))}
    </div>
  );
}

function AccessFull() {
  const { lang } = useI18n();
  return (
    <div className="space-y-3">
      <p className="text-[11px] text-muted-foreground">
        {lang === "pt"
          ? "Sessões autorizadas por você, com links cifrados e revogação imediata. Use sempre de acordo com os termos de cada jogo."
          : "Sessions you authorized, with encrypted links and instant revocation. Always use within each game's terms of service."}
      </p>
      <div className="grid gap-2 sm:grid-cols-2">
        {ACCESSES.map((a) => (
          <div key={a.id} className="rounded-xl border border-border/50 bg-surface-2/40 p-3">
            <div className="flex items-center justify-between gap-2">
              <p className="font-display text-[12px]">{a.game}</p>
              <Chip glow="var(--neon-green)">{pick(ACCESS_STATE_LABEL[a.state], lang)}</Chip>
            </div>
            <Row label={lang === "pt" ? "Sessões" : "Sessions"} value={a.sessions} />
            <Row label={lang === "pt" ? "Dispositivo" : "Device"} value={a.device} />
            <Row label={lang === "pt" ? "Último login" : "Last login"} value={a.lastLogin} />
            <div className="mt-2 flex gap-2">
              <ActionButton variant="ghost">{lang === "pt" ? "Revogar" : "Revoke"}</ActionButton>
            </div>
          </div>
        ))}
      </div>
      <p className="flex items-center gap-1.5 text-[10px] tracking-wider text-muted-foreground uppercase">
        <ShieldCheck className="h-3.5 w-3.5 text-neon-green" />
        {lang === "pt" ? "Proteção de conta ativa" : "Account protection active"}
      </p>
    </div>
  );
}

/* ── 6. Contratos ─────────────────────────────────────────────────────── */

function ContractsWidget() {
  return (
    <div>
      {CONTRACTS.map((c) => (
        <Row
          key={c.id}
          label={c.card}
          value={c.time}
          glow={c.status === "running" ? "var(--neon-cyan)" : "var(--neon-green)"}
        />
      ))}
    </div>
  );
}

function ContractsFull() {
  const { lang } = useI18n();
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {CONTRACTS.map((c) => (
        <div key={c.id} className="rounded-xl border border-border/50 bg-surface-2/40 p-3">
          <div className="flex items-center justify-between gap-2">
            <p className="font-display text-[12px]">{c.card}</p>
            <Chip glow={c.status === "running" ? "var(--neon-cyan)" : "var(--neon-green)"}>
              {c.status === "running"
                ? lang === "pt"
                  ? "Em curso"
                  : "Running"
                : lang === "pt"
                  ? "Concluído"
                  : "Done"}
            </Chip>
          </div>
          <Row label={lang === "pt" ? "Objetivo" : "Objective"} value={c.objective} />
          <Row label={lang === "pt" ? "Duração" : "Duration"} value={c.time} />
          <Row label={lang === "pt" ? "Jogador" : "Player"} value="ProPlayerBR" />
        </div>
      ))}
    </div>
  );
}

/* ── 7. Amigos ────────────────────────────────────────────────────────── */

const FRIEND_HUE: Record<string, string> = {
  live: "var(--neon-pink)",
  party: "var(--neon-cyan)",
  online: "var(--neon-green)",
  offline: "var(--muted-foreground)",
};

function FriendsWidget() {
  return (
    <div className="flex flex-wrap gap-2">
      {FRIENDS.slice(0, 6).map((f) => (
        <div key={f.id} className="flex items-center gap-1.5">
          <Avatar name={f.name} glow={FRIEND_HUE[f.status]} />
        </div>
      ))}
    </div>
  );
}

function FriendsFull() {
  const { lang } = useI18n();
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {FRIENDS.map((f) => (
        <div
          key={f.id}
          className="flex items-center gap-3 rounded-xl border border-border/50 bg-surface-2/40 p-3"
        >
          <Avatar name={f.name} glow={FRIEND_HUE[f.status]} />
          <div className="min-w-0 flex-1">
            <p className="truncate font-display text-[12px]">{f.name}</p>
            <p className="text-[10px] text-muted-foreground">{f.game}</p>
          </div>
          <Chip glow={FRIEND_HUE[f.status]}>
            {f.status === "live"
              ? "LIVE"
              : f.status === "party"
                ? "PARTY"
                : f.status === "online"
                  ? lang === "pt"
                    ? "ONLINE"
                    : "ONLINE"
                  : "OFFLINE"}
          </Chip>
        </div>
      ))}
    </div>
  );
}

/* ── 8. Missões ───────────────────────────────────────────────────────── */

function MissionsWidget() {
  const { lang } = useI18n();
  return (
    <div className="space-y-2">
      {MISSIONS.slice(0, 3).map((m) => (
        <div key={m.id}>
          <div className="flex items-center justify-between gap-2 text-[10px]">
            <span className="truncate text-muted-foreground">{pick(m.label, lang)}</span>
            <span className="font-display">
              {m.progress}/{m.total}
            </span>
          </div>
          <div className="mt-1">
            <Meter value={m.progress} max={m.total} glow="var(--neon-green)" />
          </div>
        </div>
      ))}
    </div>
  );
}

function MissionsFull() {
  const { lang } = useI18n();
  return (
    <div className="space-y-2">
      {MISSIONS.map((m) => (
        <div key={m.id} className="rounded-xl border border-border/50 bg-surface-2/40 p-3">
          <div className="mb-1.5 flex items-center justify-between gap-2">
            <p className="truncate font-display text-[12px]">{pick(m.label, lang)}</p>
            <Chip glow="var(--neon-green)">{pick(MISSION_CYCLE_LABEL[m.cycle], lang)}</Chip>
          </div>
          <Meter value={m.progress} max={m.total} glow="var(--neon-green)" />
          <p className="mt-1.5 text-[10px] tracking-wider text-muted-foreground uppercase">
            {m.progress}/{m.total} · +{m.xp} XP
          </p>
        </div>
      ))}
    </div>
  );
}

/* ── 9. Carteira ──────────────────────────────────────────────────────── */

function WalletWidget() {
  const { lang } = useI18n();
  return (
    <div className="space-y-2">
      <p className="text-glow font-display text-lg">{WALLET.balance}</p>
      <Row label={lang === "pt" ? "Ganhos" : "Earnings"} value={WALLET.earnings} glow="var(--neon-green)" />
      <Row label={lang === "pt" ? "Cafés" : "Coffees"} value={WALLET.coffees} glow="var(--neon-gold)" />
    </div>
  );
}

function WalletFull() {
  const { lang } = useI18n();
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="space-y-2">
        <StatTile label={lang === "pt" ? "Saldo" : "Balance"} value={WALLET.balance} />
        <Row label={lang === "pt" ? "Ganhos totais" : "Total earnings"} value={WALLET.earnings} />
        <Row label={lang === "pt" ? "Pendente" : "Pending"} value={WALLET.pending} />
        <Row label={lang === "pt" ? "Cafés" : "Coffees"} value={WALLET.coffees} glow="var(--neon-gold)" />
        <div className="pt-2">
          <ActionButton>{lang === "pt" ? "Saque" : "Withdraw"}</ActionButton>
        </div>
      </div>
      <div className="rounded-xl border border-border/50 bg-surface-2/40 p-3">
        <p className="mb-2 font-display text-[11px] tracking-[0.18em] uppercase">
          {lang === "pt" ? "Histórico" : "History"}
        </p>
        {WALLET_HISTORY.map((h) => (
          <Row key={h.id} label={`${pick(h, lang)} · ${h.date}`} value={h.value} />
        ))}
      </div>
    </div>
  );
}

/* ── 10. Estatísticas ─────────────────────────────────────────────────── */

function StatsWidget() {
  const { lang } = useI18n();
  return (
    <div className="grid grid-cols-3 gap-2">
      {STATS.slice(0, 6).map((s) => (
        <StatTile key={s.en} label={pick(s, lang)} value={s.value} />
      ))}
    </div>
  );
}

function StatsFull() {
  const { lang } = useI18n();
  return (
    <div className="space-y-4">
      <Sparkline data={STAT_TREND} />
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {STATS.map((s) => (
          <StatTile key={s.en} label={pick(s, lang)} value={s.value} />
        ))}
      </div>
    </div>
  );
}

/* ── 11. Notificações ─────────────────────────────────────────────────── */

function NotificationsWidget() {
  const { lang } = useI18n();
  return (
    <div>
      {NOTIFICATIONS.slice(0, 3).map((n) => (
        <Row
          key={n.id}
          label={lang === "pt" ? n.titlePt : n.titleEn}
          value={n.time}
          glow="var(--neon-cyan)"
        />
      ))}
    </div>
  );
}

function NotificationsFull() {
  const { lang } = useI18n();
  return (
    <div className="space-y-2">
      {NOTIFICATIONS.map((n) => (
        <div key={n.id} className="rounded-xl border border-border/50 bg-surface-2/40 p-3">
          <div className="flex items-center justify-between gap-2">
            <p className="truncate font-display text-[12px]">{lang === "pt" ? n.titlePt : n.titleEn}</p>
            <span className="text-[10px] text-muted-foreground">{n.time}</span>
          </div>
          <p className="text-[11px] text-muted-foreground">{lang === "pt" ? n.bodyPt : n.bodyEn}</p>
        </div>
      ))}
      <Link to="/notificacoes" className="inline-block pt-1">
        <ActionButton variant="ghost">{lang === "pt" ? "Central completa" : "Full center"}</ActionButton>
      </Link>
    </div>
  );
}

/* ── 12. Eventos ──────────────────────────────────────────────────────── */

function EventsWidget() {
  const { lang } = useI18n();
  return (
    <div>
      {EVENTS.map((e) => (
        <Row key={e.id} label={pick(e.label, lang)} value={pick(e.when, lang)} glow={e.hue} />
      ))}
    </div>
  );
}

function EventsFull() {
  const { lang } = useI18n();
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {EVENTS.map((e) => (
        <div key={e.id} className="rounded-xl border border-border/50 bg-surface-2/40 p-3">
          <p className="font-display text-[12px]" style={{ color: e.hue }}>
            {pick(e.label, lang)}
          </p>
          <p className="text-[11px] text-muted-foreground">{pick(e.when, lang)}</p>
          <div className="mt-2">
            <ActionButton variant="ghost">{lang === "pt" ? "Confirmar" : "Confirm"}</ActionButton>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── 13. Replays ──────────────────────────────────────────────────────── */

function ReplaysWidget() {
  const { lang } = useI18n();
  return (
    <div>
      {VIDEOS.map((v) => (
        <Row
          key={v.id}
          label={lang === "pt" ? v.titlePt : v.titleEn}
          value={v.duration}
          glow="var(--neon-pink)"
        />
      ))}
    </div>
  );
}

function ReplaysFull() {
  const { lang } = useI18n();
  return (
    <div className="grid gap-2 sm:grid-cols-3">
      {VIDEOS.map((v) => (
        <div key={v.id} className="rounded-xl border border-border/50 bg-surface-2/40 p-2">
          <div className="mb-2 grid aspect-video place-items-center rounded-md border border-border/50 bg-background/60">
            <Play className="h-6 w-6 text-neon-pink" />
          </div>
          <p className="truncate font-display text-[11px]">{lang === "pt" ? v.titlePt : v.titleEn}</p>
          <p className="text-[9px] tracking-wider text-muted-foreground uppercase">
            {v.duration} · {v.date}
          </p>
        </div>
      ))}
    </div>
  );
}

/* ── 14. Marketplace ──────────────────────────────────────────────────── */

function MarketWidget() {
  const { lang } = useI18n();
  return (
    <div>
      {MARKET.slice(0, 4).map((m) => (
        <Row key={m.id} label={pick(m.label, lang)} value={m.price} glow={m.hue} />
      ))}
    </div>
  );
}

function MarketFull() {
  const { lang } = useI18n();
  return (
    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
      {MARKET.map((m) => (
        <div key={m.id} className="rounded-xl border border-border/50 bg-surface-2/40 p-3">
          <div
            className="mb-2 grid h-20 place-items-center rounded-md"
            style={{ background: `radial-gradient(circle at 50% 40%, ${m.hue}44, transparent)` }}
          >
            <ShoppingBag className="h-5 w-5" style={{ color: m.hue }} />
          </div>
          <p className="truncate font-display text-[12px]">{pick(m.label, lang)}</p>
          <p className="text-[11px] text-muted-foreground">{m.price}</p>
          <div className="mt-2">
            <Link to="/checkout">
              <ActionButton>{lang === "pt" ? "Comprar" : "Buy"}</ActionButton>
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── 15. Perfil ───────────────────────────────────────────────────────── */

function ProfileWidget() {
  const { profile } = useHud();
  return (
    <div className="flex items-center gap-3">
      <Avatar name={profile.name} glow={profile.accent} size="lg" />
      <div className="min-w-0">
        <p className="truncate font-display text-sm">{profile.name}</p>
        <p className="truncate text-[10px] tracking-wider text-muted-foreground uppercase">
          {profile.title}
        </p>
        <div className="mt-1.5 flex gap-1">
          {MEDALS.slice(0, 4).map((m) => (
            <span
              key={m.id}
              className="h-2 w-2 rounded-full"
              style={{ background: m.glow, boxShadow: `0 0 8px ${m.glow}` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function ProfileFull() {
  const { lang } = useI18n();
  const { profile } = useHud();
  return (
    <div className="space-y-4">
      <div
        className="relative h-28 overflow-hidden rounded-xl border border-border/60"
        style={{ background: `linear-gradient(120deg, ${profile.accent}55, transparent)` }}
      >
        <div className="absolute bottom-2 left-3 flex items-center gap-3">
          <Avatar name={profile.name} glow={profile.accent} size="lg" />
          <div>
            <p className="font-display text-sm">{profile.name}</p>
            <p className="text-[10px] tracking-wider text-muted-foreground uppercase">{profile.title}</p>
          </div>
        </div>
      </div>
      <p className="text-[12px] text-muted-foreground">{profile.bio}</p>
      <div className="grid gap-2 sm:grid-cols-2">
        <div className="rounded-xl border border-border/50 bg-surface-2/40 p-3">
          <p className="mb-2 font-display text-[11px] tracking-[0.18em] uppercase">
            {lang === "pt" ? "Medalhas" : "Medals"}
          </p>
          {MEDALS.map((m) => (
            <Row key={m.id} label={lang === "pt" ? m.labelPt : m.labelEn} value="★" glow={m.glow} />
          ))}
        </div>
        <div className="rounded-xl border border-border/50 bg-surface-2/40 p-3">
          <p className="mb-2 font-display text-[11px] tracking-[0.18em] uppercase">
            {lang === "pt" ? "Conquistas" : "Achievements"}
          </p>
          {ACHIEVEMENTS.map((a) => (
            <Row key={a.id} label={pick(a.label, lang)} value="✓" glow="var(--neon-green)" />
          ))}
        </div>
      </div>
      <Link to="/perfil">
        <ActionButton>{lang === "pt" ? "Editar perfil" : "Edit profile"}</ActionButton>
      </Link>
    </div>
  );
}

/* ── 16. Configurações ────────────────────────────────────────────────── */

function SettingsWidget() {
  const { lang } = useI18n();
  return (
    <div>
      {SETTINGS_GROUPS.slice(0, 4).map((s) => (
        <Row key={s.id} label={pick(s.label, lang)} value={pick(s.value, lang)} />
      ))}
    </div>
  );
}

function SettingsFull() {
  const { lang, setLang } = useI18n();
  return (
    <div className="space-y-3">
      {SETTINGS_GROUPS.map((s) => (
        <Row key={s.id} label={pick(s.label, lang)} value={pick(s.value, lang)} />
      ))}
      <div className="flex gap-2 pt-2">
        <ActionButton variant={lang === "pt" ? "primary" : "ghost"} onClick={() => setLang("pt")}>
          PT
        </ActionButton>
        <ActionButton variant={lang === "en" ? "primary" : "ghost"} onClick={() => setLang("en")}>
          EN
        </ActionButton>
      </div>
    </div>
  );
}

/* ── Registry ─────────────────────────────────────────────────────────── */

export const PANELS: PanelDef[] = [
  {
    id: "ai",
    title: { pt: "IA Highlights", en: "AI Highlights" },
    Icon: Brain,
    glow: "var(--neon-pink)",
    span: "sm:col-span-2 sm:row-span-2",
    Widget: HighlightsWidget,
    Full: HighlightsFull,
  },
  { id: "lives", title: { pt: "Lives dos amigos", en: "Friends live" }, Icon: Radio, glow: "var(--neon-cyan)", span: "", Widget: LivesWidget, Full: LivesFull },
  { id: "card", title: { pt: "Minha carta", en: "My card" }, Icon: Sparkles, glow: "var(--rarity-diamond)", span: "", Widget: MyCardWidget, Full: MyCardFull },
  { id: "guild", title: { pt: "Guilda", en: "Guild" }, Icon: Trophy, glow: "var(--neon-gold)", span: "", Widget: GuildWidget, Full: GuildFull },
  { id: "access", title: { pt: "Acessos", en: "Access" }, Icon: KeyRound, glow: "var(--neon-green)", span: "", Widget: AccessWidget, Full: AccessFull },
  { id: "contracts", title: { pt: "Contratos", en: "Contracts" }, Icon: Gamepad2, glow: "var(--neon)", span: "", Widget: ContractsWidget, Full: ContractsFull },
  { id: "friends", title: { pt: "Amigos", en: "Friends" }, Icon: Users, glow: "var(--neon-cyan)", span: "", Widget: FriendsWidget, Full: FriendsFull },
  { id: "missions", title: { pt: "Missões", en: "Missions" }, Icon: Target, glow: "var(--neon-green)", span: "", Widget: MissionsWidget, Full: MissionsFull },
  { id: "wallet", title: { pt: "Carteira", en: "Wallet" }, Icon: Wallet, glow: "var(--neon-gold)", span: "", Widget: WalletWidget, Full: WalletFull },
  { id: "stats", title: { pt: "Estatísticas", en: "Statistics" }, Icon: CreditCard, glow: "var(--neon-cyan)", span: "", Widget: StatsWidget, Full: StatsFull },
  { id: "notifications", title: { pt: "Notificações", en: "Notifications" }, Icon: Bell, glow: "var(--neon-pink)", span: "", Widget: NotificationsWidget, Full: NotificationsFull },
  { id: "events", title: { pt: "Eventos", en: "Events" }, Icon: CalendarDays, glow: "var(--neon-gold)", span: "", Widget: EventsWidget, Full: EventsFull },
  { id: "replays", title: { pt: "Replays", en: "Replays" }, Icon: Film, glow: "var(--neon-pink)", span: "", Widget: ReplaysWidget, Full: ReplaysFull },
  { id: "market", title: { pt: "Marketplace", en: "Marketplace" }, Icon: Store, glow: "var(--neon)", span: "", Widget: MarketWidget, Full: MarketFull },
  { id: "profile", title: { pt: "Perfil", en: "Profile" }, Icon: UserRound, glow: "var(--neon)", span: "", Widget: ProfileWidget, Full: ProfileFull },
  { id: "settings", title: { pt: "Configurações", en: "Settings" }, Icon: Settings, glow: "var(--neon-cyan)", span: "", Widget: SettingsWidget, Full: SettingsFull },
];

export { pick };
