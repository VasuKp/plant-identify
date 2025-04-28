import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      keyframes: {
        'leaf-spin': {
          '0%': { 
            transform: 'rotate(0deg) scale(1)',
            opacity: '1'
          },
          '50%': {
            transform: 'rotate(180deg) scale(0.95)',
            opacity: '0.8'
          },
          '100%': { 
            transform: 'rotate(360deg) scale(1)',
            opacity: '1'
          }
        },
        bounce: {
          '0%, 100%': {
            transform: 'translateY(-25%)',
            animationTimingFunction: 'cubic-bezier(0.8, 0, 1, 1)'
          },
          '50%': {
            transform: 'translateY(0)',
            animationTimingFunction: 'cubic-bezier(0, 0, 0.2, 1)'
          }
        },
        'dot-bounce': {
          '0%, 100%': {
            transform: 'translateY(-25%)',
            opacity: '0.5'
          },
          '50%': {
            transform: 'translateY(0)',
            opacity: '1'
          }
        }
      },
      animation: {
        'spin-slow': 'leaf-spin 3s ease-in-out infinite',
        'bounce': 'bounce 1s infinite',
        'dot-bounce-1': 'dot-bounce 1s infinite -0.3s',
        'dot-bounce-2': 'dot-bounce 1s infinite -0.15s',
        'dot-bounce-3': 'dot-bounce 1s infinite'
      }
    }
  },
  plugins: [],
}

export default config