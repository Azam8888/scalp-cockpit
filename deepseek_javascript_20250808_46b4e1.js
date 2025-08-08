import { useState } from 'react'
import useTokenData from './hooks/useTokenData'
import Ticker from './components/Ticker'
import TokenCard from './components/TokenCard'

export default function App() {
  const { tokens, loading } = useTokenData()
  const [selectedToken, setSelectedToken] = useState(null)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-cyberpunk-pink text-2xl loading-pulse">
          LOADING SCALP SIGNALS...
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 max-w-5xl mx-auto">
      <h1 className="text-4xl font-bold glow-text mb-6 text-center">
        <span className="text-cyberpunk-pink">⚡</span> SCALP COCKPIT <span className="text-cyberpunk-pink">⚡</span>
      </h1>
      
      <Ticker tokens={tokens} />
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {tokens.map((token) => (
          <TokenCard
            key={token.address}
            token={token}
            isSelected={selectedToken?.address === token.address}
            onClick={() => setSelectedToken(token)}
          />
        ))}
      </div>

      {selectedToken && (
        <div className="cyber-card mt-8 p-6">
          <h2 className="text-3xl font-bold glow-text text-cyberpunk-pink mb-4">
            {selectedToken.name} — SCALP DETAILS
          </h2>
          <div className="h-48 bg-black bg-opacity-50 border border-cyberpunk-blue mb-4 flex items-center justify-center">
            <p className="text-cyberpunk-blue">PRICE CHART PLACEHOLDER</p>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <h3 className="text-cyberpunk-blue">24h Change</h3>
              <p className={selectedToken.priceChange24h >= 0 ? 'text-cyberpunk-matrix' : 'text-cyberpunk-pink'}>
                {selectedToken.priceChange24h >= 0 ? '+' : ''}{selectedToken.priceChange24h.toFixed(2)}%
              </p>
            </div>
            <div>
              <h3 className="text-cyberpunk-blue">Liquidity</h3>
              <p>${(selectedToken.liquidity / 1000).toFixed(1)}k</p>
            </div>
            <div>
              <h3 className="text-cyberpunk-blue">Sentiment</h3>
              <p>{selectedToken.sentiment.toFixed(0)}/100</p>
            </div>
            <div>
              <h3 className="text-cyberpunk-blue">Risk</h3>
              <p>{selectedToken.isHoneypot ? '⚠️ High' : '✅ Low'}</p>
            </div>
          </div>
          <div className="flex gap-4">
            <a
              href={`https://dexscreener.com/${selectedToken.chainId}/${selectedToken.address}`}
              target="_blank"
              rel="noreferrer"
              className="cyber-button"
            >
              DEXSCREENER
            </a>
            <a
              href={`https://app.axiom.trade/${selectedToken.address}`}
              target="_blank"
              rel="noreferrer"
              className="cyber-button"
            >
              AXIOM TRADE
            </a>
          </div>
        </div>
      )}
    </div>
  )
}