'use strict';

// --- All 31 known RealMarketAPI symbols (realmarketapi.com/docs/getting-started#symbols) --
const SYM_META = {
  // Metals
  XAUUSD: { label: 'Gold / USD',           icon: 'Au', color: '#f59e0b', bg: '#78350f', cssVar: '#f59e0b' },
  XAGUSD: { label: 'Silver / USD',         icon: 'Ag', color: '#cbd5e1', bg: '#1e3a5f', cssVar: '#94a3b8' },
  // Forex
  EURUSD: { label: 'EUR / USD',            icon: '€',  color: '#4ade80', bg: '#14532d', cssVar: '#22c55e' },
  GBPUSD: { label: 'GBP / USD',            icon: '£',  color: '#67e8f9', bg: '#164e63', cssVar: '#06b6d4' },
  USDJPY: { label: 'USD / JPY',            icon: '¥',  color: '#fca5a5', bg: '#450a0a', cssVar: '#f87171' },
  GBPJPY: { label: 'GBP / JPY',            icon: '£¥', color: '#fb923c', bg: '#431407', cssVar: '#f97316' },
  USDVND: { label: 'USD / VND',            icon: '₫',  color: '#fde68a', bg: '#713f12', cssVar: '#fbbf24' },
  AUDUSD: { label: 'AUD / USD',            icon: 'A$', color: '#86efac', bg: '#14532d', cssVar: '#4ade80' },
  USDCAD: { label: 'USD / CAD',            icon: 'C$', color: '#fca5a5', bg: '#7f1d1d', cssVar: '#f87171' },
  NZDUSD: { label: 'NZD / USD',            icon: 'NZ', color: '#7dd3fc', bg: '#0c4a6e', cssVar: '#38bdf8' },
  // Crypto
  BTCUSD: { label: 'Bitcoin / USD',        icon: '₿',  color: '#fb923c', bg: '#7c2d12', cssVar: '#f97316' },
  ETHUSD: { label: 'Ethereum / USD',       icon: 'Ξ',  color: '#a5b4fc', bg: '#1e1b4b', cssVar: '#818cf8' },
  XRPUSD: { label: 'XRP / USD',            icon: 'XR', color: '#67e8f9', bg: '#164e63', cssVar: '#22d3ee' },
  BNBUSD: { label: 'Binance Coin / USD',   icon: 'BN', color: '#fde68a', bg: '#78350f', cssVar: '#fbbf24' },
  // Commodities
  USOIL:  { label: 'US Crude Oil (WTI)',   icon: 'CL', color: '#fbbf24', bg: '#44220a', cssVar: '#f59e0b' },
  UKOIL:  { label: 'Brent Crude Oil',      icon: 'BR', color: '#fb923c', bg: '#431407', cssVar: '#f97316' },
  XNGUSD: { label: 'Natural Gas / USD',    icon: 'NG', color: '#6ee7b7', bg: '#064e3b', cssVar: '#34d399' },
  XPTUSD: { label: 'Platinum / USD',       icon: 'Pt', color: '#e2e8f0', bg: '#1e293b', cssVar: '#cbd5e1' },
  XCUUSD: { label: 'Copper / USD',         icon: 'Cu', color: '#fb923c', bg: '#7c2d12', cssVar: '#f97316' },
  // Indices
  US500:  { label: 'S&P 500',              icon: 'SP', color: '#4ade80', bg: '#14532d', cssVar: '#22c55e' },
  US30:   { label: 'Dow Jones 30',         icon: 'DJ', color: '#67e8f9', bg: '#164e63', cssVar: '#06b6d4' },
  UK100:  { label: 'FTSE 100',             icon: 'UK', color: '#fca5a5', bg: '#7f1d1d', cssVar: '#f87171' },
  // Stocks
  AAPL:   { label: 'Apple Inc.',           icon: 'AP', color: '#f1f5f9', bg: '#1e293b', cssVar: '#94a3b8' },
  TSLA:   { label: 'Tesla Inc.',           icon: 'TS', color: '#f87171', bg: '#450a0a', cssVar: '#ef4444' },
  NFLX:   { label: 'Netflix Inc.',         icon: 'NF', color: '#ef4444', bg: '#450a0a', cssVar: '#dc2626' },
  MSFT:   { label: 'Microsoft Corp.',      icon: 'MS', color: '#60a5fa', bg: '#1e3a5f', cssVar: '#3b82f6' },
  AMZN:   { label: 'Amazon.com Inc.',      icon: 'AZ', color: '#fb923c', bg: '#431407', cssVar: '#f97316' },
  AMD:    { label: 'AMD Inc.',             icon: 'AM', color: '#f87171', bg: '#7f1d1d', cssVar: '#ef4444' },
  NVDA:   { label: 'NVIDIA Corp.',         icon: 'NV', color: '#86efac', bg: '#14532d', cssVar: '#4ade80' },
  GOOGL:  { label: 'Alphabet (Google)',    icon: 'GO', color: '#60a5fa', bg: '#1e3a5f', cssVar: '#3b82f6' },
  META:   { label: 'Meta Platforms',       icon: 'ME', color: '#818cf8', bg: '#1e1b4b', cssVar: '#6366f1' },
};

