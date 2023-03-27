const defaultTheme = require('tailwindcss/defaultTheme')
const dracula = require('tailwind-dracula/colors')

module.exports = {
  darkMode: 'class',
  theme: {
    extend: {
      spacing: {
        '9/16': '56.25%',
      },
      lineHeight: {
        11: '2.75rem',
        12: '3rem',
        13: '3.25rem',
        14: '3.5rem',
      },
      fontFamily: {
        sans: ['InterVariable', ...defaultTheme.fontFamily.sans],
      },
      colors: {
        ...dracula,
        primary: dracula.purple,
        gray: dracula.darker,
        blue: dracula.blue,
        cyan: dracula.cyan,
        green: dracula.green,
        orange: dracula.orange,
        pink: dracula.pink,
        purple: dracula.purple,
        red: dracula.red,
        yellow: dracula.yellow,
        dark: dracula.dark,
        darker: dracula.darker,
        light: dracula.light,
      },
      backgroundImage: {
        'cover-gradient':
          'linear-gradient(180deg,transparent 0,rgba(0,0,0,.15) 70%,rgba(0,0,0,.5))',
      },
      typography: (theme) => ({
        DEFAULT: {
          css: {
            a: {
              color: theme('colors.primary.500'),
              '&:hover': {
                color: `${theme('colors.primary.400')} !important`,
              },
              code: { color: theme('colors.primary.400') },
            },
            pre: {
              backgroundColor: theme('colors.gray.900'),
              border: `1px solid ${theme('colors.gray.700')}`,
            },
            code: {
              color: `${theme('colors.gray.50')} !important`,
              backgroundColor: theme('colors.gray.900'),
              borderRadius: '0.25rem',
              padding: '0.25rem',
            },
          },
        },
      }),
    },
  },
  corePlugins: {
    aspectRatio: false,
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('tailwind-dracula')('dracula'),
    require('@tailwindcss/aspect-ratio'),
  ],
  content: ['./src/**/*.md', './src/**/*.html', './src/_includes/**/*.liquid'],
}
