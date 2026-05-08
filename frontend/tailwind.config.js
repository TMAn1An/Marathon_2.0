/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // 60% surface — deep professional green
        brand: {
          50: '#ecfdf3',
          100: '#d1fadf',
          200: '#a7f3c4',
          300: '#6fe6a3',
          400: '#34d27a',
          500: '#0e7d4a',
          600: '#0a6a3f',
          700: '#085a35',
          800: '#08442a',
          900: '#05311e',
          950: '#021a10',
        },
        // 30% — dark, rich red for buttons / active links / accents
        crimson: {
          50: '#fdf3f3',
          100: '#fbe4e4',
          200: '#f6c5c5',
          300: '#ed9595',
          400: '#dd5757',
          500: '#b51d1d',
          600: '#990000',
          700: '#8b0000',
          800: '#6c0202',
          900: '#4a0000',
          950: '#2a0000',
        },
        // 10% — vibrant yellow for badges / highlights
        sun: {
          50: '#fffbe6',
          100: '#fff5c2',
          200: '#ffe982',
          300: '#ffd74a',
          400: '#facc15',
          500: '#e0b30a',
          600: '#b88a04',
          700: '#92670a',
          800: '#785010',
          900: '#5e3d10',
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
        glow: '0 14px 38px -14px rgba(139, 0, 0, 0.55)',
        card: '0 18px 60px -22px rgba(15, 23, 42, 0.30)',
      },
      backgroundImage: {
        'grid-fade':
          'radial-gradient(circle at 50% 0%, rgba(14,125,74,0.14), transparent 60%), radial-gradient(circle at 0% 100%, rgba(8,68,42,0.10), transparent 50%)',
        'hero-gradient':
          'linear-gradient(135deg, rgba(5,49,30,0.92) 0%, rgba(8,68,42,0.85) 55%, rgba(139,0,0,0.55) 100%)',
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
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(139,0,0,0.50)' },
          '50%': { boxShadow: '0 0 0 14px rgba(139,0,0,0)' },
        },
      },
    },
  },
  plugins: [],
}
