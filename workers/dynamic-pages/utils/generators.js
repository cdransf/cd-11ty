import truncateHtml from "truncate-html";
import { convert } from "html-to-text";
import { parseCountryField } from "./countries.js";
import { formatDate, md } from "./formatters.js";
import { ICON_MAP } from "./icons.js";

const warningBanner = `<div class="banner warning"><p>${ICON_MAP["alertTriangle"]}There are probably spoilers after this banner — this is a warning about them.</p></div>`;

const generateAssociatedMediaHTML = (data, isGenre = false) => {
  const sections = [
    {
      key: "artists",
      icon: "headphones",
      category: "music",
      title: "Related Artist(s)",
    },
    {
      key: "related_artists",
      icon: "headphones",
      category: "music",
      title: "Related Artist(s)",
    },
    {
      key: "genres",
      icon: "headphones",
      category: "music",
      title: "Related Genre(s)",
    },
    {
      key: "movies",
      icon: "film",
      category: "movies",
      title: "Related Movie(s)",
    },
    {
      key: "related_movies",
      icon: "film",
      category: "movies",
      title: "Related Movie(s)",
    },
    {
      key: "shows",
      icon: "deviceTvOld",
      category: "tv",
      title: "Related Show(s)",
    },
    {
      key: "related_shows",
      icon: "deviceTvOld",
      category: "tv",
      title: "Related Show(s)",
    },
    {
      key: "posts",
      icon: "article",
      category: "article",
      title: "Related Post(s)",
    },
    {
      key: "books",
      icon: "books",
      category: "books",
      title: "Related Book(s)",
    },
    {
      key: "related_books",
      icon: "books",
      category: "books",
      title: "Related Book(s)",
    },
  ];

  return sections
    .filter(({ key }) => !(isGenre && key === "artists"))
    .map(({ key, category, icon, title }) => {
      const items = data[key];
      if (!items || items.length === 0) return "";

      return `
        <div class="associated-media">
          <p class="${category}">${ICON_MAP[icon]} ${title}</p>
          <ul>
            ${items
              .map((item) => {
                const name = item.name || item.title;
                const url = item.url;
                const year = item.year ? ` (${item.year})` : "";
                const author = item.author ? ` by ${item.author}` : "";
                const totalPlays = item.total_plays
                  ? ` <strong class="highlight-text">${item.total_plays} ${
                      item.total_plays === 1 ? "play" : "plays"
                    }</strong>`
                  : "";

                let listItemContent = name;

                if (key === "artists" || key === "related_artists") {
                  return `<li><a href="${url}">${name}</a>${totalPlays}</li>`;
                } else if (
                  key === "movies" ||
                  key === "related_movies" ||
                  key === "shows" ||
                  key === "related_shows"
                ) {
                  listItemContent = `${name}${year}`;
                } else if (key === "books" || key === "related_books") {
                  listItemContent = `${name}${author}`;
                }

                return `<li><a href="${url}">${listItemContent}</a></li>`;
              })
              .join("")}
          </ul>
        </div>`;
    })
    .join("");
};

const generateMediaLinks = (data, type, count = 10) => {
  if (!data || !type) return "";

  const dataSlice = data.slice(0, count);
  if (dataSlice.length === 0) return null;

  const buildLink = (item) => {
    switch (type) {
      case "genre":
        return `<a href="${item["genre_url"]}">${item["genre_name"]}</a>`;
      case "artist":
        return `<a href="${item["url"]}">${item["name"]}</a>`;
      case "book":
        return `<a href="${item["url"]}">${item["title"]}</a>`;
      default:
        return "";
    }
  };

  if (dataSlice.length === 1) return buildLink(dataSlice[0]);

  const links = dataSlice.map(buildLink);
  const allButLast = links.slice(0, -1).join(", ");
  const last = links[links.length - 1];

  return `${allButLast} and ${last}`;
};

