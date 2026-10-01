// Where the category numbers come from and how far to trust them. Read by assets/trust.js.
//
// - batches:    when each category's guidance figures were written (categories not listed = initialRelease)
// - checks:     date a person last compared the category with live Fiverr gigs by hand, e.g.
//               'logo-design': '2026-10-15'. Leave a category out until it has really been checked.
// - benchmarks: real numbers shared anonymously by sellers through the Health Check, e.g.
//               'logo-design': { sellers: 34, updated: '2026-11-01', basic: 30, standard: 70, premium: 140 }
//               Use medians. Shown as "Early seller data" under 20 sellers and "Seller data" from 20.
window.DATA_META = {
  initialRelease: '2026-09-27',
  batches: {
    '2026-10-01': [
      'business-cards', 'flyer-design', 'packaging-design', 'book-cover-design', 'tshirt-design', 'banner-ads',
      'infographic-design', 'product-rendering', 'website-development', 'wix-websites', 'webflow-development',
      'speed-optimization', 'game-development', 'chrome-extension', 'local-seo', 'tiktok-ads', 'amazon-ppc',
      'youtube-seo', 'marketing-strategy', 'ugc-videos', 'video-ads', 'subtitles-captions', 'whiteboard-animation',
      'website-content', 'product-descriptions', 'ghostwriting', 'scriptwriting', 'singers-vocalists', 'sound-design',
      'lead-generation', 'data-entry', 'ecommerce-management', 'financial-modeling', 'quickbooks-setup',
      'excel-automation', 'data-dashboards', 'photo-retouching', 'product-photography', 'ai-agents', 'ai-video'
    ]
  },
  checks: {},
  benchmarks: {},
  changelog: [
    ['2026-10-01', 'Added 40 subcategories (80 in total), including new Finance, Data and Photography groups. Bookkeeping moved to Finance.'],
    ['2026-09-27', 'First 40 categories published as guidance.']
  ]
};
