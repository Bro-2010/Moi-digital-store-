(function () {
  "use strict";

  const CART_KEY = "moi-madis-thrift-order";
  const $ = (sel) => document.querySelector(sel);

  const escapeHtml = (str) =>
    String(str).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  const money = (n) => `${SHOP.currency} ${Number(n).toFixed(2)}`;

  let activeCategory = "All";
  let searchTerm = "";
  let cart = loadCart();

  /* ---------- Cart storage ---------- */
  function loadCart() {
    try {
      const saved = JSON.parse(localStorage.getItem(CART_KEY) || "[]");
      return Array.isArray(saved) ? saved.filter((id) => PRODUCTS.some((p) => p.id === id)) : [];
    } catch (e) {
      return [];
    }
  }
  function saveCart() {
    try { localStorage.setItem(CART_KEY, JSON.stringify(cart)); } catch (e) { /* storage may be blocked */ }
  }

  /* ---------- Helpers ---------- */
  function productById(id) {
    return PRODUCTS.find((p) => p.id === id);
  }

  function whatsappLink(message) {
    const base = `https://wa.me/${SHOP.whatsapp}`;
    return message ? `${base}?text=${encodeURIComponent(message)}` : base;
  }

  function priceLabel(p) {
    return p.price != null ? `<span class="price">${money(p.price)}</span>` : `<span class="price ask">Ask on WhatsApp</span>`;
  }

  let toastTimer;
  function toast(msg) {
    const el = $("#toast");
    el.textContent = msg;
    el.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove("show"), 1900);
  }

  /* ---------- Shop grid ---------- */
  function categories() {
    return ["All", ...Array.from(new Set(PRODUCTS.map((p) => p.category))).sort()];
  }

  function renderChips() {
    $("#chips").innerHTML = categories()
      .map((c) => `<button class="chip${c === activeCategory ? " active" : ""}" data-cat="${escapeHtml(c)}">${escapeHtml(c)}</button>`)
      .join("");
  }

  function filtered() {
    const term = searchTerm.trim().toLowerCase();
    return PRODUCTS.filter((p) => {
      const matchCat = activeCategory === "All" || p.category === activeCategory;
      const matchText = !term || (p.name + " " + p.description + " " + p.category).toLowerCase().includes(term);
      return matchCat && matchText;
    });
  }

  function renderGrid() {
    const items = filtered();
    $("#productGrid").innerHTML = items
      .map((p, i) => {
        const inCart = cart.includes(p.id);
        return `
        <article class="card" style="animation-delay:${Math.min(i, 12) * 40}ms">
          <div class="card-media">
            <img src="${escapeHtml(p.image)}" alt="${escapeHtml(p.name)}" loading="lazy">
            <span class="card-tag">${escapeHtml(p.category)}</span>
          </div>
          <div class="card-body">
            <h3 class="card-name">${escapeHtml(p.name)}</h3>
            <p class="card-desc">${escapeHtml(p.description)}</p>
            <div class="card-foot">
              ${priceLabel(p)}
              <button class="btn btn-small ${inCart ? "btn-added" : "btn-add"}" data-add="${p.id}">
                ${inCart ? "In your order" : "Add to order"}
              </button>
            </div>
          </div>
        </article>`;
      })
      .join("");

    $("#resultCount").textContent = `${items.length} piece${items.length === 1 ? "" : "s"}`;
    $("#emptyState").hidden = items.length !== 0;
  }

  /* ---------- Order drawer ---------- */
  function renderCart() {
    const items = cart.map(productById).filter(Boolean);

    $("#cartCount").textContent = items.length;
    $("#cartEmpty").style.display = items.length ? "none" : "block";

    $("#cartList").innerHTML = items
      .map((p) => `
        <li class="cart-item">
          <img src="${escapeHtml(p.image)}" alt="">
          <div class="cart-item-info">
            <p class="cart-item-name">${escapeHtml(p.name)}</p>
            <p class="cart-item-price">${p.price != null ? money(p.price) : "Price on WhatsApp"}</p>
            <button class="remove" data-remove="${p.id}">Remove</button>
          </div>
        </li>`)
      .join("");

    const priced = items.filter((p) => p.price != null);
    const unpriced = items.length - priced.length;
    const total = priced.reduce((sum, p) => sum + Number(p.price), 0);
    let totalText = money(total);
    if (unpriced > 0) totalText += ` + ${unpriced} item${unpriced === 1 ? "" : "s"} to confirm`;
    if (!items.length) totalText = money(0);
    $("#cartTotal").textContent = totalText;

    $("#checkoutBtn").href = whatsappLink(buildOrderMessage(items));
    $("#checkoutBtn").style.display = items.length ? "inline-flex" : "none";
    $("#clearCart").style.display = items.length ? "inline-flex" : "none";
  }

  function buildOrderMessage(items) {
    if (!items.length) return "";
    const lines = items.map((p, i) => {
      const price = p.price != null ? ` - ${money(p.price)}` : "";
      return `${i + 1}. ${p.name}${price}`;
    });
    const priced = items.filter((p) => p.price != null).reduce((s, p) => s + Number(p.price), 0);
    return [
      `Hello ${SHOP.name}, I would like to order:`,
      "",
      ...lines,
      "",
      `Estimated total: ${money(priced)}${items.length !== items.filter((p) => p.price != null).length ? " (plus items to confirm)" : ""}`,
      "",
      "Please confirm availability and the total. Thank you!"
    ].join("\n");
  }

  function openCart() {
    $("#drawer").classList.add("open");
    $("#drawer").setAttribute("aria-hidden", "false");
    $("#drawerBackdrop").hidden = false;
    document.body.style.overflow = "hidden";
  }
  function closeCart() {
    $("#drawer").classList.remove("open");
    $("#drawer").setAttribute("aria-hidden", "true");
    $("#drawerBackdrop").hidden = true;
    document.body.style.overflow = "";
  }

  /* ---------- Events ---------- */
  function bindEvents() {
    $("#chips").addEventListener("click", (e) => {
      const btn = e.target.closest("[data-cat]");
      if (!btn) return;
      activeCategory = btn.dataset.cat;
      renderChips();
      renderGrid();
    });

    $("#search").addEventListener("input", (e) => {
      searchTerm = e.target.value;
      renderGrid();
    });

    $("#productGrid").addEventListener("click", (e) => {
      const btn = e.target.closest("[data-add]");
      if (!btn) return;
      const id = btn.dataset.add;
      if (cart.includes(id)) {
        openCart();
        return;
      }
      cart.push(id);
      saveCart();
      renderGrid();
      renderCart();
      toast(`${productById(id).name} added to your order`);
    });

    $("#cartList").addEventListener("click", (e) => {
      const btn = e.target.closest("[data-remove]");
      if (!btn) return;
      cart = cart.filter((id) => id !== btn.dataset.remove);
      saveCart();
      renderGrid();
      renderCart();
    });

    $("#clearCart").addEventListener("click", () => {
      cart = [];
      saveCart();
      renderGrid();
      renderCart();
    });

    $("#cartOpen").addEventListener("click", openCart);
    $("#cartClose").addEventListener("click", closeCart);
    $("#drawerBackdrop").addEventListener("click", closeCart);
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeCart(); });
  }

  /* ---------- Fill in shop details ---------- */
  function fillShopDetails() {
    document.title = `${SHOP.name} | Pre-loved Clothes in Gumani, Tamale`;
    document.querySelector(".brand-text").innerHTML = `Moi Madi's <em>Thrift</em>`;
    document.querySelector(".hero .eyebrow").textContent = SHOP.location.split(",")[0];

    const wa = whatsappLink(`Hello ${SHOP.name}, I would like to ask about your collection.`);
    $("#heroWhatsapp").href = wa;
    $("#visitWhatsapp").href = wa;
    $("#whatsappLink").href = wa;
    $("#whatsappLink").textContent = SHOP.whatsappDisplay;
    $("#locationLink").href = SHOP.mapsUrl;
    $("#locationLink").textContent = SHOP.location;
    $("#hoursText").textContent = SHOP.hours;
    $(".hero-lead").insertAdjacentHTML("afterend", "");
    $("#year").textContent = new Date().getFullYear();
  }

  function init() {
    fillShopDetails();
    renderChips();
    renderGrid();
    renderCart();
    bindEvents();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
