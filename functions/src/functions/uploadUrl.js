const { app } = require("@azure/functions");
const {
  BlobServiceClient,
  StorageSharedKeyCredential,
  generateBlobSASQueryParameters,
  BlobSASPermissions,
} = require("@azure/storage-blob");
const crypto = require("crypto");

app.http("uploadUrl", {
  methods: ["POST"],
  authLevel: "anonymous",
  route: "upload-url",
  handler: async (request, context) => {
    const body = await request.json();

    if (!body.filename || !body.contentType) {
      return {
        status: 400,
        jsonBody: { error: "filename and contentType are required" },
      };
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(body.contentType)) {
      return {
        status: 400,
        jsonBody: { error: "File type not allowed. Use JPEG, PNG, WebP, or GIF." },
      };
    }

    const accountName = process.env.STORAGE_ACCOUNT_NAME;
    const accountKey = process.env.STORAGE_ACCOUNT_KEY;
    const containerName = "artwork-images";

    const credential = new StorageSharedKeyCredential(accountName, accountKey);
    const blobServiceClient = new BlobServiceClient(
      `https://${accountName}.blob.core.windows.net`,
      credential
    );

    // Ensure container exists with public blob access for serving images
    const containerClient = blobServiceClient.getContainerClient(containerName);
    await containerClient.createIfNotExists({ access: "blob" });

    // Generate a unique blob name to prevent overwrites
    const ext = body.filename.split(".").pop();
    const blobName = crypto.randomUUID() + "." + ext;

    // Create a SAS token valid for 10 minutes (upload window)
    const startsOn = new Date();
    const expiresOn = new Date(startsOn.getTime() + 10 * 60 * 1000);

    const sasToken = generateBlobSASQueryParameters(
      {
        containerName,
        blobName,
        permissions: BlobSASPermissions.parse("cw"),
        startsOn,
        expiresOn,
        contentType: body.contentType,
      },
      credential
    ).toString();

    const blobUrl = `https://${accountName}.blob.core.windows.net/${containerName}/${blobName}`;

    return {
      jsonBody: {
        uploadUrl: blobUrl + "?" + sasToken,
        imageUrl: blobUrl,
      },
    };
  },
});
