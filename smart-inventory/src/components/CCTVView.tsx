import { useState, useEffect } from 'react';
import { cctvEvents } from '../data/mockData';
import type { CCTVEvent } from '../types';
import { Camera, Brain, Zap, Eye } from 'lucide-react';

const cameras = ['CAM-A1', 'CAM-A2', 'CAM-B2', 'CAM-C3', 'CAM-D4', 'CAM-E5', 'CAM-F6'];

function LiveFeed({ cam }: { cam: string }) {
  const [count, setCount] = useState(Math.floor(Math.random() * 5));
  useEffect(() => {
    const t = setInterval(() => setCount(Math.floor(Math.random() * 8)), 3000);
    return () => clearInterval(t);
  }, []);

  const colors = ['#018031', '#e63035', '#f18430', '#0ea5e9', '#8b5cf6', '#ec4899', '#018031'];
  const idx = cameras.indexOf(cam);

  return (
    <div style={{
      background: '#111827',
      borderRadius: 8,
      overflow: 'hidden',
      border: '1px solid #374151',
      position: 'relative',
    }}>
      {/* Simulated camera feed */}
      <div style={{
        height: 140,
        background: `linear-gradient(135deg, #1f2937 0%, ${colors[idx]}22 100%)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
      }}>
        <Camera size={32} color="#374151" />
        {/* AI bounding boxes simulation */}
        {count > 0 && Array.from({ length: Math.min(count, 3) }).map((_, i) => (
          <div key={i} style={{
            position: 'absolute',
            border: `2px solid ${colors[idx]}`,
            borderRadius: 2,
            width: 30 + Math.random() * 20,
            height: 30 + Math.random() * 20,
            top: 20 + i * 30,
            left: 20 + i * 35,
            opacity: 0.8,
          }}>
            <span style={{ position: 'absolute', top: -14, left: 0, fontSize: 9, color: colors[idx], fontWeight: 600, whiteSpace: 'nowrap' }}>
              {(90 + Math.random() * 9).toFixed(1)}%
            </span>
          </div>
        ))}
        <div style={{ position: 'absolute', top: 6, left: 8, display: 'flex', alignItems: 'center', gap: 4 }}>
          <span className="pulse" />
          <span style={{ color: 'white', fontSize: 10, fontWeight: 600 }}>LIVE</span>
        </div>
        <div style={{ position: 'absolute', top: 6, right: 8, background: 'rgba(0,0,0,0.5)', borderRadius: 4, padding: '2px 6px', fontSize: 10, color: 'white' }}>
          {cam}
        </div>
        <div style={{ position: 'absolute', bottom: 6, right: 8, display: 'flex', alignItems: 'center', gap: 4, background: 'rgba(0,0,0,0.5)', borderRadius: 4, padding: '2px 6px' }}>
          <Brain size={10} color="#8b5cf6" />
          <span style={{ fontSize: 10, color: '#8b5cf6' }}>{count} detected</span>
        </div>
      </div>
      <div style={{ padding: '8px 10px', background: '#1f2937' }}>
        <div style={{ color: 'white', fontSize: 12, fontWeight: 500 }}>{cam}</div>
        <div style={{ color: '#6b7280', fontSize: 11 }}>Zone {cam.replace('CAM-', '')}</div>
      </div>
    </div>
  );
}

export default function CCTVView() {
  const [events, setEvents] = useState<CCTVEvent[]>(cctvEvents);
  const [ticker, setTicker] = useState(0);

  // Simulate new events
  useEffect(() => {
    const t = setInterval(() => {
      setTicker(n => n + 1);
      const eventTypes = ['สินค้าถูกหยิบออก', 'ลูกค้าหยิบสินค้า', 'ตรวจพบสต็อกต่ำ', 'เติมสินค้า', 'ตรวจพบความผิดปกติ'];
      const newEvent: CCTVEvent = {
        id: `EV-${Date.now()}`,
        timestamp: new Date().toISOString(),
        camera: cameras[Math.floor(Math.random() * cameras.length)],
        event: eventTypes[Math.floor(Math.random() * eventTypes.length)],
        confidence: 88 + Math.random() * 11,
        imageUrl: '',
      };
      setEvents(prev => [newEvent, ...prev].slice(0, 20));
    }, 4000);
    return () => clearInterval(t);
  }, []);

  return (
    <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 700 }}>AI Vision · CCTV Monitor</h2>
          <p style={{ color: '#6b7280', fontSize: 13 }}>Computer Vision real-time detection</p>
        </div>
        <div style={{ display: 'flex', gap: 16, fontSize: 13 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Eye size={14} color="#018031" />
            <span>{cameras.length} cameras online</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Zap size={14} color="#f18430" />
            <span>{ticker} events today</span>
          </div>
        </div>
      </div>

      {/* Camera Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
        {cameras.map(cam => <LiveFeed key={cam} cam={cam} />)}
      </div>

      {/* Event Log */}
      <div className="card">
        <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Brain size={16} color="#8b5cf6" />
          AI Detection Events
          <span className="pulse" style={{ marginLeft: 4 }} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 360, overflowY: 'auto' }}>
          {events.map(ev => (
            <div key={ev.id} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '10px 12px', borderRadius: 8,
              background: '#f9fafb', border: '1px solid #f3f4f6',
              animation: ev.id.startsWith('EV-1') ? 'none' : undefined,
            }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: ev.confidence > 95 ? '#018031' : ev.confidence > 90 ? '#f18430' : '#e63035', flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 500, fontSize: 13 }}>{ev.event}</div>
                <div style={{ fontSize: 11, color: '#6b7280' }}>{ev.camera} · {new Date(ev.timestamp).toLocaleTimeString('th-TH')}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: ev.confidence > 95 ? '#018031' : '#f18430' }}>
                  {ev.confidence.toFixed(1)}%
                </div>
                <div style={{ fontSize: 10, color: '#9ca3af' }}>confidence</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
