/* ============================================================
   KARINA BIANCA STUDIO — script.js
   Scroll Reveal | Navbar | Carrossel | Formulário | Ano
   Vanilla JS — sem dependências externas
   ============================================================ */

(function () {
  'use strict';

  /* ── 1. ANO NO FOOTER ──────────────────────────────────── */
  const yearEl = document.getElementById('footerYear');
  if (yearEl) yearEl.textContent = new Date().getFullYear();


  /* ── 2. NAVBAR: shrink + mobile toggle ─────────────────── */
  const navbar    = document.getElementById('navbar');
  const navToggle = document.getElementById('navToggle');
  const navLinks  = document.getElementById('navLinks');

  // Shrink on scroll
  function handleNavbarScroll() {
    if (window.scrollY > 60) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }
  window.addEventListener('scroll', handleNavbarScroll, { passive: true });
  handleNavbarScroll(); // run on load

  // Mobile toggle
  if (navToggle && navLinks) {
    navToggle.addEventListener('click', function () {
      const isOpen = navLinks.classList.toggle('open');
      navToggle.classList.toggle('active', isOpen);
      navToggle.setAttribute('aria-expanded', isOpen);
      // Prevent body scroll when menu open
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    // Close on link click
    navLinks.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        navLinks.classList.remove('open');
        navToggle.classList.remove('active');
        navToggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      });
    });

    // Close on outside click
    document.addEventListener('click', function (e) {
      if (!navbar.contains(e.target) && navLinks.classList.contains('open')) {
        navLinks.classList.remove('open');
        navToggle.classList.remove('active');
        navToggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      }
    });
  }

  // Highlight active nav link on scroll
  const sections = document.querySelectorAll('section[id]');
  const navAnchors = document.querySelectorAll('.navbar__links a[href^="#"]');

  function highlightNavLink() {
    const scrollPos = window.scrollY + 120;
    let current = '';
    sections.forEach(function (section) {
      if (scrollPos >= section.offsetTop) {
        current = section.getAttribute('id');
      }
    });
    navAnchors.forEach(function (a) {
      a.classList.remove('active-link');
      if (a.getAttribute('href') === '#' + current) {
        a.classList.add('active-link');
      }
    });
  }
  window.addEventListener('scroll', highlightNavLink, { passive: true });


  /* ── 3. SCROLL REVEAL ──────────────────────────────────── */
  function initScrollReveal() {
    const revealEls = document.querySelectorAll('.reveal');
    if (!revealEls.length) return;

    const observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target); // fire once
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );

    revealEls.forEach(function (el) {
      observer.observe(el);
    });
  }
  initScrollReveal();


  /* ── 4. CARROSSEL DE DEPOIMENTOS ───────────────────────── */
  (function initCarousel() {
    const track  = document.getElementById('carouselTrack');
    const prevBtn = document.getElementById('carouselPrev');
    const nextBtn = document.getElementById('carouselNext');
    const dotsContainer = document.getElementById('carouselDots');

    if (!track || !prevBtn || !nextBtn) return;

    const cards      = track.querySelectorAll('.testimonial-card');
    const totalCards = cards.length;
    let current      = 0;
    let autoTimer    = null;
    let perView      = getPerView();

    function getPerView() {
      if (window.innerWidth <= 520) return 1;
      if (window.innerWidth <= 860) return 1.2;
      return 3;
    }

    // Build dots
    function buildDots() {
      dotsContainer.innerHTML = '';
      const numDots = Math.ceil(totalCards / Math.floor(perView));
      for (let i = 0; i < numDots; i++) {
        const dot = document.createElement('button');
        dot.className = 'carousel__dot' + (i === 0 ? ' active' : '');
        dot.setAttribute('aria-label', 'Ir para depoimento ' + (i + 1));
        dot.setAttribute('role', 'tab');
        dot.addEventListener('click', function () { goTo(i * Math.floor(perView)); });
        dotsContainer.appendChild(dot);
      }
    }

    function updateDots() {
      const dots = dotsContainer.querySelectorAll('.carousel__dot');
      const activeDotIndex = Math.floor(current / Math.floor(perView));
      dots.forEach(function (d, i) {
        d.classList.toggle('active', i === activeDotIndex);
      });
    }

    function goTo(index) {
      const max = totalCards - Math.floor(perView);
      current = Math.max(0, Math.min(index, max));
      const cardWidth = 100 / perView;
      track.style.transform = 'translateX(-' + (current * cardWidth) + '%)';

      // Update card widths
      cards.forEach(function (card) {
        card.style.flex = '0 0 ' + cardWidth + '%';
      });

      updateDots();
    }

    function next() { goTo(current + 1); }
    function prev() { goTo(current - 1); }

    function startAuto() {
      autoTimer = setInterval(function () {
        const nextIndex = current + 1 > totalCards - Math.floor(perView) ? 0 : current + 1;
        goTo(nextIndex);
      }, 4500);
    }
    function stopAuto() { clearInterval(autoTimer); }

    // Init
    buildDots();
    goTo(0);
    startAuto();

    prevBtn.addEventListener('click', function () { stopAuto(); prev(); startAuto(); });
    nextBtn.addEventListener('click', function () { stopAuto(); next(); startAuto(); });

    // Touch / swipe
    let touchStartX = 0;
    track.addEventListener('touchstart', function (e) {
      touchStartX = e.changedTouches[0].clientX;
      stopAuto();
    }, { passive: true });
    track.addEventListener('touchend', function (e) {
      const diff = touchStartX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 40) {
        diff > 0 ? next() : prev();
      }
      startAuto();
    }, { passive: true });

    // Pause on hover
    track.parentElement.addEventListener('mouseenter', stopAuto);
    track.parentElement.addEventListener('mouseleave', startAuto);

    // Responsive resize
    let resizeTimer;
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () {
        perView = getPerView();
        buildDots();
        goTo(0);
      }, 200);
    });

  })();


  /* ── 5. FORMULÁRIO — envio via WhatsApp ────────────────── */
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();

      const nome     = document.getElementById('nome').value.trim();
      const telefone = document.getElementById('telefone').value.trim();
      const servico  = document.getElementById('servico').value;
      const mensagem = document.getElementById('mensagem').value.trim();

      // Validação básica
      if (!nome || !telefone || !servico) {
        showFormMsg('Por favor, preencha os campos obrigatórios.', 'error');
        return;
      }

      // Monta mensagem para WhatsApp
      const wppNumber = '5500000000000'; // ← SUBSTITUA pelo número real
      const text = encodeURIComponent(
        '🌸 *Agendamento — Karina Bianca Studio*\n\n' +
        '*Nome:* ' + nome + '\n' +
        '*Telefone:* ' + telefone + '\n' +
        '*Serviço:* ' + servico + '\n' +
        (mensagem ? '*Mensagem:* ' + mensagem : '')
      );

      // Feedback visual
      showFormMsg('Redirecionando para o WhatsApp... 💬', 'success');

      // Abre WhatsApp após breve delay
      setTimeout(function () {
        window.open('https://wa.me/' + wppNumber + '?text=' + text, '_blank');
        contactForm.reset();
        hideFormMsg();
      }, 1200);
    });
  }

  function showFormMsg(msg, type) {
    let msgEl = document.getElementById('formMessage');
    if (!msgEl) {
      msgEl = document.createElement('div');
      msgEl.id = 'formMessage';
      msgEl.style.cssText = [
        'margin-top: 0.75rem',
        'padding: 0.75rem 1rem',
        'border-radius: 8px',
        'font-size: 0.88rem',
        'font-weight: 500',
        'text-align: center',
        'transition: opacity 0.3s',
      ].join(';');
      contactForm.appendChild(msgEl);
    }
    if (type === 'error') {
      msgEl.style.background = '#FFF0F0';
      msgEl.style.color      = '#C00030';
      msgEl.style.border     = '1px solid #FFC0C0';
    } else {
      msgEl.style.background = '#F0FFF4';
      msgEl.style.color      = '#1A7A40';
      msgEl.style.border     = '1px solid #B0EFC0';
    }
    msgEl.textContent = msg;
    msgEl.style.opacity = '1';
  }
  function hideFormMsg() {
    const msgEl = document.getElementById('formMessage');
    if (msgEl) { msgEl.style.opacity = '0'; }
  }


  /* ── 6. GALERIA — CARROSSEL DE FOTOS ──────────────────── */
