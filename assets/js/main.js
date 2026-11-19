(() => {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const root = document.documentElement;
  const body = document.body;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* ---------- Loader ---------- */
  body.classList.add('is-loading');
  const ready = () => {
    body.classList.remove('is-loading');
    requestAnimationFrame(() => body.classList.add('is-ready'));
  };
  if (document.readyState === 'complete') setTimeout(ready, 350);
  else addEventListener('load', () => setTimeout(ready, 350));
  setTimeout(ready, 2500); // never trap the page behind the loader

  $('#year').textContent = new Date().getFullYear();

  /* ---------- Theme ---------- */
  const isDark = () => root.dataset.theme ? root.dataset.theme === 'dark' : !matchMedia('(prefers-color-scheme: light)').matches;
  $('.theme-toggle').addEventListener('click', () => {
    const next = isDark() ? 'light' : 'dark';
    root.dataset.theme = next;
    try { localStorage.setItem('theme', next); } catch (e) {}
  });

  /* ---------- Nav: scrolled state, hide on scroll down, active link ---------- */
  const nav = $('.nav');
  const links = $('#nav-links');
  const burger = $('.burger');
  const progress = $('.progress');
  let lastY = scrollY;

  const closeMenu = () => {
    links.classList.remove('is-open');
    nav.classList.remove('menu-open');
    burger.setAttribute('aria-expanded', 'false');
  };
  burger.addEventListener('click', () => {
    const open = !links.classList.contains('is-open');
    links.classList.toggle('is-open', open);
    nav.classList.toggle('menu-open', open);
    burger.setAttribute('aria-expanded', String(open));
    nav.classList.remove('is-hidden');
  });
  $$('a', links).forEach(a => a.addEventListener('click', closeMenu));
  addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });

  const timeline = $('.timeline');
  const onScroll = () => {
    const y = scrollY;
    const max = document.documentElement.scrollHeight - innerHeight;
    progress.style.setProperty('--p', max > 0 ? y / max : 0);
    nav.classList.toggle('is-scrolled', y > 30);
    if (!links.classList.contains('is-open')) nav.classList.toggle('is-hidden', y > lastY && y > 400);
    lastY = y;

    // timeline line fills as you scroll through it
    const r = timeline.getBoundingClientRect();
    const t = Math.min(1, Math.max(0, (innerHeight * 0.65 - r.top) / r.height));
    timeline.style.setProperty('--tl', t);
  };
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  const navMap = new Map($$('.nav__links a[href^="#"]').map(a => [a.getAttribute('href').slice(1), a]));
  const spy = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (!en.isIntersecting) return;
      navMap.forEach(a => a.classList.remove('is-active'));
      const a = navMap.get(en.target.id);
      if (a && !a.classList.contains('nav__cta')) a.classList.add('is-active');
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  $$('main section[id]').forEach(s => spy.observe(s));

  /* ---------- Reveal on scroll ---------- */
  const io = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
  $$('.reveal').forEach(el => io.observe(el));

  /* ---------- Counters ---------- */
  const countIO = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (!en.isIntersecting) return;
      countIO.unobserve(en.target);
      const el = en.target, to = parseFloat(el.dataset.to), dec = +(el.dataset.dec || 0);
      if (reduced) { el.textContent = to.toFixed(dec); return; }
      const dur = 1600, t0 = performance.now();
      const tick = now => {
        const p = Math.min(1, (now - t0) / dur);
        const e = 1 - Math.pow(1 - p, 4);
        el.textContent = (to * e).toFixed(dec);
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
  }, { threshold: 0.6 });
  $$('.count').forEach(el => countIO.observe(el));

  /* ---------- Typed roles ---------- */
  const typed = $('.typed');
  const words = typed.dataset.words.split('|');
  if (reduced) typed.textContent = words[0];
  else {
    let w = 0, i = 0, del = false;
    const type = () => {
      const word = words[w];
      i += del ? -1 : 1;
      typed.textContent = word.slice(0, i);
      let wait = del ? 40 : 85;
      if (!del && i === word.length) { del = true; wait = 1700; }
      else if (del && i === 0) { del = false; w = (w + 1) % words.length; wait = 350; }
      setTimeout(type, wait);
    };
    setTimeout(type, 1200);
  }

  /* ---------- Copy email ---------- */
  const toast = $('.toast');
  let toastT;
  const showToast = msg => {
    toast.textContent = msg;
    toast.classList.add('is-on');
    clearTimeout(toastT);
    toastT = setTimeout(() => toast.classList.remove('is-on'), 2000);
  };
  $$('[data-copy]').forEach(btn => btn.addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(btn.dataset.copy); showToast('Email copied ✓'); }
    catch (e) { showToast(btn.dataset.copy); }
  }));

  /* ---------- Pointer effects (desktop only) ---------- */
  if (finePointer && !reduced) {
    const glow = $('.cursor-glow');
    addEventListener('pointermove', e => {
      body.classList.add('has-mouse');
      glow.style.setProperty('--mx', e.clientX + 'px');
      glow.style.setProperty('--my', e.clientY + 'px');
    }, { passive: true });
    document.addEventListener('pointerleave', () => body.classList.remove('has-mouse'));

    // spotlight follows cursor inside cards
    $$('.spot').forEach(el => el.addEventListener('pointermove', e => {
      const r = el.getBoundingClientRect();
      el.style.setProperty('--sx', e.clientX - r.left + 'px');
      el.style.setProperty('--sy', e.clientY - r.top + 'px');
    }));

    // 3D tilt
    $$('.tilt').forEach(el => {
      const max = el.classList.contains('photo-frame') ? 12 : 5;
      el.addEventListener('pointermove', e => {
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        el.style.transition = 'transform .15s ease-out';
        el.style.transform = `perspective(900px) rotateX(${-y * max}deg) rotateY(${x * max}deg)`;
      });
      el.addEventListener('pointerleave', () => {
        el.style.transition = 'transform .7s cubic-bezier(.22,1,.36,1)';
        el.style.transform = '';
      });
    });

    // magnetic buttons
    $$('.magnetic').forEach(el => {
      el.addEventListener('pointermove', e => {
        const r = el.getBoundingClientRect();
        const x = e.clientX - r.left - r.width / 2;
        const y = e.clientY - r.top - r.height / 2;
        el.style.transition = 'transform .2s ease-out';
        el.style.transform = `translate(${x * 0.25}px, ${y * 0.35}px)`;
      });
      el.addEventListener('pointerleave', () => {
        el.style.transition = 'transform .6s cubic-bezier(.22,1,.36,1)';
        el.style.transform = '';
      });
    });
  }

  /* ---------- Hero neural-network canvas ---------- */
  const canvas = $('.hero__net');
  const ctx = canvas.getContext('2d');
  let W, H, dpr, nodes = [], raf = null, visible = true;
  const mouse = { x: -9999, y: -9999 };
  const dotColor = () => getComputedStyle(root).getPropertyValue('--net-dot').trim();

  const resize = () => {
    dpr = Math.min(devicePixelRatio || 1, 2);
    W = canvas.clientWidth; H = canvas.clientHeight;
    canvas.width = W * dpr; canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const n = Math.round(Math.min(110, Math.max(36, (W * H) / 14000)));
    nodes = Array.from({ length: n }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.35, vy: (Math.random() - 0.5) * 0.35,
      r: Math.random() * 1.6 + 0.8
    }));
  };

  const LINK = 130;
  const draw = () => {
    const c = dotColor();
    ctx.clearRect(0, 0, W, H);
    for (const p of nodes) {
      // gentle pull toward cursor
      const dx = mouse.x - p.x, dy = mouse.y - p.y, d2 = dx * dx + dy * dy;
      if (d2 < 180 * 180) { p.vx += dx * 0.00003; p.vy += dy * 0.00003; }
      p.vx *= 0.995; p.vy *= 0.995;
      const sp = Math.hypot(p.vx, p.vy);
      if (sp < 0.12) { p.vx *= 1.05; p.vy *= 1.05; }
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0 || p.x > W) p.vx *= -1;
      if (p.y < 0 || p.y > H) p.vy *= -1;
    }
    for (let i = 0; i < nodes.length; i++) {
      const a = nodes[i];
      for (let j = i + 1; j < nodes.length; j++) {
        const b = nodes[j];
        const dx = a.x - b.x, dy = a.y - b.y, d = Math.hypot(dx, dy);
        if (d < LINK) {
          ctx.strokeStyle = `rgba(${c}, ${(1 - d / LINK) * 0.28})`;
          ctx.lineWidth = 1;
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
        }
      }
      const md = Math.hypot(mouse.x - a.x, mouse.y - a.y);
      if (md < 180) {
        ctx.strokeStyle = `rgba(34, 211, 238, ${(1 - md / 180) * 0.55})`;
        ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(mouse.x, mouse.y); ctx.stroke();
      }
      ctx.fillStyle = `rgba(${c}, .75)`;
      ctx.beginPath(); ctx.arc(a.x, a.y, a.r, 0, Math.PI * 2); ctx.fill();
    }
    raf = visible && !reduced ? requestAnimationFrame(draw) : null;
  };

  resize();
  draw();
  let rt;
  addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(() => { resize(); if (!raf) draw(); }, 150); });
  const hero = $('.hero');
  hero.addEventListener('pointermove', e => {
    const r = canvas.getBoundingClientRect();
    mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top;
  });
  hero.addEventListener('pointerleave', () => { mouse.x = mouse.y = -9999; });
  new IntersectionObserver(([en]) => {
    visible = en.isIntersecting;
    if (visible && !raf && !reduced) draw();
  }).observe(hero);
})();
