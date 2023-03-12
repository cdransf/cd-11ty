const defaultTheme = require('tailwindcss/defaultTheme')
const colors = require('tailwindcss/colors')
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
                        },
                        code: {
                            backgroundColor: theme('colors.gray.900'),
                        },
                    },
                },
            }),
        },
    },
    plugins: [require('@tailwindcss/typography'), require('tailwind-dracula')('dracula')],
    content: ['./src/**/*.md', './src/**/*.html', './src/_includes/**/*.liquid'],
}
