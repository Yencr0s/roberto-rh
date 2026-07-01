/* =====================================================================
   Roberto Riaño Hidalgo — portfolio interactions
   anime.js v4 (ESM via CDN) + a vanilla particle network.

   Architecture / robustness:
   - Scroll reveals work with plain CSS transitions (IntersectionObserver
     just toggles .is-visible) so NOTHING disappears if anime.js fails.
   - anime.js enhances the hero, badges, glitch and magnetic buttons.
     If its CDN import fails we flag .anime-failed and fall back to CSS.
   - prefers-reduced-motion disables the heavy stuff entirely.

   ▶ TO EDIT YOUR CONTENT: change the EXPERIENCE, EDUCATION and PUBLICATIONS arrays
     right below. Everything else is wiring.
   ===================================================================== */

/* ============================ YOUR DATA ============================ */

// Work experience (top = most recent). `now: true` adds a pulsing dot.
const EXPERIENCE = [
  {
    date: 'Sep 2024 — Present',
    title: 'PhD Candidate · AI Security',
    org: 'Ikerlan Research Centre & Radboud University',
    desc: 'Researching backdoor threats to machine learning, from spiking neural networks to world models and their robustness.',
    now: true,
  },
  {
    date: 'Feb 2024 — Jul 2024',
    title: 'Project Intern · Master’s Thesis',
    org: 'Ikerlan Research Centre',
    tags: ['SNNs', 'Backdoors'],
    desc: 'Real-world environment backdoor attacks on Spiking Neural Networks: surveyed SNN-based image classification, studied their vulnerability to physical backdoors, and developed novel, reproducible attacks evaluated in real environments and against defenses.',
  },
  {
    date: 'Oct 2023 — Feb 2024',
    title: 'Research Intern · AI Security',
    org: 'Ikerlan Research Centre',
    desc: 'Vulnerabilities and defenses in AI models: reviewed adversarial and backdoor attack literature and detection techniques, and designed adversarial examples and backdoor attacks on AI models.',
  },
  {
    date: 'Feb 2023 — Jul 2023',
    title: 'Project Intern · Bachelor’s Thesis',
    org: 'Ikerlan Research Centre',
    tags: ['Autonomous Driving', 'CNNs', 'Adversarial'],
    desc: 'Testing the robustness of autonomous-driving systems: implemented a CNN-based traffic-sign detection system and developed adversarial attacks against DNN-based image detectors.',
  },
  {
    date: 'Jun 2022 — Aug 2022',
    title: 'Summer Intern · Post-Quantum Crypto',
    org: 'Ikerlan Research Centre',
    desc: 'Cryptography in the age of quantum computing: analysed NIST post-quantum algorithms, built proof-of-concept pilots, and benchmarked quantum-resistant cryptography for IIoT environments.',
  },
];

// Education (top = most recent).
const EDUCATION = [
  {
    date: 'Sep 2024 — Present',
    title: 'PhD · AI Security',
    org: 'Ikerlan Research Centre & Radboud University',
    desc: 'Doctoral research on backdoor attacks against machine-learning models.',
    now: true,
  },
  {
    date: 'Sep 2023 — Jul 2024',
    title: 'MSc · Computational Engineering & Intelligent Systems',
    org: 'UPV/EHU',
    tag: '9.13 / 10',
    desc: 'Specialization in Computer Science. AI, machine learning and intelligent systems.',
  },
  {
    date: '2019 — 2023',
    title: 'BSc · Computer Engineering',
    org: 'UPV/EHU',
    desc: 'Specialization in Computer Science.',
  },
];

