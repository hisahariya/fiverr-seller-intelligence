// Homepage quick tools: "Find keywords" and "Check my title".
// Runs entirely in the browser on the category dataset + GigBuilder + GigScoring.
(function () {
  const CATS = window.CATEGORIES;
  if (!CATS || !window.GigBuilder || !window.GigScoring) return;
  const $ = id => document.getElementById(id);
  const byId = Object.fromEntries(CATS.map(c => [c.id, c]));
  const esc = s => String(s).replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
  const norm = s => String(s).toLowerCase().replace(/[^a-z0-9+#.\s-]/g, ' ').replace(/\s+/g, ' ').trim();
  const RING = 326.7; // circumference of the r=52 score ring

  const INDEX = CATS.map(c => ({
    c,
    name: norm(c.name), // normalised like the query, so "Facebook & Instagram Ads" matches itself
    noun: c.noun.toLowerCase(),
    terms: [...new Set(c.kw.concat(c.tags).map(s => s.toLowerCase()))],
    group: c.group.toLowerCase()
  }));

  // Real number of distinct buyer keywords in the dataset, for the hero stat
  const kwCount = new Set(INDEX.flatMap(e => e.terms)).size;
  const kwStat = $('kwCount');
  if (kwStat) { kwStat.dataset.count = kwCount; kwStat.textContent = kwCount; }
  // ...and of subcategories, so the stat never goes stale when the dataset grows
  const catStat = $('catCount');
  if (catStat) { catStat.dataset.count = CATS.length; catStat.textContent = CATS.length; }

  // ---------- Search ----------
  function search(query) {
    const q = norm(query);
    if (!q) return [];
    const words = q.split(' ');
    return INDEX.map(e => {
      let score = 0, hit = '';
      if (e.name === q) score += 100;
      if (e.name.startsWith(q)) score += 40; else if (e.name.includes(q)) score += 30;
      if (e.noun === q) score += 35;
      e.terms.forEach(t => {
        if (t === q) { score += 50; hit = hit || t; }
        else if (t.startsWith(q)) { score += 20; hit = hit || t; }
        else if (t.includes(q)) { score += 12; hit = hit || t; }
      });
      const hay = [e.name, e.noun, e.group].concat(e.terms).join(' ');
      if (words.every(w => hay.includes(w))) score += 8 * words.length;
      return { c: e.c, score, hit };
    }).filter(r => r.score > 0).sort((a, b) => b.score - a.score).slice(0, 6);
  }

  function highlight(text, query) {
    const q = norm(query);
    const i = q ? text.toLowerCase().indexOf(q) : -1;
    if (i < 0) return esc(text);
    return esc(text.slice(0, i)) + '<mark>' + esc(text.slice(i, i + q.length)) + '</mark>' + esc(text.slice(i + q.length));
  }

  // ---------- Result panel ----------
  const result = $('result');
  const scrollMode = () => (window.Motion && Motion.reduce ? 'auto' : 'smooth');

  function showResult(html) {
    result.innerHTML = html;
    result.hidden = false;
    // The panel sits below the hero, so bring it into view under the pinned header.
    // Measure before the entrance animation starts, since it shifts the panel down while it plays.
    result.classList.remove('show');
    const header = document.querySelector('.site-header');
    const top = result.getBoundingClientRect().top + window.scrollY - (header ? header.offsetHeight : 0) - 16;
    if (window.Motion) Motion.replay(result, 'show');
    window.scrollTo({ top, behavior: scrollMode() });
  }
  function resetResult() {
    result.hidden = true;
    result.innerHTML = '';
    $('finder').scrollIntoView({ behavior: scrollMode(), block: 'center' });
  }

  function copy(text, btn) {
    const done = () => { const old = btn.textContent; btn.textContent = 'Copied'; setTimeout(() => { btn.textContent = old; }, 1200); };
    if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(text).then(done, () => fallbackCopy(text, done));
    else fallbackCopy(text, done);
  }
  function fallbackCopy(text, done) {
    const ta = document.createElement('textarea');
    ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
    document.body.appendChild(ta); ta.select();
    try { document.execCommand('copy'); done(); } catch (e) {}
    ta.remove();
  }

  result.addEventListener('click', e => {
    if (e.target.closest('.r-close')) { resetResult(); return; }
    const btn = e.target.closest('[data-copy]');
    if (btn) copy(btn.dataset.copy, btn);
  });

  const closeBtn = '<button type="button" class="r-close" aria-label="Close results">×</button>';
  const titleRow = t => `<div class="r-title">${esc(t.text)}<span>${t.len} chars</span></div>`;

  function showCategory(cat, hit) {
    const g = GigBuilder.buildGig(cat, { level: 'growing' });
    const t = g.titles[0];
    showResult(`
      <div class="r-head"><div><small>${esc(cat.group)}</small><h3>${esc(cat.name)}</h3></div>${closeBtn}</div>
      <div class="r-sec"><h4>Keywords buyers search</h4>
        <div class="chips">${cat.kw.map(k => `<span class="chip${k.toLowerCase() === hit ? ' on' : ''}">${esc(k)}</span>`).join('')}</div></div>
      <div class="r-sec"><h4>Your 5 tags <button type="button" data-copy="${esc(g.tags.join(', '))}">Copy tags</button></h4>
        <div class="chips">${g.tags.map(k => `<span class="chip on">${esc(k)}</span>`).join('')}</div></div>
      <div class="r-sec"><h4>Title idea <button type="button" data-copy="${esc(t.text)}">Copy</button></h4>${titleRow(t)}</div>
      <div class="r-sec"><h4>Suggested starting prices</h4>
        <div class="r-prices">${g.packages.map(p => `<div><span>${p.name}</span><b>$${p.price}</b><span>${p.days} day${p.days > 1 ? 's' : ''}</span></div>`).join('')}</div>
        ${window.DataTrust ? window.DataTrust.labelHtml(cat) : ''}</div>
      <div class="r-actions">
        <a class="btn" href="builder.html?cat=${cat.id}">Build this gig →</a>
        <a class="btn btn-ghost" href="categories.html#${cat.id}">Full category intel</a>
      </div>`);
  }

  // ---------- Combobox ----------
  const input = $('kwInput');
  const list = $('kwList');
  let opts = [];
  let active = -1;

  function setActive(i) {
    active = i;
    Array.from(list.children).forEach((li, j) => li.setAttribute('aria-selected', String(j === i)));
    if (i >= 0) {
      input.setAttribute('aria-activedescendant', 'kw-opt-' + i);
      list.children[i].scrollIntoView({ block: 'nearest' });
    }
  }
  function closeList() {
    list.hidden = true;
    input.setAttribute('aria-expanded', 'false');
    input.removeAttribute('aria-activedescendant');
  }
  function openList() {
    opts = search(input.value);
    if (!opts.length) { closeList(); return; }
    list.innerHTML = opts.map((r, i) =>
      `<li role="option" id="kw-opt-${i}" data-i="${i}" aria-selected="false"><span>${highlight(r.c.name, input.value)}</span><small>${esc(r.hit || r.c.group)}</small></li>`
    ).join('');
    list.hidden = false;
    input.setAttribute('aria-expanded', 'true');
    setActive(0);
  }
  function note(id, text) { const n = $(id); n.textContent = text; n.hidden = !text; }
  const Ctx = window.SellerContext;
  function pick(r) {
    closeList();
    if (Ctx) Ctx.explore({ cat: r.c.id });
    input.value = r.c.name;
    note('kwNote', '');
    showCategory(r.c, r.hit);
  }

  input.addEventListener('input', () => { note('kwNote', ''); openList(); });
  input.addEventListener('focus', () => { if (input.value.trim()) openList(); });
  input.addEventListener('blur', () => setTimeout(closeList, 120));
  input.addEventListener('keydown', e => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (list.hidden) openList(); else if (opts.length) setActive((active + 1) % opts.length);
    } else if (e.key === 'ArrowUp' && !list.hidden && opts.length) {
      e.preventDefault();
      setActive((active - 1 + opts.length) % opts.length);
    } else if (e.key === 'Escape') closeList();
  });
  list.addEventListener('mousedown', e => {
    const li = e.target.closest('li');
    if (!li) return;
    e.preventDefault();
    pick(opts[+li.dataset.i]);
  });
  $('kwForm').addEventListener('submit', e => {
    e.preventDefault();
    const r = (!list.hidden && active >= 0) ? opts[active] : search(input.value)[0];
    if (r) pick(r);
    else if (input.value.trim()) note('kwNote', 'No match yet. Try a broader word like "logo", "video" or "website".');
    else input.focus();
  });
  document.querySelectorAll('#pane-kw .try button').forEach(b => b.addEventListener('click', () => {
    input.value = b.dataset.q;
    const r = search(b.dataset.q)[0];
    if (r) pick(r);
  }));

  // ---------- Title check ----------
  const groups = {};
  CATS.forEach(c => (groups[c.group] = groups[c.group] || []).push(c));
  function categoryOptions(selected) {
    return `<option value="">Choose your category…</option>` + Object.entries(groups).map(([g, cats]) =>
      `<optgroup label="${esc(g)}">${cats.map(c => `<option value="${c.id}"${selected && selected.id === c.id ? ' selected' : ''}>${esc(c.name)}</option>`).join('')}</optgroup>`
    ).join('');
  }

  // Best-guess category from the words in the title (null if nothing matches).
  // Word-level with light stemming ("edit your videos" → video, edit), hyphens split ("short-form" → short form).
  // Rare words count for more than common ones (IDF), and a whole buyer phrase in the title adds a bonus.
  const STOP = new Set('i will you your a an the for and or to of in on with my me any all by from that this'.split(' '));
  const stem = w => w.endsWith('ing') && w.length > 5 ? w.slice(0, -3) : (w.endsWith('s') && !w.endsWith('ss') && w.length > 3 ? w.slice(0, -1) : w);
  const words = s => norm(s).replace(/-/g, ' ').split(' ').filter(w => w && !STOP.has(w)).map(stem);
  const DOCS = CATS.map((c, i) => {
    const phrases = INDEX[i].terms.concat(INDEX[i].noun).map(words).filter(p => p.length);
    const titleWords = c.titles.flatMap(t => words(t.replace(/\{(niche|aud)\}/g, ' ')));
    return { phrases, noun: words(c.noun), vocab: new Set(phrases.flat().concat(titleWords)) };
  });
  const DF = new Map();
  DOCS.forEach(d => d.vocab.forEach(w => DF.set(w, (DF.get(w) || 0) + 1)));
  const idf = w => Math.log((CATS.length + 1) / ((DF.get(w) || 0) + 1));

  function detectCategory(title) {
    const have = new Set(words(title));
    let best = null, bestScore = 0;
    DOCS.forEach((d, i) => {
      let s = 0;
      have.forEach(w => { if (d.vocab.has(w)) s += idf(w); });
      d.phrases.forEach(p => { if (p.length > 1 && p.every(w => have.has(w))) s += 1; });
      // The category's core noun ("infographic", "dashboard") is the strongest single signal
      if (d.noun.length && d.noun.every(w => have.has(w))) s += 2;
      if (s > bestScore) { bestScore = s; best = CATS[i]; }
    });
    return bestScore >= 1 ? best : null;
  }

  function checkTitle(title, cat) {
    // The checked title becomes part of the seller's gig, so the Health Check starts from it.
    // A quick check never wipes a fuller gig saved under another category (detection can guess wrong).
    if (Ctx) {
      const g = Ctx.get().gig;
      const full = g && Object.keys(g).some(k => !['cat', 'title', 'source', 'rating', 'reviewCount', 'responseTime'].includes(k));
      if (!full || !cat || !g.cat || g.cat === cat.id) Ctx.updateGig({ title, cat: cat ? cat.id : undefined }, 'title');
    }
    const dim = GigScoring.runAudit({ title, tags: '', description: '', basicPrice: 0, standardPrice: 0, premiumPrice: 0 }, cat)
      .find(d => d.key === 'title');
    const pct = Math.round(dim.score / dim.max * 100);
    const color = pct >= 80 ? 'var(--accent)' : pct >= 55 ? 'var(--warn)' : 'var(--bad)';
    const verdict = pct >= 80 ? 'Strong title' : pct >= 55 ? 'Good, with a few fixes' : 'Needs work';
    const ideas = cat ? GigBuilder.buildGig(cat, {}).titles.slice(0, 3) : [];
    showResult(`
      <div class="r-head"><div><small>Title check</small><h3>${verdict}</h3></div>${closeBtn}</div>
      <div class="r-score">
        <div class="ring"><svg viewBox="0 0 120 120" aria-hidden="true"><circle class="bg" cx="60" cy="60" r="52"/><circle class="fg" id="titleArc" cx="60" cy="60" r="52" style="stroke:${color};stroke-dashoffset:${RING}"/></svg>
          <div class="ring-num"><b id="titleNum">${pct}</b><span>/ 100</span></div></div>
        <p><b>${title.length} characters</b><br>${cat ? 'Scored for ' + esc(cat.name) : 'Choose your category below for a keyword check'}</p>
      </div>
      <div class="r-sec"><h4>Your category</h4><select id="titleCat" aria-label="Your category">${categoryOptions(cat)}</select></div>
      <div class="r-sec"><h4>${dim.tips.length ? 'Fix these' : 'Checks'}</h4>
        <ul class="fixes">${dim.tips.length ? dim.tips.map(t => `<li>${esc(t)}</li>`).join('') : '<li class="ok">Length, format, keywords and caps all look good.</li>'}</ul></div>
      ${ideas.length ? `<div class="r-sec"><h4>Title ideas for ${esc(cat.name)}</h4>${ideas.map(titleRow).join('')}</div>` : ''}
      <div class="r-actions"><a class="btn" href="tool.html">Check the whole gig →</a></div>`);

    const arc = $('titleArc');
    requestAnimationFrame(() => requestAnimationFrame(() => { arc.style.strokeDashoffset = RING * (1 - pct / 100); }));
    if (window.Motion) Motion.countUp($('titleNum'), pct, 900);
    $('titleCat').addEventListener('change', e => checkTitle(title, byId[e.target.value] || null));
  }

  // A title checked earlier is ready to re-check
  const savedGig = Ctx && Ctx.get().gig;
  if (savedGig && savedGig.title) $('titleInput').value = savedGig.title;

  $('titleForm').addEventListener('submit', e => {
    e.preventDefault();
    const title = $('titleInput').value.trim();
    if (title.length < 5) { note('titleNote', 'Paste your full gig title first.'); return; }
    note('titleNote', '');
    checkTitle(title, detectCategory(title));
  });

  // ---------- Tabs ----------
  const tabs = [$('tab-kw'), $('tab-title')];
  const panes = [$('pane-kw'), $('pane-title')];
  const fields = [input, $('titleInput')];
  function selectTab(i, focusField) {
    tabs.forEach((t, j) => {
      t.setAttribute('aria-selected', String(i === j));
      t.tabIndex = i === j ? 0 : -1;
      panes[j].hidden = i !== j;
    });
    if (focusField) fields[i].focus({ preventScroll: true });
  }
  tabs.forEach((t, i) => {
    t.addEventListener('click', () => selectTab(i, true));
    t.addEventListener('keydown', e => {
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
      e.preventDefault();
      const n = (i + 1) % tabs.length;
      selectTab(n);
      tabs[n].focus();
    });
  });
  // Links elsewhere on the page can jump straight to the title checker
  document.querySelectorAll('a[data-tab="title"]').forEach(a => a.addEventListener('click', e => {
    e.preventDefault();
    $('finder').scrollIntoView({ behavior: 'smooth', block: 'center' });
    selectTab(1);
    setTimeout(() => fields[1].focus({ preventScroll: true }), 450);
  }));
})();
