/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#fff7ed",
          100: "#ffedd5",
          200: "#fed7aa",
          300: "#fdba74",
          400: "#fb923c",
          500: "#f97316",
          600: "#ea580c",
          700: "#c2410c",
          800: "#9a3412",
          900: "#7c2d12"
        },
        ink: {
          950: "#07070a",
          900: "#0b0b10",
          850: "#101018",
          800: "#14141e"
        }
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(255,138,61,0.18), 0 12px 50px rgba(0,0,0,0.55)",
        soft: "0 10px 30px rgba(0,0,0,0.35)"
      },
      backgroundImage: {
        "hero-radial":
          "radial-gradient(1200px 600px at 20% 10%, rgba(255,138,61,0.18), transparent 60%), radial-gradient(900px 500px at 85% 25%, rgba(196,92,38,0.14), transparent 55%), radial-gradient(700px 420px at 60% 90%, rgba(255,138,61,0.10), transparent 55%)",
        "grid-fade":
          "linear-gradient(to bottom, rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(to right, rgba(255,255,255,0.06) 1px, transparent 1px)"
      }
    }
  },
  plugins: []
};


