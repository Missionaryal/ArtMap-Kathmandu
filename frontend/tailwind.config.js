export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        background: "hsl(45 30% 98%)",
        foreground: "hsl(30 10% 15%)",
        primary: "hsl(38 60% 55%)",
        "primary-foreground": "hsl(45 30% 98%)",
        secondary: "hsl(35 25% 92%)",
        muted: "hsl(35 20% 94%)",
        accent: "hsl(38 45% 88%)",
        border: "hsl(35 20% 88%)",
      },
      fontFamily: {
        display: ["Playfair Display", "serif"],
        body: ["Inter", "sans-serif"],
      },
      boxShadow: {
        soft: "0 2px 10px rgba(0,0,0,0.06)",
        elegant: "0 4px 20px rgba(0,0,0,0.08)",
        gold: "0 4px 15px rgba(207,166,68,0.25)",
      },
    },
  },
  plugins: [],
};
