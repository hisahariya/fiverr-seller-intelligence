(function (root) {
  const doc = document.documentElement;
  const reduce = root.matchMedia && root.matchMedia('(prefers-reduced-motion: reduce)').matches;
  doc.classList.add('js');

  // Header gets a shadow once the page scrolls
  const header = document.querySelector('.site-header');
  if (header) {
    const onScroll = () => header.classList.toggle('scrolled', root.scrollY > 8);
    root.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
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
