/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./app/**/*.tsx'],
  theme: {
    extend: {
      colors: {
        green: '#61B372',
        red: '#EF6A5A',
        oragne: '#F7931A',

        border: 'var(--border)',
        input: 'var(--input)',
        ring: 'var(--ring)',
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        primary: {
          DEFAULT: 'var(--primary)',
          foreground: 'var(--primary-foreground)',
        },
        secondary: {
          DEFAULT: 'var(--secondary)',
          foreground: 'var(--secondary-foreground)',
        },
        destructive: {
          DEFAULT: 'var(--destructive)',
          foreground: 'var(--destructive-foreground)',
        },
        muted: {
          DEFAULT: 'var(--muted)',
          foreground: 'var(--muted-foreground)',
        },
        accent: {
          DEFAULT: 'var(--accent)',
          foreground: 'var(--accent-foreground)',
        },
        popover: {
          DEFAULT: 'var(--popover)',
          foreground: 'var(--popover-foreground)',
        },
        card: {
          DEFAULT: 'var(--card)',
          foreground: 'var(--card-foreground)',
        },
        chart: {
          1: 'var(--chart-1)',
          2: 'var(--chart-2)',
          3: 'var(--chart-3)',
          4: 'var(--chart-4)',
          5: 'var(--chart-5)',
        },
        sidebar: {
          DEFAULT: 'var(--sidebar)',
          foreground: 'var(--sidebar-foreground)',
          primary: 'var(--sidebar-primary)',
          'primary-foreground': 'var(--sidebar-primary-foreground)',
          accent: 'var(--sidebar-accent)',
          'accent-foreground': 'var(--sidebar-accent-foreground)',
          border: 'var(--sidebar-border)',
          ring: 'var(--sidebar-ring)',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      fontFamily: {
        kyiv: 'KyivTypeSerif',
      },
      keyframes: {
        'chat-icon-scale': {
          '0%': { transform: 'scale(1) rotate(0deg)' },
          '50%': { transform: 'scale(1.2) rotate(10deg)' },
          '100%': { transform: 'scale(1) rotate(0deg)' },
        },
        'float-y': {
          '0%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(10px)' },
          '100%': { transform: 'translateY(0px)' },
        },
        'float-x': {
          '0%': { transform: 'translateX(0px)' },
          '50%': { transform: 'translateX(10px)' },
          '100%': { transform: 'translateX(0px)' },
        },
        'float-right': {
          '0%': { transform: 'translateX(0px)' },
          '50%': { transform: 'translateX(15px)' },
          '100%': { transform: 'translateX(0px)' },
        },
        'star-rotate': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        'star-float': {
          '0%': { transform: 'translate(0px, 0px) rotate(0deg)' },
          '50%': { transform: 'translate(5px, 5px) rotate(10deg)' },
          '100%': { transform: 'translate(0px, 0px) rotate(0deg)' },
        },
        scroll: {
          '0%, 50%': { transform: 'translateY(0)' },
          '100%': { transform: 'translateY(-50%)' },
        },
        breathingBorder: {
          '0%, 100%': {
            'box-shadow': '0 0 6px 2px rgba(59, 130, 246, 0.4)',
          },
          '50%': {
            'box-shadow': '0 0 12px 4px rgba(59, 130, 246, 1)',
          },
        },
        'glow-ping': {
          '0%': {
            transform: 'scale(1)',
            opacity: '0.6',
          },
          '100%': {
            transform: 'scale(2)',
            opacity: '0',
          },
        },
        shake: {
          '0%, 10%': { transform: 'translate(0, 0)', backgroundColor: 'transparent' },
          '15%': { transform: 'translate(0, 10px)', backgroundColor: '#512da8' },
          '20%': { transform: 'translate(-10px, 10px)', backgroundColor: 'red' },
          '25%': { transform: 'translate(10px, -10px)', backgroundColor: 'blue' },
          '30%': { transform: 'translate(-10px, -10px)', backgroundColor: 'yellow' },
          '35%, 100%': { transform: 'translate(0, 0)', backgroundColor: 'transparent' },
        },
      },
      animation: {
        'chat-icon-scale': 'chat-icon-scale 3s ease-in-out infinite',
        'float-y': 'float-y 3s ease-in-out infinite',
        'float-x': 'float-x 3s ease-in-out infinite',
        'float-right': 'float-right 2s ease-in-out infinite',
        'star-rotate': 'star-rotate 8s linear infinite',
        'star-float': 'star-float 5s ease-in-out infinite',
        scroll: 'scroll 4s ease-in-out infinite',
        breathingBorder: 'breathingBorder 3s ease-in-out infinite',
        'glow-ping': 'glow-ping 2s ease-in-out infinite',
        shake: 'shake 1.5s ease-in-out infinite',
      },
    },
  },
};
