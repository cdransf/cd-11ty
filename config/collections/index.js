const { DateTime } = require('luxon')
const tagAliases = require('../data/tag-aliases.json')
const { makeYearStats, processPostFile } = require('./utils')

const tagList = (collection) => {
  const tagsSet = new Set()
  collection.getAll().forEach((item) => {
    if (!item.data.tags) return
    item.data.tags
      .filter((tag) => !['posts', 'all'].includes(tag))
      .forEach((tag) => tagsSet.add(tag))
  })
  return Array.from(tagsSet).sort()
}

const tagMap = (collection) => {
  const tags = {}
  collection.getAll().forEach((item) => {
    if (item.data.collections.posts) {
      item.data.collections.posts.forEach((post) => {
        const url = post.url.includes('http') ? post.url : `https://coryd.dev${post.url}`
        const tagString = [...new Set(post.data.tags.map((tag) => tagAliases[tag.toLowerCase()]))]
          .join(' ')
          .trim()
        if (tagString) tags[url] = tagString
      })
    }
    if (item.data.links) {
      item.data.links.forEach((link) => {
        const tagString = link['tags']
          .map((tag) => tagAliases[tag.toLowerCase()])
          .join(' ')
          .trim()
        if (tagString) tags[link.url] = tagString
      })
    }
  })
  return tags
}

const postStats = (collectionApi) => {
  const oneDayMilliseconds = 1000 * 60 * 60 * 24
  const statsObject = {
    avgDays: 0,
    avgCharacterCount: 0,
    avgCodeBlockCount: 0,
    avgParagraphCount: 0,
    avgWordCount: 0,
    totalWordCount: 0,
    totalCodeBlockCount: 0,
    postCount: 0,
    firstPostDate: new Date(),
    lastPostDate: new Date(),
    highPostCount: 0,
    years: [],
    postsByDay: {},
  }

  let avgDays = 0
  let totalDays = 0
  let totalPostCount = 0
  let totalCharacterCount = 0
  let totalCodeBlockCount = 0
  let totalParagraphCount = 0
  let totalWordCount = 0
  let yearCharacterCount = 0
  let yearCodeBlockCount = 0
  let yearParagraphCount = 0
  let yearWordCount = 0
  let yearPostCount = 0
  let yearPostDays = 0
  let highPostCount = 0
  let yearProgress = 0

  const posts = collectionApi.getFilteredByGlob('src/posts/**/*.md').sort((a, b) => {
    return a.date - b.date
  })

  const postCount = posts.length
  if (postCount < 1) {
    console.log(`No articles found`)
    return statsObject
  }

  statsObject.postCount = postCount
  statsObject.firstPostDate = posts[0].data.page.date
  statsObject.lastPostDate = posts[postCount - 1].data.page.date

  let prevPostDate = posts[0].data.page.date
  let currentYear = prevPostDate.getFullYear()

  for (let post of posts) {
    let postDate = post.data.page.date
    const dateIndexKey = `${DateTime.fromISO(postDate).year}-${DateTime.fromISO(postDate).ordinal}`
    if (!statsObject.postsByDay[dateIndexKey]) {
      statsObject.postsByDay[dateIndexKey] = 0
    }
    statsObject.postsByDay[dateIndexKey]++
    let daysBetween = (postDate - prevPostDate) / oneDayMilliseconds
    let thisYear = postDate.getFullYear()
    if (thisYear != currentYear) {
      avgDays = yearPostDays / yearPostCount
      highPostCount = Math.max(highPostCount, yearPostCount)
      yearProgress = (yearPostCount / highPostCount) * 100
      statsObject.years.push(
        makeYearStats(
          currentYear,
          yearPostCount,
          yearWordCount,
          yearCodeBlockCount,
          avgDays,
          yearCharacterCount,
          yearParagraphCount,
          yearProgress
        )
      )
      yearCharacterCount = 0
      yearCodeBlockCount = 0
      yearParagraphCount = 0
      yearWordCount = 0
      yearPostCount = 0
      yearPostDays = 0
      currentYear = thisYear
    }
    prevPostDate = postDate
    totalDays += daysBetween
    yearPostDays += daysBetween
    totalPostCount++
    yearPostCount++
    const postStats = processPostFile(post.page.inputPath)
    totalCharacterCount += postStats.characterCount
    yearCharacterCount += postStats.characterCount
    totalCodeBlockCount += postStats.codeBlockCount
    yearCodeBlockCount += postStats.codeBlockCount
    totalParagraphCount += postStats.paragraphCount
    yearParagraphCount += postStats.paragraphCount
    totalWordCount += postStats.wordCount
    yearWordCount += postStats.wordCount
  }
  if (yearPostCount > 0) {
    avgDays = yearPostDays / yearPostCount
    highPostCount = Math.max(highPostCount, yearPostCount)
    yearProgress = (yearPostCount / highPostCount) * 100
    statsObject.years.push(
      makeYearStats(
        currentYear,
        yearPostCount,
        yearWordCount,
        yearCodeBlockCount,
        avgDays,
        yearCharacterCount,
        yearParagraphCount,
        yearProgress
      )
    )
  }
  statsObject.avgDays = parseFloat((totalDays / totalPostCount).toFixed(2))
  statsObject.avgCharacterCount = parseFloat((totalCharacterCount / totalPostCount).toFixed(2))
  statsObject.avgCodeBlockCount = parseFloat((totalCodeBlockCount / totalPostCount).toFixed(2))
  statsObject.avgParagraphCount = parseFloat((totalParagraphCount / totalPostCount).toFixed(2))
  statsObject.avgWordCount = parseFloat((totalWordCount / totalPostCount).toFixed(2))
  statsObject.totalWordCount = totalWordCount
  statsObject.totalCodeBlockCount = totalCodeBlockCount
  statsObject.highPostCount = highPostCount
  return statsObject
}

module.exports = {
  tagList,
  tagMap,
  postStats,
}
