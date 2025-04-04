import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./client/index.html", "./client/src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(35, 95%, 97%)",
          foreground: "hsl(35, 20%, 20%)",
        },
        popover: {
          DEFAULT: "hsl(35, 95%, 97%)",
          foreground: "hsl(35, 20%, 20%)",
        },
        primary: {
          DEFAULT: "hsl(35, 95%, 60%)",
          foreground: "hsl(35, 20%, 20%)",
        },
        secondary: {
          DEFAULT: "hsl(35, 30%, 91%)",
          foreground: "hsl(35, 20%, 20%)",
        },
        muted: {
          DEFAULT: "hsl(35, 30%, 91%)",
          foreground: "hsl(35, 15%, 40%)",
        },
        accent: {
          DEFAULT: "hsl(35, 30%, 91%)",
          foreground: "hsl(35, 20%, 20%)",
        },
        destructive: {
          DEFAULT: "hsl(0, 80%, 60%)",
          foreground: "hsl(0, 0%, 98%)",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        chart: {
          "1": "hsl(var(--chart-1))",
          "2": "hsl(var(--chart-2))",
          "3": "hsl(var(--chart-3))",
          "4": "hsl(var(--chart-4))",
          "5": "hsl(var(--chart-5))",
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
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
} satisfies Config;