// Publications (from Google Scholar). Add an object per paper.
// Your name (the ME constant below) gets highlighted automatically.
// Co-authors are listed as Scholar shows them — expand to full names if you like.
const PUBLICATIONS = [
  {
    year: '2025',
    title: 'Flashy Backdoor: Real-world Environment Backdoor Attack on SNNs with DVS Cameras',
    authors: ['Roberto Riaño Hidalgo', 'Gorka Abad', 'Stjepan Picek', 'Aitor Urbieta'],
    venue: 'IEEE Annual Computer Security Applications Conference (ACSAC) · Honolulu, HI · 2025 · pp. 986–1002',
    tag: 'peer-reviewed',
    links: [
      { label: 'DOI', href: 'https://doi.org/10.1109/ACSAC67867.2025.00081' },
      { label: 'Code', href: 'https://github.com/Yencr0s/Flashy_backdoor' },
    ],
  },
  {
    year: '2025',
    title: 'SoK: The Last Line of Defense — On Backdoor Defense Evaluation',
    authors: ['G. Abad', 'M. Krček', 'S. Koffas', 'B. Tajalli', 'M. Arazzi', 'Roberto Riaño Hidalgo', 'X. Xu', 'Z. Liu', 'et al.'],
    venue: 'arXiv preprint · arXiv:2511.13143 · 2025',
    tag: 'preprint',
    links: [
      { label: 'arXiv', href: 'https://arxiv.org/abs/2511.13143' },
    ],
  },
   {
    year: '2026',
    title: 'When the World Lies: Backdoor Attacks on Latent World Models for Downstream Control',
    authors: ['Roberto Riaño Hidalgo', 'Gorka Abad', 'Stjepan Picek', 'Aitor Urbieta'],
    venue: 'Under review · 2026',
    tag: 'under review',
  },
];

const ME = 'Roberto Riaño Hidalgo'; // used to bold your name in author lists

/* ====================== ENVIRONMENT / HELPERS ====================== */

const htmlEl = document.documentElement;
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
const $  = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

let anime = null; // { animate, stagger } once loaded

/* ============================ BOOTSTRAP ============================ */

async function init() {
  setYear();
  renderTimelines();
  renderPublications();
  setupNav();
  setupReveals();        // pre-marks delays; observer added after anime resolves

  if (reduceMotion) {
    // Show everything immediately; skip canvas, glitch, typewriter, magnets.
    htmlEl.classList.add('anime-failed'); // reuse the "reveal everything" rule
    revealAllNow();
    showStaticRoles();
    const cmd = $('.cmd[data-type]');
    if (cmd) cmd.textContent = cmd.dataset.type;
    const caret = $('.type-caret');
    if (caret) caret.style.display = 'none';
    return;
  }

  // Try to load anime.js. If it fails, gracefully fall back to CSS-only.
  try {
    const mod = await import('https://cdn.jsdelivr.net/npm/animejs@4.5.0/+esm');
    anime = { animate: mod.animate, stagger: mod.stagger };
    htmlEl.classList.add('anime-ok');
  } catch (err) {
    console.warn('[portfolio] anime.js failed to load — using CSS fallback.', err);
    htmlEl.classList.add('anime-failed');
  }

  startParticles();
  startRevealObserver();
  startStatObserver();
  setupSpotlight();
  setupMagnets();

  heroIntro();      // typewriter + entrance (anime if available, else instant)
  startRoleRotator();
}

/* ============================== NAV =============================== */

function setupNav() {
  const header = $('#site-header');
  const toggle = $('#nav-toggle');
  const menu   = $('#nav-menu');

  // Shrink/solidify header on scroll
  const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 24);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  // Mobile menu
  toggle.addEventListener('click', () => {
    const open = menu.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(open));
  });
  $$('#nav-menu a').forEach((a) =>
    a.addEventListener('click', () => {
      menu.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    })
  );
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && menu.classList.contains('open')) {
      menu.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    }
  });

  // Active section highlight
  const links = new Map($$('#nav-menu a[data-nav]').map((a) => [a.getAttribute('href').slice(1), a]));
  const sections = $$('main section[id]').filter((s) => links.has(s.id));
  const spy = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          links.forEach((l) => l.classList.remove('active'));
          links.get(e.target.id)?.classList.add('active');
        }
      });
    },
    { rootMargin: '-45% 0px -50% 0px' }
  );
  sections.forEach((s) => spy.observe(s));
}

/* =========================== REVEALS ============================== */

