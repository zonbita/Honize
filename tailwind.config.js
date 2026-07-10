/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./views/**/*.hbs', './src/**/*.ts'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef6ff',
          100: '#d9ebff',
          200: '#bcdbff',
          300: '#8ec4ff',
          400: '#59a3ff',
          500: '#3380ff',
          600: '#1a5ff5',
          700: '#144be1',
          800: '#173eb6',
          900: '#19388f',
          950: '#142357',
        },
        accent: {
          DEFAULT: '#f59e0b',
          light: '#fbbf24',
          dark: '#d97706',
        },
        surface: {
          DEFAULT: '#ffffff',
          muted: '#f8fafc',
          dark: '#0f172a',
        },
      },
      fontFamily: {
        sans: ['"Be Vietnam Pro"', 'system-ui', 'sans-serif'],
        display: ['"Be Vietnam Pro"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 4px 24px rgba(15, 23, 42, 0.08)',
        'card-hover': '0 12px 40px rgba(26, 95, 245, 0.15)',
        nav: '0 2px 20px rgba(15, 23, 42, 0.06)',
      },
      backgroundImage: {
        'hero-gradient':
          'linear-gradient(135deg, #142357 0%, #1a5ff5 50%, #3380ff 100%)',
        'section-gradient':
          'linear-gradient(180deg, #f8fafc 0%, #ffffff 100%)',
      },
    },
  },
  plugins: [],
};
