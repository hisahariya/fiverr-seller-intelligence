# Fiverr Seller Intelligence — Execution Plan

A standalone venture (separate from the design agency and Studio Command CRM) that helps Fiverr
sellers build and improve their gigs with structured category intelligence and, over time,
real benchmarks contributed by sellers.

Live: https://sarucreatin.github.io/fiverr-seller-intelligence/

## The offer (v2)
- **Free toolkit**: Gig Builder + Gig Health Check + Category Intelligence (40 categories)
- **Gig Makeover — $49/gig (done for you)**: rewritten title/description/tags, repriced packages,
  3 designed gallery images, before/after score. Delivered by the design agency. Requests arrive
  by email through the makeover form on the homepage.
- **Growth Intelligence — $19/mo (waitlist)**: benchmarks from real seller data plus monthly re-scoring.
  Launch only once enough anonymous contributions exist.

## Data strategy
- **No scraping of Fiverr.** It violates Fiverr's Terms of Service and would put the business at risk.
- **Category dataset** (`data/categories-*.js`): 40 subcategories across 8 groups, each with keywords,
  tags, title templates, package structures, extras, FAQs, gallery ideas and tactics. Prices are
  labeled as suggested starting points everywhere, not market data.
- **Real benchmarks**: Health Check has an opt-in (off by default) "share anonymously" checkbox that
  sends only the category and numbers (prices, delivery, revisions, rating, reviews, gallery, response,
  extras, tag count, score) to FormSubmit → infosahariyaislam@gmail.com. Never titles, descriptions or tags.
- [ ] When contributions pass ~100/month, move them from email into a real store (Google Sheet via
      Apps Script, or Supabase) and compute per-category medians to replace the suggested prices.

## Status
- [x] Gig Builder (`builder.html`) — generates titles, 5 tags, description, 3 packages, extras, FAQ, gallery ideas
- [x] Gig Health Check (`tool.html`) — category-aware scoring, prefill from Builder, opt-in data sharing
- [x] Category Intelligence (`categories.html`) — searchable and filterable, deep-links into Builder
- [x] Homepage rebuilt around the 3-tool workflow and new offer
- [x] Analytics (GoatCounter, site code `gighealthcheck`) on all pages.
      **Action needed**: claim the site code free at goatcounter.com.
- [x] Forms via FormSubmit (waitlist, makeover requests, benchmark sharing).
      **Action needed**: click the one-time FormSubmit activation email on the first submission.
- [x] 2 SEO articles, cross-linked
- [x] Distribution copy (`marketing/distribution-posts.md`) — **Action needed**: post it (update links
      to point at the Gig Builder, which is now the stronger hook)
- [ ] 1-2 more articles (description writing, review velocity)
- [ ] Testimonials once the first makeovers are delivered
- [ ] Short-form video walkthrough of the Gig Builder for TikTok/YouTube Shorts

## Architecture
- Static HTML/CSS/JS only — no server, no build step. Served by GitHub Pages.
- `assets/site.css` shared styles · `assets/builder.js` gig generator · `assets/scoring.js` 8-dimension engine
- `data/categories-1..4.js` the category dataset (loaded as scripts so it also works from `file://`)
