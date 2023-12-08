const chartData = require('./json/weekly-artist-charts.json')
const charts = chartData['charts']

module.exports = async function () {
  return charts.map((chart) => {
    const artists = chart['weeklyartistchart']['artist'].splice(0, 8)
    const date = parseInt(chart['weeklyartistchart']['@attr']['to']) * 1000
    let content = 'My top artists for the week: '
    artists.forEach((artist, index) => {
      const artistName = artist['name'].replace('&', '&amp;');
      content += `${artistName} @ ${artist['playcount']} play${
        parseInt(artist['playcount']) > 1 ? 's' : ''
      }`
      if (index !== artists.length - 1) content += ', '
    })
    content += ' #Music #LastFM'
    return {
      title: content,
      url: `https://coryd.dev/now?ts=${date}`,
      date: new Date(date),
      description: `My top artists for the last week, ending ${
        new Date(date).toLocaleString().split(',')[0]
      }.<br/><br/>`,
    }
  })
}
