import type { SKU, Category, POSLog, CCTVEvent, S3Metric, StoreMetrics, StockPrediction } from '../types';

// ─── Categories ───────────────────────────────────────────────────────────────
export const categories: Category[] = [
  { id: 'bev', name: 'เครื่องดื่ม', nameEn: 'Beverages', totalSKUs: 42, totalStock: 1240, totalRevenue: 84200, color: '#018031' },
  { id: 'snack', name: 'ขนมขบเคี้ยว', nameEn: 'Snacks', totalSKUs: 38, totalStock: 980, totalRevenue: 52100, color: '#e63035' },
  { id: 'frozen', name: 'อาหารแช่แข็ง', nameEn: 'Frozen Food', totalSKUs: 24, totalStock: 340, totalRevenue: 38900, color: '#f18430' },
  { id: 'dairy', name: 'นมและผลิตภัณฑ์', nameEn: 'Dairy', totalSKUs: 18, totalStock: 520, totalRevenue: 29400, color: '#0ea5e9' },
  { id: 'bakery', name: 'เบเกอรี่', nameEn: 'Bakery', totalSKUs: 15, totalStock: 180, totalRevenue: 21600, color: '#8b5cf6' },
  { id: 'personal', name: 'ของใช้ส่วนตัว', nameEn: 'Personal Care', totalSKUs: 29, totalStock: 760, totalRevenue: 18300, color: '#ec4899' },
];

// ─── Helper to generate sales history ─────────────────────────────────────────
function genSales(avgSold: number, avgPrice: number, days = 30): { date: string; sold: number; revenue: number }[] {
  return Array.from({ length: days }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (days - i));
    const sold = Math.max(0, Math.round(avgSold + (Math.random() - 0.5) * avgSold * 0.6));
    return { date: d.toISOString().split('T')[0], sold, revenue: sold * avgPrice };
  });
}

