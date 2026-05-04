const fs = require("node:fs/promises");
const path = require("node:path");

let cachedArtworks = null;
let cacheExpiry = 0;
const CACHE_TTL = 5 * 60 * 1000;
const ARTWORKS_PATH = path.join(__dirname, "../data/artworks.json");

async function getCachedArtworks() {
  if (cachedArtworks && Date.now() < cacheExpiry) {
    return cachedArtworks;
  }

  const raw = await fs.readFile(ARTWORKS_PATH, "utf8");
  const artworks = JSON.parse(raw)
    .filter((artwork) => artwork.status === "available")
    .map((artwork) => ({
      ...artwork,
      currency: artwork.currency ?? "ZAR",
    }));

  cachedArtworks = artworks;
  cacheExpiry = Date.now() + CACHE_TTL;

  return artworks;
}

module.exports = { getCachedArtworks };
