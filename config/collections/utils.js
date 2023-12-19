const fs = require('fs')
const writingStats = require('writing-stats')

const processPostFile = (filePath) => {
  try {
    let content = fs.readFileSync(filePath, 'utf8')
    // remove front matter
    content = content.replace(/---\n.*?\n---/s, '')
    // remove empty lines
    content = content.replace(/^\s*[\r\n]/gm, '')
    const codeBlockMatches = content.match(/```(.*?)```/gis)
    const codeBlocks = codeBlockMatches ? codeBlockMatches.length : 0
    // remove code blocks
    content = content.replace(/(```.+?```)/gms, '')
    const stats = writingStats(content)
    return {
      characterCount: stats.characterCount,
      codeBlockCount: codeBlocks,
      paragraphCount: stats.paragraphCount,
      wordCount: stats.wordCount,
    }
  } catch (err) {
    console.error(err)
    return {
      characterCount: 0,
      codeBlockCount: 0,
      paragraphCount: 0,
      wordCount: 0,
    }
  }
}

const makeYearStats = (
  currentYear,
  yearPostCount,
  yearWordCount,
  yearCodeBlockCount,
  avgDays,
  yearCharacterCount,
  yearParagraphCount,
  yearProgress
) => {
  const daysInYear =
    (currentYear % 4 === 0 && currentYear % 100 > 0) || currentYear % 400 == 0 ? 366 : 365

  return {
    year: currentYear,
    daysInYear: daysInYear,
    postCount: yearPostCount,
    wordCount: yearWordCount,
    codeBlockCount: yearCodeBlockCount,
    avgDays: parseFloat(avgDays.toFixed(2)),
    avgCharacterCount: parseFloat((yearCharacterCount / yearPostCount).toFixed(2)),
    avgCodeBlockCount: parseFloat((yearCodeBlockCount / yearPostCount).toFixed(2)),
    avgParagraphCount: parseFloat((yearParagraphCount / yearPostCount).toFixed(2)),
    avgWordCount: parseFloat((yearWordCount / yearPostCount).toFixed(2)),
    yearProgress,
  }
}

module.exports = {
  processPostFile,
  makeYearStats,
}
