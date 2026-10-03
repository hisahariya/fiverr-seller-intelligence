(function (root) {
  const doc = document.documentElement;
  const reduce = root.matchMedia && root.matchMedia('(prefers-reduced-motion: reduce)').matches;
  doc.classList.add('js');

  // ---------- Header ----------
  const header = document.querySelector('.site-header');
  if (header) {
    const small = () => root.innerWidth <= 860;

    // Compact + shadow once scrolled, reading-progress line, and on phones tuck away while scrolling down
    const progress = header.querySelector('.scroll-progress i');
    // Homepage: the header search stays hidden while the big hero search is on screen
    const heroSearch = document.body.classList.contains('home') && document.getElementById('finder');
    let lastY = root.scrollY;
    let ticking = false;
    const onScroll = () => {
      const y = root.scrollY;
      header.classList.toggle('scrolled', y > 8);
      if (heroSearch) header.classList.toggle('show-search', heroSearch.getBoundingClientRect().bottom < header.offsetHeight);
      const max = doc.scrollHeight - root.innerHeight;
      if (progress) progress.style.setProperty('--p', max > 0 ? Math.min(1, y / max).toFixed(4) : 0);
      if (small() && !doc.classList.contains('menu-open') && y > 240 && y > lastY + 4) header.classList.add('tucked');
      else if (y < lastY - 4 || y <= 240 || !small()) header.classList.remove('tucked');
      lastY = y;
      ticking = false;
    };
    root.addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
    root.addEventListener('resize', onScroll);
    header.addEventListener('focusin', () => header.classList.remove('tucked'));
    onScroll();

    // Header search: live category suggestions on pages that load the dataset
    const hs = header.querySelector('.hdr-search');
    if (hs && root.CATEGORIES && root.CATEGORIES.length) suggest(hs, root.CATEGORIES);

    // Category bar: fade its right edge only while more links are hidden off to the right
    const strip = header.querySelector('.cat-strip-inner');
    if (strip) {
      const fade = () => strip.classList.toggle('more', strip.scrollWidth - strip.clientWidth - strip.scrollLeft > 2);
      strip.addEventListener('scroll', fade, { passive: true });
      root.addEventListener('resize', fade);
      fade();
      if (document.fonts) document.fonts.ready.then(fade);
    }

    // Hover highlight that glides between nav links
    const nav = header.querySelector('.site-nav');
    const glide = nav && nav.querySelector('.nav-glide');
    if (glide) {
      const moveTo = el => {
        const n = nav.getBoundingClientRect();
        const r = el.getBoundingClientRect();
        const wasOn = glide.classList.contains('on');
        if (!wasOn) glide.style.transition = 'none';
        glide.style.width = r.width + 'px';
        glide.style.transform = `translateX(${r.left - n.left}px)`;
        if (!wasOn) { void glide.offsetWidth; glide.style.transition = ''; }
        glide.classList.add('on');
      };
      nav.querySelectorAll('.nav-link').forEach(l => {
        l.addEventListener('pointerenter', () => moveTo(l));
        l.addEventListener('focus', () => moveTo(l));
      });
      nav.addEventListener('pointerleave', () => glide.classList.remove('on'));
      nav.addEventListener('focusout', e => { if (!nav.contains(e.relatedTarget)) glide.classList.remove('on'); });
    }

    // "Free tools" dropdown: hover (mouse), click/tap, keyboard arrows, Esc
    header.querySelectorAll('.nav-item.has-menu').forEach(item => {
      const btn = item.querySelector('.nav-link');
      const links = () => Array.from(item.querySelectorAll('.mega a'));
      let timer = 0;
      const set = open => { item.classList.toggle('open', open); btn.setAttribute('aria-expanded', String(open)); };
      btn.addEventListener('click', e => {
        // A mouse user already opened it by hovering; a click shouldn't slam it shut
        if (e.pointerType === 'mouse' && item.classList.contains('open')) return;
        set(!item.classList.contains('open'));
      });
      item.addEventListener('pointerenter', e => { if (e.pointerType === 'mouse') { clearTimeout(timer); set(true); } });
      item.addEventListener('pointerleave', e => { if (e.pointerType === 'mouse') timer = setTimeout(() => set(false), 180); });
      item.addEventListener('focusout', e => { if (!item.contains(e.relatedTarget)) set(false); });
      item.addEventListener('keydown', e => {
        const list = links();
        const i = list.indexOf(document.activeElement);
        if (e.key === 'Escape' && item.classList.contains('open')) { set(false); btn.focus(); }
        else if (e.key === 'ArrowDown') { e.preventDefault(); set(true); (list[i + 1] || list[0]).focus(); }
        else if (e.key === 'ArrowUp') { e.preventDefault(); set(true); (list[i - 1] || list[list.length - 1]).focus(); }
      });
      document.addEventListener('click', e => { if (!item.contains(e.target)) set(false); });
    });

    // Phone menu
    const toggle = header.querySelector('.menu-toggle');
    const panel = document.getElementById('mobile-menu');
    if (toggle && panel) {
      const setMenu = open => {
        doc.classList.toggle('menu-open', open);
        toggle.setAttribute('aria-expanded', String(open));
        toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
        panel.inert = !open;
        if (open) {
          header.classList.remove('tucked');
          const first = panel.querySelector('a');
          if (first) first.focus({ preventScroll: true });
        }
      };
      panel.inert = true;
      toggle.addEventListener('click', () => setMenu(!doc.classList.contains('menu-open')));
      panel.addEventListener('click', e => { if (e.target.closest('a')) setMenu(false); });
      document.addEventListener('keydown', e => {
        if (e.key === 'Escape' && doc.classList.contains('menu-open')) { setMenu(false); toggle.focus(); }
      });
      root.addEventListener('resize', () => { if (!small() && doc.classList.contains('menu-open')) setMenu(false); });
    }
  }

  // Combobox for the header search: up to 6 matching categories, arrow keys + Enter, Esc to close.
  // Picking one opens it in Category Intelligence; "Search all" submits the form as before.
  function suggest(form, cats) {
    const input = form.querySelector('input');
    const list = document.createElement('ul');
    list.className = 'hs-list';
    list.id = 'hdrSuggest';
    list.setAttribute('role', 'listbox');
    list.setAttribute('aria-label', 'Matching categories');
    list.hidden = true;
    form.appendChild(list);
    input.setAttribute('role', 'combobox');
    input.setAttribute('aria-autocomplete', 'list');
    input.setAttribute('aria-controls', list.id);
    input.setAttribute('aria-expanded', 'false');

    const esc = s => String(s).replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
    const reEsc = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    // Match at the start of a word, so "ai" finds "AI agents" but not "email"
    const atStart = (hay, w) => new RegExp('(^|[^a-z0-9])' + reEsc(w)).test(hay);
    const index = cats.map(c => ({ c, name: c.name.toLowerCase(), hay: [c.name, c.group, c.noun, ...c.kw, ...c.tags].join(' | ').toLowerCase() }));
    const ICON = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3.5" y="3.5" width="7" height="7" rx="1.5"/><rect x="13.5" y="3.5" width="7" height="7" rx="1.5"/><rect x="3.5" y="13.5" width="7" height="7" rx="1.5"/><rect x="13.5" y="13.5" width="7" height="7" rx="1.5"/></svg>';
    let opts = [];
    let active = -1;

    const find = q => {
      const words = q.split(/\s+/).filter(Boolean);
      return index.map(e => {
        let s = e.name.startsWith(q) ? 60 : atStart(e.name, q) ? 40 : atStart(e.hay, q) ? 20 : 0;
        words.forEach(w => { s += atStart(e.name, w) ? 6 : atStart(e.hay, w) ? 2 : -100; });
        return { c: e.c, s };
      }).filter(x => x.s > 0).sort((a, b) => b.s - a.s).slice(0, 6).map(x => x.c);
    };
    const mark = (text, q) => {
      const i = text.toLowerCase().indexOf(q);
      return i < 0 ? esc(text) : esc(text.slice(0, i)) + '<mark>' + esc(text.slice(i, i + q.length)) + '</mark>' + esc(text.slice(i + q.length));
    };
    const items = () => Array.from(list.children);
    const setActive = i => {
      active = i;
      items().forEach((li, j) => li.setAttribute('aria-selected', String(j === i)));
      if (i >= 0) { input.setAttribute('aria-activedescendant', items()[i].id); items()[i].scrollIntoView({ block: 'nearest' }); }
      else input.removeAttribute('aria-activedescendant');
    };
    const close = () => { list.hidden = true; input.setAttribute('aria-expanded', 'false'); setActive(-1); };
    const render = () => {
      const q = input.value.trim().toLowerCase().replace(/\s+/g, ' ');
      if (!q) { close(); return; }
      opts = find(q);
      list.innerHTML = opts.map((c, i) => `<li role="option" id="hs-opt-${i}" data-i="${i}" aria-selected="false"><span class="hs-ic">${ICON}</span><span><b>${mark(c.name, q)}</b><small>${esc(c.group)}</small></span></li>`).join('')
        + `<li role="option" id="hs-opt-all" data-i="all" class="hs-all" aria-selected="false">Search all categories for “${esc(input.value.trim())}”</li>`;
      list.hidden = false;
      input.setAttribute('aria-expanded', 'true');
      setActive(-1);
    };
    const go = i => {
      close();
      if (i === 'all' || !opts[i]) { form.submit(); return; }
      // categories.html (or ../categories.html on the blog) opens the card from the hash
      location.href = form.getAttribute('action') + '#' + opts[i].id;
    };

    input.addEventListener('input', render);
    input.addEventListener('focus', () => { if (input.value.trim()) render(); });
    input.addEventListener('blur', () => setTimeout(close, 150));
    input.addEventListener('keydown', e => {
      const n = items().length;
      if (e.key === 'ArrowDown') { e.preventDefault(); if (list.hidden) render(); else if (n) setActive((active + 1) % n); }
      else if (e.key === 'ArrowUp' && !list.hidden && n) { e.preventDefault(); setActive(active <= 0 ? n - 1 : active - 1); }
      else if (e.key === 'Escape' && !list.hidden) { e.preventDefault(); close(); }
      else if (e.key === 'Enter' && !list.hidden && active >= 0) { e.preventDefault(); go(items()[active].dataset.i); }
    });
    list.addEventListener('mousedown', e => {
      const li = e.target.closest('li');
      if (!li) return;
      e.preventDefault();
      go(li.dataset.i);
    });
  }

  // "/" jumps to search (the big homepage search while it's on screen, otherwise the header search)
  document.addEventListener('keydown', e => {
    if (e.key !== '/' || e.ctrlKey || e.metaKey || e.altKey || e.defaultPrevented) return;
    const t = e.target;
    if (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName)) return;
    const shown = el => el && el.offsetParent !== null && getComputedStyle(el).visibility !== 'hidden';
    const onScreen = el => { const r = el.getBoundingClientRect(); return r.bottom > 0 && r.top < root.innerHeight; };
    const hero = ['kwInput', 'titleInput'].map(id => document.getElementById(id)).find(shown);
    const head = document.querySelector('.hdr-search input');
    const target = hero && onScreen(hero) ? hero : shown(head) && shown(head.closest('.hdr-search')) ? head : hero;
    if (!target) return;
    e.preventDefault();
    target.focus();
    if (target === hero && !onScreen(hero)) hero.scrollIntoView({ block: 'center', behavior: reduce ? 'auto' : 'smooth' });
  });

  // Ease a number from 0 up to its target
  function countUp(el, to, dur) {
    if (reduce) { el.textContent = to; return; }
    const t0 = performance.now();
    const len = dur || 1200;
    const step = t => {
      const p = Math.min(1, (t - t0) / len);
      el.textContent = Math.round(to * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  // Children of [data-stagger] reveal one after another
  document.querySelectorAll('[data-stagger]').forEach(parent => {
    Array.from(parent.children).forEach((child, i) => {
      child.style.setProperty('--i', i);
      child.setAttribute('data-reveal', '');
    });
  });

  // Reveal on scroll; [data-count] numbers inside count up when revealed
  const reveal = el => {
    el.classList.add('in');
    const counters = el.matches('[data-count]') ? [el] : el.querySelectorAll('[data-count]');
    counters.forEach(c => countUp(c, +c.dataset.count));
  };
  const targets = document.querySelectorAll('[data-reveal]');
  if (reduce || !('IntersectionObserver' in root)) targets.forEach(reveal);
  else {
    const io = new IntersectionObserver(entries => entries.forEach(e => {
      if (e.isIntersecting) { reveal(e.target); io.unobserve(e.target); }
    }), { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
    targets.forEach(el => io.observe(el));
  }

  // Restart a CSS entrance animation on an element (e.g. after re-rendering results)
  function replay(el, cls) {
    el.classList.remove(cls);
    void el.offsetWidth;
    el.classList.add(cls);
  }

  root.Motion = { countUp, replay, reduce };
})(window);
