/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Noto Sans JP"', "sans-serif"],
      },
      colors: {
        main: "#87CEEB",
        accent: "#008B8B",
        "sub-1": "#E0E0E0",
        "sub-2": "#FFA07A",
        background: "#FFFFFF",
        text: "#333333",
        border: "#E0E0E0",
        success: "#4CAF50",
        warning: "#FFA726",
        info: "#2196F3",
        error: "#D32F2F",
      },
    },
  },
  plugins: [require("@tailwindcss/forms"), require("@tailwindcss/typography")],
};
