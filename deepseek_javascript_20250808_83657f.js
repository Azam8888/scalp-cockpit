module.exports = {
  content: ["./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        cyberpunk: {
          pink: '#ff00ff',
          blue: '#00ffff',
          dark: '#0a0a12',
          matrix: '#00ff41',
          purple: '#9d00ff',
        },
      },
      fontFamily: {
        'cyber': ['"Courier New"', 'monospace'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'ticker-scroll': 'ticker-scroll 20s linear infinite',
      },
      keyframes: {
        'ticker-scroll': {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(-100%)' },
        },
      },
    },
  },
  plugins: [],
}