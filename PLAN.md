# Fiverr Seller Intelligence — Execution Plan

A standalone venture (separate from the design agency and Studio Command CRM) that helps Fiverr
sellers build and improve their gigs with structured category intelligence and, over time,
real benchmarks contributed by sellers.

Live: https://hisahariya.github.io/fiverr-seller-intelligence/ (GitHub Pages, repo github.com/hisahariya/fiverr-seller-intelligence)
Moved 2026-10-01: the original account `sarucreatin` started returning 404 (repo, profile and Pages site), so the old
URL sarucreatin.github.io/fiverr-seller-intelligence is dead. Update any links already posted. The private portfolio
branch from that repo was deliberately NOT moved here (this repo is public).
Also hosted on Cloudflare Workers static assets (`wrangler.jsonc`, deploys from `main` with `npx wrangler deploy`, no build step). `.assetsignore` keeps PLAN.md and `marketing/` off the Cloudflare site.

## The offer (v2)
- **Free toolkit**: Gig Builder + Gig Health Check + Category Intelligence (80 subcategories, 11 groups)
- **Gig Makeover — $49/gig (done for you)**: rewritten title/description/tags, repriced packages,
  3 designed gallery images, before/after score. Delivered by the design agency. Requests arrive
  by email through the makeover form on the homepage.
- **Growth Intelligence — $19/mo (waitlist)**: benchmarks from real seller data plus monthly re-scoring.
  Launch only once enough anonymous contributions exist.

## Data strategy
- **No scraping of Fiverr.** It violates Fiverr's Terms of Service and would put the business at risk. Fiverr also
  blocks it in practice: an automated visit to fiverr.com/categories (2026-10-01) got a "Press & Hold" bot check.
  The public site promises this too ("Nothing is scraped from Fiverr", `data.html`).
- **Category dataset** (`data/categories-1..8.js`): 80 subcategories across 11 groups (Finance, Data and Photography
  added 2026-10-01), each with keywords, tags, title templates, package structures, extras, FAQs, gallery ideas and
  tactics. Written as guidance, NOT measured from Fiverr. Every price is labelled as a suggested starting point.
- **Data trust layer** (`data/meta.js` + `assets/trust.js` + `data.html`): every category shows a label —
  Guidance → Spot-checked (date) → Early seller data (<20 sellers) → Seller data (20+, medians) — next to its prices
  in the Builder, Health Check, Category Intelligence and homepage search. `data.html` explains the method publicly,
  lists all 80 categories with their label (live from `data/meta.js`) and keeps a changelog.
- **"Is this price right?"** on every category: Too low / About right / Too high + optional Basic price → FormSubmit
  email ("Price feedback: {category}"). Only category, answer, price and page are sent.
- **Real benchmarks**: Health Check has an opt-in (off by default) "share anonymously" checkbox that
  sends only the category and numbers (prices, delivery, revisions, rating, reviews, gallery, video yes/no, response,
  extras, tag count, score) to FormSubmit → infosahariyaislam@gmail.com. Never titles, descriptions or tags.
- **Monthly spot-check routine** (a person, in a normal browser — never a script):
  1. Pick ~5 categories (start with the most-used ones and any with "Too low/Too high" feedback).
  2. Search Fiverr for the category's main keyword; on page 1, note Basic/Standard/Premium prices and Basic delivery
     of ~10 Level 1–2 gigs.
  3. If our suggested price is off from the median by more than ~30%, update the category in `data/categories-*.js`.
  4. Record the date in `data/meta.js` → `checks: { 'category-id': 'YYYY-MM-DD' }` and add a `changelog` line.
- [ ] When contributions pass ~100/month, move them (and price feedback) from email into a real store (Google Sheet
      via Apps Script, or Supabase), compute per-category medians, and record them in `data/meta.js` → `benchmarks`.
      Categories then switch label automatically; replacing the suggested prices with the medians is the next step.

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
- [x] 80 subcategories + data trust layer (2026-10-01): 40 new subcategories, trust labels everywhere prices appear,
      "Is this price right?" feedback, public `data.html`. All 80 pass a consistency check: Builder drafts get full
      title/pricing/description/SEO marks at every seller level and match the Industry profile 8/8.
- [x] Pricing rule made category-aware (`GigScoring.premiumCap`): Premium may sit up to max(6×, 1.4 × the category's
      own Premium/Basic ratio) above Basic. Fixes the old contradiction where Builder drafts for e.g. Mobile App
      Development ($150/$500/$1,200) were marked down by the Health Check.
