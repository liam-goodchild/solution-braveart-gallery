const { app } = require("@azure/functions");
const { TableClient } = require("@azure/data-tables");

app.http("getArtworks", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "artworks",
  handler: async (request, context) => {
    const client = TableClient.fromConnectionString(
      process.env.STORAGE_CONNECTION_STRING,
      "artworks"
    );

    // Ensure the table exists
    await client.createTable().catch(() => {});

    const artworks = [];
    const entities = client.listEntities();

    for await (const entity of entities) {
      artworks.push({
        rowKey: entity.rowKey,
        name: entity.name,
        price: entity.price,
        imageUrl: entity.imageUrl,
        createdAt: entity.createdAt,
      });
    }

    // Sort newest first
    artworks.sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));

    return {
      jsonBody: artworks,
    };
  },
});
