// ── Sidebar ──────────────────────────────────────────────────
const sidebar  = document.getElementById('sidebar');
const overlay  = document.getElementById('overlay');
const btnMenu  = document.getElementById('btn-menu');
const btnClose = document.getElementById('btn-close');

function openSidebar() {
  sidebar.classList.add('open');
  overlay.classList.add('active');
  document.body.style.overflow = 'hidden';
}
function closeSidebar() {
  sidebar.classList.remove('open');
  overlay.classList.remove('active');
  document.body.style.overflow = '';
}

btnMenu.addEventListener('click', openSidebar);
btnClose.addEventListener('click', closeSidebar);
overlay.addEventListener('click', closeSidebar);

document.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', closeSidebar);
});

// ── Active nav link highlight ─────────────────────────────────
const sections = document.querySelectorAll('section[id], #hero');
const navLinks  = document.querySelectorAll('.nav-link');

function setActiveLink() {
  let current = '';
  sections.forEach(sec => {
    if (sec.getBoundingClientRect().top <= 120) {
      current = sec.getAttribute('id');
    }
  });
  navLinks.forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('href') === '#' + current) {
      link.classList.add('active');
    }
  });
}

// ── Header scroll effect ──────────────────────────────────────
const header = document.getElementById('header');
window.addEventListener('scroll', () => {
  header.classList.toggle('scrolled', window.scrollY > 40);
  setActiveLink();
});

// ── Scroll reveal animations ──────────────────────────────────
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) entry.target.classList.add('visible');
  });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

// ── Product Modal ─────────────────────────────────────────────
(function () {
  const overlay  = document.getElementById('product-modal');
  if (!overlay) return;

  const imgEl    = document.getElementById('pmodal-img');
  const nameEl   = document.getElementById('pmodal-name');
  const descEl   = document.getElementById('pmodal-desc');
  const waBtn    = document.getElementById('pmodal-wa');
  const closeBtn = overlay.querySelector('.pmodal-close');

  function openModal(name, desc, imgSrc) {
    imgEl.src        = imgSrc;
    imgEl.alt        = name;
    nameEl.textContent = name;
    descEl.textContent = desc;
    waBtn.href = `https://wa.me/59892747716?text=${encodeURIComponent(`Hola Doña Sol! 👋 Quiero comprar: *${name}*`)}`;
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    overlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  document.querySelectorAll('.product-card').forEach(card => {
    card.style.cursor = 'pointer';
    card.addEventListener('click', () => {
      const name = card.querySelector('.product-card-name').textContent.trim();
      const desc = card.querySelector('.product-card-desc').textContent.trim();
      const img  = card.querySelector('.product-card-img img').getAttribute('src');
      openModal(name, desc, img);
    });
  });

  closeBtn.addEventListener('click', closeModal);
  overlay.addEventListener('click', e => { if (e.target === overlay) closeModal(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });
})();

// ── Hero Carousel ─────────────────────────────────────────────
(function () {
  const carousel = document.getElementById('hero-carousel');
  if (!carousel) return;

  const slides = carousel.querySelectorAll('.carousel-slide');
  const dots   = carousel.querySelectorAll('.dot');
  let current  = 0;
  let animating = false;
  let timer;

  function goTo(idx, dir) {
    if (animating) return;
    const next = (idx + slides.length) % slides.length;
    if (next === current) return;
    animating = true;

    const incoming = slides[next];
    const outgoing = slides[current];

    // Position incoming off-screen in the right direction
    incoming.style.transform = dir === 'prev' ? 'translateX(-100%)' : 'translateX(100%)';
    incoming.classList.add('active');

    // Force reflow so transition plays
    incoming.getBoundingClientRect();

    // Slide both
    incoming.style.transform = 'translateX(0)';
    outgoing.style.transform = dir === 'prev' ? 'translateX(100%)' : 'translateX(-100%)';

    dots[current].classList.remove('active');
    dots[next].classList.add('active');

    setTimeout(() => {
      outgoing.classList.remove('active');
      outgoing.style.transform = '';
      incoming.style.transform = '';
      current = next;
      animating = false;
    }, 520);
  }

  function next() { goTo(current + 1, 'next'); }
  function prev() { goTo(current - 1, 'prev'); }

  function startAuto() { timer = setInterval(next, 3500); }
  function resetAuto()  { clearInterval(timer); startAuto(); }

  // Init first slide
  slides[0].style.transform = 'translateX(0)';

  carousel.querySelector('.carousel-next').addEventListener('click', () => { next(); resetAuto(); });
  carousel.querySelector('.carousel-prev').addEventListener('click', () => { prev(); resetAuto(); });
  dots.forEach(dot => dot.addEventListener('click', () => {
    const idx = +dot.dataset.idx;
    goTo(idx, idx > current ? 'next' : 'prev');
    resetAuto();
  }));

  startAuto();
})();

// ── Category filter ───────────────────────────────────────────
(function () {
  const filterBar = document.getElementById('filter-bar');
  if (!filterBar) return;

  filterBar.addEventListener('click', e => {
    const btn = e.target.closest('.tab-btn');
    if (!btn) return;

    filterBar.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const filter = btn.dataset.filter;
    document.querySelectorAll('.product-card').forEach(card => {
      const match = filter === 'todos' || card.dataset.category === filter;
      card.classList.toggle('hidden', !match);
    });
  });
})();

// ── Contact form → WhatsApp ───────────────────────────────────
function handleSubmit(e) {
  e.preventDefault();
  const nombre   = document.getElementById('nombre').value;
  const telefono = document.getElementById('telefono').value;
  const interes  = document.getElementById('interes').value;
  const mensaje  = document.getElementById('mensaje').value;

  const text = encodeURIComponent(
    `Hola Doña Sol! 👋\n` +
    `*Nombre:* ${nombre}\n` +
    (telefono ? `*Teléfono:* ${telefono}\n` : '') +
    (interes  ? `*Tipo de compra:* ${interes}\n` : '') +
    (mensaje  ? `*Mensaje:* ${mensaje}` : '')
  );

  window.open(`https://wa.me/59892747716?text=${text}`, '_blank');
}
