/* main.js — Andrés Lanziano Portfolio v2 */

(function () {
  'use strict';

  /* =============================================
     NAV — scroll shadow + hamburger
  ============================================= */
  const navbar   = document.getElementById('navbar');
  const hamburger = document.getElementById('hamburger');
  const navLinks  = document.getElementById('nav-links');

  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 24);
  }, { passive: true });

  hamburger.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('open');
    hamburger.classList.toggle('open', isOpen);
    hamburger.setAttribute('aria-expanded', isOpen);
  });

  // Close nav when a link is clicked
  navLinks.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      navLinks.classList.remove('open');
      hamburger.classList.remove('open');
      hamburger.setAttribute('aria-expanded', false);
    });
  });


  /* =============================================
     SCROLL REVEAL
  ============================================= */
  const revealEls = document.querySelectorAll('.reveal');

  const revealObs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        revealObs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  revealEls.forEach(el => revealObs.observe(el));

  // Fire hero immediately
  document.querySelectorAll('.hero .reveal').forEach(el => {
    setTimeout(() => el.classList.add('in-view'), 80);
  });


  /* =============================================
     COUNTER ANIMATION
  ============================================= */
  function animateCounter(el) {
    const target = parseInt(el.dataset.target, 10);
    const duration = 1200;
    const start = performance.now();

    function step(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(eased * target);
      if (progress < 1) requestAnimationFrame(step);
      else el.textContent = target;
    }
    requestAnimationFrame(step);
  }

  const counterObs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        counterObs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });

  document.querySelectorAll('.counter').forEach(el => counterObs.observe(el));


  /* =============================================
     BAR CHART ANIMATION
  ============================================= */
  const barObs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.querySelectorAll('.mv1-bar-fill').forEach(fill => {
          fill.classList.add('animated');
        });
        barObs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });

  document.querySelectorAll('.mv1-bar-section').forEach(el => barObs.observe(el));


  /* =============================================
     CAROUSEL — auto-slide + dots + drag
  ============================================= */
  function initCarousel(id) {
    const carousel   = document.getElementById(`carousel-${id}`);
    const track      = document.getElementById(`track-${id}`);
    const dotsWrap   = document.getElementById(`dots-${id}`);
    const prevBtn    = document.querySelector(`[data-carousel="${id}"].carousel-prev`);
    const nextBtn    = document.querySelector(`[data-carousel="${id}"].carousel-next`);

    if (!carousel || !track) return;

    const slides   = track.querySelectorAll('.carousel-slide');
    const total    = slides.length;
    let current    = 0;
    let autoTimer  = null;
    const INTERVAL = 4000;

    // Build dots
    slides.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.className = 'dot-btn' + (i === 0 ? ' active' : '');
      dot.setAttribute('role', 'tab');
      dot.setAttribute('aria-label', `Slide ${i + 1}`);
      dot.addEventListener('click', () => goTo(i));
      dotsWrap.appendChild(dot);
    });

    function updateDots() {
      dotsWrap.querySelectorAll('.dot-btn').forEach((d, i) => {
        d.classList.toggle('active', i === current);
      });
    }

    function goTo(index) {
      current = (index + total) % total;
      track.style.transform = `translateX(-${current * 100}%)`;
      updateDots();
    }

    function next() { goTo(current + 1); }
    function prev() { goTo(current - 1); }

    // Buttons
    if (nextBtn) nextBtn.addEventListener('click', () => { next(); resetAuto(); });
    if (prevBtn) prevBtn.addEventListener('click', () => { prev(); resetAuto(); });

    // Auto-slide
    function startAuto() { autoTimer = setInterval(next, INTERVAL); }
    function resetAuto() { clearInterval(autoTimer); startAuto(); }

    // Pause on hover
    carousel.addEventListener('mouseenter', () => clearInterval(autoTimer));
    carousel.addEventListener('mouseleave', startAuto);

    // Touch / drag support
    let startX = 0;
    let isDragging = false;

    carousel.addEventListener('pointerdown', e => {
      startX = e.clientX;
      isDragging = true;
      clearInterval(autoTimer);
    });

    window.addEventListener('pointerup', e => {
      if (!isDragging) return;
      isDragging = false;
      const diff = e.clientX - startX;
      if (Math.abs(diff) > 50) diff < 0 ? next() : prev();
      startAuto();
    });

    // Start
    startAuto();
  }

  // Init all carousels
  [1, 2].forEach(initCarousel);


  /* =============================================
     METRICS TOGGLE
  ============================================= */
  document.querySelectorAll('.mtog-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const group  = btn.dataset.group;
      const target = btn.dataset.target;

      // Update buttons
      document.querySelectorAll(`.mtog-btn[data-group="${group}"]`).forEach(b => {
        b.classList.toggle('active', b === btn);
      });

      // Update panels — find them relative to the toggle's parent article
      const article = btn.closest('.proj');
      article.querySelectorAll('.metrics-panel').forEach(panel => {
        panel.classList.toggle('active', panel.id === target);
      });

      // If v1 became active, trigger bar animation
      if (target.endsWith('-v1')) {
        const bars = article.querySelectorAll('.mv1-bar-fill');
        bars.forEach(b => b.classList.remove('animated'));
        setTimeout(() => bars.forEach(b => b.classList.add('animated')), 50);
      }

      // If v2 counters need to fire
      if (target.endsWith('-v2')) {
        article.querySelectorAll('#' + target + ' .counter').forEach(el => {
          el.textContent = '0';
          animateCounter(el);
        });
      }
    });
  });

})();