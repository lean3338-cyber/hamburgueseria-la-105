/* ===== Configuración ===== */
const WHATSAPP_NUMERO = '5493764176490';

/* ===== Productos (precios de la carta) =====
   Para cambiar una foto, guardá la imagen en la carpeta img/ y poné su nombre en "img". */
const productos = [
  // Hamburguesa + papas
  { id: 1, nombre: 'Simple + Papas', categoria: 'combos', precio: 6000, emoji: '🍔',
    desc: '1 hamburguesa simple + 1 porción de papas fritas.', img: 'img/simple-papas.jpg' },
  { id: 2, nombre: 'Completa + Papas', categoria: 'combos', precio: 7000, emoji: '🍔',
    desc: '1 hamburguesa completa + 1 porción de papas fritas.', img: 'img/completa-papas.jpg' },
  { id: 3, nombre: 'Doble Carne + Papas', categoria: 'combos', precio: 8000, emoji: '🍔',
    desc: '1 hamburguesa doble carne + 1 porción de papas fritas.', img: 'img/doble-papas.jpg' },
  // Solo burger
  { id: 4, nombre: 'Hamburguesa Simple', categoria: 'solo', precio: 4000, emoji: '🍔',
    desc: 'Hamburguesa simple, sola.', img: 'img/simple.jpg' },
  { id: 5, nombre: 'Hamburguesa Completa', categoria: 'solo', precio: 5000, emoji: '🍔',
    desc: 'Hamburguesa completa, sola.', img: 'img/completa.jpg' },
  { id: 6, nombre: 'Hamburguesa Doble Carne', categoria: 'solo', precio: 6000, emoji: '🍔',
    desc: 'Hamburguesa con doble carne, sola.', img: 'img/doble.jpg' },
  { id: 7, nombre: 'Papas Fritas', categoria: 'solo', precio: 3000, emoji: '🍟',
    desc: 'Porción de papas fritas.', img: 'img/papas.jpg' },
  // Para compartir
  { id: 8, nombre: '2 Completas + Papas', categoria: 'compartir', precio: 12000, emoji: '🍔🍟',
    desc: '2 hamburguesas completas + 1 porción de papas.', img: 'img/compartir-2.jpg' },
  { id: 9, nombre: '4 Completas + 2 Papas', categoria: 'compartir', precio: 23000, emoji: '🍔🍟',
    desc: '4 hamburguesas completas + 2 porciones de papas.', img: 'img/compartir-4.jpg' },
  // Pizzas
  { id: 10, nombre: 'Pizza Muzzarella', categoria: 'pizzas', precio: 9000, emoji: '🍕',
    desc: 'Clásica pizza de muzzarella.', img: 'img/pizza-muzzarella.jpg' },
  { id: 11, nombre: 'Pizza Jamón y Queso', categoria: 'pizzas', precio: 12000, emoji: '🍕',
    desc: 'Muzzarella con jamón.', img: 'img/pizza-jamon.jpg' },
  { id: 12, nombre: 'Pizza Napolitana', categoria: 'pizzas', precio: 12000, emoji: '🍕',
    desc: 'Muzzarella con rodajas de tomate y albahaca.', img: 'img/pizza-napolitana.jpg' },
];

/* ===== Estado ===== */
let carrito = [];
try { carrito = JSON.parse(localStorage.getItem('carrito105')) || []; } catch (e) { carrito = []; }
let filtroActual = 'todas';

/* ===== Utilidades ===== */
const $ = (id) => document.getElementById(id);
const formatoPrecio = (n) => '$' + n.toLocaleString('es-AR');
const buscarProducto = (id) => productos.find((p) => p.id === id);

