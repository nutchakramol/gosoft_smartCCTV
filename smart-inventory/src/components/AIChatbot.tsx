import { useState, useRef, useEffect } from 'react';
import { X, Send, Brain, TrendingUp, AlertTriangle, Package, ChevronRight, Sparkles } from 'lucide-react';
import type { StockPrediction, ChatMessage } from '../types';
import { skus, categories, storeMetrics, s3Metrics } from '../data/mockData';
import { isInventoryQuestion, callOpenAI } from '../lib/aiService';
import type { OpenAIMessage } from '../lib/aiService';

interface Props {
  onClose: () => void;
  initialPrediction?: StockPrediction;
}

// ─── Mock AI response engine ──────────────────────────────────────────────────
function generateAIResponse(userMsg: string, context?: StockPrediction): string {
  const msg = userMsg.toLowerCase();

  // Context-aware: specific SKU from notification
  if (context) {
    if (msg.includes('order') || msg.includes('สั่ง') || msg.includes('reorder')) {
      return `สำหรับ **${context.skuName}** แนะนำให้สั่งซื้อ **${context.recommendedOrderQty} ชิ้น** ทันที\n\n` +
        `เหตุผล: สต็อกปัจจุบัน ${context.currentStock} ชิ้น จะหมดใน ~${context.hoursUntilStockout < 24 ? context.hoursUntilStockout + ' ชั่วโมง' : (context.hoursUntilStockout / 24).toFixed(1) + ' วัน'} ` +
        `(${context.environment})\n\nขั้นตอน:\n1. ติดต่อ Supplier ผ่านระบบ ERP\n2. ระบุ PO สำหรับ ${context.recommendedOrderQty} ชิ้น\n3. ตั้ง alert เมื่อสินค้าถึง`;
    }
    if (msg.includes('why') || msg.includes('ทำไม') || msg.includes('สาเหตุ')) {
      return `สาเหตุที่ **${context.skuName}** จะหมดสต็อก:\n\n` +
        `• Trend: ${context.trend === 'accelerating' ? '📈 ยอดขายเร่งตัวขึ้น' : context.trend === 'steady' ? '➡️ ยอดขายคงที่' : '📉 ยอดขายชะลอ'}\n` +
        `• ${context.reason}\n` +
        `• Environment "${context.environment}" มีผลต่อ velocity\n` +
        `• AI Confidence: ${context.confidence.toFixed(1)}%`;
    }
  }

  // General inventory questions
  if (msg.includes('critical') || msg.includes('วิกฤต') || msg.includes('urgent')) {
    const critical = skus.filter(s => s.status === 'critical');
    return `สินค้าที่อยู่ในสถานะ Critical ขณะนี้มี **${critical.length} รายการ**:\n\n` +
      critical.map(s => `• **${s.name}** — เหลือ ${s.currentStock} ชิ้น (min: ${s.minStock}), หมดใน ~${s.daysToStockout < 1 ? '<1 วัน' : s.daysToStockout.toFixed(1) + ' วัน'}`).join('\n') +
      `\n\nแนะนำให้สั่งซื้อทันทีเพื่อป้องกัน stockout`;
  }

  if (msg.includes('top') || msg.includes('best') || msg.includes('ขายดี')) {
    const top = [...skus].sort((a, b) => b.avgDailyVelocity - a.avgDailyVelocity).slice(0, 3);
    return `สินค้าขายดีที่สุด 3 อันดับ:\n\n` +
      top.map((s, i) => `${i + 1}. **${s.name}** — ${s.avgDailyVelocity} ชิ้น/วัน (฿${(s.avgDailyVelocity * s.price * 30).toLocaleString()}/เดือน)`).join('\n');
  }

  if (msg.includes('revenue') || msg.includes('รายได้') || msg.includes('ยอดขาย')) {
    const recent = s3Metrics.slice(-7);
    const total = recent.reduce((a, b) => a + b.totalSales, 0);
    const avg = Math.round(total / 7);
    return `ยอดขาย 7 วันล่าสุด:\n\n` +
      `• รวม: **฿${total.toLocaleString()}**\n` +
      `• เฉลี่ย/วัน: ฿${avg.toLocaleString()}\n` +
      `• เดือนนี้รวม: ฿${storeMetrics.totalRevenue.toLocaleString()}\n` +
      `• จำนวน transactions: ${storeMetrics.totalTransactions.toLocaleString()}\n\n` +
      `หมวดที่ทำรายได้สูงสุด: **${categories[0].nameEn}** (฿${categories[0].totalRevenue.toLocaleString()})`;
  }

  if (msg.includes('overstock') || msg.includes('สต็อกเกิน')) {
    const over = skus.filter(s => s.status === 'overstock');
    return `สินค้า Overstock ${over.length} รายการ:\n\n` +
      over.map(s => `• **${s.name}** — ${s.currentStock} ชิ้น (max: ${s.maxStock})\n  แนะนำ: ลด order ครั้งถัดไป หรือทำ promotion`).join('\n');
  }

  if (msg.includes('restock') || msg.includes('เติมสินค้า') || msg.includes('สั่งซื้อ')) {
    const needRestock = skus.filter(s => s.currentStock <= s.minStock);
    return `สินค้าที่ควรเติมสต็อก **${needRestock.length} รายการ**:\n\n` +
      needRestock.map(s => `• **${s.name}**\n  สั่ง ${s.maxStock - s.currentStock} ชิ้น จาก ${s.supplier}`).join('\n');
  }

  if (msg.includes('category') || msg.includes('หมวด')) {
    return `สรุปยอดขายตามหมวดหมู่:\n\n` +
      categories.map(c => `• **${c.nameEn}** (${c.name}): ฿${c.totalRevenue.toLocaleString()} · ${c.totalSKUs} SKUs`).join('\n');
  }

  if (msg.includes('hello') || msg.includes('hi') || msg.includes('สวัสดี')) {
    return `สวัสดีครับ! ผมคือ AI Assistant สำหรับระบบ Smart Inventory\n\nผมสามารถช่วยคุณได้เรื่อง:\n• วิเคราะห์สต็อกและ predict stockout\n• แนะนำการสั่งซื้อสินค้า\n• สรุปยอดขายและ trend\n• ตอบคำถามเกี่ยวกับ inventory\n\nมีอะไรให้ช่วยไหมครับ?`;
  }

  // Default
  return `ขอบคุณสำหรับคำถามครับ\n\nจากข้อมูลปัจจุบัน:\n• สินค้า critical: ${skus.filter(s => s.status === 'critical').length} รายการ\n• สินค้า low stock: ${skus.filter(s => s.status === 'low').length} รายการ\n• ยอดขายเดือนนี้: ฿${storeMetrics.totalRevenue.toLocaleString()}\n\nลองถามเพิ่มเติมเกี่ยวกับ: สินค้าขายดี, ยอดขาย, สินค้าที่ต้องสั่ง, หรือ critical items ครับ`;
}

// ─── Sales Summary ─────────────────────────────────────────────────────────────
function SalesSummary({ prediction }: { prediction?: StockPrediction }) {
  const totalRevenue7d = s3Metrics.slice(-7).reduce((a, b) => a + b.totalSales, 0);
  const criticalCount = skus.filter(s => s.status === 'critical').length;
  const topSKU = [...skus].sort((a, b) => b.avgDailyVelocity - a.avgDailyVelocity)[0];

  return (
    <div style={{ padding: '14px 16px', background: '#f0fdf4', borderBottom: '1px solid #d1fae5' }}>
      {prediction && (
        <div style={{ background: '#fff1f2', border: '1px solid #fecaca', borderRadius: 8, padding: '10px 12px', marginBottom: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600, fontSize: 13, color: '#991b1b', marginBottom: 4 }}>
            <AlertTriangle size={13} /> Alert Context: {prediction.skuName}
          </div>
          <div style={{ fontSize: 12, color: '#374151' }}>
            {prediction.reason} · หมดใน ~{prediction.hoursUntilStockout < 24 ? prediction.hoursUntilStockout + 'h' : (prediction.hoursUntilStockout / 24).toFixed(1) + 'd'}
          </div>
        </div>
      )}
      <div style={{ fontSize: 12, fontWeight: 600, color: '#166534', marginBottom: 8 }}>📊 Store Summary</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
        {[
          { icon: <TrendingUp size={11} />, label: '7-day Revenue', value: `฿${totalRevenue7d.toLocaleString()}` },
          { icon: <Package size={11} />, label: 'Critical Items', value: `${criticalCount} SKUs` },
          { icon: <TrendingUp size={11} />, label: 'Top Seller', value: topSKU.nameEn },
          { icon: <Brain size={11} />, label: 'AI Accuracy', value: `${storeMetrics.aiAccuracy}%` },
        ].map(item => (
          <div key={item.label} style={{ background: 'white', borderRadius: 6, padding: '6px 8px', border: '1px solid #d1fae5' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#6b7280', fontSize: 10, marginBottom: 2 }}>
              {item.icon} {item.label}
            </div>
            <div style={{ fontWeight: 700, fontSize: 13, color: '#111827' }}>{item.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Suggested Questions ───────────────────────────────────────────────────────
function SuggestedQuestions({ prediction, onSelect }: { prediction?: StockPrediction; onSelect: (q: string) => void }) {
  const base = [
    'สินค้าไหนขายดีที่สุด?',
    'มีสินค้า critical อะไรบ้าง?',
    'สรุปยอดขายเดือนนี้',
    'สินค้าไหนควรสั่งซื้อ?',
    'มี overstock อะไรบ้าง?',
  ];
  const contextual = prediction ? [
    `ทำไม ${prediction.skuName} ถึงจะหมด?`,
    `ควรสั่ง ${prediction.skuName} กี่ชิ้น?`,
  ] : [];
  const questions = [...contextual, ...base].slice(0, 5);

  return (
    <div style={{ padding: '10px 16px', borderBottom: '1px solid #f3f4f6' }}>
      <div style={{ fontSize: 11, color: '#9ca3af', marginBottom: 6 }}>Suggested questions</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {questions.map(q => (
          <button key={q} onClick={() => onSelect(q)} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            background: '#f9fafb', border: '1px solid #e5e7eb',
            borderRadius: 6, padding: '6px 10px', cursor: 'pointer',
            fontSize: 12, color: '#374151', textAlign: 'left',
            transition: 'background 0.1s',
          }}>
            {q}
            <ChevronRight size={12} color="#9ca3af" />
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Main Chatbot ──────────────────────────────────────────────────────────────
export default function AIChatbot({ onClose, initialPrediction }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([{
    id: '0',
    role: 'assistant',
    content: initialPrediction
      ? `สวัสดีครับ! ผมเห็นว่ามี alert สำหรับ **${initialPrediction.skuName}** — ${initialPrediction.reason}\n\nจะให้ผมช่วยวิเคราะห์หรือแนะนำการจัดการอย่างไรครับ?`
      : `สวัสดีครับ! ผมคือ AI Inventory Assistant\n\nด้านล่างคือสรุปสถานการณ์ปัจจุบัน และคำถามที่แนะนำ ลองถามได้เลยครับ`,
    timestamp: new Date().toISOString(),
  }]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  const send = async (text: string) => {
    if (!text.trim() || typing) return;
    setShowSuggestions(false);

    const userMsg: ChatMessage = {
      id: Date.now().toString(), role: 'user',
      content: text, timestamp: new Date().toISOString(),
    };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setTyping(true);

    try {
      let reply: string;
      let source: 'local' | 'ai';

      if (isInventoryQuestion(text)) {
        // Local mock — instant, uses live store data
        await new Promise(r => setTimeout(r, 400));
        reply = generateAIResponse(text, initialPrediction);
        source = 'local';
      } else {
        // Real OpenAI — retail expert with store context
        const history: OpenAIMessage[] = messages.map(m => ({ role: m.role, content: m.content }));
        reply = await callOpenAI(history, text);
        source = 'ai';
      }

      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(), role: 'assistant',
        content: reply, timestamp: new Date().toISOString(), source,
      }]);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(), role: 'assistant',
        content: `❌ AI error: ${msg}\n\nลองถามคำถามเกี่ยวกับ inventory โดยตรงได้เลยครับ`,
        timestamp: new Date().toISOString(), source: 'local',
      }]);
    } finally {
      setTyping(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', right: 0, top: 0, bottom: 0,
      width: 420, background: 'white',
      boxShadow: '-4px 0 24px rgba(0,0,0,0.12)',
      display: 'flex', flexDirection: 'column',
      zIndex: 500, borderLeft: '1px solid #e5e7eb',
    }}>
      {/* Header */}
      <div style={{ background: '#018031', color: 'white', padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Brain size={18} />
          <div>
            <div style={{ fontWeight: 700, fontSize: 14 }}>AI Inventory Assistant</div>
            <div style={{ fontSize: 11, opacity: 0.8, display: 'flex', alignItems: 'center', gap: 4 }}>
              <span className="pulse" /> Online
            </div>
          </div>
        </div>
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}>
          <X size={18} />
        </button>
      </div>

      {/* Summary + Suggestions (shown at top before user types) */}
      <div style={{ overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <SalesSummary prediction={initialPrediction} />
        {showSuggestions && <SuggestedQuestions prediction={initialPrediction} onSelect={send} />}

        {/* Messages */}
        <div style={{ flex: 1, padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {messages.map(msg => (
            <div key={msg.id} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
              {msg.role === 'assistant' && (
                <div style={{ width: 26, height: 26, borderRadius: '50%', background: '#018031', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: 8, flexShrink: 0, marginTop: 2 }}>
                  <Brain size={13} color="white" />
                </div>
              )}
              <div style={{ maxWidth: '78%', display: 'flex', flexDirection: 'column', gap: 3, alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                <div style={{
                  background: msg.role === 'user' ? '#018031' : '#f9fafb',
                  color: msg.role === 'user' ? 'white' : '#111827',
                  padding: '9px 12px', borderRadius: msg.role === 'user' ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
                  fontSize: 13, lineHeight: 1.55,
                  border: msg.role === 'assistant' ? '1px solid #f3f4f6' : 'none',
                  whiteSpace: 'pre-wrap',
                }}>
                  {msg.content.replace(/\*\*(.*?)\*\*/g, '$1')}
                </div>
                {msg.role === 'assistant' && msg.source && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 10, color: '#9ca3af' }}>
                    {msg.source === 'ai'
                      ? <><Sparkles size={9} color="#8b5cf6" /><span style={{ color: '#8b5cf6' }}>Gemini Flash</span></>
                      : <><Brain size={9} /><span>Local engine</span></>
                    }
                  </div>
                )}
              </div>
            </div>
          ))}
          {typing && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 26, height: 26, borderRadius: '50%', background: '#018031', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Brain size={13} color="white" />
              </div>
              <div style={{ background: '#f9fafb', border: '1px solid #f3f4f6', borderRadius: '12px 12px 12px 2px', padding: '10px 14px', display: 'flex', gap: 4 }}>
                {[0, 1, 2].map(i => (
                  <div key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: '#9ca3af', animation: `bounce 1s ${i * 0.15}s infinite` }} />
                ))}
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      </div>

      {/* Input */}
      <div style={{ padding: '12px 16px', borderTop: '1px solid #e5e7eb', display: 'flex', gap: 8 }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && send(input)}
          placeholder="ถามเกี่ยวกับ inventory..."
          style={{
            flex: 1, border: '1px solid #e5e7eb', borderRadius: 8,
            padding: '9px 12px', fontSize: 13, outline: 'none',
            background: '#f9fafb',
          }}
        />
        <button
          onClick={() => send(input)}
          disabled={!input.trim()}
          style={{
            background: input.trim() ? '#018031' : '#e5e7eb',
            color: input.trim() ? 'white' : '#9ca3af',
            border: 'none', borderRadius: 8, padding: '9px 12px',
            cursor: input.trim() ? 'pointer' : 'default', transition: 'background 0.15s',
          }}
        >
          <Send size={15} />
        </button>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
      `}</style>
    </div>
  );
}