const DEFAULT_SYMBOLS = ['XAUUSD', 'BTCUSD'];

function getSymMeta(code) {
  return SYM_META[code.toUpperCase()] || {
    label:  code.toUpperCase(),
    icon:   code.slice(0, 2).toUpperCase(),
    color:  '#60a5fa',
    bg:     '#1e3a5f',
    cssVar: '#3b82f6',
  };
}

// --- App state ----------------------------------------------------------------
let settings = {
  apiKey:      '',
  interval:    30,
  symbols:     [...DEFAULT_SYMBOLS],
  badgeSymbol: DEFAULT_SYMBOLS[0],
};
let refreshTimer = null;
let cntTimer     = null;
let cntValue     = 0;
let currentFetchController = null;
let wsHealthTimer = null;
const wsConnections = new Map();
const wsReconnectAttempts = new Map();
const latestPrices = {};
const WS_BASE_DELAY_MS = 1500;
const WS_MAX_DELAY_MS = 30000;
let wsLastMessageAt = 0;
let fallbackPolling = false;
let metricsPersistTimer = null;

const transportMetrics = {
  mode: 'idle',
  wsOpens: 0,
  wsCloses: 0,
  wsMessages: 0,
  wsReconnects: 0,
  fallbackActivations: 0,
  pollingCalls: 0,
  pollingErrors: 0,
};

// --- DOM refs -----------------------------------------------------------------
const regBanner     = document.getElementById('regBanner');
const settingsPanel = document.getElementById('settingsPanel');
const settingsBtn   = document.getElementById('settingsBtn');
const apiKeyInput   = document.getElementById('apiKeyInput');
const intervalSel   = document.getElementById('intervalSelect');
const badgeSel      = document.getElementById('badgeSymbolSelect');
const symTagsEl     = document.getElementById('symTags');
const newSymInput   = document.getElementById('newSymInput');
const addSymBtn     = document.getElementById('addSymBtn');
const saveBtn       = document.getElementById('saveBtn');
const priceGrid     = document.getElementById('priceGrid');
const statusDot     = document.getElementById('statusDot');
const statusText    = document.getElementById('statusText');
const refreshBtn    = document.getElementById('refreshBtn');
const alertSymbolInput = document.getElementById('alertSymbolInput');
const alertThresholdInput = document.getElementById('alertThresholdInput');
const createAlertBtn = document.getElementById('createAlertBtn');
const screenerTrendInput = document.getElementById('screenerTrendInput');
const runScreenerBtn = document.getElementById('runScreenerBtn');
const watchlistIdInput = document.getElementById('watchlistIdInput');
const watchlistSymbolInput = document.getElementById('watchlistSymbolInput');
const addWatchlistBtn = document.getElementById('addWatchlistBtn');
const diagModeEl = document.getElementById('diagMode');
const diagWsOpensEl = document.getElementById('diagWsOpens');
const diagWsClosesEl = document.getElementById('diagWsCloses');
const diagWsMessagesEl = document.getElementById('diagWsMessages');
const diagReconnectsEl = document.getElementById('diagReconnects');
const diagFallbacksEl = document.getElementById('diagFallbacks');
const diagPollCallsEl = document.getElementById('diagPollCalls');
const diagPollErrorsEl = document.getElementById('diagPollErrors');
const diagResetBtn = document.getElementById('diagResetBtn');

