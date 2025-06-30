import React, { useState, useEffect } from 'react';
import { X, Plus, User, Package, Calendar, IndianRupee } from 'lucide-react';
import { createOrder } from '../../../services/order-service';
import { getCustomers, createCustomer } from '../../../services/customer-service';
import { NewCustomerModal } from './NewCustomerModal';
import type { Customer, OrderFormData } from '../../../types/oms';

interface NewOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOrderCreated: () => void;
}

function NewOrderModal({ isOpen, onClose, onOrderCreated }: NewOrderModalProps) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [showNewCustomerModal, setShowNewCustomerModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<OrderFormData>({
    customerId: '',
    type: 'new_stitching',
    priority: 'medium',
    garmentType: '',
    fabricType: '',
    fabricColor: '',
    fabricQuantity: 0,
    totalAmount: 0,
    advancePaid: 0,
    expectedDeliveryDate: '',
    specialInstructions: '',
    measurements: {}
  });

  useEffect(() => {
    if (isOpen) {
      loadCustomers();
    }
  }, [isOpen]);

  const loadCustomers = async () => {
    try {
      const data = await getCustomers();
      console.log('Loaded customers:', data); // Debug log
      setCustomers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error loading customers:', error);
      setCustomers([]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.customerId) {
      alert('Please select a customer');
      return;
    }

    setLoading(true);
    try {
      await createOrder(formData);
      onOrderCreated();
      onClose();
      resetForm();
    } catch (error) {
      console.error('Error creating order:', error);
      alert('Failed to create order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      customerId: '',
      type: 'new_stitching',
      priority: 'medium',
      garmentType: '',
      fabricType: '',
      fabricColor: '',
      fabricQuantity: 0,
      totalAmount: 0,
      advancePaid: 0,
      expectedDeliveryDate: '',
      specialInstructions: '',
      measurements: {}
    });
  };

  const handleNewCustomerCreated = async (customerData: Omit<Customer, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const newCustomer = await createCustomer(customerData);
      console.log('New customer created:', newCustomer); // Debug log
      await loadCustomers(); // Reload customers list
      setFormData(prev => ({ ...prev, customerId: newCustomer.id }));
      setShowNewCustomerModal(false);
    } catch (error) {
      console.error('Error creating customer:', error);
      alert('Failed to create customer. Please try again.');
    }
  };

  const calculateBalanceAmount = () => {
    return Math.max(0, formData.totalAmount - formData.advancePaid);
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between p-6 border-b">
            <h2 className="text-xl font-semibold text-gray-900">Create New Order</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Customer Information */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <User className="h-5 w-5 text-blue-600" />
                <h3 className="text-lg font-medium text-gray-900">Customer Information</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Customer <span className="text-red-500">*</span>
                  </label>
                  <div className="flex space-x-2">
                    <select
                      value={formData.customerId}
                      onChange={(e) => setFormData(prev => ({ ...prev, customerId: e.target.value }))}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      <option value="">Select Customer</option>
                      {customers.map((customer) => (
                        <option key={customer.id} value={customer.id}>
                          {customer.name} - {customer.phone}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => setShowNewCustomerModal(true)}
                      className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center"
                      title="Add New Customer"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  {customers.length === 0 && (
                    <p className="text-sm text-gray-500 mt-1">No customers found. Click + to add a new customer.</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Order Details */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Package className="h-5 w-5 text-green-600" />
                <h3 className="text-lg font-medium text-gray-900">Order Details</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Order Type <span className="text-red-500">*</span>
                  </label>
                  <div className="flex space-x-2">
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, type: 'new_stitching' }))}
                      className={`flex-1 px-4 py-2 rounded-md border transition-colors flex items-center justify-center space-x-2 ${
                        formData.type === 'new_stitching'
                          ? 'bg-blue-50 border-blue-500 text-blue-700'
                          : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <Plus className="h-4 w-4" />
                      <span>New Stitching</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, type: 'alterations' }))}
                      className={`flex-1 px-4 py-2 rounded-md border transition-colors ${
                        formData.type === 'alterations'
                          ? 'bg-blue-50 border-blue-500 text-blue-700'
                          : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      Alterations
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Garment Type <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.garmentType}
                    onChange={(e) => setFormData(prev => ({ ...prev, garmentType: e.target.value }))}
                    placeholder="e.g., Designer Blouse, Lehenga, etc."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fabric Type</label>
                  <input
                    type="text"
                    value={formData.fabricType}
                    onChange={(e) => setFormData(prev => ({ ...prev, fabricType: e.target.value }))}
                    placeholder="e.g., Silk, Cotton, etc."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fabric Color</label>
                  <input
                    type="text"
                    value={formData.fabricColor}
                    onChange={(e) => setFormData(prev => ({ ...prev, fabricColor: e.target.value }))}
                    placeholder="e.g., Red, Blue, etc."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fabric Quantity (meters)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={formData.fabricQuantity}
                    onChange={(e) => setFormData(prev => ({ ...prev, fabricQuantity: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Total Amount <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <IndianRupee className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="number"
                      min="0"
                      value={formData.totalAmount}
                      onChange={(e) => setFormData(prev => ({ ...prev, totalAmount: parseFloat(e.target.value) || 0 }))}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Advance Paid</label>
                  <div className="relative">
                    <IndianRupee className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="number"
                      min="0"
                      max={formData.totalAmount}
                      value={formData.advancePaid}
                      onChange={(e) => setFormData(prev => ({ ...prev, advancePaid: parseFloat(e.target.value) || 0 }))}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Balance Amount</label>
                  <div className="relative">
                    <IndianRupee className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="number"
                      value={calculateBalanceAmount()}
                      readOnly
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Delivery Information */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-purple-600" />
                <h3 className="text-lg font-medium text-gray-900">Delivery Information</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Expected Delivery Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.expectedDeliveryDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, expectedDeliveryDate: e.target.value }))}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Special Instructions</label>
                <textarea
                  value={formData.specialInstructions}
                  onChange={(e) => setFormData(prev => ({ ...prev, specialInstructions: e.target.value }))}
                  rows={3}
                  placeholder="Any special requirements or notes..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-3 pt-6 border-t">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Creating...' : 'Create Order'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* New Customer Modal */}
      <NewCustomerModal
        isOpen={showNewCustomerModal}
        onClose={() => setShowNewCustomerModal(false)}
        onCustomerCreated={handleNewCustomerCreated}
      />
    </>
  );
}

export default NewOrderModal;