const fallbackCatalog = [
  {
    id: "milano-kose",
    name: "Milano Kose Takimi",
    width: 2.75,
    depth: 1.85,
    icon: "K",
    price: 68900,
    category: "Kose Takimi",
    swatch: "amber",
    shape: [
      { x: 0, y: 0, width: 2.75, depth: 0.9, label: "Oturma" },
      { x: 0, y: 0.9, width: 1.05, depth: 0.95, label: "Uzanma" },
    ],
  },
  {
    id: "luna-berjer",
    name: "Luna Berjer",
    width: 0.82,
    depth: 0.88,
    icon: "B",
    price: 12900,
    category: "Berjer",
    swatch: "green",
  },
  {
    id: "nova-sehpa",
    name: "Nova Orta Sehpa",
    width: 1.1,
    depth: 0.62,
    icon: "S",
    price: 7900,
    category: "Sehpa",
    swatch: "walnut",
  },
  {
    id: "arte-tv",
    name: "Arte TV Unitesi",
    width: 1.9,
    depth: 0.45,
    icon: "T",
    price: 18400,
    category: "TV Unitesi",
    swatch: "stone",
  },
];

const dataStore = window.DexiRoomData;
let catalog = [...fallbackCatalog];

const escapeHtml = (value) =>
  String(value).replace(/[&<>"']/g, (character) => {
    const entities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };

    return entities[character];
  });

const getStoreIdFromUrl = () => new URLSearchParams(window.location.search).get("store");

const state = {
  approved: false,
  storeId: getStoreIdFromUrl() || (dataStore ? dataStore.getActiveStoreId() : "fallback-store"),
  room: {
    width: 4,
    depth: 3.5,
    height: 2.6,
  },
  items: [],
  dragging: null,
  activeCategory: "all",
};

const elements = {
  approveButton: document.querySelector("[data-approve]"),
  approvalBox: document.querySelector("[data-approval-box]"),
  approvalTitle: document.querySelector("[data-approval-title]"),
  approvalText: document.querySelector("[data-approval-text]"),
  roomSection: document.querySelector("[data-room-section]"),
  catalogSection: document.querySelector("[data-catalog-section]"),
  catalogList: document.querySelector("[data-catalog-list]"),
  categoryFilters: document.querySelector("[data-category-filters]"),
  currentStoreName: document.querySelector("[data-current-store-name]"),
  currentStoreTitle: document.querySelector("[data-current-store-title]"),
  currentStoreGroup: document.querySelector("[data-current-store-group]"),
  storeHint: document.querySelector("[data-store-hint]"),
  roomForm: document.querySelector("[data-room-form]"),
  roomStage: document.querySelector("[data-room-stage]"),
  conflictLayer: document.querySelector("[data-conflict-layer]"),
  emptyState: document.querySelector("[data-empty-state]"),
  roomTitle: document.querySelector("[data-room-title]"),
  roomArea: document.querySelector("[data-room-area]"),
  roomHeight: document.querySelector("[data-room-height]"),
  fitStatus: document.querySelector("[data-fit-status]"),
  clearRoom: document.querySelector("[data-clear-room]"),
  resetDemo: document.querySelector("[data-reset-demo]"),
  demoLayout: document.querySelector("[data-demo-layout]"),
  quoteList: document.querySelector("[data-quote-list]"),
  quoteTotal: document.querySelector("[data-quote-total]"),
  whatsappLink: document.querySelector("[data-whatsapp-link]"),
  stepCards: document.querySelectorAll("[data-step-card]"),
};

const formatMeter = (value) =>
  Number(value).toLocaleString("tr-TR", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });

const formatCurrency = (value) =>
  Number(value || 0).toLocaleString("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 0,
  });

const getProductKind = (product) => {
  const text = `${product.id || ""} ${product.name || ""} ${product.category || ""}`.toLowerCase();

  if (text.includes("kose")) {
    return "corner";
  }

  if (text.includes("berjer")) {
    return "armchair";
  }

  if (text.includes("sehpa") || text.includes("masa")) {
    return "table";
  }

  if (text.includes("tv") || text.includes("unite")) {
    return "tv";
  }

  if (text.includes("konsol") || text.includes("dolap") || text.includes("vitrin")) {
    return "cabinet";
  }

  return "sofa";
};

