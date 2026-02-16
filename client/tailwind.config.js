/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Paleta principal: Verde esmeralda elegante
        primary: {
          50:  '#f7f6f0',
          100: '#ede9d8',
          200: '#dbd2b0',
          300: '#c4b77e',
          400: '#b09e5a',
          500: '#8a7d3c',  // oliva principal
          600: '#6e621f',
          700: '#564d18',
          800: '#403a14',
          900: '#2e2a0f',
          950: '#1a180a',
        },
        // Acento: dorado ámbar para contraste elegante
        accent: {
          50:  '#fdf8f0',
          100: '#faecd5',
          200: '#f4d4a0',
          300: '#ebb463',
          400: '#e09335',
          500: '#c97a1e',  // dorado principal
          600: '#a8621a',
          700: '#834c16',
        },
        neutral: {
          warm: '#f8faf8',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Playfair Display', 'Georgia', 'serif'],
      },
      spacing: {
        'touch':    '44px',
        'touch-lg': '56px',
      },
      borderRadius: {
        'xl':  '1rem',
        '2xl': '1.5rem',
      },
      boxShadow: {
        'card':       '0 2px 15px -3px rgba(0,0,0,0.07), 0 10px 20px -2px rgba(0,0,0,0.04)',
        'card-hover': '0 10px 30px -5px rgba(138,125,60,0.18)',
      },
      screens: {
        'xs':        '480px',
        'tablet':    '768px',
        'tablet-lg': '1024px',
      },
      minHeight: {
        'touch':    '44px',
        'touch-lg': '56px',
      }
    },
  },
  plugins: [],
}
