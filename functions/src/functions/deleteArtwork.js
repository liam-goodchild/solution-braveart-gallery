const { app } = require("@azure/functions");
const { TableClient } = require("@azure/data-tables");

app.http("deleteArtwork", {
  methods: ["DELETE"],
  authLevel: "anonymous",
  route: "artworks/{id}",
  handler: async (request, context) => {
    const id = request.params.id;

    const client = TableClient.fromConnectionString(
      process.env.STORAGE_CONNECTION_STRING,
      "artworks"
    );

    try {
      await client.deleteEntity("artwork", id);
      return { status: 204 };
    } catch (err) {
      if (err.statusCode === 404) {
        return {
          status: 404,
          jsonBody: { error: "Artwork not found" },
        };
      }
      throw err;
    }
  },
});
