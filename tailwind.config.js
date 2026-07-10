/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./views/**/*.hbs', './src/**/*.ts'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#fdf9f0',
          100: '#f8edd6',
          200: '#efd9a8',
          300: '#d4af37',
          400: '#c5a059',
          500: '#b8943f',
          600: '#a88232',
          700: '#8b6b3e',
          800: '#6f5530',
          900: '#4a3a22',
          950: '#22262a',
        },
        accent: {
          DEFAULT: '#d4af37',
          light: '#e4c078',
          dark: '#8b6b3e',
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
        'card-hover': '0 12px 40px rgba(168, 130, 50, 0.18)',
        nav: '0 2px 20px rgba(15, 23, 42, 0.06)',
      },
      backgroundImage: {
        'brand-gold':
          'linear-gradient(180deg, #e5c07b 0%, #d4af37 38%, #c5a059 68%, #8b6508 100%)',
        'brand-gold-hover':
          'linear-gradient(180deg, #efd9a8 0%, #e5c07b 28%, #d4af37 58%, #996515 100%)',
        'brand-gold-soft':
          'linear-gradient(180deg, #efd9a8 0%, #e5c07b 42%, #d4af37 100%)',
        'brand-gold-bar':
          'linear-gradient(90deg, #e5c07b 0%, #d4af37 50%, #8b6508 100%)',
        'hero-gradient':
          'linear-gradient(135deg, #22262a 0%, #8b6b3e 50%, #d4af37 100%)',
        'section-gradient':
          'linear-gradient(180deg, #f8fafc 0%, #ffffff 100%)',
      },
    },
  },
  plugins: [],
};
