const { app } = require("@azure/functions");
const { TableClient } = require("@azure/data-tables");
const crypto = require("crypto");

app.http("createArtwork", {
  methods: ["POST"],
  authLevel: "anonymous",
  route: "artworks",
  handler: async (request, context) => {
    const body = await request.json();

    if (!body.name || !body.price || !body.imageUrl) {
      return {
        status: 400,
        jsonBody: { error: "name, price, and imageUrl are required" },
      };
    }

    if (typeof body.price !== "number" || body.price <= 0) {
      return {
        status: 400,
        jsonBody: { error: "price must be a positive number (in pence)" },
      };
    }

    const client = TableClient.fromConnectionString(
      process.env.STORAGE_CONNECTION_STRING,
      "artworks"
    );

    await client.createTable().catch(() => {});

    const entity = {
      partitionKey: "artwork",
      rowKey: crypto.randomUUID(),
      name: body.name,
      price: body.price,
      imageUrl: body.imageUrl,
      createdAt: new Date().toISOString(),
    };

    await client.createEntity(entity);

    return {
      status: 201,
      jsonBody: {
        rowKey: entity.rowKey,
        name: entity.name,
        price: entity.price,
        imageUrl: entity.imageUrl,
      },
    };
  },
});
