export default async function () {
  return {
    footer: [
      { name: 'Uses' },
      { name: 'Referrals' },
      { name: 'Blogroll' },
      { name: 'Speedlify' },
      { name: 'Stats' },
    ],
    menu: [
      { name: 'Now' },
      { name: 'About' },
      { name: 'Links', icon: 'link' },
      { name: 'Search', icon: 'search' },
      { name: 'Feeds', icon: 'rss' },
      { name: 'Mastodon', icon: 'brand-mastodon' },
      { name: 'Coffee', icon: 'coffee' },
    ],
    social: [
      { name: 'Email', url: '/contact', icon: 'at' },
      { name: 'GitHub', url: 'https://github.com/cdransf', icon: 'brand-github' },
      { name: 'npm', url: 'https://www.npmjs.com/~cdransf', icon: 'brand-npm'},
      { name: 'Mastodon', url: 'https://social.lol/@cory', icon: 'brand-mastodon' },
      { name: 'ListenBrainz', url: 'https://listenbrainz.org/user/cdransf/', icon: 'brain' },
      { name: 'Trakt', url: 'https://trakt.tv/users/cdransf', icon: 'device-tv' },
      { name: 'Instapaper', url: 'https://www.instapaper.com/p/coryd', icon: 'news' },
      { name: 'Webrings', url: '/webrings', icon: 'heart-handshake' },
    ],
  }
}
