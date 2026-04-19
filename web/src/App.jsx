import React from "react";

const FEEDS = {
  full: "https://gabrielmalonso.github.io/fifa-world-cup-2026-calendar/output/world_cup_2026_fixtures_v2.ics",
  brazil: "https://gabrielmalonso.github.io/fifa-world-cup-2026-calendar/output/world_cup_2026_fixtures_brasil_v2.ics",
  noBrazil:
    "https://gabrielmalonso.github.io/fifa-world-cup-2026-calendar/output/world_cup_2026_fixtures_sem_brasil_v2.ics"
};

const WEBcal = {
  full: "webcal://gabrielmalonso.github.io/fifa-world-cup-2026-calendar/output/world_cup_2026_fixtures_v2.ics"
};

const quickFacts = [
  { label: "Fonte", value: "API oficial da FIFA" },
  { label: "Carga", value: "104 jogos" },
  { label: "Fuso", value: "Horário de Brasília" }
];

const singleFeedDetails = [
  "Todos os jogos em um único calendário.",
  "Títulos mais úteis no celular: times primeiro, depois o número do jogo.",
  "Jogos do Brasil já vêm com 🇧🇷 no título.",
  "Descrição limpa, sem entulho técnico."
];

const splitFeedDetails = [
  "O Google Agenda trata cor melhor por calendário do que por evento.",
  "Separar os jogos do Brasil evita brigar com uma limitação chata do Google.",
  "Você escolhe o verde no feed geral e o amarelo no feed do Brasil uma vez só."
];

function copyToClipboard(value) {
  return navigator.clipboard.writeText(value);
}

function FeedRow({ title, caption, url, tone = "neutral", actions = [] }) {
  return (
    <div className={`feed-row feed-row--${tone}`}>
      <div className="feed-row__meta">
        <p className="feed-row__title">{title}</p>
        <p className="feed-row__caption">{caption}</p>
      </div>
      <code className="feed-row__url">{url}</code>
      <div className="feed-row__actions">
        {actions.map((action) =>
          action.href ? (
            <a key={action.label} className={`button ${action.kind || "ghost"}`} href={action.href}>
              {action.label}
            </a>
          ) : (
            <button
              key={action.label}
              className={`button ${action.kind || "ghost"}`}
              type="button"
              onClick={action.onClick}
            >
              {action.label}
            </button>
          )
        )}
      </div>
    </div>
  );
}

