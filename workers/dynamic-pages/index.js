import { createClient } from '@supabase/supabase-js'
import { parseHTML } from 'linkedom'
import markdownIt from 'markdown-it'
import truncateHtml from 'truncate-html'
import { convert } from 'html-to-text'

const md = markdownIt({ html: true, linkify: true })
const ICON_MAP = {
  alertTriangle: `<svg  xmlns="http://www.w3.org/2000/svg"  width="24"  height="24"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  stroke-width="2"  stroke-linecap="round"  stroke-linejoin="round"  class="icon icon-tabler icons-tabler-outline icon-tabler-alert-triangle"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M12 9v4" /><path d="M10.363 3.591l-8.106 13.534a1.914 1.914 0 0 0 1.636 2.871h16.214a1.914 1.914 0 0 0 1.636 -2.87l-8.106 -13.536a1.914 1.914 0 0 0 -3.274 0z" /><path d="M12 16h.01" /></svg>`,
  arrowLeft: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-arrow-left"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M5 12l14 0"/><path d="M5 12l6 6"/><path d="M5 12l6 -6"/></svg>`,
  article: `<svg  xmlns="http://www.w3.org/2000/svg"  width="24"  height="24"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  stroke-width="2"  stroke-linecap="round"  stroke-linejoin="round"  class="icon icon-tabler icons-tabler-outline icon-tabler-article"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M3 4m0 2a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2z" /><path d="M7 8h10" /><path d="M7 12h10" /><path d="M7 16h10" /></svg>`,
  books: `<svg  xmlns="http://www.w3.org/2000/svg"  width="24"  height="24"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  stroke-width="2"  stroke-linecap="round"  stroke-linejoin="round"  class="icon icon-tabler icons-tabler-outline icon-tabler-books"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M5 4m0 1a1 1 0 0 1 1 -1h2a1 1 0 0 1 1 1v14a1 1 0 0 1 -1 1h-2a1 1 0 0 1 -1 -1z" /><path d="M9 4m0 1a1 1 0 0 1 1 -1h2a1 1 0 0 1 1 1v14a1 1 0 0 1 -1 1h-2a1 1 0 0 1 -1 -1z" /><path d="M5 8h4" /><path d="M9 16h4" /><path d="M13.803 4.56l2.184 -.53c.562 -.135 1.133 .19 1.282 .732l3.695 13.418a1.02 1.02 0 0 1 -.634 1.219l-.133 .041l-2.184 .53c-.562 .135 -1.133 -.19 -1.282 -.732l-3.695 -13.418a1.02 1.02 0 0 1 .634 -1.219l.133 -.041z" /><path d="M14 9l4 -1" /><path d="M16 16l3.923 -.98" /></svg>`,
  circleCheck: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-circle-check"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0"/><path d="M9 12l2 2l4 -4"/></svg>`,
  circleX: `<svg  xmlns="http://www.w3.org/2000/svg"  width="24"  height="24"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  stroke-width="2"  stroke-linecap="round"  stroke-linejoin="round"  class="icon icon-tabler icons-tabler-outline icon-tabler-circle-x"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" /><path d="M10 10l4 4m0 -4l-4 4" /></svg>`,
  deviceSpeaker: `<svg  xmlns="http://www.w3.org/2000/svg"  width="24"  height="24"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  stroke-width="2"  stroke-linecap="round"  stroke-linejoin="round"  class="icon icon-tabler icons-tabler-outline icon-tabler-device-speaker"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M5 3m0 2a2 2 0 0 1 2 -2h10a2 2 0 0 1 2 2v14a2 2 0 0 1 -2 2h-10a2 2 0 0 1 -2 -2z" /><path d="M12 14m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0" /><path d="M12 7l0 .01" /></svg>`,
  deviceTvOld: `<svg  xmlns="http://www.w3.org/2000/svg"  width="24"  height="24"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  stroke-width="2"  stroke-linecap="round"  stroke-linejoin="round"  class="icon icon-tabler icons-tabler-outline icon-tabler-device-tv-old"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M3 7m0 2a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v9a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2z" /><path d="M16 3l-4 4l-4 -4" /><path d="M15 7v13" /><path d="M18 15v.01" /><path d="M18 12v.01" /></svg>`,
  film: `<svg  xmlns="http://www.w3.org/2000/svg"  width="24"  height="24"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  stroke-width="2"  stroke-linecap="round"  stroke-linejoin="round"  class="icon icon-tabler icons-tabler-outline icon-tabler-movie"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M4 4m0 2a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2z" /><path d="M8 4l0 16" /><path d="M16 4l0 16" /><path d="M4 8l4 0" /><path d="M4 16l4 0" /><path d="M4 12l16 0" /><path d="M16 8l4 0" /><path d="M16 16l4 0" /></svg>`,
  headphones: `<svg  xmlns="http://www.w3.org/2000/svg"  width="24"  height="24"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  stroke-width="2"  stroke-linecap="round"  stroke-linejoin="round"  class="icon icon-tabler icons-tabler-outline icon-tabler-headphones"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M4 13m0 2a2 2 0 0 1 2 -2h1a2 2 0 0 1 2 2v3a2 2 0 0 1 -2 2h-1a2 2 0 0 1 -2 -2z" /><path d="M15 13m0 2a2 2 0 0 1 2 -2h1a2 2 0 0 1 2 2v3a2 2 0 0 1 -2 2h-1a2 2 0 0 1 -2 -2z" /><path d="M4 15v-3a8 8 0 0 1 16 0v3" /></svg>`,
  heart: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-heart"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M19.5 12.572l-7.5 7.428l-7.5 -7.428a5 5 0 1 1 7.5 -6.566a5 5 0 1 1 7.5 6.572"/></svg>`,
  infoCircle: `<svg  xmlns="http://www.w3.org/2000/svg"  width="24"  height="24"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  stroke-width="2"  stroke-linecap="round"  stroke-linejoin="round"  class="icon icon-tabler icons-tabler-outline icon-tabler-info-circle"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M3 12a9 9 0 1 0 18 0a9 9 0 0 0 -18 0" /><path d="M12 9h.01" /><path d="M11 12h1v4h1" /></svg>`,
  link: `<svg  xmlns="http://www.w3.org/2000/svg"  width="24"  height="24"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  stroke-width="2"  stroke-linecap="round"  stroke-linejoin="round"  class="icon icon-tabler icons-tabler-outline icon-tabler-link"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M9 15l6 -6" /><path d="M11 6l.463 -.536a5 5 0 0 1 7.071 7.072l-.534 .464" /><path d="M13 18l-.397 .534a5.068 5.068 0 0 1 -7.127 0a4.972 4.972 0 0 1 0 -7.071l.524 -.463" /></svg>`,
  mapPin: `<svg  xmlns="http://www.w3.org/2000/svg"  width="24"  height="24"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  stroke-width="2"  stroke-linecap="round"  stroke-linejoin="round"  class="icon icon-tabler icons-tabler-outline icon-tabler-map-pin"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M9 11a3 3 0 1 0 6 0a3 3 0 0 0 -6 0" /><path d="M17.657 16.657l-4.243 4.243a2 2 0 0 1 -2.827 0l-4.244 -4.243a8 8 0 1 1 11.314 0z" /></svg>`,
  needle: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-needle"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M3 21c-.667 -.667 3.262 -6.236 11.785 -16.709a3.5 3.5 0 1 1 5.078 4.791c-10.575 8.612 -16.196 12.585 -16.863 11.918z"/><path d="M17.5 6.5l-1 1"/></svg>`,
  movie: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-movie"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M4 6h16M4 12h16M4 18h16M10 4v2M14 4v2M10 12v2M14 12v2M10 18v2M14 18v2"/></svg>`,
}

