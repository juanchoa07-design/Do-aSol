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