- [x] Homepage title checker: IDF-weighted category detection (rare words count more, buyer phrases and the
      category noun add bonuses, hyphens split). 48/48 realistic seller titles and 314/320 template titles detected;
      the misses are genuinely ambiguous pairs (e.g. AI agent vs AI chatbot) the user can change in the dropdown.
- [x] **v2 design (2026-10-03)**: clean, light, marketplace-style UI modelled on how Fiverr's own site is laid out
      (white pages, Figtree type, header search, category bar, colour tiles, gig-style cards, 4-column footer) so
      sellers feel at home. It keeps our own name, logo, deeper green (#0f8a5f) and the "Not affiliated with Fiverr"
      notice; it never copies Fiverr's logo, wording or assets. Homepage: green search banner (Find keywords / Check
      my title), example gig card, Popular categories tiles (→ Builder), "See your gig the way buyers do" (4 live
      Builder drafts as gig cards), tools, levels, safety + FAQ, pricing, Makeover, guides, waitlist.
      The previous dark design is tagged `v1-dark` if it's ever needed again.
- [ ] Optional: one public SEO page per category (80 pages, e.g. "Logo Design on Fiverr: prices, tags and keywords")
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
- `data/categories-1..8.js` the category dataset (loaded as scripts so it also works from `file://`); `data/meta.js`
  its provenance (batches, spot-checks, benchmarks, changelog); `assets/trust.js` the labels + price feedback;
  `data.html` the public methodology page. New categories must keep the same fields: 6 kw, 6 tags, 4 titles,
  3 pkgs (prices rising, Standard ≥1.4× and Premium ≥1.8× Basic), 4 extras, 3 FAQs, 3 gallery ideas, 3 tips —
  and be added to a `batches` date in `data/meta.js`.
- **Site header + footer** (same on all 8 pages, blog included): logo, category search (→ `categories.html?q=`),
  "Free tools" dropdown with descriptions, Guides, Pricing, "Build free" CTA, and a category bar with the 11
  groups in Fiverr's order (→ `categories.html?group=`). On the homepage the header search stays hidden until the
  hero search scrolls away. The bar spreads across the width when it fits and fades/scrolls when it doesn't.
  Phones get a full-screen menu with search, and the header hides on scroll down / returns on scroll up. The
  footer has 4 link columns plus the disclaimer. Markup lives in each page (no JS needed to see it); behaviour is
  in `motion.js`, styles in the Header/Footer blocks of `site.css`. To change either, edit `tools/header.pl` and
  run `perl tools/header.pl .` from Git Bash; it rewrites every page and is safe to re-run. `tools/` is excluded
  from the Cloudflare copy via `.assetsignore`.
- `categories.html` reads `?group=` and `?q=`, keeps the address bar in step, and filters in place when the
  category bar is clicked. Search matches at word starts ("ai" ≠ "email"), skips filler words, and falls back to
  the closest partial matches when nothing matches every word.
- `assets/industry.js` Industry profile (category benchmark + "You vs. a strong gig"), used by `builder.html` and
  `tool.html`; styles in the "Industry profile" block of `site.css`.
- `assets/finder.js` homepage quick tools (keyword search + title check), built on the dataset, `builder.js` and
  `scoring.js`. Title category detection is word-level with light stemming ("edit videos" → Video Editing) and
  IDF weighting (rare words count more), plus bonuses for whole buyer phrases and the category noun.
- `assets/motion.js` + the Motion block in `site.css`: header behaviour, quiet scroll reveals (`data-reveal`,
  `data-stagger`, `data-count`), hover lift (`.lift`), result cascades. No libraries. Entrances animate
  `translate`, so `transform` stays free for hovers. Everything is disabled under `prefers-reduced-motion`, and
  content is only hidden for reveal once JS has added the `js` class.
- Visual testing without the preview pane: headless Edge screenshots (`msedge --headless=new --screenshot`).
  Its window can't go below ~500px wide, so phone widths need an iframe of the right width; use
  `--force-prefers-reduced-motion` or the capture can catch fade-ins half-way.
- A neo-brutalist redesign was tried and rejected (2026-09-28). It is kept on the local git branch
  `design/neo-brutalist` and exported to OneDrive ("Fiverr Seller Intelligence - Neo-brutalist design").
