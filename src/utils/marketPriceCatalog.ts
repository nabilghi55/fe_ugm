// Instant Market Price Catalog & Taksiran Database untuk Operasional Pusat Gadai (UGM)
export interface CatalogItem {
  category: 'Kendaraan' | 'Handphone' | 'Laptop' | 'Emas' | 'Elektronik';
  brand: string;
  model: string;
  variant?: string;
  marketPrice: number;
  ltvPercent: number; // default 70-80%
  description?: string;
  isVehicle?: boolean;
  fbMarketplaceRange?: {
    minPrice: number;
    avgPrice: number;
    maxPrice: number;
  };
}

export const INSTANT_CATALOG: CatalogItem[] = [
  // --- KENDARAAN (MOTOR) ---
  {
    category: 'Kendaraan',
    brand: 'Honda',
    model: 'Beat CBS 2022-2024',
    variant: '110cc CBS / Deluxe',
    marketPrice: 14500000,
    ltvPercent: 75,
    description: 'Motor matic terlaris, likuiditas sangat tinggi. Cek STNK & BPKB asli.',
    isVehicle: true,
  },
  {
    category: 'Kendaraan',
    brand: 'Honda',
    model: 'Beat Street 2021-2023',
    variant: 'Street 110cc',
    marketPrice: 13800000,
    ltvPercent: 75,
    description: 'Kondisi standar pabrik, kelengkapan surat wajib.',
    isVehicle: true,
  },
  {
    category: 'Kendaraan',
    brand: 'Honda',
    model: 'Vario 125 CBS ISS',
    variant: '125cc All New',
    marketPrice: 18500000,
    ltvPercent: 75,
    description: 'Varian favorit harian. Taksiran pasaran stabil Rp 18jt - 20jt.',
    isVehicle: true,
  },
  {
    category: 'Kendaraan',
    brand: 'Honda',
    model: 'Vario 160 ABS / CBS',
    variant: '160cc 4-Katup',
    marketPrice: 22500000,
    ltvPercent: 75,
    description: 'Mesin eSP+ 160cc, rem ABS/CBS. Likuiditas cepat.',
    isVehicle: true,
  },
  {
    category: 'Kendaraan',
    brand: 'Honda',
    model: 'Scoopy Prestige / Stylish',
    variant: '110cc Smart Key',
    marketPrice: 19000000,
    ltvPercent: 75,
    description: 'Model retro favorit, harga bekas sangat stabil di Sumatera Barat.',
    isVehicle: true,
  },
  {
    category: 'Kendaraan',
    brand: 'Honda',
    model: 'PCX 160 ABS',
    variant: '160cc Keyless',
    marketPrice: 29000000,
    ltvPercent: 75,
    description: 'Skutik premium 160cc, surat lengkap STNK & BPKB faktur.',
    isVehicle: true,
  },
  {
    category: 'Kendaraan',
    brand: 'Yamaha',
    model: 'NMAX 155 Connected',
    variant: '155cc VVA ABS',
    marketPrice: 27000000,
    ltvPercent: 75,
    description: 'Skutik maxi terpopuler, mudah ditaksir dan cepat cair.',
    isVehicle: true,
  },
  {
    category: 'Kendaraan',
    brand: 'Yamaha',
    model: 'Aerox 155 CyberCity',
    variant: '155cc Connected',
    marketPrice: 24000000,
    ltvPercent: 75,
    description: 'Desain sporty anak muda, pasar bekas sangat diminati.',
    isVehicle: true,
  },
  {
    category: 'Kendaraan',
    brand: 'Yamaha',
    model: 'Mio M3 125',
    variant: '125cc Blue Core',
    marketPrice: 11500000,
    ltvPercent: 70,
    description: 'Motor matic ekonomis harian.',
    isVehicle: true,
  },
  {
    category: 'Kendaraan',
    brand: 'Yamaha',
    model: 'Fazzio Hybrid Connected',
    variant: '125cc Hybrid',
    marketPrice: 18000000,
    ltvPercent: 75,
    description: 'Classy Yamaha retro modern.',
    isVehicle: true,
  },

  // --- SMARTPHONE ---
  {
    category: 'Handphone',
    brand: 'Apple',
    model: 'iPhone 15 Pro',
    variant: '256GB Titanium',
    marketPrice: 15500000,
    ltvPercent: 80,
    description: 'Garansi resmi iBox / GDN, Battery Health > 90%.',
  },
  {
    category: 'Handphone',
    brand: 'Apple',
    model: 'iPhone 15 Pro Max',
    variant: '256GB Natural Titanium',
    marketPrice: 18500000,
    ltvPercent: 80,
    description: 'Flagship Apple, layar 120Hz, kamera periskop 5x.',
  },
  {
    category: 'Handphone',
    brand: 'Apple',
    model: 'iPhone 14',
    variant: '128GB Starlight/Midnight',
    marketPrice: 10500000,
    ltvPercent: 80,
    description: 'Fullset box original, imei terdaftar Kemenperin.',
  },
  {
    category: 'Handphone',
    brand: 'Apple',
    model: 'iPhone 13',
    variant: '128GB Blue/Pink/Midnight',
    marketPrice: 8500000,
    ltvPercent: 80,
    description: 'Model terlaris di pasar gadai, likuiditas sangat cepat.',
  },
  {
    category: 'Handphone',
    brand: 'Apple',
    model: 'iPhone 11',
    variant: '64GB / 128GB Black/White',
    marketPrice: 4800000,
    ltvPercent: 75,
    description: 'HP harian populer, pastikan TrueTone & FaceID aktif.',
  },
  {
    category: 'Handphone',
    brand: 'Samsung',
    model: 'Galaxy S24 Ultra',
    variant: '12GB/256GB Titanium',
    marketPrice: 16500000,
    ltvPercent: 80,
    description: 'Flagship AI Samsung, Garansi SEIN aktif.',
  },
  {
    category: 'Handphone',
    brand: 'Samsung',
    model: 'Galaxy A55 5G',
    variant: '8GB/256GB Awesome',
    marketPrice: 5200000,
    ltvPercent: 75,
    description: 'Midrange favorit, frame metal tahan air IP67.',
  },
  {
    category: 'Handphone',
    brand: 'Xiaomi',
    model: 'Redmi Note 13 Pro+ 5G',
    variant: '12GB/512GB',
    marketPrice: 4900000,
    ltvPercent: 75,
    description: 'Kamera 200MP, charger 120W, layar curved AMOLED.',
  },

  // --- LAPTOP ---
  {
    category: 'Laptop',
    brand: 'Apple',
    model: 'MacBook Air M1 2020',
    variant: '8GB RAM 256GB SSD',
    marketPrice: 9500000,
    ltvPercent: 80,
    description: 'Chip M1 sangat stabil dan dicari mahasiswa/pekerja.',
  },
  {
    category: 'Laptop',
    brand: 'Apple',
    model: 'MacBook Air M2 2022',
    variant: '8GB RAM 256GB SSD',
    marketPrice: 13500000,
    ltvPercent: 80,
    description: 'Desain baru MagSafe 3, layar Liquid Retina 13.6".',
  },
  {
    category: 'Laptop',
    brand: 'Apple',
    model: 'MacBook Pro 14" M3',
    variant: '16GB RAM 512GB SSD',
    marketPrice: 24000000,
    ltvPercent: 80,
    description: 'Pro grade laptop, layar Liquid Retina XDR 120Hz.',
  },
  {
    category: 'Laptop',
    brand: 'Asus',
    model: 'TUF Gaming F15',
    variant: 'Core i5 RTX 3050',
    marketPrice: 8500000,
    ltvPercent: 75,
    description: 'Laptop gaming populer, charger original wajib disertakan.',
  },
  {
    category: 'Laptop',
    brand: 'Lenovo',
    model: 'IdeaPad Slim 3',
    variant: 'Ryzen 5 / Core i5 512GB',
    marketPrice: 5500000,
    ltvPercent: 75,
    description: 'Laptop kerja kantor harian.',
  },

  // --- EMAS ---
  {
    category: 'Emas',
    brand: 'Antam',
    model: 'Logam Mulia Certicard 5 Gram',
    variant: '5 Gram Kemasan Press Redefine',
    marketPrice: 6800000,
    ltvPercent: 85,
    description: 'Emas murni 99.99%, kemasan belum rusak/sobek.',
  },
  {
    category: 'Emas',
    brand: 'Antam',
    model: 'Logam Mulia Certicard 10 Gram',
    variant: '10 Gram Kemasan Press Redefine',
    marketPrice: 13500000,
    ltvPercent: 85,
    description: 'Emas murni 99.99%, cek barcode CertiEye.',
  },
];