(function initGallery() {
  const track     = document.getElementById('galleryTrack');
  const prevBtn   = document.getElementById('galleryPrev');
  const nextBtn   = document.getElementById('galleryNext');
  const dotsWrap  = document.getElementById('galleryDots');

  if (!track || !prevBtn || !nextBtn) return;

  const slides   = track.querySelectorAll('.gallery-slide');
  const total    = slides.length;
  let current    = 0;
  let perView    = getPerView();
  let autoTimer  = null;
  const GAP      = 20; // px — espelha o gap do CSS (1.25rem ≈ 20px)

  function getPerView() {
    if (window.innerWidth <= 520) return 1;
    if (window.innerWidth <= 860) return 2;
    return 3;
  }

  function setSlideWidths() {
    const containerW = track.parentElement.offsetWidth;
    const slideW     = (containerW - GAP * (perView - 1)) / perView;
    slides.forEach(function (s) {
      s.style.flex = '0 0 ' + slideW + 'px';
    });
    track.style.gap = GAP + 'px';
  }

  function buildDots() {
    dotsWrap.innerHTML = '';
    const numDots = Math.ceil(total / perView);
    for (let i = 0; i < numDots; i++) {
      const d = document.createElement('button');
      d.className = 'gallery-dot' + (i === 0 ? ' active' : '');
      d.setAttribute('aria-label', 'Ir para imagem ' + (i * perView + 1));
      d.setAttribute('role', 'tab');
      d.addEventListener('click', function () { goTo(i * perView); });
      dotsWrap.appendChild(d);
    }
  }

  function updateDots() {
    const dots = dotsWrap.querySelectorAll('.gallery-dot');
    const idx  = Math.floor(current / perView);
    dots.forEach(function (d, i) { d.classList.toggle('active', i === idx); });
  }

  function goTo(index) {
    const containerW = track.parentElement.offsetWidth;
    const slideW     = (containerW - GAP * (perView - 1)) / perView;
    const maxIndex   = total - perView;
    current = Math.max(0, Math.min(index, maxIndex));
    const offset = current * (slideW + GAP);
    track.style.transform = 'translateX(-' + offset + 'px)';
    updateDots();
  }

  function next() {
    goTo(current + 1 > total - perView ? 0 : current + 1);
  }
  function prev() {
    goTo(current - 1 < 0 ? total - perView : current - 1);
  }

  function startAuto() {
    autoTimer = setInterval(next, 3800);
  }
  function stopAuto() { clearInterval(autoTimer); }

  // Touch/swipe
  let touchStartX = 0;
  track.addEventListener('touchstart', function (e) {
    touchStartX = e.changedTouches[0].clientX;
    stopAuto();
  }, { passive: true });
  track.addEventListener('touchend', function (e) {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) { diff > 0 ? next() : prev(); }
    startAuto();
  }, { passive: true });

  prevBtn.addEventListener('click', function () { stopAuto(); prev(); startAuto(); });
  nextBtn.addEventListener('click', function () { stopAuto(); next(); startAuto(); });

  // Pause on hover
  track.parentElement.addEventListener('mouseenter', stopAuto);
  track.parentElement.addEventListener('mouseleave', startAuto);

  // Resize
  let resizeTimer;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      perView = getPerView();
      setSlideWidths();
      buildDots();
      goTo(0);
    }, 200);
  });

  // Init
  setSlideWidths();
  buildDots();
  goTo(0);
  startAuto();
})();

