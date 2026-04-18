const { app } = require("@azure/functions");
const Stripe = require("stripe");

app.http("checkout", {
  methods: ["POST"],
  authLevel: "anonymous",
  route: "checkout",
  handler: async (request, _context) => {
    const body = await request.json();

    if (!body.priceId) {
      return {
        status: 400,
        jsonBody: { error: "priceId is required" },
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
