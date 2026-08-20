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
  ShoppingBag,
  Sparkles,
  Store,
  Target,
  Trophy,
  UserRound,
  Users,
  Wallet,
} from "lucide-react";

import { AccessFull, AccessWidget } from "@/components/os/access-panel";
import { ContractsFull, ContractsWidget } from "@/components/os/contracts-panel";
import { HighlightsFull, HighlightsWidget } from "@/components/os/highlights-panel";
import { LivesFull, LivesWidget } from "@/components/os/lives-panel";
import { MyCardFull, MyCardWidget } from "@/components/os/mycard-panel";
import { WalletFull, WalletWidget } from "@/components/os/wallet-panel";
import { ActionButton, Avatar, Chip, Meter, Row, Sparkline, StatTile } from "@/components/os/ui";
import {
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



/* ── 2. Lives ─────────────────────────────────────────────────────────── */



/* ── 3. Minha Carta ───────────────────────────────────────────────────── */



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

/* ── 6. Contratos ─────────────────────────────────────────────────────── */



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
