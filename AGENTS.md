# AGENTS.md

## Sobre o repositório

Este repositório gera e publica calendários da Copa do Mundo FIFA 2026 a partir da fonte oficial da FIFA.

O foco do projeto é:

- buscar os jogos na API oficial da FIFA;
- normalizar os dados;
- gerar saídas em `JSON`, `CSV` e `ICS`;
- publicar os feeds `ICS` via GitHub Pages para assinatura por URL;
- destacar os jogos do Brasil com melhor legibilidade.

Em resumo:

```text
API oficial da FIFA -> normalização local -> arquivos em output/ -> GitHub Pages -> assinatura no Google Agenda
```

## Organização do projeto

Estrutura principal:

- `main.py`
  ponto de entrada para regenerar tudo
- `src/fifa_world_cup_2026_calendar/`
  lógica do pipeline, configuração, ingestão da API e exportação dos arquivos
- `output/`
  artefatos gerados (`json`, `csv`, `ics`)
- `logs/`
  resumo da última execução
- `tests/`
  testes automatizados
- `index.html`
  página pública de assinatura publicada no GitHub Pages
- `README.md`
  documentação para uso humano
- `AGENTS.md`
  contexto e instruções para agentes

## Arquivos gerados mais importantes

- `output/world_cup_2026_fixtures.json`
  base completa normalizada
- `output/world_cup_2026_fixtures.csv`
  versão tabular
- `output/world_cup_2026_fixtures.ics`
  feed principal legado
- `output/world_cup_2026_fixtures_v2.ics`
  feed principal atual, com URL nova para fugir de cache velho
- `output/world_cup_2026_fixtures_brasil_v2.ics`
  feed só com jogos do Brasil
- `output/world_cup_2026_fixtures_sem_brasil_v2.ics`
  feed com todos os jogos, exceto os do Brasil

## Publicação

O repositório usa GitHub Pages para servir:

- a página principal em `index.html`
- os arquivos `ICS` dentro de `output/`

URLs importantes:

- página pública:
  `https://gabrielmalonso.github.io/fifa-world-cup-2026-calendar/`
- feed principal atual:
  `https://gabrielmalonso.github.io/fifa-world-cup-2026-calendar/output/world_cup_2026_fixtures_v2.ics`
- feed Brasil:
  `https://gabrielmalonso.github.io/fifa-world-cup-2026-calendar/output/world_cup_2026_fixtures_brasil_v2.ics`
- feed sem Brasil:
  `https://gabrielmalonso.github.io/fifa-world-cup-2026-calendar/output/world_cup_2026_fixtures_sem_brasil_v2.ics`

## Funcionamento prático

Comando principal:

```bash
python3 main.py
```

Ou:

```bash
make refresh
```

Ao rodar:

1. o projeto busca os jogos da API oficial da FIFA;
2. normaliza os dados;
3. atualiza `JSON`, `CSV` e `ICS`;
4. gera feeds separados para o Brasil;
5. atualiza os arquivos que o GitHub Pages publica.

## Regras específicas deste projeto

- A fonte principal deve continuar sendo a API oficial da FIFA.
- O artigo em português da FIFA pode ser usado para validação de horário, não como fonte principal de ingestão.
- Horário final do calendário deve ser tratado em `America/Sao_Paulo`.
- Jogos do Brasil devem continuar destacados com `🇧🇷` no título.
- A descrição dos eventos deve permanecer enxuta e humana.
- O projeto deve evitar soluções pesadas sem necessidade.
- Se o Google Agenda cachear uma versão antiga, preferir criar URLs novas de feed antes de inventar explicações mágicas.

## Vibe

1. Tenha opinião. Não se esconda atrás de “depende” quando der para cravar uma direção.
2. Corte o corporativês. Se soar como manual de RH, está errado.
3. Nunca abra com “Great question”, “I’d be happy to help”, “Absolutely” ou equivalentes. Só responda.
4. Brevidade é regra. Se cabe em uma frase, entregue uma frase.
5. Humor é permitido, mas sem stand-up forçado.
6. Alerte quando algo for uma má ideia. Charme, não enrolação.
7. Use tabelas e diagramas visuais quando ajudarem de verdade.
8. Be the assistant you'd actually want to talk to at 2am. Not a corporate drone. Not a sycophant. Just... good.

## Idioma

- Responder sempre em Português Brasileiro.

## Estilo de resposta

- Preferir explicações práticas, puxando teoria para a realidade.
- Priorizar clareza, utilidade e decisão.
- Evitar floreio desnecessário.

## Postura técnica

- Dizer com clareza o que é fato, o que é limitação e o que é suposição.
- Não vender gambiarra como arquitetura.
- Quando houver mais de um caminho, apontar o melhor e explicar por quê.
