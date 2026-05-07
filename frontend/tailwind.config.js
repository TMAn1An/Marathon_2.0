/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // IUBAT SCSE MINI Marathon — primary brand red #ED1C24.
        brand: {
          50: '#fff1f2',
          100: '#ffe1e3',
          200: '#ffc6cb',
          300: '#ff9aa3',
          400: '#fb6470',
          500: '#ED1C24',
          600: '#cf131c',
          700: '#a90f17',
          800: '#7d0c12',
          900: '#570a10',
          950: '#2c0307',
        },
        ink: {
          50: '#f6f7f9',
          100: '#eceef2',
          200: '#d6dae3',
          300: '#b6becd',
          400: '#8c97ad',
          500: '#6c7891',
          600: '#536079',
          700: '#444f64',
          800: '#3a4253',
          900: '#181c25',
          950: '#0b0d12',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['"Plus Jakarta Sans"', 'Inter', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        soft: '0 10px 40px -16px rgba(15, 23, 42, 0.18)',
        glow: '0 14px 38px -14px rgba(237, 28, 36, 0.55)',
        card: '0 18px 60px -22px rgba(15, 23, 42, 0.30)',
      },
      backgroundImage: {
        'grid-fade':
          'radial-gradient(circle at 50% 0%, rgba(237,28,36,0.12), transparent 60%), radial-gradient(circle at 0% 100%, rgba(15,23,42,0.10), transparent 50%)',
        'hero-gradient':
          'linear-gradient(135deg, rgba(15,17,24,0.85) 0%, rgba(237,28,36,0.55) 50%, rgba(15,17,24,0.85) 100%)',
      },
      animation: {
        'spin-slow': 'spin 18s linear infinite',
        marquee: 'marquee 36s linear infinite',
        'fade-up': 'fadeUp 0.6s ease-out both',
        pulseGlow: 'pulseGlow 2.6s ease-in-out infinite',
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        fadeUp: {
          '0%': { opacity: 0, transform: 'translate3d(0, 18px, 0)' },
          '100%': { opacity: 1, transform: 'translate3d(0, 0, 0)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(237,28,36,0.45)' },
          '50%': { boxShadow: '0 0 0 14px rgba(237,28,36,0)' },
        },
      },
    },
  },
  plugins: [],
}
