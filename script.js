/* ============================================================
   OBJET — storefront logic
   Catalog · grid rendering · product page · cart (localStorage)
   ============================================================ */

"use strict";

/* ── Catalog ─────────────────────────────────────────────── */
const PRODUCTS = [
  {
    id: "sonde-one",
    name: "Sonde One",
    category: "audio",
    price: 349,
    sku: "AU-HP-001",
    img: "assets/headphones.jpg",
    desc: "Over-ear headphones tuned for long listening, not first impressions. 40 mm biocellulose drivers, memory-foam lambskin pads, and a headband machined from a single billet of aluminium.",
    specs: { Driver: "40 mm biocellulose", Battery: "60 h, USB-C fast charge", Weight: "254 g", Codec: "LDAC · AAC · SBC", Warranty: "2 years, repair-first" }
  },
  {
    id: "meridian-watch",
    name: "Meridian H1",
    category: "wearables",
    price: 429,
    sku: "WR-SW-002",
    img: "assets/watch.jpg",
    desc: "A hybrid watch that keeps the dial analogue and the intelligence quiet. Sleep, heart and movement tracking live under a sapphire face — no screen, no notifications, no noise.",
    specs: { Case: "38 mm brushed steel", Glass: "Sapphire, anti-reflective", Battery: "30 days per charge", Water: "5 ATM", Strap: "Vegetable-tanned leather" }
  },
  {
    id: "petite-earbuds",
    name: "Petite Écoute",
    category: "audio",
    price: 189,
    sku: "AU-EB-003",
    img: "assets/earbuds.jpg",
    desc: "True wireless earbuds with adaptive noise cancellation tuned by ear, not by algorithm. The case charges wirelessly and opens with a single, satisfying detent.",
    specs: { Driver: "11 mm dynamic", ANC: "Adaptive, −38 dB", Battery: "8 h + 24 h case", Rating: "IPX5", Charge: "USB-C · Qi wireless" }
  },
  {
    id: "colonne-speaker",
    name: "Colonne 360",
    category: "audio",
    price: 259,
    sku: "AU-SP-004",
    img: "assets/speaker.jpg",
    desc: "A cylindrical loudspeaker in acoustic wool fabric. One upward-firing driver and a passive bass rail fill a room evenly — place it anywhere, it behaves the same.",
    specs: { Output: "30 W, 360° dispersion", Battery: "20 h at listening level", Finish: "Wool mesh · brass ring", Pairing: "Stereo pair capable", Weight: "1.1 kg" }
  },
  {
    id: "atelier-keyboard",
    name: "Atelier 65",
    category: "workspace",
    price: 219,
    sku: "WS-KB-005",
    img: "assets/keyboard.jpg",
    desc: "A low-profile mechanical keyboard with a brass frame and dye-sublimated PBT caps. Gasket-mounted, hot-swappable, and quiet enough for a shared studio.",
    specs: { Layout: "65%, hot-swap", Switches: "Linear, 45 g, lubed", Frame: "CNC brass, bead-blasted", Connect: "BT 5.2 · 2.4 GHz · USB-C", Keycaps: "PBT dye-sub, ivory/charcoal" }
  },
  {
    id: "veloce-drone",
    name: "Véloce Air",
    category: "photo",
    price: 549,
    sku: "PH-DR-006",
    img: "assets/drone.jpg",
    desc: "A folding camera drone under 249 g that shoots 4K/60 with a one-inch sensor look. Folds to the size of a paperback; unfolds in one motion.",
    specs: { Weight: "248 g — no licence in most regions", Video: "4K/60 HDR, 10-bit", Flight: "34 min per cell", Range: "10 km O3 link", Storage: "microSD + 8 GB internal" }
  },
  {
    id: "cadre-camera",
    name: "Cadre M",
    category: "photo",
    price: 899,
    sku: "PH-CM-007",
    img: "assets/camera.jpg",
    desc: "A fixed-lens digital rangefinder for people who prefer one good frame to a hundred guesses. Full-frame sensor, leaf shutter, and a shutter sound you will learn to love.",
    specs: { Sensor: "Full-frame 24 MP", Lens: "35 mm f/2 fixed", Shutter: "Leaf, near-silent", EVF: "5.76 M-dot OLED", Body: "Magnesium, black paint" }
  },
  {
    id: "lampe-tache",
    name: "Lampe Tâche",
    category: "workspace",
    price: 139,
    sku: "WS-LP-008",
    img: "assets/lamp.jpg",
    desc: "An articulated task lamp with a warm 2700 K LED engine and brass counterweights. Dims by touch along the arm — no buttons, no app.",
    specs: { Light: "2700 K, CRI 97", Dimming: "Touch strip, stepless", Arm: "3 pivots, brass joints", Power: "USB-C PD 20 W", Life: "50,000 h LED" }
  }
];

