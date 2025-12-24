import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        'comic-sans': ['"Comic Sans MS"', 'cursive'], // Añadido Comic Sans MS
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
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
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
        'neon-red': '#FF073A', // Nuevo color rojo neón
        'neon-blue': '#00FFFF', // Nuevo color azul neón
        'neon-green': '#39FF14', // Nuevo color verde neón
        'neon-purple': '#BF00FF', // Nuevo color púrpura neón
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
        "neon-glow": { // Nueva animación de brillo neón
          "0%": {
            "border-color": "theme('colors.neon-red')",
            "box-shadow": "0 0 15px 5px theme('colors.neon-red')",
          },
          "25%": {
            "border-color": "theme('colors.neon-blue')",
            "box-shadow": "0 0 15px 5px theme('colors.neon-blue')",
          },
          "50%": {
            "border-color": "theme('colors.neon-green')",
            "box-shadow": "0 0 15px 5px theme('colors.neon-green')",
          },
          "75%": {
            "border-color": "theme('colors.neon-purple')",
            "box-shadow": "0 0 15px 5px theme('colors.neon-purple')",
          },
          "100%": {
            "border-color": "theme('colors.neon-red')",
            "box-shadow": "0 0 15px 5px theme('colors.neon-red')",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "neon-glow": "neon-glow 8s ease-in-out infinite", // Aplicar la animación
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;