function App() {
  const [feedback, setFeedback] = React.useState("");

  const handleCopy = React.useCallback(async (url) => {
    try {
      await copyToClipboard(url);
      setFeedback("URL copiada. Agora é só colar em “Adicionar calendário > Por URL”.");
    } catch {
      setFeedback("Falhou a cópia automática. Copie a URL manualmente.");
    }
  }, []);

  return (
    <div className="app-shell">
      <div className="page-grid">
        <header className="hero">
          <div className="hero__eyebrow">Central de assinatura</div>
          <h1>Menos poluição visual. Mais calendário funcionando.</h1>
          <p className="hero__copy">
            Aqui o objetivo é simples: te colocar dentro do calendário certo sem a interface
            parecer uma pilha de cards brigando por atenção.
          </p>

          <div className="fact-strip" aria-label="Resumo rápido">
            {quickFacts.map((fact) => (
              <div key={fact.label} className="fact-strip__item">
                <span>{fact.label}</span>
                <strong>{fact.value}</strong>
              </div>
            ))}
          </div>

          <div className="hero__samples">
            <div className="sample-line">
              <span className="sample-line__label">Título padrão</span>
              <strong>México x África do Sul - Jogo 1 - Copa do Mundo 2026</strong>
            </div>
            <div className="sample-line">
              <span className="sample-line__label">Título com Brasil</span>
              <strong>🇧🇷 Brasil x Marrocos - Jogo 7 - Copa do Mundo 2026</strong>
            </div>
          </div>
        </header>

        <main className="content">
          <section className="section" id="feed-unico">
            <div className="section__header">
              <div>
                <span className="section__kicker">Modo simples</span>
                <h2>Um feed só, sem teatro.</h2>
              </div>
              <p>
                Se você só quer assinar e seguir a vida, esse é o caminho. Um único link, todos
                os jogos, título reorganizado e descrição mais humana.
              </p>
            </div>

            <div className="section__columns">
              <div className="section__notes">
                {singleFeedDetails.map((item) => (
                  <div key={item} className="note-line">
                    {item}
                  </div>
                ))}
              </div>

              <div className="section__main">
                <FeedRow
                  title="Feed completo v2"
                  caption="Use este se você quer tudo em um calendário só."
                  url={FEEDS.full}
                  tone="ink"
                  actions={[
                    { label: "Copiar URL", kind: "dark", onClick: () => handleCopy(FEEDS.full) },
                    { label: "Abrir via webcal", kind: "ghost", href: WEBcal.full }
                  ]}
                />
              </div>
            </div>
          </section>

          <section className="section section--split" id="feeds-separados">
            <div className="section__header">
              <div>
                <span className="section__kicker">Modo tático</span>
                <h2>Dois feeds para controlar cor sem ilusão.</h2>
              </div>
              <p>
                O Google Agenda não colabora direito com cor por evento em feed assinado. Então a
                saída limpa é separar os jogos do Brasil em outro calendário.
              </p>
            </div>

            <div className="section__columns">
              <div className="section__notes">
                {splitFeedDetails.map((item) => (
                  <div key={item} className="note-line">
                    {item}
                  </div>
                ))}

                <div className="color-guide">
                  <div className="color-guide__item">
                    <span className="color-guide__swatch color-guide__swatch--green" />
                    <div>
                      <strong>Geral</strong>
                      <code>#009C3B</code>
                    </div>
                  </div>
                  <div className="color-guide__item">
                    <span className="color-guide__swatch color-guide__swatch--yellow" />
                    <div>
                      <strong>Brasil</strong>
                      <code>#FFDF00</code>
                    </div>
                  </div>
                </div>
              </div>

              <div className="section__main section__main--stack">
                <FeedRow
                  title="Feed geral sem jogos do Brasil"
                  caption="Bom para usar em verde e deixar o resto do torneio quieto."
                  url={FEEDS.noBrazil}
                  tone="green"
                  actions={[
                    {
                      label: "Copiar URL",
                      kind: "ghost",
                      onClick: () => handleCopy(FEEDS.noBrazil)
                    }
                  ]}
                />

                <FeedRow
                  title="Feed só com jogos do Brasil"
                  caption="Bom para usar em amarelo e deixar o Brasil mais visível."
                  url={FEEDS.brazil}
                  tone="yellow"
                  actions={[
                    {
                      label: "Copiar URL",
                      kind: "ghost",
                      onClick: () => handleCopy(FEEDS.brazil)
                    }
                  ]}
                />
              </div>
            </div>
          </section>

          <section className="section section--steps">
            <div className="section__header">
              <div>
                <span className="section__kicker">Passo a passo</span>
                <h2>Como assinar e pintar sem sofrer.</h2>
              </div>
              <p>
                O Google às vezes demora um pouco. Isso é birra dele, não defeito do feed.
              </p>
            </div>

            <div className="steps-list">
              <div className="step">
                <span className="step__number">01</span>
                <p>Abra o Google Agenda e vá em “Adicionar calendário &gt; Por URL”.</p>
              </div>
              <div className="step">
                <span className="step__number">02</span>
                <p>Cole o link do feed completo ou dos dois feeds separados.</p>
              </div>
              <div className="step">
                <span className="step__number">03</span>
                <p>Nos três pontinhos do calendário, escolha a cor ou use o seletor com hex.</p>
              </div>
              <div className="step">
                <span className="step__number">04</span>
                <p>Se o Google demorar, espere alguns minutos antes de declarar guerra.</p>
              </div>
            </div>

            {feedback ? <p className="feedback-banner">{feedback}</p> : null}
          </section>
        </main>
      </div>
    </div>
  );
}

export default App;
