import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Webflow Primary
        primary: {
          DEFAULT: "var(--primary)", // #146ef5
          hover: "#0055d4",
        },
        // Webflow Secondary / Accent
        secondary: {
          DEFAULT: "var(--secondary)", // #7a3dff
          pink: "var(--wf-pink)",
          green: "var(--wf-green)",
          orange: "var(--wf-orange)",
          yellow: "var(--wf-yellow)",
        },
        // Webflow Neutrals
        background: {
          DEFAULT: "var(--background)",
          card: "var(--card)",
        },
        text: {
          DEFAULT: "var(--foreground)", // #080808
          muted: "var(--muted-foreground)",
        },
        border: {
          DEFAULT: "var(--border)",
        },
        // Status Colors
        success: "#00d722",
        warning: "#ffae13",
        error: "#ee1d36",
      },
      boxShadow: {
        wf: "var(--shadow-wf)",
        xs: "none",
        sm: "none",
        DEFAULT: "none",
        md: "none",
        lg: "none",
        xl: "none",
        "2xl": "none",
        inner: "none",
      },
      borderRadius: {
        wf: "var(--radius)",
      },
      backgroundImage: {
        "wf-gradient": "linear-gradient(135deg, var(--primary), var(--secondary))",
      },

    },
  },
  plugins: [],
};

export default config;
