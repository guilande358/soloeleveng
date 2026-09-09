-- ============ GAMES ============
CREATE TABLE public.games (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  hue text NOT NULL DEFAULT 'var(--neon-cyan)',
  elevation_enabled boolean NOT NULL DEFAULT true,
  access_rules_pt text NOT NULL DEFAULT '',
  access_rules_en text NOT NULL DEFAULT '',
  protection_rules_pt text NOT NULL DEFAULT '',
  protection_rules_en text NOT NULL DEFAULT '',
  max_sessions integer NOT NULL DEFAULT 1,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.games TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.games TO authenticated;
GRANT ALL ON public.games TO service_role;

ALTER TABLE public.games ENABLE ROW LEVEL SECURITY;

CREATE POLICY "games_public_read" ON public.games FOR SELECT USING (true);
CREATE POLICY "games_admin_insert" ON public.games FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "games_admin_update" ON public.games FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "games_admin_delete" ON public.games FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_games_updated_at BEFORE UPDATE ON public.games
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.games (slug, name, hue, access_rules_pt, access_rules_en, protection_rules_pt, protection_rules_en, max_sessions, sort_order) VALUES
('valorant','Valorant','var(--neon-pink)','Partilhe apenas o link cifrado de sessão. Nunca envie a sua senha por chat.','Share only the encrypted session link. Never send your password over chat.','Máximo 1 sessão ativa, sem troca de região e sem compras na conta.','Max 1 active session, no region change and no purchases on the account.',1,1),
('lol','League of Legends','var(--neon)','Link cifrado com validade de 15 minutos e confirmação por e-mail.','Encrypted link valid for 15 minutes with e-mail confirmation.','Sem alterar nome de invocador nem desbloquear campeões durante o contrato.','No summoner-name changes or champion unlocks during the contract.',1,2),
('cs2','CS2','var(--neon-cyan)','Autorização via Steam Guard partilhada apenas pelo link do sistema.','Steam Guard authorization shared only through the system link.','Sem trocas de inventário e sem login simultâneo.','No inventory trades and no simultaneous logins.',1,3),
('apex','Apex Legends','var(--neon-gold)','Link cifrado por sessão, revogável a qualquer momento.','Per-session encrypted link, revocable at any time.','Uma sessão por vez, sem compras de moedas.','One session at a time, no coin purchases.',1,4),
('fortnite','Fortnite','var(--neon-green)','Acesso apenas por link temporário, sem partilha de e-mail principal.','Access only via temporary link, no main e-mail sharing.','Sem presentes nem compras na loja durante a elevação.','No gifting or shop purchases during elevation.',1,5),
('cod','Call of Duty','var(--rarity-diamond)','Link cifrado e verificação de dispositivo antes de cada sessão.','Encrypted link and device verification before each session.','Sem alterar plataforma nem ativar cross-play durante o contrato.','No platform change or cross-play toggle during the contract.',1,6);

ALTER TABLE public.access_links ADD COLUMN game_id uuid REFERENCES public.games(id) ON DELETE SET NULL;

-- ============ PROFILE PROGRESSION ============
ALTER TABLE public.profiles
  ADD COLUMN xp integer NOT NULL DEFAULT 0,
  ADD COLUMN level integer NOT NULL DEFAULT 1,
  ADD COLUMN rank text NOT NULL DEFAULT 'Iron';

-- ============ MISSIONS KIND ============
ALTER TABLE public.missions ADD COLUMN kind text NOT NULL DEFAULT 'match';
UPDATE public.missions SET kind = 'highlight' WHERE label_en ILIKE '%highlight%';
UPDATE public.missions SET kind = 'rank' WHERE label_en ILIKE '%climb%' OR label_en ILIKE '%division%';
UPDATE public.missions SET kind = 'live' WHERE label_en ILIKE '%live%' OR label_en ILIKE '%guild%';

-- ============ MATCHES ============
CREATE TABLE public.matches (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  game_id uuid REFERENCES public.games(id) ON DELETE SET NULL,
  game_name text NOT NULL,
  result text NOT NULL DEFAULT 'win',
  kills integer NOT NULL DEFAULT 0,
  deaths integer NOT NULL DEFAULT 0,
  assists integer NOT NULL DEFAULT 0,
  duration_minutes integer NOT NULL DEFAULT 0,
  medals integer NOT NULL DEFAULT 0,
  mvp boolean NOT NULL DEFAULT false,
  accuracy integer NOT NULL DEFAULT 0,
  xp integer NOT NULL DEFAULT 0,
  note text,
  played_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX matches_user_played_idx ON public.matches (user_id, played_at DESC);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.matches TO authenticated;
GRANT ALL ON public.matches TO service_role;

ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "matches_own_select" ON public.matches FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "matches_own_insert" ON public.matches FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "matches_own_update" ON public.matches FOR UPDATE TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "matches_own_delete" ON public.matches FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- rank ladder helper
CREATE OR REPLACE FUNCTION public.rank_for_xp(_xp integer)
RETURNS text
LANGUAGE sql
IMMUTABLE
SET search_path = public
AS $$
  SELECT (ARRAY['Iron','Bronze','Silver','Gold','Platinum','Diamond','Master','Legendary'])[
    LEAST(8, GREATEST(1, (COALESCE(_xp,0) / 4000) + 1))
  ];
$$;

-- award xp, level, rank, contract progress and missions on every match
CREATE OR REPLACE FUNCTION public.award_match_progress()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  gained integer;
  total_xp integer;
  contract_row record;
  card_row record;
  new_matches integer;
  new_medals integer;
  new_percent integer;
BEGIN
  gained := GREATEST(0,
      CASE NEW.result WHEN 'win' THEN 120 WHEN 'draw' THEN 60 ELSE 30 END
    + (NEW.kills * 3) + (NEW.assists * 1) + (NEW.medals * 25)
    + (CASE WHEN NEW.mvp THEN 100 ELSE 0 END));

  NEW.xp := gained;

  UPDATE public.profiles
     SET xp = xp + gained,
         level = GREATEST(1, ((xp + gained) / 1000) + 1),
         rank = public.rank_for_xp(xp + gained),
         updated_at = now()
   WHERE id = NEW.user_id
  RETURNING xp INTO total_xp;

  SELECT c.id, c.order_id, o.card_id
    INTO contract_row
    FROM public.contracts c
    LEFT JOIN public.orders o ON o.id = c.order_id
   WHERE c.user_id = NEW.user_id AND c.status = 'active'
   ORDER BY c.created_at DESC
   LIMIT 1;

  IF contract_row.id IS NOT NULL THEN
    SELECT * INTO card_row FROM public.cards WHERE id = contract_row.card_id;

    UPDATE public.contract_progress
       SET matches = matches + 1,
           medals = medals + NEW.medals,
           current_rank = COALESCE(public.rank_for_xp(total_xp), current_rank),
           updated_at = now()
     WHERE contract_id = contract_row.id
    RETURNING matches, medals INTO new_matches, new_medals;

    IF new_matches IS NOT NULL THEN
      new_percent := LEAST(100, GREATEST(0, ROUND(
        (new_medals::numeric / GREATEST(COALESCE(card_row.medals, 10), 1)) * 100
      )::integer));

      UPDATE public.contract_progress
         SET percent = new_percent, updated_at = now()
       WHERE contract_id = contract_row.id;

      IF new_percent >= 100 THEN
        UPDATE public.contracts SET status = 'completed', ends_at = now(), updated_at = now()
         WHERE id = contract_row.id AND status = 'active';
        IF contract_row.order_id IS NOT NULL THEN
          UPDATE public.orders SET status = 'completed', completed_at = now(), updated_at = now()
           WHERE id = contract_row.order_id;
        END IF;
        INSERT INTO public.notifications (user_id, kind, title_pt, title_en, body_pt, body_en, metadata)
        VALUES (NEW.user_id, 'order', 'Carta concluída', 'Card completed',
                COALESCE(card_row.name, 'Carta') || ' alcançou o range alvo.',
                COALESCE(card_row.name, 'Card') || ' reached the target rank.',
                jsonb_build_object('contract_id', contract_row.id));
      END IF;
    END IF;
  END IF;

  -- mission progress for match-based missions
  INSERT INTO public.user_mission_progress (user_id, mission_id, progress, completed, claimed)
  SELECT NEW.user_id, m.id, 1, 1 >= m.total, false
    FROM public.missions m
   WHERE m.kind = 'match'
  ON CONFLICT (user_id, mission_id) DO UPDATE
    SET progress = public.user_mission_progress.progress + 1,
        completed = public.user_mission_progress.progress + 1 >=
          (SELECT total FROM public.missions WHERE id = public.user_mission_progress.mission_id),
        updated_at = now();

  RETURN NEW;
END;
$$;

ALTER TABLE public.user_mission_progress
  ADD CONSTRAINT user_mission_progress_user_mission_key UNIQUE (user_id, mission_id);

CREATE TRIGGER matches_award_progress BEFORE INSERT ON public.matches
  FOR EACH ROW EXECUTE FUNCTION public.award_match_progress();

-- ============ ADMIN VISIBILITY ============
CREATE POLICY "orders_admin_all" ON public.orders FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "contracts_admin_all" ON public.contracts FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "contract_progress_admin_all" ON public.contract_progress FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "live_rooms_admin_all" ON public.live_rooms FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "wallets_admin_all" ON public.wallets FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "wallet_transactions_admin_select" ON public.wallet_transactions FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "payout_requests_admin_all" ON public.payout_requests FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "payment_intents_admin_select" ON public.payment_intents FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "profiles_admin_select" ON public.profiles FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- owner account becomes administrator
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role FROM auth.users WHERE email = 'elguilande5@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;