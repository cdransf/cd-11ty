const defaultTheme = require('tailwindcss/defaultTheme')

module.exports = {
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
        mono: ['ui-monospace', 'SFMono-Regular', ...defaultTheme.fontFamily.mono],
      },
      backgroundImage: {
        'cover-gradient':
          'linear-gradient(180deg,transparent 0,rgba(0,0,0,.15) 70%,rgba(0,0,0,.5))',
      },
    },
  },
  corePlugins: {
    aspectRatio: false,
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('@tailwindcss/line-clamp'),
    require('@catppuccin/tailwindcss', {
      defaultFlavour: 'mocha',
    }),
    require('@tailwindcss/aspect-ratio'),
  ],
  content: ['./src/**/*.md', './src/**/*.html', './src/_includes/**/*.liquid'],
}
