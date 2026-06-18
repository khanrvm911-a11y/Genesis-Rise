/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'sl-black': '#000000',
        'sl-dark': '#090214',
        'sl-darker': '#04010a',
        'sl-red': '#ef4444',
        'sl-red-light': '#f87171',
        'sl-red-dark': '#dc2626',
        'sl-blood': '#991b1b',
        'sl-gray': '#1e1b29',
        'sl-gray-light': '#a78bfa',
        'sl-gray-dark': '#0c071a',
        'sl-blue': '#3b82f6',
        'sl-blue-light': '#60a5fa',
        'sl-purple': '#8b5cf6',
        'sl-purple-light': '#c084fc',
      },
      backgroundImage: {
        'sl-gradient': 'linear-gradient(to bottom, #0f051d, #07010f, #000000)',
        'sl-gradient-red': 'linear-gradient(to bottom, #ef4444, #dc2626)',
        'sl-gradient-blue': 'linear-gradient(to bottom, #3b82f6, #60a5fa)',
        'sl-gradient-purple': 'linear-gradient(to bottom, #8b5cf6, #c084fc)',
        'sl-pattern': "url('data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"100\" height=\"100\" viewBox=\"0 0 100 100\"><rect width=\"100\" height=\"100\" fill=\"none\"/><path d=\"M10,10 L90,90 M90,10 L10,90\" stroke=\"%238b5cf6\" stroke-width=\"0.5\" opacity=\"0.07\"/></svg>')",
      },
      boxShadow: {
        'sl-glow': '0 0 20px rgba(139, 92, 246, 0.35)',
        'sl-glow-red': '0 0 25px rgba(239, 68, 68, 0.45)',
        'sl-glow-blue': '0 0 20px rgba(59, 130, 246, 0.3)',
        'sl-glow-purple': '0 0 25px rgba(139, 92, 246, 0.5)',
        'sl-inner': 'inset 0 0 10px rgba(139, 92, 246, 0.25)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'pulse-red': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        glow: {
          '0%, 100%': { boxShadow: '0 0 5px rgba(239, 68, 68, 0.5)' },
          '50%': { boxShadow: '0 0 20px rgba(239, 68, 68, 0.8)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
      borderRadius: {
        'sl-lg': '1rem',
        'sl-xl': '1.5rem',
      },
      transitionDuration: {
        '2000': '2000ms',
      },
    },
  },
  plugins: [],
}
