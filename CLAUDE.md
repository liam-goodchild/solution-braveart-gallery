# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Secrets

Never read, display, or reference the contents of `functions/local.settings.json` or `infra/*.tfvars` — they contain secrets.

## Project Overview

Buffy Braveart Gallery — an art gallery e-commerce site built as an Azure Static Web App with a serverless API backend. Visitors browse artwork and purchase via Stripe Checkout. Artwork catalogue and images are managed directly in Stripe (products).

## Naming Convention

All Azure resources follow: `{type}-{project}-{env}-{region}-{instance}`

| Variable    | Value           |
| ----------- | --------------- |
| Project     | `braveart`      |
| Environment | `prd`           |
| Region      | `uks` (uksouth) |
| Instance    | `01`            |

| Resource       | Name                        |
| -------------- | --------------------------- |
| Resource group | `rg-braveart-prd-uks-01`    |
| Static Web App | `stapp-braveart-prd-uks-01` |

## Architecture

**Frontend** (`frontend/`): Vanilla HTML/CSS/JS (no framework, no build step). Each page has its own JS file loaded directly by the browser. CSS uses BEM naming (`card__body`, `btn--danger`). Prices are stored in pence and formatted client-side (÷100).

**API** (`functions/`): Azure Functions v4 (Node.js, programming model v4). Each function is a standalone file in `functions/src/functions/`. Functions are registered via `app.http()` — no function.json files.

**Data flow**:

- Artwork catalogue → Stripe Products (active products with a default price)
- Artwork images → Stripe product images
- Purchases → Stripe Checkout sessions (currency: GBP)

**Secrets**: Stored in GitHub Actions environments (`dev`, `prd`). OIDC used for Azure auth. `STRIPE_SECRET_KEY` and `FRONTEND_URL` are set as SWA app settings via Terraform. Local dev reads from `functions/local.settings.json`.

**Auth & routing** (`frontend/staticwebapp.config.json`): No role-based restrictions. `/gallery` rewrites to `gallery.html`. Global security headers applied (CSP, X-Frame-Options, X-Content-Type-Options).

**Infrastructure** (`infra/`): Terraform (azurerm ~> 4.0). Custom domain: `buffybraveart.com`. Stripe secret key passed as a Terraform variable.

**CI/CD** (`.github/workflows/`): GitHub Actions with OIDC authentication.

- `braveart-swa.yml` — deploys frontend + API to SWA (manual trigger, `dev`/`prd` environments)
- `braveart-infra.yml` — runs Terraform plan/apply/destroy (auto-triggers on `infra/**` pushes to feature branches)

## Development

### Local API

```bash
cd functions && npm install
# Create functions/local.settings.json with required env vars (see below)
func start
```

The frontend is static files — serve `frontend/` with any HTTP server, or use `swa start` from Azure Static Web Apps CLI.

### Required Environment Variables

| Variable            | Used by                               |
| ------------------- | ------------------------------------- |
| `STRIPE_SECRET_KEY` | `getArtworks`, `checkout`             |
| `FRONTEND_URL`      | `checkout` (success/cancel redirects) |

### API Endpoints

| Method | Route           | Auth      | Function      |
| ------ | --------------- | --------- | ------------- |
| GET    | `/api/artworks` | anonymous | `getArtworks` |
| POST   | `/api/checkout` | anonymous | `checkout`    |
