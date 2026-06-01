/* Salma Jewelry — configuration (à personnaliser pour Salma) */
const CONFIG = {
  /** Numéro WhatsApp Salma : indicatif Maroc sans + ni espaces (ex: 212612345678) */
  whatsapp: "212647084181",
  instagram: "https://www.instagram.com/bakassi_salma",
  storageKey: "salma_jewelry_products_v2",
  /** Code secret pour afficher « Ajouter un article » — à changer par Salma */
  adminPin: "Salma&Amine",
  adminSessionKey: "salma_jewelry_admin",
  themeKey: "salma_jewelry_theme",
};

const CATEGORY_LABELS = {
  bijou: "Bijoux",
  couple: "Paquet couple",
  paquet: "Paquet & emballage",
  accessoire: "Accessoire",
};

const defaultProducts = [
  {
    id: 1,
    name: "Collier doré Cœur",
    price: 349,
    img: "https://cdn.phototourl.com/free/2026-05-23-41b69fcb-0182-4acf-961b-8735b597d8b0.jpg",
    category: "bijou",
    isNew: true,
  },
  {
    id: 2,
    name: "Bague alliance fine",
    price: 279,
    img: "https://cdn.phototourl.com/free/2026-05-23-87b2eb61-7561-4b69-881b-7bd27ac377f5.jpg",
    category: "bijou",
    isNew: false,
  },
  {
    id: 3,
    name: "Paquet Couple « Amour »",
    price: 450,
    img: "https://cdn.phototourl.com/free/2026-05-23-03f94407-e5e6-45c3-b472-298d0f707885.jpg",
    category: "couple",
    isNew: true,
  },
  {
    id: 4,
    name: "Coffret Saint-Valentin",
    price: 599,
    img: "https://cdn.phototourl.com/free/2026-05-23-4ad15cdf-2b14-4a68-abf4-48ed7fd66679.jpg",
    category: "couple",
    isNew: true,
  },
  {
    id: 5,
    name: "Boîte à bijoux velours",
    price: 199,
    img: "https://cdn.phototourl.com/free/2026-05-23-41b69fcb-0182-4acf-961b-8735b597d8b0.jpg",
    category: "paquet",
    isNew: false,
  },
  {
    id: 6,
    name: "Bracelet perles nacrées",
    price: 189,
    img: "https://cdn.phototourl.com/free/2026-05-23-87b2eb61-7561-4b69-881b-7bd27ac377f5.jpg",
    category: "bijou",
    isNew: false,
  },
  {
    id: 7,
    name: "Set Ruban & Carte cadeau",
    price: 89,
    img: "https://cdn.phototourl.com/free/2026-05-23-03f94407-e5e6-45c3-b472-298d0f707885.jpg",
    category: "paquet",
    isNew: true,
  },
  {
    id: 8,
    name: "Paquet Anniversaire doré",
    price: 380,
    img: "https://cdn.phototourl.com/free/2026-05-23-4ad15cdf-2b14-4a68-abf4-48ed7fd66679.jpg",
    category: "paquet",
    isNew: true,
  },
];

let products = [];
let cart = [];
let currentFilter = "all";
let heroIndex = 0;
let heroTimer;

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

/** Catalogue publié sur Netlify (même liste pour tous les visiteurs) */
async function fetchPublishedCatalog() {
  try {
    const res = await fetch("./products.json", { cache: "no-store" });
    if (!res.ok) throw new Error("products.json");
    const data = await res.json();
    if (Array.isArray(data)) return data;
  } catch (_) {}
  return [...defaultProducts];
}

function loadProductsFromStorage() {
  try {
    const saved = localStorage.getItem(CONFIG.storageKey);
    if (saved) return JSON.parse(saved);
  } catch (_) {}
  return null;
}

/**
 * Catalogue sur ce navigateur :
 * - localStorage (si Salma a ajouté/supprimé) = source de vérité
 * - sinon products.json (Netlify / premier visit)
 */
