# Solo Eleveng Evolution — Sistema Operacional Gamer

Transformar o app atual (que ainda parece landing page) num **Dashboard/HUD estilo SO gamer**: grid inteligente de 16 painéis vivos, cada painel clicável e expansível em tela cheia, sem banner comercial nem seções de marketing.

## O que muda na experiência

- A rota `/` deixa de ter hero/banner e passa a ser o **Centro de Comando**: grid assimétrico de painéis com tamanhos diferentes.
- Navegação por painéis: clicar num painel abre a versão em tela cheia (overlay com blur no fundo + animação HUD). Botões só para Comprar, Salvar, Excluir, Confirmar, Cancelar, Enviar.
- Hover em qualquer painel: glow, borda neon animada, escala 1.03, leve rotação 3D, partículas.
- Mobile: o mesmo grid vira feed vertical de widgets, mantendo animações e interatividade.

## Grid principal (ordem exata pedida)

```text
Linha 1 | IA Highlights (2x2, maior) | Lives | Minha Carta | Guilda
Linha 2 | Acessos | Contratos | Amigos | Missões
Linha 3 | Carteira | Estatísticas | Notificações | Eventos
Linha 4 | Replays | Marketplace | Perfil | Configurações
```

## Painéis (resumo + versão expandida)

| Painel | Widget | Tela cheia |
| --- | --- | --- |
| IA Highlights | preview de vídeo, jogo, mapa, data, KDA, tags MVP/Ace/Clutch/Triple Kill/Headshots | biblioteca completa, análise IA, timeline, download/compartilhar/editar |
| Lives | cards horizontais: avatar, badge LIVE, jogo, views, tempo, mini preview | player + chat + Enviar Café + curtir + compartilhar |
| Minha Carta | carta com flutuação e glow, XP, nível, medalhas, rank, tempo restante | carta em destaque animada, upgrade, histórico |
| Guilda | logo, nome, ranking, XP, membros online, prévia do chat | sala da guilda, eventos, membros, chat |
| Acessos | jogos ligados, estado, sessões, dispositivos, proteção, último login | gestor completo de sessões/links cifrados (reaproveita o painel de acesso seguro atual) |
| Contratos | lista, tempo, estado, jogador | detalhe do contrato + histórico |
| Amigos | avatares, online/offline, jogo, party, live | perfil do amigo |
| Missões | diárias/semanais/mensais, XP, recompensas | lista completa com progresso |
| Carteira | saldo, ganhos, café, histórico | extrato + fluxo de saque |
| Estatísticas | horas, vitórias, KD, MVP, precisão, heroes | gráficos e detalhamento |
| Notificações | pedidos, lives, guilda, sistema, mensagens | central completa |
| Eventos | próximos torneios/eventos da guilda | agenda |
| Replays | vídeos, clipes, downloads | biblioteca com filtros |
| Marketplace | cartas, itens, boosters, personalizações | vitrine + compra |
| Perfil | avatar, banner, bio, conquistas, medalhas, XP | perfil editável |
| Configurações | conta, privacidade, idioma, tema, segurança | painel de ajustes |

Conteúdo vem de dados mock tipados (mesmo padrão de `src/data/game.ts`) — visual e interação completos, sem backend nesta fase.

## Notas de conformidade

O painel Acessos é apresentado como gestão de sessões autorizadas pelo próprio jogador (links cifrados, revogação, dispositivos), com aviso de que o uso deve respeitar os termos de cada jogo. Nenhum texto incentiva automação proibida.

## Detalhes técnicos

- Stack fixa do projeto: **TanStack Start + React 19 + Tailwind v4 + shadcn + Motion**. Next.js não se aplica; Three.js/R3F fica de fora nesta fase — o efeito 3D das cartas e painéis é feito com `transform-3d`, `perspective`, parallax no mouse e glow em camadas (60fps, sem custo de WebGL). Se depois quiser modelo 3D real na carta, entra como fase separada.
- Novos arquivos:
  - `src/components/os/panel-shell.tsx` — casca comum: hover 3D, borda neon animada, partículas, `onExpand`.
  - `src/components/os/os-grid.tsx` — grid assimétrico responsivo (desktop 4 col / tablet 2 / mobile feed).
  - `src/components/os/panels/*.tsx` — os 16 widgets.
  - `src/components/os/panel-overlay.tsx` — overlay em tela cheia com blur, `AnimatePresence`, `Escape`/clique fora para fechar, foco acessível.
  - `src/data/os.ts` — mocks de highlights, lives, amigos, missões, carteira, stats, eventos, marketplace, replays, guilda.
- `src/routes/index.tsx` reescrito como dashboard (mantém `head()` próprio, sem hero). Rotas existentes (`/cartas`, `/modos`, `/checkout`, `/perfil`, `/notificacoes`, `/auth`) permanecem como destinos profundos; os painéis correspondentes abrem overlay e oferecem link para a rota completa.
- `src/styles.css` ganha tokens/utilitários: `--glow-blue`, névoa volumétrica, `os-panel`, `os-panel-hover`, `os-particles`, reflexo metálico.
- Header/bottom-nav ficam mínimos (logo, idioma, avatar) para não competir com o grid.
- Também corrijo um erro de hidratação atual: número de XP formatado por locale renderiza diferente no servidor e no cliente.

## Fora do escopo desta fase

Backend/Supabase, WebRTC real nas lives, PWA, Three.js/R3F, pagamentos reais.
