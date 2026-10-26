/* Página de projeto TIPO 2 (simulação do Instagram).
   Você NÃO precisa mexer neste arquivo para trocar fotos, textos ou posts: tudo isso fica no HTML
   da página do projeto (veja projetos/_modelo-instagram.html). Aqui só está o comportamento
   (abrir post, carrossel, stories). */
(function () {
  const root = document.getElementById('ig');
  if (!root) return;
  const q = (s, c) => (c || root).querySelector(s);
  const qa = (s, c) => [...(c || root).querySelectorAll(s)];

  /* ---------- dados lidos do HTML ---------- */
  const handleEl = q('.ig-handle');
  const handle = handleEl ? handleEl.textContent.trim() : '';
  const user = handle.replace(/^@/, '');
  const avImg = q('.ig-avb img');
  const avSrc = avImg ? avImg.getAttribute('src') : '';
  const stories = qa('.ig-stories img').map(i => i.src);
  const posts = qa('.ig-post').map(el => {
    const imgs = qa('img', el).map(i => ({ src: i.src, alt: i.alt || '' }));
    return {
      el, imgs,
      title: el.dataset.title || '',
      format: el.dataset.format || '1080 × 1350 · 4:5',
      note: el.dataset.note || '',
      kind: imgs.length > 1 ? 'Carrossel · ' + imgs.length + ' slides' : 'Post estático'
    };
  });

  /* ---------- perfil: foto (ou iniciais) e stories ---------- */
  const avb = q('.ig-avb');
  const initials = (user.replace(/[^a-z0-9]/gi, '').slice(0, 2) || 'ig').toUpperCase();
  function avatarFallback() {
    const holder = avImg && avImg.parentNode;
    if (avImg) avImg.remove();
    if (holder && !q('.ig-av', holder)) holder.insertAdjacentHTML('beforeend', '<span class="ig-av">' + initials + '</span>');
  }
  if (avb) {
    if (!avImg || !avSrc) avatarFallback(); else avImg.addEventListener('error', avatarFallback);
    avb.setAttribute('aria-label', 'Ver stories de ' + handle);
    avb.dataset.cur = 'Stories';
    if (!stories.length) {
      avb.disabled = true; avb.classList.add('no-story'); avb.removeAttribute('data-cur');
      const ann = q('.ig-ann'); if (ann) ann.style.display = 'none';
    }
  }
  /* se não existir nenhum carrossel, a nota sobre carrossel some */
  const noteEl = q('.ig-note');
  if (noteEl && !posts.some(p => p.imgs.length > 1)) noteEl.style.display = 'none';

  /* ---------- grid do feed ---------- */
  const ico = '<svg class="ig-multi" viewBox="0 0 24 24" aria-hidden="true"><path d="M8 2h11a3 3 0 0 1 3 3v11a1 1 0 1 1-2 0V5a1 1 0 0 0-1-1H8a1 1 0 1 1 0-2zM4 6h11a3 3 0 0 1 3 3v11a3 3 0 0 1-3 3H4a3 3 0 0 1-3-3V9a3 3 0 0 1 3-3z"/></svg>';
  posts.forEach((p, i) => {
    const el = p.el;
    el.setAttribute('role', 'button'); el.tabIndex = 0;
    el.setAttribute('aria-label', 'Abrir post: ' + (p.title || (i + 1)));
    el.dataset.cur = 'Abrir';
    const first = q('img', el); if (first) first.loading = 'lazy';
    el.insertAdjacentHTML('beforeend', (p.imgs.length > 1 ? ico : ''));
    el.addEventListener('click', () => openPost(i));
    el.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openPost(i); } });
  });

  /* ---------- estrutura dos overlays (criada por aqui) ---------- */
  const html = document.documentElement;
  const wrap = document.createElement('div');
  wrap.innerHTML =
    '<div class="ig-ov" id="ig-ov" hidden role="dialog" aria-modal="true" aria-label="Post">' +
      '<button class="ig-pn ig-fx p" id="ig-pprev" type="button" aria-label="Post anterior">‹</button>' +
      '<button class="ig-pn ig-fx n" id="ig-pnext" type="button" aria-label="Próximo post">›</button>' +
      '<div class="ig-box" id="ig-box">' +
        '<button class="ig-x ig-fx mono" id="ig-close" type="button">Fechar ✕</button>' +
        '<div class="ig-media" id="ig-media"><div class="ig-track" id="ig-track"></div>' +
          '<button class="ig-nav ig-fx p" id="ig-prev" type="button" aria-label="Slide anterior">‹</button>' +
          '<button class="ig-nav ig-fx n" id="ig-next" type="button" aria-label="Próximo slide">›</button>' +
          '<div class="ig-dots" id="ig-dots"></div></div>' +
        '<aside class="ig-info"><p class="mono ig-kind" id="ig-kind"></p><h3 id="ig-ttl"></h3>' +
          '<dl><div id="ig-fmtw"><dt class="mono">Formato</dt><dd id="ig-fmt"></dd></div>' +
          '<div id="ig-notew"><dt class="mono">Conceito</dt><dd id="ig-note"></dd></div></dl>' +
          '<p class="mono ig-cnt" id="ig-cnt"></p></aside>' +
      '</div></div>' +
    '<div class="ig-sv" id="ig-sv" hidden role="dialog" aria-modal="true" aria-label="Stories">' +
      '<div class="ig-fr" id="ig-fr">' +
        '<div class="ig-top"><div class="ig-pg" id="ig-pg"></div>' +
          '<button class="ig-sb ig-fx" id="ig-sp" type="button"></button>' +
          '<button class="ig-sb ig-fx" id="ig-sx" type="button" aria-label="Fechar"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg></button></div>' +
        '<div class="ig-sh"><span class="ig-sav" id="ig-sav"></span><span>' + user + '</span></div>' +
        '<button class="ig-sn ig-fx p" id="ig-sprev" type="button" aria-label="Story anterior">‹</button>' +
        '<button class="ig-sn ig-fx n" id="ig-snext" type="button" aria-label="Próximo story">›</button>' +
        '<img id="ig-simg" alt="">' +
      '</div></div>';
  while (wrap.firstChild) document.body.appendChild(wrap.firstChild);
  const $ = id => document.getElementById(id);
  $('ig-sav').innerHTML = avSrc && avImg ? '<img alt="" src="' + avImg.src + '">' : initials;

  /* ---------- post aberto ---------- */
  let cur = 0, sl = 0, openCard = null, lastFocus = null;
  const ov = $('ig-ov'), box = $('ig-box'), media = $('ig-media'), track = $('ig-track');

  function drawSlide() {
    const p = posts[cur], n = p.imgs.length;
    $('ig-pprev').hidden = cur === 0; $('ig-pnext').hidden = cur === posts.length - 1;
    track.style.transform = 'translateX(' + (-sl * 100) + '%)';
    $('ig-prev').hidden = $('ig-next').hidden = n < 2;
    $('ig-prev').style.opacity = sl ? 1 : .35; $('ig-next').style.opacity = sl < n - 1 ? 1 : .35;
    [...$('ig-dots').children].forEach((d, i) => d.classList.toggle('on', i === sl));
    $('ig-cnt').textContent = n > 1 ? 'Slide ' + (sl + 1) + ' / ' + n : '';
  }
  function fill(p) {
    track.innerHTML = p.imgs.map(s => '<img alt="' + s.alt.replace(/"/g, '&quot;') + '" src="' + s.src + '" draggable="false">').join('');
    $('ig-dots').innerHTML = p.imgs.length > 1 ? p.imgs.map(() => '<i></i>').join('') : '';
    $('ig-kind').textContent = p.kind; $('ig-ttl').textContent = p.title;
    $('ig-fmt').textContent = p.format; $('ig-note').textContent = p.note;
    $('ig-fmtw').hidden = !p.format; $('ig-notew').hidden = !p.note;
  }
  function flip(card) {
    const m = media.getBoundingClientRect(), b = box.getBoundingClientRect(), f = card.getBoundingClientRect();
    box.style.transformOrigin = (m.left - b.left) + 'px ' + (m.top - b.top) + 'px';
    return 'translate(' + (f.left - m.left) + 'px,' + (f.top - m.top) + 'px) scale(' + (f.width / m.width) + ')';
  }
  function openPost(i) {
    cur = i; sl = 0; openCard = posts[i].el; lastFocus = openCard;
    fill(posts[i]);
    ov.hidden = false; ov.classList.remove('show'); html.classList.add('ig-lock');
    box.style.transition = 'none'; box.style.transform = 'none'; drawSlide();
    box.style.transform = flip(openCard); box.getBoundingClientRect();
    openCard.style.visibility = 'hidden';
    box.style.transition = 'transform .5s cubic-bezier(.2,.8,.2,1)'; box.style.transform = 'none';
    ov.classList.add('show');
    history.replaceState(null, '', '#post-' + (i + 1));
    $('ig-close').focus({ preventScroll: true });
  }
  function closePost() {
    if (ov.hidden) return;
    ov.classList.remove('show');
    box.style.transform = flip(openCard);
    setTimeout(() => { ov.hidden = true; html.classList.remove('ig-lock'); openCard.style.visibility = ''; openCard.focus({ preventScroll: true }); }, 480);
    history.replaceState(null, '', location.pathname + location.search);
  }
  function swap(d) {
    const n = cur + d; if (n < 0 || n >= posts.length) return;
    openCard.style.visibility = ''; cur = n; sl = 0; openCard = posts[n].el; openCard.style.visibility = 'hidden';
    track.style.transition = 'none'; fill(posts[n]); drawSlide(); track.getBoundingClientRect(); track.style.transition = '';
    box.animate([{ opacity: .5 }, { opacity: 1 }], { duration: 250 });
    history.replaceState(null, '', '#post-' + (n + 1));
  }
  function go(d) { const n = posts[cur].imgs.length; sl = Math.max(0, Math.min(n - 1, sl + d)); drawSlide(); }
  function key(d) { const t = sl + d; t >= 0 && t < posts[cur].imgs.length ? go(d) : swap(d); }
  $('ig-prev').onclick = () => go(-1); $('ig-next').onclick = () => go(1);
  $('ig-close').onclick = closePost; $('ig-pprev').onclick = () => swap(-1); $('ig-pnext').onclick = () => swap(1);
  ov.addEventListener('click', e => { if (e.target === ov) closePost(); });
  let sx = null;
  media.addEventListener('pointerdown', e => { sx = e.clientX; });
  media.addEventListener('pointerup', e => { if (sx !== null && Math.abs(e.clientX - sx) > 40) go(e.clientX < sx ? 1 : -1); sx = null; });

  /* ---------- stories ---------- */
  const sv = $('ig-sv'), fr = $('ig-fr');
  let si = 0, el = 0, last = 0, raf = 0, paused = false, man = false, held = false, ht = 0;
  const DUR = 5000;
  function setPI() {
    $('ig-sp').innerHTML = man
      ? '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M7 5v14l12-7z"/></svg>'
      : '<svg viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/></svg>';
    $('ig-sp').setAttribute('aria-label', man ? 'Retomar' : 'Pausar');
  }
  function showStory(i) {
    si = i; el = 0; last = performance.now(); man = false; setPI();
    $('ig-sprev').hidden = i === 0; $('ig-snext').hidden = i === stories.length - 1;
    $('ig-simg').src = stories[i];
    [...$('ig-pg').children].forEach((d, k) => d.firstChild.style.width = k < i ? '100%' : '0');
    cancelAnimationFrame(raf); raf = requestAnimationFrame(tick);
  }
  function tick(t) {
    if (!paused && !man) el += t - last; last = t;
    $('ig-pg').children[si].firstChild.style.width = Math.min(el / DUR, 1) * 100 + '%';
    if (el >= DUR) return sNext();
    raf = requestAnimationFrame(tick);
  }
  function sNext() { si + 1 >= stories.length ? closeStories() : showStory(si + 1); }
  function sPrev() { showStory(Math.max(0, si - 1)); }
  function openStories() {
    if (!stories.length) return;
    $('ig-pg').innerHTML = stories.map(() => '<div><b></b></div>').join('');
    sv.hidden = false; sv.classList.remove('show'); sv.getBoundingClientRect(); sv.classList.add('show');
    html.classList.add('ig-lock'); showStory(0); history.replaceState(null, '', '#stories-open');
  }
  function closeStories() {
    if (sv.hidden) return;
    cancelAnimationFrame(raf); sv.classList.remove('show');
    setTimeout(() => { sv.hidden = true; if (ov.hidden) html.classList.remove('ig-lock'); }, 300);
    history.replaceState(null, '', location.pathname + location.search);
    if (avb) avb.focus({ preventScroll: true });
  }
  if (avb) avb.onclick = openStories;
  $('ig-sx').onclick = closeStories;
  $('ig-sp').onclick = () => { man = !man; setPI(); };
  $('ig-sprev').onclick = sPrev; $('ig-snext').onclick = sNext;
  sv.addEventListener('click', e => { if (e.target === sv) closeStories(); });
  fr.addEventListener('pointerdown', e => { if (e.target.closest('button')) return; held = false; ht = setTimeout(() => { held = true; paused = true; }, 220); });
  fr.addEventListener('pointerup', e => {
    if (e.target.closest('button')) return; clearTimeout(ht);
    if (held) { paused = false; held = false; return; }
    const r = fr.getBoundingClientRect(); (e.clientX - r.left) < r.width * .3 ? sPrev() : sNext();
  });
  fr.addEventListener('pointerleave', () => { clearTimeout(ht); if (held) { paused = false; held = false; } });

  /* ---------- teclado e link direto (#post-2, #stories-open) ---------- */
  document.addEventListener('keydown', e => {
    if (!sv.hidden) { if (e.key === 'Escape') closeStories(); if (e.key === 'ArrowRight') sNext(); if (e.key === 'ArrowLeft') sPrev(); return; }
    if (!ov.hidden) { if (e.key === 'Escape') closePost(); if (e.key === 'ArrowRight') key(1); if (e.key === 'ArrowLeft') key(-1); }
  });
  const h = location.hash;
  if (h === '#stories-open') openStories();
  else if (/^#post-\d+$/.test(h)) { const i = +h.slice(6) - 1; if (posts[i]) openPost(i); }
})();