async function initProducts() {
  const published = await fetchPublishedCatalog();
  const saved = loadProductsFromStorage();
  products = saved !== null ? saved : published;
}

function saveProducts() {
  localStorage.setItem(CONFIG.storageKey, JSON.stringify(products));
}

function showToast(msg) {
  let el = $(".toast");
  if (!el) {
    el = document.createElement("div");
    el.className = "toast";
    document.body.appendChild(el);
  }
  el.textContent = msg;
  el.classList.add("show");
  setTimeout(() => el.classList.remove("show"), 2800);
}

/* ——— Hero slider ——— */
let heroBgTimers = [];

function resetHeroBgLayers() {
  $$(".hero__bg--multi").forEach((bg) => {
    bg.querySelectorAll(".hero__bg-layer").forEach((layer, i) => {
      layer.classList.toggle("is-active", i === 0);
    });
  });
}

function initHeroBgRotate() {
  heroBgTimers.forEach(clearInterval);
  heroBgTimers = [];

  $$(".hero__bg--multi").forEach((bg) => {
    const layers = bg.querySelectorAll(".hero__bg-layer");
    if (layers.length < 2) return;

    const interval = Number(bg.dataset.bgInterval) || 4500;
    let layerIndex = 0;

    const rotate = () => {
      const slide = bg.closest(".hero__slide");
      if (!slide?.classList.contains("is-active")) return;
      layers.forEach((l, i) => l.classList.toggle("is-active", i === layerIndex));
      layerIndex = (layerIndex + 1) % layers.length;
    };

    rotate();
    heroBgTimers.push(setInterval(rotate, interval));
  });

  initAllImageFallbacks();
}

function initHero() {
  const slides = $$(".hero__slide");
  const dotsContainer = $("#heroDots");

  slides.forEach((_, i) => {
    const dot = document.createElement("button");
    dot.type = "button";
    dot.className = "hero__dot" + (i === 0 ? " is-active" : "");
    dot.setAttribute("aria-label", `Slide ${i + 1}`);
    dot.addEventListener("click", () => goToSlide(i));
    dotsContainer.appendChild(dot);
  });

  $("#heroPrev")?.addEventListener("click", () => goToSlide(heroIndex - 1));
  $("#heroNext")?.addEventListener("click", () => goToSlide(heroIndex + 1));

  initHeroBgRotate();
  startHeroAutoplay();

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) clearInterval(heroTimer);
    else startHeroAutoplay();
  });
}

function goToSlide(index) {
  const slides = $$(".hero__slide");
  const dots = $$(".hero__dot");
  if (!slides.length) return;

  heroIndex = ((index % slides.length) + slides.length) % slides.length;

  slides.forEach((s, i) => s.classList.toggle("is-active", i === heroIndex));
  dots.forEach((d, i) => d.classList.toggle("is-active", i === heroIndex));
  resetHeroBgLayers();
}

function startHeroAutoplay() {
  clearInterval(heroTimer);
  heroTimer = setInterval(() => goToSlide(heroIndex + 1), 5000);
}

/* ——— Products ——— */
function productCardHTML(p, compact) {
  const badge = p.isNew ? '<span class="product-card__badge">Nouveau</span>' : "";
  return `
    <article class="product-card" data-id="${p.id}" data-category="${p.category}">
      <div class="product-card__img">
        ${badge}
        <span class="product-card__cat">${CATEGORY_LABELS[p.category] || p.category}</span>
        <img src="${p.img}" alt="${p.name}" loading="lazy" referrerpolicy="no-referrer" data-fallback="${typeof IMAGES !== "undefined" ? IMAGES.fallback : "https://cdn.phototourl.com/free/2026-05-23-4ad15cdf-2b14-4a68-abf4-48ed7fd66679.jpg"}">
      </div>
      <div class="product-card__body">
        <h3>${escapeHtml(p.name)}</h3>
        <p class="product-card__price">${p.price.toLocaleString("fr-MA")} DH</p>
        <div class="product-card__actions">
          <button type="button" class="btn btn--primary" data-add="${p.id}">Ajouter</button>
          <a href="${whatsappProductLink(p)}" class="btn btn--ghost" target="_blank" rel="noopener">WhatsApp</a>
        </div>
      </div>
    </article>
  `;
}

