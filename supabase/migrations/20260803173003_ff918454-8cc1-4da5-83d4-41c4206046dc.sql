-- Enum de papéis de utilizador
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- Perfis públicos do gamer
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL DEFAULT 'Gamer',
  title text NOT NULL DEFAULT 'Ranqueada Solo',
  bio text NOT NULL DEFAULT '',
  accent text NOT NULL DEFAULT 'var(--neon)',
  avatar_url text,
  banner_url text,
  mode text NOT NULL DEFAULT 'friendly' CHECK (mode IN ('friendly', 'pro')),
  active_card_id text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own profile" ON public.profiles
  FOR ALL TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE POLICY "Public read profiles" ON public.profiles
  FOR SELECT TO anon USING (true);

-- Papéis de utilizador (separado do perfil por segurança)
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'user',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own roles" ON public.user_roles
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- Função para verificar papel (SECURITY DEFINER evita recursão RLS)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  );
$$;

-- Cartas do catálogo
CREATE TABLE public.cards (
  id text PRIMARY KEY,
  name text NOT NULL,
  rarity text NOT NULL,
  glow text NOT NULL,
  price numeric(10,2) NOT NULL,
  current_rank text NOT NULL,
  target_rank text NOT NULL,
  medals int NOT NULL DEFAULT 0,
  days text NOT NULL,
  success int NOT NULL DEFAULT 95,
  support text NOT NULL CHECK (support IN ('llm', 'human')),
  players int NOT NULL DEFAULT 0,
  matches text NOT NULL,
  description text,
  sort_order int NOT NULL DEFAULT 0
);

GRANT SELECT ON public.cards TO anon;
GRANT SELECT ON public.cards TO authenticated;
GRANT ALL ON public.cards TO service_role;
ALTER TABLE public.cards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Cards are public read-only" ON public.cards
  FOR SELECT TO anon, authenticated USING (true);

-- Encomendas de cartas (uma ativa por utilizador)
CREATE TABLE public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  card_id text REFERENCES public.cards(id) NOT NULL,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
  mode text NOT NULL DEFAULT 'friendly' CHECK (mode IN ('friendly', 'pro')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.orders TO authenticated;
GRANT ALL ON public.orders TO service_role;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own orders" ON public.orders
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE UNIQUE INDEX one_active_order_per_user ON public.orders(user_id) WHERE status = 'active';

-- Contratos Friendly / GamerPRO
CREATE TABLE public.contracts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  order_id uuid REFERENCES public.orders(id) ON DELETE SET NULL,
  kind text NOT NULL CHECK (kind IN ('friendly', 'pro')),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'disputed', 'cancelled')),
  commission_rate numeric(5,2) NOT NULL DEFAULT 0,
  started_at timestamptz NOT NULL DEFAULT now(),
  ends_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE ON public.contracts TO authenticated;
GRANT ALL ON public.contracts TO service_role;
ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own contracts" ON public.contracts
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "System creates contracts" ON public.contracts
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Carteira
CREATE TABLE public.wallets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  balance numeric(12,2) NOT NULL DEFAULT 0,
  coffee_count int NOT NULL DEFAULT 0,
  pending numeric(12,2) NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, UPDATE ON public.wallets TO authenticated;
GRANT ALL ON public.wallets TO service_role;
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own wallet" ON public.wallets
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Transações da carteira
CREATE TABLE public.wallet_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  kind text NOT NULL CHECK (kind IN ('deposit', 'withdrawal', 'coffee', 'contract', 'boost', 'refund')),
  amount numeric(12,2) NOT NULL,
  description text NOT NULL,
  metadata jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.wallet_transactions TO authenticated;
GRANT ALL ON public.wallet_transactions TO service_role;
ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own transactions" ON public.wallet_transactions
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users insert own transactions" ON public.wallet_transactions
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Missões
CREATE TABLE public.missions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  label_pt text NOT NULL,
  label_en text NOT NULL,
  cycle text NOT NULL CHECK (cycle IN ('daily', 'weekly', 'monthly')),
  total int NOT NULL DEFAULT 1,
  xp int NOT NULL DEFAULT 0,
  sort_order int NOT NULL DEFAULT 0
);

GRANT SELECT ON public.missions TO anon;
GRANT SELECT ON public.missions TO authenticated;
GRANT ALL ON public.missions TO service_role;
ALTER TABLE public.missions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Missions are public read-only" ON public.missions
  FOR SELECT TO anon, authenticated USING (true);

-- Progresso do utilizador nas missões
CREATE TABLE public.user_mission_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  mission_id uuid REFERENCES public.missions(id) ON DELETE CASCADE NOT NULL,
  progress int NOT NULL DEFAULT 0,
  completed bool NOT NULL DEFAULT false,
  claimed bool NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, mission_id)
);

