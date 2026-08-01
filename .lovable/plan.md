# Solo Eleveng Evolution — HUD gamer (front-end)

Fase 1: só front-end, com dados fictícios (mock). Sem backend, sem pagamentos, sem lives.
Interface bilingue PT/EN com troca de idioma.

## Sobre o teu design Figma

Para eu seguir o teu design existente, escolhe uma das opções:

1. **Print/exportações** — cola imagens das telas aqui no chat (mais rápido, funciona já).
2. **Acesso ao vivo ao Figma** — precisa do app Lovable Desktop:
   instalar em https://lovable.dev/download, abrir o Figma Desktop, entrar em Dev Mode (Shift+D),
   ativar "Enable desktop MCP server" no painel de inspeção, e ligar em Settings -> Connectors -> Local MCP servers.
   Guia: https://docs.lovable.dev/integrations/desktop-app

Se ainda não enviares nada, construo com uma direção HUD gamer (fundo escuro, néon, bordas
luminosas animadas, tipografia técnica) e depois ajustamos ao Figma.

## O que fica pronto nesta fase

**Home / HUD**
- Banner central "tela gamer": mostra a carta selecionada em destaque com custo, medalhas,
  rank atual -> rank a atingir, tempo estimado e modo de suporte (rede de LLMs ou jogadores).
- Carrossel de cartas com bordas luminosas animadas, brilho ao passar o rato e reflexo de raridade.
- Botão **UPGRADE GAMER**: animação de invocação de carta mágica (partículas, virar carta,
  aterrar no centro do banner).
- Estado de carrinho: apenas **uma carta ativa por vez**. Se o gamer tentar escolher uma segunda,
  aparece um aviso de risco de ban por atividade suspeita, com a opção de **atualizar o pacote**
  (substituir a carta ativa) em vez de comprar duas.

**Modos**
- Alternador **Friendly** (contrato amigável entre amigos, gratuito) e **GamerPRO**
  (guilda, contrato com comissão do sistema, proteção de conta).
- Cada modo muda os textos do contrato, os selos e as cartas disponíveis.

**Cadastro e login**
- Ecrãs de registo e login com estilo HUD (só interface nesta fase, sem autenticação real).

**Perfil gamer**
- Bio editável com blocos de design (cor de destaque, moldura, título/tag, avatar).
- Medalhas, rank, histórico de percurso (timeline dos boosts) e galeria de vídeos das partidas.
- Painel de notificações.
- Secção de **acesso à conta por links cifrados**: gerar/revogar link, estado de privacidade
  (só interface e simulação nesta fase).

**Checkout (só ecrã)**
- Resumo do pacote, termos do modo escolhido e botão de pagamento desativado
  com nota "pagamentos na próxima fase".

**Placeholders para fases seguintes**
- Cartões "em breve" para lives, chat e presentes (café).

## Notas técnicas

- TanStack Start, rotas: `/` (HUD), `/auth`, `/perfil`, `/checkout`, `/carta/$cardId`.
- Tokens de design HUD em `src/styles.css` (oklch), sem cores hardcoded nos componentes.
- Animações com Motion (invocação da carta, brilho das bordas, carrossel).
- Dados de cartas, medalhas, ranks e vídeos em `src/data/*.ts` (mock), fáceis de trocar por backend.
- i18n leve: dicionário PT/EN em `src/lib/i18n.ts` + seletor de idioma no header, guardado no browser.
- Estado da carta ativa em contexto de cliente (regra de uma carta por vez centralizada).
- `head()` com título/descrição próprios por rota.

## Fases seguintes (fora desta entrega)

2. Lovable Cloud: contas reais, perfis, pedidos de boost, notificações, links cifrados.
3. Checkout de pagamentos e contratos de comissão do GamerPRO.
4. Lives, chat em tempo real e presentes "café" convertíveis.
