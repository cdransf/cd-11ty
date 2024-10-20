import fs from "fs/promises";
import dotenv from "dotenv-flow";

dotenv.config();

const workerName = process.argv[2];

if (!workerName) {
  console.error("Please specify a worker name.");
  process.exit(1);
}

const templatePath = `workers/${workerName}/wrangler.template.toml`;
const outputPath = `workers/${workerName}/wrangler.toml`;

async function generateToml() {
  try {
    const template = await fs.readFile(templatePath, "utf8");
    const output = template
      .replace(/\${CF_ACCOUNT_ID}/g, process.env.CF_ACCOUNT_ID)
      .replace(/\${CF_ZONE_ID}/g, process.env.CF_ZONE_ID)
      .replace(
        /\${RSS_TO_MASTODON_KV_NAMESPACE_ID}/g,
        process.env.RSS_TO_MASTODON_KV_NAMESPACE_ID
      );

    await fs.writeFile(outputPath, output);

    console.log(`Generated wrangler.toml for ${workerName}`);
  } catch (error) {
    console.error("Error generating wrangler.toml:", error);
    process.exit(1);
  }
}

generateToml();
