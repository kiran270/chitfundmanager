/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        'space': ['Space Grotesk', 'sans-serif'],
        'mono': ['JetBrains Mono', 'monospace'],
        'orbitron': ['Orbitron', 'sans-serif'],
      },
      colors: {
        cyber: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
        neon: {
          cyan: '#06b6d4',
          blue: '#3b82f6',
          purple: '#8b5cf6',
          pink: '#ec4899',
          green: '#10b981',
        }
      },
      boxShadow: {
        '3xl': '0 35px 60px -12px rgba(0, 0, 0, 0.25)',
        'cyber': '0 0 20px rgba(6, 182, 212, 0.3), 0 0 40px rgba(59, 130, 246, 0.2)',
        'cyber-lg': '0 0 30px rgba(6, 182, 212, 0.4), 0 0 60px rgba(59, 130, 246, 0.3)',
        'neon': '0 0 20px currentColor, 0 0 40px currentColor, 0 0 60px currentColor',
        'hologram': '0 0 20px rgba(139, 92, 246, 0.4), 0 0 40px rgba(236, 72, 153, 0.3)',
      },
      backdropBlur: {
        '3xl': '64px',
        '4xl': '128px',
      },
      animation: {
        'cyber-fade': 'cyberFadeIn 1s ease-out',
        'cyber-slide': 'cyberSlideUp 1s ease-out',
        'cyber-scale': 'cyberScaleIn 0.8s ease-out',
        'data-flow': 'dataFlow 3s ease-in-out infinite',
        'pulse-cyber': 'pulseCyber 2s ease-in-out infinite',
        'hologram': 'hologramShift 4s ease-in-out infinite',
        'matrix-rain': 'matrixRain 20s linear infinite',
      },
      backgroundImage: {
        'cyber-gradient': 'linear-gradient(135deg, #06b6d4, #3b82f6, #8b5cf6)',
        'hologram-gradient': 'linear-gradient(45deg, #06b6d4, #8b5cf6, #ec4899, #06b6d4)',
        'matrix-grid': 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(6, 182, 212, 0.03) 2px, rgba(6, 182, 212, 0.03) 4px)',
      },
      backgroundSize: {
        '300%': '300% 300%',
      }
    },
  },
  plugins: [],
}