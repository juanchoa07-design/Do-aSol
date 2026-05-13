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

  const imgEl      = document.getElementById('pmodal-img');
  const nameEl     = document.getElementById('pmodal-name');
  const descEl     = document.getElementById('pmodal-desc');
  const volumeEl   = document.getElementById('pmodal-volume');
  const waBtn      = document.getElementById('pmodal-wa');
  const addCartBtn = document.getElementById('pmodal-add-cart');
  const closeBtn   = overlay.querySelector('.pmodal-close');

  function openModal(name, desc, imgSrc, volume, productId, price) {
    imgEl.src            = imgSrc;
    imgEl.alt            = name;
    nameEl.textContent   = name;
    descEl.textContent   = desc;
    volumeEl.textContent = volume || '';
    volumeEl.style.display = volume ? 'inline-block' : 'none';
    waBtn.href = `https://wa.me/59892747716?text=${encodeURIComponent(`Hola Doña Sol! 👋 Quiero comprar: *${name}*`)}`;
    if (addCartBtn) {
      addCartBtn.dataset.id    = productId || name.toLowerCase().replace(/\s+/g, '-');
      addCartBtn.dataset.name  = name;
      addCartBtn.dataset.price = price || '';
    }
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
      const name       = card.querySelector('.product-card-name').textContent.trim();
      const desc       = card.querySelector('.product-card-desc').textContent.trim();
      const img        = card.querySelector('.product-card-img img').getAttribute('src');
      const volEl      = card.querySelector('.product-card-volume');
      const volume     = volEl ? volEl.textContent.trim() : '';
      const productId  = card.dataset.id || '';
      const priceEl    = card.querySelector('.product-card-price');
      const price      = priceEl && priceEl.textContent.trim() ? priceEl.textContent.trim() : '';
      const sizeKey    = card.dataset.selectedSize;
      const sizeLabel  = card.dataset.selectedSizeLabel;
      const cartId     = sizeKey ? productId + '_' + sizeKey : productId;
      const modalName  = sizeLabel ? name + ' (' + sizeLabel + ')' : name;
      const modalVol   = sizeLabel || volume;
      openModal(modalName, desc, img, modalVol, cartId, price);
    });
  });

  if (addCartBtn) {
    addCartBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id    = addCartBtn.dataset.id;
      const name  = addCartBtn.dataset.name;
      const price = addCartBtn.dataset.price;
      if (window.cartAdd) window.cartAdd(id, name, price);
      closeModal();
    });
  }

  closeBtn.addEventListener('click', closeModal);
  overlay.addEventListener('click', e => { if (e.target === overlay) closeModal(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });
})();

