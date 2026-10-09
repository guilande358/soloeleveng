# Registo na Riot: páginas públicas de verificação

A Riot pede um "URL do produto" válido e, na revisão, verifica Termos de Uso, Política de Privacidade e o aviso legal obrigatório da Riot. Vamos criar estas páginas públicas no site publicado.

## O que vai preencher no formulário da Riot
- Grupo de Produtos: Grupo Padrão
- URL do produto: https://soloeleveng.lovable.app
- Foco no jogo: League of Legends
- Torneios: Não
- Descrição: "HUB que importa partidas ranqueadas pela API oficial (Account-v1, Match-v5, League-v4) para mostrar progresso, XP e análises. Só lê dados públicos pelo Riot ID; não pede senhas."
- Links: /termos e /privacidade

## Páginas novas (PT/EN, estilo HUD)
1. /termos — Termos de Uso: regras do serviço, modos Friendly/GamerPRO, cartas, pagamentos, proibição de fraude e de partilha de senhas.
2. /privacidade — Política de Privacidade: dados recolhidos (conta, Riot ID, PUUID, estatísticas de partidas), finalidade, retenção, desvincular/apagar a conta Riot, contacto.
3. /sobre-riot — explicação da integração com a Riot e o aviso legal obrigatório ("Solo Eleveng isn't endorsed by Riot Games...").
4. Rodapé com links para as três páginas, com o aviso da Riot visível.

## Ajuste de conformidade (exigido pelas políticas que enviou)
- A integração fica só de leitura de estatísticas. O texto deixa claro que não oferecemos serviço de boost na conta Riot (proibido pelas políticas da Riot); para LoL, o sistema mostra apenas evolução, coaching e análises.
- O botão "Desvincular" apaga os dados Riot guardados.

## Depois de aprovar
1. Criar as páginas e o rodapé.
2. Publicar o site para os links ficarem acessíveis.
3. Pedir a chave RIOT_API_KEY num formulário seguro.

## Detalhes técnicos
- Rotas públicas novas: src/routes/termos.tsx, privacidade.tsx, sobre-riot.tsx, cada uma com head() própria.
- Componente de rodapé partilhado em __root.
- A integração Riot já criada (riot.functions.ts, painel em Estatísticas) mantém-se.
