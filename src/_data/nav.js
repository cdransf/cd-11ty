module.exports = async function () {
  return {
    footer: [{ name: 'Uses' }, { name: 'Referrals' }, { name: 'Blogroll' }],
    menu: [
      { name: 'Now' },
      { name: 'About' },
      { name: 'Tags', icon: 'tags' },
      { name: 'Search', icon: 'search' },
      { name: 'Feeds', icon: 'rss' },
      { name: 'Mastodon', icon: 'brand-mastodon' },
      { name: 'Coffee', icon: 'cup' },
    ],
    social: [
      { name: 'Email', url: 'mailto:cory.dransfeldt@gmail.com', icon: 'brand-gmail' },
      { name: 'GitHub', url: 'https://github.com/cdransf', icon: 'brand-github' },
      { name: 'Mastodon', url: 'https://social.lol/@cory', icon: 'brand-mastodon' },
      { name: 'Last.fm', url: 'https://www.last.fm/user/coryd_', icon: 'brand-lastfm' },
      { name: 'Trakt', url: 'https://trakt.tv/users/cdransf', icon: 'device-tv' },
      { name: 'The StoryGraph', url: 'https://app.thestorygraph.com/profile/coryd', icon: 'books' },
      { name: 'Buy Me a Coffee', url: 'https://www.buymeacoffee.com/cory', icon: 'cup' },
      { name: 'Webrings', url: '/webrings', icon: 'heart-handshake' },
    ],
  }
}
