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
API oficial da FIFA -> normalização local -> arquivos em output/ + site em React/Vite -> GitHub Pages -> assinatura no Google Agenda
```

## Organização do projeto

Estrutura principal:

- `main.py`
  ponto de entrada para regenerar tudo
- `src/fifa_world_cup_2026_calendar/`
  lógica do pipeline, configuração, ingestão da API e exportação dos arquivos
- `web/`
  código-fonte da página pública em `React + Vite`
- `web/src/App.jsx`
  composição principal da interface do site
- `web/src/styles.css`
  estilos da página pública
- `scripts/publish-site.mjs`
  publica o build do Vite na raiz do repositório
- `package.json`
  scripts e dependências do frontend
- `vite.config.mjs`
  configuração do build do site
- `output/`
  artefatos gerados (`json`, `csv`, `ics`)
- `logs/`
  resumo da última execução
- `tests/`
  testes automatizados
- `index.html`
  artefato gerado do frontend, publicado no GitHub Pages
- `assets/`
  artefatos gerados do frontend publicados junto com a página
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
- `output/world_cup_2026_source_matches_raw.json`
  snapshot bruto da resposta de partidas da FIFA
- `output/world_cup_2026_source_stages_raw.json`
  snapshot bruto das fases da FIFA
- `output/world_cup_2026_diff_summary.json`
  diff estruturado entre a execução atual e a base anterior
- `output/world_cup_2026_diff_summary.txt`
  diff resumido e legível
- `logs/last_run_summary.json`
  resumo da última execução

## Publicação

O repositório usa GitHub Pages para servir:

- a página principal gerada a partir do frontend em `web/`
- os artefatos gerados na raiz (`index.html`, `assets/`, `favicon.png`)
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

## Fontes oficiais

Fontes que devem ser usadas neste projeto:

| Tipo | URL | Papel |
| --- | --- | --- |
| página oficial | `https://www.fifa.com/pt/tournaments/mens/worldcup/canadamexicousa2026/scores-fixtures` | referência humana da tabela |
| API oficial de partidas | `https://api.fifa.com/api/v3/calendar/matches?language=pt&count=500&idSeason=285023` | fonte principal de ingestão |
| API oficial de fases | `https://api.fifa.com/api/v3/stages?idSeason=285023&language=pt` | nomes de fase e apoio à normalização |
| artigo oficial em PT | `https://www.fifa.com/pt/tournaments/mens/worldcup/canadamexicousa2026/articles/copa-mundo-2026-tabela-jogos` | validação humana dos horários em Brasília |

Regra prática:

```text
API da FIFA = fonte de verdade para ingestão
artigo/PT = validação humana de horário
site scores-fixtures = conferência visual
```

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

## Como verificar e atualizar no futuro

Use este fluxo sempre que voltar para conferir se a FIFA mudou algum jogo, horário ou fase.

### Passo a passo

1. abrir a fonte oficial e conferir se a tabela pública continua no ar
2. consultar a API oficial de partidas e a API de fases
3. capturar novamente os dados brutos da FIFA
4. comparar os dados novos com `output/world_cup_2026_fixtures.json`
5. verificar o diff gerado
6. validar amostras sensíveis no artigo em português, principalmente horário de Brasília
7. só atualizar os artefatos publicados se houver mudança real

### Execução prática

Comando principal:

```bash
python3 main.py
```

Esse comando já faz tudo o que importa:

- busca a fonte oficial da FIFA
- grava snapshots brutos em `output/world_cup_2026_source_matches_raw.json` e `output/world_cup_2026_source_stages_raw.json`
- regenera `output/world_cup_2026_fixtures.json`
- regenera `CSV` e `ICS`
- compara com a base anterior
- grava o diff em `output/world_cup_2026_diff_summary.json` e `output/world_cup_2026_diff_summary.txt`
- atualiza `logs/last_run_summary.json`

### Como decidir se houve mudança de verdade

Olhar primeiro:

- `output/world_cup_2026_diff_summary.txt`
- `output/world_cup_2026_diff_summary.json`
- `output/world_cup_2026_fixtures.json`

Leitura prática:

| Situação | Ação |
| --- | --- |
| diff zerado | não inventar atualização |
| horários mudaram | validar no artigo/PT e publicar de novo |
| fases ou grupos mudaram | revisar títulos, descrição e diff |
| jogo novo/removido | tratar como mudança real e republicar |

### Regras para futuras atualizações

- Comparar sempre contra o `JSON` local existente antes de mexer no site.
- Não tratar cache do Google Agenda como se fosse mudança de fonte.
- Se a FIFA mudar algo, atualizar primeiro os artefatos locais e só depois publicar.
- Se os feeds assinados sofrerem com cache velho do Google, considerar URL nova de feed apenas quando necessário.
- Validar pelo menos uma amostra manual de horários em `America/Sao_Paulo` antes de concluir que está tudo certo.
- Se nada mudou, dizer claramente que nada mudou. Não fabricar trabalho.

## Fluxo do frontend

Desenvolvimento do site:

```bash
npm run dev
```

Build do site:

```bash
npm run site:build
```

Publicação do site na raiz:

```bash
npm run site:publish
```

Regra importante:

- o código-fonte do site vive em `web/`
- a raiz do repositório contém os artefatos gerados que o GitHub Pages serve
- se o frontend for alterado, o build precisa ser republicado para atualizar `index.html` e `assets/`

## Regras específicas deste projeto

- A fonte principal deve continuar sendo a API oficial da FIFA.
- O artigo em português da FIFA pode ser usado para validação de horário, não como fonte principal de ingestão.
- Horário final do calendário deve ser tratado em `America/Sao_Paulo`.
- Jogos do Brasil devem continuar destacados com `🇧🇷` no título.
- A descrição dos eventos deve permanecer enxuta e humana.
- O projeto deve evitar soluções pesadas sem necessidade.
- Se o Google Agenda cachear uma versão antiga, preferir criar URLs novas de feed antes de inventar explicações mágicas.
- A página pública deve continuar simples, direta e com baixa poluição visual.
- Mudanças no site devem ser feitas no source em `web/`, não editando manualmente o `index.html` gerado da raiz.

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
