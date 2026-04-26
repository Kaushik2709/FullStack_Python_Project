/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        skyPanel: "#67aee6",
        skyPanelBorder: "#2f83cb",
      },
    },
  },
  plugins: [],
};
