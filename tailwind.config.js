/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./*.html",
    ".*.{js,ts,jsx,tsx}",
    "./public/*.js",
  ],
  theme: {
    extend: {},
  },
  plugins: [
    require('daisyui'),
  ],

  daisyui: {
    themes: [
      "light",
      "dark",
      "cyberpunk",
      "valentine",
      "aqua",
      "cupcake",
      "bumblebee",
      "emerald",
      "corporate",
      "synthwave",
      "retro",
    ],
  },

}

