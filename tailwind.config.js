/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--color-background)",
        foreground: "var(--color-text)",
        primary: {
          DEFAULT: "var(--color-primary)",
          foreground: "var(--color-text)",
        },
        secondary: {
          DEFAULT: "var(--color-secondary)",
          foreground: "var(--color-text)",
        },
        accent: {
          DEFAULT: "var(--color-accent)",
          foreground: "var(--color-text)",
        },
      },
    },
  },
  plugins: [],
}
