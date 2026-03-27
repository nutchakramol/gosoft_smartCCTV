import { useState, useEffect } from 'react';
import { fetchPOSLogs } from '../data/mockData';
import type { POSLog } from '../types';
import { Filter, RefreshCw } from 'lucide-react';

const environments = ['all', 'production', 'staging', 'store-bkk-001', 'store-bkk-002', 'store-cm-001'];

export default function POSLogs() {
  const [logs, setLogs] = useState<POSLog[]>([]);
  const [env, setEnv] = useState('all');
  const [loading, setLoading] = useState(false);

  const load = (e: string) => {
    setLoading(true);
    setLogs(fetchPOSLogs(e === 'all' ? undefined : e));
    setLoading(false);
  };

  useEffect(() => { load(env); }, [env]);

  const totalRevenue = logs.reduce((a, b) => a + b.total, 0);

  return (
    <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 700 }}>POS Transaction Logs</h2>
          <p style={{ color: '#6b7280', fontSize: 13 }}>Real-time sales data by environment</p>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <Filter size={14} color="#6b7280" />
          <select
            value={env}
            onChange={e => setEnv(e.target.value)}
            style={{ border: '1px solid #e5e7eb', borderRadius: 6, padding: '6px 10px', fontSize: 13, background: 'white' }}
          >
            {environments.map(e => <option key={e} value={e}>{e}</option>)}
          </select>
          <button className="btn btn-ghost" onClick={() => load(env)} style={{ padding: '6px 12px' }}>
            <RefreshCw size={13} /> Refresh
          </button>
        </div>
      </div>

      {/* Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
        <div className="card">
          <div style={{ color: '#6b7280', fontSize: 12 }}>Transactions</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: '#018031' }}>{logs.length}</div>
        </div>
        <div className="card">
          <div style={{ color: '#6b7280', fontSize: 12 }}>Total Revenue</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: '#018031' }}>฿{totalRevenue.toLocaleString()}</div>
        </div>
        <div className="card">
          <div style={{ color: '#6b7280', fontSize: 12 }}>Avg Transaction</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: '#f18430' }}>
            ฿{logs.length ? Math.round(totalRevenue / logs.length) : 0}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#6b7280' }}>Loading...</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead style={{ background: '#f9fafb' }}>
                <tr>
                  {['Transaction ID', 'Time', 'SKU', 'Product', 'Qty', 'Price', 'Total', 'Cashier', 'Environment', 'Store'].map(h => (
                    <th key={h} style={{ padding: '10px 14px', textAlign: 'left', color: '#6b7280', fontWeight: 500, whiteSpace: 'nowrap', borderBottom: '1px solid #e5e7eb' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {logs.map(log => (
                  <tr key={log.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                    <td style={{ padding: '9px 14px', fontFamily: 'monospace', fontSize: 11, color: '#6b7280' }}>{log.id}</td>
                    <td style={{ padding: '9px 14px', whiteSpace: 'nowrap', fontSize: 12 }}>
                      {new Date(log.timestamp).toLocaleTimeString('th-TH')}
                    </td>
                    <td style={{ padding: '9px 14px', fontFamily: 'monospace', fontSize: 11 }}>{log.skuId}</td>
                    <td style={{ padding: '9px 14px', fontWeight: 500 }}>{log.skuName}</td>
                    <td style={{ padding: '9px 14px' }}>{log.quantity}</td>
                    <td style={{ padding: '9px 14px' }}>฿{log.price}</td>
                    <td style={{ padding: '9px 14px', fontWeight: 600, color: '#018031' }}>฿{log.total}</td>
                    <td style={{ padding: '9px 14px' }}>{log.cashier}</td>
                    <td style={{ padding: '9px 14px' }}>
                      <span style={{
                        background: log.environment === 'production' ? '#dcfce7' : '#f3f4f6',
                        color: log.environment === 'production' ? '#166534' : '#374151',
                        padding: '2px 7px', borderRadius: 4, fontSize: 11, fontWeight: 500,
                      }}>{log.environment}</span>
                    </td>
                    <td style={{ padding: '9px 14px', fontSize: 12, color: '#6b7280' }}>{log.storeId}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
