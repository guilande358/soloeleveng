-- Free starter card so any new gamer can begin evolving without paying.
INSERT INTO public.cards (
  id, name, rarity, glow, price, current_rank, target_rank, medals, days,
  success, support, players, matches, description, sort_order
) VALUES (
  'starter', 'Starter', 'iron', 'var(--neon-green)', 0,
  'Unranked', 'Iron IV', 4, '1 - 2', 99, 'llm', 6, '5 - 10',
  'Carta gratuita de entrada: ative sem pagar e comece a registrar partidas.', 0
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  price = EXCLUDED.price,
  glow = EXCLUDED.glow,
  current_rank = EXCLUDED.current_rank,
  target_rank = EXCLUDED.target_rank,
  medals = EXCLUDED.medals,
  days = EXCLUDED.days,
  success = EXCLUDED.success,
  support = EXCLUDED.support,
  players = EXCLUDED.players,
  matches = EXCLUDED.matches,
  description = EXCLUDED.description,
  sort_order = EXCLUDED.sort_order;