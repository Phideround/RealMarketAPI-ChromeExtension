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