function escapeHtml(str) {
  const d = document.createElement("div");
  d.textContent = str;
  return d.innerHTML;
}

function renderProducts() {
  const grid = $("#productGrid");
  const newGrid = $("#newGrid");

  const filtered =
    currentFilter === "all"
      ? products
      : products.filter((p) => p.category === currentFilter);

  grid.innerHTML =
    filtered.length > 0
      ? filtered.map((p) => productCardHTML(p)).join("")
      : '<p style="grid-column:1/-1;text-align:center;color:var(--text-muted);">Aucun article dans cette catégorie.</p>';

  const news = products.filter((p) => p.isNew).slice(0, 4);
  newGrid.innerHTML =
    news.length > 0
      ? news.map((p) => productCardHTML(p, true)).join("")
      : '<p style="grid-column:1/-1;text-align:center;color:var(--text-muted);">Pas encore de nouveautés.</p>';

  bindProductButtons();
  observeProductCards();
  initAllImageFallbacks();
}

function getPaquetChoices() {
  return products
    .filter((p) => p.category === "paquet" || p.category === "couple")
    .map((p) => ({
      id: String(p.id),
      name: p.name,
      price: p.price,
      priceLabel: `${p.price.toLocaleString("fr-MA")} DH`,
    }));
}

function findOrderable(id) {
  const key = String(id);
  const numId = Number(key);
  return products.find((p) => p.id === numId || String(p.id) === key);
}

function paquetCardActions(id) {
  return `
    <div class="paquet-card__actions">
      <button type="button" class="btn btn--primary" data-add="${id}">Ajouter au panier</button>
      <button type="button" class="btn btn--outline" data-choose-paquet="${id}">Commander</button>
    </div>
  `;
}

function paquetCardFromProduct(p) {
  const fallback =
    typeof IMAGES !== "undefined"
      ? IMAGES.fallback
      : "https://cdn.phototourl.com/free/2026-05-23-4ad15cdf-2b14-4a68-abf4-48ed7fd66679.jpg";
  const badge = p.isNew ? '<span class="paquet-card__badge">Nouveau</span>' : "";
  return `
    <article class="paquet-card paquet-card--catalog">
      <div class="paquet-card__img">
        ${badge}
        <img src="${p.img}" alt="${escapeHtml(p.name)}" loading="lazy" data-fallback="${fallback}">
      </div>
      <div class="paquet-card__body">
        <h3>${escapeHtml(p.name)}</h3>
        <p>${escapeHtml(CATEGORY_LABELS[p.category] || "")}</p>
        <p class="paquet-card__price">${p.price.toLocaleString("fr-MA")} DH</p>
        ${paquetCardActions(p.id)}
      </div>
    </article>
  `;
}

function renderPaquetsShowcase() {
  const grid = $("#paquetsGrid");
  if (!grid) return;

  const catalogPaquets = products.filter(
    (p) => p.category === "paquet" || p.category === "couple"
  );

  grid.innerHTML = catalogPaquets.length
    ? catalogPaquets.map(paquetCardFromProduct).join("")
    : '<p class="paquets-grid__empty">Aucun paquet pour le moment — ajoutez-en depuis l’espace gestion (catégorie Paquets couple ou Paquets & emballages).</p>';

  bindProductButtons();
  bindPaquetChooseButtons();
  populateContactPaquetSelect();
  initAllImageFallbacks();
}

function bindProductButtons() {
  $$("[data-add]").forEach((btn) => {
    btn.addEventListener("click", () => addToCart(btn.dataset.add));
  });
}

