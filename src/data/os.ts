/** Mock data for the Gamer OS dashboard. All labels are bilingual (pt/en). */

export type Bi = { pt: string; en: string };

export type Highlight = {
  id: string;
  title: Bi;
  game: string;
  map: string;
  date: string;
  duration: string;
  kda: string;
  tags: string[];
  hue: string;
};

export const HIGHLIGHTS: Highlight[] = [
  {
    id: "h1",
    title: { pt: "Ace na retomada B", en: "Ace on B retake" },
    game: "Valorant",
    map: "Ascent",
    date: "12/05/2026",
    duration: "01:42",
    kda: "24 / 6 / 9",
    tags: ["MVP", "ACE", "CLUTCH"],
    hue: "var(--neon-pink)",
  },
  {
    id: "h2",
    title: { pt: "Triple kill no dragão", en: "Triple kill at dragon" },
    game: "League of Legends",
    map: "Rift",
    date: "11/05/2026",
    duration: "00:58",
    kda: "12 / 2 / 14",
    tags: ["TRIPLE KILL", "MVP"],
    hue: "var(--neon-cyan)",
  },
  {
    id: "h3",
    title: { pt: "5 headshots seguidos", en: "5 headshots in a row" },
    game: "CS2",
    map: "Mirage",
    date: "10/05/2026",
    duration: "00:37",
    kda: "31 / 11 / 4",
    tags: ["HEADSHOTS", "CLUTCH"],
    hue: "var(--neon-gold)",
  },
  {
    id: "h4",
    title: { pt: "Clutch 1v4 final", en: "1v4 final clutch" },
    game: "Valorant",
    map: "Lotus",
    date: "09/05/2026",
    duration: "01:12",
    kda: "19 / 8 / 5",
    tags: ["CLUTCH", "MVP"],
    hue: "var(--neon-green)",
  },
];

export const AI_TIMELINE = [
  { at: "00:04", pt: "Entrada agressiva detectada", en: "Aggressive entry detected" },
  { at: "00:21", pt: "Triple kill confirmado", en: "Triple kill confirmed" },
  { at: "00:48", pt: "Rotação ideal sugerida", en: "Optimal rotation suggested" },
  { at: "01:29", pt: "Clutch — 1v3 vencido", en: "Clutch — 1v3 won" },
];

export const AI_INSIGHTS = [
  { pt: "Precisão de headshot +7% esta semana", en: "Headshot accuracy +7% this week" },
  { pt: "Reduza o tempo de rotação em 1.2s", en: "Cut rotation time by 1.2s" },
  { pt: "Melhor desempenho após 21h", en: "Best performance after 9pm" },
];

export type LiveStream = {
  id: string;
  user: string;
  game: string;
  viewers: string;
  uptime: string;
  hue: string;
};

export const LIVES: LiveStream[] = [
  { id: "l1", user: "ProPlayerBR", game: "Valorant", viewers: "3.2k", uptime: "01:24", hue: "var(--neon-pink)" },
  { id: "l2", user: "ShadowKai", game: "CS2", viewers: "890", uptime: "00:42", hue: "var(--neon-cyan)" },
  { id: "l3", user: "NovaQueen", game: "LoL", viewers: "1.7k", uptime: "02:08", hue: "var(--neon)" },
  { id: "l4", user: "IronFox", game: "Apex", viewers: "410", uptime: "00:16", hue: "var(--neon-gold)" },
];

export const LIVE_CHAT = [
  { user: "Kaito", pt: "esse clutch foi insano", en: "that clutch was insane" },
  { user: "Mira", pt: "enviei um café ☕", en: "sent a coffee ☕" },
  { user: "Zed", pt: "sobe pro Diamond hoje", en: "hit Diamond today" },
];

export type Guild = {
  name: string;
  tag: string;
  rank: string;
  xp: number;
  xpMax: number;
  online: number;
  members: number;
};

export const GUILD: Guild = {
  name: "Evolution Guild",
  tag: "EVO",
  rank: "#7",
  xp: 84200,
  xpMax: 120000,
  online: 23,
  members: 148,
};

export const GUILD_CHAT = [
  { user: "Alva", pt: "Alguém para ranqueada?", en: "Anyone for ranked?" },
  { user: "Kai", pt: "Evento da guilda às 20h", en: "Guild event at 8pm" },
];

export type GameAccess = {
  id: string;
  game: string;
  state: "protected" | "review" | "linked";
  sessions: number;
  device: string;
  lastLogin: string;
};

export const ACCESSES: GameAccess[] = [
  { id: "a1", game: "Valorant", state: "protected", sessions: 1, device: "PC — Lisboa", lastLogin: "Hoje 09:12" },
  { id: "a2", game: "League of Legends", state: "linked", sessions: 2, device: "PC — Maputo", lastLogin: "Ontem 22:40" },
  { id: "a3", game: "CS2", state: "review", sessions: 0, device: "—", lastLogin: "08/05 18:05" },
];

export const ACCESS_STATE_LABEL: Record<GameAccess["state"], Bi> = {
  protected: { pt: "Protegida", en: "Protected" },
  linked: { pt: "Ligada", en: "Linked" },
  review: { pt: "Em revisão", en: "Under review" },
};

export type Friend = {
  id: string;
  name: string;
  status: "online" | "offline" | "party" | "live";
  game: string;
};

