// Industry profile: what a strong gig in a category looks like, and (in the Health Check)
// a side-by-side of the seller's own gig against it. Built only from the category dataset —
// suggested starting points, never live Fiverr data — and labelled that way on the page.
(function (root) {
  const esc = s => String(s).replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
  const days = n => `${n} day${n === 1 ? '' : 's'}`;
  const plural = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`;
  const cap = s => s.charAt(0).toUpperCase() + s.slice(1);
  const vocabOf = cat => [...new Set(cat.kw.concat(cat.tags).map(s => s.toLowerCase()))];
  const tagsOf = str => String(str || '').split(',').map(t => t.trim().toLowerCase()).filter(Boolean);
  const TIERS = ['Basic', 'Standard', 'Premium'];
  const STATUS = { ok: 'Matches', warn: 'Close', bad: 'Gap', missing: 'Not entered' };
  const ICON = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 20h18M7 16v-4M12 16V8M17 16V5"/></svg>';

  // ---------- Building blocks ----------
  function head(cat) {
    return `<div class="ind-head">
      <span class="ind-kicker">${ICON}Industry profile</span>
      <h2>${esc(cat.name)} at a glance</h2>
      <p class="muted small">${esc(cat.group)} · what a strong gig in this category looks like</p>
    </div>`;
  }

  function stats(cat) {
    const prices = cat.pkgs.map(p => p[0]);
    const ds = cat.pkgs.map(p => p[1]);
    const lo = Math.min(...ds), hi = Math.max(...ds);
    return `<div class="ind-stats">
      <div><span>Price range</span><b>$${Math.min(...prices)}–$${Math.max(...prices)}</b><small>Basic to Premium</small></div>
      <div><span>Delivery</span><b>${lo === hi ? days(lo) : `${lo}–${hi} days`}</b><small>Basic to Premium</small></div>
      <div><span>Paid extras</span><b>${cat.extras.length}</b><small>proven add-ons</small></div>
      <div><span>Top keyword</span><b>${esc(cat.kw[0])}</b><small>${plural(cat.kw.length, 'buyer term')}</small></div>
    </div>`;
  }

  // Suggested price per tier as bars; the seller's own prices (or the draft's) as dashed markers
  function ladder(cat, mine, label) {
    const sugg = cat.pkgs.map(p => p[0]);
    const scale = Math.max(...sugg.concat((mine || []).filter(v => v > 0))) * 1.25;
    const rungs = cat.pkgs.map((p, i) => {
      const mark = mine && mine[i] > 0
        ? `<div class="rung-you" style="--y:${(mine[i] / scale * 100).toFixed(1)}%"><span>${label} $${mine[i]}</span></div>`
        : '';
      return `<div class="rung">
        <div class="rung-track"><div class="rung-bar" style="--h:${(p[0] / scale * 100).toFixed(1)}%;--i:${i}"></div>${mark}</div>
        <b>$${p[0]}</b><span class="tier">${TIERS[i]} · ${days(p[1])}</span>
        <small title="${esc(p[2])}">${esc(p[2])}</small>
      </div>`;
    }).join('');
    const legend = `<p class="legend"><span><i class="sw-sugg"></i>Suggested</span>${mine ? `<span><i class="sw-you"></i>${label}</span>` : ''}</p>`;
    return `<div class="ladder">${rungs}</div>${legend}`;
  }

  function keywords(cat, text) {
    const t = String(text || '').toLowerCase();
    const used = cat.kw.filter(k => t.includes(k.toLowerCase()));
    const chips = cat.kw.map(k => `<span class="chip${used.includes(k) ? ' used' : ''}">${esc(k)}</span>`).join('');
    const note = used.length
      ? `✓ ${used.length} of ${cat.kw.length} already in your title or tags`
      : 'None of these are in your title or tags yet';
    return `<div class="chips">${chips}</div><p class="ind-note">${note}</p>`;
  }

  function more(cat) {
    const block = (title, items) => `<details class="ind-more"><summary>${title}</summary><ul>${items}</ul></details>`;
    return block('Extras buyers add', cat.extras.map(e => `<li><b>${esc(e[0])}</b> · +$${e[1]}</li>`).join(''))
      + block('Gallery that converts', cat.gallery.map(x => `<li>${esc(x)}</li>`).join(''))
      + block(`What wins in ${esc(cat.name)}`, cat.tips.map(x => `<li>${esc(x)}</li>`).join(''))
      + block('What buyers ask', cat.faq.map(f => `<li><b>${esc(f[0])}</b><br>${esc(f[1])}</li>`).join(''));
  }

  function foot(cat, mode) {
    let note = 'These figures are suggested starting points compiled as guidance, not live Fiverr data. Once enough sellers share their numbers anonymously, this profile will switch to real averages.';
    if (mode === 'audit') note += ' Tick "Share my gig\'s numbers anonymously" before your next check to help build them.';
    const ctas = mode === 'audit'
      ? `<a class="btn" href="builder.html?cat=${cat.id}">Fix it in the Builder →</a><a class="btn btn-ghost" href="index.html#makeover">Have us do it · $49</a>`
      : `<a class="btn btn-ghost" href="categories.html#${cat.id}">Full category intelligence →</a>`;
    return `<div class="ind-foot"><p>${note}</p><div class="ind-cta">${ctas}</div></div>`;
  }

  // ---------- You vs. a strong gig (same thresholds as the Health Check engine) ----------
  function compare(cat, g) {
    const rows = [];
    const add = (label, status, you, strong, fix) => rows.push({ label, status, you: status === 'missing' ? 'Not entered' : you, strong, fix });
    const vocab = vocabOf(cat);

    // Title: 40–70 characters and a buyer keyword
    const title = String(g.title || '').trim();
    const tl = title.toLowerCase();
    const hit = vocab.find(k => tl.includes(k)) || (tl.includes(cat.noun.toLowerCase()) ? cat.noun.toLowerCase() : '');
    const lenOk = title.length >= 40 && title.length <= 70;
    const titleFix = [
      !hit && `work in "${cat.kw[0]}"`,
      !lenOk && (title.length < 40 ? 'make it 40–70 characters long' : 'trim it to 70 characters or less')
    ].filter(Boolean).join(' and ');
    add('Title', !title ? 'missing' : lenOk && hit ? 'ok' : lenOk || hit ? 'warn' : 'bad',
      `${title.length} characters, ${hit ? `uses "${hit}"` : 'no buyer keyword'}`,
      `40–70 characters with a buyer keyword like "${cat.kw[0]}"`,
      titleFix ? cap(titleFix) + '.' : '');

    // Tags: all 5 slots, at least 2 from the category's top list
    const tags = tagsOf(g.tags);
    const fromTop = tags.filter(t => vocab.includes(t)).length;
    const missingTop = cat.tags.filter(t => !tags.includes(t)).slice(0, 3);
    add('Tags', !tags.length ? 'missing' : tags.length >= 5 && fromTop >= 2 ? 'ok' : tags.length >= 3 || fromTop >= 1 ? 'warn' : 'bad',
      `${tags.length > 5 ? `${tags.length} tags (Fiverr allows 5)` : `${tags.length} of 5 slots`}, ${fromTop} from the top list`,
      'All 5 slots, at least 2 from the top list',
      `${tags.length < 5 ? 'Fill all 5 slots. ' : ''}${missingTop.length ? `Try: ${missingTop.join(', ')}.` : ''}`.trim());

    // Description: scored by the Health Check's own rules
    const desc = String(g.description || '');
    const chars = desc.trim().length;
    const dim = root.GigScoring
      ? root.GigScoring.runAudit(Object.assign({
          title: '', tags: '', description: '', basicPrice: 0, standardPrice: 0, premiumPrice: 0, rating: 0, reviewCount: 0,
          galleryImages: 0, hasVideo: false, responseTime: 999, revisions: 0, deliveryDays: 0, extrasCount: 0, categoryText: ''
        }, g), cat).find(x => x.key === 'description')
      : null;
    const dPct = dim ? dim.score / dim.max : 0;
    const dLimit = root.GigScoring ? root.GigScoring.DESC_LIMIT : 1200;
    // A tick needs the length range too, so the row never shows ✓ next to "515 characters"
    add('Description', !chars ? 'missing' : chars > dLimit ? 'bad' : chars >= 600 && dPct >= 0.8 ? 'ok' : dPct >= 0.5 ? 'warn' : 'bad',
      `${chars.toLocaleString('en-US')} characters`,
      '600–1,200 characters, easy to skim, with a clear next step',
      dim && dim.tips[0] ? dim.tips[0] : '');

    // Basic price vs the category's suggested starting point
    const [sb, ss, sp] = cat.pkgs.map(p => p[0]);
    const b = +g.basicPrice || 0, s = +g.standardPrice || 0, p = +g.premiumPrice || 0;
    add('Basic price', !b ? 'missing' : b >= sb * 0.8 ? 'ok' : b >= sb * 0.5 ? 'warn' : 'bad',
      `$${b}${b > sb * 1.5 ? ' (above the suggested start)' : ''}`,
      `Around $${sb} to start`,
      `Raise it toward $${sb}. Very low prices attract the hardest-to-please buyers.`);

    // Tier spread: Standard ≥1.4× Basic, Premium 1.8×–6× Basic
    const set = [b, s, p].filter(v => v > 0).length;
    const r1 = set === 3 ? s / b : 0, r2 = set === 3 ? p / b : 0;
    add('Package tiers', !set ? 'missing' : set < 3 ? 'bad' : r1 >= 1.4 && r2 >= 1.8 && r2 <= 6 ? 'ok' : 'warn',
      set === 3 ? `$${b} / $${s} / $${p}` : `${set} of 3 tiers set`,
      `3 tiers with clear jumps, like $${sb} / $${ss} / $${sp}`,
      set < 3 ? 'Offer all three tiers so buyers can choose to spend more.'
        : r2 > 6 ? 'Bring Premium within 6× Basic so the jump still makes sense.'
        : 'Widen the gaps: Standard at least 1.4× Basic, Premium at least 1.8×.');

    // Basic delivery vs the category's usual time
    const sd = cat.pkgs[0][1];
    const d = +g.deliveryDays || 0;
    add('Basic delivery', !d ? 'missing' : d <= sd ? 'ok' : d <= sd * 2 ? 'warn' : 'bad',
      days(d), `${days(sd)} or faster`,
      `Aim for ${days(sd)}, or sell faster delivery as a paid extra.`);

    // Paid extras
    const e = +g.extrasCount || 0;
    add('Paid extras', e >= 3 ? 'ok' : e >= 1 ? 'warn' : 'bad',
      plural(e, 'extra'), `3 or more, e.g. ${cat.extras[0][0]}`,
      `Add ${cat.extras.slice(0, 3).map(x => `${x[0]} (+$${x[1]})`).join(', ')}.`);

    // Gallery
    const im = +g.galleryImages || 0, video = !!g.hasVideo;
    add('Gallery', im >= 5 && video ? 'ok' : im >= 3 || video ? 'warn' : 'bad',
      `${plural(im, 'image')}${video ? ' + video' : ', no video'}`,
      '5+ images and a short video',
      `${im < 5 ? `Add ${5 - im} more, e.g. ${cat.gallery[0].charAt(0).toLowerCase() + cat.gallery[0].slice(1)}.` : ''}${video ? '' : ' Add a short intro or process video.'}`.trim());

    return rows;
  }

  function rowHtml(r) {
    return `<li class="vs-row ${r.status}">
      <span class="vs-icon" aria-hidden="true"></span>
      <div class="vs-main">
        <b>${r.label}</b><span class="sr"> — ${STATUS[r.status]}</span>
        <div class="vs-cols"><span><em>You</em>${esc(r.you)}</span><span><em>Strong gig</em>${esc(r.strong)}</span></div>
        ${r.status !== 'ok' && r.fix ? `<p class="vs-fix">${esc(r.fix)}</p>` : ''}
      </div>
    </li>`;
  }

  // ---------- Public ----------
  // Health Check: the category snapshot plus a side-by-side of the seller's gig against it
  function auditHtml(cat, input) {
    const rows = compare(cat, input);
    const ok = rows.filter(r => r.status === 'ok').length;
    return head(cat) + stats(cat) + `
      <section class="ind-sec" aria-labelledby="vs-title">
        <div class="ind-sec-head"><h3 id="vs-title">You vs. a strong ${esc(cat.name)} gig</h3><span class="ind-match"><b>${ok}</b> of ${rows.length} match</span></div>
        <div class="match-bar"><i style="--w:${Math.round(ok / rows.length * 100)}%"></i></div>
        <ul class="vs">${rows.map(rowHtml).join('')}</ul>
      </section>
      <section class="ind-sec"><h3>Price ladder</h3>${ladder(cat, [+input.basicPrice || 0, +input.standardPrice || 0, +input.premiumPrice || 0], 'You')}</section>
      <section class="ind-sec"><h3>What buyers search</h3>${keywords(cat, `${input.title || ''} ${input.tags || ''}`)}</section>
      <section class="ind-sec ind-more-wrap">${more(cat)}</section>
      ${foot(cat, 'audit')}`;
  }

  // Gig Builder: the category snapshot, with the draft's prices marked on the ladder
  function builderHtml(cat, draft, level) {
    const mult = (root.GigBuilder && root.GigBuilder.LEVELS && root.GigBuilder.LEVELS[level]) || 1;
    const pct = Math.round((mult - 1) * 100);
    const who = { new: 'a new seller', growing: 'a growing seller', established: 'an established seller' }[level] || 'your level';
    const where = pct < 0 ? `about ${-pct}% under the suggested starting points, to help win your first reviews`
      : pct > 0 ? `about ${pct}% above the suggested starting points`
      : 'at the suggested starting points';
    return head(cat) + stats(cat) + `
      <section class="ind-sec"><h3>Price ladder</h3>${ladder(cat, draft.packages.map(x => x.price), 'Draft')}
        <p class="ind-note">Your draft is priced for ${who}: ${where}.</p></section>
      <section class="ind-sec"><h3>What buyers search</h3>${keywords(cat, `${draft.titles[0].text} ${draft.tags.join(', ')}`)}</section>
      ${foot(cat, 'builder')}`;
  }

  // Show a rendered profile in its card; animate only when asked (not on every keystroke)
  function show(el, html, animate) {
    el.innerHTML = html;
    el.hidden = false;
    if (!animate) { el.classList.add('on'); return; }
    el.classList.remove('on');
    if (root.Motion) root.Motion.replay(el, 'show');
    void el.offsetWidth;
    requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add('on')));
    // If animation frames are paused (background tab), still end up fully drawn
    setTimeout(() => el.classList.add('on'), 400);
  }

  root.IndustryProfile = { compare, auditHtml, builderHtml, show };
})(typeof window !== 'undefined' ? window : globalThis);
