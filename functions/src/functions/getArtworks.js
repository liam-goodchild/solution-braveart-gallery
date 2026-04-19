const { app } = require("@azure/functions");
const { getCachedArtworks } = require("./artworkCache");

app.http("getArtworks", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "artworks",
  handler: async () => {
    const artworks = await getCachedArtworks();
    return { jsonBody: artworks };
  },
});
