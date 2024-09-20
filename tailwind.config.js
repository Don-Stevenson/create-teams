// tailwind.config.js
module.exports = {
  purge: ['./pages/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  darkMode: false,
  theme: {
    extend: {
      colors: {
        red: {
          600: '#DC2626',
          700: '#B91C1C',
        },
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
}
