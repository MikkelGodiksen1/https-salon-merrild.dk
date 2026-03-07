/* ═══════════════════════════════════════════════════════
   Salon Merrild – Main JS
   ═══════════════════════════════════════════════════════ */

'use strict';

/* ── HERO VIDEO: Force autoplay ── */
(function initHeroVideo() {
  const video = document.querySelector('.hero__video');
  if (!video) return;

  // Ensure muted (required for autoplay)
  video.muted = true;

  const tryPlay = () => video.play().catch(() => {});

  // Try immediately
  tryPlay();

  // Retry on first user interaction (fallback for strict browsers)
  ['touchstart', 'pointerdown', 'click'].forEach(evt => {
    document.addEventListener(evt, tryPlay, { once: true, passive: true });
  });
})();

/* ── NAV: Scroll state ── */
(function initNav() {
  const nav = document.getElementById('nav');
  if (!nav) return;

  const onScroll = () => {
    nav.classList.toggle('scrolled', window.scrollY > 40);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // initial
})();

/* ── NAV: Mobile burger ── */
(function initBurger() {
  const burger = document.querySelector('.nav__burger');
  const nav    = document.getElementById('nav');
  if (!burger) return;

  // Inject mobile nav
  const mobile = document.createElement('nav');
  mobile.className = 'nav__mobile';
  mobile.setAttribute('aria-label', 'Mobilnavigation');

  const links = [
    { href: '#om-os',   label: 'Om os' },
    { href: '#galleri', label: 'Galleri' },
    { href: '#ydelser', label: 'Ydelser' },
    { href: '#aabent',  label: 'Åbningstider' },
    { href: '#kontakt', label: 'Kontakt' },
    { href: 'https://salonmerrild.klikbook.dk', label: 'Book tid →', external: true },
  ];

  links.forEach(({ href, label, external }) => {
    const a = document.createElement('a');
    a.href = href;
    a.textContent = label;
    if (external) { a.target = '_blank'; a.rel = 'noopener'; }
    a.addEventListener('click', close);
    mobile.appendChild(a);
  });

  document.body.appendChild(mobile);

  function open() {
    burger.classList.add('open');
    burger.setAttribute('aria-expanded', 'true');
    mobile.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function close() {
    burger.classList.remove('open');
    burger.setAttribute('aria-expanded', 'false');
    mobile.classList.remove('open');
    document.body.style.overflow = '';
  }

  burger.addEventListener('click', () => {
    burger.classList.contains('open') ? close() : open();
  });

  window.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
})();

/* ── SCROLL REVEAL ── */
(function initReveal() {
  const els = document.querySelectorAll('.reveal');
  if (!els.length) return;

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  els.forEach(el => io.observe(el));
})();

/* ── HERO: Floating shapes ── */
(function initHeroShapes() {
  const heroBg = document.querySelector('.hero__bg');
  if (!heroBg) return;

  const shapes = [
    { w: 500, h: 500, top: '10%',  left: '60%', delay: '0s',   dur: '20s', color: 'rgba(201,169,110,0.15)' },
    { w: 350, h: 350, top: '50%',  left: '20%', delay: '-7s',  dur: '25s', color: 'rgba(255,255,255,0.04)' },
    { w: 260, h: 260, top: '70%',  left: '75%', delay: '-14s', dur: '18s', color: 'rgba(201,169,110,0.08)' },
  ];

  shapes.forEach(s => {
    const div = document.createElement('div');
    div.className = 'shape';
    div.style.cssText = `
      width:${s.w}px; height:${s.h}px;
      top:${s.top}; left:${s.left};
      background:${s.color};
      animation-delay:${s.delay};
      animation-duration:${s.dur};
    `;
    heroBg.appendChild(div);
  });

  // CSS for float animation (inject once)
  const style = document.createElement('style');
  style.textContent = `
    @keyframes floatShape {
      0%,100% { transform: translate(0,0) scale(1); }
      25%      { transform: translate(-3%,2%) scale(1.05); }
      50%      { transform: translate(2%,-3%) scale(0.97); }
      75%      { transform: translate(-1%,4%) scale(1.03); }
    }
  `;
  document.head.appendChild(style);
})();

/* ── SMOOTH HOVER: Service cards ── */
(function initCardTilt() {
  const cards = document.querySelectorAll('.service-card');
  cards.forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect   = card.getBoundingClientRect();
      const x      = (e.clientX - rect.left) / rect.width  - 0.5;
      const y      = (e.clientY - rect.top)  / rect.height - 0.5;
      const tiltX  = y * 4;
      const tiltY  = -x * 4;
      card.style.transform = `perspective(800px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) translateZ(4px)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
})();

/* ── ACTIVE nav link highlight on scroll ── */
(function initActiveLinks() {
  const sections = document.querySelectorAll('section[id], div[id]');
  const navLinks = document.querySelectorAll('.nav__links a[href^="#"]');
  if (!navLinks.length) return;

  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navLinks.forEach(a => a.classList.remove('active'));
        const link = document.querySelector(`.nav__links a[href="#${entry.target.id}"]`);
        if (link) link.classList.add('active');
      }
    });
  }, { rootMargin: '-40% 0px -55% 0px' });

  sections.forEach(s => io.observe(s));
})();
