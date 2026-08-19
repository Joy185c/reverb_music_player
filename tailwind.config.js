/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        background: '#081A14',
        surface: '#0D241C',
        accent: '#F5C518',
        primary: '#FFFFFF',
        secondary: '#9BAAA4'
      }
    },
  },
  plugins: [],
}
