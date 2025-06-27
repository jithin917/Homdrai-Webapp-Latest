import React, { useState } from 'react';
import { X, Plus, Minus, Calendar, DollarSign, Upload, Image } from 'lucide-react';
import { orderAPI } from '../../../lib/oms-api';
import type { Customer, Store, Order } from '../../../types/oms';

interface NewOrderModalProps {
  customers: Customer[];
  onClose: () => void;
  onOrderCreated: () => void;
}

// Helper function to calculate expected delivery date
const calculateDeliveryDate = (orderType: Order['type'], priority: Order['priority']): Date => {
  const today = new Date();
  let daysToAdd = 7; // Default 7 days

  // Adjust based on order type
  if (orderType === 'new_stitching') {
    daysToAdd = 14; // 2 weeks for new stitching
  } else if (orderType === 'alterations') {
    daysToAdd = 7; // 1 week for alterations
  }

  // Adjust based on priority
  switch (priority) {
    case 'urgent':
      daysToAdd = Math.max(1, Math.floor(daysToAdd / 4)); // Quarter the time, minimum 1 day
      break;
    case 'high':
      daysToAdd = Math.floor(daysToAdd / 2); // Half the time
      break;
    case 'medium':
      // Keep default
      break;
    case 'low':
      daysToAdd = Math.floor(daysToAdd * 1.5); // Add 50% more time
      break;
  }

  const deliveryDate = new Date(today);
  deliveryDate.setDate(today.getDate() + daysToAdd);
  return deliveryDate;
};

