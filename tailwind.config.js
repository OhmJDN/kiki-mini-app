/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        "primary-fixed": "#ffdbcc",
        "on-secondary-fixed": "#1c1c1a",
        "primary-container": "#b78d7a",
        "primary-fixed-dim": "#ebbda8",
        "inverse-primary": "#ebbda8",
        "outline": "#82746e",
        "surface-dim": "#dcd9d9",
        "tertiary-container": "#9e948d",
        "on-background": "#1b1c1c",
        "on-primary-fixed": "#2e1508",
        "surface-container-highest": "#e4e2e1",
        "surface-container-lowest": "#ffffff",
        "on-tertiary-container": "#342d28",
        "surface": "#fcf9f8",
        "on-primary-fixed-variant": "#603f30",
        "tertiary-fixed": "#ece0d8",
        "surface-container-high": "#eae7e7",
        "on-tertiary-fixed-variant": "#4d4540",
        "error": "#ba1a1a",
        "secondary": "#5f5e5c",
        "secondary-container": "#e2dfdc",
        "on-error": "#ffffff",
        "error-container": "#ffdad6",
        "inverse-surface": "#303030",
        "on-secondary-container": "#636260",
        "background": "#f5f0ea",
        "on-surface": "#1b1c1c",
        "surface-container": "#f0eded",
        "surface-variant": "#e4e2e1",
        "surface-container-low": "#f6f3f2",
        "on-primary-container": "#44281a",
        "tertiary": "#655d57",
        "outline-variant": "#d4c3bc",
        "secondary-fixed": "#e5e2df",
        "on-surface-variant": "#50443f",
        "primary": "#7a5646",
        "secondary-fixed-dim": "#c8c6c3",
        "on-tertiary-fixed": "#201a16",
        "surface-bright": "#fcf9f8",
        "tertiary-fixed-dim": "#d0c4bd",
        "on-tertiary": "#ffffff",
        "surface-tint": "#7a5646",
        "on-primary": "#ffffff",
        "inverse-on-surface": "#f3f0f0",
        "on-secondary": "#ffffff",
        "on-secondary-fixed-variant": "#474745",
        "on-error-container": "#93000a",
        
        // Shadcn UI base colors mapping to the new palette to keep components working
        border: "#d4c3bc", // outline-variant
        input: "#d4c3bc",
        ring: "#7a5646", // primary
        foreground: "#1b1c1c", // on-background
        popover: "#ffffff",
        "popover-foreground": "#1b1c1c",
        card: "#fcf9f8", // surface
        "card-foreground": "#1b1c1c",
        muted: "#f0eded", // surface-container
        "muted-foreground": "#636260", // on-secondary-container
        destructive: "#ba1a1a", // error
        "destructive-foreground": "#ffffff", // on-error
      },
      borderRadius: {
        lg: "0.5rem",
        md: "0.25rem",
        sm: "0.125rem",
      },
      spacing: {
        "section-padding": "48px",
        "stack-gap-md": "16px",
        "stack-gap-sm": "8px",
        "stack-gap-lg": "32px",
        "container-margin": "20px"
      },
      fontFamily: {
        "headline-md": ["Playfair Display", "serif"],
        "body-md": ["Plus Jakarta Sans", "sans-serif"],
        "body-lg": ["Plus Jakarta Sans", "sans-serif"],
        "label-sm": ["Plus Jakarta Sans", "sans-serif"],
        "label-md": ["Plus Jakarta Sans", "sans-serif"],
        "display-lg": ["Playfair Display", "serif"],
        "headline-lg": ["Playfair Display", "serif"],
        "headline-lg-mobile": ["Playfair Display", "serif"],
        sans: ["Plus Jakarta Sans", "sans-serif"],
        serif: ["Playfair Display", "serif"],
      },
      fontSize: {
        "headline-md": ["24px", { "lineHeight": "32px", "fontWeight": "500" }],
        "body-md": ["16px", { "lineHeight": "24px", "fontWeight": "400" }],
        "body-lg": ["18px", { "lineHeight": "28px", "fontWeight": "400" }],
        "label-sm": ["12px", { "lineHeight": "16px", "fontWeight": "500" }],
        "label-md": ["14px", { "lineHeight": "20px", "letterSpacing": "0.05em", "fontWeight": "600" }],
        "display-lg": ["40px", { "lineHeight": "48px", "letterSpacing": "-0.02em", "fontWeight": "600" }],
        "headline-lg": ["32px", { "lineHeight": "40px", "fontWeight": "500" }],
        "headline-lg-mobile": ["28px", { "lineHeight": "34px", "fontWeight": "500" }]
      }
    },
  },
  plugins: [require("tailwindcss-animate")],
}
