// Data trust: where a category's numbers come from, how far to trust them, and a way for sellers
// to tell us when the prices look wrong. Reads window.DATA_META (data/meta.js).
(function (root) {
  const META = root.DATA_META || { initialRelease: '', batches: {}, checks: {}, benchmarks: {} };
  const ENDPOINT = 'https://formsubmit.co/ajax/infosahariyaislam@gmail.com';
  const VERIFIED_MIN = 20; // sellers needed before a category counts as "Seller data"
  const esc = s => String(s).replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
  const asDate = iso => new Date(iso + (iso.length === 7 ? '-01' : '') + 'T00:00:00');
  const month = iso => iso ? asDate(iso).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : '';
  const day = iso => iso ? asDate(iso).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) : '';

  const LEVELS = {
    guidance: { label: 'Guidance', meaning: 'Suggested starting points written as guidance. Not yet verified against live gigs or seller data.' },
    checked: { label: 'Spot-checked', meaning: 'A person compared these numbers with live Fiverr gigs by hand on the date shown.' },
    early: { label: 'Early seller data', meaning: 'Based on numbers shared by fewer than 20 sellers. Useful, but still a small sample.' },
    verified: { label: 'Seller data', meaning: 'Based on numbers shared anonymously by 20 or more sellers in this category (medians).' }
  };

  function addedOn(id) {
    for (const [date, ids] of Object.entries(META.batches || {})) if (ids.includes(id)) return date;
    return META.initialRelease;
  }

  // The current trust level of a category and a one-line explanation of it
  function info(cat) {
    const b = (META.benchmarks || {})[cat.id];
    const checked = (META.checks || {})[cat.id];
    if (b && b.sellers >= VERIFIED_MIN) return { level: 'verified', detail: `Based on ${b.sellers} sellers · updated ${month(b.updated)}` };
    if (b && b.sellers > 0) return { level: 'early', detail: `Based on ${b.sellers} seller${b.sellers === 1 ? '' : 's'} so far · updated ${month(b.updated)}` };
    if (checked) return { level: 'checked', detail: `Compared with live gigs by hand on ${day(checked)}` };
    return { level: 'guidance', detail: `Suggested starting points · written ${month(addedOn(cat.id))} · not yet verified` };
  }

  const badgeHtml = level => `<span class="trust-badge lvl-${level}" title="${esc(LEVELS[level].meaning)}">${LEVELS[level].label}</span>`;

  // One line: trust badge, what it means for this category, and a link to the methodology page
  function labelHtml(cat, base) {
    const i = info(cat);
    return `<div class="trust-line">${badgeHtml(i.level)}<span>${esc(i.detail)}</span><a href="${base || ''}data.html">How our data works</a></div>`;
  }

  // "Is this price right?" Sends only the category, the answer and (optionally) a Basic price
  function feedbackHtml(cat, source, myBasic) {
    const v = +myBasic > 0 ? ` value="${+myBasic}"` : '';
    return `<form class="price-check" data-cat="${esc(cat.id)}" data-name="${esc(cat.name)}" data-source="${esc(source)}">
      <p class="pc-q">Do these prices match the ${esc(cat.name)} gigs you see on Fiverr?</p>
      <div class="pc-votes" role="group" aria-label="Your answer">
        <button type="button" data-vote="too low" aria-pressed="false">Too low</button>
        <button type="button" data-vote="about right" aria-pressed="false">About right</button>
        <button type="button" data-vote="too high" aria-pressed="false">Too high</button>
      </div>
      <div class="pc-more" hidden>
        <label>Your Basic price in USD (optional)<input type="number" name="basic" min="5" max="10000" step="1" inputmode="numeric" placeholder="e.g. 30"${v}></label>
        <button type="submit" class="btn btn-sm">Send anonymously</button>
      </div>
      <p class="pc-note">Sends only the category, your answer and the price above. Never your gig text.</p>
      <p class="pc-status" role="status"></p>
    </form>`;
  }

  // One set of listeners serves every feedback form on the page, including ones rendered later
  document.addEventListener('click', e => {
    const btn = e.target.closest && e.target.closest('.price-check [data-vote]');
    if (!btn) return;
    const form = btn.closest('.price-check');
    form.dataset.answer = btn.dataset.vote;
    form.querySelectorAll('[data-vote]').forEach(b => b.setAttribute('aria-pressed', String(b === btn)));
    form.querySelector('.pc-more').hidden = false;
  });
  document.addEventListener('submit', e => {
    const form = e.target.closest && e.target.closest('.price-check');
    if (!form) return;
    e.preventDefault();
    if (!form.dataset.answer) return;
    const status = form.querySelector('.pc-status');
    const basic = parseFloat(form.querySelector('[name="basic"]').value);
    const controls = form.querySelectorAll('button, input');
    const payload = {
      _subject: 'Price feedback: ' + form.dataset.name,
      _template: 'table',
      category: form.dataset.cat,
      answer: form.dataset.answer,
      basic_price: basic > 0 ? basic : '',
      page: form.dataset.source
    };
    controls.forEach(el => { el.disabled = true; });
    status.textContent = 'Sending…';
    fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(payload)
    }).then(r => {
      if (!r.ok) throw new Error('status ' + r.status);
      form.classList.add('sent');
      status.textContent = 'Thanks! Answers like yours are how these numbers get corrected.';
    }).catch(() => {
      controls.forEach(el => { el.disabled = false; });
      status.textContent = "Couldn't send right now. Please try again later.";
    });
  });

  root.DataTrust = { LEVELS, VERIFIED_MIN, info, addedOn, badgeHtml, labelHtml, feedbackHtml, month, day };
})(typeof window !== 'undefined' ? window : globalThis);
