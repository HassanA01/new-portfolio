/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "sans-serif"],
        mono: ["var(--font-roboto-mono)", "monospace"],
      },
      colors: {
        background: "#1d1616",
        text: "#f5f5f5",
        secondaryText: "#f2efe7",
        accentDark: "#48cfcb",
        accentLight: "#229799",
      },
    },
  },
  plugins: [],
};
