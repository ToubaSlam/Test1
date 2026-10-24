# Eden Musk fragrance storefront

Live: https://toubaslam.github.io/Test1/

The main collection presents 47 actual Scentora perfume listings in the current source snapshot. Products retain their original names, brands, pictures, bottle options, SKU, source prices, notes, and published ingredient details. Descriptions are written in original wording around the published facts, not copied marketing prose. No invented Eden Musk perfume is used in the active collection.

## Preview locally

Run `python -m http.server 4173 --bind 127.0.0.1` in this folder, then open http://127.0.0.1:4173/. ES modules require an HTTP server. No application build is required. GitHub Pages serves main/root; hash routes work under /Test1/.

## Source files

- `catalog.js`: store settings, actual perfume import, featured combinations, and original journal articles.
- `data/store-products.js`: generated main-shop dataset, with exact source options and prices.
- `actual-products.js` / `actual-products.css`: real product photos, detailed pages, note diagrams, ingredients, specifications, variant images, SKU/stock display, and sticky bag controls.
- `app.js` / `site.css`: navigation, collections, filters, pagination, search, quiz, favorites, comparisons, bundles, and bag.
- `shop-core.js`: variant selection, validated bag state, source-price totals, filtering, and matching.
- `data/reference-catalogs.json`: the complete 288-listing public-feed snapshot, including bundles, gifts, and store services.
- `reference-catalogs.js`: additional source-data browser. The actual perfumes also appear directly in the main shop.

Source images stay branded Scentora; they are not relabeled as Eden Musk bottles. The former prototype scripts and generated campaign asset are retained but are not used to represent the actual products.

## Refresh published facts

Run `python scripts/import-reference-catalogs.py --snapshot-date YYYY-MM-DD`, then `python scripts/build-store-catalog.py`. Use the intended local snapshot date. Review changed source classifications, prices, stock, and test snapshot expectations before publishing. Public-feed prices may exclude automatic retailer campaign discounts. Note names extracted from retailer text do not establish a complete note pyramid; source diagrams are displayed when supplied.

## Validation

Run `npm test` and `npm run check`. For browser checks: install dependencies, install Playwright Chromium with `npx playwright install chromium`, start the preview server above, then run `npm run test:browser` and `npm run test:details`. Set `CHROME_PATH` to use a system Chrome executable instead. Screenshots are stored in ../qa-artifacts/.

## Ordering status

The bag is a browser-local plan using actual source product options and prices. Eden Musk inventory, payments, accounts, shipping, fulfillment, reviews, discounts, and gifts are not connected. Source availability is a dated retailer observation, not Eden Musk stock. Retailer promotions and guarantees do not automatically apply to a Eden Musk bag. Original retailer links are available on each perfume page.
