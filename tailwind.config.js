export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1B4F72',
          dark: '#154360',
        },
        secondary: '#2E86C1',
        accent: '#F39C12',
        success: '#27AE60',
        danger: '#C0392B',
        background: '#F4F6F9',
        sidebar: {
          DEFAULT: '#1B2631',
          text: '#ECF0F1'
        }
      },
      fontFamily: {
        poppins: ['Poppins', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
        mono: ['Roboto Mono', 'monospace'],
      }
    },
  },
  plugins: [],
}
