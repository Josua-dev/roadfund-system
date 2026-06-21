/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        navy:  {
          DEFAULT: '#142B57',
          dark:    '#0d1e3e',
          mid:     '#1e3f75',
          light:   '#2a5298',
          muted:   '#e8edf5',
        },
        green: {
          DEFAULT: '#00B26D',
          dark:    '#008f57',
          light:   '#00cc7d',
          muted:   '#e6f9f2',
        },
        grey: {
          50:  '#F5F6F8',
          100: '#eceef2',
          200: '#d8dce5',
          300: '#b8bfcc',
          400: '#8f98aa',
          500: '#64738a',
          600: '#4a566a',
          700: '#334155',
        },
      },
      boxShadow: {
        card: '0 1px 3px rgba(20,43,87,0.06), 0 1px 2px rgba(20,43,87,0.04)',
        'card-md': '0 4px 12px rgba(20,43,87,0.08), 0 2px 4px rgba(20,43,87,0.05)',
        'card-lg': '0 10px 30px rgba(20,43,87,0.10), 0 4px 8px rgba(20,43,87,0.06)',
      },
      borderRadius: {
        DEFAULT: '10px',
        lg: '14px',
        xl: '18px',
        '2xl': '24px',
      },
    },
  },
  plugins: [],
};
