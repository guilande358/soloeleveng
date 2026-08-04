-- payout requests
CREATE TABLE public.payout_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount numeric NOT NULL,
  method text NOT NULL,
  destination text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.payout_requests TO authenticated;
GRANT ALL ON public.payout_requests TO service_role;
ALTER TABLE public.payout_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own payouts" ON public.payout_requests FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users create own payouts" ON public.payout_requests FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_payout_requests_updated_at BEFORE UPDATE ON public.payout_requests FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- contract progress
CREATE TABLE public.contract_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id uuid NOT NULL REFERENCES public.contracts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  current_rank text NOT NULL DEFAULT '',
  medals integer NOT NULL DEFAULT 0,
  matches integer NOT NULL DEFAULT 0,
  percent integer NOT NULL DEFAULT 0,
  note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.contract_progress TO authenticated;
GRANT ALL ON public.contract_progress TO service_role;
ALTER TABLE public.contract_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own contract progress" ON public.contract_progress FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE TRIGGER update_contract_progress_updated_at BEFORE UPDATE ON public.contract_progress FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- payment intents
CREATE TABLE public.payment_intents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  order_id uuid REFERENCES public.orders(id) ON DELETE SET NULL,
  reference text NOT NULL UNIQUE,
  card_id text NOT NULL REFERENCES public.cards(id),
  mode text NOT NULL DEFAULT 'friendly',
  method text NOT NULL DEFAULT 'wallet',
  amount numeric NOT NULL,
  commission numeric NOT NULL DEFAULT 0,
  total numeric NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.payment_intents TO authenticated;
GRANT ALL ON public.payment_intents TO service_role;
ALTER TABLE public.payment_intents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own payment intents" ON public.payment_intents FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE TRIGGER update_payment_intents_updated_at BEFORE UPDATE ON public.payment_intents FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- one active/pending order per user
CREATE UNIQUE INDEX orders_one_open_per_user
  ON public.orders (user_id)
  WHERE status IN ('active', 'pending_payment');

-- single source of truth for wallet movements
CREATE OR REPLACE FUNCTION public.apply_wallet_delta(
  _user_id uuid,
  _kind text,
  _amount numeric,
  _description text,
  _metadata jsonb DEFAULT NULL,
  _coffee_delta integer DEFAULT 0,
  _pending_delta numeric DEFAULT 0
)
RETURNS numeric
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_balance numeric;
BEGIN
  INSERT INTO public.wallets (user_id, balance, coffee_count, pending)
  VALUES (_user_id, 0, 0, 0)
  ON CONFLICT (user_id) DO NOTHING;

  UPDATE public.wallets
     SET balance = balance + _amount,
         coffee_count = coffee_count + _coffee_delta,
         pending = pending + _pending_delta,
         updated_at = now()
   WHERE user_id = _user_id
  RETURNING balance INTO new_balance;

  IF new_balance < 0 THEN
    RAISE EXCEPTION 'insufficient_funds';
  END IF;

  INSERT INTO public.wallet_transactions (user_id, kind, amount, description, metadata)
  VALUES (_user_id, _kind, _amount, _description, _metadata);

  RETURN new_balance;
END;
$$;

CREATE UNIQUE INDEX IF NOT EXISTS wallets_user_id_key ON public.wallets (user_id);

-- realtime
ALTER TABLE public.chat_messages REPLICA IDENTITY FULL;
ALTER TABLE public.live_rooms REPLICA IDENTITY FULL;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'live_rooms'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.live_rooms;
  END IF;
END $$;