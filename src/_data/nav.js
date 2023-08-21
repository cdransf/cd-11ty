module.exports = async function () {
  return {
    footer: [{ name: 'Uses' }, { name: 'Referrals' }],
    menu: [
      { name: 'Now' },
      { name: 'About' },
      { name: 'Tags', icon: 'tags' },
      { name: 'Search', icon: 'search' },
      { name: 'Feeds', icon: 'rss' },
      { name: 'Webrings', icon: 'heart-handshake' },
    ],
    social: [
      { name: 'Email', url: 'mailto:cory.dransfeldt@gmail.com', icon: 'brand-gmail' },
      { name: 'GitHub', url: 'https://github.com/cdransf', icon: 'brand-github' },
      { name: 'Mastodon', url: 'https://social.lol/@cory', icon: 'brand-mastodon' },
      { name: 'Last.fm', url: 'https://www.last.fm/user/cdrn_', icon: 'brand-lastfm' },
      {
        name: 'Spotify',
        url: 'https://open.spotify.com/user/mdh0acvmvfsbunzt6ywnq2tg3',
        icon: 'brand-spotify',
      },
      { name: 'Letterboxd', url: 'https://letterboxd.com/cdme', icon: 'brand-letterboxd' },
      { name: 'Trakt', url: 'https://trakt.tv/users/cdransf', icon: 'device-tv' },
      { name: 'Goodreads', url: 'https://www.goodreads.com/cdransf', icon: 'books' },
      { name: 'Buy Me a Coffee', url: 'https://www.buymeacoffee.com/cory', icon: 'cup' },
    ],
    resume: [
      { name: 'GitHub', url: 'https://github.com/cdransf', icon: 'brand-github' },
      { name: 'LinkedIn', url: 'https://www.linkedin.com/in/cdransf/', icon: 'brand-linkedin' },
      { name: 'SavvyCal', url: 'https://savvycal.com/coryd/quick-call', icon: 'calendar-plus' },
    ],
  }
}