// ─── SKUs ──────────────────────────────────────────────────────────────────────
export const skus: SKU[] = [
  {
    id: 'SKU-001', name: 'น้ำดื่มตราช้าง 600ml', nameEn: 'Chang Water 600ml',
    category: 'bev', currentStock: 8, minStock: 24, maxStock: 120,
    price: 7, cost: 4.5, unit: 'ขวด', barcode: '8850999001234',
    imageUrl: 'https://placehold.co/80x80/018031/white?text=💧',
    location: 'A1-01', lastRestocked: '2026-03-18', supplier: 'ThaiBev',
    aiConfidence: 97.2, salesHistory: genSales(18, 7), avgDailyVelocity: 18, daysToStockout: 0.4, status: 'critical',
  },
  {
    id: 'SKU-002', name: 'เป๊ปซี่ 325ml', nameEn: 'Pepsi 325ml',
    category: 'bev', currentStock: 36, minStock: 24, maxStock: 96,
    price: 15, cost: 9, unit: 'กระป๋อง', barcode: '8850999002345',
    imageUrl: 'https://placehold.co/80x80/1a56db/white?text=🥤',
    location: 'A1-02', lastRestocked: '2026-03-19', supplier: 'PepsiCo TH',
    aiConfidence: 98.5, salesHistory: genSales(12, 15), avgDailyVelocity: 12, daysToStockout: 3, status: 'ok',
  },
  {
    id: 'SKU-003', name: 'โค้ก 325ml', nameEn: 'Coca-Cola 325ml',
    category: 'bev', currentStock: 14, minStock: 24, maxStock: 96,
    price: 15, cost: 9, unit: 'กระป๋อง', barcode: '8850999003456',
    imageUrl: 'https://placehold.co/80x80/e63035/white?text=🥤',
    location: 'A1-03', lastRestocked: '2026-03-17', supplier: 'Coca-Cola TH',
    aiConfidence: 96.8, salesHistory: genSales(14, 15), avgDailyVelocity: 14, daysToStockout: 1, status: 'low',
  },
  {
    id: 'SKU-004', name: 'เลย์รสออริจินัล 52g', nameEn: "Lay's Original 52g",
    category: 'snack', currentStock: 52, minStock: 20, maxStock: 80,
    price: 20, cost: 13, unit: 'ซอง', barcode: '8850999004567',
    imageUrl: 'https://placehold.co/80x80/f18430/white?text=🍟',
    location: 'B2-01', lastRestocked: '2026-03-20', supplier: 'PepsiCo TH',
    aiConfidence: 99.1, salesHistory: genSales(8, 20), avgDailyVelocity: 8, daysToStockout: 6.5, status: 'ok',
  },
  {
    id: 'SKU-005', name: 'พริงเกิลส์ออริจินัล 42g', nameEn: 'Pringles Original 42g',
    category: 'snack', currentStock: 6, minStock: 12, maxStock: 48,
    price: 35, cost: 22, unit: 'กระป๋อง', barcode: '8850999005678',
    imageUrl: 'https://placehold.co/80x80/e63035/white?text=🥫',
    location: 'B2-02', lastRestocked: '2026-03-15', supplier: 'Kellogg\'s TH',
    aiConfidence: 94.3, salesHistory: genSales(5, 35), avgDailyVelocity: 5, daysToStockout: 1.2, status: 'critical',
  },
  {
    id: 'SKU-006', name: 'ไอศกรีมวอลล์ มังโก้', nameEn: "Wall's Mango Ice Cream",
    category: 'frozen', currentStock: 22, minStock: 10, maxStock: 40,
    price: 25, cost: 15, unit: 'แท่ง', barcode: '8850999006789',
    imageUrl: 'https://placehold.co/80x80/f18430/white?text=🍦',
    location: 'C3-01', lastRestocked: '2026-03-19', supplier: "Unilever TH",
    aiConfidence: 91.7, salesHistory: genSales(6, 25), avgDailyVelocity: 6, daysToStockout: 3.7, status: 'ok',
  },
  {
    id: 'SKU-007', name: 'นมโฟร์โมสต์ UHT 250ml', nameEn: 'Foremost UHT Milk 250ml',
    category: 'dairy', currentStock: 3, minStock: 12, maxStock: 60,
    price: 18, cost: 11, unit: 'กล่อง', barcode: '8850999007890',
    imageUrl: 'https://placehold.co/80x80/0ea5e9/white?text=🥛',
    location: 'D4-01', lastRestocked: '2026-03-16', supplier: 'Foremost TH',
    aiConfidence: 98.9, salesHistory: genSales(10, 18), avgDailyVelocity: 10, daysToStockout: 0.3, status: 'critical',
  },
  {
    id: 'SKU-008', name: 'ขนมปังแซนวิชไส้ทูน่า', nameEn: 'Tuna Sandwich',
    category: 'bakery', currentStock: 18, minStock: 8, maxStock: 30,
    price: 35, cost: 22, unit: 'ชิ้น', barcode: '8850999008901',
    imageUrl: 'https://placehold.co/80x80/8b5cf6/white?text=🥪',
    location: 'E5-01', lastRestocked: '2026-03-21', supplier: 'CP Fresh',
    aiConfidence: 95.4, salesHistory: genSales(7, 35), avgDailyVelocity: 7, daysToStockout: 2.6, status: 'ok',
  },
  {
    id: 'SKU-009', name: 'แชมพูซันซิล 170ml', nameEn: 'Sunsilk Shampoo 170ml',
    category: 'personal', currentStock: 45, minStock: 10, maxStock: 40,
    price: 59, cost: 38, unit: 'ขวด', barcode: '8850999009012',
    imageUrl: 'https://placehold.co/80x80/ec4899/white?text=🧴',
    location: 'F6-01', lastRestocked: '2026-03-10', supplier: 'Unilever TH',
    aiConfidence: 97.6, salesHistory: genSales(3, 59), avgDailyVelocity: 3, daysToStockout: 15, status: 'overstock',
  },
  {
    id: 'SKU-010', name: 'เรดบูล 150ml', nameEn: 'Red Bull 150ml',
    category: 'bev', currentStock: 60, minStock: 24, maxStock: 96,
    price: 12, cost: 7, unit: 'กระป๋อง', barcode: '8850999010123',
    imageUrl: 'https://placehold.co/80x80/018031/white?text=⚡',
    location: 'A2-01', lastRestocked: '2026-03-20', supplier: 'TC Pharma',
    aiConfidence: 99.3, salesHistory: genSales(15, 12), avgDailyVelocity: 15, daysToStockout: 4, status: 'ok',
  },
  {
    id: 'SKU-011', name: 'มาม่ารสต้มยำกุ้ง', nameEn: 'Mama Tom Yum Shrimp',
    category: 'snack', currentStock: 9, minStock: 20, maxStock: 80,
    price: 6, cost: 3.5, unit: 'ซอง', barcode: '8850999011234',
    imageUrl: 'https://placehold.co/80x80/e63035/white?text=🍜',
    location: 'B3-01', lastRestocked: '2026-03-14', supplier: 'Thai President Foods',
    aiConfidence: 96.1, salesHistory: genSales(20, 6), avgDailyVelocity: 20, daysToStockout: 0.45, status: 'critical',
  },
  {
    id: 'SKU-012', name: 'โยเกิร์ตดัชมิลล์ 135g', nameEn: 'Dutchmill Yogurt 135g',
    category: 'dairy', currentStock: 28, minStock: 12, maxStock: 48,
    price: 12, cost: 7.5, unit: 'ถ้วย', barcode: '8850999012345',
    imageUrl: 'https://placehold.co/80x80/0ea5e9/white?text=🍶',
    location: 'D4-02', lastRestocked: '2026-03-20', supplier: 'Dutch Mill TH',
    aiConfidence: 98.2, salesHistory: genSales(9, 12), avgDailyVelocity: 9, daysToStockout: 3.1, status: 'ok',
  },
];