const CATEGORIES = { audio: "Audio", wearables: "Wearables", workspace: "Workspace", photo: "Photo" };
const FREE_SHIP = 150;
const money = n => "$" + n.toLocaleString("en-US");
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

/* ── Cart state ──────────────────────────────────────────── */
const CART_KEY = "objet_cart_v1";
let cart = [];
try { cart = JSON.parse(localStorage.getItem(CART_KEY)) || []; } catch (e) { cart = []; }

function saveCart() { localStorage.setItem(CART_KEY, JSON.stringify(cart)); }
function cartQty() { return cart.reduce((s, i) => s + i.qty, 0); }
function cartTotal() { return cart.reduce((s, i) => s + i.qty * (PRODUCTS.find(p => p.id === i.id)?.price || 0), 0); }

function addToCart(id, qty = 1) {
  const line = cart.find(i => i.id === id);
  if (line) line.qty = Math.min(line.qty + qty, 9);
  else cart.push({ id, qty });
  saveCart(); renderCart();
  const p = PRODUCTS.find(x => x.id === id);
  toast(`${p.name} — added to cart`);
}

function setQty(id, qty) {
  const line = cart.find(i => i.id === id);
  if (!line) return;
  line.qty = qty;
  if (line.qty <= 0) cart = cart.filter(i => i.id !== id);
  saveCart(); renderCart();
}

/* ── Cart rendering ──────────────────────────────────────── */
function renderCart() {
  const n = cartQty();
  $("#cartCount").textContent = `(${n})`;
  $("#drawerCount").textContent = `(${n})`;

  const box = $("#cartItems");
  if (!cart.length) {
    box.innerHTML = `<p class="drawer__empty">Your cart is empty.<br><br>Choose fewer, better things.</p>`;
  } else {
    box.innerHTML = cart.map(line => {
      const p = PRODUCTS.find(x => x.id === line.id);
      if (!p) return "";
      return `
      <div class="citem" data-id="${p.id}">
        <img src="${p.img}" alt="${p.name}">
        <div>
          <p class="citem__name">${p.name}</p>
          <span class="citem__sku">${p.sku}</span>
          <div class="qty" aria-label="Quantity for ${p.name}">
            <button type="button" data-act="dec" aria-label="Decrease quantity">−</button>
            <output>${line.qty}</output>
            <button type="button" data-act="inc" aria-label="Increase quantity">+</button>
          </div>
        </div>
        <div class="citem__right">
          <span class="citem__price">${money(p.price * line.qty)}</span>
          <button class="citem__rm" type="button" data-act="rm">Remove</button>
        </div>
      </div>`;
    }).join("");
  }

  const total = cartTotal();
  $("#cartSubtotal").textContent = money(total);

  const fill = $("#shipFill"), msg = $("#shipMsg");
  const pct = Math.min(100, Math.round((total / FREE_SHIP) * 100));
  fill.style.width = pct + "%";
  if (total >= FREE_SHIP) {
    msg.textContent = "Complimentary shipping unlocked";
    msg.classList.add("is-done");
  } else {
    msg.textContent = `${money(FREE_SHIP - total)} away from complimentary shipping`;
    msg.classList.remove("is-done");
  }
  $("#checkoutBtn").disabled = !cart.length;
  $("#checkoutBtn").style.opacity = cart.length ? 1 : 0.45;
}

