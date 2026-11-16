(function () {
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var body = document.body;

  /* ---------- Torn-paper edges on separators ---------- */
  function tornPolygon(seed) {
    var pts = ['0% 0%', '100% 0%'], x = 100, s = seed;
    function rnd() { s = (s * 9301 + 49297) % 233280; return s / 233280; }
    while (x > 0) {
      x = Math.max(0, x - (1.2 + rnd() * 2.6));
      pts.push(x.toFixed(2) + '% ' + (25 + rnd() * 75).toFixed(1) + '%');
    }
    return 'polygon(' + pts.join(',') + ')';
  }
  document.querySelectorAll('.sep-edge').forEach(function (el, i) {
    el.style.clipPath = tornPolygon(17 + i * 31);
  });

  /* ---------- Split closing title into letters ---------- */
  var ct = document.querySelector('.closing-title');
  if (ct) {
    var text = ct.getAttribute('aria-label');
    var html = '';
    text.split(' ').forEach(function (word, wi, arr) {
      html += '<span style="display:inline-block;white-space:nowrap" aria-hidden="true">';
      word.split('').forEach(function (c) {
        html += '<span class="ch">' + c + '</span>';
      });
      html += '</span>' + (wi < arr.length - 1 ? ' ' : '');
    });
    ct.innerHTML = html;
    ct.querySelectorAll('.ch').forEach(function (c, i) { c.style.transitionDelay = (i * 0.035) + 's'; });
  }

  document.querySelectorAll('.campaign .campaign-head, .campaign .campaign-info, .campaign .vcard, .campaign .campaign-note').forEach(function (el) {
    el.classList.add('reveal-item');
  });

  /* ---------- Intro ---------- */
  var intro = document.getElementById('intro');
  var bar = intro && intro.querySelector('.intro-bar i');
  var heroImg = document.querySelector('.hero img');
  var start = performance.now();
  var progress = 0;
  var tick = setInterval(function () {
    progress = Math.min(progress + 6 + Math.random() * 10, 92);
    if (bar) bar.style.width = progress + '%';
  }, 120);

  function finishIntro() {
    if (body.classList.contains('ready')) return;
    clearInterval(tick);
    if (bar) bar.style.width = '100%';
    var wait = Math.max(0, 1700 - (performance.now() - start));
    setTimeout(function () {
      intro.classList.add('done');
      body.classList.add('ready');
      body.classList.remove('is-loading');
      setTimeout(function () { intro.remove(); }, 1400);
    }, reduce ? 0 : wait);
  }
  if (reduce) { finishIntro(); }
  else if (heroImg && !heroImg.complete) {
    heroImg.addEventListener('load', finishIntro);
    heroImg.addEventListener('error', finishIntro);
    setTimeout(finishIntro, 4500);
  } else { finishIntro(); }

  /* ---------- Scroll reveals ---------- */
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
  document.querySelectorAll('.reveal, .closing, #outro').forEach(function (el) { io.observe(el); });

  /* ---------- Autoplay videos only while visible ---------- */
  var vio = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      var v = e.target;
      if (e.isIntersecting) {
        if (v.dataset.userPaused) return;
        var p = v.play();
        if (p && p.then) p.then(function () { v.classList.add('playing'); }).catch(function () {});
      } else if (!v.paused) { v.pause(); }
    });
  }, { threshold: 0.35 });
  document.querySelectorAll('video').forEach(function (v) {
    vio.observe(v);
    v.addEventListener('pause', function () { if (document.visibilityState === 'visible' && v.getBoundingClientRect().top < innerHeight && v.getBoundingClientRect().bottom > 0) v.dataset.userPaused = '1'; });
    v.addEventListener('play', function () { delete v.dataset.userPaused; });
  });

  /* ---------- Floating nav ---------- */
  var nav = document.getElementById('topnav');
  var hero = document.getElementById('home');
  new IntersectionObserver(function (entries) {
    nav.classList.toggle('show', !entries[0].isIntersecting);
  }, { threshold: 0.08 }).observe(hero);

  var links = { about: nav.querySelector('[href="#about"]'), projects: nav.querySelector('[href="#projects"]'), contact: nav.querySelector('[href="#contact"]') };
  var marks = [['about', document.getElementById('about')], ['projects', document.getElementById('projects')], ['contact', document.getElementById('contact')]];
  window.addEventListener('scroll', function () {
    var y = innerHeight * 0.35, cur = null;
    marks.forEach(function (m) { if (m[1].getBoundingClientRect().top < y) cur = m[0]; });
    Object.keys(links).forEach(function (k) { links[k].classList.toggle('active', k === cur); });
  }, { passive: true });
})();

