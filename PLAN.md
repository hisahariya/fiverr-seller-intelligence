# Fiverr Seller Intelligence — Execution Plan

A standalone venture (separate from the design agency and Studio Command CRM) that helps Fiverr
sellers build and improve their gigs with structured category intelligence and, over time,
real benchmarks contributed by sellers.

Live: https://sarucreatin.github.io/fiverr-seller-intelligence/ (GitHub Pages)
Also hosted on Cloudflare Workers static assets (`wrangler.jsonc`, deploys from `main` with `npx wrangler deploy`, no build step). `.assetsignore` keeps PLAN.md and `marketing/` off the Cloudflare site.

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
- [x] Homepage v3 (2026-09-29), from a competitor review (FivData, Fivlytics, eRank, vidIQ): search-first hero with
      "Find keywords" (category/keyword autocomplete → keywords, 5 tags, title idea, suggested prices) and
      "Check my title" (title score + fixes + title ideas, category auto-detected); "Built for where you are"
      (New / Level 1 / Level 2); "Safe for your Fiverr account" + FAQ with FAQPage schema.
- [x] Industry profile (2026-09-29, `assets/industry.js`): "{Category} at a glance" card in the Builder and Health
      Check — price range, delivery, extras, top keyword, a suggested price ladder, buyer keywords (ticked when used).
      The Health Check adds "You vs. a strong {category} gig": 8 rows (title, tags, description, Basic price, tiers,
      delivery, extras, gallery) using the engine's own thresholds, each with a specific fix. The Builder marks the
      draft's prices on the ladder and explains the seller-level adjustment. Deliberately NOT real sellers' profiles
      (would need scraping + raises privacy issues); figures are labelled as suggested starting points.
- [ ] Industry profile → real data: when benchmark contributions allow, replace suggested figures with per-category
      medians ("based on N sellers"). This is the natural core of the paid Growth Intelligence tier.
- [ ] Optional: one public SEO page per category (40 pages, e.g. "Logo Design on Fiverr: prices, tags and keywords")
      generated from the same profile.
- [ ] **Decision needed**: pricing vs the market. FivData Pro is $1.99/mo; our Growth Intelligence is $19/mo.
- [x] Analytics (GoatCounter, site code `gighealthcheck`) on all pages.
      **Action needed**: claim the site code free at goatcounter.com.
- [x] Forms via FormSubmit (waitlist, makeover requests, benchmark sharing).
      **Action needed**: click the one-time FormSubmit activation email on the first submission.
- [x] 3 SEO articles in `blog/` (titles, pricing, description writing), cross-linked and listed in the
      homepage Guides section
- [x] Description check scores by characters against Fiverr's 1,200-character limit (full points at
      600–1,200, warning above 1,200). Builder descriptions currently max out at ~890 characters; builder.js
      drops the "How it works" then "Why work with me" sections if a category ever pushes one over.
- [x] Distribution copy (`marketing/distribution-posts.md`) — **Action needed**: post it (update links
      to point at the Gig Builder, which is now the stronger hook)
- [ ] 1 more article (review velocity)
- [ ] Testimonials once the first makeovers are delivered
- [ ] Short-form video walkthrough of the Gig Builder for TikTok/YouTube Shorts

## Architecture
- Static HTML/CSS/JS only — no server, no build step. Served by GitHub Pages.
- `assets/site.css` shared styles · `assets/builder.js` gig generator · `assets/scoring.js` 8-dimension engine
- `data/categories-1..4.js` the category dataset (loaded as scripts so it also works from `file://`)
- **Site header** (same on all 7 pages, blog included): logo mark, "Free tools" dropdown with descriptions,
  Guides, Pricing, "Build free" CTA; gliding hover highlight; compacts on scroll with a reading-progress line;
  phones get a full-screen menu and the header hides on scroll down / returns on scroll up. Markup lives in each
  page (no JS needed to see it); behaviour is in `motion.js`, styles in the Header block of `site.css`.
  To change the header, edit `tools/header.pl` and run `perl tools/header.pl .` from Git Bash; it rewrites the
  header on every page and is safe to re-run. `tools/` is excluded from the Cloudflare copy via `.assetsignore`.
- `assets/industry.js` Industry profile (category benchmark + "You vs. a strong gig"), used by `builder.html` and
  `tool.html`; styles in the "Industry profile" block of `site.css`.
- `assets/finder.js` homepage quick tools (keyword search + title check), built on the dataset, `builder.js` and
  `scoring.js`. Title category detection is word-level with light stemming ("edit videos" → Video Editing).
- `assets/motion.js` + the Motion block in `site.css`: sticky glass header, scroll reveals (`data-reveal`,
  `data-stagger`, `data-count`), cursor spotlight (`.spot`), hover lift (`.lift`), result cascades. No libraries.
  Entrances animate `translate`, so `transform` stays free for hovers. Everything is disabled under
  `prefers-reduced-motion`, and content is only hidden for reveal once JS has added the `js` class.
- A neo-brutalist redesign was tried and rejected (2026-09-28). It is kept on the local git branch
  `design/neo-brutalist` and exported to OneDrive ("Fiverr Seller Intelligence - Neo-brutalist design").