/* ── FALLBACK para imagens da galeria ──────────────────── */
function handleGalleryError(img, label) {
  // Cria um placeholder rosa elegante quando a imagem não carrega
  const colors = [
    ['#F9C5D5', '#E07898'],
    ['#FFE8EF', '#C8507A'],
    ['#F0A0BC', '#A83060'],
    ['#FFF0F4', '#D4789A'],
    ['#F9C5D5', '#C8507A'],
    ['#FFE8EF', '#E07898'],
    ['#F0A0BC', '#C8507A'],
    ['#FFF0F4', '#A83060'],
  ];
  const card  = img.closest('.gallery-card');
  const idx   = Array.from(card.closest('.gallery-slide').parentElement.children).indexOf(card.closest('.gallery-slide'));
  const pair  = colors[idx % colors.length];

  const placeholder = document.createElement('div');
  placeholder.style.cssText = [
    'width:100%', 'height:100%',
    'background: linear-gradient(135deg,' + pair[0] + ' 0%,' + pair[1] + ' 100%)',
    'display:flex', 'flex-direction:column',
    'align-items:center', 'justify-content:center',
    'gap:0.75rem', 'border-radius:inherit',
  ].join(';');

  const icon = document.createElement('span');
  icon.textContent = ['💅','💎','🌸','🎨','🛁','✨','💖','👣'][idx % 8];
  icon.style.cssText = 'font-size:2.5rem;filter:drop-shadow(0 2px 6px rgba(0,0,0,0.15))';

  const text = document.createElement('span');
  text.textContent = label || 'Karina Bianca Studio';
  text.style.cssText = 'font-size:0.88rem;font-weight:600;color:#fff;letter-spacing:0.06em;text-transform:uppercase;text-shadow:0 1px 4px rgba(0,0,0,0.2)';

  placeholder.appendChild(icon);
  placeholder.appendChild(text);
  img.parentNode.replaceChild(placeholder, img);
}

/* ── 7. SMOOTH SCROLL para âncoras ────────────────────── */
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      const target = document.querySelector(targetId);
      if (!target) return;
      e.preventDefault();
      const navH = navbar ? navbar.offsetHeight : 80;
      const top  = target.getBoundingClientRect().top + window.scrollY - navH - 16;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });


  /* ── 7. TELEFONE MASK ──────────────────────────────────── */
  const telInput = document.getElementById('telefone');
  if (telInput) {
    telInput.addEventListener('input', function () {
      let v = this.value.replace(/\D/g, '').slice(0, 11);
      if (v.length > 6) {
        v = '(' + v.slice(0,2) + ') ' + v.slice(2,7) + '-' + v.slice(7);
      } else if (v.length > 2) {
        v = '(' + v.slice(0,2) + ') ' + v.slice(2);
      } else if (v.length > 0) {
        v = '(' + v;
      }
      this.value = v;
    });
  }

})();
