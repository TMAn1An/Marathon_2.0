/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Green is the primary brand colour (~60% of the surface area).
        brand: {
          50:  '#eefdf2',
          100: '#d6f9e0',
          200: '#aff1c4',
          300: '#7be4a1',
          400: '#3fce7a',
          500: '#1bb35d',
          600: '#0e9049',
          700: '#0d723c',
          800: '#0f5b32',
          900: '#0e4a2c',
          950: '#062a18',
        },
        // Orange is the call-to-action / interactive colour (~30%).
        action: {
          50:  '#fff5ed',
          100: '#ffe6d4',
          200: '#ffc8a8',
          300: '#ffa370',
          400: '#ff7a37',
          500: '#f96015',
          600: '#ea4a0c',
          700: '#c1370c',
          800: '#992d10',
          900: '#7c2811',
          950: '#431205',
        },
        // Yellow is reserved for badges and tiny accents (~10%).
        accent: {
          50:  '#fffceb',
          100: '#fff5c5',
          200: '#ffe886',
          300: '#ffd44a',
          400: '#ffbf1f',
          500: '#f99c07',
          600: '#dd7402',
          700: '#b75106',
          800: '#943f0c',
          900: '#7a350d',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['"Plus Jakarta Sans"', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 6px 28px rgba(13, 114, 60, 0.10)',
        glow: '0 8px 24px rgba(249, 96, 21, 0.35)',
      },
    },
  },
  plugins: [],
}
