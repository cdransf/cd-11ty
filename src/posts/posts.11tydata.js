const md = require('markdown-it')()
const striptags = require('striptags')

module.exports = {
  eleventyComputed: {
    meta: {
      site: {
        name: 'Cory Dransfeldt',
        description:
          "I'm a software developer in Camarillo, California. I enjoy hanging out with my beautiful family and 4 rescue dogs, technology, automation, music, writing, reading and tv and movies.",
        url: 'https://coryd.dev',
        logo: {
          src: 'https://coryd.dev/assets/img/logo.webp',
          width: 2000,
          height: 2000,
        },
      },
      language: 'en-US',
      title: (data) => data.title,
      description: (data) => striptags(md.render(data.post_excerpt)),
      url: (data) => data.url,
      image: {
        src: '/assets/img/social-card.png',
      },
      author: {
        name: 'Cory Dransfeldt',
      },
      published: (data) => data.date,
    },
  },
}