function bindPaquetChooseButtons() {
  $$("[data-choose-paquet]").forEach((btn) => {
    btn.addEventListener("click", () => selectPaquetForContact(btn.dataset.choosePaquet));
  });
}

function populateContactPaquetSelect() {
  const sel = $("#contactPaquet");
  if (!sel) return;

  const current = sel.value || sessionStorage.getItem("salma_contact_paquet") || "";
  sel.innerHTML =
    '<option value="">— Sélectionnez un paquet —</option>' +
    getPaquetChoices()
      .map(
        (c) =>
          `<option value="${escapeHtml(c.id)}" data-name="${escapeHtml(c.name)}" data-price-label="${escapeHtml(c.priceLabel)}">${escapeHtml(c.name)} — ${escapeHtml(c.priceLabel)}</option>`
      )
      .join("");

  if (current) sel.value = current;
}

function selectPaquetForContact(id) {
  const sel = $("#contactPaquet");
  if (sel) sel.value = String(id);
  sessionStorage.setItem("salma_contact_paquet", String(id));
  $("#contact")?.scrollIntoView({ behavior: "smooth" });
  showToast("Paquet sélectionné — complétez le formulaire");
}

function getSelectedPaquetFromForm(fd) {
  const val = fd.get("paquet");
  if (!val) return null;
  return getPaquetChoices().find((c) => c.id === String(val)) || null;
}

function openWhatsApp(text) {
  window.open(`https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(text)}`, "_blank");
}

function observeProductCards() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) e.target.classList.add("visible");
      });
    },
    { threshold: 0.12 }
  );
  $$(".product-card").forEach((card) => observer.observe(card));
}

/* ——— Filters ——— */
function initFilters() {
  $$(".filter-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      $$(".filter-btn").forEach((b) => b.classList.remove("is-active"));
      btn.classList.add("is-active");
      currentFilter = btn.dataset.filter;
      renderProducts();
    });
  });

  $$("[data-filter]").forEach((link) => {
    if (link.tagName === "A") {
      link.addEventListener("click", (e) => {
        e.preventDefault();
        const f = link.dataset.filter;
        currentFilter = f;
        $$(".filter-btn").forEach((b) => {
          b.classList.toggle("is-active", b.dataset.filter === f);
        });
        renderProducts();
        $("#collection")?.scrollIntoView({ behavior: "smooth" });
      });
    }
  });
}

/* ——— Espace admin (caché aux clients) ——— */
/** Ouvert seulement sur cette page — après F5 il faut ressaisir le code */
let adminUnlocked = false;

function isAdminUnlocked() {
  return adminUnlocked;
}

function clearAdminSessionStorage() {
  try {
    localStorage.removeItem(CONFIG.adminSessionKey);
    sessionStorage.removeItem(CONFIG.adminSessionKey);
  } catch (_) {}
}

function setAdminVisible(visible) {
  const section = $("#admin");
  if (!section) return;
  adminUnlocked = visible;
  if (visible) {
    const stored = loadProductsFromStorage();
    if (stored !== null) {
      products = stored;
      renderProducts();
      renderPaquetsShowcase();
    }
    section.hidden = false;
    section.classList.remove("is-admin-hidden");
    section.classList.add("is-admin-visible");
    renderAdminProductList();
  } else {
    section.hidden = true;
    section.classList.add("is-admin-hidden");
    section.classList.remove("is-admin-visible");
    /* Ne pas recharger products.json : les suppressions restent en localStorage */
  }
}

