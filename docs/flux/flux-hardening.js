(() => {
  'use strict';

  const app = document.querySelector('#flux-app');
  const next = document.querySelector('#flux-next');
  const permalink = document.querySelector('#flux-permalink');
  const novelty = document.querySelector('#flux-novelty');
  if (!app || !next || !permalink) return;

  const KEY = 'uebey-flux-signatures-v2';
  const MAX_SIGNATURES = 4000;
  const MAX_REROLLS = 24;
  const treatments = ['solid','outline','layered','boxed','soft','slash','inverse'];

  function load() {
    try {
      const value = JSON.parse(localStorage.getItem(KEY) || '[]');
      return Array.isArray(value) ? value.filter(x => typeof x === 'string').slice(-MAX_SIGNATURES) : [];
    } catch { return []; }
  }

  function save(values) {
    try { localStorage.setItem(KEY, JSON.stringify(values.slice(-MAX_SIGNATURES))); } catch {}
  }

  function seedFromPage() {
    const match = String(permalink.getAttribute('href') || permalink.href || '').match(/[?&]seed=([a-f0-9]{32})/i);
    return match ? match[1].toLowerCase() : null;
  }

  function hashSeed(seed) {
    let h = 2166136261;
    for (let i = 0; i < seed.length; i++) {
      h ^= seed.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  }

  function applyTreatment(seed) {
    const treatment = treatments[hashSeed(seed || 'uebey') % treatments.length];
    app.dataset.treatment = treatment;
    return treatment;
  }

  function signature(treatment) {
    return [
      app.dataset.topology || 'none',
      app.dataset.geometry || 'none',
      app.dataset.type || 'none',
      app.dataset.palette || 'none',
      app.dataset.surface || 'none',
      treatment || app.dataset.treatment || 'solid'
    ].join('|');
  }

  let signatures = load();
  let seen = new Set(signatures);
  let internalClick = false;

  function remember(sig) {
    if (seen.has(sig)) return;
    seen.add(sig);
    signatures.push(sig);
    while (signatures.length > MAX_SIGNATURES) {
      const removed = signatures.shift();
      seen.delete(removed);
    }
    save(signatures);
  }

  function annotate() {
    if (!novelty) return;
    const base = novelty.textContent.split(' · anti-repeat')[0];
    novelty.textContent = `${base} · anti-repeat ${signatures.length}`;
  }

  function enforceUnique() {
    let attempts = 0;
    let finalSignature = '';

    while (attempts <= MAX_REROLLS) {
      const seed = seedFromPage();
      const treatment = applyTreatment(seed || String(Date.now()));
      finalSignature = signature(treatment);

      if (!seen.has(finalSignature)) break;

      attempts += 1;
      internalClick = true;
      next.click();
      internalClick = false;
    }

    remember(finalSignature);
    annotate();
    app.dataset.rerolls = String(attempts);
  }

  next.addEventListener('click', () => {
    if (internalClick) return;
    enforceUnique();
  });

  queueMicrotask(enforceUnique);
})();