const regionNames = new Intl.DisplayNames(['en'], { type: 'region' })
const getCountryName = (countryCode) => regionNames.of(countryCode.trim()) || countryCode.trim()
const parseCountryField = (countryField) => {
  if (!countryField) return null
  const delimiters = [',', '/', '&', 'and']
  let countries = [countryField]
  delimiters.forEach(delimiter => countries = countries.flatMap(country => country.split(delimiter)))
  return countries.map(getCountryName).join(', ')
}


const generateMediaLinks = (data, type, count = 10) => {
  if (!data || !type) return ''

  const dataSlice = data.slice(0, count)
  if (dataSlice.length === 0) return null

  const buildLink = (item) => {
    switch (type) {
      case 'genre':
        return `<a href="${item['genre_url']}">${item['genre_name']}</a>`
      case 'artist':
        return `<a href="${item['url']}">${item['name']}</a>`
      case 'book':
        return `<a href="${item['url']}">${item['title']}</a>`
      default:
        return ''
    }
  }

  if (dataSlice.length === 1) return buildLink(dataSlice[0])

  const links = dataSlice.map(buildLink)
  const allButLast = links.slice(0, -1).join(', ')
  const last = links[links.length - 1]

  return `${allButLast} and ${last}`
}

async function fetchDataByUrl(supabase, table, url) {
  const { data, error } = await supabase.from(table).select('*').eq('url', url).single()

  if (error) {
    console.error(`Error fetching from ${table}:`, error)
    return null
  }

  return data
}

