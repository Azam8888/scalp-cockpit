# Scalp Cockpit v1.1 — Solana (Birdeye + GMGN)

Dark neon HUD for fast Solana scalp signals.

## Live data sources
- **Birdeye (default)** — `/api/birdeye` proxies to Birdeye `/defi/token_trending` with your API key.
- **GMGN (optional)** — `/api/gmgn` proxies to `GMGN_URL` you provide.

## Setup on Vercel
1. Create project from this repo.
2. Add **Environment Variables** (Project Settings → Environment Variables):
   - `BIRDEYE_API_KEY` = your key from https://developers.birdeye.com/ (free tier works) 
   - *(optional)* `GMGN_URL` = a JSON endpoint you control that returns trending tokens from GMGN.
3. Build command: `npm run build`
4. Output directory: `build` (CRA)
5. Deploy.

## Notes
- UI toggle lets you switch **Birdeye ↔ GMGN** live.
- Windows: **10s / 30s / 60s** (refresh 5s for 10/30, 30s for 60).
- Sorting: **% gain (window)**, **volume (window)**, **1h % gain**.
- Filters persist in localStorage.
- Links on each token open **Dexscreener** and **Axiom** for execution.

If Birdeye returns empty, check your `BIRDEYE_API_KEY` or rate limits.
