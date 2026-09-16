/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        void: '#000000',
        surface: '#0A0A0A',
        elevated: '#141414',
        'accent-primary': '#39C5CF',
        'accent-glow': '#6CD9E0',
        'accent-rose': '#F43F5E',
        'accent-amber': '#F59E0B',
        'text-primary': '#FAFAFA',
        'text-secondary': '#A0A0A0',
        'text-muted': '#555555',
        'border-subtle': '#1F1F1F',
        'border-glow': 'rgba(57,197,207,0.3)',
      },
      maxWidth: {
        '7xl': '96rem', // 1536px (20% increase: 10% on each side from standard 80rem / 1280px)
      },
      fontFamily: {
        display: ['Oswald', 'Inter', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
        label: ['Lato', 'sans-serif'],
      },
      borderRadius: {
        input: '4px',
        card: '8px',
        modal: '12px',
        hero: '16px',
      },
      boxShadow: {
        glow: '0 0 24px rgba(57,197,207,0.25)',
        'glow-sm': '0 0 12px rgba(57,197,207,0.15)',
      },
      animation: {
        shimmer: 'shimmer 2s infinite linear',
        'fade-in': 'fadeIn 0.3s ease',
        'slide-up': 'slideUp 0.3s ease',
        'slide-in-right': 'slideInRight 0.3s ease',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(16px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
      },
    },
  },
  plugins: [],
};
