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

function copyToClipboard(value) {
  return navigator.clipboard.writeText(value);
}

function FeedRow({ title, caption, url, tone = "neutral", actions = [] }) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = React.useCallback(async () => {
    try {
      await copyToClipboard(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // silent fail
    }
  }, [url]);

  return (
    <div className={`feed-row feed-row--${tone}`}>
      <div className="feed-row__meta">
        <p className="feed-row__title">{title}</p>
        <p className="feed-row__caption">{caption}</p>
      </div>
      <code className="feed-row__url">{url}</code>
      <div className="feed-row__actions">
        {copied ? (
          <button className="button button--copied" type="button" disabled>
            Copiado
          </button>
        ) : (
          <button className="button dark" type="button" onClick={handleCopy}>
            Copiar URL
          </button>
        )}
        {actions.map((action) =>
          action.href ? (
            <a key={action.label} className="button ghost" href={action.href}>
              {action.label}
            </a>
          ) : null
        )}
      </div>
    </div>
  );
}

function App() {
  return (
    <div className="app-shell">
      <div className="page-grid">
        <header className="hero">
          <div className="hero__eyebrow">Calendário da Copa 2026</div>
          <h1>Siga os jogos no seu Google Agenda</h1>
          <p className="hero__copy">
            Assine os fechamentos oficiais via URL e receba alertas automáticos para cada jogo.
          </p>
        </header>

        <main className="content">
          <section className="section" id="feed-unico">
            <div className="section__header">
              <div>
                <span className="section__kicker">Feed único</span>
                <h2>Todos os jogos</h2>
              </div>
              <p>Um calendário com os 104 jogos. Jogos do Brasil marcados com flag.</p>
            </div>

            <FeedRow
              title="Feed completo"
              caption="Todos os jogos em um único calendário."
              url={FEEDS.full}
              tone="ink"
              actions={[{ label: "webcal", href: WEBcal.full }]}
            />
          </section>

          <section className="section section--split" id="feeds-separados">
            <div className="section__header">
              <div>
                <span className="section__kicker">Feeds separados</span>
                <h2>Controle de cores</h2>
              </div>
              <p>Dois calendários: um geral e um só com Brasil. Aplique cores diferentes.</p>
            </div>

            <div className="split-rows">
              <FeedRow
                title="Geral"
                caption="Todos os jogos, exceto os do Brasil."
                url={FEEDS.noBrazil}
                tone="green"
              />

              <FeedRow
                title="Brasil"
                caption="Apenas jogos da seleção."
                url={FEEDS.brazil}
                tone="yellow"
              />
            </div>
          </section>

          <section className="section section--steps">
            <div className="section__header">
              <div>
                <span className="section__kicker">Como usar</span>
                <h2>Assinatura</h2>
              </div>
            </div>

            <div className="steps-list">
              <div className="step">
                <span className="step__number">1</span>
                <p>Abra o Google Agenda</p>
              </div>
              <div className="step">
                <span className="step__number">2</span>
                <p>Configurações → Adicionar calendários → Por URL</p>
              </div>
              <div className="step">
                <span className="step__number">3</span>
                <p>Cole a URL do feed</p>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

export default App;