function setTransportMode(mode) {
  transportMetrics.mode = mode;
  schedulePersistMetrics();
  updateDiagnosticsPanel();
}

function bumpMetric(name, value = 1) {
  transportMetrics[name] = (transportMetrics[name] || 0) + value;
  schedulePersistMetrics();
  updateDiagnosticsPanel();
}

function schedulePersistMetrics() {
  if (metricsPersistTimer) clearTimeout(metricsPersistTimer);
  metricsPersistTimer = setTimeout(() => {
    chrome.storage.local.set({ rma_transportMetrics: transportMetrics });
  }, 300);
}

function updateDiagnosticsPanel() {
  if (!diagModeEl) return;

  const modeLabel = transportMetrics.mode === 'ws'
    ? 'WebSocket'
    : transportMetrics.mode === 'polling'
    ? 'Polling Fallback'
    : 'Idle';

  diagModeEl.textContent = modeLabel;
  if (diagWsOpensEl) diagWsOpensEl.textContent = String(transportMetrics.wsOpens);
  if (diagWsClosesEl) diagWsClosesEl.textContent = String(transportMetrics.wsCloses);
  if (diagWsMessagesEl) diagWsMessagesEl.textContent = String(transportMetrics.wsMessages);
  if (diagReconnectsEl) diagReconnectsEl.textContent = String(transportMetrics.wsReconnects);
  if (diagFallbacksEl) diagFallbacksEl.textContent = String(transportMetrics.fallbackActivations);
  if (diagPollCallsEl) diagPollCallsEl.textContent = String(transportMetrics.pollingCalls);
  if (diagPollErrorsEl) diagPollErrorsEl.textContent = String(transportMetrics.pollingErrors);
}

// --- Build price grid ---------------------------------------------------------
function buildGrid() {
  priceGrid.innerHTML = '';
  settings.symbols.forEach(code => {
    const meta = getSymMeta(code);
    const card = document.createElement('div');
    card.className = 'price-card';
    card.id = `card-${code}`;
    card.style.setProperty('--card-color', meta.cssVar);
    const isBadge = code === settings.badgeSymbol;
    card.innerHTML = `
      <div class="card-top">
        <div class="symbol-badge">
          <div class="sym-icon" style="background:${meta.bg};color:${meta.color}">${meta.icon}</div>
          <span class="sym-code">${code}</span>
          ${isBadge ? '<span class="badge-pin" title="Shown on toolbar">📌</span>' : ''}
        </div>
      </div>
      <div class="price-val" id="price-${code}"><div class="skeleton"></div></div>
      <div class="price-label">${meta.label}</div>
      <div class="ohlcv" id="ohlcv-${code}">
        <div class="ohlcv-row"><span class="ohlcv-lbl">Bid</span><span class="ohlcv-val" id="bid-${code}">—</span></div>
        <div class="ohlcv-row"><span class="ohlcv-lbl">Ask</span><span class="ohlcv-val" id="ask-${code}">—</span></div>
        <div class="ohlcv-row"><span class="ohlcv-lbl">Open</span><span class="ohlcv-val" id="open-${code}">—</span></div>
        <div class="ohlcv-row"><span class="ohlcv-lbl">High</span><span class="ohlcv-val" id="high-${code}">—</span></div>
        <div class="ohlcv-row"><span class="ohlcv-lbl">Low</span><span class="ohlcv-val" id="low-${code}">—</span></div>
        <div class="ohlcv-row"><span class="ohlcv-lbl">Vol</span><span class="ohlcv-val" id="vol-${code}">—</span></div>
      </div>
    `;
    priceGrid.appendChild(card);
  });
}

