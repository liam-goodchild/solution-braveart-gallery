const { app } = require("@azure/functions");
const { TableClient } = require("@azure/data-tables");
const Stripe = require("stripe");

app.http("checkout", {
  methods: ["POST"],
  authLevel: "anonymous",
  route: "checkout",
  handler: async (request, context) => {
    const body = await request.json();

    if (!body.artworkId) {
      return {
        status: 400,
        jsonBody: { error: "artworkId is required" },
      };
    }

    // Look up the artwork in Table Storage
    const tableClient = TableClient.fromConnectionString(
      process.env.STORAGE_CONNECTION_STRING,
      "artworks"
    );

    let artwork;
    try {
      artwork = await tableClient.getEntity("artwork", body.artworkId);
    } catch (err) {
      if (err.statusCode === 404) {
        return {
          status: 404,
          jsonBody: { error: "Artwork not found" },
        };
      }
      throw err;
    }

    // Create a Stripe Checkout session
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const frontendUrl = process.env.FRONTEND_URL;

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "gbp",
            product_data: {
              name: artwork.name,
              images: [artwork.imageUrl],
            },
            unit_amount: artwork.price,
          },
          quantity: 1,
        },
      ],
      success_url: frontendUrl + "/gallery?checkout=success",
      cancel_url: frontendUrl + "/gallery?checkout=cancelled",
    });

    return {
      jsonBody: { url: session.url },
    };
  },
});