async function fetchGlobals(supabase) {
  const { data, error } = await supabase.from('optimized_globals').select('*').single()
  if (error) {
    console.error('Error fetching globals:', error)
    return {}
  }
  return data
}

function generateMetadata(data, type, globals) {
  let title = globals['site_name']
  let description = data.description || globals.site_description
  const canonicalUrl = data.url ? `${globals.url}${data.url}` : globals.url
  const ogImage = `${globals.cdn_url}${data.image || globals.avatar}?class=w800`

  description = convert(truncateHtml(md.render(description), 100, {
      byWords: true,
      ellipsis: '...'
    }),
    {
      wordwrap: false,
      selectors: [
        { selector: 'a', options: { ignoreHref: true } },
        { selector: 'h1', options: { uppercase: false } },
        { selector: 'h2', options: { uppercase: false } },
        { selector: 'h3', options: { uppercase: false } },
        { selector: '*', format: 'block' }
      ]
    }).replace(/\s+/g, ' ').trim()

  switch (type) {
    case 'artist':
      title = `Artists / ${data['name']} / ${globals['site_name']}`
      break
    case 'genre':
      title = `Genre / ${data['name']} / ${globals['site_name']}`
      break
    case 'book':
      title = `Books / ${data['title']} by ${data.author} / ${globals['site_name']}`
      break
    case 'movie':
      title = `Movies / ${data['title']} (${data.year}) / ${globals['site_name']}`
      break
    case 'show':
      title = `Shows / ${data['title']} / ${globals['site_name']}`
      break
    default:
      title = `${data['title'] || globals['site_name']}`
  }

  return {
    title,
    description,
    'og:title': title,
    'og:description': description,
    'og:image': ogImage,
    'og:url': canonicalUrl,
    'canonical': canonicalUrl
  }
}

function updateDynamicContent(html, metadata, mediaHtml) {
  const { document } = parseHTML(html)

  const titleTag = document.querySelector('title[data-dynamic="title"]')
  if (titleTag) titleTag.textContent = metadata['title']

  const dynamicMetaSelectors = [
    { selector: 'meta[data-dynamic="description"]', attribute: 'content', value: metadata.description },
    { selector: 'meta[data-dynamic="og:title"]', attribute: 'content', value: metadata['og:title'] },
    { selector: 'meta[data-dynamic="og:description"]', attribute: 'content', value: metadata['og:description'] },
    { selector: 'meta[data-dynamic="og:image"]', attribute: 'content', value: metadata['og:image'] },
    { selector: 'meta[data-dynamic="og:url"]', attribute: 'content', value: metadata.canonical },
  ]

  dynamicMetaSelectors.forEach(({ selector, attribute, value }) => {
    const element = document.querySelector(selector)
    if (element) element.setAttribute(attribute, value)
  })

  const canonicalLink = document.querySelector('link[rel="canonical"]')
  if (canonicalLink) canonicalLink.setAttribute('href', metadata.canonical)

  const pageElement = document.querySelector('[data-dynamic="page"]')
  if (pageElement) pageElement.innerHTML = mediaHtml

  return document.toString()
}

const warningBanner = `<div class="banner warning"><p>${ICON_MAP['alertTriangle']}There are probably spoilers after this banner — this is a warning about them.</p></div>`

