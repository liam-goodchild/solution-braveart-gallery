# solution-braveart-gallery

E-commerce site for Buffy Braveart Gallery, an independent art gallery selling original artwork online. Visitors browse a small static artwork catalogue and purchase via Yoco Checkout. The site is deployed as an Azure Static Web App with a serverless Node.js API backend, hosted at [buffybraveart.com](https://buffybraveart.com).

## Current commerce flow

The site no longer uses Stripe. For now, products are managed in code while the client decides on a longer-term product-management approach.

```text
Gallery page -> /api/artworks -> functions/src/data/artworks.json
Purchase button -> /api/checkout -> Yoco hosted checkout
```

Yoco expects payment amounts in cents. For example:

```text
1000000 = R10,000.00
```

## Artwork catalogue

Artwork metadata is managed in:

```text
functions/src/data/artworks.json
```

Each artwork record uses this shape:

```json
{
  "id": "artwork-01",
  "name": "Artwork 1",
  "description": "",
  "price": 1000000,
  "currency": "ZAR",
  "imageUrl": "/images/artworks/artwork-01.jpg",
  "status": "available"
}
```

Fields:

- `id` — stable unique slug used by checkout.
- `name` — displayed on the gallery card and sent to Yoco metadata.
- `description` — currently stored for future use.
- `price` — amount in cents.
- `currency` — use `ZAR`.
- `imageUrl` — public image URL or local static site path.
- `status` — only `available` records appear in the gallery; use `draft` or `sold` to hide artwork.

## Images

Current artwork images live in:

```text
frontend/images/artworks/
```

Reference them from the catalogue with site-relative paths, for example:

```json
"imageUrl": "/images/artworks/artwork-01.jpg"
```

## Required secrets

Deployment must provide this app setting / GitHub secret:

```text
YOCO_SECRET_KEY
```

`FRONTEND_URL` is set by Terraform to the production domain and is used for Yoco success/cancel/failure redirects.

## Validation

Useful checks before opening or updating a PR:

```bash
cd functions
npm ci
node --check src/functions/checkout.js
node --check src/functions/artworkCache.js
node -e "JSON.parse(require('fs').readFileSync('src/data/artworks.json','utf8')); console.log('artworks json ok')"
npm audit --audit-level=high
```
