import React, { useEffect, useState, useRef } from 'react';

const GMGN_SOLANA_ENDPOINT = 'https://api.gmgn.ai/solana/trending'; // placeholder - may require whitelist
const REFRESH_INTERVAL_MS = 30000; // 30s

function numberWithCommas(x){
  if(!x && x!==0) return '-';
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function mockData(){
  const now = Date.now();
  return [
    { id: '1', symbol: 'PEPE-SOL', name: 'Pepe Sol', price: 0.00045, pct5m: 34.2, vol5m: 15420, whales: 3, ageHours: 2, link: 'https://app.axiom.trade/PEPE-SOL' },
    { id: '2', symbol: 'WOJAK-S', name: 'Wojak Sol', price: 0.0012, pct5m: 45.8, vol5m: 12100, whales: 4, ageHours: 1.2, link: 'https://app.axiom.trade/WOJAK-S' },
    { id: '3', symbol: 'SHIBA-S', name: 'Shiba Sol', price: 0.00009, pct5m: 18.9, vol5m: 52000, whales: 1, ageHours: 10, link: 'https://app.axiom.trade/SHIBA-S' },
  ];
}

export default function App(){
  const [tokens, setTokens] = useState([]);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filters, setFilters] = useState(() => {
    try {
      const saved = localStorage.getItem('scalp_filters_v1');
      if(saved) return JSON.parse(saved);
    } catch(e){}
    return {
      minVolume: 10000,
      minPct: 15,
      maxPct: 200,
      maxTax: 10,
      minWhales: 2,
      maxAgeHours: 24
    };
  });
  const timerRef = useRef(null);

  useEffect(()=>{
    fetchAndUpdate();
    timerRef.current = setInterval(fetchAndUpdate, REFRESH_INTERVAL_MS);
    return ()=> clearInterval(timerRef.current);
  },[]);

  useEffect(()=>{
    try{ localStorage.setItem('scalp_filters_v1', JSON.stringify(filters)); }catch(e){}
  },[filters]);

  async function fetchAndUpdate(){
    setLoading(true);
    setLastUpdated(null);
    try {
      const resp = await fetch(GMGN_SOLANA_ENDPOINT, { cache: "no-store" });
      if(resp.ok){
        const data = await resp.json();
        const parsed = parseGmgn(data);
        applyAndSet(parsed);
      } else {
        applyAndSet(mockData());
      }
    } catch(e){
      applyAndSet(mockData());
    } finally {
      setLoading(false);
      setLastUpdated(new Date().toLocaleTimeString());
    }
  }

  function parseGmgn(data){
    if(!data) return mockData();
    let arr = [];
    if(Array.isArray(data.tokens)) arr = data.tokens;
    else if(Array.isArray(data)) arr = data;
    else if(data.result && Array.isArray(data.result)) arr = data.result;
    return arr.map((t,i)=>({
      id: t.id || t.address || ('g'+i),
      symbol: t.symbol || t.ticker || (t.name||'token').slice(0,8),
      name: t.name || t.symbol || 'Token',
      price: t.price || t.lastPrice || 0,
      pct5m: t.pct5m || t.change_5m || t.change || 0,
      vol5m: t.vol5m || t.volume_5m || t.volume || 0,
      whales: (t.smart_buyers && t.smart_buyers.length) || t.whales || 0,
      ageHours: t.ageHours || (t.age_minutes? Math.round(t.age_minutes/60):0),
      link: t.axiom_link || (`https://app.axiom.trade/${t.address || t.id || ''}`)
    }));
  }

  function applyAndSet(list){
    const filtered = list.filter(t=>{
      if(!t) return false;
      const vol = Number(t.vol5m||0);
      const pct = Number(t.pct5m||0);
      const whales = Number(t.whales||0);
      const age = Number(t.ageHours||0);
      if(vol < filters.minVolume) return false;
      if(pct < filters.minPct) return false;
      if(pct > filters.maxPct) return false;
      if(whales < filters.minWhales) return false;
      if(age > filters.maxAgeHours) return false;
      return true;
    });
    const scored = filtered.map(t=> ({
      ...t,
      score: Math.min(100, Math.round((Number(t.pct5m||0)*0.6) + (Math.log10(Number(t.vol5m||1))*5) + (Number(t.whales||0)*8)))
    }));
    scored.sort((a,b)=> (b.score||0)-(a.score||0));
    setTokens(scored);
  }

  function onFilterChange(k, v){
    setFilters(prev=> ({...prev, [k]: Number(v)}));
  }

  return (
    <div className="min-h-screen p-6" style={{backgroundColor:'#000'}}>
      <div className="max-w-6xl mx-auto">
        <header className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold neon" style={{color:'#00f6ff'}}>Scalp HUD — Solana (v1)</h1>
            <div className="small mt-1">Live memecoin signal cockpit — filterable, fast, text-only</div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-sm small">Updated: <span className="ml-2">{lastUpdated || '—'}</span></div>
            <button onClick={fetchAndUpdate} className="px-3 py-2 rounded bg-[#001f26] panel text-sm">Refresh</button>
            <button onClick={()=>setFiltersOpen(s=>!s)} className="px-3 py-2 rounded bg-[#001f26] panel text-sm">Filters</button>
          </div>
        </header>

        <main className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <section className="md:col-span-3">
            <div className="panel p-4 rounded-xl">
              <div className="flex items-center justify-between mb-3">
                <div className="text-lg font-semibold">Top Signals</div>
                <div className="small">Auto refresh every 30s · Text-only</div>
              </div>

              {loading && <div className="small mb-3">Loading...</div>}

              {tokens.length === 0 && !loading && <div className="small text-gray-400">No tokens matching filters.</div>}

              <div className="space-y-3">
                {tokens.map(t=>(
                  <div key={t.id} className="p-3 rounded-lg bg-[#05121a] flex items-center justify-between">
                    <div>
                      <div className="flex items-baseline gap-3">
                        <div className="text-lg font-bold" style={{color:'#00f6ff'}}>{t.symbol}</div>
                        <div className="small">{t.name}</div>
                      </div>
                      <div className="small mt-1">Vol(5m): ${numberWithCommas(Math.round(t.vol5m || 0))} · Age: {Math.round(t.ageHours)}h · Whales: {t.whales}</div>
                    </div>
                    <div className="text-right">
                      <div style={{fontSize: '1.35rem', fontWeight:700, color: t.pct5m>=0? '#7CFFB2':'#FF8C8C' }}>{Math.round(t.pct5m||0)}%</div>
                      <div className="small neon mt-1" style={{color:'#00c3ff'}}>Score {t.score}</div>
                      <div className="mt-2 flex gap-2">
                        <a href={`https://dexscreener.com/solana/${t.id}`} target="_blank" rel="noreferrer" className="px-3 py-1 rounded bg-[#002b2f] small">Dexscreener</a>
                        <a href={t.link} target="_blank" rel="noreferrer" className="px-3 py-1 rounded bg-[#002b2f] small">Axiom</a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <aside className="panel p-4 rounded-xl">
            <div className="flex items-center justify-between mb-3">
              <div className="font-semibold">Filters</div>
              <div className="small">Adjust to taste</div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="small">Min 5m Volume: ${filters.minVolume}</label>
                <input type="range" min="1000" max="100000" step="500" value={filters.minVolume} onChange={(e)=>onFilterChange('minVolume', e.target.value)} className="w-full" />
              </div>
              <div>
                <label className="small">Min 5m % Gain: {filters.minPct}%</label>
                <input type="range" min="5" max="50" step="1" value={filters.minPct} onChange={(e)=>onFilterChange('minPct', e.target.value)} className="w-full" />
              </div>
              <div>
                <label className="small">Max 5m % Gain: {filters.maxPct}%</label>
                <input type="range" min="50" max="500" step="10" value={filters.maxPct} onChange={(e)=>onFilterChange('maxPct', e.target.value)} className="w-full" />
              </div>
              <div>
                <label className="small">Min Smart Wallets: {filters.minWhales}</label>
                <input type="range" min="0" max="10" step="1" value={filters.minWhales} onChange={(e)=>onFilterChange('minWhales', e.target.value)} className="w-full" />
              </div>
              <div>
                <label className="small">Max Age (hours): {filters.maxAgeHours}</label>
                <input type="range" min="1" max="72" step="1" value={filters.maxAgeHours} onChange={(e)=>onFilterChange('maxAgeHours', e.target.value)} className="w-full" />
              </div>

              <div className="mt-3 flex gap-2">
                <button onClick={()=>{ setFilters({minVolume:10000,minPct:15,maxPct:200,maxTax:10,minWhales:2,maxAgeHours:24}); }} className="px-3 py-2 rounded bg-[#002b2f] small">Reset</button>
                <button onClick={()=>{ fetchAndUpdate(); }} className="px-3 py-2 rounded bg-[#001f26] small">Apply</button>
              </div>

              <div className="mt-4 small text-gray-400">
                Filters are saved locally in your browser. Use the Axiom link to open the token on your execution platform.
              </div>
            </div>
          </aside>
        </main>

        <footer className="mt-6 small text-center text-gray-500">
          Scalp HUD v1 — Solana · Data: GMGN.ai (attempt) · Fallback: local mock data
        </footer>
      </div>
    </div>
  );
}
