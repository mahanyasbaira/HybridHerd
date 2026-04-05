export default {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        glass: {
          light: 'rgba(255, 255, 255, 0.05)',
          border: 'rgba(255, 255, 255, 0.1)',
        },
      },
      fontFamily: {
        serif: ['Outfit', 'sans-serif'],
        sans: ['Manrope', 'sans-serif'],
        heading: ['Outfit', 'sans-serif'],
      },
      fontSize: {
        xs:   ['0.8125rem', { lineHeight: '1.5',  letterSpacing: '0.01em' }],
        sm:   ['0.9375rem', { lineHeight: '1.55', letterSpacing: '0' }],
        base: ['1.0625rem', { lineHeight: '1.65', letterSpacing: '0' }],
        lg:   ['1.1875rem', { lineHeight: '1.55', letterSpacing: '-0.01em' }],
        xl:   ['1.3125rem', { lineHeight: '1.4',  letterSpacing: '-0.01em' }],
        '2xl':['1.625rem',  { lineHeight: '1.3',  letterSpacing: '-0.02em' }],
        '3xl':['2rem',      { lineHeight: '1.2',  letterSpacing: '-0.02em' }],
        '4xl':['2.5rem',    { lineHeight: '1.1',  letterSpacing: '-0.03em' }],
        '5xl':['3rem',      { lineHeight: '1.05', letterSpacing: '-0.03em' }],
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'pulse-ring': {
          '0%': { boxShadow: '0 0 0 0 rgba(239, 68, 68, 0.7)' },
          '70%': { boxShadow: '0 0 0 20px rgba(239, 68, 68, 0)' },
          '100%': { boxShadow: '0 0 0 0 rgba(239, 68, 68, 0)' },
        },
        'beam-slide': {
          '0%': { strokeDashoffset: '1000' },
          '100%': { strokeDashoffset: '0' },
        },
      },
      animation: {
        float: 'float 4s ease-in-out infinite',
        'pulse-ring': 'pulse-ring 2s infinite',
        'beam-slide': 'beam-slide 3s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
