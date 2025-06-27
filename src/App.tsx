import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import WhatsAppButton from './components/WhatsAppButton';
import Home from './pages/Home';
import Services from './pages/Services';
import ServiceDetail from './pages/ServiceDetail';
import About from './pages/About';
import Contact from './pages/Contact';
import Partnerships from './pages/Partnerships';
import DressDesigner from './pages/DressDesigner';
import AdminLogin from './pages/admin/AdminLogin';
import AdminPanel from './pages/admin/AdminPanel';
import PartnerLogin from './pages/partner/PartnerLogin';
import PartnerDashboard from './pages/partner/PartnerDashboard';
import OMSLogin from './pages/oms/OMSLogin';
import OMSDashboard from './pages/oms/OMSDashboard';
import OrderTracking from './pages/oms/OrderTracking';
import AIStylistChat from './pages/AIStylistChat';
import SavedDesigns from './pages/SavedDesigns';
import Auth from './pages/Auth';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-white">
        <Header />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/services" element={<Services />} />
            <Route path="/services/:serviceName" element={<ServiceDetail />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/partnerships" element={<Partnerships />} />
            <Route path="/dress-designer" element={<DressDesigner />} />
            <Route path="/admin" element={<AdminLogin />} />
            <Route path="/admin/panel" element={<AdminPanel />} />
            <Route path="/partner/login" element={<PartnerLogin />} />
            <Route path="/partner/dashboard" element={<PartnerDashboard />} />
            <Route path="/oms/login" element={<OMSLogin />} />
            <Route path="/oms/dashboard" element={<OMSDashboard />} />
            <Route path="/oms/tracking" element={<OrderTracking />} />
            <Route path="/ai-stylist" element={<AIStylistChat />} />
            <Route path="/saved-designs" element={<SavedDesigns />} />
            <Route path="/login" element={<Auth />} />
            <Route path="/auth/callback" element={<Auth />} />
          </Routes>
        </main>
        <Footer />
        <WhatsAppButton />
      </div>
    </Router>
  );
}

export default App;