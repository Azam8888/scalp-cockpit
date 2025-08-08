export default function TokenCard({ token, isSelected, onClick }) {
  return (
    <div
      className={`cyber-card p-4 rounded-none cursor-pointer ${isSelected ? 'border-cyberpunk-matrix' : ''}`}
      onClick={onClick}
    >
      <h2 className="text-2xl font-bold glow-text text-cyberpunk-pink">{token.name}</h2>
      <p className={`text-xl my-2 ${token.priceChange24h >= 0 ? 'text-cyberpunk-matrix' : 'text-cyberpunk-pink'}`}>
        {token.priceChange24h >= 0 ? '+' : ''}{token.priceChange24h.toFixed(1)}%
      </p>
      <p className="text-cyberpunk-blue">Liquidity: ${(token.liquidity / 1000).toFixed(1)}k</p>
      <p className={token.isHoneypot ? 'text-cyberpunk-pink' : 'text-cyberpunk-matrix'}>
        {token.isHoneypot ? '⚠️ HIGH RISK' : '✅ SAFE ENTRY'}
      </p>
    </div>
  )
}