GRANT SELECT, INSERT, UPDATE ON public.user_mission_progress TO authenticated;
GRANT ALL ON public.user_mission_progress TO service_role;
ALTER TABLE public.user_mission_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own mission progress" ON public.user_mission_progress
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Estatísticas do gamer
CREATE TABLE public.stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  hours int NOT NULL DEFAULT 0,
  wins int NOT NULL DEFAULT 0,
  kd numeric(5,2) NOT NULL DEFAULT 0,
  mvps int NOT NULL DEFAULT 0,
  accuracy int NOT NULL DEFAULT 0,
  heroes int NOT NULL DEFAULT 0,
  trend int[] NOT NULL DEFAULT '{}',
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE ON public.stats TO authenticated;
GRANT ALL ON public.stats TO service_role;
ALTER TABLE public.stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own stats" ON public.stats
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Public read stats" ON public.stats
  FOR SELECT TO anon USING (true);

-- Eventos
CREATE TABLE public.events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  label_pt text NOT NULL,
  label_en text NOT NULL,
  when_pt text NOT NULL,
  when_en text NOT NULL,
  hue text NOT NULL,
  starts_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.events TO anon;
GRANT SELECT ON public.events TO authenticated;
GRANT ALL ON public.events TO service_role;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Events are public read-only" ON public.events
  FOR SELECT TO anon, authenticated USING (true);

-- Notificações
CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  kind text NOT NULL CHECK (kind IN ('system', 'live', 'guild', 'order', 'friend', 'coffee')),
  title_pt text NOT NULL,
  title_en text NOT NULL,
  body_pt text NOT NULL,
  body_en text NOT NULL,
  read bool NOT NULL DEFAULT false,
  metadata jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own notifications" ON public.notifications
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Guildas
CREATE TABLE public.guilds (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  tag text NOT NULL,
  rank text NOT NULL,
  xp int NOT NULL DEFAULT 0,
  xp_max int NOT NULL DEFAULT 100000,
  owner_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.guilds TO anon;
GRANT SELECT ON public.guilds TO authenticated;
GRANT ALL ON public.guilds TO service_role;
ALTER TABLE public.guilds ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Guilds are public read-only" ON public.guilds
  FOR SELECT TO anon, authenticated USING (true);

-- Membros das guildas
CREATE TABLE public.guild_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  guild_id uuid REFERENCES public.guilds(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role text NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'officer', 'member')),
  joined_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (guild_id, user_id)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.guild_members TO authenticated;
GRANT ALL ON public.guild_members TO service_role;
ALTER TABLE public.guild_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Guild members visible" ON public.guild_members
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users join guilds" ON public.guild_members
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users leave guilds" ON public.guild_members
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Amigos
CREATE TABLE public.friends (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  addressee_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'blocked')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (requester_id, addressee_id)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.friends TO authenticated;
GRANT ALL ON public.friends TO service_role;
ALTER TABLE public.friends ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own friendships" ON public.friends
  FOR ALL TO authenticated USING (auth.uid() = requester_id OR auth.uid() = addressee_id)
  WITH CHECK (auth.uid() = requester_id OR auth.uid() = addressee_id);

-- Salas de live
CREATE TABLE public.live_rooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  game text NOT NULL,
  provider text NOT NULL DEFAULT 'daily',
  provider_room_id text,
  provider_url text,
  is_live bool NOT NULL DEFAULT true,
  viewer_count int NOT NULL DEFAULT 0,
  started_at timestamptz NOT NULL DEFAULT now(),
  ended_at timestamptz
);

GRANT SELECT, INSERT, UPDATE ON public.live_rooms TO authenticated;
GRANT ALL ON public.live_rooms TO service_role;
ALTER TABLE public.live_rooms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Live rooms are public read-only" ON public.live_rooms
  FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Streamers manage own rooms" ON public.live_rooms
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Mensagens de chat
CREATE TABLE public.chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id uuid REFERENCES public.live_rooms(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, DELETE ON public.chat_messages TO authenticated;
GRANT ALL ON public.chat_messages TO service_role;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read chat messages" ON public.chat_messages
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users send chat messages" ON public.chat_messages
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users delete own messages" ON public.chat_messages
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Café (presentes convertidos em dinheiro)
CREATE TABLE public.coffee_gifts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  recipient_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  amount numeric(12,2) NOT NULL,
  message text,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.coffee_gifts TO authenticated;
GRANT ALL ON public.coffee_gifts TO service_role;
ALTER TABLE public.coffee_gifts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own coffee gifts" ON public.coffee_gifts
  FOR SELECT TO authenticated USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

CREATE POLICY "Users send coffee" ON public.coffee_gifts
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = sender_id);

-- Links de acesso seguros
CREATE TABLE public.access_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  token text NOT NULL UNIQUE,
  game text NOT NULL,
  expires_at timestamptz NOT NULL,
  revoked bool NOT NULL DEFAULT false,
  used_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.access_links TO authenticated;