// --- Render symbol tags in settings ------------------------------------------
function renderSymbolTags() {
  symTagsEl.innerHTML = '';
  settings.symbols.forEach(code => {
    const tag = document.createElement('div');
    tag.className = 'sym-tag';
    tag.innerHTML = `
      <span>${code}</span>
      ${settings.symbols.length > 1
        ? `<button class="sym-tag-remove" data-code="${code}" title="Remove ${code}" aria-label="Remove ${code}">&#x2715;</button>`
        : ''}
    `;
    symTagsEl.appendChild(tag);
  });
}

// --- Populate badge symbol dropdown ------------------------------------------
function populateBadgeSelect() {
  const current = settings.badgeSymbol;
  badgeSel.innerHTML = '<option value="">None (disabled)</option>';
  settings.symbols.forEach(code => {
    const opt = document.createElement('option');
    opt.value = code;
    opt.textContent = `${code} — ${getSymMeta(code).label}`;
    badgeSel.appendChild(opt);
  });
  badgeSel.value = settings.symbols.includes(current) ? current : (settings.symbols[0] || '');
}

// --- Add / remove symbol ------------------------------------------------------
function addSymbol(raw) {
  const code = raw.toUpperCase().trim().replace(/[^A-Z0-9]/g, '');
  if (!code || settings.symbols.includes(code)) return;
  settings.symbols.push(code);
  buildGrid();
  renderSymbolTags();
  populateBadgeSelect();
  if (settings.apiKey) restartTransport();
}

function removeSymbol(code) {
  if (settings.symbols.length <= 1) return; // always keep at least 1
  settings.symbols = settings.symbols.filter(s => s !== code);
  if (settings.badgeSymbol === code) {
    settings.badgeSymbol = settings.symbols[0] || '';
  }
  buildGrid();
  renderSymbolTags();
  populateBadgeSelect();
  if (!settings.badgeSymbol) chrome.action.setBadgeText({ text: '' });
  if (settings.apiKey) restartTransport();
}

// --- Symbol tag click delegation ---------------------------------------------
symTagsEl.addEventListener('click', e => {
  const btn = e.target.closest('.sym-tag-remove');
  if (btn) removeSymbol(btn.dataset.code);
});

addSymBtn.addEventListener('click', () => {
  addSymbol(newSymInput.value);
  newSymInput.value = '';
  newSymInput.focus();
});

newSymInput.addEventListener('keydown', e => {
  if (e.key === 'Enter') {
    addSymbol(newSymInput.value);
    newSymInput.value = '';
    return;
  }
  // Force uppercase display as user types (defer so the new char is in value)
  setTimeout(() => { e.target.value = e.target.value.toUpperCase(); }, 0);
});

newSymInput.addEventListener('input', e => {
  e.target.value = e.target.value.toUpperCase();
});

// --- Format price for display -------------------------------------------------
function formatPrice(value, code) {
  if (value == null || isNaN(parseFloat(value))) return '—';
  const n = parseFloat(value);
  if (n < 10) {
    return n.toFixed(4); // forex: 1.0831
  }
  return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// --- Format badge text (max ~4 chars) ----------------------------------------
function formatBadge(price) {
  const n = parseFloat(price);
  if (isNaN(n)) return '';
  if (n >= 1_000) return String(Math.round(n));    // "4675"   (4 chars, fits badge)
  if (n < 10)     return n.toFixed(4);              // "1.0831"
  return n.toFixed(2);                              // "70.45"
}

function getWsPriceUrl(apiKey, code) {
  return `wss://api.realmarketapi.com/price?apiKey=${encodeURIComponent(apiKey)}&symbolCode=${encodeURIComponent(code)}&timeFrame=H1`;
}

function updateSymbolCard(code, data) {
  const el = document.getElementById(`price-${code}`);
  if (!el) return;

  el.textContent = formatPrice(data.closePrice, code);
  latestPrices[code] = data.closePrice;

  const set = (id, value) => {
    const field = document.getElementById(id);
    if (field) field.textContent = value;
  };

  set(`bid-${code}`, formatPrice(data.bid, code));
  set(`ask-${code}`, formatPrice(data.ask, code));
  set(`open-${code}`, formatPrice(data.openPrice, code));
  set(`high-${code}`, formatPrice(data.highPrice, code));
  set(`low-${code}`, formatPrice(data.lowPrice, code));
  set(`vol-${code}`, data.volume != null ? Number(data.volume).toLocaleString('en-US', { maximumFractionDigits: 0 }) : '—');
}

function markSymbolUnavailable(code) {
  const el = document.getElementById(`price-${code}`);
  if (el) el.textContent = '—';
}

// --- Update chrome toolbar badge ---------------------------------------------
function updateBadge(priceMap) {
  if (!settings.badgeSymbol) {
    chrome.action.setBadgeText({ text: '' });
    return;
  }
  const price = priceMap[settings.badgeSymbol];
  if (price != null) {
    chrome.action.setBadgeText({ text: formatBadge(price) });
    chrome.action.setBadgeBackgroundColor({ color: '#f59e0b' });
    try { chrome.action.setBadgeTextColor({ color: '#000000' }); } catch (_) {}
  }
}

// --- Fetch a single symbol ----------------------------------------------------
async function fetchSymbol(apiKey, code, signal) {
  const url = `https://api.realmarketapi.com/api/v1/price?apiKey=${encodeURIComponent(apiKey)}&symbolCode=${encodeURIComponent(code)}&timeFrame=H1`;
  const res = await fetch(url, { signal });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message || `HTTP ${res.status}`);
  }
  return res.json();
}

