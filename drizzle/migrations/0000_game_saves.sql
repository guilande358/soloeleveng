CREATE TABLE public.game_saves (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  game_name text NOT NULL,
  slot text NOT NULL DEFAULT 'Slot 1',
  file_name text NOT NULL,
  storage_path text NOT NULL,
  size_bytes bigint NOT NULL DEFAULT 0,
  sha256 text NOT NULL,
  note text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, DELETE ON public.game_saves TO authenticated;
GRANT ALL ON public.game_saves TO service_role;
ALTER TABLE public.game_saves ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own saves select" ON public.game_saves FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "own saves insert" ON public.game_saves FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own saves delete" ON public.game_saves FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE INDEX game_saves_user_idx ON public.game_saves(user_id, created_at DESC);

CREATE POLICY "own save files read" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'game-saves' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "own save files insert" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'game-saves' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "own save files delete" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'game-saves' AND (storage.foldername(name))[1] = auth.uid()::text);