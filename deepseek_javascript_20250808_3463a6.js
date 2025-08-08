import { useState, useEffect } from 'react'

export default function useTokenData() {
  const [tokens, setTokens] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch from DexScreener API
        const response = await fetch('https://api.dexscreener.com/latest/dex/tokens/your-watchlist-tokens')
        const data = await response.json()
        
        // Add GMGN.ai sentiment data (mock)
        const tokensWithSentiment = data.pairs.map(token => ({
          ...token,
          sentiment: Math.random() * 100, // Replace with actual API call
          isHoneypot: Math.random() > 0.8 // 20% chance to be honeypot
        }))
        
        setTokens(tokensWithSentiment)
      } catch (error) {
        console.error('Error fetching token data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
    const interval = setInterval(fetchData, 30000) // Refresh every 30 seconds

    return () => clearInterval(interval)
  }, [])

  return { tokens, loading }
}