function mostrarToast(texto) {
  let toast = document.querySelector('.toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = texto;
  toast.classList.add('show');
  clearTimeout(toast._t);
  toast._t = setTimeout(() => toast.classList.remove('show'), 2000);
}

/* Si una foto no carga, se muestra el emoji del producto */
function manejarImagenesRotas(contenedor) {
  contenedor.querySelectorAll('img[data-emoji]').forEach((img) => {
    img.addEventListener('error', () => {
      const caja = img.parentNode;
      caja.textContent = img.dataset.emoji;
    }, { once: true });
  });
}

/* ===== Tarjetas de producto ===== */
function estrellasHTML(id) {
  const { prom, cant } = Auth.promedio(id);
  const mio = Auth.miPuntaje(id);
  const llenas = mio || Math.round(prom);
  let html = '<div class="rating" data-id="' + id + '">';
  for (let n = 1; n <= 5; n++) {
    html += `<button class="star ${n <= llenas ? 'on' : ''} ${mio ? 'mine' : ''}" data-star="${n}" aria-label="Puntuar con ${n} estrellas">★</button>`;
  }
  const texto = cant
    ? `${prom.toFixed(1)} (${cant} ${cant === 1 ? 'voto' : 'votos'})`
    : 'Sin votos';
  html += `<span class="rating-text">${texto}${mio ? ' · tu voto: ' + mio : ''}</span></div>`;
  return html;
}

function tarjetaHTML(p) {
  const fav = Auth.esFavorito(p.id);
  return `
    <article class="menu-card">
      <div class="menu-card-img">
        <img src="${p.img}" alt="${p.nombre}" loading="lazy" data-emoji="${p.emoji}">
        <button class="fav-btn ${fav ? 'active' : ''}" data-id="${p.id}"
          title="${fav ? 'Quitar de destacados' : 'Guardar en destacados'}"
          aria-label="Destacar ${p.nombre}">${fav ? '❤️' : '🤍'}</button>
      </div>
      <div class="menu-card-body">
        <h3>${p.nombre}</h3>
        <p>${p.desc}</p>
        ${estrellasHTML(p.id)}
        <div class="menu-card-footer">
          <span class="price">${formatoPrecio(p.precio)}</span>
          <button class="btn btn-primary btn-add" onclick="agregarAlCarrito(${p.id})">Agregar +</button>
        </div>
      </div>
    </article>`;
}

function renderMenu() {
  const lista = filtroActual === 'todas' ? productos : productos.filter((p) => p.categoria === filtroActual);
  const grid = $('menuGrid');
  grid.innerHTML = lista.map(tarjetaHTML).join('');
  manejarImagenesRotas(grid);
}

function renderDestacados() {
  const grid = $('favoritesGrid');
  const user = Auth.usuario();

  if (!user) {
    grid.innerHTML = `
      <div class="fav-empty">
        <p>🔒 Ingresá o registrate para guardar tus productos favoritos.</p>
        <button class="btn btn-primary" onclick="abrirAuth('Ingresá para ver tus destacados.')">Ingresar / Registrarme</button>
      </div>`;
    return;
  }
  const lista = productos.filter((p) => Auth.favoritos().includes(p.id));
  if (!lista.length) {
    grid.innerHTML = `
      <div class="fav-empty">
        <p>Todavía no guardaste destacados. Tocá el 🤍 en cualquier producto del menú.</p>
        <a href="#menu" class="btn btn-outline">Ir al menú</a>
      </div>`;
    return;
  }
  grid.innerHTML = lista.map(tarjetaHTML).join('');
  manejarImagenesRotas(grid);
}

function refrescarTodo() {
  renderMenu();
  renderDestacados();
  actualizarUsuarioUI();
}

/* Filtros */
document.querySelectorAll('.filter-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter-btn').forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');
    filtroActual = btn.dataset.filter;
    renderMenu();
  });
});

