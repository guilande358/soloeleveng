# MVP funcional: carteira, lives, highlights, café e cartas de evolução

Objetivo: ligar os painéis do OS ao backend real para que o ambiente pareça um jogo completo e utilizável, deixando de fora (por agora) a execução do sistema de boosting em si.

Interpretação do pedido: o motor de boosting (jogadores/LLMs a subir a conta), os contratos e os acessos por link ficam como estão — visuais/simulados, sem lógica nova. Carteira, lives, highlights, café/presentes e cartas de evolução (catálogo + pedido + pagamento por saldo) passam a funcionar de ponta a ponta.

## 1. Painéis ligados ao backend

Substituir no registo de painéis (`panels.tsx`) os widgets mock pelos componentes reais já escritos:
- Carteira → saldo, ganhos, gastos, pendente, extrato real e pedido de saque.
- Lives → salas ao vivo reais, contagem de espectadores, chat em tempo real e botão de café.
- Highlights → passa a ler os highlights do utilizador na base de dados (título, jogo, mapa, KDA, tags, insights), com estado vazio elegante e ação para marcar público/privado.

Contratos, Acessos, Guilda, Missões, Amigos, Eventos, Replays, Marketplace mantêm-se como estão nesta fase (Acessos já é real; os restantes ficam demo).

## 2. Cartas de evolução funcionais

- `/cartas` e o painel "Minha carta" passam a ler o catálogo real de cartas em vez do ficheiro local.
- Escolher uma carta cria um pedido e leva ao `/checkout`, que mostra resumo (carta, modo Friendly/GamerPRO, comissão, total) e confirma o pagamento com saldo da carteira.
- Regra de uma carta ativa por utilizador validada no backend; se já existir carta ativa, o aviso de ban aparece e a única ação possível é atualizar o pacote.
- Após pagamento confirmado: carta ativa atualizada no perfil, movimento no extrato e notificação criada.
- Sem sessão, cada ação sensível mostra CTA para entrar em vez de falhar.

## 3. Café / presentes convertíveis

- Enviar café numa live debita o remetente e credita o streamer pela mesma função de saldo, aparecendo no extrato de ambos e contando para o total de cafés.
- Valores de café: pequenos presets (1 / 3 / 5), com validação de saldo no servidor.

## 4. Highlights e ambiente "jogo completo"

- Funções de leitura/criação de highlights ligadas à tabela existente; o painel mostra os do utilizador e os públicos dos amigos.
- Semear alguns highlights, lives e cafés de demonstração via migração, para que o dashboard nunca apareça vazio numa conta nova.
- Estatísticas e missões do topo do HUD passam a refletir os dados reais que já existem (horas, wins, KD, cafés) quando disponíveis.

## Notas técnicas

- Migração única: highlights/lives/coffee de demonstração (INSERT literais) e, se necessário, `highlights` e `live_rooms` na publicação de Realtime.
- Novas server functions em `src/lib/highlights.functions.ts` (protegidas) e leitura pública de highlights públicos via cliente publicável.
- Reutilizar `apply_wallet_delta` para todos os movimentos (compra, café, saque) — nunca cálculos de saldo no cliente.
- Sem Stripe/PayPal: pagamento por saldo interno + recarga simulada, mantendo o webhook assinado já existente.
- Design atual mantido; muda só a origem dos dados.
