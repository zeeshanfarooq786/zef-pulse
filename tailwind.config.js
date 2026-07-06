/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: '#1A1D22',
          700: '#22262D',
          600: '#2B2F37',
        },
        canvas: '#F6F4EF',
        paper: '#FFFFFF',
        line: '#E4E0D6',
        brand: {
          DEFAULT: '#0A66C2',
          soft: '#3B82D6',
          dim: '#0224B1',
          tint: '#EAF1FF',
        },
        ok: '#3F7A4C',
        err: '#B4402B',
      },
      fontFamily: {
        display: ['Fraunces', 'ui-serif', 'Georgia', 'serif'],
        body: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      borderRadius: {
        sm: '4px',
        DEFAULT: '8px',
        lg: '14px',
      },
    },
  },
  plugins: [],
};
