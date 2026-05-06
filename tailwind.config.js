/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'sym-red':    '#DC2626',
        'sym-red-d':  '#991B1B',
        'sym-red-l':  '#EF4444',
        'sym-dark':   '#06060F',
        'sym-surf':   '#0D0D1F',
        'sym-card':   '#13132A',
        'sym-bord':   '#1F1F3E',
        'sym-blue':   '#3B82F6',
      },
      animation: {
        'gradient': 'gradient 10s ease infinite',
        'float':    'float 6s ease-in-out infinite',
        'fadein':   'fadein 0.6s ease forwards',
        'slideup':  'slideup 0.5s ease forwards',
      },
      keyframes: {
        gradient: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%':      { backgroundPosition: '100% 50%' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-12px)' },
        },
        fadein: {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
        slideup: {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