// --- Fetch all active symbols -------------------------------------------------
async function fetchAllPrices() {
  if (!settings.apiKey) {
    regBanner.classList.remove('hidden');
    setStatus('idle', 'No API key set');
    return;
  }

  setStatus('loading', 'Fetching…');
  bumpMetric('pollingCalls');

  // Cancel stale refresh calls so slower previous responses cannot overwrite newer data.
  if (currentFetchController) {
    currentFetchController.abort();
  }
  currentFetchController = new AbortController();
  const { signal } = currentFetchController;

  // Snapshot the symbol list before the await so index alignment is stable
  // even if the user adds/removes symbols while the requests are in flight.
  const symbolSnapshot = [...settings.symbols];

  const results = await Promise.allSettled(
    symbolSnapshot.map(code => fetchSymbol(settings.apiKey, code, signal))
  );

  const priceMap = {};
  let errorCount = 0;

  results.forEach((result, i) => {
    const code = symbolSnapshot[i];
    const el = document.getElementById(`price-${code}`);
    if (!el) return; // card was removed while fetch was in flight
    if (result.status === 'fulfilled') {
      updateSymbolCard(code, result.value);
      priceMap[code] = result.value.closePrice;
    } else {
      markSymbolUnavailable(code);
      // Ignore expected cancellation errors from a newer refresh.
      if (result.reason?.name !== 'AbortError') {
        errorCount++;
        console.warn(`[RealMarketAPI] ${code}:`, result.reason?.message);
      }
    }
  });

  // Another refresh started while this one was in flight; ignore stale completion.
  if (signal.aborted) return;

  currentFetchController = null;

  updateBadge(priceMap);

  const now = new Date().toLocaleTimeString('en-US', {
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  });
  if (errorCount === symbolSnapshot.length) {
    bumpMetric('pollingErrors');
    setStatus('error', `Error — ${now}`);
  } else {
    setStatus('live', fallbackPolling ? `Polling fallback — ${now}` : `Updated ${now}`);
    resetCountdown();
  }
}

// --- Status helper ------------------------------------------------------------
function setStatus(state, text) {
  statusDot.className = 'status-dot';
  if (state === 'loading') statusDot.classList.add('loading');
  else if (state === 'error') statusDot.classList.add('error');
  statusText.textContent = text || '';
}

function toUpperOrEmpty(value) {
  return (value || '').trim().toUpperCase();
}

