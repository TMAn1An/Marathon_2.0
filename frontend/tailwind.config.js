/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // "Ink & forest": warm paper (50-200) through deep forest ink (800-950).
        brand: {
          50: '#f4f6ef',
          100: '#e8ede0',
          200: '#d2dbc5',
          300: '#aebda2',
          400: '#82967f',
          500: '#566f5c',
          600: '#3a5546',
          700: '#244033',
          800: '#16301f',
          900: '#0d2218',
          950: '#07140e',
        },
        // "Volt": the single high-energy accent, used for CTAs and highlights.
        action: {
          50: '#fafee8',
          100: '#f2fdc2',
          200: '#e6fb8c',
          300: '#d6f751',
          400: '#c6f032',
          500: '#a9d31a',
          600: '#84a80f',
          700: '#647f10',
          800: '#4f6313',
          900: '#435415',
        },
        // Warm coral for small badges / secondary highlights.
        accent: {
          50: '#fff4ed',
          100: '#ffe6d5',
          200: '#fecaa8',
          300: '#fda673',
          400: '#fb8340',
          500: '#f4601a',
          600: '#e54610',
          700: '#be3410',
          800: '#982d14',
          900: '#7a2914',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['"Bricolage Grotesque"', 'Inter', 'ui-sans-serif', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 1px 2px rgba(7, 20, 14, 0.04), 0 8px 30px -12px rgba(7, 20, 14, 0.12)',
        lift: '0 2px 4px rgba(7, 20, 14, 0.05), 0 24px 48px -18px rgba(7, 20, 14, 0.25)',
        glow: '0 10px 40px -8px rgba(198, 240, 50, 0.55)',
      },
      borderRadius: { '4xl': '2rem' },
    },
  },
  plugins: [],
}
