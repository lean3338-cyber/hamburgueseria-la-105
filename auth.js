/* ===== Cuentas, destacados y puntajes =====
   IMPORTANTE: por ahora todo se guarda en el navegador (localStorage).
   Sirve para probar y mostrar el sitio, pero cada persona ve solo sus propios datos.
   Para que las cuentas y los puntajes sean reales y compartidos, el próximo paso es
   conectar Firebase o Supabase (hay plan gratis). Este archivo está hecho para
   que solo haya que cambiar estas funciones. */
const Auth = (() => {
  const K_USERS = 'bm_usuarios';
  const K_SES = 'bm_sesion';
  const K_DATA = 'bm_datos';

  const leer = (k, def) => {
    try { return JSON.parse(localStorage.getItem(k)) || def; } catch (e) { return def; }
  };
  const guardar = (k, v) => {
    try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {}
  };

  async function hash(texto) {
    if (window.crypto && crypto.subtle) {
      const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(texto));
      return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('');
    }
    return btoa(unescape(encodeURIComponent(texto)));
  }

  const datos = () => leer(K_DATA, { favoritos: {}, puntajes: {} });

  function usuario() { return leer(K_SES, null); }

  async function registrar(nombre, email, pass) {
    email = email.trim().toLowerCase();
    const usuarios = leer(K_USERS, {});
    if (usuarios[email]) return { ok: false, error: 'Ese email ya está registrado. Probá ingresar.' };
    usuarios[email] = { nombre: nombre.trim(), pass: await hash(pass) };
    guardar(K_USERS, usuarios);
    guardar(K_SES, { email, nombre: nombre.trim() });
    return { ok: true };
  }

  async function ingresar(email, pass) {
    email = email.trim().toLowerCase();
    const u = leer(K_USERS, {})[email];
    if (!u || u.pass !== (await hash(pass))) return { ok: false, error: 'Email o contraseña incorrectos.' };
    guardar(K_SES, { email, nombre: u.nombre });
    return { ok: true };
  }

  function salir() {
    try { localStorage.removeItem(K_SES); } catch (e) {}
  }

  /* Destacados */
  function favoritos() {
    const u = usuario();
    return u ? (datos().favoritos[u.email] || []) : [];
  }
  function esFavorito(id) { return favoritos().includes(id); }
  function toggleFavorito(id) {
    const u = usuario();
    if (!u) return false;
    const d = datos();
    const lista = d.favoritos[u.email] || [];
    d.favoritos[u.email] = lista.includes(id) ? lista.filter((x) => x !== id) : [...lista, id];
    guardar(K_DATA, d);
    return true;
  }

  /* Puntajes (1 a 5, un voto por persona por producto) */
  function puntuar(id, estrellas) {
    const u = usuario();
    if (!u) return false;
    const d = datos();
    d.puntajes[id] = d.puntajes[id] || {};
    d.puntajes[id][u.email] = estrellas;
    guardar(K_DATA, d);
    return true;
  }
  function miPuntaje(id) {
    const u = usuario();
    return u ? (datos().puntajes[id] || {})[u.email] || 0 : 0;
  }
  function promedio(id) {
    const votos = Object.values(datos().puntajes[id] || {});
    if (!votos.length) return { prom: 0, cant: 0 };
    return { prom: votos.reduce((a, b) => a + b, 0) / votos.length, cant: votos.length };
  }

  return { usuario, registrar, ingresar, salir, favoritos, esFavorito, toggleFavorito, puntuar, miPuntaje, promedio };
})();
