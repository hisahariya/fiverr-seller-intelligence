(function (root) {
  function clamp(n, lo, hi) { return Math.max(lo, Math.min(hi, n)); }
  function wordCount(s) { return (s.trim().match(/\S+/g) || []).length; }

  function catVocab(cat) {
    return [...new Set(cat.kw.concat(cat.tags).map(s => s.toLowerCase()))];
  }

  function scoreTitle(title, cat, categoryText) {
    const tips = [];
    let score = 0;
    const len = title.trim().length;
    if (len >= 40 && len <= 70) score += 6;
    else if (len >= 20 && len <= 90) { score += 3; tips.push('Aim for 40–70 characters — long enough to be descriptive, short enough to avoid truncation in search results.'); }
    else tips.push('Title length is off target. Buyers scan titles fast — 40–70 characters reads best.');

    if (/^i will\b/i.test(title.trim())) score += 2;
    else tips.push('Fiverr titles read as "I will..." — use that format so your title matches how buyers browse.');

    if ((title.match(/\b[A-Z]{5,}\b/g) || []).length === 0) score += 3;
    else tips.push('Avoid ALL-CAPS words in the title — it reads as spammy and can hurt trust.');

    if (!/[!?]{2,}/.test(title)) score += 2;
    else tips.push('Remove repeated punctuation (!!!, ???) — it looks unprofessional in search listings.');

    const t = title.toLowerCase();
    if (cat) {
      const hit = catVocab(cat).some(k => t.includes(k)) || t.includes(cat.noun.toLowerCase());
      if (hit) score += 2;
      else tips.push(`Your title doesn't use a common search term for ${cat.name}. Try working in "${cat.kw[0]}" or "${cat.kw[1]}".`);
    } else if (categoryText) {
      if (t.includes(categoryText.trim().toLowerCase().split(' ')[0])) score += 2;
      else tips.push('Work your main category keyword naturally into the title for better search matching.');
    }

    return { key: 'title', label: 'Title Quality', score: clamp(score, 0, 15), max: 15, tips };
  }

  function scorePricing(basic, standard, premium, cat) {
    const tips = [];
    let score = 0;
    const hasAll = basic > 0 && standard > 0 && premium > 0;
    if (hasAll) score += 5;
    else tips.push('Offer all three package tiers (Basic/Standard/Premium) — single-price gigs leave money on the table.');

    if (hasAll) {
      const stdRatio = standard / basic;
      const premRatio = premium / basic;
      if (stdRatio >= 1.4 && premRatio >= 1.8) score += 5;
      else tips.push('Widen the price gap between tiers (Standard ≥1.4x Basic, Premium ≥1.8x Basic) so upgrading feels like an obvious value jump.');

      if (premRatio <= 6) score += 2;
      else tips.push('Your Premium tier may be priced too far above Basic — buyers can struggle to see the connection.');
    }

    if (cat) {
      const suggested = cat.pkgs[0][0];
      if (basic >= suggested * 0.5) score += 3;
      else if (basic > 0) tips.push(`Your Basic price is well under the suggested starting point for ${cat.name} (around $${suggested}). Very low prices attract the hardest-to-please buyers.`);
    } else if (basic >= 5) score += 3;
    else if (hasAll) tips.push('A Basic price under $5 often signals a race-to-the-bottom gig — consider raising your floor.');

    return { key: 'pricing', label: 'Pricing Strategy', score: clamp(score, 0, 15), max: 15, tips };
  }

  function scoreDescription(desc) {
    const tips = [];
    let score = 0;
    const words = wordCount(desc);
    if (words >= 120 && words <= 300) score += 6;
    else if (words >= 80 && words <= 400) { score += 3; tips.push('Aim for 120–300 words — enough to build trust and answer objections without losing the reader.'); }
    else tips.push('Description length is off — very short descriptions under-sell you, very long ones lose readers.');

    if (/\n\s*[-•\d]/.test(desc) || (desc.match(/\n/g) || []).length >= 3) score += 3;
    else tips.push('Break the description into short paragraphs or bullet points — walls of text get skipped.');

    if (/(message me|contact me|order now|let'?s (talk|discuss|chat)|reach out|send me)/i.test(desc)) score += 3;
    else tips.push('End with a clear call to action ("Message me before ordering to discuss your project").');

    if (/(revision|turnaround|deliver|delivery)/i.test(desc)) score += 3;
    else tips.push('Mention delivery time and revisions explicitly — it reduces pre-purchase questions and buyer hesitation.');

    return { key: 'description', label: 'Description Quality', score: clamp(score, 0, 15), max: 15, tips };
  }

  function scoreReviews(rating, count) {
    const tips = [];
    let score = 0;
    if (rating >= 4.9) score += 7;
    else if (rating >= 4.7) { score += 5; tips.push("Push toward a 4.9+ average — it's the threshold where buyers stop comparison-shopping as hard."); }
    else if (rating >= 4.5) { score += 3; tips.push('Your rating is below the range top sellers sit in. Consider a polite post-delivery follow-up asking for honest feedback before a review.'); }
    else if (rating > 0) tips.push('A sub-4.5 rating is actively costing you clicks and conversions — prioritize fixing whatever is driving low scores.');

    if (count >= 100) score += 8;
    else if (count >= 30) { score += 5; tips.push('More reviews compound — keep asking satisfied buyers to leave one.'); }
    else if (count >= 10) { score += 3; tips.push('Low review count is a trust gap versus competitors. Consider a limited-time discount to accelerate volume early on.'); }
    else tips.push('Very few reviews. Focus near-term energy on getting your first 10-20 completed orders reviewed.');

    return { key: 'reviews', label: 'Reviews & Rating', score: clamp(score, 0, 15), max: 15, tips };
  }

  function scoreGallery(images, hasVideo, cat) {
    const tips = [];
    let score = 0;
    if (images >= 5) score += 6;
    else if (images >= 3) { score += 4; tips.push('Add more gallery images — 5+ gives buyers enough proof of range and quality.'); }
    else if (images >= 1) { score += 2; tips.push('A single sample image is thin. Buyers browse visually — show more work.'); }
    else tips.push('No gallery images detected. This is one of the highest-leverage fixes available — add samples immediately.');

    if (hasVideo) score += 4;
    else tips.push('Gigs with an intro or process video consistently convert better — consider adding one.');

    if (cat && score < 10) tips.push(`Gallery ideas for ${cat.name}: ${cat.gallery.join('; ')}.`);

    return { key: 'gallery', label: 'Portfolio & Gallery', score: clamp(score, 0, 10), max: 10, tips };
  }

  function scoreResponsiveness(responseHours, revisions, deliveryDays) {
    const tips = [];
    let score = 0;
    if (responseHours <= 1) score += 4;
    else if (responseHours <= 6) { score += 3; tips.push('Faster response time improves your Fiverr ranking and buyer confidence — aim under 1 hour when possible.'); }
    else if (responseHours <= 24) { score += 1; tips.push('Response time over 6 hours can lose impatient buyers to a competitor.'); }
    else tips.push("Slow response time is likely hurting both conversions and Fiverr's internal ranking signals.");

    if (revisions >= 3) score += 3;
    else if (revisions === 2) { score += 2; tips.push('Consider offering 3+ revisions — it reduces buyer anxiety about being "locked in".'); }
    else if (revisions === 1) { score += 1; tips.push('Only 1 revision is thin for most categories — buyers often expect more room to iterate.'); }
    else tips.push('No revisions offered is a red flag for most buyers unless your category norm is fixed-scope.');

    if (deliveryDays > 0 && deliveryDays <= 3) score += 3;
    else if (deliveryDays > 0 && deliveryDays <= 7) { score += 1; tips.push('Faster delivery windows (1–3 days) are a strong differentiator if your workload allows it.'); }
    else if (deliveryDays > 7) tips.push('Long delivery windows can push buyers toward faster competitors — consider a paid "express delivery" extra instead of slowing the base offer.');
    else tips.push('Set a delivery time for your Basic package so buyers know what to expect.');

    return { key: 'response', label: 'Response & Delivery', score: clamp(score, 0, 10), max: 10, tips };
  }

  function scoreExtras(extrasCount, cat) {
    const tips = [];
    let score = 0;
    if (extrasCount >= 3) score += 10;
    else if (extrasCount === 2) { score += 7; tips.push('Add one more paid extra (rush delivery, extra revisions, source files) to lift average order value.'); }
    else if (extrasCount === 1) { score += 4; tips.push('A single extra under-monetizes demand — most top gigs offer 3+.'); }
    else tips.push('No paid extras detected. Extras are pure margin — add at least a rush-delivery or extra-revision option.');

    if (cat && extrasCount < 3) tips.push(`Popular extras in ${cat.name}: ${cat.extras.map(e => e[0]).join(', ')}.`);

    return { key: 'extras', label: 'Extras & Upsells', score: clamp(score, 0, 10), max: 10, tips };
  }

  function scoreSEO(tags, title, description, cat) {
    const tips = [];
    let score = 0;
    const tagList = tags.split(',').map(t => t.trim().toLowerCase()).filter(Boolean);
    if (tagList.length >= 5) score += 5;
    else if (tagList.length >= 3) { score += 3; tips.push('Use all 5 available tag slots — each one is a discoverable search entry point.'); }
    else if (tagList.length >= 1) { score += 1; tips.push("Very few tags used — you're leaving search visibility on the table."); }
    else tips.push('No tags detected. Tags are free search real estate — fill all 5 slots with relevant terms.');

    const haystack = (title + ' ' + description).toLowerCase();
    const matches = tagList.filter(t => haystack.includes(t)).length;
    const aligned = tagList.length > 0 && matches >= Math.min(2, tagList.length);

    if (cat) {
      if (aligned) score += 3;
      else if (tagList.length > 0) tips.push("Your tags don't consistently appear in the title/description — align them so the same keywords repeat across the gig.");
      const vocab = catVocab(cat);
      const overlap = tagList.filter(t => vocab.includes(t)).length;
      if (overlap >= 1) score += 2;
      const missing = cat.tags.filter(t => !tagList.includes(t)).slice(0, 3);
      if (overlap < 2 && missing.length) tips.push(`High-intent tags for ${cat.name} you're not using: ${missing.join(', ')}.`);
    } else {
      if (aligned) score += 5;
      else if (tagList.length > 0) tips.push("Your tags don't consistently appear in the title/description — align them so the same keywords repeat across the gig.");
    }

    return { key: 'seo', label: 'SEO Keyword Alignment', score: clamp(score, 0, 10), max: 10, tips };
  }

  function runAudit(input, cat) {
    return [
      scoreTitle(input.title, cat, input.categoryText),
      scorePricing(input.basicPrice, input.standardPrice, input.premiumPrice, cat),
      scoreDescription(input.description),
      scoreReviews(input.rating, input.reviewCount),
      scoreGallery(input.galleryImages, input.hasVideo, cat),
      scoreResponsiveness(input.responseTime, input.revisions, input.deliveryDays),
      scoreExtras(input.extrasCount, cat),
      scoreSEO(input.tags, input.title, input.description, cat)
    ];
  }

  root.GigScoring = { runAudit, wordCount };
  if (typeof module !== 'undefined') module.exports = root.GigScoring;
})(typeof window !== 'undefined' ? window : globalThis);
