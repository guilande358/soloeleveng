import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

import { useI18n } from "@/lib/i18n";

export const RIOT_DISCLAIMER =
  "Solo Eleveng Evolution isn't endorsed by Riot Games and doesn't reflect the views or opinions of Riot Games or anyone officially involved in producing or managing Riot Games properties. Riot Games, and all associated properties are trademarks or registered trademarks of Riot Games, Inc.";

export type Section = { h: string; p: string[] };

export function LegalPage({
  title,
  updated,
  sections,
}: {
  title: { pt: string; en: string };
  updated: string;
  sections: { pt: Section[]; en: Section[] };
}) {
  const { lang } = useI18n();
  const list = sections[lang === "pt" ? "pt" : "en"];
  return (
    <article className="mx-auto max-w-3xl space-y-6 rounded-2xl border border-border/60 bg-surface-2/40 p-6">
      <header>
        <h1 className="font-display text-2xl">{title[lang === "pt" ? "pt" : "en"]}</h1>
        <p className="text-xs text-muted-foreground">
          {lang === "pt" ? "Última atualização" : "Last updated"}: {updated}
        </p>
      </header>
      {list.map((s) => (
        <section key={s.h} className="space-y-2">
          <h2 className="font-display text-sm tracking-wide text-primary">{s.h}</h2>
          {s.p.map((t) => (
            <p key={t} className="text-sm leading-relaxed text-muted-foreground">
              {t}
            </p>
          ))}
        </section>
      ))}
      <p className="border-t border-border/50 pt-4 text-[11px] text-muted-foreground">
        {RIOT_DISCLAIMER}
      </p>
    </article>
  );
}

export function LegalFooter() {
  const { lang } = useI18n();
  const pt = lang === "pt";
  return (
    <footer className="mx-auto w-full max-w-7xl space-y-2 px-4 pb-24 pt-6 text-[11px] text-muted-foreground">
      <nav className="flex flex-wrap gap-4">
        <Link to="/termos" className="hover:text-foreground">
          {pt ? "Termos de Uso" : "Terms of Service"}
        </Link>
        <Link to="/privacidade" className="hover:text-foreground">
          {pt ? "Privacidade" : "Privacy Policy"}
        </Link>
        <Link to="/sobre-riot" className="hover:text-foreground">
          {pt ? "Integração Riot" : "Riot integration"}
        </Link>
      </nav>
      <p>{RIOT_DISCLAIMER}</p>
    </footer>
  );
}

export function Children({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
