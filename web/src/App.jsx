import React from "react";
import { trackEvent, trackPageView } from "./analytics";

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

function FeedRow({ title, caption, url, tone = "neutral", actions = [], analyticsLabel }) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = React.useCallback(async () => {
    try {
      await copyToClipboard(url);
      trackEvent("copy_feed_url", {
        feed_name: analyticsLabel,
        feed_url: url
      });
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // silent fail
    }
  }, [analyticsLabel, url]);

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
            <a
              key={action.label}
              className="button ghost"
              href={action.href}
              download={action.download}
              onClick={() => {
                if (action.eventName) {
                  trackEvent(action.eventName, {
                    feed_name: analyticsLabel,
                    feed_url: action.href
                  });
                }
              }}
            >
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
  const fullDownloadName = "world-cup-2026-fixtures.ics";
  const panelRef = React.useRef(null);
  const [panelHeight, setPanelHeight] = React.useState("auto");
  const [panelReady, setPanelReady] = React.useState(false);

  const syncPanelHeight = React.useCallback(() => {
    if (!panelRef.current) {
      return;
    }

    setPanelHeight(`${panelRef.current.scrollHeight + 8}px`);
  }, []);

  React.useLayoutEffect(() => {
    if (!panelRef.current) {
      return;
    }

    syncPanelHeight();
    setPanelReady(true);
  }, [syncPanelHeight, tab]);

  React.useEffect(() => {
    trackPageView();
  }, []);

  React.useEffect(() => {
    if (!panelRef.current || typeof ResizeObserver === "undefined") {
      return undefined;
    }

    const observer = new ResizeObserver(() => {
      syncPanelHeight();
    });

    observer.observe(panelRef.current);

    return () => observer.disconnect();
  }, [syncPanelHeight, tab]);

  React.useEffect(() => {
    trackEvent(tab === "single" ? "view_single_feed_tab" : "view_split_feeds_tab", {
      active_tab: tab
    });
  }, [tab]);

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

          <div
            className={`tab-panel-shell ${panelReady ? "tab-panel-shell--ready" : ""}`}
            style={{ height: panelHeight }}
          >
            <div key={tab} ref={panelRef} className={`tab-panel tab-panel--${tab}`}>
              {tab === "single" ? (
                <FeedRow
                title="Feed completo"
                caption="Todos os jogos em um único calendário."
                url={FEEDS.full}
                tone="ink"
                analyticsLabel="feed_completo"
                actions={[
                    {
                      label: "Baixar ICS",
                      href: FEEDS.full,
                      download: fullDownloadName,
                      eventName: "download_full_ics"
                    },
                    { label: "webcal", href: WEBcal.full, eventName: "open_webcal" }
                  ]}
                />
              ) : (
                <div className="split-feeds">
                  <FeedRow
                    title="Geral"
                    caption="Todos os jogos, exceto os do Brasil."
                    url={FEEDS.noBrazil}
                    tone="green"
                    analyticsLabel="feed_sem_brasil"
                  />
                  <FeedRow
                    title="Brasil"
                    caption="Apenas jogos da seleção."
                    url={FEEDS.brazil}
                    tone="yellow"
                    analyticsLabel="feed_brasil"
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

        <section className="seo-block" aria-labelledby="seo-heading">
          <h2 id="seo-heading">Calendário da Copa do Mundo 2026 para Google Agenda</h2>
          <p>
            Esta página reúne um calendário da Copa do Mundo 2026 em formato ICS para quem quer
            acompanhar todos os jogos no Google Agenda, assinar por URL ou baixar o arquivo para
            uso manual.
          </p>
          <p>
            Se a sua busca é por <strong>calendário da Copa 2026</strong>, <strong>agenda da Copa
            do Mundo 2026</strong>, <strong>ICS da Copa 2026</strong> ou <strong>jogos do Brasil no
            Google Agenda</strong>, é exatamente isso que está publicado aqui, com atualização a
            partir da fonte oficial da FIFA e horários ajustados para Brasília.
          </p>
          <p>
            O feed completo serve para quem quer um calendário único. Os feeds separados servem
            para quem quer destacar os jogos do Brasil com outra cor sem fazer malabarismo no
            Google Agenda.
          </p>
        </section>
      </div>
    </div>
  );
}

export default App;
