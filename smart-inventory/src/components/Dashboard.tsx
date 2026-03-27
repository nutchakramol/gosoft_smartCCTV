import { useState, useEffect } from 'react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer,
} from 'recharts';
import { TrendingUp, Package, AlertTriangle, Brain, ShoppingCart, Zap } from 'lucide-react';
import { skus, categories, storeMetrics, fetchS3Metrics } from '../data/mockData';
import type { S3Metric } from '../types';

interface Props {
  onSelectSKU: (id: string) => void;
}

export default function Dashboard({ onSelectSKU }: Props) {
  const [s3Data, setS3Data] = useState<S3Metric[]>([]);

  useEffect(() => {
    setS3Data(fetchS3Metrics());
  }, []);

  const criticalSKUs = skus.filter(s => s.status === 'critical' || s.status === 'low');

  return (
    <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* KPI Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16 }}>
        <KPICard icon={<TrendingUp size={18} color="#018031" />} label="Revenue (Month)" value={`฿${storeMetrics.totalRevenue.toLocaleString()}`} sub="+12.4% vs last month" color="#018031" />
        <KPICard icon={<ShoppingCart size={18} color="#018031" />} label="Transactions" value={storeMetrics.totalTransactions.toLocaleString()} sub={`Avg basket ฿${storeMetrics.avgBasketSize}`} color="#018031" />
        <KPICard icon={<Package size={18} color="#f18430" />} label="Total SKUs" value={storeMetrics.totalSKUs.toString()} sub={`${storeMetrics.lowStockCount} low stock`} color="#f18430" />
        <KPICard icon={<AlertTriangle size={18} color="#e63035" />} label="Critical Alerts" value={storeMetrics.criticalStockCount.toString()} sub={`${storeMetrics.outOfStockCount} out of stock`} color="#e63035" />
        <KPICard icon={<Brain size={18} color="#8b5cf6" />} label="AI Accuracy" value={`${storeMetrics.aiAccuracy}%`} sub="CCTV Vision Model" color="#8b5cf6" />
        <KPICard icon={<Zap size={18} color="#0ea5e9" />} label="Live Cameras" value="12" sub="All online" color="#0ea5e9" />
      </div>

      {/* Charts Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16 }}>
        {/* Sales Trend from S3 */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: 15 }}>Sales Trend</div>
              <div style={{ color: '#6b7280', fontSize: 12, marginBottom: 16 }}>Pulled from local mock · Last 14 days</div>
            </div>
            <span style={{ background: '#f3f4f6', color: '#374151', fontSize: 11, padding: '2px 8px', borderRadius: 4, fontWeight: 600 }}>Local Mock</span>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={s3Data}>
              <defs>
                <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#018031" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#018031" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={v => v.slice(5)} />
              <YAxis tick={{ fontSize: 10 }} tickFormatter={v => `฿${(v / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(v) => [`฿${Number(v).toLocaleString()}`, 'Revenue']} />
              <Area type="monotone" dataKey="totalSales" stroke="#018031" strokeWidth={2} fill="url(#salesGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Category Pie */}
        <div className="card">
          <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 4 }}>Sales by Category</div>
          <div style={{ color: '#6b7280', fontSize: 12, marginBottom: 12 }}>Revenue share</div>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={categories} dataKey="totalRevenue" nameKey="nameEn" cx="50%" cy="50%" outerRadius={65} innerRadius={35}>
                {categories.map((c, i) => <Cell key={i} fill={c.color} />)}
              </Pie>
              <Tooltip formatter={(v) => `฿${Number(v).toLocaleString()}`} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
            {categories.map(c => (
              <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11 }}>
                <div style={{ width: 8, height: 8, borderRadius: 2, background: c.color }} />
                <span>{c.nameEn}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stock Status + Category Bar */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Category Stock Bar */}
        <div className="card">
          <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 4 }}>Stock by Category</div>
          <div style={{ color: '#6b7280', fontSize: 12, marginBottom: 12 }}>Units in store</div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={categories} layout="vertical">
              <XAxis type="number" tick={{ fontSize: 10 }} />
              <YAxis dataKey="nameEn" type="category" tick={{ fontSize: 11 }} width={80} />
              <Tooltip />
              <Bar dataKey="totalStock" radius={[0, 4, 4, 0]}>
                {categories.map((c, i) => <Cell key={i} fill={c.color} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Critical Alerts */}
        <div className="card">
          <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 4 }}>Stock Alerts</div>
          <div style={{ color: '#6b7280', fontSize: 12, marginBottom: 12 }}>Needs attention now</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {criticalSKUs.map(sku => (
              <div
                key={sku.id}
                onClick={() => onSelectSKU(sku.id)}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '10px 12px', borderRadius: 8, cursor: 'pointer',
                  background: sku.status === 'critical' ? '#fff1f2' : '#fefce8',
                  border: `1px solid ${sku.status === 'critical' ? '#fecaca' : '#fef08a'}`,
                  transition: 'opacity 0.15s',
                }}
              >
                <div>
                  <div style={{ fontWeight: 500, fontSize: 13 }}>{sku.name}</div>
                  <div style={{ fontSize: 11, color: '#6b7280' }}>{sku.id} · {sku.location}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span className={`badge badge-${sku.status}`}>{sku.status.toUpperCase()}</span>
                  <div style={{ fontSize: 11, color: '#6b7280', marginTop: 2 }}>
                    {sku.currentStock} / {sku.minStock} min
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* SKU Table */}
      <div className="card">
        <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 12 }}>All Products</div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                {['SKU', 'Product', 'Category', 'Stock', 'Min', 'Days Left', 'Velocity/day', 'AI Conf.', 'Status', ''].map(h => (
                  <th key={h} style={{ padding: '8px 12px', textAlign: 'left', color: '#6b7280', fontWeight: 500, whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {skus.map(sku => (
                <tr key={sku.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                  <td style={{ padding: '10px 12px', color: '#6b7280', fontFamily: 'monospace', fontSize: 12 }}>{sku.id}</td>
                  <td style={{ padding: '10px 12px', fontWeight: 500 }}>{sku.name}</td>
                  <td style={{ padding: '10px 12px', color: '#6b7280' }}>{sku.category}</td>
                  <td style={{ padding: '10px 12px', fontWeight: 600 }}>{sku.currentStock}</td>
                  <td style={{ padding: '10px 12px', color: '#6b7280' }}>{sku.minStock}</td>
                  <td style={{ padding: '10px 12px', color: sku.daysToStockout < 1 ? '#e63035' : sku.daysToStockout < 3 ? '#f18430' : '#018031', fontWeight: 600 }}>
                    {sku.daysToStockout < 1 ? '<1' : sku.daysToStockout.toFixed(1)}d
                  </td>
                  <td style={{ padding: '10px 12px' }}>{sku.avgDailyVelocity}</td>
                  <td style={{ padding: '10px 12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div style={{ flex: 1, height: 4, background: '#e5e7eb', borderRadius: 2, minWidth: 50 }}>
                        <div style={{ width: `${sku.aiConfidence}%`, height: '100%', background: '#018031', borderRadius: 2 }} />
                      </div>
                      <span style={{ fontSize: 11, color: '#6b7280' }}>{sku.aiConfidence}%</span>
                    </div>
                  </td>
                  <td style={{ padding: '10px 12px' }}>
                    <span className={`badge badge-${sku.status}`}>{sku.status.toUpperCase()}</span>
                  </td>
                  <td style={{ padding: '10px 12px' }}>
                    <button className="btn btn-ghost" style={{ padding: '4px 10px', fontSize: 12 }} onClick={() => onSelectSKU(sku.id)}>
                      Detail
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function KPICard({ icon, label, value, sub, color }: { icon: React.ReactNode; label: string; value: string; sub: string; color: string }) {
  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ color: '#6b7280', fontSize: 12 }}>{label}</span>
        {icon}
      </div>
      <div style={{ fontSize: 24, fontWeight: 700, color }}>{value}</div>
      <div style={{ fontSize: 11, color: '#9ca3af' }}>{sub}</div>
    </div>
  );
}