export const FRIENDS: Friend[] = [
  { id: "f1", name: "ProPlayerBR", status: "live", game: "Valorant" },
  { id: "f2", name: "ShadowKai", status: "party", game: "CS2" },
  { id: "f3", name: "NovaQueen", status: "online", game: "LoL" },
  { id: "f4", name: "IronFox", status: "online", game: "Apex" },
  { id: "f5", name: "Mira", status: "offline", game: "—" },
  { id: "f6", name: "Zed", status: "offline", game: "—" },
];

export type Mission = {
  id: string;
  label: Bi;
  cycle: "daily" | "weekly" | "monthly";
  progress: number;
  total: number;
  xp: number;
};

export const MISSIONS: Mission[] = [
  { id: "ms1", label: { pt: "Vencer 3 ranqueadas", en: "Win 3 ranked games" }, cycle: "daily", progress: 2, total: 3, xp: 150 },
  { id: "ms2", label: { pt: "Gravar 5 highlights", en: "Record 5 highlights" }, cycle: "daily", progress: 5, total: 5, xp: 100 },
  { id: "ms3", label: { pt: "Subir 1 divisão", en: "Climb 1 division" }, cycle: "weekly", progress: 1, total: 2, xp: 800 },
  { id: "ms4", label: { pt: "Evento da guilda", en: "Guild event" }, cycle: "monthly", progress: 3, total: 4, xp: 2400 },
];

export const MISSION_CYCLE_LABEL: Record<Mission["cycle"], Bi> = {
  daily: { pt: "Diária", en: "Daily" },
  weekly: { pt: "Semanal", en: "Weekly" },
  monthly: { pt: "Mensal", en: "Monthly" },
};

export const WALLET = {
  balance: "€ 248.90",
  earnings: "€ 1 420.00",
  coffees: 312,
  pending: "€ 64.00",
};

export const WALLET_HISTORY = [
  { id: "w1", pt: "Café recebido — Mira", en: "Coffee received — Mira", value: "+ € 4.00", date: "Hoje" },
  { id: "w2", pt: "Contrato GamerPRO", en: "GamerPRO contract", value: "+ € 120.00", date: "11/05" },
  { id: "w3", pt: "Saque para conta", en: "Withdrawal to bank", value: "- € 80.00", date: "08/05" },
];

export const STATS = [
  { pt: "Horas", en: "Hours", value: "1 284" },
  { pt: "Vitórias", en: "Wins", value: "742" },
  { pt: "K/D", en: "K/D", value: "2.14" },
  { pt: "MVP", en: "MVP", value: "196" },
  { pt: "Precisão", en: "Accuracy", value: "48%" },
  { pt: "Heroes", en: "Heroes", value: "12" },
];

export const STAT_TREND = [42, 55, 48, 63, 58, 72, 68, 81, 76, 88, 84, 94];

export type OsEvent = { id: string; label: Bi; when: Bi; hue: string };

export const EVENTS: OsEvent[] = [
  { id: "e1", label: { pt: "Torneio Evolution Cup", en: "Evolution Cup" }, when: { pt: "Sábado 18:00", en: "Saturday 6pm" }, hue: "var(--neon-gold)" },
  { id: "e2", label: { pt: "Noite de lives da guilda", en: "Guild live night" }, when: { pt: "Sexta 21:00", en: "Friday 9pm" }, hue: "var(--neon-pink)" },
  { id: "e3", label: { pt: "Treino coletivo IA", en: "AI group training" }, when: { pt: "Amanhã 20:00", en: "Tomorrow 8pm" }, hue: "var(--neon-cyan)" },
];

export type MarketItem = {
  id: string;
  label: Bi;
  kind: "card" | "item" | "booster" | "skin";
  price: string;
  hue: string;
};

export const MARKET: MarketItem[] = [
  { id: "mk1", label: { pt: "Diamond Card", en: "Diamond Card" }, kind: "card", price: "€ 49.99", hue: "var(--rarity-diamond)" },
  { id: "mk2", label: { pt: "Booster XP x2", en: "XP Booster x2" }, kind: "booster", price: "€ 6.99", hue: "var(--neon-green)" },
  { id: "mk3", label: { pt: "Moldura holográfica", en: "Holographic frame" }, kind: "skin", price: "€ 3.49", hue: "var(--neon-pink)" },
  { id: "mk4", label: { pt: "Pacote de medalhas", en: "Medal pack" }, kind: "item", price: "€ 9.99", hue: "var(--neon-gold)" },
];

export const SETTINGS_GROUPS = [
  { id: "s1", label: { pt: "Conta", en: "Account" }, value: { pt: "Verificada", en: "Verified" } },
  { id: "s2", label: { pt: "Privacidade", en: "Privacy" }, value: { pt: "Perfil restrito", en: "Restricted profile" } },
  { id: "s3", label: { pt: "Idioma", en: "Language" }, value: { pt: "Português", en: "English" } },
  { id: "s4", label: { pt: "Tema", en: "Theme" }, value: { pt: "Dark Neon", en: "Dark Neon" } },
  { id: "s5", label: { pt: "Segurança", en: "Security" }, value: { pt: "2FA ativa", en: "2FA active" } },
];

export const ACHIEVEMENTS = [
  { id: "ac1", label: { pt: "Invicto 10x", en: "10x unbeaten" } },
  { id: "ac2", label: { pt: "Ace lendário", en: "Legendary ace" } },
  { id: "ac3", label: { pt: "Guilda campeã", en: "Champion guild" } },
];
