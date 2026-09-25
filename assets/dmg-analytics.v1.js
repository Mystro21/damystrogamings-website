/* DMG marketing analytics. Only explicitly marked Capture Da King links opt in. */
(() => {
  'use strict';
  if (window.dmgAnalyticsLoaded) return;
  window.dmgAnalyticsLoaded = true;
  const MEASUREMENT_ID = 'G-83DQZCLF27'; // DMG Marketing Website stream.
  const KEY = 'dmg.analytics-consent.v1';
  const MAX_AGE = 180 * 24 * 60 * 60 * 1000;
  const debug = ['localhost', '127.0.0.1'].includes(location.hostname);
  const hosts = ['damystrogamings.com', 'www.damystrogamings.com', 'localhost', '127.0.0.1'];
  const destinations = {
    google_play: 'https://play.google.com/store/apps/details?id=com.damystrogamings.capturetheking',
    apple_app_store: 'https://apps.apple.com/app/id6797637624',
    browser: 'https://capture-da-king.web.app/'
  };
  // Extend this vocabulary deliberately when approving a new campaign; never send arbitrary URL input.
  const campaignValues = {
    utm_source: ['fb', 'ig', 'an', 'msg', 'facebook', 'instagram'],
    utm_medium: ['paid_social'], utm_campaign: ['cdk_launch'], utm_content: ['lion_30s']
  };
  let allowed = false;
  let initialized = false;
  let pageSent = false;
  const consentRoot = document.querySelector('[data-analytics-consent]');
  const status = document.querySelector('[data-analytics-status]');
  const preferences = document.querySelector('[data-analytics-settings]');
  if (!consentRoot || !hosts.includes(location.hostname)) return;

  function safePage() {
    const result = new URL(location.pathname, location.origin);
    const incoming = new URL(location.href);
    for (const [key, values] of Object.entries(campaignValues)) {
      const value = incoming.searchParams.get(key);
      if (values.includes(value)) result.searchParams.set(key, value);
    }
    return result.href;
  }
  function safeReferrer() {
    try { return new URL(document.referrer).origin + '/'; } catch { return ''; }
  }
  function readChoice() {
    try {
      const value = JSON.parse(localStorage.getItem(KEY));
      return value && ['granted', 'denied'].includes(value.choice) &&
        Number.isFinite(value.at) && Date.now() - value.at >= 0 && Date.now() - value.at < MAX_AGE
        ? value.choice : null;
    } catch { return null; }
  }
  function saveChoice(choice) {
    try { localStorage.setItem(KEY, JSON.stringify({ choice, at: Date.now() })); } catch { /* Page-only choice. */ }
  }
  function gtag() { window.dataLayer.push(arguments); }
  function send(name, parameters) {
    if (!allowed || !initialized) return;
    gtag('event', name, { ...parameters, send_to: MEASUREMENT_ID, ...(debug ? { debug_mode: true } : {}) });
    if (debug) console.debug('[DMG analytics] ' + JSON.stringify({ event: name, ...parameters }));
  }
  function start() {
    if (document.body.dataset.analyticsPage === 'preferences-only') return;
    if (!/^G-[A-Z0-9]+$/.test(MEASUREMENT_ID)) return;
    window['ga-disable-' + MEASUREMENT_ID] = false;
    if (!initialized) {
      window.dataLayer = window.dataLayer || [];
      gtag('consent', 'default', {
        analytics_storage: 'denied', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied'
      });
      gtag('consent', 'update', { analytics_storage: 'granted' });
      gtag('js', new Date());
      gtag('config', MEASUREMENT_ID, {
        send_page_view: false,
        page_location: safePage(), page_referrer: safeReferrer(),
        allow_google_signals: false, allow_ad_personalization_signals: false,
        cookie_expires: MAX_AGE / 1000, cookie_update: false,
        ...(debug ? { debug_mode: true } : {})
      });
      const script = document.createElement('script');
      script.async = true;
      script.src = 'https://www.googletagmanager.com/gtag/js?id=' + MEASUREMENT_ID;
      document.head.append(script);
      initialized = true;
    } else {
      gtag('consent', 'update', { analytics_storage: 'granted' });
    }
    if (!pageSent) {
      pageSent = true;
      send('page_view', { page_location: safePage(), page_referrer: safeReferrer() });
      if (location.pathname === '/games/' && location.hash === '#capture-the-king') {
        send('game_landing', { game: 'capture_da_king', placement: 'games_detail' });
      }
    }
  }
  function clearAnalyticsCookies() {
    for (const cookie of document.cookie.split(';')) {
      const name = cookie.split('=')[0].trim();
      if (!/^_ga(?:_|$)/.test(name)) continue;
      for (const domain of ['', location.hostname, '.damystrogamings.com']) {
        document.cookie = name + '=; Max-Age=0; Path=/; SameSite=Lax' + (domain ? '; Domain=' + domain : '');
      }
    }
  }
  function applyChoice(choice, persist = true) {
    allowed = choice === 'granted';
    if (persist) saveChoice(choice);
    if (allowed) start();
    else {
      window['ga-disable-' + MEASUREMENT_ID] = true;
      if (initialized) gtag('consent', 'update', { analytics_storage: 'denied' });
      clearAnalyticsCookies();
    }
    status.textContent = allowed ? 'Optional analytics are allowed.' : 'Optional analytics are off.';
    consentRoot.hidden = true;
  }
  consentRoot.addEventListener('click', event => {
    const button = event.target.closest('[data-consent-choice]');
    if (!button) return;
    applyChoice(button.dataset.consentChoice);
    preferences.focus();
  });
  preferences.addEventListener('click', () => {
    consentRoot.hidden = false;
    consentRoot.querySelector('button').focus();
  });
  window.addEventListener('storage', event => {
    if (event.key !== KEY) return;
    const choice = readChoice();
    applyChoice(choice || 'denied', false);
    consentRoot.hidden = Boolean(choice);
  });
  // A single delegated handler: no pointerdown/touchstart double counting; navigation is never blocked.
  function trackLink(event) {
    if (event.type === 'auxclick' && event.button !== 1) return;
    const link = event.target.closest('a[data-analytics-game]');
    if (!link || link.dataset.analyticsGame !== 'capture_da_king') return;
    const store = link.dataset.analyticsDestination;
    if (link.href !== destinations[store]) return;
    const placement = link.dataset.analyticsPlacement;
    if (!['home_feature', 'games_detail'].includes(placement)) return;
    send(store === 'browser' ? 'web_play' : 'store_click', {
      game: 'capture_da_king', placement, link_url: destinations[store],
      ...(store === 'browser' ? {} : { store })
    });
  }
  document.addEventListener('click', trackLink);
  document.addEventListener('auxclick', trackLink);
  const choice = readChoice();
  if (choice) applyChoice(choice, false);
  else { status.textContent = 'Optional analytics are off until you accept.'; consentRoot.hidden = false; }
})();
