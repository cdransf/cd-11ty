const chartData = require('./json/weekly-artist-charts.json')

module.exports = async function () {
  const artists = chartData['weeklyartistchart']['artist'].splice(0, 8)
  const date = parseInt(chartData['weeklyartistchart']['@attr']['to']) * 1000
  let content = 'My top artists for the week: '
  artists.forEach((artist, index) => {
    content += `${artist['name']} @ ${artist['playcount']} play${
      parseInt(artist['playcount']) > 1 ? 's' : ''
    }`
    if (index !== artists.length - 1) content += ', '
  })
  content += ' #Music #LastFM'
  return [
    {
      title: content,
      url: `https://coryd.dev/now?ts=${date}`,
      date: new Date(date),
      description: 'My top artists for the week as a feed item.<br/><br/>',
    },
  ]
}
