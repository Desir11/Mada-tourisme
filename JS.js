/* ============================================================
   MADA TOURISME — Main JavaScript
   ============================================================ */

'use strict';

/* ============================================================
   1. THEME TOGGLE (DARK / LIGHT MODE)
   ============================================================ */
const ThemeManager = {
  init() {
    const saved = localStorage.getItem('mada-theme') ||
      (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    this.apply(saved);

    document.querySelectorAll('.theme-toggle').forEach(btn => {
      btn.addEventListener('click', () => this.toggle());
    });
  },

  apply(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('mada-theme', theme);
    const icon = theme === 'dark' ? '☀️' : '🌙';
    document.querySelectorAll('.theme-toggle').forEach(btn => {
      btn.innerHTML = icon;
      btn.setAttribute('aria-label', theme === 'dark' ? 'Mode jour' : 'Mode nuit');
    });
  },

  toggle() {
    const current = document.documentElement.getAttribute('data-theme');
    this.apply(current === 'dark' ? 'light' : 'dark');
  }
};

/* ============================================================
   2. NAVBAR — SCROLL EFFECT & ACTIVE LINK
   ============================================================ */
const NavbarManager = {
  init() {
    const navbar = document.querySelector('.navbar');
    if (!navbar) return;

    window.addEventListener('scroll', () => {
      if (window.scrollY > 60) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    }, { passive: true });

    // Active link based on current page
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-links a, .mobile-menu a').forEach(link => {
      const href = link.getAttribute('href');
      if (href === currentPage || (currentPage === '' && href === 'index.html')) {
        link.classList.add('active');
      }
    });
  }
};

/* ============================================================
   3. MOBILE MENU
   ============================================================ */
const MobileMenu = {
  init() {
    const toggle = document.querySelector('.menu-toggle');
    const menu = document.querySelector('.mobile-menu');
    if (!toggle || !menu) return;

    toggle.addEventListener('click', () => {
      const isOpen = toggle.classList.toggle('open');
      menu.classList.toggle('open', isOpen);
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    // Close on link click
    menu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        toggle.classList.remove('open');
        menu.classList.remove('open');
        document.body.style.overflow = '';
      });
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
      if (!menu.contains(e.target) && !toggle.contains(e.target)) {
        toggle.classList.remove('open');
        menu.classList.remove('open');
        document.body.style.overflow = '';
      }
    });
  }
};

/* ============================================================
   4. HOMEPAGE SLIDESHOW
   ============================================================ */
const Slideshow = {
  slides: [],
  dots: [],
  current: 0,
  timer: null,
  interval: 5500,

  init() {
    this.slides = document.querySelectorAll('.slide');
    this.dots   = document.querySelectorAll('.slide-dot');
    if (!this.slides.length) return;

    // Show first slide
    this.goTo(0);

    // Dots
    this.dots.forEach((dot, i) => {
      dot.addEventListener('click', () => {
        this.goTo(i);
        this.resetTimer();
      });
    });

    // Arrows
    const prev = document.querySelector('.slide-arrow.prev');
    const next = document.querySelector('.slide-arrow.next');
    if (prev) prev.addEventListener('click', () => { this.prev(); this.resetTimer(); });
    if (next) next.addEventListener('click', () => { this.next(); this.resetTimer(); });

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft')  { this.prev(); this.resetTimer(); }
      if (e.key === 'ArrowRight') { this.next(); this.resetTimer(); }
    });

    // Touch / swipe
    this.initSwipe();

    // Auto-play
    this.startTimer();
  },

  goTo(index) {
    const len = this.slides.length;
    this.slides[this.current].classList.remove('active');
    if (this.dots[this.current]) this.dots[this.current].classList.remove('active');

    this.current = ((index % len) + len) % len;

    this.slides[this.current].classList.add('active');
    if (this.dots[this.current]) this.dots[this.current].classList.add('active');
  },

  prev() { this.goTo(this.current - 1); },
  next() { this.goTo(this.current + 1); },

  startTimer() {
    this.timer = setInterval(() => this.next(), this.interval);
  },

  resetTimer() {
    clearInterval(this.timer);
    this.startTimer();
  },

  initSwipe() {
    const hero = document.querySelector('.slideshow-hero');
    if (!hero) return;
    let startX = 0;

    hero.addEventListener('touchstart', e => {
      startX = e.touches[0].clientX;
    }, { passive: true });

    hero.addEventListener('touchend', e => {
      const diff = startX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 50) {
        if (diff > 0) this.next();
        else this.prev();
        this.resetTimer();
      }
    }, { passive: true });
  }
};

/* ============================================================
   5. SCROLL REVEAL ANIMATION
   ============================================================ */
const ScrollReveal = {
  init() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
  }
};

/* ============================================================
   6. DESTINATIONS FILTER
   ============================================================ */
const DestFilter = {
  init() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    const cards = document.querySelectorAll('.region-card');
    if (!filterBtns.length) return;

    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const filter = btn.dataset.filter;
        cards.forEach(card => {
          const show = filter === 'all' || card.dataset.region === filter;
          card.style.display = show ? '' : 'none';

          if (show) {
            card.style.animation = 'none';
            card.offsetHeight; // reflow
            card.style.animation = 'fadeInUp 0.5s ease forwards';
          }
        });
      });
    });
  }
};