/* =====================================================================
   MOTION LAYER v2 — animation only
   ===================================================================== */
(function () {
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Scroll progress + "scrolled" flag ---------- */
  var bar = document.querySelector('#progress i');
  function onScroll() {
    var max = document.documentElement.scrollHeight - innerHeight;
    if (bar) bar.style.transform = 'scaleX(' + (max > 0 ? scrollY / max : 0) + ')';
    document.body.classList.toggle('scrolled', scrollY > 40);
  }
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Separator titles: split into letters ---------- */
  document.querySelectorAll('.sep-title .cursor-host').forEach(function (host) {
    var cursor = host.querySelector('.cursor');
    var text = host.textContent;
    host.parentNode.setAttribute('aria-label', text.trim());
    host.textContent = '';
    text.split('').forEach(function (c, i) {
      var s = document.createElement('span');
      s.className = 'ltr';
      s.setAttribute('aria-hidden', 'true');
      s.style.setProperty('--i', i);
      s.textContent = c === ' ' ? ' ' : c;
      host.appendChild(s);
    });
    if (cursor) host.appendChild(cursor);
  });

  /* ---------- Per-piece tiles on Canva pages ---------- */
  var tilePages = [];
  document.querySelectorAll('.page[data-tiles]').forEach(function (page) {
    var img = page.querySelector('img');
    var specs = page.getAttribute('data-tiles').split(';').map(function (s) {
      var p = s.split(','); return { L: +p[0], T: +p[1], W: +p[2], H: +p[3], a: p[4] };
    });
    var rot = [-5, 4, -3, 6, -4, 3];
    var tiles = specs.map(function (sp, i) {
      var t = document.createElement('div');
      t.className = 'tile' + (sp.a === 'wipe' ? '' : ' lift');
      t.setAttribute('data-a', sp.a);
      t.setAttribute('aria-hidden', 'true');
      t.style.cssText = 'left:' + sp.L + '%;top:' + sp.T + '%;width:' + sp.W + '%;height:' + sp.H + '%';
      t.style.setProperty('--td', (sp.a === 'wipe' ? 0.55 : (i % 3) * 0.16) + 's');
      t.style.setProperty('--r', rot[i % rot.length] + 'deg');
      var im = document.createElement('img');
      im.src = img.getAttribute('src');
      im.alt = '';
      im.style.cssText = 'width:' + (10000 / sp.W) + '%;left:' + (-100 * sp.L / sp.W) + '%;top:' + (-100 * sp.T / sp.H) + '%';
      t.appendChild(im);
      t._spec = sp; t._src = img.getAttribute('src');
      page.appendChild(t);
      return t;
    });
    tilePages.push({ page: page, img: img, tiles: tiles });
  });

  function applyMasks() {
    tilePages.forEach(function (tp) {
      if (reduce) return;
      var w = tp.page.clientWidth, h = tp.page.clientHeight;
      if (!w || !h) return;
      var imgs = ['linear-gradient(#000 0 0)'], sizes = [w + 'px ' + h + 'px'], pos = ['0 0'];
      tp.tiles.forEach(function (t) {
        var s = t._spec;
        var x = s.L / 100 * w, y = s.T / 100 * h, tw = s.W / 100 * w, th = s.H / 100 * h;
        imgs.push('linear-gradient(#000 0 0)');
        sizes.push(Math.max(0, tw - 2).toFixed(1) + 'px ' + Math.max(0, th - 2).toFixed(1) + 'px');
        pos.push((x + 1).toFixed(1) + 'px ' + (y + 1).toFixed(1) + 'px');
      });
      var st = tp.img.style;
      st.webkitMaskImage = st.maskImage = imgs.join(',');
      st.webkitMaskSize = st.maskSize = sizes.join(',');
      st.webkitMaskPosition = st.maskPosition = pos.join(',');
      st.webkitMaskRepeat = st.maskRepeat = 'no-repeat';
      st.webkitMaskComposite = 'xor';
      st.maskComposite = 'exclude';
    });
  }
  applyMasks();
  var rz; addEventListener('resize', function () { clearTimeout(rz); rz = setTimeout(applyMasks, 120); });

  /* Trigger by the slot geometry (untransformed), not the animated box */
  var pending = [];
  tilePages.forEach(function (tp) { tp.tiles.forEach(function (t) { if (reduce) t.classList.add('in', 'done'); else pending.push(t); }); });
  function fire(t) {
    t.classList.add('in');
    var d = parseFloat(t.style.getPropertyValue('--td')) || 0;
    setTimeout(function () { t.classList.add('done'); }, (d + 1.6) * 1000);
  }
  var ticking = false;
  function checkTiles() {
    ticking = false;
    if (!pending.length) return;
    pending = pending.filter(function (t) {
      if (!t.parentNode.classList.contains('in')) return true;
      var pr = t.parentNode.getBoundingClientRect(), s = t._spec;
      var top = pr.top + pr.height * s.T / 100, h = pr.height * s.H / 100;
      var visible = Math.min(innerHeight, top + h) - Math.max(0, top);
      if (visible > Math.min(h, innerHeight) * 0.3) { fire(t); return false; }
      return true;
    });
  }
  addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(checkTiles); } }, { passive: true });
  addEventListener('resize', checkTiles);
  setInterval(checkTiles, 700);
  checkTiles();

  /* ---------- Lightbox for slides ---------- */
  var lb = document.createElement('div');
  lb.id = 'lightbox';
  lb.setAttribute('role', 'dialog');
  lb.setAttribute('aria-label', 'Enlarged slide');
  lb.innerHTML = '<div class="lb-frame"><img alt=""></div>';
  document.body.appendChild(lb);
  var frame = lb.firstChild, fimg = frame.firstChild;
  function openLB(t) {
    var s = t._spec, page = t.parentNode;
    var pw = page.clientWidth, ph = page.clientHeight;
    var ar = (s.W * pw) / (s.H * ph);
    var maxW = innerWidth * 0.92, maxH = innerHeight * 0.88;
    var fw = Math.min(maxW, maxH * ar), fh = fw / ar;
    frame.style.width = fw + 'px'; frame.style.height = fh + 'px';
    fimg.src = t._src;
    fimg.style.cssText = 'width:' + (10000 / s.W) + '%;left:' + (-100 * s.L / s.W) + '%;top:' + (-100 * s.T / s.H) + '%';
    lb.classList.add('open');
  }
  function closeLB() { lb.classList.remove('open'); }
  document.addEventListener('click', function (e) {
    var t = e.target.closest && e.target.closest('.tile.lift.done');
    if (t) { openLB(t); return; }
    if (lb.classList.contains('open')) closeLB();
  });
  addEventListener('keydown', function (e) { if (e.key === 'Escape') closeLB(); });

  /* ---------- Lancet closing note ---------- */
  var note = document.querySelector('.campaign-note');
  if (note) new IntersectionObserver(function (en, o) {
    if (en[0].isIntersecting) { note.classList.add('in'); o.disconnect(); }
  }, { threshold: 0.6 }).observe(note);
})();