// Assign a stagger delay to grouped [data-stagger] items so siblings cascade.
function setupReveals() {
  const groups = new Map();
  $$('[data-stagger]').forEach((el) => {
    const parent = el.parentElement;
    const arr = groups.get(parent) || [];
    arr.push(el);
    groups.set(parent, arr);
  });
  groups.forEach((items) => {
    items.forEach((el, i) => {
      const d = i * 90;
      el.style.setProperty('--d', d + 'ms'); // CSS fallback delay
      el._revealDelay = d;                    // anime delay
    });
  });
}

function startRevealObserver() {
  const useAnime = !!anime;
  const io = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        const el = e.target;
        obs.unobserve(el);
        if (useAnime) {
          anime.animate(el, {
            opacity: [0, 1],
            translateY: [26, 0],
            duration: 720,
            delay: el._revealDelay || 0,
            ease: 'out(3)',
          });
        } else {
          el.classList.add('is-visible');
        }
      });
    },
    { rootMargin: '0px 0px -10% 0px', threshold: 0.08 }
  );
  $$('.reveal').forEach((el) => io.observe(el));
}

function revealAllNow() {
  $$('.reveal').forEach((el) => el.classList.add('is-visible'));
}

/* ========================= HERO INTRO ============================= */

function heroIntro() {
  // Typewriter for the `whoami` command, then reveal the name + the rest.
  const cmd = $('.cmd[data-type]');
  const text = cmd ? cmd.dataset.type : '';
  const typeMs = typewriter(cmd, text, 65);

  const reveal = (sel, delay, extra = {}) => {
    const els = $$(sel);
    if (!els.length) return;
    if (anime) {
      anime.animate(els, {
        opacity: [0, 1],
        translateY: [14, 0],
        duration: 600,
        delay: anime.stagger ? anime.stagger(70, { start: delay }) : delay,
        ease: 'out(3)',
        ...extra,
      });
    } else {
      els.forEach((el) => { el.style.opacity = 1; el.style.transform = 'none'; });
    }
  };

  const nameStart = typeMs + 220;
  // Name
  const name = $('.hero-name');
  if (name) {
    if (anime) {
      anime.animate(name, {
        opacity: [0, 1],
        translateY: [22, 0],
        scale: [0.98, 1],
        duration: 720,
        delay: nameStart,
        ease: 'out(4)',
      });
    } else {
      name.style.opacity = 1; name.style.transform = 'none';
    }
    // Glitch burst once it's in
    setTimeout(() => triggerGlitch(name, 850), nameStart + 120);
  }

  reveal('.term-2, .role-line, .hero-tagline', nameStart + 420);
  reveal('.hero-badges .badge', nameStart + 720);
  reveal('.hero-cta .btn', nameStart + 1000);
  reveal('.scroll-cue', nameStart + 1300);

  // term-1 line itself in immediately (it holds the live typewriter)
  const t1 = $('.term-1');
  if (t1) { t1.style.opacity = 1; t1.style.transform = 'none'; }
}

function triggerGlitch(el, ms = 800) {
  if (reduceMotion) return;
  el.classList.add('is-glitching');
  setTimeout(() => el.classList.remove('is-glitching'), ms);
}

// Types `text` into el; returns total duration (ms) so callers can sequence.
function typewriter(el, text, speed = 70) {
  if (!el) return 0;
  if (reduceMotion) { el.textContent = text; return 0; }
  el.textContent = '';
  let i = 0;
  const tick = () => {
    if (i <= text.length) {
      el.textContent = text.slice(0, i);
      i++;
      setTimeout(tick, speed);
    } else {
      // stop the caret next to the command once typed
      const caret = $('.type-caret');
      if (caret) caret.style.display = 'none';
    }
  };
  tick();
  return text.length * speed;
}

/* ======================= ROLE ROTATOR ============================= */

const ROLES = [
  'Adversarial Machine Learning',
  'Backdoor & Poisoning Attacks',
  'Generative AI Security',
  'Spiking Neural Networks',
  'World Models',
];

function showStaticRoles() {
  const el = $('#role-rotator');
  if (el) el.textContent = ROLES[0];
}

