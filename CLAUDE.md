# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Secrets

Never read, display, or reference the contents of `functions/local.settings.json` or `infra/*.tfvars` — they contain secrets.

## Project Overview

Buffy Braveart Gallery — an art gallery e-commerce site built as an Azure Static Web App with a serverless API backend. Artists upload artwork via an admin panel; visitors browse and purchase via Stripe Checkout.

## Naming Convention

All Azure resources follow: `{type}-{project}-{env}-{region}-{instance}`

| Variable | Value |
|---|---|
| Project | `braveart` |
| Environment | `prd` |
| Region | `uks` (uksouth) |
| Instance | `01` |

| Resource | Name |
|---|---|
| Resource group | `rg-braveart-prd-uks-01` |
| Storage account | `stbraveartprduks01` |
| Static Web App | `stapp-braveart-prd-uks-01` |

## Architecture

**Frontend** (`frontend/`): Vanilla HTML/CSS/JS (no framework, no build step). Each page has its own JS file loaded directly by the browser. CSS uses BEM naming (`card__body`, `btn--danger`). Prices are stored in pence and formatted client-side (÷100).

**API** (`functions/`): Azure Functions v4 (Node.js, programming model v4). Each function is a standalone file in `functions/src/functions/`. Functions are registered via `app.http()` — no function.json files.

**Data flow**:
- Artwork metadata → Azure Table Storage (table: `artworks`, partitionKey: `artwork`)
- Artwork images → Azure Blob Storage (container: `artwork-images`, public blob access)
- Image upload is a 3-step client-side process: get SAS URL → PUT to blob → POST metadata
- Purchases → Stripe Checkout sessions (currency: GBP)

**Secrets**: Stored in the ADO `braveart-prd` variable group. Synced to SWA app settings at deploy time via the `deploy-swa` pipeline. Local dev reads from `functions/local.settings.json`.

**Auth & routing** (`frontend/staticwebapp.config.json`): Admin routes and write APIs are restricted to the `admin` role via Azure Static Web Apps built-in auth (AAD). Unauthenticated users get a 302 to `/.auth/login/aad`.

**Infrastructure** (`infra/`): Terraform (azurerm ~> 4.0). Stripe secret key is passed as a variable — use `-var` or a `.tfvars` file (gitignored).

## Development

### Local API

```bash
cd functions && npm install
# Create functions/local.settings.json with required env vars (see below)
func start
```

The frontend is static files — serve `frontend/` with any HTTP server, or use `swa start` from Azure Static Web Apps CLI.

### Required Environment Variables

| Variable | Used by |
|---|---|
| `STORAGE_CONNECTION_STRING` | All functions (Table + Blob) |
| `STORAGE_ACCOUNT_NAME` | `uploadUrl` (SAS generation) |
| `STORAGE_ACCOUNT_KEY` | `uploadUrl` (SAS generation) |
| `STRIPE_SECRET_KEY` | `checkout` |
| `FRONTEND_URL` | `checkout` (success/cancel redirects) |

### API Endpoints

| Method | Route | Auth | Function |
|---|---|---|---|
| GET | `/api/artworks` | anonymous | `getArtworks` |
| POST | `/api/artworks` | admin | `createArtwork` |
| DELETE | `/api/artworks/{id}` | admin | `deleteArtwork` |
| POST | `/api/upload-url` | admin | `uploadUrl` |
| POST | `/api/checkout` | anonymous | `checkout` |
