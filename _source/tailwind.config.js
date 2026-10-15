/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        samba: {
          green: "#009c3b",
          yellow: "#ffdf00",
          blue: "#002776",
          dark: "#0b1320",
          card: "#121d2f",
        }
      }
    },
  },
  plugins: [],
};
