import React, { useState } from 'react';
import { Building2, Handshake, CheckCircle, Send } from 'lucide-react';
import { api } from '../lib/supabase';

const Partnerships = () => {
  const [activeTab, setActiveTab] = useState('bulk-orders');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Complete bulk order form with all required fields
  const [bulkOrderForm, setBulkOrderForm] = useState({
    companyName: '',
    contactPerson: '',
    designation: '',
    email: '',
    phone: '',
    companyAddress: '',
    city: '',
    state: '',
    country: '',
    website: '',
    businessType: '',
    productCategory: '',
    orderQuantity: '',
    orderFrequency: '',
    targetPrice: '',
    qualityRequirements: '',
    deliveryTimeline: '',
    packagingRequirements: '',
    certificationNeeds: '',
    additionalRequirements: ''
  });

  // Complete partnership form with all required fields
  const [partnershipForm, setPartnershipForm] = useState({
    unitName: '',
    ownerName: '',
    email: '',
    phone: '',
    unitAddress: '',
    city: '',
    state: '',
    establishedYear: '',
    totalWorkers: '',
    machineCapacity: '',
    monthlyCapacity: '',
    specializations: '',
    qualityCertifications: '',
    currentClients: '',
    averageOrderValue: '',
    paymentTerms: '',
    workingHours: '',
    qualityControlProcess: '',
    sampleCapability: '',
    businessReferences: ''
  });

  const handleBulkOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.createBulkOrderInquiry(bulkOrderForm);
      setSuccess(true);
      setBulkOrderForm({
        companyName: '',
        contactPerson: '',
        designation: '',
        email: '',
        phone: '',
        companyAddress: '',
        city: '',
        state: '',
        country: '',
        website: '',
        businessType: '',
        productCategory: '',
        orderQuantity: '',
        orderFrequency: '',
        targetPrice: '',
        qualityRequirements: '',
        deliveryTimeline: '',
        packagingRequirements: '',
        certificationNeeds: '',
        additionalRequirements: ''
      });
    } catch (error) {
      alert('Error submitting inquiry. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePartnershipSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.createStitchingPartnership(partnershipForm);
      setSuccess(true);
      setPartnershipForm({
        unitName: '',
        ownerName: '',
        email: '',
        phone: '',
        unitAddress: '',
        city: '',
        state: '',
        establishedYear: '',
        totalWorkers: '',
        machineCapacity: '',
        monthlyCapacity: '',
        specializations: '',
        qualityCertifications: '',
        currentClients: '',
        averageOrderValue: '',
        paymentTerms: '',
        workingHours: '',
        qualityControlProcess: '',
        sampleCapability: '',
        businessReferences: ''
      });
    } catch (error) {
      alert('Error submitting application. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="pt-16 min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full mx-4">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-6" />
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Thank You!</h1>
            <p className="text-gray-600 mb-6">
              Your submission has been received. We'll get in touch with you shortly.
            </p>
            <button
              onClick={() => setSuccess(false)}
              className="bg-gradient-to-r from-primary-600 to-secondary-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-300"
            >
              Submit Another
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-16">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-50 to-secondary-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl lg:text-5xl font-display font-bold text-gray-900 mb-6">
            B2B Partnerships
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Partner with Homdrai for bulk orders and stitching collaborations.
          </p>
        </div>
      </section>

      {/* Tabs */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center mb-12">
            <div className="flex space-x-4 bg-gray-100 p-2 rounded-lg">
              <button
                onClick={() => setActiveTab('bulk-orders')}
                className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 flex items-center space-x-2 ${
                  activeTab === 'bulk-orders'
                    ? 'bg-primary-600 text-white shadow-lg'
                    : 'text-gray-700 hover:bg-primary-50'
                }`}
              >
                <Building2 className="w-5 h-5" />
                <span>Bulk Orders</span>
              </button>
              <button
                onClick={() => setActiveTab('stitching-partnership')}
                className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 flex items-center space-x-2 ${
                  activeTab === 'stitching-partnership'
                    ? 'bg-primary-600 text-white shadow-lg'
                    : 'text-gray-700 hover:bg-primary-50'
                }`}
              >
                <Handshake className="w-5 h-5" />
                <span>Partnership</span>
              </button>
            </div>
          </div>

          {/* Bulk Orders Form */}
          {activeTab === 'bulk-orders' && (
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Bulk Order Inquiry</h2>
              <form onSubmit={handleBulkOrderSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Company Name *</label>
                    <input
                      type="text"
                      required
                      value={bulkOrderForm.companyName}
                      onChange={(e) => setBulkOrderForm({ ...bulkOrderForm, companyName: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Contact Person *</label>
                    <input
                      type="text"
                      required
                      value={bulkOrderForm.contactPerson}
                      onChange={(e) => setBulkOrderForm({ ...bulkOrderForm, contactPerson: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Designation *</label>
                    <input
                      type="text"
                      required
                      value={bulkOrderForm.designation}
                      onChange={(e) => setBulkOrderForm({ ...bulkOrderForm, designation: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                    <input
                      type="email"
                      required
                      value={bulkOrderForm.email}
                      onChange={(e) => setBulkOrderForm({ ...bulkOrderForm, email: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone *</label>
                    <input
                      type="tel"
                      required
                      value={bulkOrderForm.phone}
                      onChange={(e) => setBulkOrderForm({ ...bulkOrderForm, phone: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Company Address *</label>
                    <input
                      type="text"
                      required
                      value={bulkOrderForm.companyAddress}
                      onChange={(e) => setBulkOrderForm({ ...bulkOrderForm, companyAddress: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">City *</label>
                    <input
                      type="text"
                      required
                      value={bulkOrderForm.city}
                      onChange={(e) => setBulkOrderForm({ ...bulkOrderForm, city: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">State *</label>
                    <input
                      type="text"
                      required
                      value={bulkOrderForm.state}
                      onChange={(e) => setBulkOrderForm({ ...bulkOrderForm, state: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Country *</label>
                    <input
                      type="text"
                      required
                      value={bulkOrderForm.country}
                      onChange={(e) => setBulkOrderForm({ ...bulkOrderForm, country: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Website</label>
                    <input
                      type="url"
                      value={bulkOrderForm.website}
                      onChange={(e) => setBulkOrderForm({ ...bulkOrderForm, website: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Business Type *</label>
                    <select
                      required
                      value={bulkOrderForm.businessType}
                      onChange={(e) => setBulkOrderForm({ ...bulkOrderForm, businessType: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      <option value="">Select Business Type</option>
                      <option value="retailer">Retailer</option>
                      <option value="wholesaler">Wholesaler</option>
                      <option value="distributor">Distributor</option>
                      <option value="manufacturer">Manufacturer</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Product Category *</label>
                    <select
                      required
                      value={bulkOrderForm.productCategory}
                      onChange={(e) => setBulkOrderForm({ ...bulkOrderForm, productCategory: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      <option value="">Select Category</option>
                      <option value="blouses">Blouses</option>
                      <option value="lehengas">Lehengas</option>
                      <option value="gowns">Gowns</option>
                      <option value="sarees">Sarees</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Order Quantity *</label>
                    <select
                      required
                      value={bulkOrderForm.orderQuantity}
                      onChange={(e) => setBulkOrderForm({ ...bulkOrderForm, orderQuantity: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      <option value="">Select Quantity</option>
                      <option value="100-500">100-500 pieces</option>
                      <option value="500-1000">500-1000 pieces</option>
                      <option value="1000+">1000+ pieces</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Order Frequency *</label>
                    <select
                      required
                      value={bulkOrderForm.orderFrequency}
                      onChange={(e) => setBulkOrderForm({ ...bulkOrderForm, orderFrequency: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      <option value="">Select Frequency</option>
                      <option value="monthly">Monthly</option>
                      <option value="quarterly">Quarterly</option>
                      <option value="bi-annually">Bi-annually</option>
                      <option value="annually">Annually</option>
                      <option value="one-time">One-time</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Target Price Range</label>
                    <input
                      type="text"
                      value={bulkOrderForm.targetPrice}
                      onChange={(e) => setBulkOrderForm({ ...bulkOrderForm, targetPrice: e.target.value })}
                      placeholder="e.g., $10-15 per piece"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Quality Requirements *</label>
                    <select
                      required
                      value={bulkOrderForm.qualityRequirements}
                      onChange={(e) => setBulkOrderForm({ ...bulkOrderForm, qualityRequirements: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      <option value="">Select Quality Level</option>
                      <option value="premium">Premium</option>
                      <option value="standard">Standard</option>
                      <option value="economy">Economy</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Delivery Timeline *</label>
                    <select
                      required
                      value={bulkOrderForm.deliveryTimeline}
                      onChange={(e) => setBulkOrderForm({ ...bulkOrderForm, deliveryTimeline: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      <option value="">Select Timeline</option>
                      <option value="1-2 weeks">1-2 weeks</option>
                      <option value="3-4 weeks">3-4 weeks</option>
                      <option value="1-2 months">1-2 months</option>
                      <option value="3+ months">3+ months</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Packaging Requirements</label>
                    <textarea
                      value={bulkOrderForm.packagingRequirements}
                      onChange={(e) => setBulkOrderForm({ ...bulkOrderForm, packagingRequirements: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Describe your packaging requirements..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Certification Needs</label>
                    <textarea
                      value={bulkOrderForm.certificationNeeds}
                      onChange={(e) => setBulkOrderForm({ ...bulkOrderForm, certificationNeeds: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Any specific certifications required..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Additional Requirements</label>
                    <textarea
                      value={bulkOrderForm.additionalRequirements}
                      onChange={(e) => setBulkOrderForm({ ...bulkOrderForm, additionalRequirements: e.target.value })}
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Any other specific requirements or notes..."
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-primary-600 to-secondary-600 text-white py-4 px-6 rounded-lg font-semibold text-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 flex items-center justify-center space-x-2"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      <span>Submit Inquiry</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* Partnership Form */}
          {activeTab === 'stitching-partnership' && (
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Partnership Application</h2>
              <form onSubmit={handlePartnershipSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Unit Name *</label>
                    <input
                      type="text"
                      required
                      value={partnershipForm.unitName}
                      onChange={(e) => setPartnershipForm({ ...partnershipForm, unitName: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Owner Name *</label>
                    <input
                      type="text"
                      required
                      value={partnershipForm.ownerName}
                      onChange={(e) => setPartnershipForm({ ...partnershipForm, ownerName: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                    <input
                      type="email"
                      required
                      value={partnershipForm.email}
                      onChange={(e) => setPartnershipForm({ ...partnershipForm, email: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone *</label>
                    <input
                      type="tel"
                      required
                      value={partnershipForm.phone}
                      onChange={(e) => setPartnershipForm({ ...partnershipForm, phone: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Unit Address *</label>
                    <input
                      type="text"
                      required
                      value={partnershipForm.unitAddress}
                      onChange={(e) => setPartnershipForm({ ...partnershipForm, unitAddress: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">City *</label>
                    <input
                      type="text"
                      required
                      value={partnershipForm.city}
                      onChange={(e) => setPartnershipForm({ ...partnershipForm, city: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">State *</label>
                    <input
                      type="text"
                      required
                      value={partnershipForm.state}
                      onChange={(e) => setPartnershipForm({ ...partnershipForm, state: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Established Year *</label>
                    <input
                      type="number"
                      required
                      min="1900"
                      max="2024"
                      value={partnershipForm.establishedYear}
                      onChange={(e) => setPartnershipForm({ ...partnershipForm, establishedYear: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Total Workers *</label>
                    <select
                      required
                      value={partnershipForm.totalWorkers}
                      onChange={(e) => setPartnershipForm({ ...partnershipForm, totalWorkers: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      <option value="">Select Worker Count</option>
                      <option value="1-10">1-10 workers</option>
                      <option value="11-25">11-25 workers</option>
                      <option value="26-50">26-50 workers</option>
                      <option value="51-100">51-100 workers</option>
                      <option value="100+">100+ workers</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Machine Capacity *</label>
                    <input
                      type="text"
                      required
                      value={partnershipForm.machineCapacity}
                      onChange={(e) => setPartnershipForm({ ...partnershipForm, machineCapacity: e.target.value })}
                      placeholder="e.g., 20 sewing machines, 5 overlock"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Monthly Capacity *</label>
                    <select
                      required
                      value={partnershipForm.monthlyCapacity}
                      onChange={(e) => setPartnershipForm({ ...partnershipForm, monthlyCapacity: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      <option value="">Select Monthly Capacity</option>
                      <option value="100-500">100-500 pieces</option>
                      <option value="500-1000">500-1000 pieces</option>
                      <option value="1000-2000">1000-2000 pieces</option>
                      <option value="2000+">2000+ pieces</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Specializations *</label>
                    <input
                      type="text"
                      required
                      value={partnershipForm.specializations}
                      onChange={(e) => setPartnershipForm({ ...partnershipForm, specializations: e.target.value })}
                      placeholder="e.g., Blouses, Lehengas, Embroidery"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Payment Terms *</label>
                    <select
                      required
                      value={partnershipForm.paymentTerms}
                      onChange={(e) => setPartnershipForm({ ...partnershipForm, paymentTerms: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      <option value="">Select Payment Terms</option>
                      <option value="advance">100% Advance</option>
                      <option value="50-50">50% Advance, 50% on Delivery</option>
                      <option value="30-70">30% Advance, 70% on Delivery</option>
                      <option value="net-30">Net 30 days</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Working Hours *</label>
                    <input
                      type="text"
                      required
                      value={partnershipForm.workingHours}
                      onChange={(e) => setPartnershipForm({ ...partnershipForm, workingHours: e.target.value })}
                      placeholder="e.g., 9 AM - 6 PM, Monday to Saturday"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Quality Control Process *</label>
                    <input
                      type="text"
                      required
                      value={partnershipForm.qualityControlProcess}
                      onChange={(e) => setPartnershipForm({ ...partnershipForm, qualityControlProcess: e.target.value })}
                      placeholder="Describe your quality control process"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Sample Capability *</label>
                    <select
                      required
                      value={partnershipForm.sampleCapability}
                      onChange={(e) => setPartnershipForm({ ...partnershipForm, sampleCapability: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      <option value="">Can you make samples?</option>
                      <option value="yes">Yes, we can make samples</option>
                      <option value="no">No, we don't make samples</option>
                      <option value="limited">Limited sample capability</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Quality Certifications</label>
                    <textarea
                      value={partnershipForm.qualityCertifications}
                      onChange={(e) => setPartnershipForm({ ...partnershipForm, qualityCertifications: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="List any quality certifications you have..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Current Clients</label>
                    <textarea
                      value={partnershipForm.currentClients}
                      onChange={(e) => setPartnershipForm({ ...partnershipForm, currentClients: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="List some of your current clients (optional)..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Average Order Value</label>
                    <input
                      type="text"
                      value={partnershipForm.averageOrderValue}
                      onChange={(e) => setPartnershipForm({ ...partnershipForm, averageOrderValue: e.target.value })}
                      placeholder="e.g., $5000-10000 per order"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Business References</label>
                    <textarea
                      value={partnershipForm.businessReferences}
                      onChange={(e) => setPartnershipForm({ ...partnershipForm, businessReferences: e.target.value })}
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Provide business references or testimonials..."
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-primary-600 to-secondary-600 text-white py-4 px-6 rounded-lg font-semibold text-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 flex items-center justify-center space-x-2"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      <span>Submit Application</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Partnerships;