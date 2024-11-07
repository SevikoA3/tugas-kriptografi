/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary-bg': '#1c1c1c',
        'secondary-bg': '#242424',
        'accent-bg': '#dfd7af',
        'accent-hover': '#918b71',
        'text-primary': '#f5f3ed',
        'text-secondary': '#242424',
        'border-color': '#dfd7af',
      },
    },
  },
  plugins: [],
}