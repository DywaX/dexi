const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "dexi123";
const SESSION_KEY = "dexiRoomAdminSession";

const storeApi = window.DexiRoomData;

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
  stores: storeApi.loadStores(),
  selectedStoreId: storeApi.getActiveStoreId(),
};

const elements = {
  loginScreen: document.querySelector("[data-login-screen]"),
  loginForm: document.querySelector("[data-login-form]"),
  loginError: document.querySelector("[data-login-error]"),
  dashboard: document.querySelector("[data-dashboard]"),
  logout: document.querySelector("[data-logout]"),
  addStore: document.querySelector("[data-add-store]"),
  storeList: document.querySelector("[data-store-list]"),
  detailTitle: document.querySelector("[data-detail-title]"),
  storeName: document.querySelector("[data-store-name]"),
  storeGroup: document.querySelector("[data-store-group]"),
  storeQrLink: document.querySelector("[data-store-qr-link]"),
  openStoreLink: document.querySelector("[data-open-store-link]"),
  catalogFile: document.querySelector("[data-catalog-file]"),
  importStatus: document.querySelector("[data-import-status]"),
  productRows: document.querySelector("[data-product-rows]"),
  addProduct: document.querySelector("[data-add-product]"),
  deleteStore: document.querySelector("[data-delete-store]"),
  deviceName: document.querySelector("[data-device-name]"),
  grantDevice: document.querySelector("[data-grant-device]"),
  disconnectAll: document.querySelector("[data-disconnect-all]"),
  deviceList: document.querySelector("[data-device-list]"),
  saveStore: document.querySelector("[data-save-store]"),
  saveStatus: document.querySelector("[data-save-status]"),
  storeCount: document.querySelector("[data-store-count]"),
  productCount: document.querySelector("[data-product-count]"),
  deviceCount: document.querySelector("[data-device-count]"),
  groupCount: document.querySelector("[data-group-count]"),
};

const showDashboard = () => {
  elements.loginScreen.classList.add("is-hidden");
  elements.dashboard.classList.remove("is-hidden");
  elements.logout.classList.remove("is-hidden");
  renderPanel();
  hydrateRemotePanel();
};

const showLogin = () => {
  elements.loginScreen.classList.remove("is-hidden");
  elements.dashboard.classList.add("is-hidden");
  elements.logout.classList.add("is-hidden");
};

let remoteHydrated = false;

const hydrateRemotePanel = () => {
  if (remoteHydrated || !storeApi.hydrateRemoteStores) {
    return;
  }

  remoteHydrated = true;
  storeApi
    .hydrateRemoteStores()
    .then((stores) => {
      state.stores = stores;
      state.selectedStoreId = storeApi.getActiveStoreId();
      renderPanel();
    })
    .catch((error) => {
      elements.saveStatus.textContent = "Supabase verisi yuklenemedi, yerel veri kullaniliyor.";
      console.warn("Supabase panel verisi yuklenemedi.", error);
    });
};

const getSelectedStore = () =>
  state.stores.find((store) => store.id === state.selectedStoreId) || state.stores[0];

const getStoreCustomerPath = (storeId) => `index.html?store=${encodeURIComponent(storeId)}`;

const getStoreCustomerUrl = (storeId) => {
  const url = new URL(getStoreCustomerPath(storeId), window.location.href);

  return url.href;
};

const saveStores = () => {
  state.stores = storeApi.saveStores(state.stores);
  storeApi.setActiveStoreId(state.selectedStoreId);
};

const renderStats = () => {
  const productCount = state.stores.reduce((total, store) => total + store.products.length, 0);
  const connectedDeviceCount = state.stores.reduce(
    (total, store) => total + store.devices.filter((device) => device.connected).length,
    0
  );
  const groupCount = new Set(state.stores.map((store) => store.groupName || "Grupsuz")).size;

  elements.storeCount.textContent = state.stores.length;
  elements.productCount.textContent = productCount;
  elements.deviceCount.textContent = connectedDeviceCount;
  elements.groupCount.textContent = groupCount;
};

const renderStoreList = () => {
  const storesByGroup = state.stores.reduce((groups, store) => {
    const groupName = store.groupName || "Grupsuz";

    groups[groupName] = groups[groupName] || [];
    groups[groupName].push(store);
    return groups;
  }, {});

  elements.storeList.innerHTML = Object.entries(storesByGroup)
    .map(
      ([groupName, stores]) => `
        <div class="store-group">
          <span class="store-group-title">${escapeHtml(groupName)}</span>
          ${stores
            .map(
              (store) => `
        <button
          class="store-button ${store.id === state.selectedStoreId ? "is-active" : ""}"
          type="button"
          data-select-store="${escapeHtml(store.id)}"
        >
          <strong>${escapeHtml(store.name)}</strong>
          <small>${store.products.length} urun, ${
            store.devices.filter((device) => device.connected).length
          } bagli cihaz</small>
        </button>
      `
            )
            .join("")}
        </div>
      `
    )
    .join("");
};

