import type { Config } from 'tailwindcss';
import plugin from 'tailwindcss/plugin';
import animate from 'tailwindcss-animate';

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/**/*.{ts,tsx,js,jsx,mdx}',
    './content/**/*.{md,mdx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}'
  ],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: '1.5rem',
        lg: '3rem'
      },
      screens: {
        '2xl': '1400px'
      }
    },
    extend: {
      colors: {
        sand: {
          25: '#f9f6f1',
          50: '#f4efe7',
          100: '#e8dfcf',
          200: '#d7c4ab',
          300: '#c4a788',
          400: '#ad8764',
          500: '#95694b',
          600: '#7a523a',
          700: '#62412f',
          800: '#4a3225',
          900: '#362419',
          950: '#21160f'
        },
        amber: {
          50: '#fff8e7',
          100: '#ffedc4',
          200: '#fed888',
          300: '#fcb64f',
          400: '#f59420',
          500: '#e97b0a',
          600: '#c76005',
          700: '#9e4808',
          800: '#7e380c',
          900: '#672d0d',
          950: '#3b1604'
        },
        charcoal: {
          50: '#f6f7f8',
          100: '#e8eaec',
          200: '#cdd1d7',
          300: '#a4abb5',
          400: '#7d8794',
          500: '#606c79',
          600: '#465261',
          700: '#313c47',
          800: '#222a33',
          900: '#151b21',
          950: '#0b0e11'
        },
        honey: {
          50: '#FFFBF0',
          100: '#FEF3C7',
          200: '#FDE68A',
          300: '#FCD34D',
          400: '#F59E0B',
          500: '#E9A30A',
          600: '#D97706',
          700: '#B45309',
          800: '#92400E',
          900: '#78350F',
          light: '#fcd77e',
          DEFAULT: '#e9a30a',
          dark: '#b37a05',
          glow: '#f5c842'
        },
        earth: {
          50: '#FAF7F2',
          100: '#F0E9DC',
          200: '#DDD0BC',
          300: '#C4B299',
          400: '#B8A08A',
          500: '#95826B',
          600: '#8B6F55',
          700: '#6F573F',
          800: '#5C4533',
          900: '#3D2B1F'
        },
        stone: {
          50:  '#FAFAF9',
          100: '#F5F5F4',
          200: '#E7E5E4',
          300: '#D6D3D1',
          400: '#A8A29E',
          500: '#78716C',
          600: '#57534E',
          700: '#44403C',
          800: '#292524',
          900: '#1C1917'
        },
        atlas: {
          50: '#effaf5',
          100: '#d1f2e1',
          200: '#a7e3c6',
          300: '#70cea6',
          400: '#3cb384',
          500: '#1f986d',
          600: '#127a58',
          700: '#0d6248',
          800: '#0d4e3b',
          900: '#0b4032',
          950: '#05241d'
        },
        terracotta: {
          50: '#fef3ee',
          100: '#fde4d5',
          200: '#fac5aa',
          300: '#f69d74',
          400: '#f1723c',
          500: '#ed5117',
          600: '#de370d',
          700: '#b8270d',
          800: '#922112',
          900: '#761e12'
        }
      },
      borderRadius: {
        'xl': '14px',
        '2xl': '18px',
        '3xl': '24px',
        '4xl': '32px',
        '5xl': '40px',
        lg: 'var(--radius-lg)',
        md: 'var(--radius-md)',
        sm: 'var(--radius-sm)'
      },
      fontFamily: {
        display: ['var(--font-display)', 'serif'],
        sans: ['var(--font-sans)', 'system-ui'],
        arabic: ['"Noto Sans Arabic"', 'system-ui']
      },
      fontSize: {
        'hero': ['clamp(2.5rem, 5vw + 1rem, 4.5rem)', { lineHeight: '1.08', letterSpacing: '-0.02em' }],
        'display': ['clamp(2rem, 4vw + 0.5rem, 3.5rem)', { lineHeight: '1.12', letterSpacing: '-0.015em' }],
        'heading': ['clamp(1.5rem, 2.5vw + 0.5rem, 2.25rem)', { lineHeight: '1.2', letterSpacing: '-0.01em' }],
      },
      boxShadow: {
        glass: '0 16px 40px -16px rgba(18, 12, 8, 0.18), 0 2px 8px -2px rgba(18, 12, 8, 0.08)',
        elevated: '0 32px 80px -24px rgba(18, 12, 8, 0.2), 0 4px 12px -4px rgba(18, 12, 8, 0.06)',
        card: '0 20px 50px -20px rgba(18, 12, 8, 0.15)',
        'card-hover': '0 28px 60px -16px rgba(18, 12, 8, 0.22)',
        glow: '0 0 40px -8px rgba(233, 163, 10, 0.3)',
        'glow-lg': '0 0 80px -16px rgba(233, 163, 10, 0.2)',
        inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.04)'
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' }
        },
        'pulse-glow': {
          '0%, 100%': { opacity: '0.4' },
          '50%': { opacity: '0.8' }
        },
        'slide-up': {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to: { opacity: '1', transform: 'translateY(0)' }
        },
        'slide-down': {
          from: { opacity: '0', transform: 'translateY(-12px)' },
          to: { opacity: '1', transform: 'translateY(0)' }
        }
      },
      animation: {
        float: 'float 8s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 3s ease-in-out infinite',
        'slide-up': 'slide-up 0.4s ease-out',
        'slide-down': 'slide-down 0.4s ease-out'
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
        '30': '7.5rem'
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-honey': 'linear-gradient(135deg, #fcd77e 0%, #e9a30a 50%, #b37a05 100%)',
        'gradient-atlas': 'linear-gradient(135deg, #d1f2e1 0%, #1f986d 50%, #0d4e3b 100%)',
        'gradient-sand': 'linear-gradient(180deg, #f9f6f1 0%, #e8dfcf 100%)',
      },
      transitionTimingFunction: {
        'out-expo': 'cubic-bezier(0.16, 1, 0.3, 1)',
      }
    }
  },
  safelist: ['dir-rtl', 'dir-ltr'],
  plugins: [
    plugin(({ addVariant }) => {
      addVariant('rtl', '[dir="rtl"] &');
      addVariant('ltr', '[dir="ltr"] &');
    }),
    animate
  ]
};

export default config;
