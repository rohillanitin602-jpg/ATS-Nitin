/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#0B0E1F',
        midnight: '#12162E',
        panel: '#1A1F3B',
        violet: {
          400: '#8B7CFF',
          500: '#7C5CFF',
          600: '#6842F0',
        },
        aqua: {
          400: '#4FE3D0',
          500: '#22D3EE',
        },
        amber: {
          400: '#FFB454',
        },
        mist: '#B7BEDE',
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        body: ['"Inter"', 'sans-serif'],
      },
      boxShadow: {
        'neu-out': '8px 8px 16px rgba(4,6,20,0.55), -8px -8px 16px rgba(46,54,94,0.25)',
        'neu-in': 'inset 6px 6px 12px rgba(4,6,20,0.55), inset -6px -6px 12px rgba(46,54,94,0.2)',
        'glass': '0 8px 32px rgba(0,0,0,0.35)',
        'glow-violet': '0 0 0 1px rgba(139,124,255,0.4), 0 8px 24px rgba(124,92,255,0.35)',
        'glow-aqua': '0 0 0 1px rgba(79,227,208,0.4), 0 8px 24px rgba(34,211,238,0.3)',
      },
      backgroundImage: {
        'aurora': 'radial-gradient(circle at 15% 20%, rgba(124,92,255,0.35), transparent 45%), radial-gradient(circle at 85% 15%, rgba(34,211,238,0.25), transparent 40%), radial-gradient(circle at 50% 90%, rgba(255,180,84,0.15), transparent 40%)',
      },
      borderRadius: {
        '2xl': '1.25rem',
        '3xl': '1.75rem',
      },
    },
  },
  plugins: [],
}
