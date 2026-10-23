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
