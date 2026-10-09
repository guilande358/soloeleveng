import { createFileRoute } from "@tanstack/react-router";

import { LegalPage } from "@/components/legal/legal-page";

const T = "Termos de Uso — Solo Eleveng Evolution";
const D = "Regras de utilização do Solo Eleveng Evolution, o HUB gamer de progresso, análises e comunidade.";

export const Route = createFileRoute("/termos")({
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
      title={{ pt: "Termos de Uso", en: "Terms of Service" }}
      updated="09/10/2026"
      sections={{
        pt: [
          { h: "1. O serviço", p: ["O Solo Eleveng Evolution é um HUB online onde jogadores acompanham o seu progresso, recebem análises de desempenho, participam de lives e comunidades e ativam cartas de evolução (planos de treino e acompanhamento)."] },
          { h: "2. Conta", p: ["Para usar o HUB é necessário criar uma conta. Você é responsável pela segurança do seu acesso. É proibido criar contas falsas ou usar a conta de outra pessoa."] },
          { h: "3. Integração com jogos", p: ["Para League of Legends, ligamos apenas o seu Riot ID público à API oficial da Riot Games para ler estatísticas de partidas e rank. Nunca pedimos nem guardamos a senha da sua conta Riot.", "Não oferecemos serviços de boost, venda ou partilha de contas Riot, nem qualquer prática proibida pelas políticas da Riot Games. Para jogos da Riot, o serviço limita-se a acompanhamento, coaching e análises."] },
          { h: "4. Cartas, pagamentos e carteira", p: ["Cartas pagas são cobradas pelos meios indicados no checkout. Não é permitido ter duas cartas ativas ao mesmo tempo; é possível fazer upgrade. Saldo, presentes (Café) e saques seguem as regras exibidas na carteira."] },
          { h: "5. Condutas proibidas", p: ["Fraude, partilha de senhas, trapaças, assédio, discurso de ódio e qualquer tentativa de manipular resultados resultam em suspensão da conta."] },
          { h: "6. Alterações e contacto", p: ["Podemos atualizar estes termos e avisaremos no HUB. Dúvidas: elguilande5@gmail.com."] },
        ],
        en: [
          { h: "1. The service", p: ["Solo Eleveng Evolution is an online hub where players track progress, get performance analysis, join lives and communities and activate evolution cards (training and coaching plans)."] },
          { h: "2. Account", p: ["An account is required. You are responsible for keeping access secure. Fake accounts or using someone else's account are forbidden."] },
          { h: "3. Game integrations", p: ["For League of Legends we only link your public Riot ID to the official Riot Games API to read match statistics and rank. We never ask for or store your Riot password.", "We do not offer boosting, account selling or account sharing for Riot titles, nor any practice prohibited by Riot Games policies. For Riot games the service is limited to tracking, coaching and analytics."] },
          { h: "4. Cards, payments and wallet", p: ["Paid cards are charged through the methods shown at checkout. Two active cards at once are not allowed; upgrades are. Balance, gifts (Coffee) and payouts follow the rules shown in the wallet."] },
          { h: "5. Prohibited conduct", p: ["Fraud, password sharing, cheating, harassment, hate speech or attempts to manipulate results lead to account suspension."] },
          { h: "6. Changes and contact", p: ["We may update these terms and will notify you in the hub. Questions: elguilande5@gmail.com."] },
        ],
      }}
    />
  ),
});
