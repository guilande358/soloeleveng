import { Copy, KeyRound, Lock, RefreshCw, ShieldOff } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { HudPanel } from "@/components/hud/hud-panel";
import { useI18n } from "@/lib/i18n";

function makeToken() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz0123456789";
  let out = "";
  for (let i = 0; i < 10; i += 1) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

const TOTAL = 15 * 60;

export function SecureAccessPanel() {
  const { t } = useI18n();
  const [token, setToken] = useState("8X7kLmP9aQ");
  const [seconds, setSeconds] = useState(TOTAL);
  const [revoked, setRevoked] = useState(false);

  useEffect(() => {
    if (revoked) return;
    const id = window.setInterval(() => setSeconds((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => window.clearInterval(id);
  }, [revoked]);

  const link = useMemo(() => `https://seev.link/${token}`, [token]);
  const clock = `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;

  return (
    <HudPanel title={t("secure.title")} glow="var(--neon-green)">
      <p className="text-xs text-muted-foreground">{t("secure.body")}</p>

      <div className="mt-3 flex items-center gap-2">
        <div className="flex min-w-0 flex-1 items-center gap-2 rounded-lg border border-border bg-surface-2/60 px-3 py-2">
          <KeyRound className="h-3.5 w-3.5 shrink-0 text-neon-green" />
          <span className={revoked ? "truncate text-xs line-through opacity-60" : "truncate text-xs"}>
            {link}
          </span>
        </div>
        <button
          type="button"
          disabled={revoked}
          onClick={() => {
            void navigator.clipboard?.writeText(link);
            toast.success(t("secure.copied"));
          }}
          className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 font-display text-[11px] tracking-wider text-primary-foreground uppercase disabled:opacity-50"
        >
          <Copy className="h-3.5 w-3.5" />
          {t("secure.copy")}
        </button>
      </div>

      <div className="mt-3">
        <div className="flex items-center justify-between text-[10px] tracking-widest text-muted-foreground uppercase">
          <span>{t("secure.remaining")}</span>
          <span>{revoked ? "--:--" : clock}</span>
        </div>
        <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-surface-2">
          <div
            className="h-full rounded-full bg-neon-green"
            style={{ width: revoked ? "0%" : `${(seconds / TOTAL) * 100}%` }}
          />
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => {
            setToken(makeToken());
            setSeconds(TOTAL);
            setRevoked(false);
          }}
          className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-[11px] font-semibold tracking-wider uppercase"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          {t("secure.new")}
        </button>
        <button
          type="button"
          onClick={() => {
            setRevoked(true);
            setSeconds(0);
            toast(t("secure.revoked"));
          }}
          className="flex items-center gap-1.5 rounded-lg border border-destructive/60 px-3 py-1.5 text-[11px] font-semibold tracking-wider text-destructive uppercase"
        >
          <ShieldOff className="h-3.5 w-3.5" />
          {t("secure.revoke")}
        </button>
        <span className="ml-auto flex items-center gap-1 text-[10px] tracking-wider text-muted-foreground uppercase">
          <Lock className="h-3 w-3" /> AES-256
        </span>
      </div>
    </HudPanel>
  );
}
