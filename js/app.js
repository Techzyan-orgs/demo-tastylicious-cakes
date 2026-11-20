/* =========================================================
   Tastylicious Cakes — app logic
   ========================================================= */
(() => {
  'use strict';
  document.documentElement.classList.add('js');

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const fmt = (n) => '₹' + Math.round(n).toLocaleString('en-IN');
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const byId = (id) => PRODUCTS.find((p) => p.id === id);
  const waLink = (text) => `https://wa.me/${SHOP.wa}?text=${encodeURIComponent(text)}`;
  const openWA = (text) => { const w = window.open(waLink(text), '_blank', 'noopener'); if (!w) location.href = waLink(text); };

  const store = {
    get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* storage unavailable */ } },
  };

  /* ---------------- Toast ---------------- */
  let toastTimer;
  function toast(html, ms = 3200) {
    const t = $('#toast');
    t.innerHTML = html;
    t.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove('show'), ms);
  }

  /* =========================================================
     IMAGES — try assets/img/<slug>.(webp|png|jpg), else placeholder
     ========================================================= */
  const EXTS = ['png', 'webp', 'jpg'];
  const imgState = {}; // slug -> 'missing' | resolved url

  function phUI(slug) {
    const m = IMAGES[slug] || { label: slug, icon: '🎂' };
    const ui = document.createElement('div');
    ui.className = 'ph-ui';
    ui.innerHTML = `<span class="ph-ico" aria-hidden="true">${m.icon}</span>
      <span class="ph-label">${esc(m.label)}</span>
      <span class="ph-file">assets/img/${esc(slug)}.png</span>
      <button type="button" class="ph-copy" data-copy="${esc(slug)}" title="Copy the exact Gemini 3.1 Pro prompt for this image">📋 <span class="t-long">Copy Gemini prompt</span><span class="t-short">Prompt</span></button>`;
    return ui;
  }
  function markMissing(box) {
    imgState[box.dataset.slug] = 'missing';
    box.classList.remove('is-loaded');
    box.classList.add('is-missing');
    if (!box.querySelector('.ph-ui')) box.appendChild(phUI(box.dataset.slug));
  }
  function hydrateBox(box) {
    const slug = box.dataset.slug;
    const img = box.querySelector('img');
    if (!slug || !img) return;
    box.dataset.h = '1';
    if (imgState[slug] === 'missing') return markMissing(box);
    // try the known format first (IMG_EXT in products.js), then fall back to the others
    const known = typeof IMG_EXT !== 'undefined' && IMG_EXT[slug];
    const order = known ? [known, ...EXTS.filter((e) => e !== known)] : EXTS;
    let i = 0;
    img.onload = () => { box.classList.add('is-loaded'); imgState[slug] = img.src; };
    img.onerror = () => {
      i += 1;
      if (i < order.length) img.src = `assets/img/${slug}.${order[i]}`;
      else markMissing(box);
    };
    img.src = typeof imgState[slug] === 'string' ? imgState[slug] : `assets/img/${slug}.${order[0]}`;
  }
  const hydrate = (root = document) => $$('.imgbox[data-slug]:not([data-h])', root).forEach(hydrateBox);

  /** Image markup for cart lines etc. (custom cakes carry an SVG data URL) */
  function imgHTML(item) {
    if (item.img) return `<div class="imgbox is-loaded"><img src="${item.img}" alt="" /></div>`;
    return `<div class="imgbox" data-slug="${esc(item.slug)}"><img alt="" /></div>`;
  }
  function setImgBox(box, item) {
    box.classList.remove('is-loaded', 'is-missing');
    box.querySelector('.ph-ui')?.remove();
    delete box.dataset.h;
    const img = box.querySelector('img');
    img.onload = img.onerror = null;
    if (item.img) {
      delete box.dataset.slug;
      img.src = item.img;
      box.classList.add('is-loaded');
    } else {
      box.dataset.slug = item.slug;
      hydrateBox(box);
    }
  }

  /* ---------------- Copy prompt ---------------- */
  async function copyText(text) {
    try { await navigator.clipboard.writeText(text); return true; } catch {
      const ta = document.createElement('textarea');
      ta.value = text; ta.setAttribute('readonly', ''); ta.style.cssText = 'position:fixed;opacity:0;top:0;left:0';
      document.body.appendChild(ta); ta.select();
      let ok = false; try { ok = document.execCommand('copy'); } catch { ok = false; }
      ta.remove(); return ok;
    }
  }
  document.addEventListener('click', async (e) => {
    const btn = e.target.closest('[data-copy]');
    if (!btn) return;
    e.preventDefault(); e.stopPropagation();
    const slug = btn.dataset.copy;
    const ok = await copyText(IMAGES[slug]?.prompt || '');
    btn.classList.add('copied');
    setTimeout(() => btn.classList.remove('copied'), 1400);
    toast(ok
      ? `📋 Prompt copied! Paste it into Gemini 3.1 Pro, then save the image as <code>assets/img/${esc(slug)}.png</code>`
      : 'Could not access the clipboard — open the prompt list in the footer instead.', 5000);
  }, true);

  /* =========================================================
     DRIP EDGES (generated so every divider drips a little differently)
     ========================================================= */
  function rng(seed) { return () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }; }
  function dripPath(seed) {
    const r = rng(seed * 7919 + 13);
    const W = 1440, base = 24;
    const drips = [];
    let x = 30 + r() * 40;
    while (x < W - 30) { drips.push({ c: x, w: 14 + r() * 22, L: 14 + r() * 48 }); x += 70 + r() * 110; }
    let d = `M0 0H${W}V${base}`;
    for (let i = drips.length - 1; i >= 0; i--) {
      const { c, w, L } = drips[i]; const h = w / 2;
      d += `L${(c + w).toFixed(1)} ${base}C${(c + h).toFixed(1)} ${base} ${(c + h).toFixed(1)} ${base + 4} ${(c + h).toFixed(1)} ${(base + L - h).toFixed(1)}`;
      d += `A${h.toFixed(1)} ${h.toFixed(1)} 0 0 1 ${(c - h).toFixed(1)} ${(base + L - h).toFixed(1)}`;
      d += `C${(c - h).toFixed(1)} ${base + 4} ${(c - h).toFixed(1)} ${base} ${(c - w).toFixed(1)} ${base}`;
    }
    return d + `L0 ${base}Z`;
  }
  $$('.drip-path').forEach((p, i) => p.setAttribute('d', dripPath(i + 3)));

  /* =========================================================
     WHATSAPP LINKS + NAV
     ========================================================= */
  $$('[data-wa]').forEach((a) => { a.href = waLink(a.dataset.wa); a.target = '_blank'; a.rel = 'noopener'; });

  const burger = $('#burger'), sheet = $('#m-sheet');
  function toggleSheet(open) {
    burger.setAttribute('aria-expanded', String(open));
    sheet.hidden = !open;
  }
  burger.addEventListener('click', () => toggleSheet(sheet.hidden));
  sheet.addEventListener('click', (e) => { if (e.target.closest('a')) toggleSheet(false); });
  document.addEventListener('click', (e) => { if (!sheet.hidden && !e.target.closest('.nav')) toggleSheet(false); });

  // any element with data-filter (nav tiles, promo, footer) filters the menu
  document.addEventListener('click', (e) => {
    const f = e.target.closest('[data-filter]');
    if (f) setFilter(f.dataset.filter);
  });

  /* =========================================================
     HERO — turntable carousel + parallax sprinkles
     ========================================================= */
  const heroCakes = $$('.hero-cake'), heroDots = $$('#hero-dots button');
  const heroCaps = [
    ['Party Sprinkles & Drips', 'our signature since 2015'],
    ['Double Chocolate Dream', 'for serious chocoholics'],
    ['Nolen Gur Caramel', 'a Kolkata winter, in a cake'],
  ];
  let heroIdx = 0, heroTimer;
  function showHero(n) {
    if (n === heroIdx) return;
    const cur = heroCakes[heroIdx];
    cur.classList.remove('is-active'); cur.classList.add('is-leaving');
    setTimeout(() => cur.classList.remove('is-leaving'), 800);
    heroIdx = n;
    heroCakes[n].classList.add('is-active');
    heroDots.forEach((d, i) => d.classList.toggle('is-active', i === n));
    const cap = $('#hero-caption');
    cap.innerHTML = `<b>${heroCaps[n][0]}</b><span>${heroCaps[n][1]}</span>`;
    cap.classList.remove('swap'); void cap.offsetWidth; cap.classList.add('swap');
    updateStandShadow();
  }
  const heroAuto = () => { clearInterval(heroTimer); if (!reduceMotion) heroTimer = setInterval(() => showHero((heroIdx + 1) % heroCakes.length), 4200); };
  heroDots.forEach((d, i) => d.addEventListener('click', () => { showHero(i); heroAuto(); }));
  heroAuto();

  /* Seat each hero cake on the stand: measure the image's empty (transparent) space below the
     cake and the width of its base, then shift it down and size the contact shadow to match.
     Works for any image dropped into assets/img, whatever its padding. */
  const stand = $('.stand');
  /* The photos are shot from slightly above, so each cake's base is an ellipse. The plate is drawn
     with the same ellipse proportions (same camera angle), the base ellipse is centred on the plate,
     and the contact shadow is the base ellipse itself — so the cake reads as standing on the plate. */
  function updateStandShadow() {
    const c = heroCakes[heroIdx].dataset;
    const base = parseFloat(c.base), ratio = parseFloat(c.ratio), bfrac = parseFloat(c.bfrac);
    if (!base || !ratio) { stand.style.removeProperty('--plate-h'); stand.style.removeProperty('--base-b'); stand.style.setProperty('--sw', '62%'); return; }
    const plateW = $('.stand-plate').clientWidth, cakesW = $('.stand-cakes').clientWidth, cakesH = $('.stand-cakes').clientHeight;
    const b = bfrac * cakesH;                                     // base ellipse half-height, px
    const plateH = Math.max(30, Math.min(plateW * 0.34, plateW * ratio));
    const baseWpx = base * cakesW;
    stand.style.setProperty('--plate-h', `${plateH.toFixed(1)}px`);
    stand.style.setProperty('--base-b', `${b.toFixed(1)}px`);
    stand.style.setProperty('--sw', `${((baseWpx * 1.1) / plateW * 100).toFixed(1)}%`);
    stand.style.setProperty('--sh', `${(b * 2 * 1.3 + 6).toFixed(1)}px`);
  }
  addEventListener('resize', () => updateStandShadow());
  function seatHeroCake(img) {
    if (!img.naturalWidth || !img.closest('.imgbox').classList.contains('is-loaded')) return;
    const W = img.naturalWidth, H = img.naturalHeight;
    const k = Math.min(1, 360 / Math.max(W, H));
    const w = Math.max(1, Math.round(W * k)), h = Math.max(1, Math.round(H * k));
    const cv = document.createElement('canvas'); cv.width = w; cv.height = h;
    const cx = cv.getContext('2d', { willReadFrequently: true });
    cx.drawImage(img, 0, 0, w, h);
    let d; try { d = cx.getImageData(0, 0, w, h).data; } catch { return; }
    const row = (y) => { let n = 0, l = -1, r = -1; for (let i = 0; i < w; i++) if (d[(y * w + i) * 4 + 3] > 60) { n++; if (l < 0) l = i; r = i; } return { n, l, r }; };
    let bottom = h - 1;
    while (bottom > 0 && row(bottom).n < w * 0.05) bottom--;
    // widest row near the bottom = the cake's base
    let baseW = 0, bl = 0, br = w - 1;
    for (let y = bottom; y > bottom - h * 0.1 && y > 0; y--) { const r = row(y); if (r.n && r.r - r.l > baseW) { baseW = r.r - r.l; bl = r.l; br = r.r; } }
    // how much the base curves: lowest opaque pixel at the centre vs. near the sides
    const colBottom = (x) => { x = Math.max(0, Math.min(w - 1, Math.round(x))); for (let y = h - 1; y > 0; y--) if (d[(y * w + x) * 4 + 3] > 60) return y; return 0; };
    const mid = (bl + br) / 2, a = (br - bl) / 2;
    const yc = Math.max(colBottom(mid - 2), colBottom(mid), colBottom(mid + 2));
    const ys = (colBottom(mid - a * 0.85) + colBottom(mid + a * 0.85)) / 2;
    let bb = Math.max(0, yc - ys) / (1 - Math.sqrt(1 - 0.85 * 0.85)); // ellipse half-height, sample px
    bb = Math.max(a * 0.06, Math.min(a * 0.34, bb || a * 0.12));
    const box = img.parentElement, bW = box.clientWidth, bH = box.clientHeight;
    if (!bW || !bH) return;
    const s = Math.min(bW / W, bH / H);           // object-fit: contain scale
    const padPx = ((h - 1 - bottom) / h) * H * s;   // empty space under the cake, in CSS px
    img.style.setProperty('--seat', `${((padPx / bH) * 100).toFixed(2)}%`);
    const ds = img.closest('.hero-cake').dataset;
    ds.base = ((baseW / w) * W * s / bW).toFixed(3);     // base width as a fraction of the box width
    ds.ratio = (bb / a).toFixed(3);                       // base ellipse height / width (camera angle)
    ds.bfrac = ((bb / h) * H * s / bH).toFixed(4);       // base ellipse half-height as a fraction of box height
    updateStandShadow();
  }
  $$('.hero-cake img').forEach((img) => {
    img.addEventListener('load', () => setTimeout(() => seatHeroCake(img), 0));
    if (img.complete) seatHeroCake(img);
  });

  const field = $('#sprinkles');
  const sprColors = ['#EE7B95', '#7CC6A8', '#F5C04E', '#79B4E0', '#B79BE0', '#fff'];
  const sprinkles = [];
  for (let i = 0; i < 34; i++) {
    const s = document.createElement('i');
    const k = .3 + Math.random() * 1.2;
    s.style.cssText = `left:${Math.random() * 100}%;top:${Math.random() * 100}%;background:${sprColors[i % sprColors.length]};--r:${Math.random() * 180}deg;opacity:${.5 + Math.random() * .5}`;
    s.dataset.k = k;
    field.appendChild(s); sprinkles.push(s);
  }
  let rafP;
  $('.hero').addEventListener('pointermove', (e) => {
    if (reduceMotion || e.pointerType !== 'mouse') return;
    cancelAnimationFrame(rafP);
    rafP = requestAnimationFrame(() => {
      const dx = (e.clientX / innerWidth - .5) * 40, dy = (e.clientY / innerHeight - .5) * 30;
      sprinkles.forEach((s) => { s.style.setProperty('--mx', `${dx * s.dataset.k}px`); s.style.setProperty('--my', `${dy * s.dataset.k}px`); });
    });
  });

  /* =========================================================
     MENU
     ========================================================= */
  const state = {
    filter: 'all',
    sizeSel: {},
    cart: store.get('tc-cart', []),
    promo: store.get('tc-promo', false),
    step: 'bag',
    mode: 'delivery',
    form: {},
    lastMsg: '',
  };
  const sizesOf = (p) => SIZESETS[p.sizes];
  const priceOf = (p, idx = 0, eggless = false) => Math.round((p.price * sizesOf(p)[idx].mult) / 10) * 10 + (eggless ? 50 : 0);
  const bagIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 8h14l-1.2 12H6.2z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/></svg>';

  function cardHTML(p, i) {
    const sel = state.sizeSel[p.id] || 0;
    const sz = sizesOf(p);
    return `<article class="cake-card" data-tint="${p.tint}" style="--i:${i}">
      <button class="cc-media" data-qv="${p.id}" aria-label="Quick view: ${esc(p.name)}"><div class="imgbox" data-slug="${p.id}"><img alt="${esc(p.name)}" loading="lazy" /></div></button>
      ${p.badge ? `<span class="cc-badge" data-b="${esc(p.badge)}">${esc(p.badge === 'Bestseller' ? 'Best seller' : p.badge)}</span>` : ''}
      <span class="cc-tag" data-tag="${p.id}">${fmt(priceOf(p, sel))}<br/><small style="font-size:.85rem">${sz[sel].label}</small></span>
      <div class="cc-body">
        <h3>${esc(p.name)}</h3>
        <p class="cc-sub">${esc(p.tag)}</p>
        ${p.eggless ? '<span class="veg">Eggless option</span>' : ''}
        <div class="sizes" role="radiogroup" aria-label="Choose size">
          ${sz.map((s, j) => `<button type="button" role="radio" aria-checked="${j === sel}" class="${j === sel ? 'is-on' : ''}" data-pid="${p.id}" data-size="${j}">${s.label}</button>`).join('')}
        </div>
        <div class="cc-foot">
          <button class="btn-ghost sm" data-qv="${p.id}">Details</button>
          <button class="add-btn" data-add="${p.id}">${bagIcon}<span>Add to Bag</span></button>
        </div>
      </div>
    </article>`;
  }
  function renderMenu() {
    const list = PRODUCTS.filter((p) => state.filter === 'all' || (state.filter === 'eggless' ? p.eggless : p.cat === state.filter));
    const grid = $('#menu-grid');
    grid.innerHTML = list.length ? list.map(cardHTML).join('') : '<p class="menu-empty">Nothing here yet — the oven is warming up!</p>';
    hydrate(grid);
  }
  function setFilter(f) {
    if (!f) return;
    state.filter = f;
    $$('.chip').forEach((c) => c.classList.toggle('is-active', c.dataset.chip === f));
    $$('.tile[data-filter]').forEach((t) => t.classList.toggle('is-current', t.dataset.filter === f));
    renderMenu();
  }
  $$('.chip').forEach((c) => c.addEventListener('click', () => setFilter(c.dataset.chip)));

  $('#menu-grid').addEventListener('click', (e) => {
    const s = e.target.closest('[data-size]');
    if (s) {
      const p = byId(s.dataset.pid), idx = +s.dataset.size;
      state.sizeSel[p.id] = idx;
      $$(`[data-pid="${p.id}"]`).forEach((b) => { const on = +b.dataset.size === idx; b.classList.toggle('is-on', on); b.setAttribute('aria-checked', on); });
      const tag = $(`[data-tag="${p.id}"]`);
      tag.innerHTML = `${fmt(priceOf(p, idx))}<br/><small style="font-size:.85rem">${sizesOf(p)[idx].label}</small>`;
      tag.style.animation = 'none'; void tag.offsetWidth; tag.style.animation = 'tagSwing .8s ease';
      return;
    }
    const a = e.target.closest('[data-add]');
    if (a) {
      const p = byId(a.dataset.add), idx = state.sizeSel[p.id] || 0;
      addProduct(p, { idx }, a);
      return;
    }
    const q = e.target.closest('[data-qv]');
    if (q) openQV(q.dataset.qv);
  });

  /* =========================================================
     QUICK VIEW
     ========================================================= */
  const qv = $('#qv');
  function openQV(id) {
    const p = byId(id); if (!p) return;
    const o = { idx: state.sizeSel[id] || 0, eggless: false, msg: '', qty: 1 };
    const tints = { pink: '#FCDDE3', mint: '#DDF3E8', choc: '#F1DDCD', butter: '#FFF2CC', peach: '#FFE8D6', sky: '#E2EFF9' };
    const body = $('#qv-body');
    body.innerHTML = `
      <div class="qv-media" style="--tint:${tints[p.tint]}"><div class="imgbox" data-slug="${p.id}"><img alt="${esc(p.name)}" /></div></div>
      <div class="qv-info">
        <h3>${esc(p.name)}</h3>
        <p class="cc-sub">${esc(p.tag)}</p>
        <p style="margin:0">${esc(p.desc)}</p>
        <div class="sizes" id="qv-sizes">${sizesOf(p).map((s, j) => `<button type="button" data-j="${j}" class="${j === o.idx ? 'is-on' : ''}">${s.label}</button>`).join('')}</div>
        ${p.eggless ? '<label class="chk"><input type="checkbox" id="qv-egg" /> Make it eggless <small style="color:var(--muted)">(+₹50)</small></label>' : '<p class="veg" style="color:var(--muted)">Contains egg</p>'}
        ${p.cat === 'cakes' ? '<input type="text" id="qv-msg" maxlength="30" placeholder="Message on cake (optional)" />' : ''}
        <div class="qv-row">
          <div class="qty"><button type="button" id="qv-minus" aria-label="Less">−</button><span id="qv-qty">1</span><button type="button" id="qv-plus" aria-label="More">+</button></div>
          <span class="price" id="qv-price"></span>
        </div>
        <button class="add-btn" id="qv-add" style="justify-self:start;font-size:1.1rem;padding:13px 22px">${bagIcon}<span>Add to Bag</span></button>
      </div>`;
    hydrate(body);
    const upd = () => { $('#qv-price').textContent = fmt(priceOf(p, o.idx, o.eggless) * o.qty); $('#qv-qty').textContent = o.qty; };
    upd();
    $('#qv-sizes').addEventListener('click', (e) => {
      const b = e.target.closest('[data-j]'); if (!b) return;
      o.idx = +b.dataset.j; $$('#qv-sizes button').forEach((x) => x.classList.toggle('is-on', x === b)); upd();
    });
    $('#qv-egg')?.addEventListener('change', (e) => { o.eggless = e.target.checked; upd(); });
    $('#qv-minus').addEventListener('click', () => { o.qty = Math.max(1, o.qty - 1); upd(); });
    $('#qv-plus').addEventListener('click', () => { o.qty = Math.min(20, o.qty + 1); upd(); });
    $('#qv-add').addEventListener('click', (e) => {
      o.msg = ($('#qv-msg')?.value || '').trim();
      qv.close();
      addProduct(p, o, e.currentTarget);
    });
    qv.showModal();
  }
  qv.addEventListener('click', (e) => { if (e.target === qv || e.target.closest('[data-close]')) qv.close(); });

  /* =========================================================
     CART
     ========================================================= */
  const cartCount = () => state.cart.reduce((n, i) => n + i.qty, 0);
  function totals() {
    const sub = state.cart.reduce((n, i) => n + i.price * i.qty, 0);
    const disc = state.promo ? Math.round((sub * SHOP.promo.pct) / 100) : 0;
    const after = sub - disc;
    const ship = !sub || state.mode === 'pickup' || after >= SHOP.freeDeliveryAt ? 0 : SHOP.deliveryFee;
    return { sub, disc, ship, total: after + ship };
  }
  const save = () => { store.set('tc-cart', state.cart); store.set('tc-promo', state.promo); };

  function addProduct(p, o, btn) {
    const sz = sizesOf(p)[o.idx || 0];
    addToCart({
      key: [p.id, o.idx || 0, o.eggless ? 'e' : '', o.msg || ''].join('|'),
      type: 'product', slug: p.id, name: p.name,
      size: sz.label + (o.eggless ? ' · eggless' : ''), msg: o.msg || '',
      price: priceOf(p, o.idx || 0, o.eggless), qty: o.qty || 1,
    }, btn);
  }
  function addToCart(item, btn) {
    const line = state.cart.find((i) => i.key === item.key);
    if (line) line.qty += item.qty || 1; else state.cart.push({ ...item, qty: item.qty || 1 });
    if (state.step === 'done') state.step = 'bag';
    save(); renderCart(); updateBadge(false);
    playBox(item);
    if (btn && btn.classList.contains('add-btn')) {
      const html = btn.innerHTML;
      btn.classList.add('added');
      btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12l5 5L20 7"/></svg><span>Added!</span>';
      setTimeout(() => { btn.innerHTML = html; btn.classList.remove('added'); }, 1600);
    }
  }
  function updateBadge(pop = true) {
    const b = $('#cart-badge'), n = cartCount();
    b.textContent = n; b.classList.toggle('has', n > 0);
    // floating cake-box cart
    const fc = $('#float-cart');
    $('#fc-badge').textContent = n;
    fc.classList.toggle('has-items', n > 0);
    $('#fc-tip').textContent = n ? `Your Sweet Basket · ${n} item${n === 1 ? '' : 's'} · ${fmt(totals().sub)}` : 'Your basket is empty';
    fc.setAttribute('aria-label', n ? `Open your sweet basket (${n} item${n === 1 ? '' : 's'})` : 'Open your sweet basket (empty)');
    if (pop && n) {
      b.classList.remove('pop'); void b.offsetWidth; b.classList.add('pop');
      const c = $('#cart-open'); c.classList.remove('wiggle'); void c.offsetWidth; c.classList.add('wiggle');
      fc.classList.remove('bounce'); void fc.offsetWidth; fc.classList.add('bounce');
    }
  }

  const drawer = $('#drawer'), scrim = $('#scrim');
  function openCart() {
    if (qv.open) qv.close();
    drawer.classList.add('open'); drawer.setAttribute('aria-hidden', 'false');
    scrim.hidden = false; document.body.style.overflow = 'hidden';
    renderCart();
    setTimeout(() => $('#cart-close').focus(), 50);
  }
  function closeCart() {
    drawer.classList.remove('open'); drawer.setAttribute('aria-hidden', 'true');
    scrim.hidden = true; document.body.style.overflow = '';
    if (state.step === 'done') { state.step = 'bag'; }
  }
  $('#cart-open').addEventListener('click', openCart);
  $('#float-cart').addEventListener('click', openCart);

  /* Branded cake box (assets/img/cake-box.png, made with Gemini — prompt in IMAGES['cake-box']).
     When it exists it becomes both the nav cart and the floating cart; until then the
     wicker basket and the CSS-drawn pink box stay in place. */
  (function useCakeBox(i = 0) {
    if (typeof USE_CAKE_BOX_IMAGE === 'undefined' || !USE_CAKE_BOX_IMAGE || i >= EXTS.length) return;
    const probe = new Image();
    probe.onload = () => {
      $('#cart-img').src = probe.src;
      $('#cart-open').classList.add('has-box');
      $('#fc-img').src = probe.src;
      $('#float-cart').classList.add('has-img');
    };
    probe.onerror = () => useCakeBox(i + 1);
    probe.src = `assets/img/cake-box.${EXTS[i]}`;
  })();
  $('#cart-close').addEventListener('click', closeCart);
  scrim.addEventListener('click', closeCart);
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && drawer.classList.contains('open')) closeCart(); });

  function renderCart() {
    const n = cartCount();
    $('#cart-count').textContent = `(${n} item${n === 1 ? '' : 's'})`;
    const steps = { bag: 0, details: 1, done: 2 };
    $$('#cart-steps li').forEach((li, i) => li.classList.toggle('on', i <= steps[state.step]));
    if (state.step === 'done') return renderDone();
    if (!n) {
      state.step = 'bag';
      $('#cart-items').innerHTML = `<div class="cart-empty"><div class="big">🧺</div><b>Your basket is empty</b><span>Nothing sweet in here yet — let's fix that.</span><button class="btn-cookie sm" id="cart-shop">Browse treats</button></div>`;
      $('#cart-foot').innerHTML = '';
      $('#cart-shop').addEventListener('click', () => { closeCart(); location.hash = '#menu'; });
      return;
    }
    if (state.step === 'details') return renderDetails();
    renderBag();
  }

  function renderBag() {
    const t = totals();
    const left = SHOP.freeDeliveryAt - (t.sub - t.disc);
    $('#cart-items').innerHTML = `
      <div class="free-bar">${left > 0 ? `Add <b>${fmt(left)}</b> more for <b>free delivery</b> across Kolkata 🛵` : '🎉 Yay! You’ve unlocked <b>free delivery</b>'}
        <div class="bar"><i style="width:${Math.min(100, ((t.sub - t.disc) / SHOP.freeDeliveryAt) * 100)}%"></i></div></div>
      ${state.cart.map((i, idx) => `
        <div class="ci">
          ${imgHTML(i)}
          <div>
            <h4>${esc(i.name)}</h4>
            <div class="opts">${esc(i.size)}${i.msg ? ` · “${esc(i.msg)}”` : ''}</div>
            <div class="qty"><button data-q="${idx}" data-d="-1" aria-label="Decrease">−</button><span>${i.qty}</span><button data-q="${idx}" data-d="1" aria-label="Increase">+</button></div>
          </div>
          <div class="ci-r"><b>${fmt(i.price * i.qty)}</b><button data-rm="${idx}">Remove</button></div>
        </div>`).join('')}
      <label class="lab-label" for="promo-in" style="display:block;margin-top:6px">Promo code</label>
      <div class="promo-row"><input id="promo-in" placeholder="Sprinkle some magic (try SWEET10)" value="${state.promo ? SHOP.promo.code : ''}" /><button id="promo-apply">${state.promo ? 'Remove' : 'Apply'}</button></div>
      <p class="promo-msg ${state.promo ? 'ok' : ''}" id="promo-msg">${state.promo ? `✓ ${SHOP.promo.code} applied — ${SHOP.promo.pct}% off!` : ''}</p>`;
    hydrate($('#cart-items'));

    $('#cart-foot').innerHTML = `
      <div class="totals">
        <div class="t-line"><span>Subtotal</span><span>${fmt(t.sub)}</span></div>
        ${t.disc ? `<div class="t-line"><span>Promo ${SHOP.promo.code}</span><span class="save">− ${fmt(t.disc)}</span></div>` : ''}
        <div class="t-line"><span>Est. delivery</span><span>${t.ship ? fmt(t.ship) : '<span class="save">FREE</span>'}</span></div>
        <div class="t-line total"><span>Total</span><span>${fmt(t.total)}</span></div>
        <button class="btn-choco" id="to-details">Proceed to Bake →</button>
      </div>
      <span class="or-wa">— or skip the form —</span>
      <button class="btn-wa" id="quick-wa">
        <svg viewBox="0 0 32 32" aria-hidden="true"><path fill="currentColor" d="M16 3a13 13 0 0 0-11.2 19.6L3 29l6.6-1.7A13 13 0 1 0 16 3z"/></svg>
        Send this basket on WhatsApp</button>
      <p class="foot-note">Baked with love &amp; delivered fresh! 🛵</p>`;

    $('#promo-apply').addEventListener('click', () => {
      if (state.promo) { state.promo = false; save(); return renderCart(); }
      const v = $('#promo-in').value.trim().toUpperCase();
      if (v === SHOP.promo.code) { state.promo = true; save(); renderCart(); toast('🎉 Sweet! 10% off applied.'); }
      else { const m = $('#promo-msg'); m.className = 'promo-msg err'; m.textContent = 'Hmm, that code didn’t rise. Try SWEET10 😉'; $('#promo-in').closest('.promo-row').classList.add('field-err'); setTimeout(() => $('#promo-in')?.closest('.promo-row')?.classList.remove('field-err'), 500); }
    });
    $('#promo-in').addEventListener('keydown', (e) => { if (e.key === 'Enter') $('#promo-apply').click(); });
    $('#to-details').addEventListener('click', () => { state.step = 'details'; renderCart(); $('#cart-items').scrollTop = 0; });
    $('#quick-wa').addEventListener('click', () => {
      const msg = `${orderLines()}\n\nHi! I'd like to order the above. Please confirm availability and delivery details. 🙏`;
      openWA(msg);
    });
  }

  $('#cart-items').addEventListener('click', (e) => {
    const q = e.target.closest('[data-q]');
    if (q) {
      const i = state.cart[+q.dataset.q];
      i.qty += +q.dataset.d;
      if (i.qty < 1) state.cart.splice(+q.dataset.q, 1);
      save(); updateBadge(false); renderCart(); return;
    }
    const r = e.target.closest('[data-rm]');
    if (r) { state.cart.splice(+r.dataset.rm, 1); save(); updateBadge(false); renderCart(); }
  });

  /* ---------- Details step (checkout form) ---------- */
  const OUTLETS = [
    { name: 'Sweet Studio — Gariahat', addr: '23/1 Gariahat Road (South), Kolkata 700029', q: 'Gariahat Road, Kolkata 700029', hours: 'Mon–Sat 9 AM–10 PM · Sun 10 AM–9 PM', star: '⭐', tag: 'Flagship studio' },
    { name: 'Naktala Express', addr: 'Near Naktala HP Petrol Pump, N.S.C. Bose Road, Kolkata 700047', q: 'Naktala, Kolkata 700047', hours: 'Daily 10 AM–10 PM', star: '🌟', tag: 'New!' },
    { name: 'Jadavpur Corner', addr: '8B Bus Stand, Raja S.C. Mullick Road, Kolkata 700032', q: '8B Bus Stand, Jadavpur, Kolkata', hours: 'Daily 10 AM–9:30 PM', star: '💫', tag: 'New!' },
  ];
  const SLOTS = ['10 AM – 12 PM', '12 PM – 3 PM', '3 PM – 6 PM', '6 PM – 9 PM', 'Midnight surprise (11:30 PM – 12 AM)'];
  const todayISO = () => { const d = new Date(); d.setMinutes(d.getMinutes() - d.getTimezoneOffset()); return d.toISOString().slice(0, 10); };

  function readForm() {
    const f = $('#co-form'); if (!f) return;
    $$('input, select, textarea', f).forEach((el) => { state.form[el.name] = el.value; });
  }
  function renderDetails() {
    const F = state.form, t = totals();
    const pickup = state.mode === 'pickup';
    $('#cart-items').innerHTML = `
      <form class="co-form" id="co-form" novalidate>
        <h4>Who's it for?</h4>
        <div class="row2">
          <label>Your name<input name="name" autocomplete="name" value="${esc(F.name)}" placeholder="Full name" /></label>
          <label>Mobile<input name="phone" type="tel" autocomplete="tel" inputmode="tel" value="${esc(F.phone)}" placeholder="10-digit number" /></label>
        </div>
        <h4>How should it reach you?</h4>
        <div class="toggle" role="radiogroup">
          <button type="button" data-mode="delivery" class="${pickup ? '' : 'is-on'}">🛵 Home delivery</button>
          <button type="button" data-mode="pickup" class="${pickup ? 'is-on' : ''}">🏪 Pick up</button>
        </div>
        ${pickup
          ? `<label>Pickup outlet<select name="outlet">${OUTLETS.map((o) => `<option ${F.outlet === o.name ? 'selected' : ''}>${esc(o.name)}</option>`).join('')}</select></label>`
          : `<label>Delivery address<textarea name="address" rows="3" autocomplete="street-address" placeholder="Flat / house, street, landmark, area, PIN">${esc(F.address)}</textarea></label>`}
        <div class="row2">
          <label>Date<input name="date" type="date" min="${todayISO()}" value="${esc(F.date)}" /></label>
          <label>Time slot<select name="slot">${SLOTS.map((s) => `<option ${F.slot === s ? 'selected' : ''}>${s}</option>`).join('')}</select></label>
        </div>
        <label>Anything else? <textarea name="notes" rows="2" placeholder="Candles, knife, allergy notes, gift note…">${esc(F.notes)}</textarea></label>
      </form>`;
    $('#cart-foot').innerHTML = `
      <div class="mini-sum">
        <div><span>${cartCount()} item(s)${t.disc ? ` · ${SHOP.promo.code}` : ''}</span><span>${fmt(t.sub - t.disc)}</span></div>
        <div><span>${pickup ? 'Pickup' : 'Delivery'}</span><span>${t.ship ? fmt(t.ship) : 'FREE'}</span></div>
        <div class="tot"><span>Total</span><span>${fmt(t.total)}</span></div>
      </div>
      <div class="co-acts" style="margin-top:12px">
        <button class="btn-ghost" id="co-back">← Basket</button>
        <button class="btn-wa" id="co-send">
          <svg viewBox="0 0 32 32" aria-hidden="true"><path fill="currentColor" d="M16 3a13 13 0 0 0-11.2 19.6L3 29l6.6-1.7A13 13 0 1 0 16 3z"/></svg>
          Send Order on WhatsApp</button>
      </div>
      <p class="foot-note" style="font-size:1.1rem">Pay by UPI or cash once we confirm on chat 💬</p>`;

    $('#co-form').addEventListener('input', readForm);
    $$('[data-mode]').forEach((b) => b.addEventListener('click', () => { readForm(); state.mode = b.dataset.mode; renderDetails(); }));
    $('#co-back').addEventListener('click', () => { readForm(); state.step = 'bag'; renderCart(); });
    $('#co-send').addEventListener('click', sendOrder);
  }

  function orderLines() {
    const t = totals();
    const lines = state.cart.map((i, n) => `${n + 1}. ${i.name} (${i.size}) × ${i.qty} — ${fmt(i.price * i.qty)}${i.msg ? `\n    ✍️ ${i.type === 'custom' ? 'Name on top' : 'Message on cake'}: “${i.msg}”` : ''}${i.spec ? `\n    🧪 ${i.spec}` : ''}`);
    return [
      '🎂 *Order — Tastylicious Cakes*', '',
      '*Items*', ...lines, '',
      `Subtotal: ${fmt(t.sub)}`,
      t.disc ? `Promo ${SHOP.promo.code}: −${fmt(t.disc)}` : null,
      `${state.mode === 'pickup' ? 'Pickup' : 'Delivery'}: ${t.ship ? fmt(t.ship) : 'FREE'}`,
      `*Total: ${fmt(t.total)}*`,
    ].filter((x) => x !== null).join('\n');
  }

  function sendOrder() {
    readForm();
    const F = state.form, f = $('#co-form');
    const bad = [];
    const phone = (F.phone || '').replace(/[^\d]/g, '').replace(/^91(?=\d{10}$)/, '');
    if (!(F.name || '').trim()) bad.push('name');
    if (!/^[6-9]\d{9}$/.test(phone)) bad.push('phone');
    if (state.mode === 'delivery' && (F.address || '').trim().length < 8) bad.push('address');
    if (!F.date) bad.push('date');
    $$('.field-err', f).forEach((el) => el.classList.remove('field-err'));
    if (bad.length) {
      bad.forEach((n) => f.elements[n]?.classList.add('field-err'));
      f.elements[bad[0]]?.focus();
      toast('Please fill the highlighted fields 🙏');
      return;
    }
    const ref = 'TC-' + Date.now().toString(36).slice(-5).toUpperCase();
    const when = new Date(F.date + 'T00:00').toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
    const msg = [
      orderLines().replace('*Order — Tastylicious Cakes*', `*New order ${ref} — Tastylicious Cakes*`), '',
      '*Customer*',
      `👤 ${F.name.trim()}`,
      `📞 +91 ${phone}`,
      state.mode === 'pickup' ? `🏪 Pickup at: ${F.outlet || OUTLETS[0].name}` : `🛵 Deliver to: ${F.address.trim()}`,
      `📅 ${when} · ⏰ ${F.slot || SLOTS[0]}`,
      F.notes?.trim() ? `📝 ${F.notes.trim()}` : null,
      '', 'Payment: UPI / cash — please confirm. Thank you! 💛',
    ].filter((x) => x !== null).join('\n');
    state.lastMsg = msg; state.lastRef = ref;
    openWA(msg);
    state.step = 'done';
    renderCart();
  }

  function renderDone() {
    $('#cart-items').innerHTML = `
      <div class="done">
        <div class="big">🎉</div>
        <h3>Order sent to our bakers!</h3>
        <span class="ref">${esc(state.lastRef || '')}</span>
        <p>WhatsApp should have opened with your order filled in. Just hit <b>send</b> there, and we'll confirm within 15 minutes.</p>
        <a class="btn-wa sm" href="${waLink(state.lastMsg)}" target="_blank" rel="noopener">WhatsApp didn’t open? Tap here</a>
        <button class="btn-cookie sm" id="done-new" style="margin-top:14px">Start a new basket</button>
      </div>`;
    $('#cart-foot').innerHTML = '';
    $('#done-new').addEventListener('click', () => { state.cart = []; state.promo = false; state.step = 'bag'; save(); updateBadge(false); renderCart(); });
  }

  /* =========================================================
     ADD-TO-BAG ANIMATION — cake drops into the box, lid lands, ribbon ties, sprinkles burst
     ========================================================= */
  const ba = $('#bag-anim');
  let baTimer, baTitleTimer;
  const burstColors = ['#EE7B95', '#7CC6A8', '#F5C04E', '#79B4E0', '#B79BE0', '#D9A066'];
  function buildParticles() {
    const wrap = $('#ba-particles');
    wrap.innerHTML = '';
    for (let i = 0; i < 22; i++) {
      const el = document.createElement('i');
      const ang = (-160 + Math.random() * 140) * (Math.PI / 180);
      const dist = 90 + Math.random() * 90;
      if (i % 6 === 0) { el.className = 'heart'; el.textContent = ['💖', '✨', '🍓', '⭐'][i % 4]; }
      el.style.setProperty('--c', burstColors[i % burstColors.length]);
      el.style.setProperty('--tx', `${Math.cos(ang) * dist}px`);
      el.style.setProperty('--ty', `${Math.sin(ang) * dist}px`);
      el.style.setProperty('--r', `${Math.random() * 540 - 270}deg`);
      el.style.setProperty('--dl', `${1.3 + Math.random() * .2}s`);
      wrap.appendChild(el);
    }
  }
  function playBox(item) {
    $$('dialog[open]').forEach((d) => d !== ba && d.close());
    $('#ba-title').textContent = 'Boxing it up for you…';
    $('#ba-sub').textContent = `${item.name} · ${item.size}`;
    setImgBox($('#ba-img'), item);
    $('#ba-count').textContent = cartCount();
    $('#ba-total').textContent = fmt(totals().sub);
    buildParticles();
    ba.classList.remove('play');
    $('#ba-particles').classList.remove('active');
    void ba.offsetWidth;
    if (!ba.open) ba.showModal();
    ba.classList.add('play');
    $('#ba-particles').classList.add('active');
    clearTimeout(baTitleTimer);
    baTitleTimer = setTimeout(() => { $('#ba-title').textContent = 'Added to your basket! 🎉'; }, reduceMotion ? 0 : 1350);
    armBoxClose(3900);
  }
  function armBoxClose(ms) { clearTimeout(baTimer); baTimer = setTimeout(closeBox, ms); }
  function closeBox() { clearTimeout(baTimer); if (ba.open) ba.close(); }
  ba.addEventListener('close', () => { ba.classList.remove('play'); updateBadge(true); });
  ba.addEventListener('pointerenter', () => clearTimeout(baTimer));
  ba.addEventListener('pointerleave', () => { if (ba.open) armBoxClose(1800); });
  ba.addEventListener('click', (e) => { if (e.target === ba) closeBox(); });
  $('#ba-close').addEventListener('click', closeBox);
  $('#ba-continue').addEventListener('click', closeBox);
  $('#ba-view').addEventListener('click', () => { closeBox(); state.step = 'bag'; openCart(); });

  /* =========================================================
     CAKE LAB — live SVG cake builder
     ========================================================= */
  const LAB = {
    tiers: { 1: { kg: 1, price: 1100 }, 2: { kg: 2.5, price: 2700 }, 3: { kg: 4, price: 4400 } },
    sponge: [
      { v: 'vanilla', name: 'Vanilla', c: '#F6E3B4', p: 0 },
      { v: 'chocolate', name: 'Chocolate', c: '#6B3A26', p: 100 },
      { v: 'redvelvet', name: 'Red Velvet', c: '#A8323E', p: 150 },
      { v: 'nolengur', name: 'Nolen Gur', c: '#C98A3E', p: 180 },
      { v: 'pineapple', name: 'Pineapple', c: '#F7D774', p: 60 },
    ],
    frost: [
      { v: 'cream', name: 'Vanilla cream', c: '#FFF7EC' },
      { v: 'blush', name: 'Blush pink', c: '#F7B9C4' },
      { v: 'mint', name: 'Mint', c: '#BFE6D3' },
      { v: 'sky', name: 'Sky blue', c: '#C2DDF2' },
      { v: 'butter', name: 'Butter yellow', c: '#FFE49A' },
      { v: 'lilac', name: 'Lilac', c: '#D9C6F0' },
      { v: 'choc', name: 'Chocolate', c: '#7A4129' },
    ],
    drip: [
      { v: 'none', name: 'No drip', c: 'transparent', p: 0 },
      { v: 'choc', name: 'Dark choc', c: '#4A2318', p: 80 },
      { v: 'caramel', name: 'Caramel', c: '#C9822E', p: 80 },
      { v: 'pink', name: 'Strawberry', c: '#EE7B95', p: 80 },
      { v: 'white', name: 'White choc', c: '#FFFDF6', p: 90 },
      { v: 'gold', name: 'Gold', c: '#D4AF37', p: 150 },
    ],
    topper: [
      { v: 'none', name: 'None', p: 0 },
      { v: 'berries', name: '🍓 Berries', p: 120 },
      { v: 'macarons', name: '🟣 Macarons', p: 220 },
      { v: 'flowers', name: '🌸 Flowers', p: 180 },
      { v: 'candles', name: '🕯️ Candles', p: 40 },
      { v: 'star', name: '⭐ Gold star', p: 80 },
    ],
    // real topper photos (assets/img/topper-*.png); ar = width / height of the image
    occasion: [
      { v: 'none', name: 'None', text: '', p: 0 },
      { v: 'bday', name: 'Happy Birthday', text: 'Happy Birthday', p: 150, img: 'assets/img/topper-bday.png', ar: 420 / 453, kind: 'acrylic' },
      { v: 'anniv', name: 'Happy Anniversary', text: 'Happy Anniversary', p: 150, img: 'assets/img/topper-anniv.png?v=2', ar: 640 / 127, kind: 'script' },
      { v: 'congrats', name: 'Congrats', text: 'Congrats', p: 150, img: 'assets/img/topper-congrats.png', ar: 501 / 116, kind: 'bunting' },
    ],
  };
  const lab = { tiers: 1, sponge: 'vanilla', frost: 'blush', drip: 'choc', topper: 'macarons', occasion: 'bday', name: '' };
  const pick = (k) => LAB[k].find((o) => o.v === lab[k]);

  $('[data-opt="sponge"]').innerHTML = LAB.sponge.map((o) => `<button type="button" data-v="${o.v}">${o.name}<small>${o.p ? '+' + fmt(o.p) + '/kg' : 'included'}</small></button>`).join('');
  $('[data-opt="frost"]').innerHTML = LAB.frost.map((o) => `<button type="button" data-v="${o.v}" data-name="${o.name}" style="--c:${o.c}" aria-label="${o.name}"></button>`).join('');
  $('[data-opt="drip"]').innerHTML = LAB.drip.map((o) => `<button type="button" data-v="${o.v}" data-name="${o.name}${o.p ? ' +' + fmt(o.p) : ''}" style="--c:${o.c}" aria-label="${o.name}"></button>`).join('');
  $('[data-opt="topper"]').innerHTML = LAB.topper.map((o) => `<button type="button" data-v="${o.v}">${o.name}<small>${o.p ? '+' + fmt(o.p) : '—'}</small></button>`).join('');
  $('[data-opt="occasion"]').innerHTML = LAB.occasion.map((o) => `<button type="button" data-v="${o.v}">${o.name}</button>`).join('');
  // embed the topper photos as data URLs so they also show in the basket snapshot (an SVG image can't load external files)
  const topperData = {};
  LAB.occasion.filter((o) => o.img).forEach((o) => {
    fetch(o.img).then((r) => (r.ok ? r.blob() : Promise.reject())).then((b) => new Promise((res) => { const fr = new FileReader(); fr.onload = () => res(fr.result); fr.readAsDataURL(b); }))
      .then((u) => { topperData[o.v] = u; if (lab.occasion === o.v) drawCake(false, false); }).catch(() => {});
  });
  function syncLabButtons() {
    $$('[data-opt]').forEach((g) => $$('button', g).forEach((b) => b.classList.toggle('is-on', String(lab[g.dataset.opt]) === b.dataset.v)));
  }
  $('#lab-form').addEventListener('click', (e) => {
    const b = e.target.closest('[data-opt] button'); if (!b) return;
    const k = b.closest('[data-opt]').dataset.opt;
    const prevTiers = lab.tiers;
    lab[k] = k === 'tiers' ? +b.dataset.v : b.dataset.v;
    syncLabButtons();
    drawCake(k === 'tiers' && lab.tiers !== prevTiers, k === 'topper' || k === 'occasion');
  });
  $('#lab-name').addEventListener('input', (e) => { lab.name = e.target.value.replace(/\s+/g, ' ').trimStart(); drawCake(false, false); });

  const shade = (hex, amt) => {
    const n = parseInt(hex.slice(1), 16);
    const f = (c) => Math.max(0, Math.min(255, Math.round(c + (amt > 0 ? (255 - c) * amt : c * amt))));
    return '#' + [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((c) => f(c).toString(16).padStart(2, '0')).join('');
  };
  const isDark = (hex) => { const n = parseInt(hex.slice(1), 16); return (((n >> 16) & 255) * .299 + ((n >> 8) & 255) * .587 + (n & 255) * .114) < 140; };

  function labPrice() {
    const t = LAB.tiers[lab.tiers];
    return t.price + pick('sponge').p * t.kg + pick('drip').p * lab.tiers + pick('topper').p + pick('occasion').p;
  }

  /* ---------- Realistic SVG cake renderer ----------
     Everything is drawn in a consistent 3/4 camera (K = ellipse height / width), lit from the
     upper left: cylinder shading + buttercream texture on each tier, glossy drips with teardrop
     ends, shaded rosette piping, a ceramic board with contact shadows, and detailed toppers. */
  function drawCake(animateTiers, animateTopper) {
    const svg = $('#lab-svg');
    const frost = pick('frost').c, drip = pick('drip'), sponge = pick('sponge');
    const dims = { 1: [[236, 118]], 2: [[240, 94], [168, 82]], 3: [[244, 76], [182, 68], [122, 60]] }[lab.tiers];
    const cx = 170, K = 0.14, y0 = 288;
    const hasDrip = drip.v !== 'none', dc = drip.c;
    const darkFrost = isDark(frost);
    const f1 = (n) => n.toFixed(1);

    let out = `<defs>
      <linearGradient id="g-cyl" x1="0" x2="1">
        <stop offset="0" stop-color="#000" stop-opacity=".26"/><stop offset=".16" stop-color="#000" stop-opacity=".06"/>
        <stop offset=".34" stop-color="#fff" stop-opacity=".3"/><stop offset=".48" stop-color="#fff" stop-opacity=".08"/>
        <stop offset=".76" stop-color="#000" stop-opacity=".06"/><stop offset="1" stop-color="#000" stop-opacity=".32"/>
      </linearGradient>
      <linearGradient id="g-vert" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#fff" stop-opacity=".12"/><stop offset=".22" stop-color="#fff" stop-opacity="0"/>
        <stop offset=".78" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".18"/>
      </linearGradient>
      <radialGradient id="g-top" cx=".4" cy=".36" r=".72">
        <stop offset="0" stop-color="${shade(frost, .34)}"/><stop offset=".7" stop-color="${shade(frost, .12)}"/><stop offset="1" stop-color="${shade(frost, -.06)}"/>
      </radialGradient>
      <radialGradient id="g-ros" cx=".34" cy=".3" r=".78">
        <stop offset="0" stop-color="${shade(frost, .6)}"/><stop offset=".5" stop-color="${frost}"/><stop offset="1" stop-color="${shade(frost, -.26)}"/>
      </radialGradient>
      <radialGradient id="g-gloss" cx=".34" cy=".26" r=".62">
        <stop offset="0" stop-color="#fff" stop-opacity=".8"/><stop offset="1" stop-color="#fff" stop-opacity="0"/>
      </radialGradient>
      <radialGradient id="g-board" cx=".44" cy=".38" r=".66">
        <stop offset="0" stop-color="#FFFFFF"/><stop offset=".72" stop-color="#F2EADF"/><stop offset="1" stop-color="#D8CAB6"/>
      </radialGradient>
      <linearGradient id="g-rim" x1="0" x2="1">
        <stop offset="0" stop-color="#A8957E"/><stop offset=".32" stop-color="#EFE6DA"/><stop offset=".55" stop-color="#D7C8B4"/><stop offset="1" stop-color="#9C8870"/>
      </linearGradient>
      <linearGradient id="g-gold" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#FFF4B8"/><stop offset=".45" stop-color="#E8C04A"/><stop offset="1" stop-color="#A57A10"/>
      </linearGradient>
      <radialGradient id="g-glow"><stop offset="0" stop-color="#FFE9A0" stop-opacity=".9"/><stop offset="1" stop-color="#FFB238" stop-opacity="0"/></radialGradient>
      <radialGradient id="g-plaque" cx=".38" cy=".32" r=".75"><stop offset="0" stop-color="#FFFDF7"/><stop offset=".65" stop-color="#F7EAD3"/><stop offset="1" stop-color="#E6D0AC"/></radialGradient>
      <filter id="f-blur" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="5"/></filter>
      <filter id="f-blur-s" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="1.6"/></filter>
      <filter id="f-tex" x="0" y="0" width="100%" height="100%">
        <feTurbulence type="fractalNoise" baseFrequency="0.011 0.17" numOctaves="2" seed="7" result="n"/>
        <feDiffuseLighting in="n" surfaceScale="2.6" lighting-color="#ffffff" result="l"><feDistantLight azimuth="225" elevation="48"/></feDiffuseLighting>
        <feComposite in="l" in2="SourceAlpha" operator="in"/>
      </filter>
    </defs>`;

    /* ceramic cake board + shadow on the table */
    const brx = dims[0][0] / 2 + 36, bry = brx * 2 * K;
    out += `<ellipse cx="${cx}" cy="${f1(y0 + bry + 12)}" rx="${f1(brx * 1.04)}" ry="${f1(bry * .42)}" fill="#000" opacity=".5" filter="url(#f-blur)"/>`;
    out += `<path d="M${cx - brx} ${y0}L${cx - brx} ${y0 + 9}A${brx} ${f1(bry)} 0 0 0 ${cx + brx} ${y0 + 9}L${cx + brx} ${y0}Z" fill="url(#g-rim)"/>`;
    out += `<ellipse cx="${cx}" cy="${y0}" rx="${brx}" ry="${f1(bry)}" fill="url(#g-board)"/>`;
    out += `<path d="M${cx - brx + 3} ${y0}A${brx - 3} ${f1(bry - 2)} 0 0 0 ${cx + brx - 3} ${y0}" fill="none" stroke="#fff" stroke-opacity=".8" stroke-width="1.4"/>`;

    let yB = y0, top = null;
    dims.forEach(([w, h], i) => {
      const rx = w / 2, ry = w * K, x0 = cx - rx, x1 = cx + rx, yT = yB - h;
      const front = (x, y) => y + ry * Math.sqrt(Math.max(0, 1 - ((x - cx) / rx) ** 2));
      const side = `M${x0} ${yT}L${x0} ${yB}A${rx} ${f1(ry)} 0 0 0 ${x1} ${yB}L${x1} ${yT}A${rx} ${f1(ry)} 0 0 1 ${x0} ${yT}Z`;
      let g = `<g class="tier${animateTiers ? ' drop' : ''}" style="animation-delay:${i * 120}ms">`;
      // contact / occlusion shadow where this tier sits
      g += `<ellipse cx="${cx}" cy="${f1(yB + 3)}" rx="${rx + 7}" ry="${f1(ry + 5)}" fill="#2A1009" opacity="${i ? .34 : .42}" filter="url(#f-blur)"/>`;
      // side: base colour, spatula texture, cylinder light, top/bottom falloff
      g += `<path d="${side}" fill="${frost}"/>`;
      g += `<path d="${side}" fill="#000" filter="url(#f-tex)" style="mix-blend-mode:soft-light" opacity=".6"/>`;
      g += `<path d="${side}" fill="url(#g-cyl)"/>`;
      g += `<path d="${side}" fill="url(#g-vert)"/>`;
      // top surface with soft light and a crisp frosting lip
      g += `<ellipse cx="${cx}" cy="${yT}" rx="${rx}" ry="${f1(ry)}" fill="url(#g-top)"/>`;
      g += `<path d="M${x0 + 1.5} ${yT}A${rx - 1.5} ${f1(ry - 1)} 0 0 0 ${x1 - 1.5} ${yT}" fill="none" stroke="#fff" stroke-opacity=".55" stroke-width="1.6"/>`;

      if (hasDrip) {
        const r = rng(i * 31 + 7);
        const edge = dc === '#FFFDF6' ? '#D9CBB8' : shade(dc, -.25);
        let d = `M${x0} ${yT}`;
        const drips = [];
        let next = x0 + 5 + r() * 8;
        for (let x = x0 + 2; x <= x1 - 2; x += 2) {
          if (x >= next && x < x1 - 9) {
            const hw = 3 + r() * 2.2, br = hw * 1.3, y = front(x, yT);
            const L = 6 + r() * h * .5 * (1 - (Math.abs(x - cx) / rx) * .35);
            d += `L${f1(x - hw)} ${f1(front(x - hw, yT))}L${f1(x - hw)} ${f1(y + L)}A${f1(br)} ${f1(br)} 0 1 0 ${f1(x + hw)} ${f1(y + L)}L${f1(x + hw)} ${f1(front(x + hw, yT))}`;
            drips.push({ x, hw, y, L, br });
            x += hw; next = x + 6 + r() * 12;
          } else d += `L${f1(x)} ${f1(front(x, yT))}`;
        }
        d += `L${x1} ${yT}A${rx} ${f1(ry)} 0 0 0 ${x0} ${yT}Z`;
        g += `<path d="${d}" fill="${dc}" stroke="${edge}" stroke-width=".8"/>`;
        g += `<path d="${d}" fill="url(#g-cyl)" opacity=".85"/>`;
        // glossy highlights: on the glaze pool and down each drip
        g += `<ellipse cx="${f1(cx - rx * .28)}" cy="${f1(yT - ry * .22)}" rx="${f1(rx * .36)}" ry="${f1(ry * .3)}" fill="url(#g-gloss)" opacity=".7"/>`;
        drips.forEach(({ x, hw, y, L, br }) => {
          g += `<path d="M${f1(x - hw * .35)} ${f1(y + 3)}L${f1(x - hw * .35)} ${f1(y + L)}" stroke="#fff" stroke-opacity=".5" stroke-width="1.1" stroke-linecap="round"/>`;
          g += `<circle cx="${f1(x - br * .38)}" cy="${f1(y + L + br * .3)}" r="${f1(br * .3)}" fill="#fff" opacity=".55"/>`;
        });
      } else {
        // shell border around the top edge when there is no drip
        const n = Math.round(w / 9), pts = [];
        for (let k = 0; k <= n; k++) { const x = x0 + (k * w) / n; pts.push([x, front(x, yT)]); }
        pts.sort((a, b) => a[1] - b[1]).forEach(([x, y]) => { g += `<circle cx="${f1(x)}" cy="${f1(y)}" r="3.6" fill="url(#g-ros)"/>`; });
      }

      // rosette piping round the base (edges first so the front ones overlap)
      const rr = 5.2 + w / 130, n = Math.round(w / (rr * 1.75)), pts = [];
      for (let k = 0; k <= n; k++) { const x = x0 + (k * w) / n; pts.push([x, front(x, yB)]); }
      pts.sort((a, b) => a[1] - b[1]).forEach(([x, y]) => {
        g += `<g transform="translate(${f1(x)} ${f1(y - 1)})"><circle r="${f1(rr)}" fill="url(#g-ros)"/>` +
             `<path d="M${f1(-rr * .55)} ${f1(rr * .1)}a${f1(rr * .55)} ${f1(rr * .55)} 0 1 1 ${f1(rr * .55)} ${f1(rr * .5)}a${f1(rr * .3)} ${f1(rr * .3)} 0 1 1 ${f1(-rr * .25)} ${f1(-rr * .6)}" fill="none" stroke="${shade(frost, -.3)}" stroke-width=".8" stroke-opacity=".55"/></g>`;
      });

      g += '</g>';
      out += g;
      top = { w, yT, ry };
      yB = yT; // next tier sits centred on this tier's top surface
    });

    /* ---------- toppers ---------- */
    const { w: tw, yT: ty, ry: tr } = top;
    const hasName = !!lab.name.trim(), hasSign = lab.occasion !== 'none';
    const lim = hasName && tw < 150 ? 3 : 9;
    // with a plaque standing at the back, keep toppers out to either side so the lettering stays readable
    const plaqueGap = hasSign && pick('occasion').kind === 'acrylic' && lab.topper !== 'star';
    const at = (f, dz) => {
      if (plaqueGap) f = f === 0 ? (dz > 0 ? -.3 : .33) : Math.sign(f) * (.3 + Math.abs(f) * .42);
      return [cx + f * tw, ty + (hasName ? dz * .35 - .14 : dz) * tr];
    };
    const sh = (rxs, rys) => `<ellipse cy="2" rx="${rxs}" ry="${rys}" fill="#000" opacity=".28" filter="url(#f-blur-s)"/>`;
    const feet = (y) => `M-13.5 ${y}${' q1.35 2.4 2.7 0'.repeat(10)}L13.5 ${y - 1.8}L-13.5 ${y - 1.8}Z`;
    const items = []; // [y, svg] — drawn back to front
    switch (lab.topper) {
      case 'berries':
        [[-.3, -.2, 1], [.28, -.3, .95], [0, -.55, .9], [-.12, .25, 1.05], [.16, .3, 1]].slice(0, lim).forEach(([f, dz, s]) => {
          const [x, y] = at(f, dz);
          items.push([y, `<g transform="translate(${f1(x)} ${f1(y - 10 * s)}) scale(${s})">${sh(10, 3).replace('cy="2"', 'cy="13"')}
            <path d="M0 14 C-13 6 -12 -8 0 -7 C12 -8 13 6 0 14Z" fill="#C8102E"/>
            <path d="M0 14 C-13 6 -12 -8 0 -7 C12 -8 13 6 0 14Z" fill="url(#g-cyl)" opacity=".75"/>
            <ellipse cx="-4.5" cy="-1" rx="3" ry="5" fill="#fff" opacity=".32"/>
            ${[[-5, 2], [0, 0], [5, 2], [-3, 7], [3, 7], [0, 11], [-7, -3], [7, -3], [-2, -4], [3, -4]].map(([a, b]) => `<ellipse cx="${a}" cy="${b}" rx=".8" ry="1.2" fill="#F6D46B"/>`).join('')}
            <path d="M0 -6 l-8 -2 l4.5 -1.5 l-3 -4.5 l5.5 2.5 l1 -4.5 l1 4.5 l5.5 -2.5 l-3 4.5 l4.5 1.5 Z" fill="#3E9B54" stroke="#2C7A3F" stroke-width=".6"/></g>`]);
        });
        [[.38, .05], [-.38, .1], [.05, .55]].slice(0, lim === 3 ? 1 : 3).forEach(([f, dz]) => {
          const [x, y] = at(f, dz);
          items.push([y, `<g transform="translate(${f1(x)} ${f1(y - 4)})">${sh(5, 1.6).replace('cy="2"', 'cy="5"')}<circle r="5" fill="#34407E"/><circle r="5" fill="url(#g-gloss)" opacity=".6"/><path d="M-1.5 -4.5 l1.5 1 l1.5 -1" stroke="#1F2650" stroke-width=".8" fill="none"/></g>`]);
        });
        break;
      case 'macarons': {
        const cols = ['#F7B9C4', '#BFE6D3', '#FFE49A', '#D9C6F0', '#C2DDF2'];
        [[-.3, -.15], [.3, -.2], [-.12, .3], [.14, .32], [0, -.45]].slice(0, lim).forEach(([f, dz], k) => {
          const [x, y] = at(f, dz), c = cols[k], rot = (k - 2) * 7;
          items.push([y, `<g transform="translate(${f1(x)} ${f1(y - 8)}) rotate(${rot})">${sh(15, 4).replace('cy="2"', 'cy="10"')}
            <path d="M-14 2 Q-14 9.5 0 9.5 Q14 9.5 14 2 Z" fill="${shade(c, -.14)}"/>
            <path d="${feet(2.6)}" fill="${shade(c, .08)}"/>
            <rect x="-12.6" y="-2.3" width="25.2" height="4.6" rx="2.3" fill="#FFF6E8"/>
            <path d="${feet(-2.4)}" fill="${shade(c, .08)}"/>
            <path d="M-14 -3 Q-14 -15.5 0 -15.5 Q14 -15.5 14 -3 Q0 -1 -14 -3Z" fill="${c}"/>
            <path d="M-14 -3 Q-14 -15.5 0 -15.5 Q14 -15.5 14 -3 Q0 -1 -14 -3Z" fill="url(#g-gloss)" opacity=".75"/></g>`]);
        });
        break;
      }
      case 'flowers':
        [[-.24, -.1, '#F27C95', 1], [.22, -.15, '#FFFFFF', .95], [0, -.5, '#F7B9C4', .85], [-.02, .32, '#FFD27A', 1.05]].slice(0, lim).forEach(([f, dz, c, s]) => {
          const [x, y] = at(f, dz);
          let petals = '';
          for (let a = 0; a < 6; a++) petals += `<ellipse cx="0" cy="-8.5" rx="6.2" ry="9.5" fill="${c}" stroke="${shade(c, -.2)}" stroke-width=".6" transform="rotate(${a * 60})"/>`;
          for (let a = 0; a < 5; a++) petals += `<ellipse cx="0" cy="-5" rx="4.4" ry="6.2" fill="${shade(c, -.06)}" stroke="${shade(c, -.22)}" stroke-width=".5" transform="rotate(${a * 72 + 36})"/>`;
          items.push([y, `<g transform="translate(${f1(x)} ${f1(y - 4)})">${sh(15, 5)}
            <ellipse cx="13" cy="2" rx="9" ry="3.2" fill="#5E9E5B" transform="rotate(-18 13 2)"/>
            <g transform="scale(${s} ${f1(s * .66)})">${petals}<circle r="4.6" fill="#E7A72B"/><circle r="4.6" fill="url(#g-gloss)" opacity=".6"/></g></g>`]);
        });
        break;
      case 'candles':
        [[-.26, -.05, '#F27C95'], [-.09, -.28, '#79B4E0'], [.09, -.26, '#F5C04E'], [.26, -.02, '#7CC6A8'], [0, .3, '#B79BE0']].slice(0, lim).forEach(([f, dz, c]) => {
          const [x, y] = at(f, dz), hgt = 34;
          let stripes = '';
          for (let k = 0; k < 4; k++) stripes += `<path d="M-3.5 ${-hgt + 7 + k * 8}l7 -4" stroke="#fff" stroke-width="1.8" stroke-opacity=".85"/>`;
          items.push([y, `<g transform="translate(${f1(x)} ${f1(y)})">${sh(6, 2)}
            <rect x="-3.5" y="${-hgt}" width="7" height="${hgt}" rx="1.6" fill="${c}"/>${stripes}
            <rect x="-3.5" y="${-hgt}" width="7" height="${hgt}" rx="1.6" fill="url(#g-cyl)"/>
            <path d="M0 ${-hgt}v-4" stroke="#3A2A1A" stroke-width="1.2"/>
            <circle cy="${-hgt - 13}" r="15" fill="url(#g-glow)"/>
            <g class="flame"><path d="M0 ${-hgt - 24}C7 ${-hgt - 13} 5.5 ${-hgt - 4} 0 ${-hgt - 3}C-5.5 ${-hgt - 4} -7 ${-hgt - 13} 0 ${-hgt - 24}Z" fill="#FFAA2B"/>
            <path d="M0 ${-hgt - 16}C3 ${-hgt - 10} 2.5 ${-hgt - 5} 0 ${-hgt - 4.5}C-2.5 ${-hgt - 5} -3 ${-hgt - 10} 0 ${-hgt - 16}Z" fill="#FFF6C8"/></g></g>`]);
        });
        break;
      case 'star': {
        const R = 26, r0 = 11, p = [];
        for (let k = 0; k < 10; k++) { const a = -Math.PI / 2 + (k * Math.PI) / 5, rr = k % 2 ? r0 : R; p.push([rr * Math.cos(a), rr * Math.sin(a)]); }
        let facets = '';
        for (let k = 0; k < 10; k++) { const [a, b] = p[k], [c, d] = p[(k + 1) % 10]; facets += `<path d="M0 0L${f1(a)} ${f1(b)}L${f1(c)} ${f1(d)}Z" fill="${k % 2 ? '#FFE98F' : '#C99A1E'}" opacity=".55"/>`; }
        const pts = p.map(([a, b]) => `${f1(a)} ${f1(b)}`).join(' ');
        items.push([ty, `<g transform="translate(${f1(cx + (hasSign ? tw * .28 : 0))} ${f1(ty - 36)})">
          <ellipse cy="38" rx="7" ry="2.4" fill="#000" opacity=".3" filter="url(#f-blur-s)"/>
          <rect x="-1.6" y="18" width="3.2" height="20" rx="1.2" fill="url(#g-gold)"/>
          <polygon points="${pts}" fill="url(#g-gold)" stroke="#9C7410" stroke-width="1.2" stroke-linejoin="round"/>${facets}
          <circle cx="-8" cy="-11" r="2.4" fill="#fff" opacity=".85"/></g>`]);
        break;
      }
      default: break;
    }
    const fitFont = (txt, maxW, max, k = .56) => Math.min(max, maxW / (txt.length * k));
    /* ---------- occasion topper: real gold topper photo pushed into the back of the top tier ---------- */
    if (hasSign) {
      const o = pick('occasion');
      const href = topperData[o.v] || o.img;
      const ox = lab.topper === 'star' ? -tw * .16 : 0;          // make room for the gold star
      const base = ty - tr * .42;                                 // where the sticks enter the cake
      const lift = lab.topper === 'candles' || lab.topper === 'star' ? 74 : 54;
      const pin = (x) => `<ellipse cx="${f1(x)}" cy="${f1(base + 1)}" rx="3.2" ry="1.3" fill="#000" opacity=".35" filter="url(#f-blur-s)"/>`;
      const stick = (x, y1) => `${pin(x)}<path d="M${f1(x)} ${f1(y1)}L${f1(x)} ${f1(base)}" stroke="#C99A1E" stroke-width="2.2" stroke-linecap="round"/><path d="M${f1(x - .5)} ${f1(y1 + 2)}L${f1(x - .5)} ${f1(base - 2)}" stroke="#FFF1B0" stroke-width=".7" opacity=".8"/>`;
      let svgT = '';
      if (o.kind === 'acrylic') {
        // the photo already includes its two sticks: stand it so the stick tips sink into the cake
        const H = Math.max(84, Math.min(tw > 200 ? 132 : 112, base + 18));
        const W = H * o.ar;
        svgT = `${pin(cx + ox - W * .13)}${pin(cx + ox + W * .05)}<image href="${href}" x="${f1(cx + ox - W / 2)}" y="${f1(base + 4 - H)}" width="${f1(W)}" height="${f1(H)}" preserveAspectRatio="xMidYMid meet"/>`;
      } else {
        const W = Math.min(tw * (o.kind === 'script' ? 1.2 : 1.05), o.kind === 'script' ? 210 : 180), H = W / o.ar;
        const by = ty - lift, x0 = cx + ox - W / 2;
        const sx = o.kind === 'bunting' ? [x0 + W * .015, x0 + W * .985] : [cx + ox - W * .26, cx + ox + W * .26];
        const sy = o.kind === 'bunting' ? by - H + H * .08 : by - H * .35;
        svgT = `${stick(sx[0], sy)}${stick(sx[1], sy)}<image href="${href}" x="${f1(x0)}" y="${f1(by - H)}" width="${f1(W)}" height="${f1(H)}" preserveAspectRatio="xMidYMid meet"/>`;
        if (o.kind === 'bunting') svgT += `<circle cx="${f1(sx[0])}" cy="${f1(sy)}" r="2" fill="#E9C24A"/><circle cx="${f1(sx[1])}" cy="${f1(sy)}" r="2" fill="#E9C24A"/>`;
      }
      items.push([base - 200, `<g>${svgT}</g>`]);
    }

    /* ---------- name piped in cream across the front of the top surface ---------- */
    if (hasName) {
      const nm = lab.name.trim();
      const topCol = hasDrip ? dc : frost;
      const n = parseInt(topCol.slice(1), 16);
      const lum = ((n >> 16) & 255) * .299 + ((n >> 8) & 255) * .587 + (n & 255) * .114;
      const ink = lum < 160 ? '#FFF4E2' : '#4A2318', edge = lum < 160 ? '#C9AE86' : '#2A1009';
      const fs = fitFont(nm, tw * .66, tw > 200 ? 34 : 28, .58);
      const ny = ty + tr * .44;
      const layer = (extra, attrs) => `<text y="${f1(fs * .3)}" ${attrs} ${extra}>${esc(nm)}</text>`;
      out += `<g transform="translate(${cx} ${f1(ny)}) scale(1 .62)" font-family="Pacifico, cursive" font-size="${f1(fs)}" text-anchor="middle">
        ${layer('transform="translate(.6 2.6)"', 'fill="#000" opacity=".3"')}
        ${layer('', `fill="${ink}" stroke="${edge}" stroke-width="1" paint-order="stroke"`)}
        ${layer('transform="translate(-.5 -.9)"', 'fill="#fff" opacity=".28"')}</g>`;
    }

    if (items.length) {
      out += `<g class="${animateTopper || animateTiers ? 'topper' : ''}">${items.sort((a, b) => a[0] - b[0]).map((x) => x[1]).join('')}</g>`;
    }
    svg.innerHTML = out;

    /* ---------- cross-section: crumb texture, filling, glaze ---------- */
    const s = sponge.c;
    $('#lab-slice').innerHTML = `
      <defs>
        <pattern id="p-crumb" width="9" height="7" patternUnits="userSpaceOnUse">
          <rect width="9" height="7" fill="${s}"/>
          <circle cx="2" cy="2" r="1" fill="${shade(s, -.25)}"/><circle cx="6.5" cy="4.5" r=".8" fill="${shade(s, -.2)}"/>
          <circle cx="5" cy="1.2" r=".6" fill="${shade(s, .3)}"/><circle cx="1.5" cy="5.5" r=".5" fill="${shade(s, .25)}"/>
        </pattern>
        <linearGradient id="g-slice" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".18"/><stop offset="1" stop-color="#000" stop-opacity=".2"/></linearGradient>
      </defs>
      <rect x="6" y="16" width="108" height="60" rx="5" fill="${frost}"/>
      <rect x="10" y="22" width="100" height="13" rx="1.5" fill="url(#p-crumb)"/>
      <rect x="10" y="39" width="100" height="13" rx="1.5" fill="url(#p-crumb)"/>
      <rect x="10" y="56" width="100" height="15" rx="1.5" fill="url(#p-crumb)"/>
      ${hasDrip ? `<path d="M6 16 H114 V25 Q110 33 106 25 Q98 21 90 30 Q85 37 80 26 Q62 20 48 31 Q42 38 38 26 Q26 20 18 30 Q12 36 6 26Z" fill="${dc}"/><path d="M14 19 H60" stroke="#fff" stroke-opacity=".5" stroke-width="1.2" stroke-linecap="round"/>` : ''}
      <rect x="6" y="16" width="108" height="60" rx="5" fill="url(#g-slice)"/>`;

    const pr = $('#lab-price');
    pr.textContent = fmt(labPrice());
    pr.classList.remove('bump'); void pr.offsetWidth; pr.classList.add('bump');
  }
  function labSpec() {
    const t = LAB.tiers[lab.tiers];
    return `${lab.tiers} tier · ${t.kg} kg · ${pick('sponge').name} sponge · ${pick('frost').name} frosting · ${lab.drip === 'none' ? 'no drip' : pick('drip').name + ' drip'}${lab.topper !== 'none' ? ' · ' + pick('topper').name.replace(/^\S+\s/, '') + ' topper' : ''}${lab.occasion !== 'none' ? ` · “${pick('occasion').text}” gold cake topper` : ''}`;
  }
  function labSnapshot() {
    const svg = $('#lab-svg').cloneNode(true);
    svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    svg.setAttribute('viewBox', '0 -30 340 390');
    $$('.drop, .topper', svg).forEach((n) => n.removeAttribute('class'));
    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(new XMLSerializer().serializeToString(svg));
  }
  $('#lab-add').addEventListener('click', (e) => {
    const t = LAB.tiers[lab.tiers];
    addToCart({
      key: 'lab-' + Date.now(), type: 'custom', name: 'Cake Lab Creation',
      size: `${lab.tiers} tier · ${t.kg} kg`, spec: labSpec(), msg: lab.name.trim(),
      price: labPrice(), qty: 1, img: labSnapshot(),
    }, e.currentTarget);
  });
  $('#lab-wa').addEventListener('click', () => {
    openWA(`🧪 *Cake Lab design — Tastylicious Cakes*\n\n${labSpec()}${lab.name.trim() ? `\n✍️ Name piped on top: “${lab.name.trim()}”` : ''}\n💰 Estimated price: ${fmt(labPrice())}\n\nHi! I'd love this cake. Please confirm availability & delivery date. 🎂`);
  });
  syncLabButtons();
  drawCake(false, false);

  /* =========================================================
     FORMS → WhatsApp
     ========================================================= */
  $('#custom-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const f = e.currentTarget;
    if (!f.reportValidity()) return;
    const d = Object.fromEntries(new FormData(f));
    const when = new Date(d.date + 'T00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    openWA(`✏️ *Custom cake enquiry — Tastylicious Cakes*\n\n👤 ${d.name}\n📞 ${d.phone}\n🎉 Occasion: ${d.occasion}\n📅 Event date: ${when}\n👥 Guests: ${d.guests}\n\n💭 ${d.desc || '(no description yet)'}\n\nI'll share inspiration pictures here. Please send me a quote! 🙏`);
    toast('Opening WhatsApp with your cake dream… 🎂');
  });
  $('#contact-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const f = e.currentTarget;
    if (!f.reportValidity()) return;
    const d = Object.fromEntries(new FormData(f));
    openWA(`💌 *Message for Tastylicious Cakes*\n\n👤 ${d.name}\n🏷️ ${d.subject}\n\n${d.msg}`);
    toast('Opening WhatsApp… 💬');
  });

  /* ---------- #BakeTheWorldBetter gift cupcake ---------- */
  let gifted = 48215;
  $('#gift-add').addEventListener('click', (e) => {
    addToCart({ key: 'gift', type: 'gift', slug: 'promo-outlet', name: 'Gift a Cupcake 💛', size: 'for a child at our partner shelter', price: 60, qty: 1 }, e.currentTarget);
    gifted += 1; $('#gift-count').textContent = gifted.toLocaleString('en-IN');
  });

  /* =========================================================
     LOCATIONS
     ========================================================= */
  const mapsUrl = (q) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;
  const outletUl = $('#outlets');
  outletUl.innerHTML = OUTLETS.map((o, i) => `
    <li class="outlet ${i === 0 ? 'is-on' : ''}" data-o="${i}" tabindex="0" aria-label="Show ${esc(o.name)} on map">
      <span class="star" aria-hidden="true">${o.star}</span>
      <h4>${esc(o.name)}</h4>
      <p>📍 ${esc(o.addr)}</p>
      <p>📞 <a href="tel:${SHOP.tel}">${SHOP.phone}</a> · 🕘 ${esc(o.hours)}</p>
      <div class="o-acts">
        <a class="o-btn" href="${mapsUrl(o.q)}" target="_blank" rel="noopener">Directions</a>
        <a class="o-btn dark" href="${waLink(`Hi! I'd like to order ahead for pickup at ${o.name} 🎂`)}" target="_blank" rel="noopener">Order Ahead</a>
      </div>
    </li>`).join('');
  function pickOutlet(li) {
    $$('.outlet').forEach((x) => x.classList.toggle('is-on', x === li));
    const o = OUTLETS[+li.dataset.o];
    $('#map').src = `https://maps.google.com/maps?q=${encodeURIComponent(o.q)}&z=15&output=embed`;
  }
  outletUl.addEventListener('click', (e) => { const li = e.target.closest('.outlet'); if (li && !e.target.closest('a')) pickOutlet(li); });
  outletUl.addEventListener('keydown', (e) => { if ((e.key === 'Enter' || e.key === ' ') && e.target.classList.contains('outlet')) { e.preventDefault(); pickOutlet(e.target); } });

  /* =========================================================
     SCROLL EFFECTS
     ========================================================= */
  const io = new IntersectionObserver((entries) => entries.forEach((en) => {
    if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
  }), { threshold: .12, rootMargin: '0px 0px -40px 0px' });
  $$('.reveal').forEach((el) => io.observe(el));

  const tl = $('#timeline'), tlLine = $('#tl-line');
  try { tl.style.setProperty('--len', tlLine.getTotalLength()); } catch { /* ignore */ }
  let rafS;
  const onScroll = () => {
    cancelAnimationFrame(rafS);
    rafS = requestAnimationFrame(() => {
      const r = tl.getBoundingClientRect();
      const p = Math.min(1, Math.max(0, (innerHeight * .85 - r.top) / (r.height + innerHeight * .3)));
      tl.style.setProperty('--p', p.toFixed(3));
    });
  };
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // gift counter count-up
  const gc = $('#gift-count');
  new IntersectionObserver((en, obs) => {
    if (!en[0].isIntersecting) return; obs.disconnect();
    if (reduceMotion) return;
    const start = performance.now(), from = gifted - 900;
    const step = (t) => { const k = Math.min(1, (t - start) / 1400); gc.textContent = Math.round(from + (gifted - from) * (1 - (1 - k) ** 3)).toLocaleString('en-IN'); if (k < 1) requestAnimationFrame(step); };
    requestAnimationFrame(step);
  }).observe(gc);

  /* =========================================================
     init
     ========================================================= */
  $('#year').textContent = new Date().getFullYear();

  renderMenu();
  hydrate();
  renderCart();
  updateBadge(false);
})();
