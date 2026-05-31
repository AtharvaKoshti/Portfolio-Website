/* ═══════════════════════════════════════════════════════════════
   script.js — Atharva Koshti Portfolio v2
   · Cursor-tracking 3D tilt on Sketchfab model
   · Sakura petal rain
   · Scroll reveal
   · Navbar effects
   · Contact form (Formspree / PHP)
═══════════════════════════════════════════════════════════════ */

// ── Year ──────────────────────────────────────────────────────────
document.getElementById('year').textContent = new Date().getFullYear();

// ── Navbar: scroll glass + burger ────────────────────────────────
const navbar    = document.getElementById('navbar');
const burgerBtn = document.getElementById('burgerBtn');
const navLinks  = document.getElementById('navLinks');

window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 55);
}, { passive: true });

burgerBtn.addEventListener('click', () => {
  burgerBtn.classList.toggle('open');
  navLinks.classList.toggle('open');
});

navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    burgerBtn.classList.remove('open');
    navLinks.classList.remove('open');
  });
});

// Active link highlight on scroll
const sections = document.querySelectorAll('section[id]');
const navObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    navLinks.querySelectorAll('a[href^="#"]').forEach(a => {
      const active = a.getAttribute('href') === '#' + entry.target.id;
      a.style.color = active ? 'var(--gold)' : '';
    });
  });
}, { threshold: 0.45 });
sections.forEach(s => navObserver.observe(s));

// ── Scroll-triggered reveal ───────────────────────────────────────
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll(
  '.project-card, .skill-group, .timeline-item, .cert-card, ' +
  '.about-grid, .contact-grid'
).forEach(el => {
  el.classList.add('reveal');
  revealObserver.observe(el);
});

// ── Smooth scroll for anchor links ───────────────────────────────
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', e => {
    const target = document.querySelector(anchor.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const top = target.getBoundingClientRect().top + window.scrollY - 68;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});

// ══════════════════════════════════════════════════════════════════
//  CURSOR-TRACKING 3D TILT — makes the ninja model follow the mouse
//
//  How it works:
//    1. We listen to mousemove on the entire page.
//    2. We calculate how far the cursor is from the centre of the
//       hero section (as a -1 → +1 normalised value).
//    3. We apply CSS perspective + rotateX / rotateY to the wrapper
//       around the Sketchfab iframe. The iframe itself doesn't move —
//       only the container transforms, giving the illusion the model
//       is looking toward the cursor.
//    4. On mobile/touch there's no cursor, so the effect is skipped.
// ══════════════════════════════════════════════════════════════════
/*(function initCursorTilt() {
  const tiltEl   = document.getElementById('modelTilt');
  const heroEl   = document.getElementById('hero');
  if (!tiltEl || !heroEl) return;

  // Only on non-touch devices
  if (window.matchMedia('(hover: none)').matches) return;

  // How many degrees max rotation in each axis
  const MAX_ROTATE_X = 8;   // tilt up/down
  const MAX_ROTATE_Y = 12;  // turn left/right

  // Smooth lerp values
  let currentX = 0, currentY = 0;
  let targetX  = 0, targetY  = 0;
  let rafId    = null;

  function lerp(a, b, t) { return a + (b - a) * t; }

  function animate() {
    // Ease toward target (0.07 = smooth lag, increase for snappier)
    currentX = lerp(currentX, targetX, 0.07);
    currentY = lerp(currentY, targetY, 0.07);

    tiltEl.style.transform =
      `perspective(900px) rotateX(${currentX}deg) rotateY(${currentY}deg)`;

    rafId = requestAnimationFrame(animate);
  }

  document.addEventListener('mousemove', e => {
    const rect   = heroEl.getBoundingClientRect();
    // Cursor relative to hero centre, normalised -1 → +1
    const normX  = ((e.clientX - rect.left)  / rect.width  - 0.5) * 2;
    const normY  = ((e.clientY - rect.top)   / rect.height - 0.5) * 2;

    // rotateY: cursor right → model turns right
    // rotateX: cursor down  → model tilts back (negative = tilt back)
    targetY =  normX * MAX_ROTATE_Y;
    targetX = -normY * MAX_ROTATE_X;
  });

  // Reset to neutral when cursor leaves hero
  heroEl.addEventListener('mouseleave', () => {
    targetX = 0;
    targetY = 0;
  });

  // Start animation loop
  animate();

  // Stop loop when hero scrolls out of view (saves CPU)
  const heroVisibility = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        if (!rafId) animate();
      } else {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
    });
  }, { threshold: 0 });
  heroVisibility.observe(heroEl);
})();

// ── Sakura petal rain ─────────────────────────────────────────────
(function spawnPetals() {
  const container = document.getElementById('petals-container');
  if (!container) return;

  const COUNT = 18;
  for (let i = 0; i < COUNT; i++) {
    const el  = document.createElement('span');
    el.className = 'petal';

    const size     = 6 + Math.random() * 9;
    const left     = Math.random() * 100;
    const delay    = Math.random() * 16;
    const duration = 10 + Math.random() * 12;
    const initRot  = Math.random() * 60;

    el.style.cssText = `
      width: ${size}px; height: ${size}px;
      left: ${left}%;
      animation-delay: ${delay}s;
      animation-duration: ${duration}s;
      transform: rotate(${initRot}deg);
      opacity: ${0.3 + Math.random() * 0.5};
    `;
    container.appendChild(el);
  }
})();

// ── Contact form ─────────────────────────────────────────────────
const contactForm = document.getElementById('contactForm');
const submitBtn   = document.getElementById('submitBtn');
const formStatus  = document.getElementById('form-status');

if (contactForm) {
  contactForm.addEventListener('submit', async e => {
    e.preventDefault();

    const name    = contactForm.name.value.trim();
    const email   = contactForm.email.value.trim();
    const message = contactForm.message.value.trim();

    if (!name || !email || !message) {
      showStatus('Please fill in all required fields.', 'error');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showStatus('Please enter a valid email address.', 'error');
      return;
    }

    submitBtn.disabled   = true;
    submitBtn.textContent = 'Sending...';

    try {
      const res = await fetch(contactForm.action, {
        method:  'POST',
        body:    new FormData(contactForm),
        headers: { Accept: 'application/json' },
      });

      if (res.ok) {
        showStatus('✓ Message sent! I\'ll reply within 48 hours.', 'success');
        contactForm.reset();
      } else {
        const data = await res.json().catch(() => ({}));
        showStatus(data.error || 'Something went wrong. Please email me directly.', 'error');
      }
    } catch {
      showStatus('Network error. Please try again or email me directly.', 'error');
    } finally {
      submitBtn.disabled   = false;
      submitBtn.textContent = 'Send Message ✉';
    }
  });
}

function showStatus(msg, type) {
  formStatus.textContent = msg;
  formStatus.className   = 'form-status ' + type;
  setTimeout(() => {
    formStatus.textContent = '';
    formStatus.className   = 'form-status';
  }, 6000);
}
