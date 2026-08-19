-- Demo highlights for existing accounts (no schema changes)
INSERT INTO public.highlights (user_id, title_pt, title_en, game, map, match_date, duration, kda, tags, hue, timeline, insights, is_public)
SELECT p.id,
       'Clutch 1v3 na retomada', '1v3 clutch on retake',
       'Valorant', 'Ascent', CURRENT_DATE - 1, '00:42', '3/0/1',
       ARRAY['CLUTCH','MVP','ACE'], 'var(--neon-pink)',
       '[{"at":"00:04","pt":"Entrada agressiva","en":"Aggressive entry"},{"at":"00:21","pt":"Duplo abate","en":"Double kill"},{"at":"00:38","pt":"Desarme sob pressão","en":"Defuse under pressure"}]'::jsonb,
       '[{"pt":"Boa gestão de utilitários","en":"Great utility usage"},{"pt":"Melhorar rotação no meio","en":"Improve mid rotation"}]'::jsonb,
       true
FROM public.profiles p
WHERE NOT EXISTS (SELECT 1 FROM public.highlights h WHERE h.user_id = p.id);

INSERT INTO public.highlights (user_id, title_pt, title_en, game, map, match_date, duration, kda, tags, hue, timeline, insights, is_public)
SELECT p.id,
       'Sequência de 5 vitórias', '5-win streak',
       'League of Legends', 'Summoner''s Rift', CURRENT_DATE - 3, '01:15', '9/2/7',
       ARRAY['CARRY','FARM'], 'var(--neon-cyan)',
       '[{"at":"00:12","pt":"Gank no rio","en":"River gank"},{"at":"00:55","pt":"Objetivo garantido","en":"Objective secured"}]'::jsonb,
       '[{"pt":"Farm acima da média","en":"Above-average farm"}]'::jsonb,
       true
FROM public.profiles p
WHERE (SELECT count(*) FROM public.highlights h WHERE h.user_id = p.id) < 2;

-- Demo live room so the lives panel has a room with chat
INSERT INTO public.live_rooms (user_id, title, game, provider, is_live, viewer_count)
SELECT p.id, 'Ranqueada ao vivo — sala demo', 'Valorant', 'webrtc', true, 42
FROM public.profiles p
WHERE NOT EXISTS (SELECT 1 FROM public.live_rooms r WHERE r.user_id = p.id)
LIMIT 1;

-- Demo stats so the statistics panel shows real rows
INSERT INTO public.stats (user_id, hours, wins, kd, mvps, accuracy, heroes, trend)
SELECT p.id, 428, 312, 2.4, 57, 68, 14, ARRAY[12,18,15,22,26,24,31]
FROM public.profiles p
WHERE NOT EXISTS (SELECT 1 FROM public.stats s WHERE s.user_id = p.id);

-- Realtime for highlights
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'highlights'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.highlights;
  END IF;
END $$;