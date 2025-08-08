import React, { useState } from 'react';

export default function App() {
  const [tokens] = useState([
    { name: 'PEPE2', change: 34.2, liquidity: '$25k', safe: true, address: '0x123' },
    { name: 'WOJAKX', change: 45.8, liquidity: '$12k', safe: true, address: '0x456' },
    { name: 'DOGE++', change: 19.2, liquidity: '$50k', safe: true, address: '0x789' },
  ]);
  const [selected, setSelected] = useState(null);

  return (
    <div className="p-4 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold text-green-400 mb-4">🔥 Scalp Cockpit — Signals Only</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {tokens.map((t) => (
          <div
            key={t.name}
            className="p-4 bg-gray-800 rounded-xl shadow hover:shadow-lg cursor-pointer transition"
            onClick={() => setSelected(t)}
          >
            <h2 className="text-xl font-semibold">{t.name}</h2>
            <p className="text-green-400">+{t.change}%</p>
            <p>Liquidity: {t.liquidity}</p>
            <p>{t.safe ? '✅ Safe' : '⚠️ Caution'}</p>
          </div>
        ))}
      </div>

      {selected && (
        <div className="mt-8 p-4 bg-gray-700 rounded-xl">
          <h2 className="text-2xl font-bold">{selected.name} — Details</h2>
          <p className="mb-2">Price chart placeholder</p>
          <div className="flex gap-4">
            <a
              href={`https://dexscreener.com/ethereum/${selected.address}`}
              target="_blank"
              rel="noreferrer"
              className="bg-blue-500 px-4 py-2 rounded hover:bg-blue-600"
            >
              View on Dexscreener
            </a>
            <a
              href={`https://app.axiom.trade/${selected.address}`}
              target="_blank"
              rel="noreferrer"
              className="bg-purple-500 px-4 py-2 rounded hover:bg-purple-600"
            >
              View on Axiom
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
