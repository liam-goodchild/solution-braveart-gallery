const { app } = require("@azure/functions");
const Stripe = require("stripe");
const { getCachedArtworks } = require("./artworkCache");

// Rate limit: 5 checkout attempts per IP per minute
const ipHits = new Map();
const RATE_LIMIT = 5;
const RATE_WINDOW_MS = 60 * 1000;

function isRateLimited(ip) {
  const now = Date.now();
  const hits = (ipHits.get(ip) ?? []).filter((t) => now - t < RATE_WINDOW_MS);
  if (hits.length >= RATE_LIMIT) return true;
  ipHits.set(ip, [...hits, now]);
  return false;
}

app.http("checkout", {
  methods: ["POST"],
  authLevel: "anonymous",
  route: "checkout",
  handler: async (request) => {
    const ip = request.headers.get("x-forwarded-for") ?? "unknown";
    if (isRateLimited(ip)) {
      return {
        status: 429,
        jsonBody: { error: "Too many requests" },
      };
    }

    const body = await request.json();

    if (!body.priceId) {
      return {
        status: 400,
        jsonBody: { error: "priceId is required" },
      };
    }

    const artworks = await getCachedArtworks();
    const validPriceIds = new Set(artworks.map((a) => a.priceId));
    if (!validPriceIds.has(body.priceId)) {
      return {
        status: 400,
        jsonBody: { error: "Invalid priceId" },
      };
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const frontendUrl = process.env.FRONTEND_URL;

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          price: body.priceId,
          quantity: 1,
        },
      ],
      success_url: `${frontendUrl}/gallery?checkout=success`,
      cancel_url: `${frontendUrl}/gallery?checkout=cancelled`,
    });

    return {
      jsonBody: { url: session.url },
    };
  },
});
