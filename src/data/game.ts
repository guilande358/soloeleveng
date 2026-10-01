export type SupportKind = "llm" | "human";

export type GameCard = {
  id: string;
  name: string;
  rarity: string;
  glow: string;
  price: number;
  currentRank: string;
  targetRank: string;
  medals: number;
  days: string;
  success: number;
  support: SupportKind;
  players: number;
  matches: string;
};

/** Support network: LLM training for games exists for these tiers, the rest use addicted pro players. */
export const CARDS: GameCard[] = [
  {
    id: "starter",
    name: "Starter",
    rarity: "iron",
    glow: "var(--neon-green)",
    price: 0,
    currentRank: "Unranked",
    targetRank: "Iron IV",
    medals: 4,
    days: "1 - 2",
    success: 99,
    support: "llm",
    players: 6,
    matches: "5 - 10",
  },
  {
    id: "iron",
    name: "Iron",
    rarity: "iron",
    glow: "var(--rarity-iron)",
    price: 4.99,
    currentRank: "Iron IV",
    targetRank: "Bronze IV",
    medals: 8,
    days: "1 - 2",
    success: 99,
    support: "llm",
    players: 12,
    matches: "10 - 18",
  },
  {
    id: "bronze",
    name: "Bronze",
    rarity: "bronze",
    glow: "var(--rarity-bronze)",
    price: 9.99,
    currentRank: "Bronze III",
    targetRank: "Silver IV",
    medals: 12,
    days: "1 - 3",
    success: 98,
    support: "llm",
    players: 16,
    matches: "14 - 22",
  },
  {
    id: "silver",
    name: "Silver",
    rarity: "silver",
    glow: "var(--rarity-silver)",
    price: 14.99,
    currentRank: "Silver II",
    targetRank: "Gold IV",
    medals: 18,
    days: "2 - 4",
    success: 97,
    support: "llm",
    players: 20,
    matches: "18 - 28",
  },
  {
    id: "gold",
    name: "Gold",
    rarity: "gold",
    glow: "var(--rarity-gold)",
    price: 24.99,
    currentRank: "Gold III",
    targetRank: "Platinum IV",
    medals: 26,
    days: "3 - 5",
    success: 96,
    support: "llm",
    players: 24,
    matches: "24 - 34",
  },
  {
    id: "platinum",
    name: "Platinum",
    rarity: "platinum",
    glow: "var(--rarity-platinum)",
    price: 34.99,
    currentRank: "Platinum IV",
    targetRank: "Diamond IV",
    medals: 32,
    days: "4 - 6",
    success: 95,
    support: "human",
    players: 18,
    matches: "30 - 42",
  },
  {
    id: "diamond",
    name: "Diamond",
    rarity: "diamond",
    glow: "var(--rarity-diamond)",
    price: 49.99,
    currentRank: "Diamond IV",
    targetRank: "Diamond II",
    medals: 45,
    days: "4 - 7",
    success: 94,
    support: "human",
    players: 24,
    matches: "40 - 60",
  },
  {
    id: "master",
    name: "Master",
    rarity: "master",
    glow: "var(--rarity-master)",
    price: 79.99,
    currentRank: "Diamond I",
    targetRank: "Master",
    medals: 62,
    days: "6 - 10",
    success: 91,
    support: "human",
    players: 14,
    matches: "55 - 80",
  },
  {
    id: "legendary",
    name: "Legendary",
    rarity: "legendary",
    glow: "var(--rarity-legendary)",
    price: 129.99,
    currentRank: "Master",
    targetRank: "Challenger",
    medals: 90,
    days: "10 - 16",
    success: 88,
    support: "human",
    players: 8,
    matches: "80 - 120",
  },
];

export function findCard(id: string | undefined) {
  return CARDS.find((c) => c.id === id);
}

export const BENEFITS = {
  pt: ["Treinador profissional", "Proteção de conta", "Suporte 24/7", "Relatórios de progresso"],
  en: ["Professional trainer", "Account protection", "24/7 support", "Progress reports"],
};

export type Notification = {
  id: string;
  titlePt: string;
  titleEn: string;
  bodyPt: string;
  bodyEn: string;
  time: string;
};

