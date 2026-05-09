const fallbackCatalog = [
  { id: "koltuk", name: "Uc'lu Koltuk", width: 2.2, depth: 0.9, icon: "K" },
  { id: "berjer", name: "Berjer", width: 0.8, depth: 0.85, icon: "B" },
  { id: "sehpa", name: "Orta Sehpa", width: 1.1, depth: 0.6, icon: "S" },
  { id: "tv", name: "TV Unitesi", width: 1.8, depth: 0.45, icon: "T" },
  { id: "masa", name: "Yemek Masasi", width: 1.6, depth: 0.9, icon: "M" },
  { id: "dolap", name: "Vitrin Dolap", width: 1.2, depth: 0.55, icon: "D" },
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

const state = {
  approved: false,
  storeId: dataStore ? dataStore.getActiveStoreId() : "fallback-store",
  room: {
    width: 4,
    depth: 3.5,
    height: 2.6,
  },
  items: [],
  dragging: null,
};

const elements = {
  approveButton: document.querySelector("[data-approve]"),
  approvalBox: document.querySelector("[data-approval-box]"),
  approvalTitle: document.querySelector("[data-approval-title]"),
  approvalText: document.querySelector("[data-approval-text]"),
  roomSection: document.querySelector("[data-room-section]"),
  catalogSection: document.querySelector("[data-catalog-section]"),
  catalogList: document.querySelector("[data-catalog-list]"),
  storeSelect: document.querySelector("[data-store-select]"),
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
  stepCards: document.querySelectorAll("[data-step-card]"),
};

const formatMeter = (value) =>
  Number(value).toLocaleString("tr-TR", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });

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

const renderStoreSelect = () => {
  const stores = getStores();

  elements.storeSelect.innerHTML = stores
    .map((store) => `<option value="${escapeHtml(store.id)}">${escapeHtml(store.name)}</option>`)
    .join("");
  elements.storeSelect.value = state.storeId;
};

const syncStoreCatalog = () => {
  const store = getActiveStore();

  catalog = store.products.length > 0 ? store.products : [...fallbackCatalog];
  renderStoreSelect();
  elements.storeHint.textContent = `${store.name} katalogunda ${catalog.length} urun var.`;
  renderCatalog();
};

const getScale = () => {
  const stageRect = elements.roomStage.getBoundingClientRect();

  return {
    x: stageRect.width / state.room.width,
    y: stageRect.height / state.room.depth,
  };
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

const renderCatalog = () => {
  elements.catalogList.innerHTML = catalog
    .map(
      (product) => `
        <article class="catalog-item">
          <span class="catalog-thumb">${escapeHtml(product.icon)}</span>
          <div>
            <strong>${escapeHtml(product.name)}</strong>
            <small>${formatMeter(product.width)} m x ${formatMeter(product.depth)} m</small>
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
    x: Math.min(Math.max(0.2 + offset, 0), Math.max(state.room.width - product.width, 0)),
    y: Math.min(Math.max(0.2 + offset, 0), Math.max(state.room.depth - product.depth, 0)),
  });

  renderPlanner();
};

const getRect = (item) => ({
  left: item.x,
  top: item.y,
  right: item.x + item.width,
  bottom: item.y + item.depth,
});

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
    const rect = getRect(item);

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

    state.items.slice(index + 1).forEach((other) => {
      const overlap = getIntersection(rect, getRect(other));

      if (overlap) {
        conflictIds.add(item.uid);
        conflictIds.add(other.uid);
        zones.push(overlap);
      }
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
    const node = document.createElement("button");

    node.type = "button";
    node.className = "furniture-item";
    node.dataset.itemId = item.uid;
    node.style.left = `${item.x * scale.x}px`;
    node.style.top = `${item.y * scale.y}px`;
    node.style.width = `${item.width * scale.x}px`;
    node.style.height = `${item.depth * scale.y}px`;
    node.innerHTML = `<strong>${escapeHtml(item.name)}</strong><small>${formatMeter(
      item.width
    )} x ${formatMeter(item.depth)} m</small>`;
    node.classList.toggle("is-conflict", conflictIds.has(item.uid));
    node.addEventListener("pointerdown", startDrag);
    elements.roomStage.appendChild(node);
  });

  renderConflictZones(zones);
  updateFitStatus(conflictIds.size);
  setStepState();
};

const startDrag = (event) => {
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

const resetDemo = () => {
  state.approved = false;
  state.room = { width: 4, depth: 3.5, height: 2.6 };
  state.items = [];
  state.storeId = dataStore ? dataStore.getActiveStoreId() : "fallback-store";
  elements.roomForm.elements.width.value = state.room.width;
  elements.roomForm.elements.depth.value = state.room.depth;
  elements.roomForm.elements.height.value = state.room.height;
  syncStoreCatalog();
  setApproved(false);
};

elements.approveButton.addEventListener("click", () => setApproved(true));

elements.storeSelect.addEventListener("change", () => {
  state.storeId = elements.storeSelect.value;
  state.items = [];

  if (dataStore) {
    dataStore.setActiveStoreId(state.storeId);
  }

  syncStoreCatalog();
  renderPlanner();
});

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

elements.clearRoom.addEventListener("click", () => {
  state.items = [];
  renderPlanner();
});

elements.resetDemo.addEventListener("click", resetDemo);
elements.roomStage.addEventListener("pointermove", moveDrag);
elements.roomStage.addEventListener("pointerup", endDrag);
elements.roomStage.addEventListener("pointercancel", endDrag);
window.addEventListener("resize", renderPlanner);
window.addEventListener("storage", () => {
  state.storeId = dataStore ? dataStore.getActiveStoreId() : state.storeId;
  state.items = [];
  syncStoreCatalog();
  renderPlanner();
});

syncStoreCatalog();
updateRoomSummary();
setApproved(false);