// ── Shopping Cart ─────────────────────────────────────────────
(function () {
  const btnCart   = document.getElementById('btn-cart');
  const dropdown  = document.getElementById('cart-dropdown');
  const ddClose   = document.getElementById('cart-dd-close');
  const cartBadge = document.getElementById('cart-badge');
  const cartList  = document.getElementById('cart-items-list');
  const btnClear  = document.getElementById('btn-cart-clear');
  const btnOrder  = document.getElementById('btn-cart-order');
  if (!btnCart || !dropdown) return;

  let cart = {};
  const cardControls = {};

  function openCart()   { dropdown.classList.add('open'); }
  function closeCart()  { dropdown.classList.remove('open'); }
  function toggleCart() { dropdown.classList.toggle('open'); }

  btnCart.addEventListener('click', e => { e.stopPropagation(); toggleCart(); });
  ddClose.addEventListener('click', closeCart);

  // Use composedPath so qty-btn clicks inside cart don't re-trigger close
  // (innerHTML replacement detaches the target before bubbling reaches document)
  document.addEventListener('click', e => {
    if (!dropdown.classList.contains('open')) return;
    const path = e.composedPath ? e.composedPath() : [];
    if (!path.includes(dropdown) && !path.includes(btnCart)) closeCart();
  });

  // Inject add-btn + qty-ctrl on every product card
  document.querySelectorAll('.product-card').forEach(card => {
    const footer  = card.querySelector('.product-card-footer');
    const nameEl  = card.querySelector('.product-card-name');
    if (!footer || !nameEl) return;

    const name = nameEl.textContent.trim();
    const id   = card.dataset.id || name.toLowerCase().replace(/\s+/g, '-');

    // Round "+" add button (visible when qty = 0)
    const addBtn = document.createElement('button');
    addBtn.className = 'product-card-add-btn';
    addBtn.setAttribute('aria-label', 'Agregar al carrito');
    addBtn.textContent = '+';

    // Pill qty control (visible when qty > 0)
    const ctrl   = document.createElement('div');
    ctrl.className = 'card-qty-ctrl';

    const minBtn = document.createElement('button');
    minBtn.className = 'card-qty-ctrl-btn';
    minBtn.setAttribute('aria-label', 'Quitar uno');
    minBtn.textContent = '−';

    const numEl = document.createElement('span');
    numEl.className = 'card-qty-ctrl-num';
    numEl.textContent = '0';

    const plusBtn = document.createElement('button');
    plusBtn.className = 'card-qty-ctrl-btn';
    plusBtn.setAttribute('aria-label', 'Agregar uno más');
    plusBtn.textContent = '+';

    ctrl.append(minBtn, numEl, plusBtn);
    footer.append(addBtn, ctrl);
    cardControls[id] = { addBtn, ctrl, numEl, card };

    addBtn.addEventListener('click', e => {
      e.stopPropagation();
      const priceEl   = card.querySelector('.product-card-price');
      const price     = priceEl ? priceEl.textContent.trim() : '';
      const sizeKey   = card.dataset.selectedSize;
      const sizeLabel = card.dataset.selectedSizeLabel;
      const cartId    = sizeKey ? id + '_' + sizeKey : id;
      const cartName  = sizeLabel ? name + ' (' + sizeLabel + ')' : name;
      window.cartAdd(cartId, cartName, price);
    });

    plusBtn.addEventListener('click', e => {
      e.stopPropagation();
      const sizeKey   = card.dataset.selectedSize;
      const sizeLabel = card.dataset.selectedSizeLabel;
      const cartId    = sizeKey ? id + '_' + sizeKey : id;
      const cartName  = sizeLabel ? name + ' (' + sizeLabel + ')' : name;
      if (cart[cartId]) {
        window.cartChangeQty(cartId, 1);
      } else {
        const priceEl = card.querySelector('.product-card-price');
        window.cartAdd(cartId, cartName, priceEl ? priceEl.textContent.trim() : '');
      }
    });

    minBtn.addEventListener('click', e => {
      e.stopPropagation();
      const sizeKey = card.dataset.selectedSize;
      const cartId  = sizeKey ? id + '_' + sizeKey : id;
      window.cartChangeQty(cartId, -1);
    });
  });

  function syncCardControls() {
    Object.entries(cardControls).forEach(([id, { addBtn, ctrl, numEl, card }]) => {
      const sizeKey = card && card.dataset.selectedSize;
      const cartKey = sizeKey ? id + '_' + sizeKey : id;
      const qty = cart[cartKey] ? cart[cartKey].qty : 0;
      if (qty > 0) {
        addBtn.style.display = 'none';
        ctrl.style.display   = 'flex';
        numEl.textContent    = qty;
      } else {
        addBtn.style.display = '';
        ctrl.style.display   = 'none';
      }
    });
  }

  window.cartAdd = function(id, name, price) {
    if (!id || !name) return;
    if (cart[id]) {
      cart[id].qty++;
    } else {
      cart[id] = { name, qty: 1, price: price || '' };
    }
    render();
  };

  window.cartChangeQty = function(id, delta) {
    if (!cart[id]) return;
    cart[id].qty += delta;
    if (cart[id].qty <= 0) delete cart[id];
    render();
  };

  window.cartRemove = function(id) {
    delete cart[id];
    render();
  };

  btnClear.addEventListener('click', () => { cart = {}; render(); });

  function totalItems() {
    return Object.values(cart).reduce((s, i) => s + i.qty, 0);
  }

  function buildMessage() {
    const lines = Object.values(cart).map(i => {
      let line = `• ${i.name} x${i.qty}`;
      if (i.price) line += ` (${i.price} c/u)`;
      return line;
    });
    return `Hola Doña Sol! 👋 Me gustaría realizar el siguiente pedido:\n\n${lines.join('\n')}\n\nPor favor confirmen disponibilidad. ¡Gracias!`;
  }

  function render() {
    const ids   = Object.keys(cart);
    const total = totalItems();

    cartBadge.textContent   = total;
    cartBadge.style.display = total > 0 ? '' : 'none';
    btnClear.style.display  = ids.length ? '' : 'none';
    btnOrder.style.display  = ids.length ? '' : 'none';

    if (!ids.length) {
      cartList.innerHTML = '<p class="cart-empty">Tu carrito está vacío.</p>';
      syncCardControls();
      return;
    }

    cartList.innerHTML = ids.map(id => {
      const item      = cart[id];
      const priceHtml = item.price
        ? `<span class="cart-item-price">${item.price} c/u</span>` : '';
      return `<div class="cart-item">
        <div class="cart-item-info">
          <div class="cart-item-name">${item.name}</div>
          ${priceHtml}
        </div>
        <div class="cart-item-controls">
          <button class="cart-qty-btn" onclick="cartChangeQty('${id}',-1)">−</button>
          <span class="cart-qty-num">${item.qty}</span>
          <button class="cart-qty-btn" onclick="cartChangeQty('${id}',1)">+</button>
          <button class="cart-remove-btn" onclick="cartRemove('${id}')">✕</button>
        </div>
      </div>`;
    }).join('');

    btnOrder.href = `https://wa.me/59892747716?text=${encodeURIComponent(buildMessage())}`;
    syncCardControls();
  }

  window.syncCardControlsExternal = syncCardControls;
  render();
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

// ── Motion (Framer Motion vanilla) ───────────────────────────
(function () {
  if (!window.Motion) return;
  const { animate, hover, inView, stagger } = window.Motion;

  document.body.classList.add('motion-ready');

  const cards = [...document.querySelectorAll('.product-card')];
  const grid  = document.getElementById('products-grid');

  // Tomar control de la entrada: quitar clases CSS reveal
  cards.forEach(card => {
    card.classList.remove('reveal', 'reveal-delay-1', 'reveal-delay-2', 'reveal-delay-3', 'reveal-delay-4');
    card.style.opacity  = '0';
    card.style.transform = 'translateY(28px)';
  });

  // Entrada con stagger al hacer scroll hasta la grilla
  let entered = false;
  inView(grid || cards[0], () => {
    if (entered) return;
    entered = true;
    const visible = cards.filter(c => !c.classList.contains('hidden'));
    animate(visible,
      { opacity: 1, y: 0 },
      { delay: stagger(0.065), duration: 0.5, easing: [0.22, 1, 0.36, 1] }
    );
  });

  // Spring hover en cada tarjeta
  cards.forEach(card => {
    hover(card, () => {
      animate(card,
        { y: -8, scale: 1.025 },
        { duration: 0.35, easing: [0.34, 1.56, 0.64, 1] }
      );
      return () => animate(card,
        { y: 0, scale: 1 },
        { duration: 0.25, easing: [0.25, 0.46, 0.45, 0.94] }
      );
    });
  });
})();

// ── Size Selectors ────────────────────────────────────────────
(function () {
  function parseSizes(attr) {
    return attr.split(',').map(function(part) {
      var idx = part.indexOf('|');
      return idx >= 0
        ? { label: part.slice(0, idx), key: part.slice(idx + 1) }
        : { label: part, key: part };
    });
  }

  document.querySelectorAll('.product-card[data-sizes]').forEach(function(card) {
    var sizes   = parseSizes(card.dataset.sizes);
    var id      = card.dataset.id;
    var footer  = card.querySelector('.product-card-footer');
    var volEl   = card.querySelector('.product-card-volume');
    if (!footer) return;

    // Hide the old volume text – size buttons take its role
    if (volEl) volEl.style.display = 'none';

    // Build size button group
    var group = document.createElement('div');
    group.className = 'size-selector';

    sizes.forEach(function(s, i) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'size-btn' + (i === 0 ? ' active' : '');
      btn.textContent = s.label;

      btn.addEventListener('click', function(e) {
        e.stopPropagation();
        group.querySelectorAll('.size-btn').forEach(function(b) { b.classList.remove('active'); });
        btn.classList.add('active');
        card.dataset.selectedSize      = s.key;
        card.dataset.selectedSizeLabel = s.label;

        // Update displayed price
        if (window.preciosActuales) {
          var precio  = window.preciosActuales[id + '_' + s.key];
          var priceEl = card.querySelector('.product-card-price');
          if (priceEl) {
            priceEl.textContent = precio != null
              ? '$ ' + Math.round(Number(precio)).toLocaleString('es-UY')
              : '';
          }
        }

        // Refresh cart button state for the new size
        if (window.syncCardControlsExternal) window.syncCardControlsExternal();
      });

      group.appendChild(btn);
    });

    // Insert group before price element
    var priceEl = card.querySelector('.product-card-price');
    if (priceEl) footer.insertBefore(group, priceEl);
    else         footer.appendChild(group);

    // Set default selection
    card.dataset.selectedSize      = sizes[0].key;
    card.dataset.selectedSizeLabel = sizes[0].label;
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
