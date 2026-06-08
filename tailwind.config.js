/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        forest: '#0F5132',
        leaf: '#20B26B',
        mint: '#EAF8F0',
        ink: '#0D1724',
        slate: '#5B667A',
        amber: '#F59E0B'
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif']
      },
      boxShadow: {
        soft: '0 24px 70px rgba(13, 23, 36, 0.12)'
      }
    }
  },
  plugins: []
};
