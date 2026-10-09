CREATE TABLE public.riot_accounts (
  user_id uuid PRIMARY KEY,
  puuid text NOT NULL,
  game_name text NOT NULL,
  tag_line text NOT NULL,
  platform text NOT NULL,
  tier text,
  division text,
  lp integer,
  last_synced_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, DELETE ON public.riot_accounts TO authenticated;
GRANT ALL ON public.riot_accounts TO service_role;
ALTER TABLE public.riot_accounts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own riot account read" ON public.riot_accounts FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "own riot account delete" ON public.riot_accounts FOR DELETE TO authenticated USING (auth.uid() = user_id);

ALTER TABLE public.matches ADD COLUMN external_match_id text, ADD COLUMN source text NOT NULL DEFAULT 'manual';
CREATE UNIQUE INDEX matches_user_external_uidx ON public.matches (user_id, external_match_id) WHERE external_match_id IS NOT NULL;