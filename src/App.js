import React, { useEffect, useMemo, useRef, useState } from "react";

const DEFAULT_SOURCE = "birdeye"; // 'birdeye' | 'gmgn'
const WINDOWS = [{label:"10s", value:10},{label:"30s", value:30},{label:"60s", value:60}];
const SORTS = [
  {label:"% Gain (window)", value:"pct"},
  {label:"Volume (window)", value:"vol"},
  {label:"1h % Gain", value:"pct1h"},
];

function num(x){ return Number(x || 0); }
function fmtUSD(x){ if(x==null) return "-"; const n = Math.round(Number(x)); return "$"+ n.toLocaleString(); }

export default function App(){
  const [source, setSource] = useState(()=> localStorage.getItem("src") || DEFAULT_SOURCE);
  const [windowSec, setWindowSec] = useState(()=> Number(localStorage.getItem("win") || 30));
  const [sortBy, setSortBy] = useState(()=> localStorage.getItem("sort") || "pct");
  const [minVol, setMinVol] = useState(()=> Number(localStorage.getItem("minVol") || 5000));
  const [minPct, setMinPct] = useState(()=> Number(localStorage.getItem("minPct") || 10));
  const [maxAgeMin, setMaxAgeMin] = useState(()=> Number(localStorage.getItem("maxAgeMin") || 600));
  const [minLiq, setMinLiq] = useState(()=> Number(localStorage.getItem("minLiq") || 5000));

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  const intervalRef = useRef(null);

  useEffect(()=>{
    localStorage.setItem("src", source);
    localStorage.setItem("win", String(windowSec));
    localStorage.setItem("sort", sortBy);
    localStorage.setItem("minVol", String(minVol));
    localStorage.setItem("minPct", String(minPct));
    localStorage.setItem("maxAgeMin", String(maxAgeMin));
    localStorage.setItem("minLiq", String(minLiq));
  }, [source, windowSec, sortBy, minVol, minPct, maxAgeMin, minLiq]);

  useEffect(()=>{
    fetchNow();
    clearInterval(intervalRef.current);
    // 5s refresh for 10s/30s, 30s for 60s
    const ms = windowSec === 60 ? 30000 : 5000;
    intervalRef.current = setInterval(fetchNow, ms);
    return ()=> clearInterval(intervalRef.current);
  }, [source, windowSec]);

  async function fetchNow(){
    setLoading(true);
    setLastUpdated(null);
    try{
      const qs = new URLSearchParams({ window: String(windowSec), sort: sortBy }).toString();
      const url = source === "birdeye" ? `/api/birdeye?${qs}` : `/api/gmgn?${qs}`;
      const resp = await fetch(url, { cache: "no-store" });
      if(!resp.ok) throw new Error("bad status "+resp.status);
      const data = await resp.json();
      const mapped = (data.items || data.tokens || data || []).map((t, i)=> ({
        id: t.address || t.id || String(i),
        ca: t.address || t.id || "",
        symbol: t.symbol || t.ticker || (t.name || "TOKEN").slice(0,8),
        name: t.name || t.symbol || "Token",
        price: num(t.price || t.lastPrice),
        pct: num(t.pct || t.change || t.change_window || t.change_5m || 0),
        vol: num(t.vol || t.volume || t.volume_window || t.vol_5m || 0),
        pct1h: num(t.pct1h || t.change_1h || 0),
        liq: num(t.liquidity || t.liq || 0),
        ageMin: num(t.ageMin || t.age_minutes || t.age || 0),
      }));
      setRows(mapped);
    } catch(e){
      console.error(e);
      setRows([]);
    } finally {
      setLoading(false);
      setLastUpdated(new Date().toLocaleTimeString());
    }
  }

  const filtered = useMemo(()=>{
    return rows
      .filter(r => r.vol >= minVol)
      .filter(r => r.pct >= minPct)
      .filter(r => (maxAgeMin ? r.ageMin <= maxAgeMin : true))
      .filter(r => r.liq >= minLiq);
  }, [rows, minVol, minPct, maxAgeMin, minLiq]);

  const sorted = useMemo(()=>{
    const arr = [...filtered];
    if(sortBy === "pct") arr.sort((a,b)=> (b.pct||0)-(a.pct||0));
    else if(sortBy === "vol") arr.sort((a,b)=> (b.vol||0)-(a.vol||0));
    else if(sortBy === "pct1h") arr.sort((a,b)=> (b.pct1h||0)-(a.pct1h||0));
    return arr;
  }, [filtered, sortBy]);

  return (
    <div className="min-h-screen p-6" style={{backgroundColor:'#000'}}>
      <div className="max-w-6xl mx-auto">
        <header className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold neon" style={{color:'#00f6ff'}}>Scalp Cockpit — Solana (v1.1)</h1>
            <div className="small mt-1">Live source: <span className="font-semibold" style={{color:'#00c3ff'}}>{source.toUpperCase()}</span></div>
          </div>
          <div className="flex items-center gap-2">
            <select className="bg-[#001f26] panel px-3 py-2 rounded text-sm" value={source} onChange={e=>setSource(e.target.value)}>
              <option value="birdeye">Birdeye</option>
              <option value="gmgn">GMGN</option>
            </select>
            <select className="bg-[#001f26] panel px-3 py-2 rounded text-sm" value={windowSec} onChange={e=>setWindowSec(Number(e.target.value))}>
              {WINDOWS.map(w=> <option key={w.value} value={w.value}>{w.label}</option>)}
            </select>
            <select className="bg-[#001f26] panel px-3 py-2 rounded text-sm" value={sortBy} onChange={e=>setSortBy(e.target.value)}>
              {SORTS.map(s=> <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
            <button onClick={fetchNow} className="px-3 py-2 rounded bg-[#001f26] panel text-sm">Refresh</button>
            <div className="text-sm small">Updated: {lastUpdated || "—"}</div>
          </div>
        </header>

        <main className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <section className="md:col-span-3">
            <div className="panel p-4 rounded-xl">
              <div className="flex items-center justify-between mb-3">
                <div className="text-lg font-semibold">Signals</div>
                <div className="small">Auto refresh based on window</div>
              </div>

              {loading && <div className="small mb-3">Loading…</div>}
              {!loading && sorted.length === 0 && <div className="small text-gray-400">No tokens matching filters (or source blocked). Try lowering filters or switching source.</div>}

              <div className="space-y-3">
                {sorted.map(r=> (
                  <div key={r.id} className="p-3 rounded-lg bg-[#05121a] flex items-center justify-between">
                    <div>
                      <div className="flex items-baseline gap-3">
                        <div className="text-lg font-bold" style={{color:'#00f6ff'}}>{r.symbol}</div>
                        <div className="small">{r.name}</div>
                      </div>
                      <div className="small mt-1">
                        Vol({windowSec}s): {fmtUSD(r.vol)} · Liq: {fmtUSD(r.liq)} · Age: {Math.round(r.ageMin||0)}m
                      </div>
                    </div>
                    <div className="text-right">
                      <div style={{fontSize:'1.35rem', fontWeight:700, color: (r.pct||0)>=0? '#7CFFB2':'#FF8C8C'}}>{Math.round(r.pct || 0)}%</div>
                      <div className="small neon mt-1" style={{color:'#00c3ff'}}>1h: {Math.round(r.pct1h || 0)}%</div>
                      <div className="mt-2 flex gap-2">
                        <a href={`https://dexscreener.com/solana/${r.ca}`} target="_blank" rel="noreferrer" className="px-3 py-1 rounded bg-[#002b2f] small">Dexscreener</a>
                        <a href={`https://app.axiom.trade/${r.ca}`} target="_blank" rel="noreferrer" className="px-3 py-1 rounded bg-[#002b2f] small">Axiom</a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <aside className="panel p-4 rounded-xl">
            <div className="font-semibold mb-3">Filters</div>
            <div className="space-y-3">
              <div>
                <label className="small">Min Volume ({windowSec}s): {fmtUSD(minVol)}</label>
                <input type="range" min="0" max="100000" step="500" value={minVol} onChange={e=>setMinVol(Number(e.target.value))} className="w-full" />
              </div>
              <div>
                <label className="small">Min % Gain ({windowSec}s): {minPct}%</label>
                <input type="range" min="0" max="200" step="1" value={minPct} onChange={e=>setMinPct(Number(e.target.value))} className="w-full" />
              </div>
              <div>
                <label className="small">Max Age (minutes): {maxAgeMin}</label>
                <input type="range" min="0" max="1440" step="5" value={maxAgeMin} onChange={e=>setMaxAgeMin(Number(e.target.value))} className="w-full" />
              </div>
              <div>
                <label className="small">Min Liquidity (USD): {fmtUSD(minLiq)}</label>
                <input type="range" min="0" max="100000" step="500" value={minLiq} onChange={e=>setMinLiq(Number(e.target.value))} className="w-full" />
              </div>
            </div>
          </aside>
        </main>

        <footer className="mt-6 small text-center text-gray-500">
          v1.1 — Source toggle Birdeye/GMGN · Windows: 10/30/60s · Sorting: %/Vol/1h
        </footer>
      </div>
    </div>
  );
}