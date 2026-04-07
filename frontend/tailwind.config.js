/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        olive: '#5b6b2d',
        tomato: '#c0392b',
        cream: '#f6f0e6',
        charcoal: '#1f1b18',
        gold: '#c9a45c',
      },
      fontFamily: {
        display: ['Georgia', 'serif'],
        body: ['ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 20px 60px rgba(31, 27, 24, 0.12)',
      },
    },
  },
  plugins: [],
};
