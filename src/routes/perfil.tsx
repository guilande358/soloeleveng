import { createFileRoute } from "@tanstack/react-router";
import { Medal, Play, Swords, Trophy } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { HudPanel } from "@/components/hud/hud-panel";
import { ProgressPanel } from "@/components/hud/progress-panel";
import { SecureAccessPanel } from "@/components/hud/secure-access-panel";
import { JOURNEY, MEDALS, VIDEOS } from "@/data/game";
import { useHud } from "@/lib/hud-state";
import { useI18n } from "@/lib/i18n";
import { glowStyle } from "@/lib/style";

const ACCENTS = [
  "var(--neon)",
  "var(--neon-cyan)",
  "var(--neon-gold)",
  "var(--neon-green)",
  "var(--neon-pink)",
];

export const Route = createFileRoute("/perfil")({
  head: () => ({
    meta: [
      { title: "Perfil gamer editável — Solo Eleveng Evolution" },
      {
        name: "description",
        content:
          "Personalize sua bio, cor de destaque e título gamer, veja medalhas, percurso e vídeos das suas partidas.",
      },
      { property: "og:title", content: "Perfil gamer — Solo Eleveng Evolution" },
      { property: "og:description", content: "Bio editável, medalhas, percurso e vídeos." },
      { property: "og:url", content: "/perfil" },
    ],
    links: [{ rel: "canonical", href: "/perfil" }],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const { t, lang } = useI18n();
  const { profile, updateProfile } = useHud();
  const [draft, setDraft] = useState(profile);

  return (
    <div className="space-y-4">
      <h1 className="font-display text-2xl">{t("profile.title")}</h1>

      <HudPanel glow={profile.accent}>
        <div className="flex items-center gap-3" style={glowStyle(profile.accent)}>
          <span className="grid h-16 w-16 place-items-center rounded-full border-2 border-[var(--glow)] font-display text-lg">
            {profile.name.slice(0, 2).toUpperCase()}
          </span>
          <div>
            <p className="font-display text-glow text-lg">{profile.name}</p>
            <p className="text-[11px] tracking-wider text-muted-foreground uppercase">
              {profile.title}
            </p>
          </div>
        </div>
        <p className="mt-3 rounded-lg border border-border/60 bg-surface-2/50 p-3 text-xs text-muted-foreground">
          {profile.bio}
        </p>
        <div className="mt-3 grid grid-cols-4 gap-2 text-center">
          <Stat Icon={Medal} label={t("profile.medals")} value="245" />
          <Stat Icon={Play} label={t("profile.videos")} value="32" />
          <Stat Icon={Swords} label={t("profile.wins")} value="1.245" />
          <Stat Icon={Trophy} label={t("profile.winrate")} value="72%" />
        </div>
      </HudPanel>

      <HudPanel title={t("profile.edit")}>
        <label className="block">
          <span className="text-[10px] tracking-widest text-muted-foreground uppercase">
            {t("auth.user")}
          </span>
          <input
            value={draft.name}
            onChange={(e) => setDraft({ ...draft, name: e.target.value })}
            className="mt-1 w-full rounded-lg border border-border bg-surface-2/60 px-3 py-2 text-sm outline-hidden focus:border-primary"
          />
        </label>
        <label className="mt-3 block">
          <span className="text-[10px] tracking-widest text-muted-foreground uppercase">
            {t("profile.title.field")}
          </span>
          <input
            value={draft.title}
            onChange={(e) => setDraft({ ...draft, title: e.target.value })}
            className="mt-1 w-full rounded-lg border border-border bg-surface-2/60 px-3 py-2 text-sm outline-hidden focus:border-primary"
          />
        </label>
        <label className="mt-3 block">
          <span className="text-[10px] tracking-widest text-muted-foreground uppercase">
            {t("profile.bio")}
          </span>
          <textarea
            value={draft.bio}
            rows={3}
            onChange={(e) => setDraft({ ...draft, bio: e.target.value })}
            className="mt-1 w-full rounded-lg border border-border bg-surface-2/60 px-3 py-2 text-sm outline-hidden focus:border-primary"
          />
        </label>
        <div className="mt-3">
          <span className="text-[10px] tracking-widest text-muted-foreground uppercase">
            {t("profile.accent")}
          </span>
          <div className="mt-1.5 flex gap-2">
            {ACCENTS.map((a) => (
              <button
                key={a}
                type="button"
                aria-label={a}
                onClick={() => setDraft({ ...draft, accent: a })}
                className="h-7 w-7 rounded-full border-2"
                style={{ background: a, borderColor: draft.accent === a ? a : "transparent" }}
              />
            ))}
          </div>
        </div>
        <button
          type="button"
          onClick={() => {
            updateProfile(draft);
            toast.success(t("profile.saved"));
          }}
          className="mt-4 w-full rounded-lg bg-primary px-4 py-2.5 font-display text-xs tracking-[0.16em] text-primary-foreground uppercase"
        >
          {t("profile.save")}
        </button>
      </HudPanel>

      <ProgressPanel />

      <HudPanel title={t("profile.medals")} glow="var(--neon-gold)">
        <ul className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {MEDALS.map((m) => (
            <li
              key={m.id}
              className="rounded-lg border border-border/60 bg-surface-2/50 p-3 text-center"
              style={glowStyle(m.glow)}
            >
              <Medal className="mx-auto h-5 w-5 text-[var(--glow)]" />
              <p className="mt-1 text-[10px] text-muted-foreground">
                {lang === "pt" ? m.labelPt : m.labelEn}
              </p>
            </li>
          ))}
        </ul>
      </HudPanel>

      <HudPanel title={t("profile.journey")} glow="var(--neon-cyan)">
        <ol className="space-y-2">
          {JOURNEY.map((j) => (
            <li key={j.id} className="flex items-center gap-2.5 text-xs">
              <span className="h-2 w-2 rounded-full bg-neon-cyan" />
              <span className="flex-1 text-muted-foreground">
                {lang === "pt" ? j.labelPt : j.labelEn}
              </span>
              <span className="text-[10px] text-muted-foreground">{j.date}</span>
            </li>
          ))}
        </ol>
      </HudPanel>

      <HudPanel title={t("profile.videosTitle")} glow="var(--neon-pink)">
        <ul className="grid gap-2 sm:grid-cols-3">
          {VIDEOS.map((v) => (
            <li key={v.id} className="rounded-lg border border-border/60 bg-surface-2/50 p-3">
              <div className="grid h-20 place-items-center rounded-md bg-background/60">
                <Play className="h-6 w-6 text-neon-pink" />
              </div>
              <p className="mt-2 truncate text-xs font-semibold">
                {lang === "pt" ? v.titlePt : v.titleEn}
              </p>
              <p className="text-[10px] text-muted-foreground">
                {v.date} · {v.duration}
              </p>
            </li>
          ))}
        </ul>
      </HudPanel>

      <SecureAccessPanel />
    </div>
  );
}

function Stat({ Icon, label, value }: { Icon: typeof Medal; label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border/60 bg-surface-2/50 p-2">
      <Icon className="mx-auto h-4 w-4 text-primary" />
      <p className="mt-1 font-display text-sm">{value}</p>
      <p className="truncate text-[9px] tracking-wider text-muted-foreground uppercase">{label}</p>
    </div>
  );
}
