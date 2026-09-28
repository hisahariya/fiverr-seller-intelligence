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
    let lastY = root.scrollY;
    let ticking = false;
    const onScroll = () => {
      const y = root.scrollY;
      header.classList.toggle('scrolled', y > 8);
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

  // Cursor spotlight on .spot cards
  if (!reduce) {
    document.addEventListener('pointermove', e => {
      const card = e.target.closest && e.target.closest('.spot');
      if (!card) return;
      const r = card.getBoundingClientRect();
      card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      card.style.setProperty('--my', (e.clientY - r.top) + 'px');
    }, { passive: true });
  }

  // Restart a CSS entrance animation on an element (e.g. after re-rendering results)
  function replay(el, cls) {
    el.classList.remove(cls);
    void el.offsetWidth;
    el.classList.add(cls);
  }

  root.Motion = { countUp, replay, reduce };
})(window);
