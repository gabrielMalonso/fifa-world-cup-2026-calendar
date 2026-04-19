# Descoberta da fonte oficial

## Resumo

A página `scores-fixtures` da FIFA não entrega os jogos no HTML inicial. Ela sobe um app React e depois faz chamadas de rede para APIs oficiais da própria FIFA.

## Evidência prática

1. `curl` da página HTML mostra um shell de app com `div#root` e referências a `cxm-api.fifa.com`.
2. Inspeção da rede da página mostra as chamadas:
   - `https://cxm-api.fifa.com/fifaplusweb/api/pages/en/tournaments/mens/worldcup/canadamexicousa2026/scores-fixtures`
   - `https://cxm-api.fifa.com/fifaplusweb/api/sections/competitionpage/matches?locale=en`
   - `https://api.fifa.com/api/v3/calendar/matches?language=en&count=500&idSeason=285023`
   - `https://api.fifa.com/api/v3/stages?idSeason=285023&language=en`
3. O endpoint `api/v3/calendar/matches` retorna uma estrutura JSON com `Results` e atualmente `104` partidas.

## Decisão

Fonte principal escolhida:

- `api/v3/calendar/matches?language=pt&count=500&idSeason=285023`

Motivo:

- é oficial;
- é estruturada;
- é a mesma família de endpoint usada pela página pública;
- é reproduzível sem browser para a etapa diária de atualização.

## Checagem de sanidade dos horários

O artigo oficial em português não virou fonte principal, mas foi útil para validar a conversão de horário:

- página humana:
  `https://www.fifa.com/pt/tournaments/mens/worldcup/canadamexicousa2026/articles/copa-mundo-2026-tabela-jogos`
- endpoint do conteúdo do artigo:
  `https://cxm-api.fifa.com/fifaplusweb/api/sections/article/S9YG2JmeGYaMUCBbm0CcD?locale=pt`

Conclusão:

- os horários de Brasília publicados no artigo batem com a conversão do campo `Date` em UTC;
- então seguimos usando a API estruturada para ingestão;
- e tratamos o artigo como contraprova oficial dos horários em BRT.

## Fallback que ficou de reserva

Se essa API sumir no futuro, o fallback honesto é:

1. revalidar a rede da página pública;
2. usar artigo oficial da FIFA;
3. usar PDF oficial da tabela, se a FIFA publicar um.

Se chegar nesse ponto, não tem glamour: é plano B mesmo.
