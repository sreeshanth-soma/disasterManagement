/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        disaster: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
        },
        emergency: {
          50: '#fef7ff',
          100: '#fdedf2',
          200: '#fbdce8',
          300: '#f9bdd3',
          400: '#f592b8',
          500: '#ed689a',
          600: '#e03e7e',
          700: '#c32766',
          800: '#a21854',
          900: '#861649',
        }
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}
