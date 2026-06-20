/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Linear 风格的 cool gray — slate 替代 zinc(更冷)
        surface: {
          0: '#09090b',
          1: '#0c0c0e',
          2: '#111114',
          3: '#18181b',
          border: '#1f1f23',
          hover: '#1c1c20',
        },
        accent: {
          DEFAULT: '#6366f1',
          fg: '#a5b4fc',
          subtle: 'rgba(99,102,241,0.1)',
        },
        whimsy: {
          teal: '#14b8a6',
          'teal-soft': 'rgba(20,184,166,0.12)',
        },
        success: '#22c55e',
        danger: '#ef4444',
        warn: '#f59e0b',
      },
      fontFamily: {
        sans: [
          'Inter',
          'system-ui',
          '-apple-system',
          'Segoe UI',
          'PingFang SC',
          'Microsoft YaHei',
          'Noto Sans CJK SC',
          'Noto Sans SC',
          'sans-serif',
        ],
        mono: ['JetBrains Mono', 'Menlo', 'Consolas', 'monospace'],
      },
      borderRadius: {
        DEFAULT: '6px',
        lg: '8px',
        xl: '10px',
      },
      boxShadow: {
        modal: '0 0 0 1px rgba(0,0,0,0.4), 0 8px 24px rgba(0,0,0,0.5), 0 32px 64px rgba(0,0,0,0.6)',
        card: '0 0 0 1px rgba(255,255,255,0.04), 0 1px 2px rgba(0,0,0,0.4)',
      },
    },
  },
  plugins: [],
};
