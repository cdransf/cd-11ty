const { getFirstAttachment } = require('../../config/filters')
const md = require('markdown-it')()
const str = require('string-strip-html')

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
      description: (data) => str.stripHtml(md.render(data.post_excerpt)).result,
      url: (data) => data.url,
      image: {
        src: (data) => data.post | getFirstAttachment,
      },
      author: {
        name: 'Cory Dransfeldt',
      },
      published: (data) => data.date,
    },
  },
}