function renderAdminProductList() {
  const list = $("#adminProductList");
  if (!list || !isAdminUnlocked()) return;

  if (products.length === 0) {
    list.innerHTML =
      '<li class="admin-product-item admin-product-item--empty">Aucun article pour le moment.</li>';
    return;
  }

  list.innerHTML = products
    .map(
      (p) => `
    <li class="admin-product-item">
      <img src="${p.img}" alt="" width="56" height="56" loading="lazy" data-fallback="${typeof IMAGES !== "undefined" ? IMAGES.fallback : ""}">
      <div class="admin-product-item__info">
        <strong>${escapeHtml(p.name)}</strong>
        <span>${p.price.toLocaleString("fr-MA")} DH · ${escapeHtml(CATEGORY_LABELS[p.category] || p.category)}</span>
      </div>
      <button type="button" class="btn btn--delete" data-delete="${p.id}">Supprimer</button>
    </li>
  `
    )
    .join("");

  list.querySelectorAll("[data-delete]").forEach((btn) => {
    btn.addEventListener("click", () => deleteProduct(Number(btn.dataset.delete)));
  });

  initAllImageFallbacks();
}

function deleteProduct(id) {
  const product = products.find((p) => p.id === id);
  if (!product) return;

  if (!confirm(`Supprimer « ${product.name} » du site ?`)) return;

  products = products.filter((p) => p.id !== id);
  cart = cart.filter((item) => item.id !== id);
  saveProducts();
  renderProducts();
  renderPaquetsShowcase();
  renderAdminProductList();
  updateCartUI();
  showToast("Article supprimé — enregistré sur ce navigateur");
}

function tryUnlockAdmin() {
  const pin = prompt("Code secret Salma (espace gestion) :");
  if (pin === null) return false;
  if (pin === CONFIG.adminPin) {
    setAdminVisible(true);
    showToast("Espace gestion ouvert");
    $("#admin")?.scrollIntoView({ behavior: "smooth" });
    return true;
  }
  showToast("Code incorrect");
  return false;
}

function initAdminAccess() {
  clearAdminSessionStorage();
  setAdminVisible(false);

  if (new URLSearchParams(location.search).get("gestion") === "1") {
    tryUnlockAdmin();
  }

  let logoClicks = 0;
  let logoTimer;
  document.querySelector(".logo")?.addEventListener("click", (e) => {
    if (isAdminUnlocked()) return;
    logoClicks++;
    clearTimeout(logoTimer);
    logoTimer = setTimeout(() => {
      logoClicks = 0;
    }, 2500);
    if (logoClicks >= 5) {
      logoClicks = 0;
      e.preventDefault();
      tryUnlockAdmin();
    }
  });

  $("#adminLogoutBtn")?.addEventListener("click", () => {
    setAdminVisible(false);
    showToast("Espace gestion fermé");
    $("#collection")?.scrollIntoView({ behavior: "smooth" });
  });

  $("#exportCatalogBtn")?.addEventListener("click", () => {
    const blob = new Blob([JSON.stringify(products, null, 2)], {
      type: "application/json",
    });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "products.json";
    a.click();
    URL.revokeObjectURL(a.href);
    showToast(
      "Fichier products.json téléchargé — remplace-le dans salma-jewelry/ puis republie sur Netlify"
    );
  });

  $("#importCatalogInput")?.addEventListener("change", (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result);
        if (!Array.isArray(data)) throw new Error("format");
        products = data;
        saveProducts();
        renderProducts();
        renderPaquetsShowcase();
        renderAdminProductList();
        showToast("Catalogue importé");
      } catch {
        showToast("Fichier invalide");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  });
}

/* ——— Admin form ——— */
function initAdminForm() {
  $("#addProductForm")?.addEventListener("submit", (e) => {
    e.preventDefault();

    const product = {
      id: Date.now(),
      name: $("#productName").value.trim(),
      price: Number($("#productPrice").value),
      img: $("#productImage").value.trim(),
      category: $("#productCategory").value,
      isNew: $("#productNew").checked,
    };

    products.unshift(product);
    saveProducts();
    renderProducts();
    renderPaquetsShowcase();
    renderAdminProductList();
    e.target.reset();
    $("#productNew").checked = true;

    const isPaquet =
      product.category === "paquet" || product.category === "couple";
    showToast(
      isPaquet
        ? "✨ Paquet publié — visible dans « Nos paquets & coffrets »"
        : "✨ Article publié avec succès !"
    );
    (isPaquet ? $("#paquets") : $("#collection"))?.scrollIntoView({
      behavior: "smooth",
    });
  });
}

