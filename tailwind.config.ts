import type {Config} from 'tailwindcss';

export default {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        body: ['Inter', 'sans-serif'],
        headline: ['Inter', 'sans-serif'],
        code: ['monospace'],
      },
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        chart: {
          '1': 'hsl(var(--chart-1))',
          '2': 'hsl(var(--chart-2))',
          '3': 'hsl(var(--chart-3))',
          '4': 'hsl(var(--chart-4))',
          '5': 'hsl(var(--chart-5))',
        },
        'tag-red': 'hsl(var(--tag-red))',
        'tag-red-foreground': 'hsl(var(--tag-red-foreground))',
        'tag-orange': 'hsl(var(--tag-orange))',
        'tag-orange-foreground': 'hsl(var(--tag-orange-foreground))',
        'tag-amber': 'hsl(var(--tag-amber))',
        'tag-amber-foreground': 'hsl(var(--tag-amber-foreground))',
        'tag-yellow': 'hsl(var(--tag-yellow))',
        'tag-yellow-foreground': 'hsl(var(--tag-yellow-foreground))',
        'tag-lime': 'hsl(var(--tag-lime))',
        'tag-lime-foreground': 'hsl(var(--tag-lime-foreground))',
        'tag-green': 'hsl(var(--tag-green))',
        'tag-green-foreground': 'hsl(var(--tag-green-foreground))',
        'tag-cyan': 'hsl(var(--tag-cyan))',
        'tag-cyan-foreground': 'hsl(var(--tag-cyan-foreground))',
        'tag-blue': 'hsl(var(--tag-blue))',
        'tag-blue-foreground': 'hsl(var(--tag-blue-foreground))',
        'tag-violet': 'hsl(var(--tag-violet))',
        'tag-violet-foreground': 'hsl(var(--tag-violet-foreground))',
        'tag-fuchsia': 'hsl(var(--tag-fuchsia))',
        'tag-fuchsia-foreground': 'hsl(var(--tag-fuchsia-foreground))',
        'tag-black': 'hsl(var(--tag-black))',
        'tag-black-foreground': 'hsl(var(--tag-black-foreground))',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        'accordion-down': {
          from: {
            height: '0',
          },
          to: {
            height: 'var(--radix-accordion-content-height)',
          },
        },
        'accordion-up': {
          from: {
            height: 'var(--radix-accordion-content-height)',
          },
          to: {
            height: '0',
          },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
  plugins: [require('tailwindcss-animate'), require('@tailwindcss/typography')],
} satisfies Config;