function generateAssociatedMediaHTML(data, isGenre = false) {
  const sections = [
    { key: 'artists', icon: 'headphones', category: 'music', title: 'Related Artist(s)' },
    { key: 'books', icon: 'books', category: 'books', title: 'Related Book(s)' },
    { key: 'genres', icon: 'headphones', category: 'music', title: 'Related Genre(s)' },
    { key: 'related_movies', icon: 'film', category: 'movies', title: 'Related Movie(s)' },
    { key: 'posts', icon: 'article', category: 'article', title: 'Related Post(s)' },
    { key: 'shows', icon: 'deviceTvOld', category: 'tv', title: 'Related Show(s)' }
  ]

  return sections
    .filter(({ key }) => !(isGenre && key === 'artists'))
    .map(({ key, category, icon, title }) =>
      data[key] && data[key].length
        ? `<div class="associated-media">
            <p class="${category}">${ICON_MAP[icon]} ${title}</p>
            <ul>${data[key].map(item => `<li><a href="${item.url}">${item.name || item.title} ${item.year ? `(${item.year})` : ''}</a></li>`).join('')}</ul>
          </div>`
        : ''
    )
    .join('')
}

function generateWatchingHTML(media, globals, type) {
  const isShow = type === 'show'
  const label = isShow ? 'show' : 'movie'
  const lastWatched = media.lastWatched || (isShow && media.episode?.last_watched_at)

  return `
    <a class="icon-link" href="/watching">${ICON_MAP.arrowLeft} Back to watching</a>
    <article class="watching focus">
      <img
        srcset="
          ${globals.cdn_url}${media.backdrop}?class=bannersm&type=webp 256w,
          ${globals.cdn_url}${media.backdrop}?class=bannermd&type=webp 512w,
          ${globals.cdn_url}${media.backdrop}?class=bannerbase&type=webp 1024w
        "
        sizes="(max-width: 450px) 256px,
          (max-width: 850px) 512px,
          1024px"
        src="${globals.cdn_url}${media.backdrop}?class=bannersm&type=webp"
        alt="${media.title} / ${media.year}"
        class="image-banner"
        loading="eager"
        decoding="async"
        width="256"
        height="180"
      />
      <div class="meta">
        <p class="title"><strong>${media.title}</strong> (${media.year})</p>
        ${media.favorite ? `<p class="sub-meta favorite">${ICON_MAP.heart} This is one of my favorite ${label}s!</p>` : ''}
        ${media.tattoo ? `<p class="sub-meta tattoo">${ICON_MAP.needle} I have a tattoo inspired by this ${label}!</p>` : ''}
        ${media.collected ? `<p class="sub-meta collected">${ICON_MAP.circleCheck} This ${label} is in my collection!</p>` : ''}
        ${lastWatched ? `<p class="sub-meta">Last watched on ${new Date(lastWatched).toLocaleDateString()}</p>` : ''}
      </div>
      ${media.review ? `${warningBanner}<h2>My thoughts</h2><p>${md.render(media.review)}</p>` : ''}
      ${generateAssociatedMediaHTML(media)}
      ${media.description ? `<h2>Overview</h2><p>${md.render(media.description)}</p>` : ''}
    </article>
  `
}

function generateConcertModal(concert) {
  const venue = concert.venue_name
    ? concert.venue_latitude && concert.venue_longitude
      ? `<a href="https://www.openstreetmap.org/?mlat=${concert.venue_latitude}&mlon=${concert.venue_longitude}#map=18/${concert.venue_latitude}/${concert.venue_longitude}">${concert.venue_name_short}</a>`
      : concert.venue_name_short
    : ''

  const notesModal = concert.notes
    ? `<input class="modal-input" id="${concert.id}" type="checkbox" tabindex="0" />
      <label class="modal-toggle" for="${concert.id}">${ICON_MAP['infoCircle']}</label>
      <div class="modal-wrapper">
        <div class="modal-body">
          <label class="modal-close" for="${concert.id}">${ICON_MAP['circleX']}</label>
          <div>
            <h3>Notes</h3>
            ${md.render(concert.notes)}
          </div>
        </div>
      </div>`
    : ''

  return `
    <li>
      <strong class="highlight-text">${new Date(concert.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</strong> at ${venue}
      ${notesModal}
    </li>
  `
}

