// tailwind.config.js
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}", // Scan all files in the app folder
    "./pages/**/*.{js,ts,jsx,tsx}", // If you have a pages folder
    "./components/**/*.{js,ts,jsx,tsx}", // If you have a components folder
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