/* Delegated qty / remove inside drawer */
$("#cartItems").addEventListener("click", e => {
  const btn = e.target.closest("[data-act]");
  if (!btn) return;
  const id = btn.closest(".citem").dataset.id;
  const line = cart.find(i => i.id === id);
  if (!line) return;
  if (btn.dataset.act === "inc") setQty(id, Math.min(line.qty + 1, 9));
  if (btn.dataset.act === "dec") setQty(id, line.qty - 1);
  if (btn.dataset.act === "rm") setQty(id, 0);
});

/* ── Drawer ──────────────────────────────────────────────── */
const drawer = $("#cartDrawer"), backdrop = $("#backdrop");
function openCart() {
  drawer.hidden = false; backdrop.hidden = false;
  requestAnimationFrame(() => { drawer.classList.add("is-open"); backdrop.classList.add("is-open"); });
  document.body.classList.add("is-locked");
}
function closeCart() {
  drawer.classList.remove("is-open"); backdrop.classList.remove("is-open");
  document.body.classList.remove("is-locked");
  setTimeout(() => { drawer.hidden = true; backdrop.hidden = true; }, 480);
}
$("#cartOpen").addEventListener("click", openCart);
$("#cartClose").addEventListener("click", closeCart);
backdrop.addEventListener("click", closeCart);
document.addEventListener("keydown", e => { if (e.key === "Escape" && !drawer.hidden) closeCart(); });
$("#checkoutBtn").addEventListener("click", () => {
  if (!cart.length) return;
  toast("Demo checkout — connect a payment provider to go live");
});

/* ── Toast ───────────────────────────────────────────────── */
let toastTimer;
function toast(msg) {
  const el = $("#toast");
  el.textContent = msg;
  el.classList.add("is-on");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove("is-on"), 2400);
}

/* ── Product card template ───────────────────────────────── */
function cardHTML(p) {
  return `
  <a class="card reveal" href="product.html?id=${p.id}" data-cat="${p.category}">
    <div class="card__meta">
      <div class="card__row">
        <span class="card__name">${p.name}</span>
        <span class="card__price">${money(p.price)}</span>
      </div>
      <span class="card__sku">${p.sku} — ${CATEGORIES[p.category]}</span>
    </div>
    <div class="card__figure"><img src="${p.img}" alt="${p.name}" loading="lazy"></div>
    <button class="card__quick" type="button" data-add="${p.id}" aria-label="Quick add ${p.name} to cart">+</button>
  </a>`;
}

function bindQuickAdd(scope) {
  $$("[data-add]", scope).forEach(btn => btn.addEventListener("click", e => {
    e.preventDefault(); e.stopPropagation();
    addToCart(btn.dataset.add, 1);
  }));
}

/* ── Home page ───────────────────────────────────────────── */
if (document.body.dataset.page === "home") {
  const grid = $("#productGrid");
  grid.innerHTML = PRODUCTS.map(cardHTML).join("");
  bindQuickAdd(grid);
  $("#productCount").textContent = `(${String(PRODUCTS.length).padStart(2, "0")})`;

  $$(".chip").forEach(chip => chip.addEventListener("click", () => {
    $$(".chip").forEach(c => c.classList.toggle("is-active", c === chip));
    const f = chip.dataset.filter;
    const list = f === "all" ? PRODUCTS : PRODUCTS.filter(p => p.category === f);
    grid.innerHTML = list.length ? list.map(cardHTML).join("")
      : `<p class="grid__empty">Nothing here yet.</p>`;
    bindQuickAdd(grid);
    $("#productCount").textContent = `(${String(list.length).padStart(2, "0")})`;
    requestAnimationFrame(() => $$(".card", grid).forEach(c => c.classList.add("is-in")));
  }));

  $("#newsletterForm").addEventListener("submit", e => {
    e.preventDefault();
    const input = $("#newsletterEmail");
    if (!input.value || !input.checkValidity()) { toast("Please enter a valid email"); return; }
    input.value = "";
    $("#newsletterOk").hidden = false;
  });
}