const getProductsFromRows = () => {
  const rows = [...elements.productRows.querySelectorAll("[data-product-row]")];
  const store = getSelectedStore();

  return rows
    .map((row, index) => {
      const existingProduct = store.products.find((product) => product.id === row.dataset.productId) || {};

      return storeApi.normalizeProduct(
        {
          ...existingProduct,
          id: row.dataset.productId,
          name: row.querySelector("[data-product-name]").value,
          width: row.querySelector("[data-product-width]").value,
          depth: row.querySelector("[data-product-depth]").value,
          icon: row.querySelector("[data-product-icon]").value,
        },
        index
      );
    })
    .filter((product) => product.name);
};

const renderProductRows = () => {
  const store = getSelectedStore();

  elements.productRows.innerHTML = store.products
    .map(
      (product) => `
        <tr data-product-row data-product-id="${escapeHtml(product.id)}">
          <td>
            <input type="text" value="${escapeHtml(product.name)}" data-product-name aria-label="Urun adi">
          </td>
          <td>
            <input type="number" value="${product.width}" min="0.1" step="0.1" data-product-width aria-label="Genislik">
          </td>
          <td>
            <input type="number" value="${product.depth}" min="0.1" step="0.1" data-product-depth aria-label="Derinlik">
          </td>
          <td>
            <input class="icon-input" type="text" value="${escapeHtml(
              product.icon
            )}" maxlength="1" data-product-icon aria-label="Ikon">
          </td>
          <td>
            <button class="row-delete" type="button" data-delete-product aria-label="Urunu sil">x</button>
          </td>
        </tr>
      `
    )
    .join("");
};