export const generateArtistHTML = (artist, globals) => {
  const playLabel = artist?.["total_plays"] === 1 ? "play" : "plays";
  const concertsList = artist["concerts"]?.length
    ? `<hr />
    <p id="concerts" class="concerts">
      ${ICON_MAP["deviceSpeaker"]}
      I've seen this artist live!
    </p>
    <ul>${artist["concerts"].map(generateConcertModal).join("")}</ul>`
    : "";
  const albumsTable = artist["albums"]?.length
    ? `<table>
        <tr><th>Album</th><th>Plays</th><th>Year</th></tr>
        ${artist["albums"]
          .map(
            (album) => `
          <tr>
            <td>${album["name"]}</td>
            <td>${album["total_plays"] || 0}</td>
            <td>${album["release_year"]}</td>
          </tr>`
          )
          .join("")}
      </table>
      <p><em>These are the albums by this artist that are in my collection, not necessarily a comprehensive discography.</em></p>
      `
    : "";

  return `
    <a class="icon-link" href="/music">${ICON_MAP.arrowLeft} Back to music</a>
    <article class="artist-focus">
      <div class="artist-display">
        <img
          srcset="
            ${globals["cdn_url"]}${artist["image"]}?class=w200&type=webp 200w,
            ${globals["cdn_url"]}${artist["image"]}?class=w600&type=webp 400w,
            ${globals["cdn_url"]}${artist["image"]}?class=w800&type=webp 800w
          "
          sizes="(max-width: 450px) 200px,
            (max-width: 850px) 400px,
            800px"
          src="${globals["cdn_url"]}${artist["image"]}?class=w200&type=webp"
          alt="${artist["name"]} / ${artist["country"]}"
          loading="eager"
          decoding="async"
          width="200"
          height="200"
        />
        <div class="artist-meta">
          <p class="title"><strong>${artist["name"]}</strong></p>
          <p class="sub-meta country">${ICON_MAP["mapPin"]} ${parseCountryField(
    artist["country"]
  )}</p>
          ${
            artist["favorite"]
              ? `<p class="sub-meta favorite">${ICON_MAP["heart"]} This is one of my favorite artists!</p>`
              : ""
          }
          ${
            artist["tattoo"]
              ? `<p class="sub-meta tattoo">${ICON_MAP["needle"]} I have a tattoo inspired by this artist!</p>`
              : ""
          }
          ${
            artist["total_plays"]
              ? `<p class="sub-meta"><strong class="highlight-text">${artist["total_plays"]} ${playLabel}</strong></p>`
              : ""
          }
          <p class="sub-meta">${
            artist["genre"]
              ? `<a href="${artist["genre"]["url"]}">${artist["genre"]["name"]}</a>`
              : ""
          }</p>
        </div>
      </div>
      ${generateAssociatedMediaHTML(artist)}
      ${
        artist["description"]
          ? `
        <h2>Overview</h2>
        <div data-toggle-content class="text-toggle-hidden">${md.render(
          artist["description"]
        )}</div>
        <button data-toggle-button>Show more</button>`
          : ""
      }
      ${concertsList}
      ${albumsTable}
    </article>
  `;
};