const renderProductVisual = (product, size = "catalog") => `
  <span
    class="product-visual product-visual-${size}"
    data-kind="${escapeHtml(getProductKind(product))}"
    data-swatch="${escapeHtml(product.swatch || "amber")}"
    aria-hidden="true"
  >
    <i></i>
    <i></i>
    <i></i>
  </span>
`;

const getStores = () =>
  dataStore
    ? dataStore.loadStores()
    : [
        {
          id: "fallback-store",
          name: "Ornek Magaza",
          products: fallbackCatalog,
          devices: [],
        },
      ];

const getActiveStore = () => {
  const stores = getStores();
  let activeStore = stores.find((store) => store.id === state.storeId);

  if (!activeStore) {
    activeStore = stores[0];
    state.storeId = activeStore.id;
  }

  return activeStore;
};

const syncStoreCatalog = () => {
  const store = getActiveStore();

  catalog = store.products.length > 0 ? store.products : [...fallbackCatalog];
  state.activeCategory = "all";
  elements.currentStoreName.textContent = store.name;
  elements.currentStoreTitle.textContent = store.name;
  elements.currentStoreGroup.textContent = store.groupName || "Grupsuz";
  elements.storeHint.textContent = `${store.name} QR katalogunda ${catalog.length} urun var.`;
  renderCategoryFilters();
  renderCatalog();
};

const buildQuoteMessage = () => {
  const store = getActiveStore();
  const productLines = state.items
    .map(
      (item) =>
        `- ${item.name} (${formatMeter(item.width)} m x ${formatMeter(item.depth)} m) ${
          item.price ? formatCurrency(item.price) : ""
        }`
    )
    .join("\n");

  const message = [
    `Merhaba, ${store.name} katalogundan oda yerlesimi yaptim.`,
    `Oda olcum: ${formatMeter(state.room.width)} m x ${formatMeter(state.room.depth)} m, yukseklik ${formatMeter(
      state.room.height
    )} m.`,
    "Sectigim urunler:",
    productLines,
    "Bu urunler icin teklif almak istiyorum.",
  ]
    .filter(Boolean)
    .join("\n");

  return encodeURIComponent(message);
};

const getScale = () => {
  const stageRect = elements.roomStage.getBoundingClientRect();

  return {
    x: stageRect.width / state.room.width,
    y: stageRect.height / state.room.depth,
  };
};

const normalizeRotation = (angle) => ((Number(angle || 0) % 360) + 360) % 360;

const buildCornerShape = (item) => {
  const text = `${item.productId || item.id || ""} ${item.name || ""} ${item.category || ""}`.toLowerCase();

  if (!text.includes("kose")) {
    return [];
  }

  const seatDepth = Math.min(item.depth * 0.5, 0.9);
  const chaiseWidth = Math.min(item.width * 0.42, 1.1);

  return [
    { x: 0, y: 0, width: item.width, depth: seatDepth, label: "Oturma" },
    { x: 0, y: seatDepth, width: chaiseWidth, depth: item.depth - seatDepth, label: "Uzanma" },
  ].filter((part) => part.width > 0 && part.depth > 0);
};

const getBaseParts = (item) => {
  if (Array.isArray(item.shape) && item.shape.length > 0) {
    return item.shape;
  }

  const derivedShape = buildCornerShape(item);

  if (derivedShape.length > 0) {
    return derivedShape;
  }

  return [{ x: 0, y: 0, width: item.width, depth: item.depth, label: item.name }];
};

const getVisualSize = (item) => {
  const rotation = normalizeRotation(item.rotation);

  if (rotation === 90 || rotation === 270) {
    return { width: item.depth, depth: item.width };
  }

  return { width: item.width, depth: item.depth };
};

