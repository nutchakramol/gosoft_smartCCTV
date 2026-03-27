import { skus, categories, storeMetrics, stockPredictions } from '../data/mockData';

// ─── Build store context snapshot for the AI system prompt ───────────────────
function buildStoreContext(): string {
  const critical = skus.filter(s => s.status === 'critical');
  const low = skus.filter(s => s.status === 'low');
  const overstock = skus.filter(s => s.status === 'overstock');
  const topSellers = [...skus].sort((a, b) => b.avgDailyVelocity - a.avgDailyVelocity).slice(0, 5);

  return `
CURRENT STORE DATA (Smart Inventory System — convenience store, 7-Eleven style):

STORE KPIs:
- Monthly Revenue: ฿${storeMetrics.totalRevenue.toLocaleString()}
- Total Transactions: ${storeMetrics.totalTransactions.toLocaleString()}
- Avg Basket Size: ฿${storeMetrics.avgBasketSize}
- Total SKUs: ${storeMetrics.totalSKUs}
- AI Vision Accuracy: ${storeMetrics.aiAccuracy}%

STOCK ALERTS:
- Critical (${critical.length}): ${critical.map(s => `${s.name} (${s.currentStock}/${s.minStock} min, ~${s.daysToStockout}d left)`).join(', ')}
- Low Stock (${low.length}): ${low.map(s => s.name).join(', ')}
- Overstock (${overstock.length}): ${overstock.map(s => `${s.name} (${s.currentStock}/${s.maxStock} max)`).join(', ')}

TOP SELLERS (by daily velocity):
${topSellers.map((s, i) => `${i + 1}. ${s.name} — ${s.avgDailyVelocity} units/day @ ฿${s.price}`).join('\n')}

CATEGORIES (by revenue):
${categories.map(c => `- ${c.nameEn}: ฿${c.totalRevenue.toLocaleString()} (${c.totalSKUs} SKUs)`).join('\n')}

AI PREDICTIONS (stockout within 5 days):
${stockPredictions.map(p => `- ${p.skuName}: ~${p.hoursUntilStockout}h left, env=${p.environment}, trend=${p.trend}`).join('\n')}
`.trim();
}

const SYSTEM_PROMPT = `You are an expert AI assistant for a smart retail inventory management system at a convenience store chain (similar to 7-Eleven in Thailand).

Your expertise covers:
- Retail inventory management and demand forecasting
- Supply chain optimization and reorder strategies
- POS data analysis and sales trend interpretation
- Shrinkage, waste reduction, and overstock management
- Planogram and shelf space optimization
- Promotional planning and markdown strategies
- Supplier negotiation and lead time management
- Thai retail market context and consumer behavior

You have access to real-time store data provided below. Use it to give specific, actionable advice.
Always respond in the same language the user writes in (Thai or English).
Be concise, practical, and data-driven. When relevant, reference the actual numbers from the store data.

${buildStoreContext()}`;

// ─── Inventory keyword detector — routes to mock engine if matched ────────────
const INVENTORY_KEYWORDS = [
  'critical', 'วิกฤต', 'urgent', 'top', 'best', 'ขายดี',
  'revenue', 'รายได้', 'ยอดขาย', 'overstock', 'สต็อกเกิน',
  'restock', 'เติมสินค้า', 'สั่งซื้อ', 'category', 'หมวด',
  'hello', 'hi', 'สวัสดี', 'order', 'สั่ง', 'reorder',
  'ทำไม', 'สาเหตุ', 'why',
];

export function isInventoryQuestion(msg: string): boolean {
  const lower = msg.toLowerCase();
  return INVENTORY_KEYWORDS.some(kw => lower.includes(kw));
}

// ─── Gemini API call ──────────────────────────────────────────────────────────
export interface OpenAIMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export async function callOpenAI(
  history: OpenAIMessage[],
  userMessage: string,
): Promise<string> {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY as string;

  if (!apiKey || apiKey === 'your_gemini_api_key_here') {
    return `⚠️ Gemini API key not configured.\n\nAdd your key to \`.env\`:\n\`VITE_GEMINI_API_KEY=AIza...\`\n\nGet a free key at aistudio.google.com → "Get API key"\n\nFor now, try asking about: stock alerts, top sellers, revenue, restock needs, or overstock.`;
  }

  // Build Gemini contents array — interleave history + inject system context in first user turn
  type GeminiPart = { text: string };
  type GeminiContent = { role: 'user' | 'model'; parts: GeminiPart[] };

  const contents: GeminiContent[] = [];

  // Prepend system prompt as first user/model exchange (Gemini doesn't have a system role)
  contents.push({ role: 'user', parts: [{ text: SYSTEM_PROMPT + '\n\nUnderstood. I am ready to help.' }] });
  contents.push({ role: 'model', parts: [{ text: 'Understood. I am your retail inventory AI assistant with access to the current store data. How can I help?' }] });

  // Add conversation history (last 6 turns)
  for (const m of history.slice(-6)) {
    if (m.role === 'system') continue;
    contents.push({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    });
  }

  // Add current user message
  contents.push({ role: 'user', parts: [{ text: userMessage }] });

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents,
        generationConfig: {
          temperature: 0.4,
          maxOutputTokens: 600,
        },
      }),
    }
  );

  if (!res.ok) {
    const err = await res.json().catch(() => ({})) as { error?: { message?: string } };
    throw new Error(err.error?.message ?? res.statusText);
  }

  const data = await res.json() as {
    candidates: { content: { parts: { text: string }[] } }[];
  };

  return data.candidates[0].content.parts[0].text.trim();
}
