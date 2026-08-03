# Backend e funcionalidades — Solo Eleveng Evolution

Ativar a Lovable Cloud e transformar o HUD atual (dados mock em `localStorage` e `src/data/os.ts`) num sistema operacional gamer persistente, com autenticação, perfil, cartas/contratos, carteira, notificações, guilda, amigos, lives, chat e IA de suporte.

## Decisões já tomadas

- **Escopo:** todos os 16 painéis passam a dados reais de uma só vez.
- **Pagamentos:** mock/simulação nesta fase (sem Stripe/Paddle real).
- **Rede de suporte:** híbrida — tiers Iron a Gold usam LLM; Platinum+ usam jogadores profissionais.
- **Lives e chat:** funcionalidade real (chat persistente + estrutura para live streaming).

## O que falta hoje

1. **Lovable Cloud desativada** — não há projeto Supabase, auth, banco nem storage.
2. **Estado local apenas** — `HudProvider` guarda `activeCardId`, `mode` e `profile` em `localStorage`.
3. **Dados estáticos** — `src/data/os.ts` e `src/data/game.ts` são mocks sem origem dinâmica.
4. **Auth visual** — `src/routes/auth.tsx` tem formulários, mas sem backend.
5. **Server functions** — `src/start.ts` só tem CSRF e error middleware; falta middleware de auth Supabase.
6. **Lives reais** — não há infraestrutura de streaming; WebRTC não roda diretamente no Worker da Lovable Cloud.

## Arquitetura proposta

```text
Cliente (TanStack Start + React 19)
  ├─ Server Functions (createServerFn) para lógica de negócio
  ├─ Supabase Realtime para chat e notificações ao vivo
  └─ TanStack Query para cache/loading

Servidor
  ├─ Lovable Cloud (Supabase) — PostgreSQL, Auth, Storage
  ├─ RLS + roles (app_role) para permissões
  └─ Integração externa para lives (Daily.co / 100ms / LiveKit) — streaming real não roda no Worker

IA
  ├─ Lovable AI Gateway para análise de highlights e coaching LLM
  └─ Modelo escolhido conforme catálogo (não OpenAI Responses nesta fase)
```

## Modelo de dados (tabelas principais)

| Tabela | Propósito |
| --- | --- |
| `profiles` | Dados públicos do gamer (nome, título, bio, avatar, accent). |
| `user_roles` | Papel do utilizador (`user`, `moderator`, `admin`). |
| `cards` | Catálogo de cartas (raridade, preço, ranks, suporte LLM/humano). |
| `orders` | Compra/upgrade de cartas ativas (uma por utilizador). |
| `contracts` | Contratos Friendly ou GamerPRO (estado, comissão, datas). |
| `wallet` | Saldo, café e transações. |
| `missions` | Missões diárias/semanais/mensais e progresso do utilizador. |
| `stats` | Estatísticas de jogo (horas, vitórias, K/D, etc.). |
| `events` | Eventos e torneios da guilda. |
| `guilds` | Guildas, membros, ranking e XP. |
| `friends` | Relações de amizade e status. |
| `notifications` | Notificações do sistema, lives, guilda, pedidos. |
| `access_links` | Links cifrados temporários para partilha de acesso a contas. |
| `highlights` | Clips analisados por IA (KDA, tags, timeline). |
| `live_rooms` | Salas de live (metadados + URL do provedor externo). |
| `chat_messages` | Mensagens de chat das lives e da guilda. |
| `coffee_gifts` | Presentes "café" convertidos em saldo. |

## Etapas de implementação

### 1. Fundação — Lovable Cloud e autenticação

- Ativar Lovable Cloud no projeto.
- Criar tabelas `profiles` e `user_roles` com RLS.
- Adicionar `attachSupabaseAuth` em `src/start.ts` para server functions protegidas.
- Criar `src/lib/auth.functions.ts`: registo, login, logout, recuperação de password.
- Migrar `HudProvider` para usar `profiles` do Supabase em vez de `localStorage`.
- Criar rota `_authenticated` para proteger painéis que exigem login.

### 2. Cartas, contratos e carteira

- Tabela `cards` com seed dos tiers atuais (Iron a Legendary).
- Tabela `orders` com regra de **uma carta ativa por vez** (validada por trigger/RLS).
- Tabela `contracts` com modos Friendly (gratuito) e GamerPRO (comissão do sistema).
- Tabela `wallet` + `wallet_transactions` para saldo, ganhos e café.
- Server functions para comprar, upgrade, cancelar carta e consultar contratos.
- Checkout mantido como mock (simula pagamento sem gateway real).

### 3. Painéis sociais e de progresso

- `guilds`, `guild_members`, `friends`.
- `missions` e `user_mission_progress`.
- `stats` com histórico para sparkline.
- `events` e `notifications`.
- Server functions para cada painel e atualização de perfil.

### 4. Acesso seguro e IA

- Tabela `access_links` com token cifrado, expiração e revogação.
- Integrar Lovable AI Gateway para:
  - Análise automática de highlights (`highlights` + insights).
  - Coaching LLM para tiers Iron a Gold.
- Criar `src/lib/ai.functions.ts` para chamadas server-side.

### 5. Lives e chat reais

- Chat persistente: `chat_messages` + Supabase Realtime.
- Lives: integrar com provedor externo de WebRTC (Daily.co, 100ms ou LiveKit) porque o Worker da Lovable Cloud não suporta media server nativo.
- Tabela `live_rooms` guarda metadados e URL da sala.
- `coffee_gifts` registam presentes e convertem em transações de wallet.

### 6. Seed, RLS e testes

- Seed de cartas, missões, eventos e guilda demo.
- Revisar todas as políticas RLS e grants (`GRANT` obrigatório por tabela).
- Migrar mocks de `src/data/os.ts` para queries reais.
- Testar autenticação, compra de carta única, chat em tempo real e criação de links de acesso.

## Riscos e dependências

- **Lives reais:** exigem serviço externo de streaming; o plano inclui integração, não infraestrutura própria.
- **IA LLM:** depende de créditos do Lovable AI Gateway; análise de highlights começa com texto/JSON, não processamento de vídeo direto.
- **Pagamentos:** mock nesta fase; transações reais ficam para fase posterior.

## Critérios de aceitação

- Utilizador consegue registar, fazer login e editar perfil.
- Só pode existir uma `order` ativa por utilizador; upgrade substitui a anterior.
- Dashboard carrega dados reais de todos os 16 painéis.
- Chat funciona em tempo real; live cria sala real no provedor externo.
- Links de acesso cifrados têm expiração e podem ser revogados.
- RLS impede leitura/escrita de dados de outros utilizadores (exceto admins).
