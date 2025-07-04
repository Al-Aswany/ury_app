import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Footer from './components/Footer';
import Header from './components/Header';
import OrderStatus from './components/OrderStatus';
import Spotlight from './components/Spotlight';
import POSScreen from './pages/POSScreen';

function App() {
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