export const generateBookHTML = (book, globals) => {
  const alt = `${book["title"]}${
    book["author"] ? ` by ${book["author"]}` : ""
  }`;
  const percentage = book["progress"] ? `${book["progress"]}%` : "";
  const status =
    book["status"] === "finished"
      ? `Finished on <strong class="highlight-text">${formatDate(
          book["date_finished"]
        )}</strong>`
      : percentage
      ? `<div class="progress-bar-wrapper" title="${percentage}">
        <div style="width:${percentage}" class="progress-bar"></div>
      </div>`
      : "";

  return `
    <a class="icon-link" href="/books">${
      ICON_MAP["arrowLeft"]
    } Back to books</a>
    <article class="book-focus">
      <div class="book-display">
        <img
          srcset="
            ${globals["cdn_url"]}${
    book["image"]
  }?class=verticalsm&type=webp 200w,
            ${globals["cdn_url"]}${
    book["image"]
  }?class=verticalmd&type=webp 400w,
            ${globals["cdn_url"]}${
    book["image"]
  }?class=verticalbase&type=webp 800w
          "
          sizes="(max-width: 450px) 203px, (max-width: 850px) 406px, 812px"
          src="${globals["cdn_url"]}${book["image"]}?class=verticalsm&type=webp"
          alt="${alt}"
          loading="lazy"
          decoding="async"
          width="200"
          height="307"
        />
        <div class="book-meta">
          <p class="title"><strong>${book["title"]}</strong></p>
          ${book["rating"] ? `<p>${book["rating"]}</p>` : ""}
          ${
            book["author"] ? `<p class="sub-meta">By ${book["author"]}</p>` : ""
          }
          ${
            book["favorite"]
              ? `<p class="sub-meta favorite">${ICON_MAP["heart"]} This is one of my favorite books!</p>`
              : ""
          }
          ${
            book["tattoo"]
              ? `<p class="sub-meta tattoo">${ICON_MAP["needle"]} I have a tattoo inspired by this book!</p>`
              : ""
          }
          ${status ? `<p class="sub-meta">${status}</p>` : ""}
        </div>
      </div>
      ${
        book["review"]
          ? `${warningBanner}<h2>My thoughts</h2><p>${book["review"]}</p>`
          : ""
      }
      ${generateAssociatedMediaHTML(book)}
      <h2>Overview</h2>
      <p>${md.render(book["description"])}</p>
    </article>
  `;
};

export const generateGenreHTML = (genre) => {
  const artistCount = genre["artists"]?.length || 0;
  const connectingWords = artistCount > 1 ? "artists are" : "artist is";
  const mediaLinks = generateMediaLinks(genre["artists"], "artist", 5);

  return `
    <a class="icon-link" href="/music">${
      ICON_MAP["arrowLeft"]
    } Back to music</a>
    <h2>${genre["name"]}</h2>
    <article class="genre-focus">
      ${
        mediaLinks
          ? `
        <p>My top <strong class="highlight-text">${genre["name"]}</strong> ${connectingWords} ${mediaLinks}. I've listened to <strong class="highlight-text">${genre["total_plays"]}</strong> tracks from this genre.</p>
        <hr />`
          : ""
      }
      ${generateAssociatedMediaHTML(genre, true)}
      ${
        genre["description"]
          ? `
        <h3>Overview</h3>
        <div data-toggle-content class="text-toggle-hidden">
          ${md.render(genre["description"])}
          <p><a href="${
            genre["wiki_link"]
          }">Continue reading at Wikipedia.</a></p>
          <p><em>Wikipedia content provided under the terms of the <a href="https://creativecommons.org/licenses/by-sa/3.0/">Creative Commons BY-SA license</a>.</em></p>
        </div>
        <button data-toggle-button>Show more</button>`
          : ""
      }
    </article>
  `;
};

export const generateMetadata = (data, type, globals) => {
  let title = globals["site_name"];
  let description = data["description"] || globals["site_description"];
  const canonicalUrl = data["url"]
    ? `${globals["url"]}${data["url"]}`
    : globals["url"];
  const ogImage = `${globals["cdn_url"]}${(data["backdrop"] ? data["backdrop"] : data["image"]) || globals["avatar"]}?class=w800`;

  description = convert(
    truncateHtml(md.render(description), 100, {
      byWords: true,
      ellipsis: "...",
    }),
    {
      wordwrap: false,
      selectors: [
        { selector: "a", options: { ignoreHref: true } },
        { selector: "h1", options: { uppercase: false } },
        { selector: "h2", options: { uppercase: false } },
        { selector: "h3", options: { uppercase: false } },
        { selector: "*", format: "block" },
      ],
    }
  )
    .replace(/\s+/g, " ")
    .trim();

  switch (type) {
    case "artist":
      title = `Artists / ${data["name"]} / ${globals["site_name"]}`;
      break;
    case "genre":
      title = `Genre / ${data["name"]} / ${globals["site_name"]}`;
      break;
    case "book":
      title = `Books / ${data["title"]} by ${data["author"]} / ${globals["site_name"]}`;
      break;
    case "movie":
      title = `Movies / ${data["title"]} (${data["year"]}) / ${globals["site_name"]}`;
      break;
    case "show":
      title = `Shows / ${data["title"]} / ${globals["site_name"]}`;
      break;
    default:
      title = `${data["title"] || globals["site_name"]}`;
  }

  return {
    title,
    description,
    "og:title": title,
    "og:description": description,
    "og:image": ogImage,
    "og:url": canonicalUrl,
    canonical: canonicalUrl,
  };
};

