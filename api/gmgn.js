import fetch from 'cross-fetch';

export default async function handler(req, res){
  const { window='30', sort='pct' } = req.query;
  const base = process.env.GMGN_URL; // e.g., https://your-proxy.example/gmgn/trending?chain=sol
  if(!base){
    return res.status(501).json({ error: "GMGN source not configured. Set GMGN_URL env to a JSON endpoint that returns trending tokens." });
  }
  const url = `${base}&window=${encodeURIComponent(window)}&sort=${encodeURIComponent(sort)}`;
  try{
    const r = await fetch(url, { headers: { "accept":"application/json" }});
    const json = await r.json();
    // Expect the endpoint to return array in 'tokens' or 'items'
    const items = (json.items || json.tokens || json || []).map((t)=> ({
      id: t.id || t.address,
      address: t.address || t.id,
      symbol: t.symbol || t.ticker || t.name,
      name: t.name || t.symbol || t.ticker,
      price: t.price || t.lastPrice,
      change: t.pct || t.change || t.change_window || t.change_5m,
      change_1h: t.pct1h || t.change_1h,
      volume: t.vol || t.volume || t.volume_window || t.volume_5m,
      liq: t.liquidity || t.liq || t.liquidity_usd,
      age_minutes: t.ageMin || t.age_minutes || t.age,
    }));
    res.setHeader('Cache-Control','no-store');
    return res.status(200).json({ items });
  }catch(e){
    return res.status(502).json({ error: 'GMGN fetch failed', detail: String(e) });
  }
}