function generateArtistHTML(artist, globals) {
  const playLabel = artist?.total_plays === 1 ? 'play' : 'plays'
  const concertsList = artist.concerts?.length
    ? `<hr />
    <p id="concerts" class="concerts">
      ${ICON_MAP['deviceSpeaker']}
      I've seen this artist live!
    </p>
    <ul>${artist.concerts.map(generateConcertModal).join('')}</ul>`
    : ''
  const albumsTable = artist.albums?.length
    ? `<table>
        <tr><th>Album</th><th>Plays</th><th>Year</th></tr>
        ${artist.albums.map(album => `
          <tr>
            <td>${album.name}</td>
            <td>${album.total_plays || 0}</td>
            <td>${album.release_year}</td>
          </tr>`).join('')}
      </table>
      <p><em>These are the albums by this artist that are in my collection, not necessarily a comprehensive discography.</em></p>
      `
    : ''

  return `
    <a class="icon-link" href="/music">${ICON_MAP.arrowLeft} Back to music</a>
    <article class="artist-focus">
      <div class="artist-display">
        <img
          srcset="
            ${globals.cdn_url}${artist.image}?class=w200&type=webp 200w,
            ${globals.cdn_url}${artist.image}?class=w600&type=webp 400w,
            ${globals.cdn_url}${artist.image}?class=w800&type=webp 800w
          "
          sizes="(max-width: 450px) 200px,
            (max-width: 850px) 400px,
            800px"
          src="${globals.cdn_url}${artist.image}?class=w200&type=webp"
          alt="${artist.name} / ${artist.country}"
          loading="eager"
          decoding="async"
          width="200"
          height="200"
        />
        <div class="artist-meta">
          <p class="title"><strong>${artist.name}</strong></p>
          <p class="sub-meta country">${ICON_MAP['mapPin']} ${parseCountryField(artist.country)}</p>
          ${artist.favorite ? `<p class="sub-meta favorite">${ICON_MAP['heart']} This is one of my favorite artists!</p>` : ''}
          ${artist.tattoo ? `<p class="sub-meta tattoo">${ICON_MAP['needle']} I have a tattoo inspired by this artist!</p>` : ''}
          ${artist.total_plays ? `<p class="sub-meta"><strong class="highlight-text">${artist.total_plays} ${playLabel}</strong></p>` : ''}
          <p class="sub-meta">${artist.genre ? `<a href="${artist.genre.url}">${artist.genre.name}</a>` : ''}</p>
        </div>
      </div>
      ${artist.description ? `
        <h2>Overview</h2>
        <div data-toggle-content class="text-toggle-hidden">${md.render(artist.description)}</div>
        <button data-toggle-button>Show more</button>` : ''
      }
      ${concertsList}
      ${albumsTable}
    </article>
  `
}

function generateBookHTML(book, globals) {
  const alt = `${book.title}${book.author ? ` by ${book.author}` : ''}`
  const percentage = book.progress ? `${book.progress}%` : ''
  const status = book.status === 'finished'
    ? `Finished on <strong>${new Date(book.date_finished).toLocaleDateString()}</strong>`
    : percentage
    ? `<div class="progress-bar-wrapper" title="${percentage}">
        <div style="width:${percentage}" class="progress-bar"></div>
      </div>`
    : ''

  return `
    <a class="icon-link" href="/books">${ICON_MAP.arrowLeft} Back to books</a>
    <article class="book-focus">
      <div class="book-display">
        <img
          srcset="
            ${globals.cdn_url}${book.image}?class=verticalsm&type=webp 200w,
            ${globals.cdn_url}${book.image}?class=verticalmd&type=webp 400w,
            ${globals.cdn_url}${book.image}?class=verticalbase&type=webp 800w
          "
          sizes="(max-width: 450px) 203px, (max-width: 850px) 406px, 812px"
          src="${globals.cdn_url}${book.image}?class=verticalsm&type=webp"
          alt="${alt}"
          loading="lazy"
          decoding="async"
          width="200"
          height="307"
        />
        <div class="book-meta">
          <p class="title"><strong>${book.title}</strong></p>
          ${book.rating ? `<p>${book.rating}</p>` : ''}
          ${book.author ? `<p class="sub-meta">By ${book.author}</p>` : ''}
          ${book.favorite ? `<p class="sub-meta favorite">${ICON_MAP.heart} This is one of my favorite books!</p>` : ''}
          ${book.tattoo ? `<p class="sub-meta tattoo">${ICON_MAP.needle} I have a tattoo inspired by this book!</p>` : ''}
          ${status ? `<p class="sub-meta">${status}</p>` : ''}
        </div>
      </div>
      ${book.review ? `${warningBanner}<h2>My thoughts</h2><p>${book.review}</p>` : ''}
      ${generateAssociatedMediaHTML(book)}
      <h2>Overview</h2>
      <p>${md.render(book.description)}</p>
    </article>
  `
}

