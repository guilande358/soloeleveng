# Carteira, contratos, lives e checkout — dados reais

Ligar quatro módulos do OS ao backend já existente (as 21 tabelas estão criadas e as cartas, missões, eventos e guilda demo já estão semeadas). Sem Stripe nem PayPal: o pagamento é processado por um provedor interno simulado, com a mesma estrutura de pedido, webhook e histórico que um gateway real usaria — trocar por Stripe/Paddle mais tarde é só substituir o passo de cobrança.

## 1. Carteira com extrato real

- Server functions em `src/lib/wallet.functions.ts` (protegidas por auth): saldo e contadores, extrato paginado a partir de `wallet_transactions`, pedido de saque e recarga simulada.
- Saque: nova tabela `payout_requests` (valor, método, destino mascarado, estado `pending/approved/paid/rejected`). O saque bloqueia o valor em `wallets.pending`, valida saldo suficiente e mínimo, e grava uma transação de tipo `payout`.
- Todos os movimentos de saldo passam por uma função de base de dados única (`apply_wallet_delta`), para que saldo e extrato nunca fiquem dessincronizados.
- `WalletWidget` e `WalletFull` passam a ler dados reais: saldo, cafés, pendente, lista de transações com sinal e data, formulário de saque e estado do pedido. Sem sessão, mostra CTA para `/auth`.

## 2. Cartas, pedidos e checkout

- `src/lib/orders.functions.ts`: criar pedido a partir de uma carta, listar pedidos, cancelar, e fazer upgrade (substitui o pedido ativo). Regra de uma carta ativa por utilizador validada no backend por índice único parcial, não apenas na UI.
- Checkout real de ponta a ponta com provedor interno:
  1. `createCheckout` grava o pedido em estado `pending_payment` e devolve uma referência de pagamento.
  2. A página `/checkout` mostra resumo, modo (Friendly/GamerPRO), comissão e confirma o pagamento por saldo da carteira ou por confirmação simulada.
  3. Rota pública `src/routes/api/public/payments/webhook.ts` recebe a confirmação assinada (HMAC com segredo gerado), valida a assinatura, marca o pedido como `active`, debita/credita a carteira e cria o contrato. Idempotente por referência.
- `/cartas` e o painel "Minha carta" passam a usar `cards` e `orders` do backend em vez de `src/data/game.ts`.

## 3. Contratos com progresso e comissão

- Cada pedido pago cria um `contract` ligado à carta, com modo, taxa de comissão (0% Friendly, comissão do sistema no GamerPRO) e datas.
- Nova tabela `contract_progress` com marcos (rank atual, medalhas, partidas, percentagem) para alimentar a barra de progresso.
- Comissão calculada no backend em cada evento de pagamento/ganho; nunca no cliente. Ao concluir o contrato, o valor líquido do jogador entra na carteira e a comissão fica registada como transação do sistema.
- `ContractsWidget`/`ContractsFull` mostram contratos reais, estado, progresso e valores.

## 4. Lives e chat em tempo real

- Chat: `chat_messages` já existe; adicionar à publicação de Realtime e subscrever por sala, com envio, scroll automático e limpeza da subscrição ao desmontar.
- Lives: sala criada em `live_rooms` e vídeo por WebRTC peer-to-peer usando o Realtime como canal de sinalização (oferta/resposta/ICE). Isto funciona sem provedor externo pago; para audiências grandes, um servidor de media externo pode ser ligado depois sem mudar o modelo de dados.
- Presentes: envio de café grava em `coffee_gifts` e credita a carteira do streamer via a mesma função de saldo, aparecendo no extrato e convertível em saque.
- `LivesWidget`/`LivesFull` passam a listar salas ao vivo reais, contagem de espectadores, chat e botão de café.

## Notas técnicas

- Migrações: `payout_requests`, `contract_progress`, índice único parcial de pedido ativo, função `apply_wallet_delta` (security definer), `ALTER PUBLICATION supabase_realtime` para `chat_messages` e `live_rooms`. Todas as tabelas novas com GRANT + RLS por `auth.uid()`.
- Server functions em `src/lib/*.functions.ts` com `requireSupabaseAuth`; o webhook fica em `api/public/*` com verificação de assinatura.
- Segredo do webhook gerado automaticamente — não é preciso nenhuma conta de pagamentos.
- Painéis do OS mantêm o design atual; muda apenas a origem dos dados.