/* Clicks en corazones y estrellas (delegación de eventos) */
document.addEventListener('click', (e) => {
  const favBtn = e.target.closest('.fav-btn');
  if (favBtn) {
    if (!Auth.usuario()) return abrirAuth('Ingresá para guardar tus destacados ❤️');
    const id = Number(favBtn.dataset.id);
    Auth.toggleFavorito(id);
    mostrarToast(Auth.esFavorito(id) ? '❤️ Guardado en destacados' : 'Quitado de destacados');
    refrescarTodo();
    return;
  }
  const star = e.target.closest('.star');
  if (star) {
    if (!Auth.usuario()) return abrirAuth('Ingresá para puntuar los productos ⭐');
    const id = Number(star.closest('.rating').dataset.id);
    Auth.puntuar(id, Number(star.dataset.star));
    mostrarToast('⭐ ¡Gracias por tu puntaje!');
    refrescarTodo();
  }
});

/* ===== Cuenta ===== */
function actualizarUsuarioUI() {
  const u = Auth.usuario();
  $('userBox').classList.toggle('hidden', !u);
  $('authBtn').classList.toggle('hidden', !!u);
  if (u) $('userName').textContent = '👤 ' + u.nombre.split(' ')[0];
}

function abrirAuth(mensaje) {
  $('authHint').textContent = mensaje || 'Ingresá para guardar destacados y puntuar.';
  $('authMsg').classList.add('hidden');
  $('authBackdrop').classList.add('open');
}
function cerrarAuth() { $('authBackdrop').classList.remove('open'); }

function mostrarAuthMsg(texto) {
  const m = $('authMsg');
  m.textContent = texto;
  m.classList.remove('hidden');
}

$('authBtn').addEventListener('click', () => abrirAuth());
$('closeAuthBtn').addEventListener('click', cerrarAuth);
$('authBackdrop').addEventListener('click', (e) => { if (e.target === $('authBackdrop')) cerrarAuth(); });

document.querySelectorAll('.auth-tab').forEach((tab) => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.auth-tab').forEach((t) => t.classList.remove('active'));
    tab.classList.add('active');
    const esLogin = tab.dataset.tab === 'login';
    $('loginForm').classList.toggle('hidden', !esLogin);
    $('registerForm').classList.toggle('hidden', esLogin);
    $('authMsg').classList.add('hidden');
  });
});

$('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const r = await Auth.ingresar($('loginEmail').value, $('loginPass').value);
  if (!r.ok) return mostrarAuthMsg(r.error);
  cerrarAuth();
  e.target.reset();
  mostrarToast('¡Hola de nuevo! 👋');
  refrescarTodo();
});

$('registerForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const r = await Auth.registrar($('regName').value, $('regEmail').value, $('regPass').value);
  if (!r.ok) return mostrarAuthMsg(r.error);
  cerrarAuth();
  e.target.reset();
  mostrarToast('¡Cuenta creada! 🎉');
  refrescarTodo();
});

$('logoutBtn').addEventListener('click', () => {
  Auth.salir();
  mostrarToast('Sesión cerrada');
  refrescarTodo();
});

/* ===== Carrito ===== */
function guardarCarrito() {
  try { localStorage.setItem('carrito105', JSON.stringify(carrito)); } catch (e) {}
}

function agregarAlCarrito(id) {
  const p = buscarProducto(id);
  if (!p) return;
  const existente = carrito.find((i) => i.id === id);
  if (existente) existente.cantidad++;
  else carrito.push({ id, cantidad: 1 });
  actualizarCarrito();
  mostrarToast('✅ ' + p.nombre + ' agregado');
  const c = $('cartCount');
  c.classList.remove('bump');
  void c.offsetWidth;
  c.classList.add('bump');
}

function cambiarCantidad(id, delta) {
  const item = carrito.find((i) => i.id === id);
  if (!item) return;
  item.cantidad += delta;
  if (item.cantidad <= 0) carrito = carrito.filter((i) => i.id !== id);
  actualizarCarrito();
}

function totalCarrito() {
  return carrito.reduce((s, i) => s + buscarProducto(i.id).precio * i.cantidad, 0);
}