export const NOTIFICATIONS: Notification[] = [
  {
    id: "n1",
    titlePt: "Seu pedido foi aceito!",
    titleEn: "Your order was accepted!",
    bodyPt: "Diamond Card iniciado.",
    bodyEn: "Diamond Card started.",
    time: "Agora",
  },
  {
    id: "n2",
    titlePt: "Seu treinador entrou na conta",
    titleEn: "Your trainer joined the account",
    bodyPt: "A evolução começou!",
    bodyEn: "The evolution has begun!",
    time: "5 min",
  },
  {
    id: "n3",
    titlePt: "Nova medalha desbloqueada",
    titleEn: "New medal unlocked",
    bodyPt: "Mestre das Sombras",
    bodyEn: "Master of Shadows",
    time: "15 min",
  },
  {
    id: "n4",
    titlePt: "Live iniciada por ProPlayerBR",
    titleEn: "Live started by ProPlayerBR",
    bodyPt: "Assista agora!",
    bodyEn: "Watch now!",
    time: "30 min",
  },
];

export type Contract = {
  id: string;
  card: string;
  objective: string;
  status: "running" | "done";
  time: string;
};

export const CONTRACTS: Contract[] = [
  {
    id: "c1",
    card: "Diamond Card",
    objective: "Diamond IV → Diamond II",
    status: "running",
    time: "4 dias",
  },
  {
    id: "c2",
    card: "Master Card",
    objective: "Diamond I → Master",
    status: "done",
    time: "9 dias",
  },
  {
    id: "c3",
    card: "Platinum Card",
    objective: "Platinum IV → Diamond IV",
    status: "done",
    time: "5 dias",
  },
];

export type GameVideo = {
  id: string;
  titlePt: string;
  titleEn: string;
  duration: string;
  date: string;
};

export const VIDEOS: GameVideo[] = [
  {
    id: "v1",
    titlePt: "Highlight #1",
    titleEn: "Highlight #1",
    duration: "04:36",
    date: "12/05/2026",
  },
  {
    id: "v2",
    titlePt: "Ranqueada insana",
    titleEn: "Insane ranked",
    duration: "08:12",
    date: "10/05/2026",
  },
  {
    id: "v3",
    titlePt: "Clutch perfeito",
    titleEn: "Perfect clutch",
    duration: "02:58",
    date: "08/05/2026",
  },
];

export const MEDALS = [
  {
    id: "m1",
    labelPt: "Primeira evolução",
    labelEn: "First evolution",
    glow: "var(--rarity-gold)",
  },
  {
    id: "m2",
    labelPt: "Mestre das sombras",
    labelEn: "Master of shadows",
    glow: "var(--rarity-master)",
  },
  { id: "m3", labelPt: "Invicto 10x", labelEn: "10x unbeaten", glow: "var(--rarity-diamond)" },
  {
    id: "m4",
    labelPt: "Guilda lendária",
    labelEn: "Legendary guild",
    glow: "var(--rarity-legendary)",
  },
];

export const JOURNEY = [
  {
    id: "j1",
    labelPt: "Conta ligada com link cifrado",
    labelEn: "Account linked via encrypted link",
    date: "01/05",
  },
  {
    id: "j2",
    labelPt: "Platinum Card concluído",
    labelEn: "Platinum Card completed",
    date: "06/05",
  },
  {
    id: "j3",
    labelPt: "Entrou na Evolution Guild",
    labelEn: "Joined Evolution Guild",
    date: "09/05",
  },
  {
    id: "j4",
    labelPt: "Diamond Card em andamento",
    labelEn: "Diamond Card in progress",
    date: "12/05",
  },
];

export const PAYMENT_METHODS = [
  { id: "card", labelPt: "Cartão de crédito", labelEn: "Credit card" },
  { id: "paypal", labelPt: "PayPal", labelEn: "PayPal" },
  { id: "pix", labelPt: "Pix", labelEn: "Pix" },
  { id: "mpesa", labelPt: "M-Pesa", labelEn: "M-Pesa" },
  { id: "crypto", labelPt: "Criptomoedas", labelEn: "Crypto" },
];
