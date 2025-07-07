import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Footer from './components/Footer';
import Header from './components/Header';
import Orders from './pages/Orders';
import Spotlight from './components/Spotlight';
import POS from './pages/POS';
import AuthGuard from './components/AuthGuard';
import { ToastProvider } from './components/ui/toast';
import { usePOSStore } from './store/pos-store';
import { useEffect } from 'react';

function App() {
  const {
    initializeApp
  } = usePOSStore();
  
  useEffect(() => {
    initializeApp();
  }, [initializeApp]);
  return (
    <>
      <ToastProvider />
      <AuthGuard>
        <Router basename="/pos">
          <div className="flex flex-col h-screen bg-gray-100 font-inter">
            <Header />
            <Spotlight />
            <div className="flex-1 overflow-hidden">
              <Routes>
                <Route path="/" element={<POS/>} />
                <Route path="/orders" element={<Orders />} />
              </Routes>
            </div>
            <Footer />
          </div>
        </Router>
      </AuthGuard>
    </>
  );
}

export default App;
