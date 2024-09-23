/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      spacing: {
        112: "28rem",
        128: "32rem",
        144: "36rem",
        160: "40rem",
      },
    },
  },
  plugins: [require("daisyui")],
  daisyui: {
    themes: [
      {
        light: {
          ...require("daisyui/src/theming/themes")["light"],
          primary: "#8b5cf6", // violet-500
          "base-100": "#f8fafc", // slate-50
          neutral: "#1e293b", // slate-800
        },
      },
    ],
    darkTheme: "light",
    logs: false,
  },
};