const renderDevices = () => {
  const store = getSelectedStore();

  if (!store.devices.length) {
    elements.deviceList.innerHTML = `
      <div class="device-card">
        <div>
          <strong>Henuz yetkili cihaz yok</strong>
          <small>Cihaz adi yazip "Yetki ver" tusuna basin.</small>
        </div>
      </div>
    `;
    return;
  }

  elements.deviceList.innerHTML = store.devices
    .map(
      (device) => `
        <article class="device-card">
          <div>
            <strong>${escapeHtml(device.name)}</strong>
            <small>Kod: ${escapeHtml(device.code)} - ${escapeHtml(device.lastSeen)}</small>
            <span class="device-status ${device.connected ? "is-connected" : ""}">
              ${device.connected ? "Bagli" : "Baglanti kopuk"}
            </span>
          </div>
          <div class="device-actions">
            ${
              device.connected
                ? `<button class="button button-danger-light" type="button" data-disconnect-device="${escapeHtml(
                    device.id
                  )}">Baglantiyi kopar</button>`
                : `<button class="button button-light" type="button" data-reconnect-device="${escapeHtml(
                    device.id
                  )}">Tekrar bagla</button>`
            }
            <button class="button button-light" type="button" data-remove-device="${escapeHtml(
              device.id
            )}">Kaldir</button>
          </div>
        </article>
      `
    )
    .join("");
};

const renderDetail = () => {
  const store = getSelectedStore();

  state.selectedStoreId = store.id;
  elements.detailTitle.textContent = store.name;
  elements.storeName.value = store.name;
  elements.storeGroup.value = store.groupName || "Grupsuz";
  elements.storeQrLink.textContent = getStoreCustomerUrl(store.id);
  elements.openStoreLink.href = getStoreCustomerPath(store.id);
  elements.catalogFile.value = "";
  elements.importStatus.textContent = "";
  elements.saveStatus.textContent = "";
  renderProductRows();
  renderDevices();
};

const renderPanel = () => {
  renderStats();
  renderStoreList();
  renderDetail();
};

const parseCsv = (text) => {
  const rows = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => line.split(/[;,]/).map((cell) => cell.trim()));

  if (rows.length < 2) {
    throw new Error("CSV dosyasinda baslik ve en az bir urun satiri olmali.");
  }

  const headers = rows.shift().map((header) => header.toLowerCase());

  return rows.map((cells, index) => {
    const record = {};

    headers.forEach((header, headerIndex) => {
      record[header] = cells[headerIndex];
    });

    return storeApi.normalizeProduct(record, index);
  });
};

const parseCatalogText = (text, fileName) => {
  if (fileName.toLowerCase().endsWith(".json")) {
    const parsed = JSON.parse(text);
    const products = Array.isArray(parsed) ? parsed : parsed.products;

    if (!Array.isArray(products)) {
      throw new Error("JSON dosyasinda products listesi bulunamadi.");
    }

    return products.map((product, index) => storeApi.normalizeProduct(product, index));
  }

  return parseCsv(text);
};

elements.loginForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const formData = new FormData(elements.loginForm);
  const username = String(formData.get("username") || "").trim();
  const password = String(formData.get("password") || "");

  if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
    elements.loginError.textContent = "Kullanici adi veya sifre hatali.";
    return;
  }

  sessionStorage.setItem(SESSION_KEY, "true");
  elements.loginError.textContent = "";
  showDashboard();
});

elements.logout.addEventListener("click", () => {
  sessionStorage.removeItem(SESSION_KEY);
  showLogin();
});

elements.addStore.addEventListener("click", () => {
  const newStore = {
    id: storeApi.createId("store"),
    name: `Yeni Magaza ${state.stores.length + 1}`,
    groupName: "Yeni Grup",
    products: [],
    devices: [],
  };

  state.stores.push(newStore);
  state.selectedStoreId = newStore.id;
  saveStores();
  renderPanel();
  elements.storeName.focus();
  elements.saveStatus.textContent = "Yeni magaza olusturuldu. Adini ve katalogunu duzenleyin.";
});

elements.storeList.addEventListener("click", (event) => {
  if (!(event.target instanceof Element)) {
    return;
  }

  const button = event.target.closest("[data-select-store]");

  if (!button) {
    return;
  }

  state.selectedStoreId = button.dataset.selectStore;
  storeApi.setActiveStoreId(state.selectedStoreId);
  renderPanel();
});

elements.catalogFile.addEventListener("change", async () => {
  const file = elements.catalogFile.files[0];

  if (!file) {
    return;
  }

  try {
    const products = parseCatalogText(await file.text(), file.name);
    const store = getSelectedStore();

    store.products = products;
    renderProductRows();
    elements.importStatus.textContent = `${products.length} urun katalogdan yuklendi. Kaydetmeyi unutmayin.`;
  } catch (error) {
    elements.importStatus.textContent = `Dosya okunamadi: ${error.message}`;
  }
});

elements.addProduct.addEventListener("click", () => {
  const store = getSelectedStore();

  store.products = getProductsFromRows();
  store.products.push(
    storeApi.normalizeProduct(
      {
        name: "Yeni Urun",
        width: 1,
        depth: 1,
        icon: "Y",
      },
      store.products.length
    )
  );
  renderProductRows();
});

elements.productRows.addEventListener("click", (event) => {
  if (!(event.target instanceof Element) || !event.target.matches("[data-delete-product]")) {
    return;
  }

  event.target.closest("[data-product-row]").remove();
});

elements.grantDevice.addEventListener("click", () => {
  const store = getSelectedStore();
  const name = elements.deviceName.value.trim();

  if (!name) {
    elements.saveStatus.textContent = "Yetki vermek icin cihaz adi yazin.";
    return;
  }

  store.devices.push(storeApi.createDevice(name));
  elements.deviceName.value = "";
  saveStores();
  renderPanel();
  elements.saveStatus.textContent = "Cihaza yetki verildi ve bagli olarak isaretlendi.";
});

elements.deviceList.addEventListener("click", (event) => {
  if (!(event.target instanceof Element)) {
    return;
  }

  const store = getSelectedStore();
  const disconnectButton = event.target.closest("[data-disconnect-device]");
  const reconnectButton = event.target.closest("[data-reconnect-device]");
  const removeButton = event.target.closest("[data-remove-device]");

  if (disconnectButton) {
    const device = store.devices.find((item) => item.id === disconnectButton.dataset.disconnectDevice);

    if (device) {
      device.connected = false;
      device.lastSeen = "Baglanti panelden koparildi";
      saveStores();
      renderPanel();
    }
  }

  if (reconnectButton) {
    const device = store.devices.find((item) => item.id === reconnectButton.dataset.reconnectDevice);

    if (device) {
      device.connected = true;
      device.lastSeen = "Panelden tekrar baglandi";
      saveStores();
      renderPanel();
    }
  }

  if (removeButton) {
    store.devices = store.devices.filter((item) => item.id !== removeButton.dataset.removeDevice);
    saveStores();
    renderPanel();
  }
});

elements.disconnectAll.addEventListener("click", () => {
  const store = getSelectedStore();

  store.devices = store.devices.map((device) => ({
    ...device,
    connected: false,
    lastSeen: "Toplu baglanti koparma uygulandi",
  }));
  saveStores();
  renderPanel();
  elements.saveStatus.textContent = "Bu magazadaki tum cihaz baglantilari koparildi.";
});

elements.deleteStore.addEventListener("click", () => {
  if (state.stores.length <= 1) {
    elements.saveStatus.textContent = "En az bir magaza kalmali.";
    return;
  }

  if (!window.confirm("Bu magazayi silmek istediginize emin misiniz?")) {
    return;
  }

  state.stores = state.stores.filter((store) => store.id !== state.selectedStoreId);
  if (storeApi.deleteStore) {
    storeApi.deleteStore(state.selectedStoreId).catch((error) => {
      console.warn("Supabase magaza silme islemi basarisiz.", error);
    });
  }
  state.selectedStoreId = state.stores[0].id;
  saveStores();
  renderPanel();
});

elements.saveStore.addEventListener("click", () => {
  const store = getSelectedStore();
  const name = elements.storeName.value.trim();

  if (!name) {
    elements.saveStatus.textContent = "Magaza adi bos olamaz.";
    return;
  }

  store.name = name;
  store.groupName = elements.storeGroup.value.trim() || "Grupsuz";
  store.products = getProductsFromRows();
  saveStores();
  renderPanel();
  elements.saveStatus.textContent = "Degisiklikler kaydedildi.";
});

if (sessionStorage.getItem(SESSION_KEY) === "true") {
  showDashboard();
} else {
  showLogin();
}
