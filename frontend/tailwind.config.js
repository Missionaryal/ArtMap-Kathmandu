/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{js,jsx}"], // include all js/jsx files
  theme: {
    extend: {
      fontFamily: {
        display: ["Playfair Display", "serif"],
        body: ["Inter", "sans-serif"],
      },
      colors: {
        border: "hsl(var(--border))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        gold: { DEFAULT: "hsl(var(--gold))", light: "hsl(var(--gold-light))" },
        cream: { DEFAULT: "hsl(var(--cream))", dark: "hsl(var(--cream-dark))" },
      },
      spacing: { 18: "4.5rem" },
      borderRadius: { lg: "var(--radius)", xl: "calc(var(--radius) + 4px)" },
    },
  },
  plugins: [],
};
