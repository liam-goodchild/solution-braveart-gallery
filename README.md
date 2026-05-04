# solution-braveart-gallery

E-commerce site for Buffy Braveart Gallery, an independent art gallery selling original artwork online. Visitors browse a small catalogue sourced from `functions/src/data/artworks.json` and purchase via Yoco Checkout. Deployed as an Azure Static Web App with a serverless Node.js API backend, hosted at [buffybraveart.com](https://buffybraveart.com).

## Temporary artwork catalogue

Until a non-technical product-management flow is selected, artwork is managed in `functions/src/data/artworks.json`.

Each artwork must have:

- `id` — stable unique slug, for example `blue-lion`
- `name`
- `description`
- `price` — amount in cents, for example `100000` for `R1,000.00`
- `currency` — `ZAR`
- `imageUrl` — public image URL or local site path
- `status` — set to `available` to show it on the gallery; use `draft` or `sold` to hide it

Yoco secret keys must be stored as `YOCO_SECRET_KEY` in deployment secrets/app settings.