const rotateOrthogonalPart = (part, item, rotation) => {
  if (rotation === 90) {
    return {
      x: item.depth - part.y - part.depth,
      y: part.x,
      width: part.depth,
      depth: part.width,
      label: part.label,
    };
  }

  if (rotation === 180) {
    return {
      x: item.width - part.x - part.width,
      y: item.depth - part.y - part.depth,
      width: part.width,
      depth: part.depth,
      label: part.label,
    };
  }

  if (rotation === 270) {
    return {
      x: part.y,
      y: item.width - part.x - part.width,
      width: part.depth,
      depth: part.width,
      label: part.label,
    };
  }

  return part;
};

const getCollisionRects = (item) => {
  const rotation = normalizeRotation(item.rotation);

  if (rotation % 90 !== 0) {
    const radians = (rotation * Math.PI) / 180;
    const rotatedWidth =
      Math.abs(item.width * Math.cos(radians)) + Math.abs(item.depth * Math.sin(radians));
    const rotatedDepth =
      Math.abs(item.width * Math.sin(radians)) + Math.abs(item.depth * Math.cos(radians));
    const centerX = item.x + item.width / 2;
    const centerY = item.y + item.depth / 2;

    return [
      {
        left: centerX - rotatedWidth / 2,
        top: centerY - rotatedDepth / 2,
        right: centerX + rotatedWidth / 2,
        bottom: centerY + rotatedDepth / 2,
      },
    ];
  }

  return getBaseParts(item).map((part) => {
    const rotatedPart = rotateOrthogonalPart(part, item, rotation);

    return {
      left: item.x + rotatedPart.x,
      top: item.y + rotatedPart.y,
      right: item.x + rotatedPart.x + rotatedPart.width,
      bottom: item.y + rotatedPart.y + rotatedPart.depth,
      part: rotatedPart,
    };
  });
};

const setStepState = () => {
  const activeStep = !state.approved ? "approval" : state.items.length ? "layout" : "room";

  elements.stepCards.forEach((card) => {
    const step = card.dataset.stepCard;

    card.classList.toggle("is-active", step === activeStep);
    card.classList.toggle(
      "is-complete",
      (step === "approval" && state.approved) || (step === "room" && state.items.length > 0)
    );
  });
};

const updateRoomSummary = () => {
  const area = state.room.width * state.room.depth;

  elements.roomTitle.textContent = `${formatMeter(state.room.width)} m x ${formatMeter(
    state.room.depth
  )} m oda`;
  elements.roomArea.textContent = `${formatMeter(area)} m2`;
  elements.roomHeight.textContent = `${formatMeter(state.room.height)} m`;
};

const setApproved = (approved) => {
  state.approved = approved;
  elements.approvalBox.classList.toggle("is-approved", approved);
  elements.roomSection.classList.toggle("is-disabled", !approved);
  elements.catalogSection.classList.toggle("is-disabled", !approved);
  elements.approveButton.disabled = approved;
  elements.approvalTitle.textContent = approved ? "Musteri onaylandi" : "Onay bekleniyor";
  elements.approvalText.textContent = approved
    ? "Oda olcusu ve katalog kullanima acildi."
    : "Musterinin QR oturumu aktif.";

  setStepState();
  renderPlanner();
};

const renderCategoryFilters = () => {
  const categories = ["all", ...new Set(catalog.map((product) => product.category || "Mobilya"))];

  elements.categoryFilters.innerHTML = categories
    .map((category) => {
      const label = category === "all" ? "Tum urunler" : category;

      return `
        <button
          class="${state.activeCategory === category ? "is-active" : ""}"
          type="button"
          data-category-filter="${escapeHtml(category)}"
        >
          ${escapeHtml(label)}
        </button>
      `;
    })
    .join("");
};

