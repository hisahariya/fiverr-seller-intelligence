# Fiverr Seller Intelligence — Execution Plan

A standalone venture (separate from the design agency and Studio Command CRM) that helps Fiverr sellers diagnose and improve their gigs using data-driven scoring instead of guesswork.

## Phase 1 — MVP Product (Build)
- [x] "Gig Health Check" free tool: paste gig details, get an instant score + recommendations
- [x] Rules-based scoring engine, no backend, runs entirely in the browser
- [ ] Deploy to a static host (GitHub Pages / Netlify / Vercel) with a real domain
- [ ] Add analytics (privacy-friendly, e.g. Plausible) to see actual usage

## Phase 2 — Marketing Site
- [x] Landing page with positioning ("Growth Intelligence for Fiverr Sellers"), value prop, pricing tiers
- [ ] Email capture wired to a real list (ConvertKit/Mailchimp/Buttondown)
- [ ] Testimonials / social proof once first users convert

## Phase 3 — Content & Acquisition
- [x] First SEO article: gig title mistakes (targets long-tail "fiverr gig title" search intent)
- [ ] 2-3 more articles targeting seller pain points (pricing, description writing, review velocity)
- [ ] Distribute in Fiverr seller Facebook groups, r/Fiverr, r/FiverrSellers, Fiverr Forum
- [ ] Consider a short-form video walkthrough of the tool for TikTok/YouTube Shorts

## Phase 4 — Monetization
- [ ] Free tool → email capture → paid "Full Gig Audit" report (one-time)
- [ ] Recurring "Growth Intelligence" tier: monthly re-scoring + competitor comparison
- [ ] Validate willingness to pay before building subscription billing infrastructure

## Product Notes
- Scoring engine covers 8 dimensions: Title Quality, Pricing Strategy, Description Quality,
  Reviews & Rating, Portfolio/Gallery, Response & Delivery, Extras/Upsells, SEO Keyword Alignment.
- Everything is static (HTML/CSS/JS) — no server, no database, no local runtime dependency.
- Files:
  - `index.html` — marketing landing page
  - `tool.html` — Gig Health Check scoring tool
  - `blog/gig-title-mistakes.html` — first content asset
