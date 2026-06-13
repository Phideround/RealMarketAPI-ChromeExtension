# 🚀 RealMarketAPI Chrome Extension  
### Live Market Data. Zero Noise. Built for Traders & Builders.

Turn your browser into a **real-time trading terminal** ⚡  
No tabs. No refresh. Just **live price action** — exactly when you need it.

👉 Chrome Store: [Here](https://chromewebstore.google.com/detail/realmarketapi-%E2%80%93-live-pric/jlpomehkpfebmfcklonaehdfbkcoaoaa)
---

## ✨ Why this exists

Most traders and developers deal with:
- ❌ Delayed data  
- ❌ Cluttered dashboards  
- ❌ Too many tabs open  

**RealMarketAPI Extension fixes that.**

It brings **instant, low-latency market data** directly into your browser — clean, fast, and always accessible.

---

## ⚡ Features

- 📡 **Real-time price streaming** (WebSocket powered)  
- 🟡 **XAUUSD (Gold)** tracking  
- 🟠 **BTCUSD (Bitcoin)** tracking  
- ⚡ **Ultra-low latency updates**  
- 🧠 **Minimal UI, zero distraction**  
- 🔌 Built on top of **RealMarketAPI infrastructure**

---

## 🖼️ What it feels like

- Open Chrome  
- Click the extension  
- Instantly see live price movement  

No loading. No friction.  
Just **pure price action**.

---

## 🛠️ Built for

- 📊 Algo traders  
- 🤖 Bot developers  
- 📈 Price action traders  
- 🧑‍💻 Developers working with trading APIs  

If you care about **speed + simplicity**, this is for you.

---

## 🔌 Powered by RealMarketAPI

This extension is backed by **RealMarketAPI**, designed for:

- ⚡ Low-latency market data  
- 🔄 WebSocket streaming  
- 📦 Clean developer-first APIs  

👉 Perfect for building:
- Trading bots  
- Signal systems  
- Custom dashboards  

---

## 🚀 Installation

### Option 1 — Chrome Web Store (Recommended)
Install directly from:  
👉 [Chrome Extensions](https://chromewebstore.google.com/detail/realmarketapi-%E2%80%93-live-pric/jlpomehkpfebmfcklonaehdfbkcoaoaa)

### Or from Website:
👉 [RealMarketAPI](https://realmarketapi.com/)
---

### Option 2 — Manual (Dev Mode)

1. Clone this repo:
```bash
git clone https://github.com/Phideround/RealMarketAPI-ChromeExtension.git
```
2. Open Chrome and go to:
```
chrome://extensions/
```
3. Enable Developer Mode
4. Click Load unpacked
5. Select the project folder

## ⚙️ Tech Stack
JavaScript

Chrome Extension APIs

WebSocket (real-time streaming)

RealMarketAPI backend

### 💡 Vision

This is just the beginning.

Planned:

📊 More assets (Forex, Crypto, Indices)
🔔 Alerts & notifications
📉 Mini charts
🧠 Custom watchlists

Goal:
👉 Turn this into a lightweight trading companion inside your browser

## 🤝 Contributing

Ideas, feedback, or improvements?
Open an issue or submit a PR — contributions are welcome.

## ⭐ Support

If you like this project:

⭐ Star the repo
🔗 Share it with traders/devs
🧠 Give feedback

## 🧠 Final Note

This isn’t just another price tracker.

It’s built for people who:

watch the market closely
build systems
and care about execution speed
# RealMarketAPI-ChromeExtension
An open-source Chrome extension powered by RealMarketAPI, providing live market prices for crypto, forex, and commodities. Perfect for developers building trading tools or users who want quick insights at a glance.

## New Q3/2026 Pro Tools (Popup)

- Create Alert: quickly creates an alert rule from the popup.
- Run Screener: runs a lightweight screener query and surfaces top match in status bar.
- Add Watchlist Item: adds a symbol to an existing watchlist by ID.

These actions call:
- `POST /api/v1/alerts`
- `POST /api/v1/screener/query`
- `POST /api/v1/watchlists/{watchlistId}/items`

## Notes

- The extension still supports the existing live price grid and toolbar badge flow.
- Pro Tools require a valid API key and plan access for each endpoint.

## Transport (Q3/2026)

- WebSocket-first live streaming per active symbol via `wss://api.realmarketapi.com/price`.
- Automatic reconnect with exponential backoff plus jitter.
- Automatic polling fallback when WebSocket stream is stale or disconnected.
- Status line in popup indicates current mode, including fallback state.

## Diagnostics (E3)

- Popup Settings includes a Connection Diagnostics section with persistent counters:
	- WS opens/closes/messages
	- reconnect attempts
	- fallback activations
	- polling calls/errors
- Use these counters to compare normal WebSocket sessions vs degraded network sessions and quantify API polling reduction.
- Counters can be reset from the popup to start a clean validation run.