const renderCatalog = () => {
  const visibleProducts =
    state.activeCategory === "all"
      ? catalog
      : catalog.filter((product) => (product.category || "Mobilya") === state.activeCategory);

  elements.catalogList.innerHTML = visibleProducts
    .map(
      (product) => `
        <article class="catalog-item">
          ${renderProductVisual(product)}
          <div>
            <strong>${escapeHtml(product.name)}</strong>
            <small>${formatMeter(product.width)} m x ${formatMeter(product.depth)} m</small>
            <div class="catalog-meta">
              <span>${escapeHtml(product.category || "Mobilya")}</span>
              <span>${formatCurrency(product.price)}</span>
            </div>
          </div>
          <button type="button" data-add-product="${escapeHtml(product.id)}" aria-label="${escapeHtml(
        product.name
      )} ekle">+</button>
        </article>
      `
    )
    .join("");
};

const createItem = (product) => {
  const offset = state.items.length * 0.18;

  state.items.push({
    uid: `${product.id}-${Date.now()}-${state.items.length}`,
    productId: product.id,
    name: product.name,
    width: product.width,
    depth: product.depth,
    price: product.price || 0,
    icon: product.icon || "U",
    swatch: product.swatch || "amber",
    category: product.category || "Mobilya",
    shape:
      Array.isArray(product.shape) && product.shape.length > 0
        ? product.shape
        : buildCornerShape(product),
    rotation: 0,
    x: Math.min(Math.max(0.2 + offset, 0), Math.max(state.room.width - product.width, 0)),
    y: Math.min(Math.max(0.2 + offset, 0), Math.max(state.room.depth - product.depth, 0)),
  });

  renderPlanner();
};

const getIntersection = (a, b) => {
  const left = Math.max(a.left, b.left);
  const top = Math.max(a.top, b.top);
  const right = Math.min(a.right, b.right);
  const bottom = Math.min(a.bottom, b.bottom);

  if (right <= left || bottom <= top) {
    return null;
  }

  return { left, top, width: right - left, height: bottom - top };
};

const findConflicts = () => {
  const conflictIds = new Set();
  const zones = [];
  const roomRect = {
    left: 0,
    top: 0,
    right: state.room.width,
    bottom: state.room.depth,
  };

  state.items.forEach((item, index) => {
    const itemRects = getCollisionRects(item);

    itemRects.forEach((rect) => {
      if (
        rect.left < roomRect.left ||
        rect.top < roomRect.top ||
        rect.right > roomRect.right ||
        rect.bottom > roomRect.bottom
      ) {
        conflictIds.add(item.uid);
        zones.push({
          left: Math.max(rect.left, 0),
          top: Math.max(rect.top, 0),
          width: Math.min(rect.right, roomRect.right) - Math.max(rect.left, 0),
          height: Math.min(rect.bottom, roomRect.bottom) - Math.max(rect.top, 0),
        });
      }
    });

    state.items.slice(index + 1).forEach((other) => {
      const otherRects = getCollisionRects(other);

      itemRects.forEach((rect) => {
        otherRects.forEach((otherRect) => {
          const overlap = getIntersection(rect, otherRect);

          if (overlap) {
            conflictIds.add(item.uid);
            conflictIds.add(other.uid);
            zones.push(overlap);
          }
        });
      });
    });
  });

  return { conflictIds, zones };
};

const renderConflictZones = (zones) => {
  const scale = getScale();

  elements.conflictLayer.innerHTML = "";
  zones
    .filter((zone) => zone.width > 0 && zone.height > 0)
    .forEach((zone) => {
      const marker = document.createElement("span");

      marker.className = "conflict-zone";
      marker.style.left = `${zone.left * scale.x}px`;
      marker.style.top = `${zone.top * scale.y}px`;
      marker.style.width = `${zone.width * scale.x}px`;
      marker.style.height = `${zone.height * scale.y}px`;
      elements.conflictLayer.appendChild(marker);
    });
};

