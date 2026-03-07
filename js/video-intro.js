/* ═══════════════════════════════════════════════════════
   Salon Merrild – Video Intro Scroll Experience
   ═══════════════════════════════════════════════════════ */

'use strict';

(function initVideoIntro() {

  /* ─── CONFIG ─── */
  const FRAME_COUNT  = 177;
  const FRAME_SPEED  = 2.0;   // animation completes at 50% scroll
  const IMAGE_SCALE  = 0.87;  // padded cover mode (0.82-0.90)
  const BG_SAMPLE_EVERY = 20; // resample bg color every N frames

  /* ─── ELEMENTS ─── */
  const loader        = document.getElementById('vi-loader');
  const loaderBar     = document.getElementById('vi-loader-bar');
  const loaderPercent = document.getElementById('vi-loader-percent');
  const viHero        = document.querySelector('.vi-hero');
  const canvasWrap    = document.getElementById('vi-canvas-wrap');
  const canvas        = document.getElementById('vi-canvas');
  const ctx           = canvas ? canvas.getContext('2d') : null;
  const darkOverlay   = document.getElementById('vi-dark-overlay');
  const marqueeWrap   = document.getElementById('vi-marquee-wrap');
  const marqueeText   = marqueeWrap ? marqueeWrap.querySelector('.vi-marquee-text') : null;
  const scrollCont    = document.getElementById('vi-scroll-container');

  if (!canvas || !ctx || !scrollCont) return;

  /* ─── STATE ─── */
  let frames      = new Array(FRAME_COUNT).fill(null);
  let loadedCount = 0;
  let currentFrame = 0;
  let sampledBg   = '#1a1a1a';
  let dpr         = window.devicePixelRatio || 1;

  /* ─── 1. LENIS SMOOTH SCROLL ─── */
  const lenis = new Lenis({
    duration: 1.2,
    easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
  });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add(time => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);

  /* ─── 2. CANVAS SETUP ─── */
  function resizeCanvas() {
    dpr = window.devicePixelRatio || 1;
    canvas.width  = window.innerWidth  * dpr;
    canvas.height = window.innerHeight * dpr;
    ctx.scale(dpr, dpr);
    drawFrame(currentFrame);
  }
  window.addEventListener('resize', resizeCanvas, { passive: true });
  resizeCanvas();

  /* ─── 3. BG COLOUR SAMPLING ─── */
  function sampleBgColor(img) {
    if (!img) return;
    const offscreen = document.createElement('canvas');
    offscreen.width  = 4;
    offscreen.height = 4;
    const c = offscreen.getContext('2d');
    c.drawImage(img, 0, 0, 4, 4);
    const d = c.getImageData(0, 0, 1, 1).data;
    sampledBg = `rgb(${d[0]},${d[1]},${d[2]})`;
  }

  /* ─── 4. DRAW FRAME ─── */
  function drawFrame(index) {
    const img = frames[index];
    const cw = canvas.width  / dpr;
    const ch = canvas.height / dpr;
    ctx.fillStyle = sampledBg;
    ctx.fillRect(0, 0, cw, ch);
    if (!img) return;

    const iw = img.naturalWidth;
    const ih = img.naturalHeight;
    const scale = Math.max(cw / iw, ch / ih) * IMAGE_SCALE;
    const dw = iw * scale;
    const dh = ih * scale;
    const dx = (cw - dw) / 2;
    const dy = (ch - dh) / 2;
    ctx.drawImage(img, dx, dy, dw, dh);
  }

  /* ─── 5. PRELOADER ─── */
  function loadFrames() {
    return new Promise(resolve => {
      let firstPhaseDone = false;

      function onLoad(i) {
        loadedCount++;
        const pct = Math.round(loadedCount / FRAME_COUNT * 100);
        if (loaderBar) loaderBar.style.width = pct + '%';
        if (loaderPercent) loaderPercent.textContent = pct + '%';

        if (i % BG_SAMPLE_EVERY === 0) sampleBgColor(frames[i]);
        if (!firstPhaseDone && i < 10) drawFrame(Math.min(i, 9));

        if (loadedCount >= FRAME_COUNT) {
          resolve();
        }
        // Start phase 2 after first 10 frames loaded
        if (!firstPhaseDone && loadedCount >= 10) {
          firstPhaseDone = true;
        }
      }

      // Phase 1: first 10 frames
      for (let i = 0; i < Math.min(10, FRAME_COUNT); i++) {
        const img = new Image();
        const idx = i;
        img.onload  = () => { frames[idx] = img; onLoad(idx); };
        img.onerror = () => { onLoad(idx); };
        img.src = `frames/frame_${String(idx + 1).padStart(4, '0')}.webp`;
      }

      // Phase 2: remaining frames
      for (let i = 10; i < FRAME_COUNT; i++) {
        const img = new Image();
        const idx = i;
        img.onload  = () => { frames[idx] = img; onLoad(idx); };
        img.onerror = () => { onLoad(idx); };
        img.src = `frames/frame_${String(idx + 1).padStart(4, '0')}.webp`;
      }
    });
  }

  /* ─── 6. SECTION POSITIONING ─── */
  function positionSections() {
    document.querySelectorAll('.vi-section').forEach(section => {
      const enter = parseFloat(section.dataset.enter);
      const leave = parseFloat(section.dataset.leave);
      const mid   = (enter + leave) / 2;
      section.style.top       = mid + '%';
      section.style.transform = 'translateY(-50%)';
      section.style.width     = '100%';
    });
  }

  /* ─── 7. SECTION ANIMATION FACTORY ─── */
  function createTimeline(type, children) {
    const tl = gsap.timeline({ paused: true });
    switch (type) {
      case 'fade-up':
        tl.from(children, { y: 50, opacity: 0, stagger: 0.12, duration: 0.9, ease: 'power3.out' });
        break;
      case 'slide-left':
        tl.from(children, { x: -80, opacity: 0, stagger: 0.14, duration: 0.9, ease: 'power3.out' });
        break;
      case 'slide-right':
        tl.from(children, { x: 80, opacity: 0, stagger: 0.14, duration: 0.9, ease: 'power3.out' });
        break;
      case 'scale-up':
        tl.from(children, { scale: 0.85, opacity: 0, stagger: 0.12, duration: 1.0, ease: 'power2.out' });
        break;
      case 'stagger-up':
        tl.from(children, { y: 60, opacity: 0, stagger: 0.15, duration: 0.8, ease: 'power3.out' });
        break;
      default:
        tl.from(children, { y: 40, opacity: 0, stagger: 0.12, duration: 0.9, ease: 'power3.out' });
    }
    return tl;
  }

  /* ─── 8. WIRE UP SECTIONS ─── */
  function initSections() {
    document.querySelectorAll('.vi-section').forEach(section => {
      const type    = section.dataset.animation || 'fade-up';
      const persist = section.dataset.persist === 'true';
      const children = section.querySelectorAll(
        '.vi-section__label, .vi-section__heading, .vi-section__body, .vi-cta-btn, .vi-stat'
      );
      const tl = createTimeline(type, children);

      ScrollTrigger.create({
        trigger : section,
        start   : 'top 72%',
        end     : 'bottom 28%',
        onEnter : () => {
          section.style.opacity       = '1';
          section.style.pointerEvents = persist ? 'auto' : 'none';
          tl.play();
        },
        onLeave : () => {
          if (!persist) {
            tl.reverse().then(() => { section.style.opacity = '0'; });
          }
        },
        onEnterBack : () => {
          if (!persist) {
            section.style.opacity = '1';
            tl.play();
          }
        },
        onLeaveBack : () => {
          tl.reverse().then(() => { section.style.opacity = '0'; });
        },
      });
    });
  }

  /* ─── 9. COUNTER ANIMATIONS ─── */
  function initCounters() {
    document.querySelectorAll('.vi-stat__number').forEach(el => {
      const target   = parseFloat(el.dataset.value);
      const decimals = parseInt(el.dataset.decimals || '0');
      gsap.from(el, {
        textContent: 0,
        duration   : 2,
        ease       : 'power1.out',
        snap       : { textContent: decimals === 0 ? 1 : 0.01 },
        scrollTrigger: {
          trigger      : el.closest('.vi-section'),
          start        : 'top 70%',
          toggleActions: 'play none none reverse',
        },
      });
    });
  }

  /* ─── 10. DARK OVERLAY ─── */
  function initDarkOverlay() {
    const enter     = 0.60;
    const leave     = 0.80;
    const fadeRange = 0.04;

    ScrollTrigger.create({
      trigger: scrollCont,
      start  : 'top top',
      end    : 'bottom bottom',
      scrub  : true,
      onUpdate(self) {
        const p = self.progress;
        let opacity = 0;
        if (p >= enter - fadeRange && p <= enter) {
          opacity = (p - (enter - fadeRange)) / fadeRange;
        } else if (p > enter && p < leave) {
          opacity = 0.88;
        } else if (p >= leave && p <= leave + fadeRange) {
          opacity = 0.88 * (1 - (p - leave) / fadeRange);
        }
        darkOverlay.style.opacity = opacity;
      },
    });
  }

  /* ─── 11. MARQUEE ─── */
  function initMarquee() {
    if (!marqueeWrap || !marqueeText) return;

    // Scroll-driven x movement
    gsap.to(marqueeText, {
      xPercent: -22,
      ease    : 'none',
      scrollTrigger: {
        trigger: scrollCont,
        start  : 'top top',
        end    : 'bottom bottom',
        scrub  : true,
      },
    });

    // Fade in/out based on scroll progress
    ScrollTrigger.create({
      trigger: scrollCont,
      start  : 'top top',
      end    : 'bottom bottom',
      scrub  : true,
      onUpdate(self) {
        const p = self.progress;
        let opacity = 0;
        if (p > 0.12 && p < 0.88) {
          opacity = Math.min(1, Math.min((p - 0.12) / 0.05, (0.88 - p) / 0.05));
        }
        marqueeWrap.style.opacity = opacity;
      },
    });
  }

  /* ─── 12. HERO TRANSITION ─── */
  function initHeroTransition() {
    // Hero fades as it scrolls off
    ScrollTrigger.create({
      trigger: viHero,
      start  : 'top top',
      end    : 'bottom top',
      scrub  : 0.5,
      onUpdate(self) {
        viHero.style.opacity = Math.max(0, 1 - self.progress * 2.2);
        // Canvas circle expands as hero scrolls away
        const r = Math.min(80, self.progress * 90);
        canvasWrap.style.clipPath = `circle(${r}% at 50% 50%)`;
      },
    });
  }

  /* ─── 13. FRAME SCROLL BINDING ─── */
  function initFrameScroll() {
    ScrollTrigger.create({
      trigger: scrollCont,
      start  : 'top top',
      end    : 'bottom bottom',
      scrub  : true,
      onUpdate(self) {
        const accelerated = Math.min(self.progress * FRAME_SPEED, 1);
        const index = Math.min(Math.floor(accelerated * FRAME_COUNT), FRAME_COUNT - 1);
        if (index !== currentFrame) {
          currentFrame = index;
          requestAnimationFrame(() => drawFrame(currentFrame));
        }
      },
    });

    // Hide canvas after intro ends
    ScrollTrigger.create({
      trigger   : scrollCont,
      start     : 'top top',
      end       : 'bottom bottom',
      onLeave   : () => { canvasWrap.classList.add('done'); },
      onEnterBack: () => { canvasWrap.classList.remove('done'); },
    });
  }

  /* ─── BOOT ─── */
  async function boot() {
    positionSections();
    await loadFrames();

    // Hide loader
    loader.classList.add('hidden');

    // Initialise everything after load
    initHeroTransition();
    initFrameScroll();
    initSections();
    initCounters();
    initDarkOverlay();
    initMarquee();

    ScrollTrigger.refresh();
  }

  // Wait for GSAP + Lenis to be ready
  if (typeof gsap !== 'undefined' && typeof Lenis !== 'undefined') {
    boot();
  } else {
    window.addEventListener('load', boot);
  }

})();