// ─── POS Logs ──────────────────────────────────────────────────────────────────
const environments = ['production', 'staging', 'store-bkk-001', 'store-bkk-002', 'store-cm-001'];
const cashiers = ['สมชาย', 'สมหญิง', 'วิชัย', 'นภา', 'ธนา'];

export const posLogs: POSLog[] = Array.from({ length: 80 }, (_, i) => {
  const sku = skus[Math.floor(Math.random() * skus.length)];
  const qty = Math.floor(Math.random() * 4) + 1;
  const d = new Date();
  d.setMinutes(d.getMinutes() - i * 18);
  return {
    id: `POS-${String(i + 1).padStart(4, '0')}`,
    timestamp: d.toISOString(),
    skuId: sku.id,
    skuName: sku.name,
    quantity: qty,
    price: sku.price,
    total: qty * sku.price,
    cashier: cashiers[Math.floor(Math.random() * cashiers.length)],
    environment: environments[Math.floor(Math.random() * environments.length)],
    storeId: `STORE-${Math.floor(Math.random() * 5) + 1}`,
  };
});

// ─── CCTV Events ───────────────────────────────────────────────────────────────
export const cctvEvents: CCTVEvent[] = [
  { id: 'EV-001', timestamp: new Date(Date.now() - 2 * 60000).toISOString(), camera: 'CAM-A1', event: 'สินค้าถูกหยิบออก', skuId: 'SKU-001', confidence: 97.2, imageUrl: 'https://placehold.co/120x80/018031/white?text=📷' },
  { id: 'EV-002', timestamp: new Date(Date.now() - 5 * 60000).toISOString(), camera: 'CAM-B2', event: 'ตรวจพบสต็อกต่ำ', skuId: 'SKU-005', confidence: 94.3, imageUrl: 'https://placehold.co/120x80/e63035/white?text=⚠️' },
  { id: 'EV-003', timestamp: new Date(Date.now() - 8 * 60000).toISOString(), camera: 'CAM-D4', event: 'เติมสินค้า', skuId: 'SKU-007', confidence: 98.9, imageUrl: 'https://placehold.co/120x80/0ea5e9/white?text=📦' },
  { id: 'EV-004', timestamp: new Date(Date.now() - 12 * 60000).toISOString(), camera: 'CAM-A1', event: 'ลูกค้าหยิบสินค้า', skuId: 'SKU-003', confidence: 96.8, imageUrl: 'https://placehold.co/120x80/018031/white?text=🛒' },
  { id: 'EV-005', timestamp: new Date(Date.now() - 15 * 60000).toISOString(), camera: 'CAM-F6', event: 'ตรวจพบ Overstock', skuId: 'SKU-009', confidence: 97.6, imageUrl: 'https://placehold.co/120x80/f18430/white?text=📊' },
];

// ─── S3 Metrics (simulated pull) ───────────────────────────────────────────────
export const s3Metrics: S3Metric[] = Array.from({ length: 14 }, (_, i) => {
  const d = new Date();
  d.setDate(d.getDate() - (13 - i));
  const sales = 18000 + Math.random() * 8000;
  return {
    date: d.toISOString().split('T')[0],
    totalSales: Math.round(sales),
    totalTransactions: Math.round(sales / 45),
    avgBasket: Math.round(40 + Math.random() * 20),
    topSKU: skus[Math.floor(Math.random() * 4)].name,
  };
});

