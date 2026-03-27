import { useState, useRef, useEffect } from 'react';
import { Bell, Wifi, Brain, AlertTriangle, Clock, MessageSquare, X } from 'lucide-react';
import type { StockPrediction } from '../types';

interface Props {
  activePage: string;
  onNavigate: (page: string) => void;
  predictions: StockPrediction[];
  onOpenChat: (prediction?: StockPrediction) => void;
}

const navItems = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'inventory', label: 'Inventory' },
  { id: 'pos', label: 'POS Logs' },
  { id: 'cctv', label: 'AI Vision' },
];

const urgencyColor = { critical: '#e63035', high: '#f18430', medium: '#eab308' };
const urgencyBg    = { critical: '#fff1f2', high: '#fff7ed', medium: '#fefce8' };

export default function Navbar({ activePage, onNavigate, predictions, onOpenChat }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const criticalCount = predictions.filter(p => p.urgency === 'critical').length;
  const totalCount = predictions.length;

  return (
    <header style={{
      background: '#018031', color: 'white',
      display: 'flex', alignItems: 'center',
      padding: '0 24px', height: 56,
      position: 'sticky', top: 0, zIndex: 200,
      gap: 32, boxShadow: '0 1px 8px rgba(0,0,0,0.15)',
    }}>
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, fontSize: 16, whiteSpace: 'nowrap' }}>
        <Brain size={20} />
        <span>Smart Inventory</span>
        <span style={{ background: '#e63035', fontSize: 10, padding: '1px 6px', borderRadius: 4, fontWeight: 600 }}>AI</span>
      </div>

      {/* Nav */}
      <nav style={{ display: 'flex', gap: 4, flex: 1 }}>
        {navItems.map(item => (
          <button key={item.id} onClick={() => onNavigate(item.id)} style={{
            background: activePage === item.id ? 'rgba(255,255,255,0.2)' : 'transparent',
            color: 'white', border: 'none', padding: '6px 14px',
            borderRadius: 6, cursor: 'pointer',
            fontWeight: activePage === item.id ? 600 : 400, fontSize: 13,
          }}>
            {item.label}
          </button>
        ))}
      </nav>

      {/* Right */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, opacity: 0.9 }}>
          <span className="pulse" /><Wifi size={14} /><span>Live</span>
        </div>

        {/* Bell + Dropdown */}
        <div ref={ref} style={{ position: 'relative' }}>
          <button
            onClick={() => setOpen(o => !o)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'white', position: 'relative', padding: 4 }}
          >
            <Bell size={18} />
            {totalCount > 0 && (
              <span style={{
                position: 'absolute', top: -2, right: -2,
                background: criticalCount > 0 ? '#e63035' : '#f18430',
                color: 'white', fontSize: 10, fontWeight: 700,
                width: 16, height: 16, borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>{totalCount}</span>
            )}
          </button>

          {open && (
            <div style={{
              position: 'absolute', top: 'calc(100% + 10px)', right: 0,
              width: 380, background: 'white', borderRadius: 12,
              boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
              border: '1px solid #e5e7eb', zIndex: 300, overflow: 'hidden',
            }}>
              {/* Header */}
              <div style={{ padding: '14px 16px', borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: '#111827' }}>AI Stock Predictions</div>
                  <div style={{ fontSize: 11, color: '#6b7280', marginTop: 2 }}>
                    {criticalCount} critical · {totalCount} total alerts
                  </div>
                </div>
                <button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af' }}>
                  <X size={16} />
                </button>
              </div>

              {/* Prediction list */}
              <div style={{ maxHeight: 420, overflowY: 'auto' }}>
                {predictions.length === 0 ? (
                  <div style={{ padding: 24, textAlign: 'center', color: '#6b7280', fontSize: 13 }}>
                    All stock levels are healthy
                  </div>
                ) : predictions.map(p => (
                  <div key={p.skuId} style={{
                    padding: '12px 16px',
                    borderBottom: '1px solid #f9fafb',
                    background: urgencyBg[p.urgency],
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                          <AlertTriangle size={13} color={urgencyColor[p.urgency]} />
                          <span style={{ fontWeight: 600, fontSize: 13, color: '#111827' }}>{p.skuName}</span>
                          <span style={{
                            fontSize: 10, fontWeight: 700, padding: '1px 6px', borderRadius: 4,
                            background: urgencyColor[p.urgency], color: 'white',
                          }}>{p.urgency.toUpperCase()}</span>
                        </div>
                        <div style={{ fontSize: 12, color: '#374151', marginBottom: 4 }}>{p.reason}</div>
                        <div style={{ display: 'flex', gap: 12, fontSize: 11, color: '#6b7280' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                            <Clock size={10} />
                            {p.hoursUntilStockout < 24
                              ? `~${p.hoursUntilStockout}h left`
                              : `~${(p.hoursUntilStockout / 24).toFixed(1)}d left`}
                          </span>
                          <span>Stock: {p.currentStock} units</span>
                          <span style={{ color: '#018031', fontWeight: 500 }}>Order: {p.recommendedOrderQty}</span>
                        </div>
                        <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>
                          Env: {p.environment} · {p.confidence.toFixed(1)}% confidence
                        </div>
                      </div>
                      <button
                        onClick={() => { setOpen(false); onOpenChat(p); }}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 4,
                          background: '#018031', color: 'white',
                          border: 'none', borderRadius: 6, padding: '5px 10px',
                          fontSize: 11, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap',
                        }}
                      >
                        <MessageSquare size={11} /> Ask AI
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div style={{ padding: '10px 16px', borderTop: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 11, color: '#9ca3af' }}>Updated just now</span>
                <button
                  onClick={() => { setOpen(false); onOpenChat(); }}
                  style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'none', border: '1px solid #018031', color: '#018031', borderRadius: 6, padding: '4px 10px', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
                >
                  <MessageSquare size={12} /> Open AI Assistant
                </button>
              </div>
            </div>
          )}
        </div>

        <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 600 }}>
          A
        </div>
      </div>
    </header>
  );
}
