import React, { useState, useEffect } from 'react';
import { X, Plus, User, Package, Calendar, DollarSign, FileText, Ruler } from 'lucide-react';
import { createOrder } from '../../../services/order-service';
import { getCustomers, createCustomer } from '../../../services/customer-service';
import { generateOrderId, generateCustomerId } from '../../../utils/id-generators';
import { NewCustomerModal } from './NewCustomerModal';
import type { Customer, Order, OrderType, PriorityLevel } from '../../../types/oms';

interface NewOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOrderCreated: (order: Order) => void;
}

const NewOrderModal: React.FC<NewOrderModalProps> = ({
  isOpen,
  onClose,
  onOrderCreated,
}) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoadingCustomers, setIsLoadingCustomers] = useState(false);
  const [showNewCustomerModal, setShowNewCustomerModal] = useState(false);
  const [showCustomMeasurements, setShowCustomMeasurements] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    customer_id: '',
    type: 'new_stitching' as OrderType,
    priority: 'medium' as PriorityLevel,
    garment_type: '',
    fabric_type: '',
    fabric_color: '',
    fabric_quantity: '',
    fabric_unit: 'meters',
    special_instructions: '',
    expected_delivery_date: '',
    total_amount: '',
    advance_paid: '',
    // Custom measurements
    measurements: {
      unit: 'cm' as const,
      top_fl: '',
      top_sh: '',
      top_sl: '',
      top_sr: '',
      top_mr: '',
      top_ah: '',
      top_ch: '',
      top_br: '',
      top_wr: '',
      top_hip: '',
      top_slit: '',
      top_fn: '',
      top_bn: '',
      top_dp: '',
      top_pp: '',
      bottom_fl: '',
      bottom_wr: '',
      bottom_sr: '',
      bottom_tr: '',
      bottom_lr: '',
      bottom_ar: '',
      notes: '',
    },
  });

  // Load customers when modal opens
  useEffect(() => {
    if (isOpen) {
      loadCustomers();
    }
  }, [isOpen]);

  const loadCustomers = async () => {
    setIsLoadingCustomers(true);
    try {
      const customerData = await getCustomers();
      console.log('Loaded customers:', customerData);
      setCustomers(Array.isArray(customerData) ? customerData : []);
    } catch (error) {
      console.error('Error loading customers:', error);
      setCustomers([]);
      setError('Failed to load customers');
    } finally {
      setIsLoadingCustomers(false);
    }
  };

  const handleCustomerCreated = (newCustomer: Customer) => {
    console.log('New customer created:', newCustomer);
    setCustomers(prev => [newCustomer, ...prev]);
    setFormData(prev => ({ ...prev, customer_id: newCustomer.id }));
    setShowNewCustomerModal(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name.startsWith('measurements.')) {
      const measurementField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        measurements: {
          ...prev.measurements,
          [measurementField]: value,
        },
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Validate required fields
      if (!formData.customer_id) {
        throw new Error('Please select a customer');
      }
      if (!formData.garment_type.trim()) {
        throw new Error('Garment type is required');
      }
      if (!formData.expected_delivery_date) {
        throw new Error('Expected delivery date is required');
      }

      // Generate order ID
      const orderId = generateOrderId();
      
      // Prepare order data
      const orderData = {
        id: orderId,
        customer_id: formData.customer_id,
        type: formData.type,
        priority: formData.priority,
        garment_type: formData.garment_type.trim(),
        fabric_type: formData.fabric_type.trim() || null,
        fabric_color: formData.fabric_color.trim() || null,
        fabric_quantity: formData.fabric_quantity ? parseFloat(formData.fabric_quantity) : null,
        fabric_unit: formData.fabric_unit,
        special_instructions: formData.special_instructions.trim() || null,
        expected_delivery_date: formData.expected_delivery_date,
        total_amount: formData.total_amount ? parseFloat(formData.total_amount) : 0,
        advance_paid: formData.advance_paid ? parseFloat(formData.advance_paid) : 0,
        balance_amount: (parseFloat(formData.total_amount || '0') - parseFloat(formData.advance_paid || '0')),
        status: 'pending' as const,
        order_date: new Date().toISOString(),
      };

      console.log('Creating order with data:', orderData);
      
      const newOrder = await createOrder(orderData, showCustomMeasurements ? formData.measurements : null);
      console.log('Order created successfully:', newOrder);
      
      onOrderCreated(newOrder);
      onClose();
      
      // Reset form
      resetForm();
    } catch (err) {
      console.error('Error creating order:', err);
      setError(err instanceof Error ? err.message : 'Failed to create order');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      customer_id: '',
      type: 'new_stitching',
      priority: 'medium',
      garment_type: '',
      fabric_type: '',
      fabric_color: '',
      fabric_quantity: '',
      fabric_unit: 'meters',
      special_instructions: '',
      expected_delivery_date: '',
      total_amount: '',
      advance_paid: '',
      measurements: {
        unit: 'cm',
        top_fl: '',
        top_sh: '',
        top_sl: '',
        top_sr: '',
        top_mr: '',
        top_ah: '',
        top_ch: '',
        top_br: '',
        top_wr: '',
        top_hip: '',
        top_slit: '',
        top_fn: '',
        top_bn: '',
        top_dp: '',
        top_pp: '',
        bottom_fl: '',
        bottom_wr: '',
        bottom_sr: '',
        bottom_tr: '',
        bottom_lr: '',
        bottom_ar: '',
        notes: '',
      },
    });
    setShowCustomMeasurements(false);
    setError(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between p-6 border-b">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <Package className="w-5 h-5 mr-2" />
              Create New Order
            </h2>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              disabled={isLoading}
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                {error}
              </div>
            )}

            {/* Customer Selection */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <User className="w-5 h-5 mr-2" />
                Customer Information
              </h3>
              
              <div className="flex gap-3">
                <div className="flex-1">
                  <label htmlFor="customer_id" className="block text-sm font-medium text-gray-700 mb-1">
                    Select Customer *
                  </label>
                  <select
                    id="customer_id"
                    name="customer_id"
                    value={formData.customer_id}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                    disabled={isLoading || isLoadingCustomers}
                  >
                    <option value="">
                      {isLoadingCustomers ? 'Loading customers...' : 'Select a customer'}
                    </option>
                    {Array.isArray(customers) && customers.map((customer) => (
                      <option key={customer.id} value={customer.id}>
                        {customer.name} - {customer.phone}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={() => setShowNewCustomerModal(true)}
                    className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center"
                    disabled={isLoading}
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add Customer
                  </button>
                </div>
              </div>
            </div>

            {/* Order Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <Package className="w-5 h-5 mr-2" />
                Order Details
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                    Order Type *
                  </label>
                  <select
                    id="type"
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                    disabled={isLoading}
                  >
                    <option value="new_stitching">New Stitching</option>
                    <option value="alterations">Alterations</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-1">
                    Priority Level
                  </label>
                  <select
                    id="priority"
                    name="priority"
                    value={formData.priority}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={isLoading}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="garment_type" className="block text-sm font-medium text-gray-700 mb-1">
                    Garment Type *
                  </label>
                  <input
                    type="text"
                    id="garment_type"
                    name="garment_type"
                    value={formData.garment_type}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Shirt, Dress, Suit"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>
            </div>

            {/* Fabric Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Fabric Details</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label htmlFor="fabric_type" className="block text-sm font-medium text-gray-700 mb-1">
                    Fabric Type
                  </label>
                  <input
                    type="text"
                    id="fabric_type"
                    name="fabric_type"
                    value={formData.fabric_type}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Cotton, Silk, Polyester"
                    disabled={isLoading}
                  />
                </div>

                <div>
                  <label htmlFor="fabric_color" className="block text-sm font-medium text-gray-700 mb-1">
                    Fabric Color
                  </label>
                  <input
                    type="text"
                    id="fabric_color"
                    name="fabric_color"
                    value={formData.fabric_color}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Blue, Red, White"
                    disabled={isLoading}
                  />
                </div>

                <div>
                  <label htmlFor="fabric_quantity" className="block text-sm font-medium text-gray-700 mb-1">
                    Quantity
                  </label>
                  <input
                    type="number"
                    id="fabric_quantity"
                    name="fabric_quantity"
                    value={formData.fabric_quantity}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0.0"
                    step="0.1"
                    min="0"
                    disabled={isLoading}
                  />
                </div>

                <div>
                  <label htmlFor="fabric_unit" className="block text-sm font-medium text-gray-700 mb-1">
                    Unit
                  </label>
                  <select
                    id="fabric_unit"
                    name="fabric_unit"
                    value={formData.fabric_unit}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={isLoading}
                  >
                    <option value="meters">Meters</option>
                    <option value="yards">Yards</option>
                    <option value="pieces">Pieces</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Measurements */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900 flex items-center">
                  <Ruler className="w-5 h-5 mr-2" />
                  Measurements
                </h3>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={showCustomMeasurements}
                    onChange={(e) => setShowCustomMeasurements(e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    disabled={isLoading}
                  />
                  <span className="ml-2 text-sm text-gray-700">Add custom measurements</span>
                </label>
              </div>

              {showCustomMeasurements && (
                <div className="bg-gray-50 p-4 rounded-lg space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Top measurements */}
                    <div className="space-y-3">
                      <h4 className="font-medium text-gray-900">Top Measurements</h4>
                      {[
                        { key: 'top_fl', label: 'Full Length' },
                        { key: 'top_sh', label: 'Shoulder' },
                        { key: 'top_sl', label: 'Sleeve Length' },
                        { key: 'top_ch', label: 'Chest' },
                        { key: 'top_wr', label: 'Waist' },
                        { key: 'top_hip', label: 'Hip' },
                      ].map(({ key, label }) => (
                        <div key={key}>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            {label}
                          </label>
                          <input
                            type="number"
                            name={`measurements.${key}`}
                            value={formData.measurements[key as keyof typeof formData.measurements]}
                            onChange={handleInputChange}
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                            placeholder="0.0"
                            step="0.1"
                            min="0"
                            disabled={isLoading}
                          />
                        </div>
                      ))}
                    </div>

                    {/* Bottom measurements */}
                    <div className="space-y-3">
                      <h4 className="font-medium text-gray-900">Bottom Measurements</h4>
                      {[
                        { key: 'bottom_fl', label: 'Full Length' },
                        { key: 'bottom_wr', label: 'Waist' },
                        { key: 'bottom_sr', label: 'Seat Round' },
                        { key: 'bottom_tr', label: 'Thigh Round' },
                        { key: 'bottom_lr', label: 'Length Round' },
                        { key: 'bottom_ar', label: 'Ankle Round' },
                      ].map(({ key, label }) => (
                        <div key={key}>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            {label}
                          </label>
                          <input
                            type="number"
                            name={`measurements.${key}`}
                            value={formData.measurements[key as keyof typeof formData.measurements]}
                            onChange={handleInputChange}
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                            placeholder="0.0"
                            step="0.1"
                            min="0"
                            disabled={isLoading}
                          />
                        </div>
                      ))}
                    </div>

                    {/* Additional measurements */}
                    <div className="space-y-3">
                      <h4 className="font-medium text-gray-900">Additional</h4>
                      {[
                        { key: 'top_sr', label: 'Shoulder Round' },
                        { key: 'top_mr', label: 'Mid Round' },
                        { key: 'top_ah', label: 'Arm Hole' },
                        { key: 'top_br', label: 'Bicep Round' },
                        { key: 'top_slit', label: 'Slit' },
                        { key: 'top_fn', label: 'Front Neck' },
                      ].map(({ key, label }) => (
                        <div key={key}>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            {label}
                          </label>
                          <input
                            type="number"
                            name={`measurements.${key}`}
                            value={formData.measurements[key as keyof typeof formData.measurements]}
                            onChange={handleInputChange}
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                            placeholder="0.0"
                            step="0.1"
                            min="0"
                            disabled={isLoading}
                          />
                        </div>
                      ))}
                    </div>

                    {/* Final measurements */}
                    <div className="space-y-3">
                      <h4 className="font-medium text-gray-900">Final Details</h4>
                      {[
                        { key: 'top_bn', label: 'Back Neck' },
                        { key: 'top_dp', label: 'Dart Point' },
                        { key: 'top_pp', label: 'Princess Point' },
                      ].map(({ key, label }) => (
                        <div key={key}>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            {label}
                          </label>
                          <input
                            type="number"
                            name={`measurements.${key}`}
                            value={formData.measurements[key as keyof typeof formData.measurements]}
                            onChange={handleInputChange}
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                            placeholder="0.0"
                            step="0.1"
                            min="0"
                            disabled={isLoading}
                          />
                        </div>
                      ))}
                      
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Measurement Notes
                        </label>
                        <textarea
                          name="measurements.notes"
                          value={formData.measurements.notes}
                          onChange={handleInputChange}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                          placeholder="Additional notes..."
                          rows={3}
                          disabled={isLoading}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Delivery & Payment */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <Calendar className="w-5 h-5 mr-2" />
                Delivery & Payment
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="expected_delivery_date" className="block text-sm font-medium text-gray-700 mb-1">
                    Expected Delivery Date *
                  </label>
                  <input
                    type="date"
                    id="expected_delivery_date"
                    name="expected_delivery_date"
                    value={formData.expected_delivery_date}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                    disabled={isLoading}
                  />
                </div>

                <div>
                  <label htmlFor="total_amount" className="block text-sm font-medium text-gray-700 mb-1">
                    Total Amount
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="number"
                      id="total_amount"
                      name="total_amount"
                      value={formData.total_amount}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="advance_paid" className="block text-sm font-medium text-gray-700 mb-1">
                    Advance Paid
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="number"
                      id="advance_paid"
                      name="advance_paid"
                      value={formData.advance_paid}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                      disabled={isLoading}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Special Instructions */}
            <div>
              <label htmlFor="special_instructions" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                <FileText className="w-4 h-4 mr-1" />
                Special Instructions
              </label>
              <textarea
                id="special_instructions"
                name="special_instructions"
                value={formData.special_instructions}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Any special requirements or notes..."
                rows={3}
                disabled={isLoading}
              />
            </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-3 pt-6 border-t">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                disabled={isLoading || !formData.customer_id}
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creating...
                  </>
                ) : (
                  'Create Order'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* New Customer Modal */}
      <NewCustomerModal
        isOpen={showNewCustomerModal}
        onClose={() => setShowNewCustomerModal(false)}
        onCustomerCreated={handleCustomerCreated}
      />
    </>
  );
};

// Export both named and default exports for compatibility
export { NewOrderModal };
export default NewOrderModal;