import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts';
import { ArrowLeft, Package, TrendingUp, Clock, MapPin, Brain, AlertTriangle, CheckCircle } from 'lucide-react';
import { skus } from '../data/mockData';

interface Props {
  skuId: string;
  onBack: () => void;
}

export default function SKUDetail({ skuId, onBack }: Props) {
  const sku = skus.find(s => s.id === skuId);
  if (!sku) return <div style={{ padding: 24 }}>SKU not found</div>;

  const totalSold = sku.salesHistory.reduce((a, b) => a + b.sold, 0);
  const totalRevenue = sku.salesHistory.reduce((a, b) => a + b.revenue, 0);
  const avgSold = (totalSold / sku.salesHistory.length).toFixed(1);
  const peakDay = [...sku.salesHistory].sort((a, b) => b.sold - a.sold)[0];
  const reorderQty = sku.maxStock - sku.currentStock;
  const shouldReorder = sku.currentStock <= sku.minStock;

  // Time-to-sell: how many hours to sell 1 unit on avg
  const hoursPerUnit = sku.avgDailyVelocity > 0 ? (24 / sku.avgDailyVelocity).toFixed(1) : 'N/A';

  return (
    <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button className="btn btn-ghost" onClick={onBack} style={{ padding: '6px 12px' }}>
          <ArrowLeft size={14} /> Back
        </button>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <h1 style={{ fontSize: 20, fontWeight: 700 }}>{sku.name}</h1>
            <span className={`badge badge-${sku.status}`}>{sku.status.toUpperCase()}</span>
          </div>
          <div style={{ color: '#6b7280', fontSize: 13 }}>{sku.nameEn} · {sku.id} · {sku.barcode}</div>
        </div>
        {shouldReorder && (
          <button className="btn btn-danger">
            <AlertTriangle size={14} /> Reorder {reorderQty} units
          </button>
        )}
      </div>

      {/* Info Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12 }}>
        <InfoCard icon={<Package size={16} color="#018031" />} label="Current Stock" value={`${sku.currentStock} ${sku.unit}`} sub={`Min: ${sku.minStock} · Max: ${sku.maxStock}`} />
        <InfoCard icon={<Clock size={16} color="#f18430" />} label="Days to Stockout" value={sku.daysToStockout < 1 ? '<1 day' : `${sku.daysToStockout.toFixed(1)} days`} sub={`${hoursPerUnit}h per unit sold`} />
        <InfoCard icon={<TrendingUp size={16} color="#018031" />} label="Avg Daily Sales" value={`${avgSold} ${sku.unit}`} sub={`Peak: ${peakDay.sold} on ${peakDay.date}`} />
        <InfoCard icon={<TrendingUp size={16} color="#018031" />} label="30-day Revenue" value={`฿${totalRevenue.toLocaleString()}`} sub={`${totalSold} units sold`} />
        <InfoCard icon={<MapPin size={16} color="#6b7280" />} label="Location" value={sku.location} sub={`Supplier: ${sku.supplier}`} />
        <InfoCard icon={<Brain size={16} color="#8b5cf6" />} label="AI Confidence" value={`${sku.aiConfidence}%`} sub="CCTV Vision" />
      </div>

      {/* AI Recommendation */}
      <div className="card" style={{ borderLeft: `4px solid ${shouldReorder ? '#e63035' : '#018031'}`, background: shouldReorder ? '#fff1f2' : '#f0fdf4' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
          {shouldReorder ? <AlertTriangle size={18} color="#e63035" /> : <CheckCircle size={18} color="#018031" />}
          <div>
            <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>
              AI Recommendation
            </div>
            {shouldReorder ? (
              <p style={{ fontSize: 13, color: '#374151' }}>
                Stock is critically low ({sku.currentStock} units). At current velocity of {sku.avgDailyVelocity} units/day,
                stockout expected in {sku.daysToStockout < 1 ? 'less than 1 day' : `${sku.daysToStockout.toFixed(1)} days`}.
                Recommend ordering <strong>{reorderQty} units</strong> from {sku.supplier} immediately.
              </p>
            ) : (
              <p style={{ fontSize: 13, color: '#374151' }}>
                Stock level is healthy. Next reorder suggested when stock drops below {sku.minStock} units.
                Estimated reorder date: <strong>{new Date(Date.now() + sku.daysToStockout * 0.7 * 86400000).toLocaleDateString('th-TH')}</strong>.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Daily Sales Area */}
        <div className="card">
          <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>Daily Sales (30 days)</div>
          <div style={{ color: '#6b7280', fontSize: 12, marginBottom: 12 }}>Units sold per day</div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={sku.salesHistory}>
              <defs>
                <linearGradient id="skuGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#018031" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#018031" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="date" tick={{ fontSize: 9 }} tickFormatter={v => v.slice(5)} interval={4} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip />
              <Area type="monotone" dataKey="sold" stroke="#018031" strokeWidth={2} fill="url(#skuGrad)" name="Units Sold" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Revenue Bar */}
        <div className="card">
          <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>Daily Revenue (30 days)</div>
          <div style={{ color: '#6b7280', fontSize: 12, marginBottom: 12 }}>฿ per day</div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={sku.salesHistory}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="date" tick={{ fontSize: 9 }} tickFormatter={v => v.slice(5)} interval={4} />
              <YAxis tick={{ fontSize: 10 }} tickFormatter={v => `฿${v}`} />
              <Tooltip formatter={(v) => [`฿${v}`, 'Revenue']} />
              <Bar dataKey="revenue" fill="#f18430" radius={[3, 3, 0, 0]} name="Revenue" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Time to Sell Table */}
      <div className="card">
        <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 12 }}>Time-to-Sell Analysis</div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
              {['Date', 'Units Sold', 'Revenue', 'Avg Time/Unit', 'vs Avg'].map(h => (
                <th key={h} style={{ padding: '8px 12px', textAlign: 'left', color: '#6b7280', fontWeight: 500 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sku.salesHistory.slice(-10).reverse().map(day => {
              const timePerUnit = day.sold > 0 ? (24 / day.sold).toFixed(1) : '—';
              const avgNum = parseFloat(avgSold);
              const diff = day.sold - avgNum;
              return (
                <tr key={day.date} style={{ borderBottom: '1px solid #f3f4f6' }}>
                  <td style={{ padding: '8px 12px' }}>{day.date}</td>
                  <td style={{ padding: '8px 12px', fontWeight: 600 }}>{day.sold}</td>
                  <td style={{ padding: '8px 12px' }}>฿{day.revenue.toLocaleString()}</td>
                  <td style={{ padding: '8px 12px', color: '#6b7280' }}>{timePerUnit}h</td>
                  <td style={{ padding: '8px 12px', color: diff >= 0 ? '#018031' : '#e63035', fontWeight: 500 }}>
                    {diff >= 0 ? '+' : ''}{diff.toFixed(1)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function InfoCard({ icon, label, value, sub }: { icon: React.ReactNode; label: string; value: string; sub: string }) {
  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#6b7280', fontSize: 12 }}>
        {icon} {label}
      </div>
      <div style={{ fontWeight: 700, fontSize: 18 }}>{value}</div>
      <div style={{ fontSize: 11, color: '#9ca3af' }}>{sub}</div>
    </div>
  );
}
