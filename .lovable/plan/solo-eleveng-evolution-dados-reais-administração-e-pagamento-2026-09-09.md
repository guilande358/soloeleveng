# Solo Eleveng Evolution — dados reais, administração e pagamentos

Seis frentes, em ordem de execução. Tudo em PT/EN como já está no HUD.

## 1. Jogos suportados (nova tela)

- Novo cadastro de jogos com: nome, imagem/cor, se aceita elevação, regras de acesso (o que o jogador precisa partilhar) e regras de proteção (limites, avisos anti-ban).
- Só administradores criam ou editam; todos os jogadores veem a lista.
- O painel **Acessos** passa a listar as contas autorizadas agrupadas por jogo, mostrando as regras daquele jogo junto de cada link cifrado, e a seleção de jogo ao criar um link usa esta lista real (hoje usa uma lista fixa no código).

## 2. Nível, range e XP de partidas reais

- Nova tabela de partidas: jogo, resultado, abates/mortes, duração, medalhas, data. O jogador registra a partida no HUD (formulário simples), como escolhido.
- Cada partida gera XP; XP acumula no perfil e sobe nível e range conforme as faixas das cartas.
- A carta ativa avança sozinha: o progresso do contrato (percentagem, medalhas, partidas) passa a ser calculado das partidas registradas, e a carta conclui automaticamente ao atingir o range alvo.
- Nenhum XP inventado: sem partidas registradas, o progresso fica em zero.

## 3. Painéis que ainda são de demonstração

- **Missões**: lê as missões da base e o progresso real de cada jogador; missões diárias/semanais avançam com partidas, highlights e lives; recompensa em XP resgatável.
- **Estatísticas**: calculadas das partidas registradas (horas, vitórias, K/D, MVPs, precisão, tendência).
- **Replays**: passa a mostrar os highlights reais do jogador (já existentes) com filtro por jogo.
- **Notificações**: lê as notificações reais da conta, com marcar como lida e contador no cabeçalho.
- **Marketplace**: mostra as cartas reais do catálogo com preço da base e compra que cai no checkout; itens sem produto real saem da lista em vez de ficarem falsos.

## 4. Pagamentos reais (Paddle)

- Cartão de crédito e link de pagamento via Paddle; ao pagar, o saldo da carteira é creditado e o pedido/contrato é ativado pelo aviso assinado do provedor.
- Recarga da carteira e compra direta de carta usam o mesmo fluxo.
- Importante: os pagamentos integrados exigem um plano pago do Lovable. Ao chegar nesta etapa eu abro a ativação; se o plano não estiver ativo, mantemos o pagamento por saldo funcionando e ligamos o cartão depois.

## 5. Painel de administração

- Área nova, visível só para a sua conta marcada como administradora (papel de administrador na base — sem senha secreta paralela).
- Abas: Pedidos, Contratos, Lives, Carteiras/Saques, Jogos.
- Ações: mudar estado de pedido e contrato, encerrar uma live, aprovar ou recusar saques, ajustar saldo com registro no extrato, criar/editar jogos suportados.
- Toda ação passa por verificação de papel no servidor e fica registrada.

## 6. Empacotamento automático no GitHub

- Fluxo de trabalho que, em cada envio e pedido de alteração, instala, verifica tipos, faz lint e compila.
- Guarda o resultado compilado como pacote baixável do próprio GitHub.

## Detalhes técnicos

- Migrações: `games` (regras de acesso/proteção, GRANT + RLS: leitura pública, escrita só admin), `matches` (RLS por `auth.uid()`), colunas de XP/nível no `profiles`, `game_id` em `access_links`, função `add_match_xp` (SECURITY DEFINER) que credita XP, recalcula nível/range e atualiza `contract_progress`; políticas de admin com `has_role(auth.uid(),'admin')` nas tabelas geridas.
- Server functions novas: `games.functions.ts`, `matches.functions.ts`, `missions.functions.ts`, `notifications.functions.ts`, `admin.functions.ts` (todas com `requireSupabaseAuth`; admin valida papel via `context.supabase` antes de qualquer escrita).
- Rotas: `/jogos` (cadastro admin), `/_authenticated/admin` sob o gate gerido; `panels.tsx` troca os widgets mock pelos painéis reais; `src/data/os.ts` deixa de exportar listas de demonstração usadas em produção.
- Paddle: `enable_paddle_payments`, produtos via catálogo, checkout hospedado e webhook em `src/routes/api/public/payments/paddle.ts` com verificação de assinatura, reutilizando `settlePayment`.
- CI: `.github/workflows/build.yml` com bun install, `tsgo --noEmit`, `eslint`, `vite build` e upload do `.output` como artifact.
- Sua conta recebe o papel de administrador por migração após confirmar o e-mail de acesso.