// ─── Store KPIs ────────────────────────────────────────────────────────────────
export const storeMetrics: StoreMetrics = {
  totalRevenue: 244500,
  totalTransactions: 5432,
  avgBasketSize: 45,
  totalSKUs: 166,
  lowStockCount: 4,
  criticalStockCount: 3,
  outOfStockCount: 1,
  aiAccuracy: 97.1,
};

// ─── Local mock "fetch" (no S3, no delay) ─────────────────────────────────────
export function fetchS3Metrics(): S3Metric[] {
  return s3Metrics;
}

export function fetchPOSLogs(env?: string): POSLog[] {
  return env ? posLogs.filter(l => l.environment === env) : posLogs;
}

// ─── Prediction Engine ────────────────────────────────────────────────────────
// Computes weighted velocity: recent 7 days weighted 2x vs older 7 days
function computeWeightedVelocity(sku: SKU): { velocity: number; trend: StockPrediction['trend'] } {
  const history = sku.salesHistory.slice(-14);
  const recent = history.slice(7).reduce((a, b) => a + b.sold, 0) / 7;
  const older  = history.slice(0, 7).reduce((a, b) => a + b.sold, 0) / 7;
  const velocity = (recent * 2 + older) / 3;
  const trend: StockPrediction['trend'] =
    recent > older * 1.15 ? 'accelerating' :
    recent < older * 0.85 ? 'slowing' : 'steady';
  return { velocity, trend };
}

// Environment multipliers — busier stores sell faster
const envMultiplier: Record<string, number> = {
  'production':    1.0,
  'store-bkk-001': 1.3,
  'store-bkk-002': 1.1,
  'store-cm-001':  0.85,
  'staging':       0.5,
};

export function generatePredictions(): StockPrediction[] {
  const predictions: StockPrediction[] = [];

  for (const sku of skus) {
    // Pick the dominant environment from POS logs for this SKU
    const skuLogs = posLogs.filter(l => l.skuId === sku.id);
    const envCounts: Record<string, number> = {};
    skuLogs.forEach(l => { envCounts[l.environment] = (envCounts[l.environment] ?? 0) + 1; });
    const dominantEnv = Object.entries(envCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'production';

    const { velocity, trend } = computeWeightedVelocity(sku);
    const adjustedVelocity = velocity * (envMultiplier[dominantEnv] ?? 1.0);

    if (adjustedVelocity <= 0) continue;

    const hoursUntilStockout = (sku.currentStock / adjustedVelocity) * 24;
    const stockoutDate = new Date(Date.now() + hoursUntilStockout * 3600 * 1000);

    // Only surface items that will stockout within 5 days
    if (hoursUntilStockout > 120) continue;

    const urgency: StockPrediction['urgency'] =
      hoursUntilStockout < 12 ? 'critical' :
      hoursUntilStockout < 36 ? 'high' : 'medium';

    const confidence = Math.min(99, sku.aiConfidence - (trend === 'accelerating' ? 2 : 0));
    const recommendedOrderQty = Math.ceil((sku.maxStock - sku.currentStock) * (trend === 'accelerating' ? 1.2 : 1.0));

    const reasonMap: Record<StockPrediction['trend'], string> = {
      accelerating: `ยอดขายเร่งตัวขึ้น ${((velocity / (sku.avgDailyVelocity || 1) - 1) * 100).toFixed(0)}% ใน 7 วันล่าสุด`,
      steady:       `ยอดขายคงที่ที่ ${velocity.toFixed(1)} ชิ้น/วัน`,
      slowing:      `ยอดขายชะลอตัว แต่สต็อกต่ำกว่าระดับ min`,
    };

    predictions.push({
      skuId: sku.id,
      skuName: sku.name,
      category: sku.category,
      currentStock: sku.currentStock,
      predictedStockoutDate: stockoutDate.toISOString(),
      hoursUntilStockout: Math.round(hoursUntilStockout * 10) / 10,
      confidence,
      environment: dominantEnv,
      trend,
      recommendedOrderQty,
      urgency,
      reason: reasonMap[trend],
    });
  }

  return predictions.sort((a, b) => a.hoursUntilStockout - b.hoursUntilStockout);
}

export const stockPredictions = generatePredictions();