async function apiPost(path, payload) {
  if (!settings.apiKey) throw new Error('API key required');
  const url = `https://api.realmarketapi.com${path}?apiKey=${encodeURIComponent(settings.apiKey)}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message || `HTTP ${res.status}`);
  }
  return res.json();
}

async function createAlertFromPopup() {
  const symbolCode = toUpperOrEmpty(alertSymbolInput?.value);
  const threshold = Number(alertThresholdInput?.value || 0);
  if (!symbolCode || threshold <= 0) {
    setStatus('error', 'Alert: symbol and threshold required');
    return;
  }

  try {
    setStatus('loading', 'Creating alert…');
    await apiPost('/api/v1/alerts', {
      symbolCode,
      timeFrame: 'H1',
      ruleType: 'PriceCrossAbove',
      threshold,
      cooldownSeconds: 300,
      channels: ['Extension'],
    });
    setStatus('live', `Alert created for ${symbolCode}`);
    if (alertThresholdInput) alertThresholdInput.value = '';
  } catch (err) {
    setStatus('error', `Alert failed: ${err.message}`);
  }
}

async function runScreenerFromPopup() {
  const trend = (screenerTrendInput?.value || '').trim() || 'Bullish';
  try {
    setStatus('loading', 'Running screener…');
    const data = await apiPost('/api/v1/screener/query', {
      timeFrame: 'H1',
      trend,
      size: 5,
      sortField: 'SignalScore',
      sortDirection: 'Desc',
    });

    const top = Array.isArray(data?.data) ? data.data[0] : null;
    if (top?.symbolCode) {
      setStatus('live', `Top: ${top.symbolCode} (${top.signalScore ?? '-'})`);
    } else {
      setStatus('live', 'Screener done: no matches');
    }
  } catch (err) {
    setStatus('error', `Screener failed: ${err.message}`);
  }
}

async function addWatchlistItemFromPopup() {
  const watchlistId = (watchlistIdInput?.value || '').trim();
  const symbolCode = toUpperOrEmpty(watchlistSymbolInput?.value);
  if (!watchlistId || !symbolCode) {
    setStatus('error', 'Watchlist: id and symbol required');
    return;
  }

  try {
    setStatus('loading', 'Adding watchlist item…');
    await apiPost(`/api/v1/watchlists/${encodeURIComponent(watchlistId)}/items`, {
      symbolCode,
      order: 0,
    });
    setStatus('live', `Added ${symbolCode} to watchlist`);
    if (watchlistSymbolInput) watchlistSymbolInput.value = '';
  } catch (err) {
    setStatus('error', `Watchlist failed: ${err.message}`);
  }
}

// --- Countdown to next refresh -----------------------------------------------
function resetCountdown() {
  if (cntTimer) clearInterval(cntTimer);
  if (settings.interval <= 0) return;
  cntValue = settings.interval;
  cntTimer = setInterval(() => {
    cntValue--;
    if (statusDot.classList.contains('loading') || statusDot.classList.contains('error')) return;
    const base = statusText.textContent.split(' — ')[0];
    statusText.textContent = base + (cntValue > 0 ? ` — ${cntValue}s` : '');
    if (cntValue <= 0) clearInterval(cntTimer);
  }, 1000);
}

// --- Polling fallback ---------------------------------------------------------
function stopPollingFallback() {
  if (refreshTimer) clearInterval(refreshTimer);
  refreshTimer = null;
  fallbackPolling = false;
  if (transportMetrics.mode === 'polling') setTransportMode('idle');
}

function startPollingFallback(reason) {
  if (!settings.apiKey) return;

  const wasFallback = fallbackPolling;
  fallbackPolling = true;
  setTransportMode('polling');
  if (!wasFallback) bumpMetric('fallbackActivations');
  if (refreshTimer) clearInterval(refreshTimer);

  if (settings.interval > 0) {
    refreshTimer = setInterval(fetchAllPrices, settings.interval * 1000);
  }

  const message = reason ? `WS reconnecting, polling fallback (${reason})` : 'WS reconnecting, polling fallback';
  setStatus('loading', message);
  fetchAllPrices();
}

// --- WebSocket-first transport -----------------------------------------------
function stopWsHealthWatchdog() {
  if (wsHealthTimer) clearInterval(wsHealthTimer);
  wsHealthTimer = null;
}

function startWsHealthWatchdog() {
  stopWsHealthWatchdog();
  wsHealthTimer = setInterval(() => {
    if (!settings.apiKey) return;

    const now = Date.now();
    const staleThresholdMs = Math.max(12000, settings.interval * 2500);
    const stale = wsLastMessageAt > 0 && now - wsLastMessageAt > staleThresholdMs;
    const noSocket = wsConnections.size === 0;

    if (noSocket || stale) {
      startPollingFallback(noSocket ? 'no-socket' : 'stale-stream');
    }
  }, 5000);
}

function stopWebSocketMode() {
  const sockets = Array.from(wsConnections.values());
  wsConnections.clear();

  sockets.forEach(socket => {
    try { socket.close(); } catch (_) {}
  });
  wsReconnectAttempts.clear();
  stopWsHealthWatchdog();
}

function scheduleWsReconnect(code) {
  bumpMetric('wsReconnects');
  const currentAttempt = wsReconnectAttempts.get(code) || 0;
  const nextAttempt = currentAttempt + 1;
  wsReconnectAttempts.set(code, nextAttempt);

  const expDelay = Math.min(WS_MAX_DELAY_MS, WS_BASE_DELAY_MS * (2 ** (nextAttempt - 1)));
  const jitter = Math.floor(Math.random() * Math.max(1, Math.floor(expDelay * 0.3)));
  const delay = Math.min(WS_MAX_DELAY_MS, expDelay + jitter);

  setTimeout(() => {
    if (!settings.apiKey) return;
    if (!settings.symbols.includes(code)) return;
    if (wsConnections.has(code)) return;
    connectWebSocketForSymbol(code);
  }, delay);
}

function connectWebSocketForSymbol(code) {
  if (!settings.apiKey || !settings.symbols.includes(code)) return;

  try {
    const ws = new WebSocket(getWsPriceUrl(settings.apiKey, code));
    wsConnections.set(code, ws);

    ws.addEventListener('open', () => {
      bumpMetric('wsOpens');
      setTransportMode('ws');
      wsReconnectAttempts.set(code, 0);
      setStatus('live', 'Live stream (WebSocket)');
      stopPollingFallback();
    });

    ws.addEventListener('message', event => {
      try {
        const payload = JSON.parse(event.data);
        updateSymbolCard(code, payload);
        wsLastMessageAt = Date.now();
        bumpMetric('wsMessages');
        updateBadge(latestPrices);

        const now = new Date().toLocaleTimeString('en-US', {
          hour: '2-digit', minute: '2-digit', second: '2-digit',
        });
        setStatus('live', `Streaming (WS) — ${now}`);
      } catch (err) {
        console.warn('[RealMarketAPI] WS parse error:', err?.message || err);
      }
    });

    ws.addEventListener('error', () => {
      setStatus('error', `WS error on ${code}, reconnecting`);
    });

    ws.addEventListener('close', () => {
      if (wsConnections.get(code) !== ws) return;
      bumpMetric('wsCloses');
      wsConnections.delete(code);
      startPollingFallback(`ws-close:${code}`);
      scheduleWsReconnect(code);
    });
  } catch (err) {
    console.warn(`[RealMarketAPI] WS connect failed for ${code}:`, err?.message || err);
    startPollingFallback(`ws-connect:${code}`);
    scheduleWsReconnect(code);
  }
}

function startWebSocketMode() {
  stopWebSocketMode();
  stopPollingFallback();

  wsLastMessageAt = 0;
  setTransportMode('ws');
  settings.symbols.forEach(code => connectWebSocketForSymbol(code));
  startWsHealthWatchdog();
}

function restartTransport() {
  if (!settings.apiKey) {
    stopWebSocketMode();
    stopPollingFallback();
    return;
  }

  // Fast snapshot first, then stream updates.
  fetchAllPrices();
  startWebSocketMode();
}

// --- Storage ------------------------------------------------------------------
function loadSettings() {
  return new Promise(resolve => {
    chrome.storage.local.get(
      ['rma_apiKey', 'rma_interval', 'rma_symbols', 'rma_badgeSymbol', 'rma_transportMetrics'],
      data => {
        settings.apiKey      = data.rma_apiKey || '';
        settings.interval    = typeof data.rma_interval === 'number' ? data.rma_interval : 30;
        settings.symbols     = Array.isArray(data.rma_symbols) && data.rma_symbols.length
                                 ? data.rma_symbols
                                 : [...DEFAULT_SYMBOLS];
        settings.badgeSymbol = typeof data.rma_badgeSymbol === 'string'
                                 ? data.rma_badgeSymbol
                                 : settings.symbols[0];

        const savedMetrics = data.rma_transportMetrics;
        if (savedMetrics && typeof savedMetrics === 'object') {
          Object.assign(transportMetrics, savedMetrics);
        }

        updateDiagnosticsPanel();
        resolve();
      }
    );
  });
}

// --- Toggle settings panel ----------------------------------------------------
settingsBtn.addEventListener('click', () => {
  const isOpen = !settingsPanel.classList.contains('hidden');
  if (isOpen) {
    settingsPanel.classList.add('hidden');
    settingsBtn.classList.remove('active');
  } else {
    settingsPanel.classList.remove('hidden');
    settingsBtn.classList.add('active');
    apiKeyInput.value = settings.apiKey;
    intervalSel.value = String(settings.interval);
    renderSymbolTags();
    populateBadgeSelect();
  }
});

// --- Save settings ------------------------------------------------------------
saveBtn.addEventListener('click', () => {
  const key         = apiKeyInput.value.trim();
  const interval    = parseInt(intervalSel.value, 10);
  const badgeSymbol = badgeSel.value;

  settings.apiKey      = key;
  settings.interval    = interval;
  settings.badgeSymbol = badgeSymbol;

  chrome.storage.local.set({
    rma_apiKey:      key,
    rma_interval:    interval,
    rma_badgeSymbol: badgeSymbol,
    rma_symbols:     settings.symbols,
  }, () => {
    const originalHTML = saveBtn.innerHTML;
    saveBtn.classList.add('saved');
    saveBtn.innerHTML = `
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"
           stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="20 6 9 17 4 12"/>
      </svg>
      Saved!`;
    setTimeout(() => {
      saveBtn.classList.remove('saved');
      saveBtn.innerHTML = originalHTML;
    }, 1500);

    if (key) regBanner.classList.add('hidden');
    buildGrid(); // re-render cards to update badge-pin indicators
    restartTransport();
  });
});

apiKeyInput.addEventListener('keydown', e => { if (e.key === 'Enter') saveBtn.click(); });

if (diagResetBtn) {
  diagResetBtn.addEventListener('click', () => {
    Object.assign(transportMetrics, {
      mode: settings.apiKey ? 'idle' : 'idle',
      wsOpens: 0,
      wsCloses: 0,
      wsMessages: 0,
      wsReconnects: 0,
      fallbackActivations: 0,
      pollingCalls: 0,
      pollingErrors: 0,
    });
    updateDiagnosticsPanel();
    chrome.storage.local.set({ rma_transportMetrics: transportMetrics });
    setStatus('live', 'Diagnostics counters reset');
  });
}

// --- Refresh button -----------------------------------------------------------
refreshBtn.addEventListener('click', () => {
  if (cntTimer) clearInterval(cntTimer);
  if (fallbackPolling) startPollingFallback('manual-refresh');
  fetchAllPrices();
});

if (createAlertBtn) createAlertBtn.addEventListener('click', createAlertFromPopup);
if (runScreenerBtn) runScreenerBtn.addEventListener('click', runScreenerFromPopup);
if (addWatchlistBtn) addWatchlistBtn.addEventListener('click', addWatchlistItemFromPopup);

// --- Init ---------------------------------------------------------------------
async function init() {
  await loadSettings();
  buildGrid();

  if (!settings.apiKey) {
    regBanner.classList.remove('hidden');
    settingsPanel.classList.remove('hidden');
    settingsBtn.classList.add('active');
    apiKeyInput.value = '';
    renderSymbolTags();
    populateBadgeSelect();
    setTransportMode('idle');
    setStatus('idle', 'Enter your API key to start');
  } else {
    restartTransport();
  }
}

init();
