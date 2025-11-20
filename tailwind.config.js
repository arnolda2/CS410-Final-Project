/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        nba: {
          red: '#C9082A',
          blue: '#17408B',
        }
      }
    },
  },
  plugins: [],
}