export const generateWatchingHTML = (media, globals, type) => {
  const isShow = type === "show";
  const label = isShow ? "show" : "movie";
  const lastWatched =
    media["last_watched"] || (isShow && media["episode"]?.["last_watched_at"]);

  return `
    <a class="icon-link" href="/watching">${
      ICON_MAP.arrowLeft
    } Back to watching</a>
    <article class="watching focus">
      <img
        srcset="
          ${globals["cdn_url"]}${
    media["backdrop"]
  }?class=bannersm&type=webp 256w,
          ${globals["cdn_url"]}${
    media["backdrop"]
  }?class=bannermd&type=webp 512w,
          ${globals["cdn_url"]}${
    media["backdrop"]
  }?class=bannerbase&type=webp 1024w
        "
        sizes="(max-width: 450px) 256px,
          (max-width: 850px) 512px,
          1024px"
        src="${globals["cdn_url"]}${media["backdrop"]}?class=bannersm&type=webp"
        alt="${media["title"]} / ${media["year"]}"
        class="image-banner"
        loading="eager"
        decoding="async"
        width="256"
        height="180"
      />
      <div class="meta">
        <p class="title"><strong>${media["title"]}</strong> (${
    media["year"]
  })</p>
        ${media["rating"] ? `<p>${media["rating"]}</p>` : ""}
        ${
          media["favorite"]
            ? `<p class="sub-meta favorite">${ICON_MAP["heart"]} This is one of my favorite ${label}s!</p>`
            : ""
        }
        ${
          media["tattoo"]
            ? `<p class="sub-meta tattoo">${ICON_MAP["needle"]} I have a tattoo inspired by this ${label}!</p>`
            : ""
        }
        ${
          media["collected"]
            ? `<p class="sub-meta collected">${ICON_MAP["circleCheck"]} This ${label} is in my collection!</p>`
            : ""
        }
        ${
          lastWatched
            ? `<p class="sub-meta">Last watched on <strong class="highlight-text">${formatDate(
                lastWatched
              )}</strong>.</p>`
            : ""
        }
      </div>
      ${
        media["review"]
          ? `${warningBanner}<h2>My thoughts</h2><p>${md.render(
              media["review"]
            )}</p>`
          : ""
      }
      ${generateAssociatedMediaHTML(media)}
      ${
        media["description"]
          ? `<h2>Overview</h2><p>${md.render(media["description"])}</p>`
          : ""
      }
    </article>
  `;
};

export const generateConcertModal = (concert) => {
  const venue = concert["venue_name"]
    ? concert["venue_latitude"] && concert["venue_longitude"]
      ? `<a href="https://www.openstreetmap.org/?mlat=${concert["venue_latitude"]}&mlon=${concert["venue_longitude"]}#map=18/${concert["venue_latitude"]}/${concert["venue_longitude"]}">${concert["venue_name_short"]}</a>`
      : concert["venue_name_short"]
    : "";

  const notesModal = concert["notes"]
    ? `<input class="modal-input" id="${
        concert["id"]
      }" type="checkbox" tabindex="0" />
      <label class="modal-toggle" for="${concert["id"]}">${
        ICON_MAP["infoCircle"]
      }</label>
      <div class="modal-wrapper">
        <div class="modal-body">
          <label class="modal-close" for="${concert["id"]}">${
        ICON_MAP["circleX"]
      }</label>
          <div>
            <h3>Notes</h3>
            ${md.render(concert["notes"])}
          </div>
        </div>
      </div>`
    : "";

  return `
    <li>
      <strong class="highlight-text">${formatDate(
        concert["date"]
      )}</strong> at ${venue}
      ${notesModal}
    </li>
  `;
};