const updateFitStatus = (conflictCount) => {
  elements.fitStatus.classList.remove("is-ok", "is-danger", "is-waiting");

  if (!state.approved) {
    elements.fitStatus.classList.add("is-waiting");
    elements.fitStatus.innerHTML =
      "<strong>Onay bekleniyor</strong><span>Yerlesim kontrolu henuz baslamadi.</span>";
    return;
  }

  if (!state.items.length) {
    elements.fitStatus.classList.add("is-waiting");
    elements.fitStatus.innerHTML =
      "<strong>Oda hazir</strong><span>Katalogdan urun ekleyerek yerlestirmeye baslayin.</span>";
    return;
  }

  if (conflictCount > 0) {
    elements.fitStatus.classList.add("is-danger");
    elements.fitStatus.innerHTML =
      "<strong>Sikisik veya sigmayan alan var</strong><span>Kirmizi bolgeyi acmak icin urunu surukleyin.</span>";
    return;
  }

  elements.fitStatus.classList.add("is-ok");
  elements.fitStatus.innerHTML =
    "<strong>Yerlesim uygun</strong><span>Urunler oda icinde ve birbirine temas etmiyor.</span>";
};

const renderQuote = () => {
  if (!state.items.length) {
    elements.quoteList.innerHTML = '<p class="quote-empty">Henuz urun eklenmedi.</p>';
    elements.quoteTotal.textContent = formatCurrency(0);
    elements.whatsappLink.href = "#";
    elements.whatsappLink.classList.add("is-disabled-link");
    return;
  }

  const total = state.items.reduce((sum, item) => sum + Number(item.price || 0), 0);

  elements.quoteList.innerHTML = state.items
    .map(
      (item) => `
        <article class="quote-item">
          ${renderProductVisual(item, "quote")}
          <div>
            <strong>${escapeHtml(item.name)}</strong>
            <small>${formatMeter(item.width)} m x ${formatMeter(item.depth)} m</small>
          </div>
          <strong>${formatCurrency(item.price)}</strong>
          <button type="button" data-delete-item="${escapeHtml(item.uid)}" aria-label="${escapeHtml(
        item.name
      )} tekliften sil">x</button>
        </article>
      `
    )
    .join("");
  elements.quoteTotal.textContent = formatCurrency(total);
  elements.whatsappLink.href = `https://wa.me/?text=${buildQuoteMessage()}`;
  elements.whatsappLink.classList.remove("is-disabled-link");
};

const renderFurnitureParts = (item, scale) => {
  const rotation = normalizeRotation(item.rotation);

  if (rotation % 90 !== 0) {
    return `<span class="furniture-part furniture-part-full"></span>`;
  }

  return getBaseParts(item)
    .map((part) => {
      const rotatedPart = rotateOrthogonalPart(part, item, rotation);

      return `
        <span
          class="furniture-part"
          style="
            left: ${rotatedPart.x * scale.x}px;
            top: ${rotatedPart.y * scale.y}px;
            width: ${rotatedPart.width * scale.x}px;
            height: ${rotatedPart.depth * scale.y}px;
          "
        >
          ${rotatedPart.label ? `<em>${escapeHtml(rotatedPart.label)}</em>` : ""}
        </span>
      `;
    })
    .join("");
};

const renderPlanner = () => {
  const existingItems = elements.roomStage.querySelectorAll(".furniture-item");
  existingItems.forEach((item) => item.remove());

  updateRoomSummary();
  elements.emptyState.hidden = state.approved && state.items.length > 0;
  elements.emptyState.querySelector("strong").textContent = state.approved
    ? "Katalogdan urun ekleyin."
    : "Once musteriyi onaylayin.";
  elements.emptyState.querySelector("span").textContent = state.approved
    ? "Eklenen urunleri oda icinde surukleyebilirsiniz."
    : "Sonra oda olcusunu girip katalogdan urun ekleyin.";

  const scale = getScale();
  const { conflictIds, zones } = findConflicts();

  state.items.forEach((item) => {
    const node = document.createElement("div");
    const visualSize = getVisualSize(item);
    const rotation = normalizeRotation(item.rotation);

    node.className = "furniture-item";
    node.tabIndex = 0;
    node.role = "button";
    node.setAttribute("aria-label", `${item.name} oda icinde tasinabilir urun`);
    node.dataset.itemId = item.uid;
    node.dataset.swatch = item.swatch || "amber";
    node.dataset.shape = getBaseParts(item).length > 1 ? "modular" : "single";
    node.style.left = `${item.x * scale.x}px`;
    node.style.top = `${item.y * scale.y}px`;
    node.style.width = `${visualSize.width * scale.x}px`;
    node.style.height = `${visualSize.depth * scale.y}px`;
    node.style.setProperty("--item-rotation", `${rotation % 90 === 0 ? 0 : rotation}deg`);
    node.innerHTML = `
      <div class="furniture-shape">
        ${renderFurnitureParts(item, scale)}
      </div>
      <div class="item-label">
        <strong>${escapeHtml(item.name)}</strong>
        <small>${formatMeter(item.width)} x ${formatMeter(item.depth)} m</small>
      </div>
      <div class="item-actions" aria-label="${escapeHtml(item.name)} islemleri">
        <button type="button" data-rotate-left="${escapeHtml(item.uid)}" aria-label="Sola dondur">L</button>
        <button type="button" data-rotate-right="${escapeHtml(item.uid)}" aria-label="Saga dondur">R</button>
        <button type="button" data-delete-item="${escapeHtml(item.uid)}" aria-label="Urunu sil">x</button>
      </div>
    `;
    node.classList.toggle("is-conflict", conflictIds.has(item.uid));
    node.addEventListener("pointerdown", startDrag);
    elements.roomStage.appendChild(node);
  });

  renderConflictZones(zones);
  updateFitStatus(conflictIds.size);
  renderQuote();
  setStepState();
};

