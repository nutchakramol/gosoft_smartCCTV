export interface SKU {
  id: string;
  name: string;
  nameEn: string;
  category: string;
  currentStock: number;
  minStock: number;
  maxStock: number;
  price: number;
  cost: number;
  unit: string;
  barcode: string;
  imageUrl: string;
  location: string;
  lastRestocked: string;
  supplier: string;
  aiConfidence: number;
  salesHistory: DailySales[];
  avgDailyVelocity: number;
  daysToStockout: number;
  status: 'ok' | 'low' | 'critical' | 'overstock';
}

export interface DailySales {
  date: string;
  sold: number;
  revenue: number;
}

export interface Category {
  id: string;
  name: string;
  nameEn: string;
  totalSKUs: number;
  totalStock: number;
  totalRevenue: number;
  color: string;
}

export interface POSLog {
  id: string;
  timestamp: string;
  skuId: string;
  skuName: string;
  quantity: number;
  price: number;
  total: number;
  cashier: string;
  environment: string;
  storeId: string;
}

export interface CCTVEvent {
  id: string;
  timestamp: string;
  camera: string;
  event: string;
  skuId?: string;
  confidence: number;
  imageUrl: string;
}

export interface S3Metric {
  date: string;
  totalSales: number;
  totalTransactions: number;
  avgBasket: number;
  topSKU: string;
}

export interface StoreMetrics {
  totalRevenue: number;
  totalTransactions: number;
  avgBasketSize: number;
  totalSKUs: number;
  lowStockCount: number;
  criticalStockCount: number;
  outOfStockCount: number;
  aiAccuracy: number;
}

export interface StockPrediction {
  skuId: string;
  skuName: string;
  category: string;
  currentStock: number;
  predictedStockoutDate: string;   // ISO date string
  hoursUntilStockout: number;
  confidence: number;              // 0-100
  environment: string;
  trend: 'accelerating' | 'steady' | 'slowing';
  recommendedOrderQty: number;
  urgency: 'critical' | 'high' | 'medium';
  reason: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  source?: 'local' | 'ai';
}