function actualizarCarrito() {
  guardarCarrito();
  $('cartCount').textContent = carrito.reduce((s, i) => s + i.cantidad, 0);
  $('cartTotal').textContent = formatoPrecio(totalCarrito());

  if (!carrito.length) {
    $('cartItems').innerHTML = '<p class="empty-cart-msg">Tu carrito está vacío. ¡Elegí algo rico!</p>';
    return;
  }
  $('cartItems').innerHTML = carrito.map((i) => {
    const p = buscarProducto(i.id);
    return `
      <div class="cart-item">
        <div class="cart-item-info">
          <strong>${p.nombre}</strong>
          <span>${formatoPrecio(p.precio * i.cantidad)}</span>
        </div>
        <div class="qty-controls">
          <button class="qty-btn" onclick="cambiarCantidad(${i.id}, -1)">−</button>
          <span>${i.cantidad}</span>
          <button class="qty-btn" onclick="cambiarCantidad(${i.id}, 1)">+</button>
        </div>
      </div>`;
  }).join('');
}

const abrirCarrito = () => $('cartBackdrop').classList.add('open');
const cerrarCarrito = () => $('cartBackdrop').classList.remove('open');

$('openCartBtn').addEventListener('click', abrirCarrito);
$('closeCartBtn').addEventListener('click', cerrarCarrito);
$('cartBackdrop').addEventListener('click', (e) => { if (e.target === $('cartBackdrop')) cerrarCarrito(); });
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') { cerrarCarrito(); cerrarAuth(); }
});

$('clearCartBtn').addEventListener('click', () => { carrito = []; actualizarCarrito(); });

$('checkoutWhatsappBtn').addEventListener('click', () => {
  if (!carrito.length) return mostrarToast('Tu carrito está vacío');
  let msg = '¡Hola La 105! Quiero hacer este pedido:\n\n';
  carrito.forEach((i) => {
    const p = buscarProducto(i.id);
    msg += `• ${i.cantidad} x ${p.nombre} - ${formatoPrecio(p.precio * i.cantidad)}\n`;
  });
  msg += `\n*Total: ${formatoPrecio(totalCarrito())}*`;
  window.open(`https://wa.me/${WHATSAPP_NUMERO}?text=${encodeURIComponent(msg)}`, '_blank');
});

/* ===== Navegación ===== */
window.addEventListener('scroll', () => {
  $('header').classList.toggle('scrolled', window.scrollY > 40);
});

const menuToggle = $('menuToggle');
const navLinks = $('navLinks');
menuToggle.addEventListener('click', () => {
  menuToggle.classList.toggle('open');
  navLinks.classList.toggle('open');
});
navLinks.querySelectorAll('a').forEach((a) =>
  a.addEventListener('click', () => {
    menuToggle.classList.remove('open');
    navLinks.classList.remove('open');
  })
);

/* ===== Fotos que no cargan (hero, local, cocinero) ===== */
document.querySelectorAll('.about-photo img, .gallery-item img, .hero-photo img').forEach((img) => {
  const marcarRota = () => img.parentNode.classList.add('no-photo');
  img.addEventListener('error', marcarRota, { once: true });
  if (img.complete && img.naturalWidth === 0) marcarRota();
});

/* ===== Formulario de contacto ===== */
$('contactForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const texto = `Hola! Soy ${$('name').value.trim()} (${$('phone').value.trim()}). ${$('message').value.trim()}`;
  window.open(`https://wa.me/${WHATSAPP_NUMERO}?text=${encodeURIComponent(texto)}`, '_blank');
  const fb = $('formFeedback');
  fb.textContent = '¡Gracias! Te abrimos WhatsApp para enviar tu consulta.';
  fb.classList.remove('hidden');
  e.target.reset();
  setTimeout(() => fb.classList.add('hidden'), 5000);
});

/* ===== Inicio ===== */
refrescarTodo();
actualizarCarrito();
