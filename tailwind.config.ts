module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      animation: {
        'spin-slow': 'spin 60s linear infinite',
      },
    },
  },
  plugins: {
    '@tailwindcss/postcss': {},
  },
  daisyui: {},
};