// Helper untuk membuat Link Pencarian Facebook Marketplace Real-Time
export function getFacebookMarketplaceUrl(brand: string, model: string, location: string = 'Padang') {
  const query = `${brand} ${model}`.trim();
  if (!query) return 'https://www.facebook.com/marketplace';
  return `https://www.facebook.com/marketplace/search/?query=${encodeURIComponent(query)}`;
}

// Helper untuk mencari rekomendasi taksiran instan berdasarkan teks input
export function lookupInstantEstimation(query: string, categoryFilter?: string) {
  if (!query || query.trim().length < 2) return [];

  const q = query.toLowerCase().trim();
  const words = q.split(/\s+/).filter(Boolean);

  return INSTANT_CATALOG.filter((item) => {
    if (categoryFilter && categoryFilter !== 'ALL' && item.category !== categoryFilter) {
      return false;
    }
    const fullText = `${item.brand} ${item.model} ${item.variant || ''} ${item.category}`.toLowerCase();
    // All search tokens must match
    return words.every((word) => fullText.includes(word));
  }).map((item) => {
    const maxLoan = Math.round((item.marketPrice * (item.ltvPercent / 100)) / 10000) * 10000;
    const recommendedLoan = Math.round((item.marketPrice * 0.70) / 10000) * 10000; // Standar 70%
    const defaultAdminFee = Math.round(recommendedLoan * 0.10); // 10% dari pencairan
    const defaultInterestAmount = Math.round(recommendedLoan * 0.10); // 10% per 10 hari

    // FB Marketplace Range (Min 92%, Avg 100%, Max 108%)
    const fbMin = item.fbMarketplaceRange?.minPrice || Math.round((item.marketPrice * 0.92) / 50000) * 50000;
    const fbAvg = item.fbMarketplaceRange?.avgPrice || item.marketPrice;
    const fbMax = item.fbMarketplaceRange?.maxPrice || Math.round((item.marketPrice * 1.08) / 50000) * 50000;
    const fbSearchUrl = getFacebookMarketplaceUrl(item.brand, item.model);

    return {
      ...item,
      maxLoan,
      recommendedLoan,
      defaultAdminFee,
      defaultInterestAmount,
      fbMarketplaceRange: {
        minPrice: fbMin,
        avgPrice: fbAvg,
        maxPrice: fbMax,
      },
      fbSearchUrl,
    };
  });
}
