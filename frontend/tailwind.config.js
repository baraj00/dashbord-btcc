/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // BTCC brand palette
        btcc: {
          50:  '#fff8e7',
          100: '#ffedb3',
          200: '#ffe07f',
          300: '#ffd24b',
          400: '#ffc517',
          500: '#f5a800',
          600: '#cc8a00',
          700: '#a36d00',
          800: '#7a5200',
          900: '#523800',
        },
        // Dark background palette
        dark: {
          50:  '#1a1a2e',
          100: '#16213e',
          200: '#0f3460',
          300: '#0d2137',
          400: '#0a1628',
          500: '#070e1a',
          600: '#050b14',
          700: '#03070e',
          800: '#020509',
          900: '#010204',
        },
        // Neon accents
        neon: {
          green:  '#00ff88',
          blue:   '#00d4ff',
          purple: '#a855f7',
          orange: '#f97316',
          red:    '#ef4444',
        },
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'monospace'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'slide-in':   'slideIn 0.3s ease-out',
        'fade-in':    'fadeIn 0.4s ease-out',
        'blink':      'blink 1.2s step-start infinite',
      },
      keyframes: {
        slideIn: {
          '0%': { transform: 'translateY(-8px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        blink: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0' },
        },
      },
    },
  },
  plugins: [],
};