function startRoleRotator() {
  const el = $('#role-rotator');
  if (!el) return;
  if (reduceMotion) { el.textContent = ROLES[0]; return; }

  let r = 0;
  const type = (text, cb) => {
    let i = 0;
    el.textContent = '';
    const step = () => {
      el.textContent = text.slice(0, i);
      if (i++ < text.length) setTimeout(step, 55);
      else setTimeout(cb, 1600);
    };
    step();
  };
  const erase = (cb) => {
    let t = el.textContent;
    const step = () => {
      el.textContent = t = t.slice(0, -1);
      if (t.length) setTimeout(step, 28);
      else setTimeout(cb, 250);
    };
    step();
  };
  const loop = () => {
    type(ROLES[r], () => erase(() => { r = (r + 1) % ROLES.length; loop(); }));
  };
  // Wait until the hero has settled before starting.
  setTimeout(loop, 2600);
}

/* ====================== DATA RENDERERS ============================ */

function renderTimelines() {
  renderTimelineInto('#timeline-exp', EXPERIENCE);
  renderTimelineInto('#timeline-edu', EDUCATION);
}

function renderTimelineInto(sel, items) {
  const root = $(sel);
  if (!root) return;
  root.innerHTML = '';
  items.forEach((item) => {
    const li = document.createElement('li');
    li.className = 'timeline-item reveal' + (item.now ? ' tl-now' : '');
    const tags = item.tags || (item.tag ? [item.tag] : []); // supports one tag or many
    const tagHtml = tags.map((t) => `<span class="tl-tag">${esc(t)}</span>`).join('');
    li.innerHTML = `
      <div class="tl-date">${esc(item.date)}</div>
      <div class="tl-title">${esc(item.title)}${tagHtml}</div>
      <div class="tl-org">${esc(item.org)}</div>
      ${item.desc ? `<p class="tl-desc">${esc(item.desc)}</p>` : ''}
    `;
    root.appendChild(li);
  });
}

function renderPublications() {
  const root = $('#pub-list');
  if (!root) return;
  root.innerHTML = '';

  if (!PUBLICATIONS.length) {
    root.innerHTML = '<p class="pub-fallback">Publications coming soon — watch this space.</p>';
    return;
  }

  PUBLICATIONS.forEach((p) => {
    const authors = (p.authors || [])
      .map((a) => (a === ME ? `<span class="me">${esc(a)}</span>` : esc(a)))
      .join(', ');
    const links = (p.links || [])
      .map((l) => `<a href="${esc(l.href)}" target="_blank" rel="noopener">${esc(l.label)}</a>`)
      .join('');
    const card = document.createElement('article');
    card.className = 'pub-card reveal';
    card.innerHTML = `
      <div class="pub-year">${esc(p.year)}</div>
      <div class="pub-main">
        <h3 class="pub-title">${esc(p.title)}${p.tag ? `<span class="pub-tag">${esc(p.tag)}</span>` : ''}</h3>
        ${authors ? `<p class="pub-authors">${authors}</p>` : ''}
        ${p.venue ? `<p class="pub-venue">${esc(p.venue)}</p>` : ''}
        ${links ? `<div class="pub-links">${links}</div>` : ''}
      </div>
    `;
    root.appendChild(card);
  });
}

/* ====================== STAT COUNTERS ============================= */
// Vanilla rAF counter (no anime dependency → never gets stuck on 0).

function startStatObserver() {
  const stats = $$('.stat-num[data-count]');
  if (!stats.length) return;
  const io = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        obs.unobserve(e.target);
        countUp(e.target, parseInt(e.target.dataset.count, 10) || 0);
      });
    },
    { threshold: 0.4 }
  );
  stats.forEach((s) => io.observe(s));
}

function countUp(el, target) {
  if (reduceMotion) { el.textContent = target; return; }
  const dur = 1500;
  const start = performance.now();
  const tick = (now) => {
    const t = Math.min(1, (now - start) / dur);
    const eased = 1 - Math.pow(1 - t, 3); // easeOutCubic
    el.textContent = Math.round(eased * target);
    if (t < 1) requestAnimationFrame(tick);
    else el.textContent = target;
  };
  requestAnimationFrame(tick);
}

/* ======================= MAGNETIC BUTTONS ========================= */

