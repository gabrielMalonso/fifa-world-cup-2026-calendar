# Copa do Mundo FIFA 2026 -> JSON, CSV e ICS

Pipeline local, reproduzível e sem firula para puxar os jogos oficiais da FIFA 2026 e regenerar a agenda quando você quiser.

## O que este projeto faz

| Saída | Arquivo | Uso prático |
| --- | --- | --- |
| JSON | `output/world_cup_2026_fixtures.json` | Base auditável e completa |
| CSV | `output/world_cup_2026_fixtures.csv` | Planilha, filtros, conferência rápida |
| ICS | `output/world_cup_2026_fixtures.ics` | Feed completo |
| ICS | `output/world_cup_2026_fixtures_sem_brasil.ics` | Feed para usar em verde |
| ICS | `output/world_cup_2026_fixtures_brasil.ics` | Feed dos jogos do Brasil para usar em amarelo |
| Diff | `output/world_cup_2026_diff_summary.txt` | Ver o que mudou entre execuções |

## Fonte oficial usada

A fonte principal é a API oficial da FIFA descoberta a partir da própria página de fixtures:

- Página humana: `https://www.fifa.com/pt/tournaments/mens/worldcup/canadamexicousa2026/scores-fixtures`
- Endpoint oficial usado para os jogos:
  `https://api.fifa.com/api/v3/calendar/matches?language=pt&count=500&idSeason=285023`
- Endpoint oficial usado para metadados de fases:
  `https://api.fifa.com/api/v3/stages?idSeason=285023&language=pt`

O payload atual traz `104` partidas, o número completo esperado para a edição de 2026.

## Validação prática dos horários em Brasília

Mantivemos a API como fonte principal, mas conferimos a conta dos horários usando o artigo oficial em português:

- Artigo de conferência:
  `https://www.fifa.com/pt/tournaments/mens/worldcup/canadamexicousa2026/articles/copa-mundo-2026-tabela-jogos`

Veredito:

- a conversão feita a partir de `Date` em UTC bate com os horários de Brasília mostrados no artigo;
- então a regra correta continua sendo:
  usar `Date` como horário canônico -> converter para `America/Sao_Paulo`.

Exemplo real:

| Jogo | Fonte estruturada | BRT calculado | Artigo em PT |
| --- | --- | --- | --- |
| México x África do Sul | `2026-06-11T19:00:00Z` | `16h00` | `16h00 em Brasília` |
| República da Coreia x República Tcheca | `2026-06-12T02:00:00Z` | `23h00 de 11/06` | `23h00 em Brasília` |

Isso confirma que a conta está certa. O campo `LocalDate` da API continua suspeito, então ele fica preservado como referência, mas não manda em nada.

## Como a fonte foi descoberta

```text
scores-fixtures (HTML quase vazio)
        |
        v
bundle React + chamadas de rede da página
        |
        v
api.fifa.com/api/v3/calendar/matches?idSeason=285023
        |
        v
normalização -> JSON / CSV / ICS / diff
```

Na prática:

1. O HTML inicial da página não traz os jogos.
2. A página carrega um app React e aponta para `cxm-api.fifa.com`.
3. Inspecionando a rede da página, aparece a chamada real para `api.fifa.com/api/v3/calendar/matches`.
4. Esse endpoint virou a fonte principal, porque é oficial, estruturado e reproduzível.

## Como rodar

### Opção direta

```bash
python3 main.py
```

### Opção curta

```bash
make refresh
```

## Estrutura

```text
.
├── main.py
├── Makefile
├── README.md
├── docs/
├── logs/
├── output/
├── src/
│   └── fifa_world_cup_2026_calendar/
└── tests/
```

## Regras práticas da modelagem

| Campo | Estratégia adotada |
| --- | --- |
| `stable_id` | Usa o número oficial do jogo quando existe, ex.: `fifa-wc2026-match-001` |
| `source_match_id` | Mantém o `IdMatch` bruto da FIFA |
| `kickoff_utc` | Usa `Date` como fonte canônica |
| `kickoff_brt` | Converte para `America/Sao_Paulo` |
| `DTEND` | Assume `3 horas` por jogo quando a FIFA não informa término |
| `source_hash` | SHA-256 do match bruto para auditar mudanças |

## Observação importante sobre horário

A API da FIFA retorna dois campos:

- `Date`: UTC consistente
- `LocalDate`: horário local da sede, mas com sufixo `Z`

Isso é estranho. Então o pipeline faz o certo:

1. confia em `Date` como horário oficial canônico;
2. preserva o bruto em `kickoff_source_raw`;
3. converte o UTC para `America/Sao_Paulo`.

Se você ignorar isso e confiar cegamente em `LocalDate`, vai fabricar horário torto. Não faça essa arte.

## Sobre o ICS

Cada partida vira um `VEVENT` com:

- `UID` estável por jogo
- `SUMMARY` no formato `Copa do Mundo 2026 - Jogo N - Time A x Time B`
- jogos do Brasil destacados com `🇧🇷` no título
- `DTSTART` e `DTEND` em `America/Sao_Paulo`
- `LOCATION` com estádio, cidade e país
- `DESCRIPTION` mais limpa, focada em fase, horário de Brasília, local e fonte oficial

## Cores no Google Agenda

Aqui entra uma pegadinha chata do mundo real:

- no Google Agenda assinado por URL, cor costuma funcionar melhor por calendário do que por evento;
- então, para ter `verde geral + amarelo no Brasil`, o projeto gera feeds separados.

Estratégia prática:

| Feed | Uso sugerido |
| --- | --- |
| `world_cup_2026_fixtures_sem_brasil.ics` | assinar e pintar de verde, como `manjericão` |
| `world_cup_2026_fixtures_brasil.ics` | assinar e pintar de amarelo |
| `world_cup_2026_fixtures.ics` | feed completo tradicional, se você preferir um calendário só |

## Limitação importante

Importar um arquivo `ICS` no Google Calendar **não sincroniza mudanças automaticamente**.

Traduzindo para o mundo real:

- importar uma vez funciona;
- atualizar a agenda depois exige importar de novo;
- se você quer atualização automática, precisa publicar um ICS por URL ou escrever sincronização direta com a API do Google Calendar.

## Próximos passos recomendados

| Cenário | Melhor caminho |
| --- | --- |
| Quero um link assinável | Publicar o `ICS` em uma URL estável |
| Quero sync real com meu calendário | Criar sincronização via Google Calendar API ou Google Apps Script |
| Quero auditar mudanças | Usar o diff gerado em `output/world_cup_2026_diff_summary.txt` |

## Testes

```bash
python3 -m unittest discover -s tests -v
```

## Arquivos auxiliares gerados

Além dos três arquivos principais, o projeto também salva:

- `output/world_cup_2026_source_matches_raw.json`
- `output/world_cup_2026_source_stages_raw.json`
- `logs/last_run_summary.json`

Isso deixa o processo auditável e facilita evoluir depois para Google Apps Script sem precisar recomeçar do zero.