/* ——— Cart ——— */
function addToCart(id) {
  const product = findOrderable(id);
  if (!product) return;

  const key = String(id);
  const existing = cart.find((i) => String(i.id) === key);
  if (existing) existing.qty++;
  else cart.push({ ...product, qty: 1 });

  updateCartUI();
  openCart();
  showToast(`${product.name} ajouté au panier`);
}

function updateQty(id, delta) {
  const key = String(id);
  const item = cart.find((i) => String(i.id) === key);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) cart = cart.filter((i) => String(i.id) !== key);
  updateCartUI();
}

function updateCartUI() {
  const count = cart.reduce((s, i) => s + i.qty, 0);
  $("#cartCount").textContent = count;

  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
  $("#cartTotal").textContent = `${total.toLocaleString("fr-MA")} DH`;

  const body = $("#cartBody");
  if (cart.length === 0) {
    body.innerHTML = '<p class="cart-empty">Votre panier est vide.</p>';
    return;
  }

  body.innerHTML = cart
    .map(
      (item) => `
    <div class="cart-item">
      <img src="${item.img}" alt="">
      <div>
        <h4>${escapeHtml(item.name)}</h4>
        <p class="price">${item.price} DH</p>
        <div class="qty-row">
          <button type="button" data-qty-minus="${item.id}">−</button>
          <span>${item.qty}</span>
          <button type="button" data-qty-plus="${item.id}">+</button>
        </div>
      </div>
    </div>
  `
    )
    .join("");

  body.querySelectorAll("[data-qty-minus]").forEach((b) => {
    b.addEventListener("click", () => updateQty(b.dataset.qtyMinus, -1));
  });
  body.querySelectorAll("[data-qty-plus]").forEach((b) => {
    b.addEventListener("click", () => updateQty(b.dataset.qtyPlus, 1));
  });
}

function openCart() {
  $("#cartOverlay")?.classList.add("open");
  $("#cartDrawer")?.classList.add("open");
}

function closeCart() {
  $("#cartOverlay")?.classList.remove("open");
  $("#cartDrawer")?.classList.remove("open");
}

function initCart() {
  $("#cartBtn")?.addEventListener("click", openCart);
  $("#cartClose")?.addEventListener("click", closeCart);
  $("#cartOverlay")?.addEventListener("click", closeCart);
  $("#checkoutBtn")?.addEventListener("click", checkoutWhatsApp);
}

function whatsappProductLink(p) {
  const text = `Bonjour Salma Jewelry 👋\nJe suis intéressée par : ${p.name} (${p.price} DH)`;
  return `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(text)}`;
}

function checkoutWhatsApp() {
  if (cart.length === 0) {
    showToast("Votre panier est vide");
    return;
  }

  const lines = cart.map(
    (i) => `• ${i.name} x${i.qty} — ${i.price * i.qty} DH`
  );
  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const text = encodeURIComponent(
    `Bonjour Salma Jewelry 👋\n\nMa commande :\n${lines.join("\n")}\n\nTotal : ${total} DH`
  );
  window.open(`https://wa.me/${CONFIG.whatsapp}?text=${text}`, "_blank");
}

/* ——— Contact form ——— */
function initContactForm() {
  populateContactPaquetSelect();

  $("#contactForm")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const paquet = getSelectedPaquetFromForm(fd);

    let lines = [
      "Bonjour Salma Jewelry 👋",
      "",
      `👤 Nom : ${fd.get("name")}`,
      `📞 Téléphone : ${fd.get("phone")}`,
    ];

    if (paquet) {
      lines.push("", `📦 Paquet choisi : ${paquet.name}`, `💰 Prix : ${paquet.priceLabel}`);
    }

    lines.push("", "💬 Message :", String(fd.get("message") || ""));

    openWhatsApp(lines.join("\n"));
    e.target.reset();
    sessionStorage.removeItem("salma_contact_paquet");
    populateContactPaquetSelect();
    showToast("Redirection vers WhatsApp…");
  });
}

