/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brasil: {
          green: "#159447",
          yellow: "#F8C62B",
          blue: "#124DA0",
          dark: "#172033",
          bg: "#F6F8FC",
        },
        primary: {
          DEFAULT: "#159447",
          hover: "#117739",
          foreground: "#FFFFFF",
        },
        samba: {
          DEFAULT: "#124DA0",
          dark: "#0b2b5c",
        },
        carnaval: {
          DEFAULT: "#F8C62B",
          dark: "#d8a417",
        },
      },
      fontFamily: {
        outfit: ["Outfit", "sans-serif"],
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
      },
      boxShadow: {
        'green-glow': '0 0 25px rgba(21, 148, 71, 0.25)',
        'yellow-glow': '0 0 25px rgba(248, 198, 43, 0.25)',
        'blue-glow': '0 0 25px rgba(18, 77, 160, 0.25)',
      }
    },
  },
  plugins: [],
};
