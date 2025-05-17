module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: '#FFD600', // yellow
        accent: '#222',    // black
        cream: '#FFF8F0',  // creamy background
      },
      fontFamily: {
        script: ['Pacifico', 'cursive'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}; 