const NewOrderModal: React.FC<NewOrderModalProps> = ({ customers, onClose, onOrderCreated }) => {
  const [formData, setFormData] = useState({
    customerId: '',
    type: 'new_stitching' as Order['type'],
    priority: 'medium' as Order['priority'],
    garmentType: '',
    styleImages: [] as string[],
    fabricImages: [] as string[],
    fabricType: '',
    fabricColor: '',
    fabricQuantity: 0,
    specialInstructions: '',
    totalAmount: 0,
    advancePaid: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [styleImageFile, setStyleImageFile] = useState<File | null>(null);
  const [fabricImageFile, setFabricImageFile] = useState<File | null>(null);
  const [styleImagePreview, setStyleImagePreview] = useState<string | null>(null);
  const [fabricImagePreview, setFabricImagePreview] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: parseFloat(value) || 0
    }));
  };

  const calculateBalance = () => {
    return formData.totalAmount - formData.advancePaid;
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'style' | 'fabric') => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Create a preview URL
    const previewUrl = URL.createObjectURL(file);
    
    if (type === 'style') {
      setStyleImageFile(file);
      setStyleImagePreview(previewUrl);
      // In a real app, you would upload the file to a server and get a URL back
      // For demo purposes, we'll just use the preview URL
      setFormData(prev => ({
        ...prev,
        styleImages: [previewUrl]
      }));
    } else {
      setFabricImageFile(file);
      setFabricImagePreview(previewUrl);
      setFormData(prev => ({
        ...prev,
        fabricImages: [previewUrl]
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Validate form
      if (!formData.customerId || !formData.garmentType) {
        throw new Error('Please fill all required fields');
      }
      
      // In a real app, you would upload the images to a server here
      // and get back URLs to store in the database

      const orderData = {
        customerId: formData.customerId,
        storeId: '', // Will be set by the backend based on the current user's store
        type: formData.type,
        priority: formData.priority,
        garmentType: formData.garmentType,
        styleImages: formData.styleImages,
        fabricImages: formData.fabricImages,
        fabricDetails: {
          type: formData.fabricType,
          color: formData.fabricColor,
          quantity: formData.fabricQuantity,
          unit: 'meters'
        },
        specialInstructions: formData.specialInstructions,
        totalAmount: formData.totalAmount,
        advancePaid: formData.advancePaid,
        balanceAmount: calculateBalance(),
        notes: ''
      };

      const response = await orderAPI.create(orderData);
      
      if (response.success) {
        onOrderCreated();
      } else {
        throw new Error(response.error || 'Failed to create order');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">Create New Order</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Customer Selection */}
            <div>
              <label htmlFor="customerId" className="block text-sm font-medium text-gray-700 mb-2">
                Customer <span className="text-red-500">*</span>
              </label>
              <select
                id="customerId"
                name="customerId"
                value={formData.customerId}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select Customer</option>
                {customers.map(customer => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name} ({customer.phone})
                  </option>
                ))}
              </select>
            </div>

            {/* Store Selection */}

            {/* Order Type */}
            <div>
              <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">
                Order Type <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label className={`flex items-center p-3 border rounded-lg cursor-pointer ${
                  formData.type === 'new_stitching' 
                    ? 'border-blue-500 bg-blue-50 text-blue-700' 
                    : 'border-gray-300 hover:border-blue-300'
                }`}>
                  <input
                    type="radio"
                    name="type"
                    value="new_stitching"
                    checked={formData.type === 'new_stitching'}
                    onChange={handleChange}
                    className="sr-only"
                  />
                  <Plus className="w-5 h-5 mr-2" />
                  <span>New Stitching</span>
                </label>
                <label className={`flex items-center p-3 border rounded-lg cursor-pointer ${
                  formData.type === 'alterations' 
                    ? 'border-blue-500 bg-blue-50 text-blue-700' 
                    : 'border-gray-300 hover:border-blue-300'
                }`}>
                  <input
                    type="radio"
                    name="type"
                    value="alterations"
                    checked={formData.type === 'alterations'}
                    onChange={handleChange}
                    className="sr-only"
                  />
                  <Minus className="w-5 h-5 mr-2" />
                  <span>Alterations</span>
                </label>
              </div>
            </div>

            {/* Priority */}
            <div>
              <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-2">
                Priority
              </label>
              <select
                id="priority"
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            {/* Garment Type */}
            <div>
              <label htmlFor="garmentType" className="block text-sm font-medium text-gray-700 mb-2">
                Garment Type <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="garmentType"
                name="garmentType"
                value={formData.garmentType}
                onChange={handleChange}
                required
                placeholder="e.g., Designer Blouse, Lehenga, etc."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Fabric Type */}
            <div>
              <label htmlFor="fabricType" className="block text-sm font-medium text-gray-700 mb-2">
                Fabric Type
              </label>
              <input
                type="text"
                id="fabricType"
                name="fabricType"
                value={formData.fabricType}
                onChange={handleChange}
                placeholder="e.g., Silk, Cotton, etc."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Fabric Color */}
            <div>
              <label htmlFor="fabricColor" className="block text-sm font-medium text-gray-700 mb-2">
                Fabric Color
              </label>
              <input
                type="text"
                id="fabricColor"
                name="fabricColor"
                value={formData.fabricColor}
                onChange={handleChange}
                placeholder="e.g., Red, Blue, etc."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Fabric Images */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fabric Images
              </label>
              <div className="flex items-center space-x-4">
                <div className="flex-1">
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      {fabricImagePreview ? (
                        <img 
                          src={fabricImagePreview} 
                          alt="Fabric preview" 
                          className="h-24 object-contain"
                        />
                      ) : (
                        <>
                          <Upload className="w-8 h-8 mb-2 text-gray-400" />
                          <p className="text-sm text-gray-500">Upload fabric image</p>
                        </>
                      )}
                    </div>
                    <input 
                      type="file" 
                      className="hidden" 
                      accept="image/*"
                      onChange={(e) => handleImageChange(e, 'fabric')}
                    />
                  </label>
                </div>
              </div>
            </div>

            {/* Fabric Quantity */}
            <div>
              <label htmlFor="fabricQuantity" className="block text-sm font-medium text-gray-700 mb-2">
                Fabric Quantity (meters)
              </label>
              <input
                type="number"
                id="fabricQuantity"
                name="fabricQuantity"
                value={formData.fabricQuantity}
                onChange={handleNumberChange}
                min="0"
                step="0.1"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Total Amount */}
            <div>
              <label htmlFor="totalAmount" className="block text-sm font-medium text-gray-700 mb-2">
                Total Amount <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₹</span>
                <input
                  type="number"
                  id="totalAmount"
                  name="totalAmount"
                  value={formData.totalAmount}
                  onChange={handleNumberChange}
                  required
                  min="0"
                  step="0.01"
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Advance Paid */}
            <div>
              <label htmlFor="advancePaid" className="block text-sm font-medium text-gray-700 mb-2">
                Advance Paid
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₹</span>
                <input
                  type="number"
                  id="advancePaid"
                  name="advancePaid"
                  value={formData.advancePaid}
                  onChange={handleNumberChange}
                  min="0"
                  max={formData.totalAmount}
                  step="0.01"
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Balance Amount (Calculated) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Balance Amount
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₹</span>
                <input
                  type="text"
                  value={calculateBalance().toFixed(2)}
                  readOnly
                  className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-700"
                />
              </div>
            </div>

            {/* Expected Delivery Date (Calculated) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Expected Delivery
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  value={calculateDeliveryDate(formData.type, formData.priority).toLocaleDateString()}
                  readOnly
                  className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-700"
                />
              </div>
            </div>
          </div>

          {/* Special Instructions */}
          <div>
            <label htmlFor="specialInstructions" className="block text-sm font-medium text-gray-700 mb-2">
              Special Instructions
            </label>
            <textarea
              id="specialInstructions"
              name="specialInstructions"
              value={formData.specialInstructions}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Any special requirements or notes..."
            ></textarea>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Creating...</span>
                </>
              ) : (
                <span>Create Order</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewOrderModal;