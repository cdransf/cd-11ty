import { XMLParser } from "fast-xml-parser";
import { convert } from "html-to-text";
import { createClient } from "@supabase/supabase-js";

const BASE_URL = "https://coryd.dev";

export default {
  async scheduled(event, env, ctx) {
    await handleMastodonPost(env);
  },

  async fetch(request, env, ctx) {
    if (request.method !== "POST")
      return new Response("Method Not Allowed", { status: 405 });
    if (request.headers.get("x-webhook-token") !== env.WEBHOOK_SECRET)
      return new Response("Unauthorized", { status: 401 });

    await handleMastodonPost(env);

    return new Response("Worker triggered by successful build.", {
      status: 200,
    });
  },
};

async function handleMastodonPost(env) {
  const mastodonApiUrl = "https://follow.coryd.dev/api/v1/statuses";
  const accessToken = env.MASTODON_ACCESS_TOKEN;
  const rssFeedUrl = "https://coryd.dev/feeds/syndication";
  const supabaseUrl = env.SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseKey = env.SUPABASE_KEY || process.env.SUPABASE_KEY;
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    const latestItems = await fetchRSSFeed(rssFeedUrl);

    for (let i = latestItems.length - 1; i >= 0; i--) {
      const item = latestItems[i];
      const existingPost = await env.RSS_TO_MASTODON_NAMESPACE.get(item.link);

      if (existingPost) continue;

      const title = item.title;
      const link = item.link;
      const maxLength = 500;
      const plainTextDescription = convert(item.description, {
        wordwrap: false,
        selectors: [
          { selector: "a", options: { ignoreHref: true } },
          { selector: "h1", options: { uppercase: false } },
          { selector: "h2", options: { uppercase: false } },
          { selector: "h3", options: { uppercase: false } },
          { selector: "*", format: "block" },
        ],
      });

      const cleanedDescription = plainTextDescription
        .replace(/\s+/g, " ")
        .trim();
      const content = truncateContent(
        title,
        cleanedDescription,
        link,
        maxLength
      );

      const mastodonPostUrl = await postToMastodon(
        mastodonApiUrl,
        accessToken,
        content
      );

      const timestamp = new Date().toISOString();

      await env.RSS_TO_MASTODON_NAMESPACE.put(link, timestamp);

      if (link.includes("coryd.dev/posts")) {
        const slug = link.replace(BASE_URL, "");
        await addMastodonUrlToPost(supabase, slug, mastodonPostUrl);
      }

      console.log(`Posted stored URL: ${link}`);
    }

    console.log("RSS processed successfully");
  } catch (error) {
    console.error("Error in scheduled event:", error);
  }
}

async function addMastodonUrlToPost(supabase, slug, mastodonPostUrl) {
  const { data, error } = await supabase
    .from("posts")
    .update({ mastodon_url: mastodonPostUrl })
    .eq("slug", slug);

  if (error) {
    console.error("Error updating post:", error);
  } else {
    console.log(`Updated post with Mastodon URL: ${mastodonPostUrl}`);
  }
}

function truncateContent(title, description, link, maxLength) {
  const baseLength = `${title}\n\n${link}`.length;
  const availableSpace = maxLength - baseLength - 4;
  let truncatedDescription = description;

  if (description.length > availableSpace)
    truncatedDescription =
      description
        .substring(0, availableSpace)
        .split(" ")
        .slice(0, -1)
        .join(" ") + "...";

  return `${title}\n\n${truncatedDescription}\n\n${link}`;
}

async function fetchRSSFeed(rssFeedUrl) {
  const response = await fetch(rssFeedUrl);
  const rssText = await response.text();
  const parser = new XMLParser();
  const rssData = parser.parse(rssText);
  const items = rssData.rss.channel.item;

  let latestItems = [];

  items.forEach((item) => {
    const title = item.title;
    const link = item.link;
    const description = item.description;
    latestItems.push({ title, link, description });
  });

  return latestItems;
}

async function postToMastodon(apiUrl, accessToken, content) {
  const response = await fetch(apiUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ status: content }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Error posting to Mastodon: ${response.statusText} - ${errorText}`
    );
  }

  const responseData = await response.json();

  console.log("Posted to Mastodon successfully.");

  return responseData.url;
}
