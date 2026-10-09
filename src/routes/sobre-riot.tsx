import { createFileRoute } from "@tanstack/react-router";

import { LegalPage } from "@/components/legal/legal-page";

const T = "Integração Riot Games — Solo Eleveng Evolution";
const D = "Como o Solo Eleveng Evolution usa a API oficial da Riot Games para mostrar partidas e rank de League of Legends.";

export const Route = createFileRoute("/sobre-riot")({
  head: () => ({
    meta: [
      { title: T },
      { name: "description", content: D },
      { property: "og:title", content: T },
      { property: "og:description", content: D },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => (
    <LegalPage
      title={{ pt: "Integração com a Riot Games", en: "Riot Games integration" }}
      updated="09/10/2026"
      sections={{
        pt: [
          { h: "O que faz", p: ["O jogador informa o Riot ID público e a região. O HUB consulta a API oficial (Account-v1, League-v4 e Match-v5) para importar as partidas recentes e o rank, e mostra progresso, XP, missões e análises."] },
          { h: "O que não faz", p: ["Não pede senhas, não acede à conta do jogador, não modifica o jogo e não oferece boost nem venda de contas. É um serviço gratuito de leitura de estatísticas."] },
          { h: "Limites", p: ["Respeitamos os limites de pedidos da Riot e só sincronizamos quando o próprio jogador pede."] },
        ],
        en: [
          { h: "What it does", p: ["The player enters a public Riot ID and region. The hub queries the official API (Account-v1, League-v4, Match-v5) to import recent matches and rank, then shows progress, XP, missions and insights."] },
          { h: "What it doesn't do", p: ["No passwords, no account access, no game modification, no boosting or account selling. It is a free, read-only statistics feature."] },
          { h: "Limits", p: ["We respect Riot rate limits and only sync when the player requests it."] },
        ],
      }}
    />
  ),
});
