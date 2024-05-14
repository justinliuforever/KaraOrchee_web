/** @type {import('tailwindcss').Config} */
import forms from '@tailwindcss/forms';
//import forms from './node_modules/tailwindcss/forms';
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [
    forms,
  ],
}

