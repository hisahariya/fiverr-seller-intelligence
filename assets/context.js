// The seller's work in progress, shared by every tool on this device.
// No account: it lives in this browser's localStorage only, is never sent anywhere,
// and can be cleared from any tool page. Two parts:
//   explore: the category / niche / level the seller is looking at (homepage search, Builder, categories)
//   gig:     the gig they're working on (Health Check fields, a checked title, or a Builder draft sent to the check)
(function (root) {
  const KEY = 'ghc-context-v1';
  const GIG_FIELDS = ['cat', 'title', 'tags', 'description', 'basicPrice', 'standardPrice', 'premiumPrice', 'deliveryDays',
    'revisions', 'rating', 'reviewCount', 'galleryImages', 'responseTime', 'hasVideo', 'extrasCount'];
  // About the seller rather than one gig, so they carry over when a new gig is started
  const ACCOUNT_FIELDS = ['rating', 'reviewCount', 'responseTime'];

  function read() {
    try {
      const v = JSON.parse(localStorage.getItem(KEY) || 'null');
      return v && typeof v === 'object' ? v : {};
    } catch (e) { return {}; }
  }
  function write(v) { try { localStorage.setItem(KEY, JSON.stringify(v)); } catch (e) {} }
  const keep = (obj, keys) => Object.fromEntries(keys.filter(k => obj[k] !== undefined).map(k => [k, obj[k]]));

  const ctx = {
    GIG_FIELDS,
    get: read,
    isEmpty() { const v = read(); return !v.explore && !v.gig; },

    explore(patch) {
      const v = read();
      v.explore = Object.assign({}, v.explore, patch);
      v.updated = Date.now();
      write(v);
      refreshNotes();
    },

    // Replace the saved gig with exactly these fields (empty values are dropped)
    saveGig(gig, source) {
      const v = read();
      const g = {};
      GIG_FIELDS.forEach(k => { if (gig[k] !== undefined && gig[k] !== null && gig[k] !== '' && gig[k] !== false) g[k] = gig[k]; });
      if (Object.keys(g).length) v.gig = Object.assign(g, { source });
      else delete v.gig;
      v.updated = Date.now();
      write(v);
      refreshNotes();
    },

    // Merge into the saved gig. A different category (or fresh: true) starts a new gig,
    // keeping only the seller-level numbers (rating, reviews, response time).
    updateGig(patch, source, fresh) {
      const old = read().gig || {};
      const same = !fresh && !(patch.cat && old.cat && patch.cat !== old.cat);
      ctx.saveGig(Object.assign({}, same ? old : keep(old, ACCOUNT_FIELDS), patch), source);
    },

    clear() {
      try { localStorage.removeItem(KEY); localStorage.removeItem('ghc-draft'); } catch (e) {}
      refreshNotes();
    }
  };

  // Any [data-saved-note] element says what's remembered and offers to clear it
  function refreshNotes() {
    document.querySelectorAll('[data-saved-note]').forEach(el => {
      el.hidden = ctx.isEmpty();
      if (el.hidden || el.dataset.ready) return;
      el.dataset.ready = '1';
      el.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12 5 5 9-10"/></svg>'
        + '<span>Your work is saved in this browser only, so it carries over between tools. No account needed.</span>'
        + '<button type="button">Clear saved info</button>';
      el.querySelector('button').addEventListener('click', () => {
        ctx.clear();
        // Start the page over without the saved details (and without a ?cat= the seller came in with)
        location.href = location.pathname;
      });
    });
  }

  root.SellerContext = ctx;
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', refreshNotes);
  else refreshNotes();
})(window);
