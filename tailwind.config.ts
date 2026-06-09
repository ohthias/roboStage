/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],

  theme: {
    extend: {
      keyframes: {
        float: {
          "0%,100%": {
            transform: "translateY(0px)",
          },
          "50%": {
            transform: "translateY(-12px)",
          },
        },

        pulseSoft: {
          "0%,100%": {
            opacity: "0.4",
          },
          "50%": {
            opacity: "0.9",
          },
        },

        shimmer: {
          "0%": {
            transform: "translateX(-100%)",
          },
          "100%": {
            transform: "translateX(300%)",
          },
        },
      },

      animation: {
        "spin-slow": "spin 60s linear infinite",
        float: "float 6s ease-in-out infinite",
        "pulse-soft": "pulseSoft 4s ease-in-out infinite",
        shimmer: "shimmer 4s linear infinite",
      },
    },
  },

  plugins: [require("daisyui")],

  daisyui: {
    themes: ["lightScheme", "darkScheme"],
  },
};