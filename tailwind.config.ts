module.exports = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      keyframes: {
        fadeIn: { "0%": { opacity: 0 }, "100%": { opacity: 1 } },
        slideUp: {
          "0%": { opacity: 0, transform: "translateY(12px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
      },
      animation: {
        fadeIn: "fadeIn 0.7s ease forwards",
        slideUp: "slideUp 0.7s ease forwards",
      },
    },
  },
  plugins: [require("daisyui")],
  daisyui: {},
};
