const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const source = fs.readFileSync(require('node:path').join(__dirname, '../assets/dmg-analytics.v1.js'), 'utf8')
  .replace('G-83DQZCLF27', 'G-TEST123');

function page(url = 'https://damystrogamings.com/games/#capture-the-king', choice, preferencesOnly = false) {
  const handlers = {}, listeners = {}, scripts = [], storage = new Map();
  if (choice) storage.set('dmg.analytics-consent.v1', JSON.stringify({ choice, at: Date.now() }));
  const panel = { hidden: true, addEventListener: (type, fn) => handlers[type] = fn,
    querySelector: () => ({ focus() {} }) };
  const status = {}, settings = { addEventListener: (type, fn) => handlers.settings = fn, focus() {} };
  const document = {
    referrer: 'https://www.facebook.com/private/path?email=secret@example.com', cookie: '',
    body: { dataset: { analyticsPage: preferencesOnly ? 'preferences-only' : '' } },
    querySelector: selector => selector === '[data-analytics-consent]' ? panel : selector === '[data-analytics-status]' ? status : settings,
    createElement: () => ({}), head: { append: script => scripts.push(script) },
    addEventListener: (type, fn) => listeners[type] = fn
  };
  const window = { addEventListener: (type, fn) => listeners['window:' + type] = fn };
  const context = vm.createContext({ window, document, URL, location: new URL(url), Date,
    localStorage: { getItem: key => storage.get(key) || null, setItem: (key, value) => storage.set(key, value) } });
  vm.runInContext(source, context);
  const events = () => Array.from(window.dataLayer || []).filter(x => x[0] === 'event');
  const choose = choice => handlers.click({ target: { closest: () => ({ dataset: { consentChoice: choice } }) } });
  const click = (destination, options = {}) => {
    const urls = { google_play: 'https://play.google.com/store/apps/details?id=com.damystrogamings.capturetheking', apple_app_store: 'https://apps.apple.com/app/id6797637624', browser: 'https://capture-da-king.web.app/' };
    listeners[options.type || 'click']({ type: options.type || 'click', button: options.button || 0,
      target: { closest: () => ({ href: options.href || urls[destination], dataset: {
        analyticsGame: options.game || 'capture_da_king', analyticsDestination: destination, analyticsPlacement: 'games_detail'
      } }) } });
  };
  return { window, document, context, scripts, events, choose, click, panel, listeners, storage };
}

test('no Google script or event before consent, including CTA clicks', () => {
  const p = page(); p.click('google_play');
  assert.equal(p.scripts.length, 0); assert.equal(p.events().length, 0); assert.equal(p.panel.hidden, false);
});
test('reject persists without loading Google or replaying earlier clicks', () => {
  const p = page(); p.click('browser'); p.choose('denied'); p.choose('granted');
  assert.deepEqual(p.events().map(e => e[1]), ['page_view', 'game_landing']);
});
test('accept sends one page view and one deep-link landing; repeated acceptance is idempotent', () => {
  const p = page(); p.choose('granted'); p.choose('granted'); vm.runInContext(source, p.context);
  assert.equal(p.scripts.length, 1); assert.equal(p.events().length, 2);
});
test('each store and browser activation has the intended semantics', () => {
  const p = page(undefined, 'granted'); p.click('google_play'); p.click('apple_app_store'); p.click('browser');
  const events = p.events().slice(2);
  assert.deepEqual(events.map(e => e[1]), ['store_click', 'store_click', 'web_play']);
  assert.equal(events[0][2].store, 'google_play'); assert.equal(events[1][2].store, 'apple_app_store');
  assert.equal(events[2][2].game, 'capture_da_king'); assert.equal(events[2][2].store, undefined);
});
test('withdraw disables Google and prevents subsequent custom events; reaccept does not duplicate page events', () => {
  const p = page(undefined, 'granted'); p.choose('denied'); p.click('browser');
  assert.equal(p.window['ga-disable-G-TEST123'], true); assert.equal(p.events().length, 2);
  p.choose('granted'); p.click('browser'); assert.equal(p.events().length, 3);
});
test('approved campaign survives; arbitrary query, referrer path, and fragment never transmit', () => {
  const p = page('https://damystrogamings.com/games/?utm_source=fb&utm_medium=paid_social&utm_campaign=cdk_launch&utm_content=lion_30s&email=secret@example.com#capture-the-king', 'granted');
  const payload = JSON.stringify(p.window.dataLayer);
  assert.match(payload, /utm_campaign=cdk_launch/); assert.match(payload, /utm_content=lion_30s/);
  assert.doesNotMatch(payload, /secret|private\/path|#capture-the-king/);
});
test('unexpected campaigns and altered destinations are not transmitted', () => {
  const p = page('https://damystrogamings.com/games/?utm_content=secret@example.com', 'granted');
  p.click('browser', { href: 'https://capture-da-king.web.app/?email=secret@example.com' });
  assert.doesNotMatch(JSON.stringify(p.window.dataLayer), /secret/); assert.equal(p.events().length, 1);
});
test('other games, right clicks, ordinary games visits, and preference-only page are excluded', () => {
  const p = page('https://damystrogamings.com/games/', 'granted');
  p.click('browser', { game: 'da_conquer' }); p.click('browser', { type: 'auxclick', button: 2 });
  assert.equal(p.events().length, 1);
  const privacy = page('https://damystrogamings.com/privacy/', 'granted', true);
  assert.equal(privacy.scripts.length, 0);
});
test('middle click counts once and localhost debug is automatic', () => {
  const p = page('http://127.0.0.1:4173/games/#capture-the-king', 'granted');
  p.click('browser', { type: 'auxclick', button: 1 }); assert.equal(p.events().length, 3);
  assert.equal(p.window.dataLayer.find(e => e[0] === 'config')[2].debug_mode, true);
});
test('withdrawal in another tab stops collection', () => {
  const p = page(undefined, 'granted'); p.storage.set('dmg.analytics-consent.v1', JSON.stringify({ choice: 'denied', at: Date.now() }));
  p.listeners['window:storage']({ key: 'dmg.analytics-consent.v1' }); p.click('browser');
  assert.equal(p.events().length, 2); assert.equal(p.window['ga-disable-G-TEST123'], true);
});
