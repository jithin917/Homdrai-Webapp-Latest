import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { WhatsAppButton } from './components/WhatsAppButton';
import { Home } from './pages/Home';
import { About } from './pages/About';
import { Services } from './pages/Services';
import { ServiceDetail } from './pages/ServiceDetail';
import { Contact } from './pages/Contact';
import { Partnerships } from './pages/Partnerships';
import { DressDesigner } from './pages/DressDesigner';
import { AIStylistChat } from './pages/AIStylistChat';
import { SavedDesigns } from './pages/SavedDesigns';
import Auth from './pages/Auth';
import { OrderTracking } from './pages/oms/OrderTracking';
import { OMSLogin } from './pages/oms/OMSLogin';
import { OMSDashboard } from './pages/oms/OMSDashboard';
import { AdminLogin } from './pages/admin/AdminLogin';
import { AdminPanel } from './pages/admin/AdminPanel';
import { PartnerLogin } from './pages/partner/PartnerLogin';
import { PartnerDashboard } from './pages/partner/PartnerDashboard';
import { TailorLogin } from './pages/tailor/TailorLogin';
import { TailorDashboard } from './pages/tailor/TailorDashboard';
import { AuthProvider } from './hooks/useAuth';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-white flex flex-col">
          <Routes>
            {/* Public routes with header/footer */}
            <Route path="/" element={
              <>
                <Header />
                <main className="flex-grow">
                  <Home />
                </main>
                <Footer />
                <WhatsAppButton />
              </>
            } />
            <Route path="/about" element={
              <>
                <Header />
                <main className="flex-grow">
                  <About />
                </main>
                <Footer />
                <WhatsAppButton />
              </>
            } />
            <Route path="/services" element={
              <>
                <Header />
                <main className="flex-grow">
                  <Services />
                </main>
                <Footer />
                <WhatsAppButton />
              </>
            } />
            <Route path="/services/:serviceId" element={
              <>
                <Header />
                <main className="flex-grow">
                  <ServiceDetail />
                </main>
                <Footer />
                <WhatsAppButton />
              </>
            } />
            <Route path="/contact" element={
              <>
                <Header />
                <main className="flex-grow">
                  <Contact />
                </main>
                <Footer />
                <WhatsAppButton />
              </>
            } />
            <Route path="/partnerships" element={
              <>
                <Header />
                <main className="flex-grow">
                  <Partnerships />
                </main>
                <Footer />
                <WhatsAppButton />
              </>
            } />
            <Route path="/design" element={
              <>
                <Header />
                <main className="flex-grow">
                  <DressDesigner />
                </main>
                <Footer />
                <WhatsAppButton />
              </>
            } />
            <Route path="/ai-stylist" element={
              <>
                <Header />
                <main className="flex-grow">
                  <AIStylistChat />
                </main>
                <Footer />
                <WhatsAppButton />
              </>
            } />
            <Route path="/saved-designs" element={
              <>
                <Header />
                <main className="flex-grow">
                  <SavedDesigns />
                </main>
                <Footer />
                <WhatsAppButton />
              </>
            } />
            <Route path="/auth" element={
              <>
                <Header />
                <main className="flex-grow">
                  <Auth />
                </main>
                <Footer />
                <WhatsAppButton />
              </>
            } />
            <Route path="/track-order" element={
              <>
                <Header />
                <main className="flex-grow">
                  <OrderTracking />
                </main>
                <Footer />
                <WhatsAppButton />
              </>
            } />

            {/* OMS routes (no header/footer) */}
            <Route path="/oms/login" element={<OMSLogin />} />
            <Route path="/oms/dashboard" element={<OMSDashboard />} />

            {/* Admin routes (no header/footer) */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/dashboard" element={<AdminPanel />} />

            {/* Partner routes (no header/footer) */}
            <Route path="/partner/login" element={<PartnerLogin />} />
            <Route path="/partner/dashboard" element={<PartnerDashboard />} />

            {/* Tailor routes (no header/footer) */}
            <Route path="/tailor/login" element={<TailorLogin />} />
            <Route path="/tailor/dashboard" element={<TailorDashboard />} />

            {/* Redirect /oms to /oms/login */}
            <Route path="/oms" element={<Navigate to="/oms/login" replace />} />
            <Route path="/admin" element={<Navigate to="/admin/login" replace />} />
            <Route path="/partner" element={<Navigate to="/partner/login" replace />} />
            <Route path="/tailor" element={<Navigate to="/tailor/login" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;