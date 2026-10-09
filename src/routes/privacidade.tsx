import { createFileRoute } from "@tanstack/react-router";

import { LegalPage } from "@/components/legal/legal-page";

const T = "Política de Privacidade — Solo Eleveng Evolution";
const D = "Que dados o Solo Eleveng Evolution recolhe, como usa os dados da Riot Games API e como apagar os seus dados.";

export const Route = createFileRoute("/privacidade")({
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
      title={{ pt: "Política de Privacidade", en: "Privacy Policy" }}
      updated="09/10/2026"
      sections={{
        pt: [
          { h: "Dados que recolhemos", p: ["Conta: e-mail, nome e foto (login Google). Perfil: bio, modo, nível e XP. Pagamentos: referência da transação (os dados do cartão ficam com o processador de pagamento).", "Riot Games: Riot ID (nome#tag), região, PUUID, rank e estatísticas de partidas obtidas pela API oficial."] },
          { h: "Para que usamos", p: ["Mostrar o seu progresso, calcular XP, missões e evolução das cartas, e gerar análises de desempenho. Não vendemos dados nem os partilhamos com terceiros para publicidade."] },
          { h: "Retenção e exclusão", p: ["Os dados Riot ficam guardados enquanto a conta estiver vinculada. Ao clicar em \"Desvincular\" no painel Estatísticas, o vínculo Riot é apagado. Pode pedir a exclusão total da conta por e-mail."] },
          { h: "Segurança", p: ["Usamos ligações encriptadas e regras de acesso por utilizador. Nunca guardamos senhas de contas de jogos."] },
          { h: "Contacto", p: ["elguilande5@gmail.com"] },
        ],
        en: [
          { h: "Data we collect", p: ["Account: email, name and photo (Google login). Profile: bio, mode, level and XP. Payments: transaction reference (card data stays with the payment processor).", "Riot Games: Riot ID (name#tag), region, PUUID, rank and match statistics from the official API."] },
          { h: "How we use it", p: ["To show your progress, compute XP, missions and card evolution, and generate performance insights. We do not sell data or share it for advertising."] },
          { h: "Retention and deletion", p: ["Riot data is stored while the account is linked. Clicking \"Unlink\" in the Statistics panel deletes it. Full account deletion can be requested by email."] },
          { h: "Security", p: ["Encrypted connections and per-user access rules. We never store game account passwords."] },
          { h: "Contact", p: ["elguilande5@gmail.com"] },
        ],
      }}
    />
  ),
});
