import { useState } from 'react';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import SKUDetail from './components/SKUDetail';
import POSLogs from './components/POSLogs';
import CCTVView from './components/CCTVView';
import AIChatbot from './components/AIChatbot';
import { stockPredictions } from './data/mockData';
import type { StockPrediction } from './types';

type Page = 'dashboard' | 'inventory' | 'pos' | 'cctv' | 'sku-detail';

export default function App() {
  const [page, setPage] = useState<Page>('dashboard');
  const [selectedSKU, setSelectedSKU] = useState<string | null>(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatContext, setChatContext] = useState<StockPrediction | undefined>();

  const handleSelectSKU = (id: string) => {
    setSelectedSKU(id);
    setPage('sku-detail');
  };

  const openChat = (prediction?: StockPrediction) => {
    setChatContext(prediction);
    setChatOpen(true);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#FAFAFA' }}>
      <Navbar
        activePage={page === 'sku-detail' ? 'inventory' : page}
        onNavigate={(p) => setPage(p as Page)}
        predictions={stockPredictions}
        onOpenChat={openChat}
      />
      <main style={{ maxWidth: 1400, margin: '0 auto' }}>
        {(page === 'dashboard' || page === 'inventory') && <Dashboard onSelectSKU={handleSelectSKU} />}
        {page === 'sku-detail' && selectedSKU && (
          <SKUDetail skuId={selectedSKU} onBack={() => setPage('inventory')} />
        )}
        {page === 'pos' && <POSLogs />}
        {page === 'cctv' && <CCTVView />}
      </main>

      {chatOpen && (
        <AIChatbot
          onClose={() => setChatOpen(false)}
          initialPrediction={chatContext}
        />
      )}
    </div>
  );
}
