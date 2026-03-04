/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        serif: ["Playfair Display", "serif"],
        sans: ["Inter", "sans-serif"],
      },
      colors: {
        // Soft muted gold (from your image)
        gold: {
          50: "#faf8f3",
          100: "#f5f1e6",
          200: "#ebe2c7",
          300: "#dcc89d",
          400: "#C9A961", // Your actual gold color!
          500: "#b89550",
          600: "#a17d42",
          700: "#866538",
          800: "#6f5432",
          900: "#5e462c",
        },
        stone: {
          50: "#fafaf9",
          100: "#f5f5f4",
          200: "#e7e5e4",
          300: "#d6d3d1",
          400: "#a8a29e",
          500: "#78716c",
          600: "#57534e",
          700: "#44403c",
          800: "#292524",
          900: "#1c1917",
        },
        cream: {
          50: "#fefdfb",
          100: "#fdfbf7",
          200: "#faf6ed",
          300: "#f7f1e3",
        },
      },
    },
  },
  plugins: [],
};