/* ── Product page ────────────────────────────────────────── */
if (document.body.dataset.page === "product") {
  const id = new URLSearchParams(location.search).get("id");
  const p = PRODUCTS.find(x => x.id === id) || PRODUCTS[0];
  document.title = `OBJET — ${p.name}`;
  let qty = 1;

  $("#pdpRoot").innerHTML = `
    <nav class="pdp__crumb" aria-label="Breadcrumb">
      <a href="index%20(1).html#shop">Shop</a> / ${CATEGORIES[p.category]} / ${p.name}
    </nav>
    <div class="pdp__gallery">
      <div class="pdp__main reveal"><img src="${p.img}" alt="${p.name}"></div>
      <div class="pdp__detail">
        <div class="pdp__zoom reveal"><img src="${p.img}" alt="${p.name} — material detail"></div>
        <div class="pdp__zoom pdp__zoom--alt reveal"><img src="${p.img}" alt="${p.name} — profile detail"></div>
      </div>
      <span class="pdp__galnote">${p.sku} — studio photography, hover to inspect</span>
    </div>
    <div class="pdp__info">
      <span class="pdp__cat">${CATEGORIES[p.category]}</span>
      <h1 class="pdp__name">${p.name}</h1>
      <p class="pdp__price">${money(p.price)}</p>
      <p class="pdp__desc">${p.desc}</p>
      <ul class="pdp__specs">
        ${Object.entries(p.specs).map(([k, v]) => `<li><span>${k}</span><span>${v}</span></li>`).join("")}
      </ul>
      <div class="pdp__buy">
        <div class="qty" aria-label="Quantity">
          <button type="button" id="qDec" aria-label="Decrease quantity">−</button>
          <output id="qOut">1</output>
          <button type="button" id="qInc" aria-label="Increase quantity">+</button>
        </div>
        <button class="btn btn--solid" id="pdpAdd" type="button">Add to cart — <span id="pdpAddPrice">${money(p.price)}</span></button>
      </div>
      <div class="pdp__acc">
        <details>
          <summary>Shipping &amp; returns</summary>
          <p>Complimentary carbon-neutral shipping over ${money(FREE_SHIP)}. Orders leave the studio within 48 hours. You have 30 days to live with the object and change your mind — returns are free and quiet.</p>
        </details>
        <details>
          <summary>Warranty &amp; repair</summary>
          <p>Two years of coverage as standard. Beyond that, we repair before we replace: spare parts are stocked for a minimum of seven years for every object in the collection.</p>
        </details>
        <details>
          <summary>In the box</summary>
          <p>The object, a braided USB-C cable where applicable, a cotton travel pouch, and a printed card explaining who made it and where. No plastic, no filler.</p>
        </details>
      </div>
    </div>`;

  const qOut = $("#qOut");
  const refresh = () => { qOut.textContent = qty; $("#pdpAddPrice").textContent = money(p.price * qty); };
  $("#qDec").addEventListener("click", () => { qty = Math.max(1, qty - 1); refresh(); });
  $("#qInc").addEventListener("click", () => { qty = Math.min(9, qty + 1); refresh(); });
  $("#pdpAdd").addEventListener("click", () => { addToCart(p.id, qty); openCart(); });

  const related = PRODUCTS.filter(x => x.id !== p.id)
    .sort((a, b) => (b.category === p.category) - (a.category === p.category))
    .slice(0, 3);
  $("#relatedGrid").innerHTML = related.map(cardHTML).join("");
  bindQuickAdd($("#relatedGrid"));
  $("#relatedCount").textContent = `(${String(related.length).padStart(2, "0")})`;
}

/* ── Chrome: marquee, header, reveals ────────────────────── */
(function marqueeLoop() {
  const track = $("#marqueeTrack");
  track.innerHTML += track.innerHTML; /* duplicate for seamless -50% loop */
})();

(function headerScroll() {
  const header = $("#header");
  let last = window.scrollY;
  window.addEventListener("scroll", () => {
    const y = window.scrollY;
    header.classList.toggle("is-hidden", y > 140 && y > last);
    last = y;
  }, { passive: true });
})();

(function reveals() {
  const io = new IntersectionObserver(entries => {
    entries.forEach(en => { if (en.isIntersecting) { en.target.classList.add("is-in"); io.unobserve(en.target); } });
  }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
  $$(".reveal").forEach(el => io.observe(el));
})();

/* ── Boot ────────────────────────────────────────────────── */
renderCart();
