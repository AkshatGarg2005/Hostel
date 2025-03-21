/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      "./src/**/*.{js,jsx,ts,tsx}",
    ],
    theme: {
      extend: {
        colors: {
          brown: {
            100: '#f5f0e9',
            800: '#8b4513',
          },
        },
      },
    },
    plugins: [],
  }