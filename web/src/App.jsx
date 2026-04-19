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

function TabButton({ active, onClick, children }) {
  return (
    <button
      type="button"
      className={`tab-button ${active ? "tab-button--active" : ""}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

function App() {
  const [tab, setTab] = React.useState("single");

  return (
    <div className="app-shell">
      <div className="single-column">
        <header className="hero">
          <div className="hero__eyebrow">Calendário da Copa 2026</div>
          <h1>Siga os jogos no seu Google Agenda</h1>
          <p className="hero__copy">
            Assine os fechamentos oficiais via URL e receba alertas automáticos para cada jogo.
          </p>
        </header>

        <div className="card">
          <div className="tabs">
            <TabButton active={tab === "single"} onClick={() => setTab("single")}>
              Calendário com cor única
            </TabButton>
            <TabButton active={tab === "split"} onClick={() => setTab("split")}>
              Calendários com cores separadas
            </TabButton>
          </div>

          <div className={`tab-panel tab-panel--${tab}`}>
            {tab === "single" ? (
              <FeedRow
                title="Feed completo"
                caption="Todos os jogos em um único calendário."
                url={FEEDS.full}
                tone="ink"
                actions={[{ label: "webcal", href: WEBcal.full }]}
              />
            ) : (
              <div className="split-feeds">
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
                <div className="color-hint">
                  <strong>Cores recomendadas:</strong>
                  <span className="color-swatch color-swatch--green" />
                  <span><code>#009C3B</code></span>
                  <span className="color-swatch color-swatch--yellow" />
                  <span><code>#FFDF00</code></span>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="card">
          <h2>Como usar no Google Agenda</h2>
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
          <div className="steps-list-divider" />
          <h3>Como mudar a cor</h3>
          <div className="steps-list">
            <div className="step">
              <span className="step__number">1</span>
              <p>Passe o mouse sobre o calendário na barra lateral</p>
            </div>
            <div className="step">
              <span className="step__number">2</span>
              <p>Clique nos três pontinhos</p>
            </div>
            <div className="step">
              <span className="step__number">3</span>
              <p>Selecione a cor desejada</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;