function generateGenreHTML(genre) {
  const artistCount = genre.artists?.length || 0
  const connectingWords = artistCount > 1 ? 'artists are' : 'artist is'
  const mediaLinks = generateMediaLinks(genre.artists, 'artist', 5)

  return `
    <a class="icon-link" href="/music">${ICON_MAP.arrowLeft} Back to music</a>
    <h2>${genre.name}</h2>
    <article class="genre-focus">
      ${mediaLinks ? `
        <p>My top <strong class="highlight-text">${genre.name}</strong> ${connectingWords} ${mediaLinks}. I've listened to <strong class="highlight-text">${genre.total_plays}</strong> tracks from this genre.</p>
        <hr />` : ''}
      ${generateAssociatedMediaHTML(genre, true)}
      ${genre.description ? `
        <h3>Overview</h3>
        <div data-toggle-content class="text-toggle-hidden">
          ${md.render(genre.description)}
          <p><a href="${genre.wiki_link}">Continue reading at Wikipedia.</a></p>
          <p><em>Wikipedia content provided under the terms of the <a href="https://creativecommons.org/licenses/by-sa/3.0/">Creative Commons BY-SA license</a>.</em></p>
        </div>
        <button data-toggle-button>Show more</button>` : ''}
    </article>
  `
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url)
    const path = url.pathname.replace(/\/$/, '')
    const supabaseUrl = env.SUPABASE_URL
    const supabaseKey = env.SUPABASE_KEY
    const supabase = createClient(supabaseUrl, supabaseKey)
    let data, type

    if (path === '/books' || path === '/books/') return fetch('https://coryd.dev/books/')
    if (path.startsWith('/books/years/')) return fetch(`https://coryd.dev${path}`)

    if (path.startsWith('/watching/movies/')) {
      data = await fetchDataByUrl(supabase, 'optimized_movies', path)
      type = 'movie'
    } else if (path.startsWith('/watching/shows/')) {
      data = await fetchDataByUrl(supabase, 'optimized_shows', path)
      type = 'show'
    } else if (path.startsWith('/music/artists/')) {
      data = await fetchDataByUrl(supabase, 'optimized_artists', path)
      type = 'artist'
    } else if (path.startsWith('/music/genres/')) {
      data = await fetchDataByUrl(supabase, 'optimized_genres', path)
      type = 'genre'
    } else if (path.startsWith('/books/')) {
      data = await fetchDataByUrl(supabase, 'optimized_books', path)
      type = 'book'
    } else {
      return Response.redirect('https://coryd.dev/404', 302)
    }

    if (!data) return Response.redirect('https://coryd.dev/404', 302)

    const globals = await fetchGlobals(supabase)
    let mediaHtml

    switch (type) {
      case 'artist':
        mediaHtml = generateArtistHTML(data, globals)
        break
      case 'genre':
        mediaHtml = generateGenreHTML(data, globals)
        break
      case 'book':
        mediaHtml = generateBookHTML(data, globals)
        break
      default:
        mediaHtml = generateWatchingHTML(data, globals, type)
        break
    }

    const templateResponse = await fetch('https://coryd.dev/dynamic.html')
    const template = await templateResponse.text()

    const metadata = generateMetadata(data, type, globals)
    const html = updateDynamicContent(template, metadata, mediaHtml)
    const headers = new Headers({
      'Content-Type': 'text/html',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400',
    })

    return new Response(html, { headers })
  }
}