const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID?.trim();

function hasAnalytics() {
  return Boolean(GA_MEASUREMENT_ID);
}

function ensureDataLayer() {
  window.dataLayer = window.dataLayer || [];
}

function gtag(...args) {
  ensureDataLayer();
  window.dataLayer.push(args);
}

export function initAnalytics() {
  if (!hasAnalytics() || typeof window === "undefined" || document.getElementById("ga4-script")) {
    return;
  }

  const script = document.createElement("script");
  script.id = "ga4-script";
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
  document.head.appendChild(script);

  ensureDataLayer();
  gtag("js", new Date());
  gtag("config", GA_MEASUREMENT_ID, {
    anonymize_ip: true,
    send_page_view: false,
    page_title: document.title,
    page_location: window.location.href,
    page_path: window.location.pathname
  });
}

export function trackPageView(path = window.location.pathname) {
  if (!hasAnalytics() || typeof window === "undefined") {
    return;
  }

  gtag("event", "page_view", {
    page_title: document.title,
    page_location: window.location.href,
    page_path: path
  });
}

export function trackEvent(name, params = {}) {
  if (!hasAnalytics() || typeof window === "undefined") {
    return;
  }

  gtag("event", name, params);
}

export function analyticsEnabled() {
  return hasAnalytics();
}