GRANT ALL ON public.access_links TO service_role;
ALTER TABLE public.access_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own access links" ON public.access_links
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Highlights analisados por IA
CREATE TABLE public.highlights (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title_pt text NOT NULL,
  title_en text NOT NULL,
  game text NOT NULL,
  map text NOT NULL,
  match_date date NOT NULL,
  duration text NOT NULL,
  kda text NOT NULL,
  tags text[] NOT NULL DEFAULT '{}',
  hue text NOT NULL,
  timeline jsonb,
  insights jsonb,
  video_url text,
  is_public bool NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.highlights TO authenticated;
GRANT ALL ON public.highlights TO service_role;
ALTER TABLE public.highlights ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own highlights" ON public.highlights
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Public highlights visible" ON public.highlights
  FOR SELECT TO anon, authenticated USING (is_public = true);

-- Triggers para updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_contracts_updated_at BEFORE UPDATE ON public.contracts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_wallets_updated_at BEFORE UPDATE ON public.wallets
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_user_mission_progress_updated_at BEFORE UPDATE ON public.user_mission_progress
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_stats_updated_at BEFORE UPDATE ON public.stats
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_friends_updated_at BEFORE UPDATE ON public.friends
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Seed de cartas
INSERT INTO public.cards (id, name, rarity, glow, price, current_rank, target_rank, medals, days, success, support, players, matches, description, sort_order) VALUES
('iron', 'Iron', 'iron', 'var(--rarity-iron)', 4.99, 'Iron IV', 'Bronze IV', 8, '1 - 2', 99, 'llm', 12, '10 - 18', 'Entry tier com suporte IA', 1),
('bronze', 'Bronze', 'bronze', 'var(--rarity-bronze)', 9.99, 'Bronze III', 'Silver IV', 12, '1 - 3', 98, 'llm', 16, '14 - 22', 'Suporte IA para subir rápido', 2),
('silver', 'Silver', 'silver', 'var(--rarity-silver)', 14.99, 'Silver II', 'Gold IV', 18, '2 - 4', 97, 'llm', 20, '18 - 28', 'IA + dicas de rotação', 3),
('gold', 'Gold', 'gold', 'var(--rarity-gold)', 24.99, 'Gold III', 'Platinum IV', 26, '3 - 5', 96, 'llm', 24, '24 - 34', 'Último tier com suporte IA puro', 4),
('platinum', 'Platinum', 'platinum', 'var(--rarity-platinum)', 34.99, 'Platinum IV', 'Diamond IV', 32, '4 - 6', 95, 'human', 18, '30 - 42', 'Jogadores profissionais entram', 5),
('diamond', 'Diamond', 'diamond', 'var(--rarity-diamond)', 49.99, 'Diamond IV', 'Diamond II', 45, '4 - 7', 94, 'human', 24, '40 - 60', 'Boost elite com pros', 6),
('master', 'Master', 'master', 'var(--rarity-master)', 79.99, 'Diamond I', 'Master', 62, '6 - 10', 92, 'human', 30, '60 - 90', 'Alto nível, revisão manual', 7),
('legendary', 'Legendary', 'legendary', 'var(--rarity-legendary)', 149.99, 'Master', 'Grandmaster', 99, '10 - 20', 90, 'human', 40, '90 - 150', 'Experiência premium personalizada', 8);

-- Seed de missões
INSERT INTO public.missions (label_pt, label_en, cycle, total, xp, sort_order) VALUES
('Vencer 3 ranqueadas', 'Win 3 ranked games', 'daily', 3, 150, 1),
('Gravar 5 highlights', 'Record 5 highlights', 'daily', 5, 100, 2),
('Subir 1 divisão', 'Climb 1 division', 'weekly', 1, 800, 3),
('Evento da guilda', 'Guild event', 'monthly', 4, 2400, 4);

-- Seed de eventos
INSERT INTO public.events (label_pt, label_en, when_pt, when_en, hue, starts_at) VALUES
('Torneio Evolution Cup', 'Evolution Cup', 'Sábado 18:00', 'Saturday 6pm', 'var(--neon-gold)', now() + interval '3 days'),
('Noite de lives da guilda', 'Guild live night', 'Sexta 21:00', 'Friday 9pm', 'var(--neon-pink)', now() + interval '2 days'),
('Treino coletivo IA', 'AI group training', 'Amanhã 20:00', 'Tomorrow 8pm', 'var(--neon-cyan)', now() + interval '1 day');

-- Seed de guilda demo
INSERT INTO public.guilds (name, tag, rank, xp, xp_max) VALUES
('Evolution Guild', 'EVO', '#7', 84200, 120000);

-- Realtime para chat e notificações
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.live_rooms;