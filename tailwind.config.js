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
        sans: [
          'Seravek',
          'Gill Sans Nova',
          'Ubuntu',
          'Calibri',
          'DejaVu Sans',
          'source-sans-pro',
          'sans-serif',
        ],
        mono: ['ml', ...defaultTheme.fontFamily.mono],
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
    require('@catppuccin/tailwindcss'),
    require('@tailwindcss/aspect-ratio'),
    require('tailwind-scrollbar'),
  ],
  content: ['./src/**/*.md', './src/**/*.html', './src/_includes/**/*.liquid'],
}
