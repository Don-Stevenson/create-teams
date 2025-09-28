/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',

    // Or if using `src` directory:
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    screens: {
      xs: '374px',
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1536px',
    },
    fontSize: {
      '3xs': '0.55rem',
      xxs: '0.65rem',
      xs: '0.7rem',
      sm: '0.8rem',
      lg: '1rem',
      xl: '1.2rem',
      '2xl': '1.6rem',
      '3xl': '1.8rem',
    },
    extend: {
      fontFamily: {
        oswald: ['var(--font-oswald)', 'sans-serif'],
      },
      colors: {
        background: '#F3F4F6',
        loonsRed: '#C42728',
        loonsBrown: '#613A14',
        loonsDarkBrown: '#411B0C',
        loonsBeige: '#C4B098',
      },
      screens: {
        print: { raw: 'print' },
        screen: { raw: 'screen' },
      },
    },
  },
  plugins: [],
}
