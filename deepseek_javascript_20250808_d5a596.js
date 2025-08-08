export default function Ticker({ tokens }) {
  return (
    <div className="ticker bg-cyberpunk-dark border-t border-b border-cyberpunk-blue py-2 mb-6">
      <span className="text-cyberpunk-matrix mr-8">LIVE MEMECOIN SCALP SIGNALS:</span>
      {tokens.map((t) => (
        <span key={t.address} className="mr-8">
          <span className="text-cyberpunk-pink">{t.name}</span> 
          <span className="text-cyberpunk-matrix ml-2">+{t.priceChange24h.toFixed(1)}%</span>
        </span>
      ))}
    </div>
  )
}