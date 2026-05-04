const { app } = require("@azure/functions");
const crypto = require("node:crypto");
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

    if (!body.artworkId) {
      return {
        status: 400,
        jsonBody: {
          error:
            "artworkId is required. Please refresh the gallery page and try again.",
        },
      };
    }

    const artworks = await getCachedArtworks();
    const artwork = artworks.find((a) => a.id === body.artworkId);
    if (!artwork) {
      return {
        status: 400,
        jsonBody: { error: "Invalid artworkId" },
      };
    }

    const yocoSecretKey = process.env.YOCO_SECRET_KEY;
    const frontendUrl = process.env.FRONTEND_URL;

    if (!yocoSecretKey) {
      return {
        status: 500,
        jsonBody: { error: "Payment gateway is not configured" },
      };
    }

    const checkoutResponse = await fetch("https://payments.yoco.com/api/checkouts", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${yocoSecretKey}`,
        "Content-Type": "application/json",
        "Idempotency-Key": crypto.randomUUID(),
      },
      body: JSON.stringify({
        amount: artwork.price,
        currency: artwork.currency ?? "ZAR",
        successUrl: `${frontendUrl}/gallery?checkout=success`,
        cancelUrl: `${frontendUrl}/gallery?checkout=cancelled`,
        failureUrl: `${frontendUrl}/gallery?checkout=failed`,
        externalId: artwork.id,
        clientReferenceId: artwork.id,
        metadata: {
          artworkId: artwork.id,
          artworkName: artwork.name,
        },
      }),
    });

    if (!checkoutResponse.ok) {
      return {
        status: 502,
        jsonBody: { error: "Could not create Yoco checkout" },
      };
    }

    const checkout = await checkoutResponse.json();

    return {
      jsonBody: { url: checkout.redirectUrl },
    };
  },
});
