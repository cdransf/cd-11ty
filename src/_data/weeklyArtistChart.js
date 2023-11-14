const chartData = require('./json/weekly-artist-charts.json')

module.exports = async function () {
  const artists = chartData['weeklyartistchart']['artist'].splice(0, 8)
  const date = parseInt(chartData['weeklyartistchart']['@attr']['to']) * 1000
  let content = 'My top artists for the week:\n'
  artists.forEach((artist) => {
    content += `#${artist['@attr']['rank']} ${artist['name']}: ${artist['playcount']} plays\n`
  })
  content += '#Music #LastFM'
  return [
    {
      title: content,
      url: `https://last.fm/user/coryd_?ts=${date}`,
      date: new Date(date),
      description: 'My top artists for the week as a feed item.\n\n',
    },
  ]
}
