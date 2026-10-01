import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";

export type Lang = "pt" | "en";

const dict = {
  "nav.home": { pt: "Início", en: "Home" },
  "nav.cards": { pt: "Cartas", en: "Cards" },
  "nav.modes": { pt: "Modos", en: "Modes" },
  "nav.profile": { pt: "Perfil", en: "Profile" },
  "nav.auth": { pt: "Entrar", en: "Sign in" },
  "nav.checkout": { pt: "Checkout", en: "Checkout" },

  "hero.line1": { pt: "Evolua.", en: "Evolve." },
  "hero.line2": { pt: "Supere.", en: "Surpass." },
  "hero.line3": { pt: "Domine.", en: "Dominate." },
  "hero.sub": { pt: "Sua jornada, sua lenda.", en: "Your journey, your legend." },
  "hero.cta": { pt: "Upgrade Gamer", en: "Gamer Upgrade" },
  "hero.tagline": {
    pt: "HUD digital para elevação de contas em jogos online.",
    en: "Digital HUD for online game account elevation.",
  },

  "cards.title": { pt: "Escolha sua carta", en: "Choose your card" },
  "cards.subtitle": {
    pt: "Deslize o carrossel e toque numa carta para abrir a tela gamer.",
    en: "Swipe the carousel and tap a card to open the gamer screen.",
  },
  "cards.card": { pt: "Carta", en: "Card" },
  "cards.active": { pt: "Carta ativa", en: "Active card" },
  "cards.select": { pt: "Selecionar", en: "Select" },
  "cards.upgrade": { pt: "Atualizar pacote", en: "Upgrade package" },
  "cards.buy": { pt: "Comprar agora", en: "Buy now" },

  "card.currentRank": { pt: "Rank atual", en: "Current rank" },
  "card.targetRank": { pt: "Rank objetivo", en: "Target rank" },
  "card.medals": { pt: "Medalhas", en: "Medals" },
  "card.time": { pt: "Tempo estimado", en: "Estimated time" },
  "card.success": { pt: "Taxa de sucesso", en: "Success rate" },
  "card.support": { pt: "Suporte", en: "Support" },
  "card.support.llm": { pt: "Rede de LLMs", en: "LLM network" },
  "card.support.human": { pt: "Jogadores profissionais", en: "Pro players" },
  "card.benefits": { pt: "Benefícios", en: "Benefits" },
  "card.days": { pt: "dias", en: "days" },

  "ban.title": { pt: "Uma carta por vez", en: "One card at a time" },
  "ban.body": {
    pt: "Duas cartas em simultâneo geram atividade suspeita e risco de ban na conta do jogo. Podes atualizar o teu pacote em vez de comprar outra.",
    en: "Two cards at once trigger suspicious activity and risk a game ban. You can upgrade your package instead of buying another.",
  },
  "ban.keep": { pt: "Manter carta atual", en: "Keep current card" },
  "ban.replace": { pt: "Atualizar para esta", en: "Upgrade to this one" },

  "modes.title": { pt: "Escolha seu modo", en: "Choose your mode" },
  "modes.friendly": { pt: "Friendly Mode", en: "Friendly Mode" },
  "modes.friendly.desc": {
    pt: "Contrato amigável entre amigos. Gratuito e divertido.",
    en: "Friendly contract between friends. Free and fun.",
  },
  "modes.pro": { pt: "GamerPRO", en: "GamerPRO" },
  "modes.pro.desc": {
    pt: "Guildas exclusivas, contrato com comissão do sistema e proteção de conta.",
    en: "Exclusive guilds, system commission contract and account protection.",
  },
  "modes.enter": { pt: "Entrar", en: "Enter" },
  "modes.activeMode": { pt: "Modo ativo", en: "Active mode" },

  "notif.title": { pt: "Notificações", en: "Notifications" },
  "notif.all": { pt: "Ver todas", en: "See all" },

  "progress.title": { pt: "Seu progresso", en: "Your progress" },
  "progress.level": { pt: "Nível", en: "Level" },
  "progress.missions": { pt: "Missões", en: "Missions" },
  "progress.reward": { pt: "Próxima recompensa", en: "Next reward" },

  "contracts.title": { pt: "Contratos", en: "Contracts" },
  "contracts.active": { pt: "Ativos", en: "Active" },
  "contracts.history": { pt: "Histórico", en: "History" },
  "contracts.running": { pt: "Em andamento", en: "In progress" },
  "contracts.done": { pt: "Concluído", en: "Completed" },

  "secure.title": { pt: "Acesso seguro à conta", en: "Secure account access" },
  "secure.body": {
    pt: "Partilhe o link cifrado com o seu jogador. O acesso expira em 15 minutos.",
    en: "Share the encrypted link with your player. Access expires in 15 minutes.",
  },
  "secure.copy": { pt: "Copiar", en: "Copy" },
  "secure.copied": { pt: "Link copiado", en: "Link copied" },
  "secure.new": { pt: "Gerar novo link", en: "Generate new link" },
  "secure.revoke": { pt: "Revogar", en: "Revoke" },
  "secure.revoked": { pt: "Link revogado", en: "Link revoked" },
  "secure.remaining": { pt: "Tempo restante", en: "Time remaining" },

  "soon.title": { pt: "Em breve", en: "Coming soon" },
  "soon.lives": { pt: "Lives em tempo real", en: "Real-time lives" },
  "soon.chat": { pt: "Chat entre gamers", en: "Gamer chat" },
  "soon.coffee": { pt: "Café e presentes convertíveis", en: "Coffee and convertible gifts" },

  "auth.loginTitle": { pt: "Bem-vindo de volta!", en: "Welcome back!" },
  "auth.loginSub": {
    pt: "Entre para continuar sua jornada.",
    en: "Sign in to continue your journey.",
  },
  "auth.signupTitle": { pt: "Crie sua conta", en: "Create your account" },
  "auth.signupSub": {
    pt: "Junte-se a milhares de gamers em todo o mundo.",
    en: "Join thousands of gamers worldwide.",
  },
  "auth.login": { pt: "Entrar", en: "Sign in" },
  "auth.signup": { pt: "Criar conta", en: "Create account" },
  "auth.user": { pt: "Usuário", en: "Username" },
  "auth.email": { pt: "E-mail", en: "Email" },
  "auth.password": { pt: "Senha", en: "Password" },
  "auth.confirm": { pt: "Confirmar senha", en: "Confirm password" },
  "auth.forgot": { pt: "Esqueci minha senha", en: "Forgot my password" },
  "auth.noAccount": { pt: "Não tem uma conta?", en: "No account yet?" },
  "auth.hasAccount": { pt: "Já tem uma conta?", en: "Already have an account?" },
  "auth.terms": { pt: "Li e aceito os Termos de Uso.", en: "I read and accept the Terms of Use." },
  "auth.google": { pt: "Entrar com Google", en: "Sign in with Google" },
  "auth.or": { pt: "ou", en: "or" },
  "auth.welcomeBack": { pt: "Bem-vindo de volta!", en: "Welcome back!" },
  "auth.accountCreated": { pt: "Conta criada com sucesso!", en: "Account created successfully!" },
  "auth.passwordMismatch": { pt: "As senhas não coincidem.", en: "Passwords do not match." },
  "auth.acceptTerms": {
    pt: "Aceite os termos para continuar.",
    en: "Accept the terms to continue.",
  },
  "auth.error": {
    pt: "Ocorreu um erro. Tente novamente.",
    en: "An error occurred. Please try again.",
  },
  "auth.signOut": { pt: "Sair", en: "Sign out" },
  "auth.signedOut": { pt: "Sessão terminada.", en: "Signed out." },

  "profile.title": { pt: "Perfil Gamer", en: "Gamer Profile" },
  "profile.bio": { pt: "Bio", en: "Bio" },
  "profile.edit": { pt: "Editar", en: "Edit" },
  "profile.save": { pt: "Salvar alterações", en: "Save changes" },
  "profile.saved": { pt: "Perfil atualizado", en: "Profile updated" },
  "profile.accent": { pt: "Cor de destaque", en: "Accent color" },
  "profile.title.field": { pt: "Título gamer", en: "Gamer title" },
  "profile.medals": { pt: "Medalhas", en: "Medals" },
  "profile.videos": { pt: "Vídeos", en: "Videos" },
  "profile.wins": { pt: "Vitórias", en: "Wins" },
  "profile.winrate": { pt: "Taxa win", en: "Win rate" },
  "profile.journey": { pt: "Ver percurso", en: "Journey" },
  "profile.videosTitle": { pt: "Vídeos e replays", en: "Videos and replays" },

  "checkout.title": { pt: "Resumo do pedido", en: "Order summary" },
  "checkout.method": { pt: "Método de pagamento", en: "Payment method" },
  "checkout.total": { pt: "Total", en: "Total" },
  "checkout.pay": { pt: "Pagar agora", en: "Pay now" },
  "checkout.soon": {
    pt: "Pagamentos entram em funcionamento na próxima fase.",
    en: "Payments go live in the next phase.",
  },
  "checkout.empty": { pt: "Nenhuma carta selecionada.", en: "No card selected." },
  "checkout.browse": { pt: "Ver cartas", en: "Browse cards" },
  "checkout.mode": { pt: "Modo do contrato", en: "Contract mode" },
  "checkout.commission": { pt: "Comissão da plataforma", en: "Platform commission" },
  "checkout.secure": { pt: "Pagamento 100% seguro", en: "100% secure payment" },

  "common.back": { pt: "Voltar", en: "Back" },
  "common.close": { pt: "Fechar", en: "Close" },
  "common.lang": { pt: "Idioma", en: "Language" },
  "common.loading": { pt: "A carregar...", en: "Loading..." },
} as const;

export type TKey = keyof typeof dict;

type I18nValue = { lang: Lang; setLang: (l: Lang) => void; t: (k: TKey) => string };

const I18nContext = createContext<I18nValue | null>(null);
const STORAGE_KEY = "seev.lang";

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("pt");

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === "pt" || stored === "en") setLangState(stored);
  }, []);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    window.localStorage.setItem(STORAGE_KEY, l);
  }, []);

  const t = useCallback((k: TKey) => dict[k][lang], [lang]);

  return <I18nContext.Provider value={{ lang, setLang, t }}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used inside I18nProvider");
  return ctx;
}
