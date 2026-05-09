(function () {
  const STORES_KEY = "dexiRoomStores";
  const ACTIVE_STORE_KEY = "dexiRoomActiveStore";

  const defaultStores = [
    {
      id: "store-demo",
      name: "Ornek Mobilya Magazasi",
      products: [
        { id: "koltuk", name: "Uc'lu Koltuk", width: 2.2, depth: 0.9, icon: "K" },
        { id: "berjer", name: "Berjer", width: 0.8, depth: 0.85, icon: "B" },
        { id: "sehpa", name: "Orta Sehpa", width: 1.1, depth: 0.6, icon: "S" },
        { id: "tv", name: "TV Unitesi", width: 1.8, depth: 0.45, icon: "T" },
        { id: "masa", name: "Yemek Masasi", width: 1.6, depth: 0.9, icon: "M" },
        { id: "dolap", name: "Vitrin Dolap", width: 1.2, depth: 0.55, icon: "D" },
      ],
      devices: [
        {
          id: "device-demo",
          name: "Magaza Tableti",
          code: "DR-1042",
          connected: true,
          lastSeen: "Bugun aktif",
        },
      ],
    },
  ];

  const clone = (value) => JSON.parse(JSON.stringify(value));

  const createId = (prefix) =>
    `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;

  const normalizeProduct = (product, index) => {
    const name = String(product.name || product.urun || product.title || `Urun ${index + 1}`).trim();
    const width = Number(product.width || product.genislik || product.en || 1);
    const depth = Number(product.depth || product.derinlik || product.boy || 1);
    const icon = String(product.icon || name.charAt(0) || "U").trim().charAt(0).toUpperCase();

    return {
      id: String(product.id || createId("product")),
      name,
      width: Number.isFinite(width) && width > 0 ? width : 1,
      depth: Number.isFinite(depth) && depth > 0 ? depth : 1,
      icon,
    };
  };

  const normalizeStore = (store, index) => ({
    id: String(store.id || createId("store")),
    name: String(store.name || store.magaza || `Magaza ${index + 1}`).trim(),
    products: Array.isArray(store.products)
      ? store.products.map((product, productIndex) => normalizeProduct(product, productIndex))
      : [],
    devices: Array.isArray(store.devices)
      ? store.devices.map((device) => ({
          id: String(device.id || createId("device")),
          name: String(device.name || "Yetkili cihaz").trim(),
          code: String(device.code || `DR-${Math.floor(1000 + Math.random() * 9000)}`),
          connected: Boolean(device.connected),
          lastSeen: String(device.lastSeen || "Henuz baglanmadi"),
        }))
      : [],
  });

  const saveStores = (stores) => {
    const normalizedStores = stores.map((store, index) => normalizeStore(store, index));

    localStorage.setItem(STORES_KEY, JSON.stringify(normalizedStores));
    return normalizedStores;
  };

  const loadStores = () => {
    try {
      const parsed = JSON.parse(localStorage.getItem(STORES_KEY) || "[]");

      if (Array.isArray(parsed) && parsed.length > 0) {
        return saveStores(parsed);
      }
    } catch (error) {
      console.warn("Magaza verisi okunamadi, ornek veri yukleniyor.", error);
    }

    return saveStores(clone(defaultStores));
  };

  const getActiveStoreId = () => {
    const stores = loadStores();
    const activeStoreId = localStorage.getItem(ACTIVE_STORE_KEY);
    const activeStore = stores.find((store) => store.id === activeStoreId);

    if (activeStore) {
      return activeStore.id;
    }

    localStorage.setItem(ACTIVE_STORE_KEY, stores[0].id);
    return stores[0].id;
  };

  const setActiveStoreId = (storeId) => {
    localStorage.setItem(ACTIVE_STORE_KEY, storeId);
  };

  const createDevice = (name) => ({
    id: createId("device"),
    name: String(name || "Yetkili cihaz").trim(),
    code: `DR-${Math.floor(1000 + Math.random() * 9000)}`,
    connected: true,
    lastSeen: "Simdi baglandi",
  });

  window.DexiRoomData = {
    createDevice,
    createId,
    getActiveStoreId,
    loadStores,
    normalizeProduct,
    saveStores,
    setActiveStoreId,
  };

  loadStores();
})();
