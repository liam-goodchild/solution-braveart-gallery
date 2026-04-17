const { app } = require("@azure/functions");
const Stripe = require("stripe");

let cachedArtworks = null;
let cacheExpiry = 0;
const CACHE_TTL_MS = 5 * 60 * 1000;

app.http("getArtworks", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "artworks",
  handler: async (request, context) => {
    const now = Date.now();

    if (cachedArtworks && now < cacheExpiry) {
      return {
        jsonBody: cachedArtworks,
        headers: { "Cache-Control": "public, max-age=300" },
      };
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

    const products = await stripe.products.list({
      active: true,
      expand: ["data.default_price"],
    });

    const artworks = products.data
      .filter((p) => p.default_price && p.default_price.unit_amount)
      .map((p) => ({
        id: p.id,
        priceId: p.default_price.id,
        name: p.name,
        description: p.description,
        price: p.default_price.unit_amount,
        imageUrl: p.images.length > 0 ? p.images[0] : null,
      }));

    cachedArtworks = artworks;
    cacheExpiry = now + CACHE_TTL_MS;

    return {
      jsonBody: artworks,
      headers: { "Cache-Control": "public, max-age=300" },
    };
  },
});
