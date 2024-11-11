import slugify from "slugify";
import countries from "i18n-iso-countries";

countries.registerLocale(require("i18n-iso-countries/langs/en.json"));

function sanitizeMediaString(str) {
  const sanitizedString = str
    .normalize("NFD")
    .replace(/[\u0300-\u036f\u2010\-\.\?\(\)\[\]\{\}]/g, "")
    .replace(/\.{3}/g, "");
  return slugify(sanitizedString, {
    replacement: "-",
    remove: /[#,&,+()$~%.'\":*?<>{}]/g,
    lower: true,
  });
}

export default {
  async fetch(request, env) {
    const directusUrl = env.DIRECTUS_URL;
    const directusToken = env.DIRECTUS_API_TOKEN;
    const artistImportToken = env.ARTIST_IMPORT_TOKEN;
    const artistFlowID = env.ARTIST_FLOW_ID;
    const albumFlowID = env.ALBUM_FLOW_ID;
    const placeholderImageId = "4cef75db-831f-4f5d-9333-79eaa5bb55ee";
    const requestUrl = new URL(request["url"]);
    const providedToken = requestUrl.searchParams.get("token");

    if (!providedToken || providedToken !== artistImportToken) return new Response("Unauthorized", { status: 401 });

    async function saveToDirectus(endpoint, payload) {
      const response = await fetch(`${directusUrl}/items/${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${directusToken}`,
        },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(
          data["errors"]
            ? data["errors"][0]["message"]
            : "Failed to save to Directus"
        );
      }
      return data["data"];
    }

    async function findGenreIdByName(genreName) {
      try {
        const response = await fetch(
          `${directusUrl}/items/genres?filter[name][_eq]=${encodeURIComponent(
            genreName.toLowerCase()
          )}`,
          { headers: { Authorization: `Bearer ${directusToken}` } }
        );
        const data = await response.json();
        return data["data"].length > 0 ? data["data"][0]["id"] : null;
      } catch (error) {
        console.error("Error fetching genre ID:", error["message"]);
        return null;
      }
    }

    const artistId = requestUrl.searchParams.get("artist_id");
    if (!artistId)
      return new Response("artist_id parameter is required", { status: 400 });

    let artistData;
    try {
      const artistResponse = await fetch(
        `${directusUrl}/flows/trigger/${artistFlowID}?artist_id=${artistId}&import_token=${artistImportToken}`,
        { headers: { Authorization: `Bearer ${directusToken}` } }
      );
      artistData = await artistResponse.json();
      artistData =
        artistData["get_artist_data"]["data"]["MediaContainer"]["Metadata"][0];
    } catch (error) {
      console.error(
        "Error fetching artist data from Directus flow:",
        error["message"]
      );
      return new Response("Error fetching artist data", { status: 500 });
    }

    const artistName = artistData["title"] || "";
    const artistKey = sanitizeMediaString(artistName);
    const countryName = artistData["Country"]
      ? artistData["Country"][0]?.["tag"]
      : "";
    const countryIsoCode = countries.getAlpha2Code(countryName, "en") || "";
    const slug = `/music/artists/${artistKey}-${countryName.toLowerCase()}`;
    const description = artistData["summary"] || "";
    const mbid = artistData["Guid"]?.[0]?.["id"]?.replace("mbid://", "") || "";

    const genreNames = artistData["Genre"]
      ? artistData["Genre"].map((g) => g["tag"].toLowerCase())
      : [];
    let genreId = null;
    for (const genreName of genreNames) {
      genreId = await findGenreIdByName(genreName);
      if (genreId) break;
    }

    const artistPayload = {
      name: artistName,
      name_string: artistName,
      slug: slug,
      description: description,
      mbid: mbid,
      tentative: true,
      genres: genreId,
      country: countryIsoCode,
      art: placeholderImageId,
    };

    let insertedArtist;
    try {
      insertedArtist = await saveToDirectus("artists", artistPayload);
    } catch (error) {
      console.error("Error saving artist:", error["message"]);
      return new Response("Error saving artist", { status: 500 });
    }

    let albumData;
    try {
      const albumResponse = await fetch(
        `${directusUrl}/flows/trigger/${albumFlowID}?artist_id=${artistId}&import_token=${artistImportToken}`,
        { headers: { Authorization: `Bearer ${directusToken}` } }
      );
      albumData = await albumResponse.json();
      albumData =
        albumData["get_album_data"]["data"]["MediaContainer"]["Metadata"];
    } catch (error) {
      console.error(
        "Error fetching album data from Directus flow:",
        error["message"]
      );
      return new Response("Error fetching album data", { status: 500 });
    }

    for (const album of albumData) {
      const albumName = album["title"] || "";
      const albumKey = `${artistKey}-${sanitizeMediaString(albumName)}`;
      const albumSlug = `/music/albums/${albumKey}`;
      const albumDescription = album["summary"] || "";
      const albumReleaseDate = album["originallyAvailableAt"] || "";
      const albumReleaseYear = albumReleaseDate
        ? new Date(albumReleaseDate).getFullYear()
        : null;
      const albumGenres = album["Genre"]
        ? album["Genre"].map((g) => g["tag"])
        : [];
      const albumMbid =
        album["Guid"]?.[0]?.["id"]?.replace("mbid://", "") || null;

      const albumPayload = {
        name: albumName,
        key: albumKey,
        slug: albumSlug,
        mbid: albumMbid,
        description: albumDescription,
        release_year: albumReleaseYear,
        artist: insertedArtist["id"],
        artist_name: artistName,
        genres: albumGenres,
        art: placeholderImageId,
        tentative: true,
      };

      try {
        await saveToDirectus("albums", albumPayload);
      } catch (error) {
        console.error("Error saving album:", error["message"]);
      }
    }

    return new Response("Artist and albums synced successfully", {
      status: 200,
    });
  },
};
