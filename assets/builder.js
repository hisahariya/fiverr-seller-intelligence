(function (root) {
  const LEVELS = { new: 0.8, growing: 1, established: 1.3 };

  function article(phrase) {
    const first = phrase.trim().split(/\s+/)[0] || '';
    if (/^[A-Z]{2,}/.test(first)) return 'AEFHILMNORSX'.includes(first[0]) ? 'an' : 'a';
    if (/^(uni|use|usu|eu|one)/i.test(first)) return 'a';
    if (/^(hour|honest|honor)/i.test(first)) return 'an';
    return /^[aeiou]/i.test(first) ? 'an' : 'a';
  }

  function roundPrice(n) { return Math.max(5, Math.round(n / 5) * 5); }

  const ACRONYMS = /\b(seo|ai|ui|ux|ppc|ats|ios|smm|va|cv|gpt|pr)\b/g;
  function prose(tag) { return tag.replace(ACRONYMS, m => m.toUpperCase()); }

  function fillTitle(template, niche, aud) {
    return template
      .replace(/\b(a|an) \{niche\}/, article(niche) + ' {niche}')
      .replace('{niche}', niche)
      .replace('{aud}', aud)
      .replace(/\s+/g, ' ')
      .trim();
  }

  function buildGig(cat, opts) {
    const nicheGiven = (opts.niche || '').trim();
    const niche = nicheGiven || cat.nd;
    const aud = (opts.aud || '').trim() || 'your business';
    const mult = LEVELS[opts.level] || 1;

    const vocab = [...new Set(cat.kw.concat(cat.tags, [cat.noun]).map(s => s.toLowerCase()))];
    const titles = cat.titles
      .map(t => fillTitle(t, niche, aud))
      .map(t => ({
        text: t,
        len: t.length,
        ok: t.length >= 40 && t.length <= 70,
        keyword: vocab.some(k => t.toLowerCase().includes(k))
      }))
      .sort((x, y) => (y.keyword - x.keyword) || (y.ok - x.ok) || Math.abs(55 - x.len) - Math.abs(55 - y.len));

    const tagPool = [];
    if (nicheGiven) tagPool.push((nicheGiven + ' ' + cat.noun).toLowerCase());
    cat.tags.forEach(t => tagPool.push(t));
    const unique = [...new Set(tagPool)];
    const tags = unique.slice(0, 5);
    const altTags = [...new Set(unique.slice(5).concat(cat.kw.filter(k => !unique.includes(k))))];

    const names = ['Basic', 'Standard', 'Premium'];
    const packages = cat.pkgs.map((p, i) => ({
      name: names[i],
      price: roundPrice(p[0] * mult),
      days: p[1],
      deliverables: p[2]
    }));

    const extras = cat.extras.map(e => ({ name: e[0], price: roundPrice(e[1] * mult) }));

    const deliverableLines = cat.pkgs[1][2].split(', ').map(d => '- ' + d.charAt(0).toUpperCase() + d.slice(1));
    const phrase = niche + ' ' + cat.noun;
    const [needA, needB] = tags.filter(t => cat.tags.includes(t)).map(prose);
    const description = [
      `Looking for ${article(phrase)} ${phrase} for ${aud}? You're in the right place.`,
      '',
      `Whether you need ${needA} or ${needB}, I focus on work that looks professional, arrives on time and fits your goals.`,
      '',
      'What you get (Standard package):',
      ...deliverableLines,
      '',
      'Why work with me:',
      `- [Your years of experience] in ${cat.name.replace(/\s*\(.*\)/, '')}`,
      '- Fast, clear communication from start to finish',
      '- Revisions included so the final result is right',
      '- On-time delivery, every time',
      '',
      'How it works:',
      '1. Message me with your requirements',
      '2. I confirm the scope and recommend the right package',
      '3. You receive a first version for feedback',
      '4. Final delivery with every agreed file',
      '',
      "Message me before ordering to discuss your project. I'm happy to answer questions and recommend the best package for you."
    ].join('\n');

    return {
      category: cat,
      niche, aud,
      titles, tags, altTags,
      packages, extras, description,
      faq: cat.faq.map(f => ({ q: f[0], a: f[1] })),
      gallery: cat.gallery,
      tips: cat.tips
    };
  }

  root.GigBuilder = { buildGig, article, LEVELS };
  if (typeof module !== 'undefined') module.exports = root.GigBuilder;
})(typeof window !== 'undefined' ? window : globalThis);