function setupMagnets() {
  if (!anime || !finePointer) return;
  $$('.btn-primary').forEach((btn) => {
    btn.addEventListener('mousemove', (e) => {
      const r = btn.getBoundingClientRect();
      const mx = e.clientX - r.left - r.width / 2;
      const my = e.clientY - r.top - r.height / 2;
      anime.animate(btn, { translateX: mx * 0.25, translateY: my * 0.35, duration: 300, ease: 'out(3)' });
    });
    btn.addEventListener('mouseleave', () => {
      anime.animate(btn, { translateX: 0, translateY: 0, duration: 500, ease: 'out(4)' });
    });
  });
}

/* ========================= SPOTLIGHT ============================== */

function setupSpotlight() {
  if (!finePointer) return;
  const spot = $('.hero-spotlight');
  const hero = $('.hero');
  if (!spot || !hero) return;
  let raf = 0, x = 0, y = 0;
  window.addEventListener('mousemove', (e) => {
    x = e.clientX; y = e.clientY;
    if (!raf) raf = requestAnimationFrame(() => {
      spot.style.setProperty('--mx', x + 'px');
      spot.style.setProperty('--my', y + 'px');
      raf = 0;
    });
  }, { passive: true });
  hero.addEventListener('mouseenter', () => (spot.style.opacity = '1'));
  hero.addEventListener('mouseleave', () => (spot.style.opacity = '0'));
}

/* =================== PARTICLE NEURAL NETWORK ====================== */

function startParticles() {
  const canvas = $('#bg-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  let w, h, dpr, nodes, raf, running = true;
  const mouse = { x: -9999, y: -9999 };
  const LINK = 132;       // px distance to draw a link
  const MOUSE_LINK = 180;

  function size() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = window.innerWidth;   // CSS size comes from #bg-canvas { inset:0 }
    h = window.innerHeight;
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const target = Math.round((w * h) / 16000);
    const count = Math.max(26, Math.min(96, target));
    nodes = Array.from({ length: count }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
    }));
  }

  function frame() {
    if (!running) return;
    ctx.clearRect(0, 0, w, h);

    for (const n of nodes) {
      n.x += n.vx; n.y += n.vy;
      if (n.x < 0 || n.x > w) n.vx *= -1;
      if (n.y < 0 || n.y > h) n.vy *= -1;
    }

    // links
    for (let i = 0; i < nodes.length; i++) {
      const a = nodes[i];
      for (let j = i + 1; j < nodes.length; j++) {
        const b = nodes[j];
        const dx = a.x - b.x, dy = a.y - b.y;
        const d = Math.hypot(dx, dy);
        if (d < LINK) {
          ctx.strokeStyle = `rgba(34,211,238,${(1 - d / LINK) * 0.16})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
        }
      }
      // link to cursor
      const mdx = a.x - mouse.x, mdy = a.y - mouse.y;
      const md = Math.hypot(mdx, mdy);
      if (md < MOUSE_LINK) {
        ctx.strokeStyle = `rgba(103,232,249,${(1 - md / MOUSE_LINK) * 0.4})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y); ctx.lineTo(mouse.x, mouse.y); ctx.stroke();
      }
      // node
      ctx.fillStyle = 'rgba(34,211,238,0.7)';
      ctx.beginPath();
      ctx.arc(a.x, a.y, 1.7, 0, Math.PI * 2);
      ctx.fill();
    }
    raf = requestAnimationFrame(frame);
  }

  size();
  frame();

  window.addEventListener('resize', debounce(size, 200));
  window.addEventListener('mousemove', (e) => { mouse.x = e.clientX; mouse.y = e.clientY; }, { passive: true });
  window.addEventListener('mouseout', () => { mouse.x = -9999; mouse.y = -9999; });
  document.addEventListener('visibilitychange', () => {
    running = !document.hidden;
    if (running) { cancelAnimationFrame(raf); frame(); }
  });
}

/* =========================== UTILS ================================ */

function setYear() {
  const y = $('#footer-year');
  if (y) y.textContent = new Date().getFullYear();
}

function esc(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function debounce(fn, ms) {
  let t;
  return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
}

/* Boot — called last so every const above (ROLES, etc.) is initialized first. */
init();
