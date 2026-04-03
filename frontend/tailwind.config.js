/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        brand: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#172554',
        },
      },
      boxShadow: {
        soft: '0 18px 50px rgba(15, 23, 42, 0.12)',
        glow: '0 0 0 1px rgba(96, 165, 250, 0.2), 0 20px 60px rgba(37, 99, 235, 0.18)',
      },
      backgroundImage: {
        'radial-soft': 'radial-gradient(circle at top, rgba(59,130,246,.22), transparent 42%)',
        'hero-grid': 'linear-gradient(rgba(148,163,184,.08) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,.08) 1px, transparent 1px)',
      },
      keyframes: {
        floatSlow: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        fadeUp: {
          '0%': { opacity: 0, transform: 'translateY(18px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
      },
      animation: {
        floatSlow: 'floatSlow 8s ease-in-out infinite',
        fadeUp: 'fadeUp .6s ease-out both',
      },
    },
  },
  plugins: [],
};
