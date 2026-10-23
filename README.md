# MAISON fragrance storefront

Live: https://toubaslam.github.io/Test1/

A responsive storefront combining shopping and discovery patterns inspired by ALT and Scentora, with original MAISON branding, content, artwork, and a proposed catalog. See [feature status](docs/FEATURES.md) for implemented features and outstanding commerce integrations.

## Local preview

Run `python -m http.server 4173 --bind 127.0.0.1` from this folder, then open http://127.0.0.1:4173/. Use an HTTP server: ES module imports do not work by opening index.html as a file URL.

No build step is required. GitHub Pages serves the repository root from main. Routes use URL hashes, so product links and refreshes work under /Test1/.

## Customize

- `catalog.js`: proposed products, note profiles, size prices in integer cents, curated sets, articles, and integration availability.
- `app.js`: page rendering and browser interactions.
- `shop-core.js`: filtering, recommendations, bag validation, and price totals.
- `site.css`: layouts and responsive styles. The previous style.css and storefront scripts are retained as history and are not loaded.
- `assets/maison-campaign.png`: original artwork; the prompt is in `assets/GENERATION.md`.

## Validate

Run `npm test` for unit tests and `npm run check` for syntax checks. For browser QA, run `npm install`, install Playwright Chromium with `npx playwright install chromium`, start the local server above, and run `npm run test:browser`. To use a system Chrome installation, set `CHROME_PATH` to its executable. Browser screenshots go to ../qa-artifacts/.

## Before accepting orders

Products, prices, and variants are indicative. Checkout, identity, verified reviews, email collection, fulfillment, offers, rewards, and partner programs need confirmed business data and service integrations. No payments or orders are collected. Do not enable commerce by only toggling a config flag; use a backend that validates inventory, price, tax, and shipping.


## Expanded perfume details and reference catalogs

Every MAISON concept now has a product dossier: descriptive accords, three-stage scent journey, suggested moments, wardrobe pairings, sizes and per-10-ml prices, specification status, and a product-specific FAQ. See `perfume-details.js` and `perfume-details.css`.

The inspiration library at `#/references` contains an attributed snapshot of 288 public ALT and Scentora listings. It includes images, note diagrams, published ingredient disclosures, options, SKU, source-feed price, availability, and searchable reference fields where available. These products are not MAISON inventory and cannot be added to the MAISON bag. Reference detail pages link to the original retailer. Feed pricing may exclude automatic storefront discounts.

The snapshot lives in `data/reference-catalogs.json`. Refresh public factual data with `python scripts/import-reference-catalogs.py --snapshot-date YYYY-MM-DD`, supplying the intended local snapshot date. The script does not import marketing descriptions or customer reviews and does not access checkout or accounts.

Run `npm test` for all 11 unit/data tests, and `npm run test:details` with the preview server and Playwright installed for the expanded product and reference-library browser checks.