const startDrag = (event) => {
  if (event.target instanceof Element && event.target.closest(".item-actions")) {
    return;
  }

  const target = event.currentTarget;
  const item = state.items.find((entry) => entry.uid === target.dataset.itemId);

  if (!item) {
    return;
  }

  const scale = getScale();
  const stageRect = elements.roomStage.getBoundingClientRect();
  const pointerX = event.clientX - stageRect.left;
  const pointerY = event.clientY - stageRect.top;

  state.dragging = {
    id: item.uid,
    offsetX: pointerX - item.x * scale.x,
    offsetY: pointerY - item.y * scale.y,
  };

  target.classList.add("is-dragging");
  target.setPointerCapture(event.pointerId);
};

const moveDrag = (event) => {
  if (!state.dragging) {
    return;
  }

  const item = state.items.find((entry) => entry.uid === state.dragging.id);

  if (!item) {
    return;
  }

  const scale = getScale();
  const stageRect = elements.roomStage.getBoundingClientRect();
  const pointerX = event.clientX - stageRect.left;
  const pointerY = event.clientY - stageRect.top;

  item.x = (pointerX - state.dragging.offsetX) / scale.x;
  item.y = (pointerY - state.dragging.offsetY) / scale.y;

  renderPlanner();
};

const endDrag = () => {
  if (!state.dragging) {
    return;
  }

  state.dragging = null;
  renderPlanner();
};

const rotateItem = (itemId, delta) => {
  const item = state.items.find((entry) => entry.uid === itemId);

  if (!item) {
    return;
  }

  item.rotation = normalizeRotation((item.rotation || 0) + delta);
  renderPlanner();
};

const deleteItem = (itemId) => {
  state.items = state.items.filter((item) => item.uid !== itemId);
  renderPlanner();
};

const loadDemoLayout = () => {
  if (dataStore && dataStore.resetDemoStores) {
    const stores = dataStore.resetDemoStores();
    state.storeId = getStoreIdFromUrl() || stores[0].id;
  }

  state.approved = true;
  state.room = { width: 4, depth: 3.5, height: 2.6 };
  elements.roomForm.elements.width.value = state.room.width;
  elements.roomForm.elements.depth.value = state.room.depth;
  elements.roomForm.elements.height.value = state.room.height;
  syncStoreCatalog();

  const byId = (id) => catalog.find((product) => product.id === id);
  const sample = [
    { product: byId("milano-kose"), x: 0.25, y: 0.25, rotation: 0 },
    { product: byId("arte-tv"), x: 1.0, y: 2.85, rotation: 0 },
    { product: byId("nova-sehpa"), x: 1.65, y: 1.72, rotation: 45 },
    { product: byId("luna-berjer"), x: 3.02, y: 1.0, rotation: 315 },
  ].filter((entry) => entry.product);

  state.items = sample.map((entry, index) => ({
    uid: `${entry.product.id}-demo-${index}`,
    productId: entry.product.id,
    name: entry.product.name,
    width: entry.product.width,
    depth: entry.product.depth,
    price: entry.product.price || 0,
    icon: entry.product.icon || "U",
    swatch: entry.product.swatch || "amber",
    category: entry.product.category || "Mobilya",
    shape:
      Array.isArray(entry.product.shape) && entry.product.shape.length > 0
        ? entry.product.shape
        : buildCornerShape(entry.product),
    rotation: entry.rotation || 0,
    x: entry.x,
    y: entry.y,
  }));

  setApproved(true);
  document.querySelector("#planner").scrollIntoView({ behavior: "smooth", block: "start" });
};

