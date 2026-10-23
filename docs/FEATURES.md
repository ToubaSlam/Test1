# MAISON combined storefront

Inspiration reviewed: [ALT](https://altfragrances.com/), [Scentora](https://scentora-fragrance.com/), Scentora's bundle builder and product page. These are design and interaction references. MAISON uses original copy, its own proposed catalog, original bottle artwork, and an original generated campaign image. Neither store's reviews, customers, manufacturing claims, brand marks, prices, or guarantees are represented as MAISON facts.

## Implemented and available now

| Capability | Implementation |
| --- | --- |
| Campaign homepage | Original MAISON image, announcement, category tiles, product rails, brand story, editorial, FAQs, journal |
| Responsive navigation | Desktop shop menu, phone menu, accessible expanded state, search and bag dialogs |
| Catalog and collections | Gender tabs, scent family, price limit, collection edit, search, four sorting choices, reset and empty states |
| Product pages | Shareable hash URLs, bottle/notes/campaign gallery, 30/50/100 ml choices, variant-specific price, quantity, notes pyramid, occasion and season suggestions, information accordions, recommendations |
| Quick shopping | Quick view, size selection, quick add, live bag count |
| Bundles | Choose three or five distinct scents, bottle size, gender filter, selection progress, removable slots, correct per-size totals, add complete set to bag |
| Curated collections | Three editable trios with a path to customize the set |
| Bag | Quantity, remove item, distinct size variants, subtotal, recommendation, progress toward a fragrance wardrobe, persisted optional note |
| Favorites | Persisted personal shortlist, save/unsave, dedicated page |
| Comparison | Select two or three fragrances and compare price, family, top/heart/base notes, occasion, and season |
| Scent quiz | Four questions, back/restart, ranked recommendations, add results as a bundle |
| Scent education | Family guide, interactive concentration-type comparison, note pyramid, original journal articles |
| Reviews UI | Topic filters and an honest empty state; there are no customer reviews to publish yet |
| Support | FAQs, shipping/returns, order tracking availability, retail location availability, partnership and reward program status |
| Privacy | Stored note rendered as text, resilient browser storage reads, local data clearing, no analytics or marketing collection added |
| Publishing | GitHub Pages from main/root; hash routes support direct links and refresh without server rewrites |

## Requires the owner's confirmed data or an external service

| Feature seen on the references | What is still required |
| --- | --- |
| Real purchases and payment | A commerce platform/provider, real SKUs, stock, currency/tax rules, server-side checkout and verified webhooks |
| Discounts, free shipping, free gifts | Confirmed commercial terms; configure and enforce through the commerce backend, not browser-only arithmetic |
| Customer accounts, purchase history | Secure identity and commerce service; no simulated login is provided |
| Order fulfillment and tracking | Actual orders, shipping service, tracking API or verified tracking links |
| Subscriber emails and support submissions | Destination inbox and provider integration, consent/privacy details; no fake submission-success screen |
| Verified review feed and creator videos | Authentic reviews/media, publication permissions, and review provider/order verification |
| Loyalty/referrals, giveaways, affiliates | Approved program rules, reward ledger and partner/referral backend |
| Retail locator, wholesale/private label | Real locations, contact details, eligibility, and business workflow |
| Ingredients, concentration, origin, certifications | Confirmed manufacturer specifications and ingredient/allergen disclosures |
| Returns, guarantees and shipping policies | Approved policies and actual fulfillment regions |

The launch strip and checkout availability screen remain explicit until these are ready. This is a functional browser storefront, not a functioning payment or order system. Setting a browser-side flag does not create a secure checkout.

## Validation

Seven unit tests cover legacy cart migration, malformed data, sizes/quantities, integer price totals, filtering, accent-insensitive search, sorting, recommendations, bundles, and escaping. Automated Chrome checks cover the storefront flows and 19 routes at desktop and phone sizes, including persistence and note injection safety. Screenshots are saved outside the deployable source.