/* ============================================================
   7. FAQ ACCORDION
   ============================================================ */
const FAQ = {
  init() {
    const items = document.querySelectorAll('.faq-item');
    if (!items.length) return;

    items.forEach(item => {
      const question = item.querySelector('.faq-question');
      question.addEventListener('click', () => {
        const isOpen = item.classList.contains('open');
        // Close all
        items.forEach(i => i.classList.remove('open'));
        // Open clicked if was closed
        if (!isOpen) item.classList.add('open');
      });
    });
  }
};

/* ============================================================
   8. CONTACT FORM VALIDATION
   ============================================================ */
const ContactForm = {
  init() {
    const form = document.querySelector('#contact-form');
    if (!form) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (this.validate(form)) {
        this.submit(form);
      }
    });

    // Real-time validation
    form.querySelectorAll('input, textarea, select').forEach(field => {
      field.addEventListener('blur', () => this.validateField(field));
      field.addEventListener('input', () => {
        if (field.classList.contains('error')) this.validateField(field);
      });
    });
  },

  validate(form) {
    let valid = true;
    form.querySelectorAll('[required]').forEach(field => {
      if (!this.validateField(field)) valid = false;
    });
    return valid;
  },

  validateField(field) {
    const value = field.value.trim();
    let valid = true;

    field.classList.remove('error');

    if (field.hasAttribute('required') && !value) {
      valid = false;
    } else if (field.type === 'email' && value) {
      valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    }

    if (!valid) field.classList.add('error');
    return valid;
  },

 submit(form) {

  const btn = form.querySelector('[type="submit"]');

  btn.disabled = true;
  btn.innerHTML = 'Envoi en cours...';

  form.submit();
}
};

/* ============================================================
   9. COUNTER ANIMATION
   ============================================================ */
const CounterAnim = {
  init() {
    const counters = document.querySelectorAll('.count-up');
    if (!counters.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.animate(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    counters.forEach(el => observer.observe(el));
  },

  animate(el) {
    const target = parseFloat(el.dataset.target);
    const suffix = el.dataset.suffix || '';
    const duration = 1800;
    const start = performance.now();

    const step = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = target * eased;

      el.textContent = (Number.isInteger(target)
        ? Math.round(value).toLocaleString()
        : value.toFixed(1)) + suffix;

      if (progress < 1) requestAnimationFrame(step);
    };

    requestAnimationFrame(step);
  }
};

/* ============================================================
   10. SMOOTH SCROLL
   ============================================================ */
const SmoothScroll = {
  init() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', (e) => {
        const target = document.querySelector(anchor.getAttribute('href'));
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });
  }
};

/* ============================================================
   11. FAUNA HOVER — PRELOAD IMAGES
   ============================================================ */
const LazyLoad = {
  init() {
    if ('IntersectionObserver' in window) {
      const imgObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            if (img.dataset.src) {
              img.src = img.dataset.src;
              img.removeAttribute('data-src');
            }
            imgObserver.unobserve(img);
          }
        });
      }, { rootMargin: '200px' });

      document.querySelectorAll('img[data-src]').forEach(img => imgObserver.observe(img));
    } else {
      // Fallback
      document.querySelectorAll('img[data-src]').forEach(img => {
        img.src = img.dataset.src;
      });
    }
  }
};

/* ============================================================
   INIT — RUN ALL MODULES
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  ThemeManager.init();
  NavbarManager.init();
  MobileMenu.init();
  Slideshow.init();
  ScrollReveal.init();
  DestFilter.init();
  FAQ.init();
  ContactForm.init();
  CounterAnim.init();
  SmoothScroll.init();
  LazyLoad.init();

  // Fade-in page
  document.body.style.opacity = '0';
  requestAnimationFrame(() => {
    document.body.style.transition = 'opacity 0.5s ease';
    document.body.style.opacity = '1';
  });
});

/* ============================================================
   KEYFRAME HELPERS (injected dynamically)
   ============================================================ */
const style = document.createElement('style');
style.textContent = `
  @keyframes fadeInUp {
    from { opacity: 0; transform: translateY(25px); }
    to   { opacity: 1; transform: translateY(0); }
  }
`;
document.head.appendChild(style);
/* ============================================================
   10. CALCULATEUR AUTOMATIQUE DEVIS
   ============================================================ */

const TravelCalculator = {
  init() {

    const destination = document.getElementById('destination');
    const travelers = document.getElementById('travelers');

    const totalPrice = document.getElementById('total-price');
    const pricePerPerson = document.getElementById('price-per-person');

    if (!destination || !travelers) return;

    const calculate = () => {

      const price = parseFloat(destination.value) || 0;
      const people = parseInt(travelers.value) || 1;

      const total = price * people;

      pricePerPerson.textContent =
        price.toLocaleString('fr-FR') + ' €';

      totalPrice.textContent =
        total.toLocaleString('fr-FR') + ' €';
        const hiddenTotal = document.getElementById('estimated-total');

if(hiddenTotal){
  hiddenTotal.value = total.toLocaleString('fr-FR') + ' €';
}
    };

    destination.addEventListener('change', calculate);
    travelers.addEventListener('input', calculate);

    calculate();
  }
};

/* INITIALISATION */
document.addEventListener('DOMContentLoaded', () => {
  TravelCalculator.init();
});