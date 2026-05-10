(function () {
  const STORES_KEY = "dexiRoomStores";
  const ACTIVE_STORE_KEY = "dexiRoomActiveStore";

  const defaultStores = [
    {
      id: "store-bellora",
      name: "Bellora Concept Demo",
      groupName: "Yilmaz Mobilya Grubu",
      products: [
        {
          id: "milano-kose",
          name: "Milano Kose Takimi",
          width: 2.75,
          depth: 1.85,
          icon: "K",
          price: 68900,
          category: "Salon",
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
          category: "Koltuk",
          swatch: "green",
        },
        {
          id: "nova-sehpa",
          name: "Nova Orta Sehpa",
          width: 1.1,
          depth: 0.62,
          icon: "S",
          price: 7900,
          category: "Tamamlayici",
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
        {
          id: "mira-masa",
          name: "Mira Yemek Masasi",
          width: 1.7,
          depth: 0.95,
          icon: "M",
          price: 24600,
          category: "Yemek Odasi",
          swatch: "oak",
        },
        {
          id: "vera-konsol",
          name: "Vera Konsol",
          width: 1.55,
          depth: 0.48,
          icon: "V",
          price: 16900,
          category: "Yemek Odasi",
          swatch: "cream",
        },
      ],
      devices: [
        {
          id: "device-demo",
          name: "Satis Tableti",
          code: "DR-1042",
          connected: true,
          lastSeen: "Bugun aktif",
        },
      ],
    },
    {
      id: "store-modern",
      name: "Modern Ev Demo",
      groupName: "Yilmaz Mobilya Grubu",
      products: [
        {
          id: "atlas-koltuk",
          name: "Atlas Uc'lu Koltuk",
          width: 2.25,
          depth: 0.92,
          icon: "A",
          price: 32900,
          category: "Koltuk",
          swatch: "blue",
        },
        {
          id: "rio-ikili",
          name: "Rio Ikili Koltuk",
          width: 1.65,
          depth: 0.88,
          icon: "R",
          price: 24900,
          category: "Koltuk",
          swatch: "gray",
        },
        {
          id: "polo-puf",
          name: "Polo Puf",
          width: 0.7,
          depth: 0.7,
          icon: "P",
          price: 5400,
          category: "Tamamlayici",
          swatch: "rose",
        },
        {
          id: "line-tv",
          name: "Line TV Sehpa",
          width: 1.6,
          depth: 0.42,
          icon: "L",
          price: 11900,
          category: "TV Unitesi",
          swatch: "black",
        },
      ],
      devices: [
        {
          id: "device-modern",
          name: "Magaza Muduru Telefonu",
          code: "DR-2088",
          connected: true,
          lastSeen: "10 dakika once aktif",
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
      price: Number(product.price || product.fiyat || 0),
      category: String(product.category || product.kategori || "Mobilya").trim(),
      swatch: String(product.swatch || product.renk || "amber").trim(),
      shape: Array.isArray(product.shape)
        ? product.shape
            .map((part) => ({
              x: Number(part.x || 0),
              y: Number(part.y || 0),
              width: Number(part.width || part.w || 0),
              depth: Number(part.depth || part.d || 0),
              label: String(part.label || "").trim(),
            }))
            .filter((part) => part.width > 0 && part.depth > 0)
        : [],
    };
  };

  const normalizeStore = (store, index) => ({
    id: String(store.id || createId("store")),
    name: String(store.name || store.magaza || `Magaza ${index + 1}`).trim(),
    groupName: String(store.groupName || store.grup || store.ownerGroup || "Grupsuz").trim(),
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

  const resetDemoStores = () => {
    const stores = saveStores(clone(defaultStores));

    localStorage.setItem(ACTIVE_STORE_KEY, stores[0].id);
    return stores;
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
    resetDemoStores,
    saveStores,
    setActiveStoreId,
  };

  loadStores();
})();
