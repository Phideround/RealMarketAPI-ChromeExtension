'use strict';

const API_BASE  = 'https://api.realmarketapi.com/api/v1/price';
const ALARM_KEY = 'rma_refresh';

// ─── Badge text formatter ────────────────────────────────────────────────────
function formatBadge(price) {
  const n = parseFloat(price);
  if (isNaN(n)) return '';
  if (n >= 1_000) return String(Math.round(n));
  if (n < 10)     return n.toFixed(4);
  return n.toFixed(2);
}

// ─── Fetch & update badge ────────────────────────────────────────────────────
async function refreshBadge() {
  try {
    const data = await chrome.storage.local.get([
      'rma_apiKey', 'rma_badgeSymbol',
    ]);
    const apiKey = data.rma_apiKey     || '';
    const sym    = data.rma_badgeSymbol || '';

    if (!apiKey || !sym) {
      await chrome.action.setBadgeText({ text: '' });
      return;
    }

    const url = `${API_BASE}?apiKey=${encodeURIComponent(apiKey)}&symbolCode=${encodeURIComponent(sym)}&timeFrame=H1`;
    const res  = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();

    const text = formatBadge(json.closePrice);
    await chrome.action.setBadgeText({ text });
    await chrome.action.setBadgeBackgroundColor({ color: '#f59e0b' });
    try { await chrome.action.setBadgeTextColor({ color: '#000000' }); } catch (_) {}

  } catch (err) {
    console.warn('[RealMarketAPI background]', err.message);
    await chrome.action.setBadgeText({ text: '' });
  }
}

// ─── Alarm management ────────────────────────────────────────────────────────
async function resetAlarm() {
  await chrome.alarms.clearAll();
  const data  = await chrome.storage.local.get('rma_interval');
  const secs  = typeof data.rma_interval === 'number' ? data.rma_interval : 30;
  if (secs > 0) {
    // chrome.alarms minimum is ~30 s; clamp to at least 0.5 min
    const mins = Math.max(0.5, secs / 60);
    chrome.alarms.create(ALARM_KEY, { periodInMinutes: mins });
  }
}

// ─── Listeners ───────────────────────────────────────────────────────────────
chrome.alarms.onAlarm.addListener(alarm => {
  if (alarm.name === ALARM_KEY) refreshBadge();
});

chrome.storage.onChanged.addListener((changes, area) => {
  if (area !== 'local') return;
  const relevant = ['rma_apiKey', 'rma_badgeSymbol', 'rma_interval'];
  if (Object.keys(changes).some(k => relevant.includes(k))) {
    resetAlarm();
    refreshBadge();
  }
});

chrome.runtime.onInstalled.addListener(() => { resetAlarm(); refreshBadge(); });
chrome.runtime.onStartup.addListener(()   => { resetAlarm(); refreshBadge(); });
