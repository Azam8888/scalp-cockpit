import fetch from 'cross-fetch';

export default async function handler(req, res){
  const apiKey = process.env.BIRDEYE_API_KEY;
  if(!apiKey){
    return res.status(500).json({ error: "Missing BIRDEYE_API_KEY in Vercel env. Add it in Project Settings > Environment Variables." });
  }
  const { window='30', sort='pct' } = req.query;

  // Map UI params to Birdeye's trending endpoint
  // NOTE: Birdeye requires X-API-KEY and 'chain' param. Some query names may evolve; we pass what we have and rely on defaults.
  const qs = new URLSearchParams();
  qs.set('chain', 'solana');
  // try provide sort and window hints if supported
  if(sort === 'pct') qs.set('sort_by', 'price_change'); // heuristic
  else if(sort === 'vol') qs.set('sort_by', 'volume');
  else if(sort === 'pct1h') qs.set('sort_by', 'price_change_1h');
  // window hints (Birdeye may use intervals like 5m/1h; for seconds windows, backend may need to compute; pass best-effort param)
  if(window === '10') qs.set('window', '10s');
  else if(window === '30') qs.set('window', '30s');
  else if(window === '60') qs.set('window', '60s');

  const url = `https://public-api.birdeye.so/defi/token_trending?${qs.toString()}`;

  try{
    const r = await fetch(url, { headers: { "accept":"application/json", "X-API-KEY": apiKey }});
    const json = await r.json();
    // Normalize: return items array with common fields
    // Birdeye typically nests at data or data.items — handle both.
    const data = json.data || json;
    const items = (data.items || data.tokens || data || []).map((t)=> ({
      id: t.address || t.mint || t.id,
      address: t.address || t.mint || t.id,
      symbol: t.symbol || t.ticker || t.name,
      name: t.name || t.symbol || t.ticker,
      price: t.price,
      change: t.price_change || t.pct || t.change,
      change_1h: t.price_change_1h || t.change_1h,
      volume: t.volume || t.vol || t.volume_5m || t.volume_1h,
      liq: t.liquidity_usd || t.liquidity,
      age_minutes: t.age_minutes || t.ageMin || t.age,
    }));
    res.setHeader('Cache-Control','no-store');
    return res.status(200).json({ items });
  }catch(e){
    return res.status(502).json({ error: 'Birdeye fetch failed', detail: String(e) });
  }
}