/* ——— Thème clair / sombre ——— */
function getTheme() {
  return document.documentElement.getAttribute("data-theme") === "dark"
    ? "dark"
    : "light";
}

function setTheme(theme) {
  const next = theme === "dark" ? "dark" : "light";
  document.documentElement.setAttribute("data-theme", next);
  localStorage.setItem(CONFIG.themeKey, next);
  const btn = $("#themeToggle");
  if (btn) {
    btn.setAttribute(
      "aria-label",
      next === "dark" ? "Activer le mode clair" : "Activer le mode sombre"
    );
  }
}

function initTheme() {
  const saved = localStorage.getItem(CONFIG.themeKey);
  if (saved === "dark" || saved === "light") setTheme(saved);
  else setTheme(getTheme());

  $("#themeToggle")?.addEventListener("click", () => {
    setTheme(getTheme() === "dark" ? "light" : "dark");
    showToast(
      getTheme() === "dark" ? "Mode sombre activé" : "Mode clair activé"
    );
  });
}

/* ——— Nav & UI ——— */
function initNav() {
  const header = $(".header");
  const nav = $("#nav");
  const toggle = $("#navToggle");

  window.addEventListener("scroll", () => {
    header?.classList.toggle("is-scrolled", window.scrollY > 40);
  });

  toggle?.addEventListener("click", () => {
    const open = nav.classList.toggle("open");
    toggle.setAttribute("aria-expanded", open);
  });

  $$(".nav a").forEach((a) => {
    a.addEventListener("click", () => nav.classList.remove("open"));
  });

  const sections = $$("section[id]");
  window.addEventListener(
    "scroll",
    () => {
      let current = "";
      sections.forEach((sec) => {
        if (window.scrollY >= sec.offsetTop - 120) current = sec.id;
      });
      $$(".nav a").forEach((a) => {
        const href = a.getAttribute("href");
        a.classList.toggle("is-active", href === `#${current}`);
      });
    },
    { passive: true }
  );
}

function initReveal() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("visible");
          observer.unobserve(e.target);
        }
      });
    },
    { threshold: 0.1 }
  );
  $$(".reveal").forEach((el) => observer.observe(el));
}

function updateContactLinks() {
  document.querySelectorAll(".contact__link--wa").forEach((a) => {
    a.href = `https://wa.me/${CONFIG.whatsapp}`;
    const small = a.querySelector("small");
    if (small) small.textContent = `+${CONFIG.whatsapp.replace(/(\d{3})(\d+)/, "$1 $2")}`;
  });
  document.querySelectorAll(".contact__link--ig").forEach((a) => {
    a.href = CONFIG.instagram;
  });
}

/* ——— Boot ——— */
document.addEventListener("DOMContentLoaded", async () => {
  $("#year").textContent = new Date().getFullYear();
  if (typeof applyHeroSlideImages === "function") applyHeroSlideImages();
  if (typeof preloadHeroImages === "function") preloadHeroImages();
  if (typeof initAllImageFallbacks === "function") initAllImageFallbacks();
  initTheme();
  initHero();
  initNav();
  initAdminAccess();
  initFilters();
  initAdminForm();
  initCart();
  initContactForm();
  initReveal();
  updateContactLinks();

  await initProducts();

  renderPaquetsShowcase();
  renderProducts();
  updateCartUI();
  const savedPaquet = sessionStorage.getItem("salma_contact_paquet");
  if (savedPaquet && $("#contactPaquet")) $("#contactPaquet").value = savedPaquet;
});
