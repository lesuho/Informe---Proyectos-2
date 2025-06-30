/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
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
        'dark-bg-primary': '#1a1a1a',
        'dark-bg-secondary': '#2a2a2a',
        'dark-bg-tertiary': '#3a3a3a',
        'dark-text-primary': '#ffffff',
        'dark-text-secondary': '#a3a3a3',
        'dark-border': '#4a4a4a',
        'dark-hover': '#3a3a3a',
        'dark': {
          'bg': '#1a1a1a',
          'secondary': '#2a2a2a',
          'tertiary': '#3a3a3a',
          'text-primary': '#ffffff',
          'text-secondary': '#a3a3a3'
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      spacing: {
        '72': '18rem',
        '84': '21rem',
        '96': '24rem',
      },
      boxShadow: {
        'dark': '0 4px 6px -1px rgba(0, 0, 0, 0.5)',
      }
    },
  },
  plugins: [],
}