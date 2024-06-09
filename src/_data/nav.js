export default async function () {
  return {
    footer: [
      { name: 'Now' },
      { name: 'Uses' },
      { name: 'Blogroll' },
    ],
    menu: [
      { name: 'Posts', url: '/posts', icon: 'article'},
      { name: 'Music', url: '/music', icon: 'headphones' },
      { name: 'Watching', url: '/watching', icon: 'device-tv' },
      { name: 'Books', url: '/books', icon: 'books' },
      { name: 'Links', icon: 'link' },
      { name: 'About', url: '/about', icon: 'info-square' },
      { name: 'Search', icon: 'search' },
      { name: 'Feeds', icon: 'rss' },
      { name: 'Mastodon', icon: 'brand-mastodon' },
    ],
    social: [
      { name: 'Email', url: '/contact', icon: 'at' },
      { name: 'GitHub', url: 'https://github.com/cdransf', icon: 'brand-github' },
      { name: 'npm', url: 'https://www.npmjs.com/~cdransf', icon: 'brand-npm'},
      { name: 'Mastodon', url: 'https://social.lol/@cory', icon: 'brand-mastodon' },
      { name: 'ListenBrainz', url: 'https://listenbrainz.org/user/cdransf/', icon: 'brain' },
      { name: 'Instapaper', url: 'https://www.instapaper.com/p/coryd', icon: 'news' },
      { name: 'Coffee', url: 'https://buymeacoffee.com/cory', icon: 'coffee' },
      { name: 'Webrings', url: '/webrings', icon: 'heart-handshake' },
    ],
  }
}
