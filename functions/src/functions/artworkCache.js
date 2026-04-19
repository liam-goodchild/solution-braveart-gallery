const Stripe = require("stripe");

let cachedArtworks = null;
let cacheExpiry = 0;
const CACHE_TTL = 5 * 60 * 1000;

async function getCachedArtworks() {
  if (cachedArtworks && Date.now() < cacheExpiry) {
    return cachedArtworks;
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

  const products = await stripe.products.list({
    active: true,
    expand: ["data.default_price"],
  });

  const artworks = products.data
    .filter((p) => p.default_price?.unit_amount)
    .map((p) => ({
      id: p.id,
      priceId: p.default_price.id,
      name: p.name,
      description: p.description,
      price: p.default_price.unit_amount,
      imageUrl:
        p.images.length > 0
          ? p.images[0].startsWith("http")
            ? p.images[0]
            : `https://files.stripe.com/links/${p.images[0]}`
          : null,
    }));

  cachedArtworks = artworks;
  cacheExpiry = Date.now() + CACHE_TTL;

  return artworks;
}

module.exports = { getCachedArtworks };
