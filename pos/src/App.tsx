import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Footer from './components/Footer';
import Header from './components/Header';
import OrderStatus from './components/OrderStatus';
import Spotlight from './components/Spotlight';
import POSScreen from './pages/POSScreen';
import Loader from './components/ui/loader';
import { usePOSStore } from './store/pos-store';

function App() {
  const [appLoading, setAppLoading] = useState(true);
  const [appError, setAppError] = useState<string | null>(null);
  const fetchPosProfile = usePOSStore((s) => s.fetchPosProfile);

  // In the future, add more API/data loads here
  const loadAppData = async () => {
    try {
      await fetchPosProfile();
      // await fetchOtherData();
      setAppLoading(false);
    } catch (err) {
      setAppError((err as Error).message);
      setAppLoading(false);
    }
  };

  useEffect(() => {
    loadAppData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (appLoading) {
    return <Loader message="Loading POS profile..." />;
  }
  if (appError) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <div className="text-red-600 font-semibold mb-2">{appError}</div>
        <button className="px-4 py-2 bg-blue-600 text-white rounded" onClick={loadAppData}>Retry</button>
      </div>
    );
  }

  return (
    <Router basename="/pos">
      <div className="flex flex-col h-screen bg-gray-100 font-inter">
        <Header />
        <Spotlight />
        <div className="flex-1 overflow-hidden">
          <Routes>
            <Route path="/" element={<POSScreen />} />
            <Route path="/orders" element={<OrderStatus />} />
            <Route path="/analytics" element={<div className="p-6">Analytics - Coming Soon</div>} />
            <Route path="/customers" element={<div className="p-6">Customers - Coming Soon</div>} />
          </Routes>
        </div>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
