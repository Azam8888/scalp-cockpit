# Scalp HUD v1
A lightweight Solana memecoin signal dashboard (text-only HUD) designed for fast scalping decisions.

## Features
- Dark neon HUD theme
- Solana-focused signals (GMGN.ai endpoint attempted)
- Adjustable filters with localStorage persistence
- Auto-refresh every 30s + manual refresh button
- Text-only for speed (no charts)

## Deploy
1. Extract this folder and push to a GitHub repo.
2. Connect that repo to Vercel and deploy (React app).
3. The app will attempt to call GMGN.ai; if blocked by CORS or whitelist, it will show fallback/mock data.

## Notes
- GMGN.ai endpoint used is a placeholder `https://api.gmgn.ai/solana/trending`. If they require whitelist or API keys, you may need a serverless proxy.
- To enable a server-side proxy, create a simple Vercel Function that fetches GMGN and returns results to the client.
