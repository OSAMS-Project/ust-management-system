// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        roboto: ['Roboto', 'sans-serif'],
        quicksand: ['Quicksand', 'sans-serif'],
      },
      margin: {
        '-screen': '-100vw',
      },
      width: {
        'screen': '100vw',
      },
      height: {
        'screen': '100vh',
      },
    },
  },
  plugins: [],
};