const resetDemo = () => {
  if (dataStore && dataStore.resetDemoStores) {
    const stores = dataStore.resetDemoStores();
    state.storeId = getStoreIdFromUrl() || stores[0].id;
  }

  state.approved = false;
  state.room = { width: 4, depth: 3.5, height: 2.6 };
  state.items = [];
  elements.roomForm.elements.width.value = state.room.width;
  elements.roomForm.elements.depth.value = state.room.depth;
  elements.roomForm.elements.height.value = state.room.height;
  syncStoreCatalog();
  setApproved(false);
};

elements.approveButton.addEventListener("click", () => setApproved(true));

elements.roomForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const formData = new FormData(elements.roomForm);

  state.room = {
    width: Number(formData.get("width")),
    depth: Number(formData.get("depth")),
    height: Number(formData.get("height")),
  };
  state.items = [];
  renderPlanner();
});

elements.catalogList.addEventListener("click", (event) => {
  if (!(event.target instanceof Element)) {
    return;
  }

  const button = event.target.closest("[data-add-product]");

  if (!button || !state.approved) {
    return;
  }

  const product = catalog.find((entry) => entry.id === button.dataset.addProduct);

  if (product) {
    createItem(product);
  }
});

elements.categoryFilters.addEventListener("click", (event) => {
  if (!(event.target instanceof Element)) {
    return;
  }

  const button = event.target.closest("[data-category-filter]");

  if (!button) {
    return;
  }

  state.activeCategory = button.dataset.categoryFilter || "all";
  renderCategoryFilters();
  renderCatalog();
});

elements.clearRoom.addEventListener("click", () => {
  state.items = [];
  renderPlanner();
});

elements.roomStage.addEventListener("click", (event) => {
  if (!(event.target instanceof Element)) {
    return;
  }

  const rotateLeft = event.target.closest("[data-rotate-left]");
  const rotateRight = event.target.closest("[data-rotate-right]");
  const deleteButton = event.target.closest("[data-delete-item]");

  if (rotateLeft) {
    rotateItem(rotateLeft.dataset.rotateLeft, -45);
  }

  if (rotateRight) {
    rotateItem(rotateRight.dataset.rotateRight, 45);
  }

  if (deleteButton) {
    deleteItem(deleteButton.dataset.deleteItem);
  }
});

elements.quoteList.addEventListener("click", (event) => {
  if (!(event.target instanceof Element)) {
    return;
  }

  const deleteButton = event.target.closest("[data-delete-item]");

  if (deleteButton) {
    deleteItem(deleteButton.dataset.deleteItem);
  }
});

elements.resetDemo.addEventListener("click", resetDemo);
elements.demoLayout.addEventListener("click", loadDemoLayout);
elements.roomStage.addEventListener("pointermove", moveDrag);
elements.roomStage.addEventListener("pointerup", endDrag);
elements.roomStage.addEventListener("pointercancel", endDrag);
window.addEventListener("resize", renderPlanner);
window.addEventListener("storage", () => {
  state.storeId = getStoreIdFromUrl() || (dataStore ? dataStore.getActiveStoreId() : state.storeId);
  state.items = [];
  syncStoreCatalog();
  renderPlanner();
});

syncStoreCatalog();
updateRoomSummary();
setApproved(false);
