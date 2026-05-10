(function () {
  const STORES_KEY = "dexiRoomStores";
  const ACTIVE_STORE_KEY = "dexiRoomActiveStore";
  const supabaseConfig = window.DexiRoomSupabase || {};
  const supabaseUrl = supabaseConfig.url;
  const supabaseKey = supabaseConfig.anonKey;

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
        {
          id: "mira-masa",
          name: "Mira Yemek Masasi",
          width: 1.7,
          depth: 0.95,
          icon: "M",
          price: 24600,
          category: "Yemek Masasi",
          swatch: "oak",
        },
        {
          id: "vera-konsol",
          name: "Vera Konsol",
          width: 1.55,
          depth: 0.48,
          icon: "V",
          price: 16900,
          category: "Konsol",
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
          category: "3'lu Koltuk",
          swatch: "blue",
        },
        {
          id: "rio-ikili",
          name: "Rio Ikili Koltuk",
          width: 1.65,
          depth: 0.88,
          icon: "R",
          price: 24900,
          category: "2'li Koltuk",
          swatch: "gray",
        },
        {
          id: "polo-puf",
          name: "Polo Puf",
          width: 0.7,
          depth: 0.7,
          icon: "P",
          price: 5400,
          category: "Puf",
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

  const isSupabaseEnabled = () => Boolean(supabaseUrl && supabaseKey);

  const getSupabaseHeaders = (extraHeaders = {}) => ({
    apikey: supabaseKey,
    Authorization: `Bearer ${supabaseKey}`,
    "Content-Type": "application/json",
    ...extraHeaders,
  });

  const supabaseRequest = async (path, options = {}) => {
    if (!isSupabaseEnabled()) {
      return null;
    }

    const response = await fetch(`${supabaseUrl}/rest/v1/${path}`, {
      ...options,
      headers: getSupabaseHeaders(options.headers),
    });

    if (!response.ok) {
      const message = await response.text();
      throw new Error(`Supabase request failed: ${response.status} ${message}`);
    }

    if (response.status === 204) {
      return null;
    }

    return response.json();
  };

  const buildCornerShape = (product, width, depth) => {
    const text = `${product.id || ""} ${product.name || ""} ${product.category || ""}`.toLowerCase();

    if (!text.includes("kose")) {
      return [];
    }

    const seatDepth = Math.min(depth * 0.5, 0.9);
    const chaiseWidth = Math.min(width * 0.42, 1.1);

    return [
      { x: 0, y: 0, width, depth: seatDepth, label: "Oturma" },
      { x: 0, y: seatDepth, width: chaiseWidth, depth: depth - seatDepth, label: "Uzanma" },
    ].filter((part) => part.width > 0 && part.depth > 0);
  };

  const normalizeProduct = (product, index) => {
    const name = String(product.name || product.urun || product.title || `Urun ${index + 1}`).trim();
    const width = Number(product.width || product.genislik || product.en || 1);
    const depth = Number(product.depth || product.derinlik || product.boy || 1);
    const icon = String(product.icon || name.charAt(0) || "U").trim().charAt(0).toUpperCase();
    const normalizedWidth = Number.isFinite(width) && width > 0 ? width : 1;
    const normalizedDepth = Number.isFinite(depth) && depth > 0 ? depth : 1;
    const explicitShape = Array.isArray(product.shape)
      ? product.shape
          .map((part) => ({
            x: Number(part.x || 0),
            y: Number(part.y || 0),
            width: Number(part.width || part.w || 0),
            depth: Number(part.depth || part.d || 0),
            label: String(part.label || "").trim(),
          }))
          .filter((part) => part.width > 0 && part.depth > 0)
      : [];

    return {
      id: String(product.id || createId("product")),
      name,
      width: normalizedWidth,
      depth: normalizedDepth,
      icon,
      price: Number(product.price || product.fiyat || 0),
      category: String(product.category || product.kategori || "Mobilya").trim(),
      swatch: String(product.swatch || product.renk || "amber").trim(),
      shape:
        explicitShape.length > 0 ? explicitShape : buildCornerShape(product, normalizedWidth, normalizedDepth),
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

  const toDbStore = (store) => ({
    id: store.id,
    name: store.name,
    group_name: store.groupName || "Grupsuz",
  });

  const toDbProduct = (store, product) => ({
    id: product.id,
    store_id: store.id,
    name: product.name,
    width: product.width,
    depth: product.depth,
    icon: product.icon,
    price: product.price || 0,
    category: product.category || "Mobilya",
    swatch: product.swatch || "amber",
    shape: product.shape || [],
  });

  const toDbDevice = (store, device) => ({
    id: device.id,
    store_id: store.id,
    name: device.name,
    code: device.code,
    connected: device.connected,
    last_seen: device.lastSeen,
  });

  const fromDbStores = (stores, products, devices) =>
    stores.map((store, index) =>
      normalizeStore(
        {
          id: store.id,
          name: store.name,
          groupName: store.group_name,
          products: products
            .filter((product) => product.store_id === store.id)
            .map((product) => ({
              id: product.id,
              name: product.name,
              width: product.width,
              depth: product.depth,
              icon: product.icon,
              price: product.price,
              category: product.category,
              swatch: product.swatch,
              shape: product.shape,
            })),
          devices: devices
            .filter((device) => device.store_id === store.id)
            .map((device) => ({
              id: device.id,
              name: device.name,
              code: device.code,
              connected: device.connected,
              lastSeen: device.last_seen,
            })),
        },
        index
      )
    );

  const persistStoreDetails = async (store) => {
    const productRows = store.products.map((product) => toDbProduct(store, product));
    const deviceRows = store.devices.map((device) => toDbDevice(store, device));

    await supabaseRequest(`products?store_id=eq.${encodeURIComponent(store.id)}`, {
      method: "DELETE",
    });
    await supabaseRequest(`devices?store_id=eq.${encodeURIComponent(store.id)}`, {
      method: "DELETE",
    });

    if (productRows.length) {
      await supabaseRequest("products?on_conflict=id", {
        method: "POST",
        headers: { Prefer: "resolution=merge-duplicates,return=minimal" },
        body: JSON.stringify(productRows),
      });
    }

    if (deviceRows.length) {
      await supabaseRequest("devices?on_conflict=id", {
        method: "POST",
        headers: { Prefer: "resolution=merge-duplicates,return=minimal" },
        body: JSON.stringify(deviceRows),
      });
    }
  };

  const persistStores = async (stores) => {
    if (!isSupabaseEnabled()) {
      return;
    }

    const storeRows = stores.map(toDbStore);

    await supabaseRequest("stores?on_conflict=id", {
      method: "POST",
      headers: { Prefer: "resolution=merge-duplicates,return=minimal" },
      body: JSON.stringify(storeRows),
    });

    await Promise.all(stores.map(persistStoreDetails));
  };

  const saveStores = (stores, options = {}) => {
    const normalizedStores = stores.map((store, index) => normalizeStore(store, index));

    localStorage.setItem(STORES_KEY, JSON.stringify(normalizedStores));

    if (options.syncRemote !== false) {
      persistStores(normalizedStores).catch((error) => {
        console.warn("Supabase kaydi yapilamadi, yerel veri korunuyor.", error);
      });
    }

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

  const hydrateRemoteStores = async () => {
    if (!isSupabaseEnabled()) {
      return loadStores();
    }

    const [stores, products, devices] = await Promise.all([
      supabaseRequest("stores?select=*&is_active=eq.true&order=name.asc"),
      supabaseRequest("products?select=*&order=name.asc"),
      supabaseRequest("devices?select=*&order=name.asc"),
    ]);

    if (!Array.isArray(stores) || !stores.length) {
      return loadStores();
    }

    const remoteStores = fromDbStores(stores, products || [], devices || []);
    return saveStores(remoteStores, { syncRemote: false });
  };

  const deleteStore = async (storeId) => {
    if (!isSupabaseEnabled()) {
      return;
    }

    await supabaseRequest(`products?store_id=eq.${encodeURIComponent(storeId)}`, { method: "DELETE" });
    await supabaseRequest(`devices?store_id=eq.${encodeURIComponent(storeId)}`, { method: "DELETE" });
    await supabaseRequest(`stores?id=eq.${encodeURIComponent(storeId)}`, { method: "DELETE" });
  };

  const createQuoteRequest = async ({ storeId, room, items }) => {
    if (!isSupabaseEnabled() || !storeId || !items.length) {
      return;
    }

    const totalPrice = items.reduce((sum, item) => sum + Number(item.price || 0), 0);

    await supabaseRequest("quote_requests", {
      method: "POST",
      headers: { Prefer: "return=minimal" },
      body: JSON.stringify({
        store_id: storeId,
        room_width: room.width,
        room_depth: room.depth,
        room_height: room.height,
        items,
        total_price: totalPrice,
      }),
    });
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
    createQuoteRequest,
    createId,
    deleteStore,
    getActiveStoreId,
    hydrateRemoteStores,
    isSupabaseEnabled,
    loadStores,
    normalizeProduct,
    resetDemoStores,
    saveStores,
    setActiveStoreId,
  };

  loadStores();
})();
