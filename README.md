# Kita Invite — Baseline Snapshot (Preview Only)

**Status: Stage 2 — Needs Fixes (audit by Project Monitor Agent ongoing).**
This repository is the code source for auditing Kita Invite (formerly VOWORA),
a digital invitation platform prototype. It is NOT production.

## What this snapshot is

- `index.html` — exact snapshot of the Muse artifact `vowora` (build v6,
  content SHA-256 `fc5cd3ec1c49653b19946deef2845bef2b7ea894333378f84a6c3439cc12c9ef`),
  exported 2026-11-10 01:29 WIB. Single self-contained file (9 assets inlined).
  No functional changes were made for this snapshot.
- Branding: **Kita Invite**. All invitation IDs, slugs, and demo data are
  preserved as in the prototype. Data is mock/demo data stored in the
  browser (localStorage); there is no real backend in this snapshot.

## Branches

- `main` — baseline snapshot (this commit).
- `muse-preview` — preview branch, auto-deployed to Cloudflare Pages
  (preview deployments only; production deployments disabled).

## Preview

Cloudflare Pages project (separate preview project, not production):
preview deployments are enabled for branches/PRs. Every change is
reviewable via diff and a preview URL. Preview URLs are public unless
protected by Cloudflare Access — only dummy/demo data lives here.

## Rules for this repo

- No merges to `main` without Marko's approval.
- No production deployments, no production domain/DNS, no changes to
  Workers, D1, R2, routing, or any other Cloudflare project.
- The Cloudflare Full Stack production target remains a separate decision
  (see the plan document, not this repo).
- Do not declare the Stage 2 audit passed just because a build succeeds.
