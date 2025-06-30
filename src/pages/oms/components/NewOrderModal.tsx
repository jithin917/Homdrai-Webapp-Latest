import React, { useState, useEffect } from 'react';
import { X, Plus, User, Calendar, Package, Ruler, ChevronDown, ChevronUp, Copy, Save, Info } from 'lucide-react';
import { createOrder } from '../../../services/order-service';
import { getCustomers, createCustomer } from '../../../services/customer-service';
import { getMeasurementsByCustomerId, saveMeasurements } from '../../../services/measurements-service';
import { generateOrderId } from '../../../utils/id-generators';
import { formatDate } from '../../../utils/date-utils';
import type { Customer, OrderFormData, CustomerMeasurements } from '../../../types/oms';

interface NewOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOrderCreated: () => void;
  selectedCustomer?: Customer | null;
}

interface MeasurementField {
  key: keyof CustomerMeasurements;
  label: string;
  min: number;
  max: number;
  unit: string;
  icon: string;
  tooltip: string;
}

const measurementGroups = {
  basic: {
    title: 'Basic Measurements',
    fields: [
      { key: 'height' as keyof CustomerMeasurements, label: 'Height', min: 120, max: 220, unit: 'cm', icon: '📏', tooltip: 'Stand straight against a wall, measure from floor to top of head' },
      { key: 'weight' as keyof CustomerMeasurements, label: 'Weight', min: 30, max: 200, unit: 'kg', icon: '⚖️', tooltip: 'Measure without heavy clothing or shoes' }
    ] as MeasurementField[]
  },
  upperBody: {
    title: 'Upper Body',
    fields: [
      { key: 'top_ch' as keyof CustomerMeasurements, label: 'Chest', min: 60, max: 160, unit: 'cm', icon: '👕', tooltip: 'Measure around the fullest part of chest, under arms' },
      { key: 'top_sh' as keyof CustomerMeasurements, label: 'Shoulder', min: 30, max: 60, unit: 'cm', icon: '🤷', tooltip: 'Measure from shoulder point to shoulder point across back' },
      { key: 'top_sl' as keyof CustomerMeasurements, label: 'Arm Length', min: 40, max: 80, unit: 'cm', icon: '💪', tooltip: 'Measure from shoulder to wrist with arm slightly bent' },
      { key: 'neck_circumference' as keyof CustomerMeasurements, label: 'Neck', min: 25, max: 60, unit: 'cm', icon: '👔', tooltip: 'Measure around the base of neck where collar sits' }
    ] as MeasurementField[]
  },
  lowerBody: {
    title: 'Lower Body',
    fields: [
      { key: 'top_wr' as keyof CustomerMeasurements, label: 'Waist', min: 50, max: 150, unit: 'cm', icon: '👖', tooltip: 'Measure around natural waistline, above hip bones' },
      { key: 'top_hip' as keyof CustomerMeasurements, label: 'Hip', min: 60, max: 160, unit: 'cm', icon: '🍑', tooltip: 'Measure around fullest part of hips and buttocks' },
      { key: 'bottom_fl' as keyof CustomerMeasurements, label: 'Inseam', min: 50, max: 100, unit: 'cm', icon: '📐', tooltip: 'Measure from crotch to ankle along inside of leg' }
    ] as MeasurementField[]
  }
};

export default function NewOrderModal({ isOpen, onClose, onOrderCreated, selectedCustomer }: NewOrderModalProps) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [showNewCustomer, setShowNewCustomer] = useState(false);
  const [loading, setLoading] = useState(false);
  const [measurementsExpanded, setMeasurementsExpanded] = useState(false);
  const [existingMeasurements, setExistingMeasurements] = useState<CustomerMeasurements | null>(null);
  const [measurementsSaved, setMeasurementsSaved] = useState(false);

  const [formData, setFormData] = useState<OrderFormData>({
    customerId: selectedCustomer?.id || '',
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
    styleImages: [],
    fabricImages: []
  });

  const [measurements, setMeasurements] = useState<Partial<CustomerMeasurements>>({
    unit: 'cm'
  });

  const [newCustomer, setNewCustomer] = useState({
    name: '',
    phone: '',
    email: '',
    address_street: '',
    address_city: '',
    address_state: '',
    address_pin_code: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [measurementErrors, setMeasurementErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      loadCustomers();
      if (selectedCustomer) {
        setFormData(prev => ({ ...prev, customerId: selectedCustomer.id }));
        loadCustomerMeasurements(selectedCustomer.id);
      }
    }
  }, [isOpen, selectedCustomer]);

  const loadCustomers = async () => {
    try {
      const data = await getCustomers();
      setCustomers(data);
    } catch (error) {
      console.error('Error loading customers:', error);
    }
  };

  const loadCustomerMeasurements = async (customerId: string) => {
    try {
      const data = await getMeasurementsByCustomerId(customerId);
      if (data) {
        setExistingMeasurements(data);
        setMeasurements(data);
      }
    } catch (error) {
      console.error('Error loading measurements:', error);
    }
  };

  const validateMeasurement = (field: MeasurementField, value: number): string | null => {
    if (value < field.min || value > field.max) {
      return `${field.label} must be between ${field.min} and ${field.max} ${field.unit}`;
    }
    return null;
  };

  const handleMeasurementChange = (field: MeasurementField, value: string) => {
    const numValue = parseFloat(value) || 0;
    setMeasurements(prev => ({ ...prev, [field.key]: numValue }));
    
    // Validate measurement
    const error = validateMeasurement(field, numValue);
    setMeasurementErrors(prev => ({
      ...prev,
      [field.key]: error || ''
    }));
  };

  const copyFromPreviousMeasurements = () => {
    if (existingMeasurements) {
      setMeasurements(existingMeasurements);
      setMeasurementErrors({});
    }
  };

  const saveMeasurementsOnly = async () => {
    if (!formData.customerId) {
      alert('Please select a customer first');
      return;
    }

    try {
      setLoading(true);
      await saveMeasurements(formData.customerId, measurements as CustomerMeasurements);
      setMeasurementsSaved(true);
      setTimeout(() => setMeasurementsSaved(false), 2000);
    } catch (error) {
      console.error('Error saving measurements:', error);
      alert('Failed to save measurements');
    } finally {
      setLoading(false);
    }
  };

  const getCompletedMeasurementsCount = (): number => {
    const allFields = [
      ...measurementGroups.basic.fields,
      ...measurementGroups.upperBody.fields,
      ...measurementGroups.lowerBody.fields
    ];
    
    return allFields.filter(field => {
      const value = measurements[field.key];
      return value && value > 0 && !measurementErrors[field.key];
    }).length;
  };

  const getTotalMeasurementsCount = (): number => {
    return measurementGroups.basic.fields.length + 
           measurementGroups.upperBody.fields.length + 
           measurementGroups.lowerBody.fields.length;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    const newErrors: Record<string, string> = {};
    
    if (!formData.customerId) newErrors.customerId = 'Customer is required';
    if (!formData.garmentType) newErrors.garmentType = 'Garment type is required';
    if (!formData.expectedDeliveryDate) newErrors.expectedDeliveryDate = 'Expected delivery date is required';
    if (formData.totalAmount <= 0) newErrors.totalAmount = 'Total amount must be greater than 0';
    
    // Validate measurements if any are provided
    const measurementValidationErrors: Record<string, string> = {};
    Object.entries(measurementGroups).forEach(([groupKey, group]) => {
      group.fields.forEach(field => {
        const value = measurements[field.key];
        if (value && value > 0) {
          const error = validateMeasurement(field, value);
          if (error) {
            measurementValidationErrors[field.key] = error;
          }
        }
      });
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    if (Object.keys(measurementValidationErrors).length > 0) {
      setMeasurementErrors(measurementValidationErrors);
      return;
    }

    try {
      setLoading(true);
      
      const orderId = generateOrderId();
      const balanceAmount = formData.totalAmount - formData.advancePaid;
      
      const orderData = {
        ...formData,
        id: orderId,
        balanceAmount,
        orderDate: new Date().toISOString(),
        status: 'pending' as const
      };

      await createOrder(orderData);
      
      // Save measurements if provided
      if (formData.customerId && Object.keys(measurements).length > 1) {
        await saveMeasurements(formData.customerId, measurements as CustomerMeasurements);
      }
      
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
      styleImages: [],
      fabricImages: []
    });
    setMeasurements({ unit: 'cm' });
    setErrors({});
    setMeasurementErrors({});
    setShowNewCustomer(false);
    setMeasurementsExpanded(false);
    setExistingMeasurements(null);
  };

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newCustomer.name || !newCustomer.phone) {
      alert('Name and phone are required');
      return;
    }

    try {
      setLoading(true);
      const customer = await createCustomer(newCustomer);
      await loadCustomers();
      setFormData(prev => ({ ...prev, customerId: customer.id }));
      setShowNewCustomer(false);
      setNewCustomer({
        name: '',
        phone: '',
        email: '',
        address_street: '',
        address_city: '',
        address_state: '',
        address_pin_code: ''
      });
    } catch (error) {
      console.error('Error creating customer:', error);
      alert('Failed to create customer');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const completedMeasurements = getCompletedMeasurementsCount();
  const totalMeasurements = getTotalMeasurementsCount();
  const progressPercentage = (completedMeasurements / totalMeasurements) * 100;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Create New Order</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="overflow-y-auto max-h-[calc(90vh-140px)]">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Customer Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <User className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-medium text-gray-900">Customer Information</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Customer <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-2">
                    <select
                      value={formData.customerId}
                      onChange={(e) => {
                        setFormData(prev => ({ ...prev, customerId: e.target.value }));
                        if (e.target.value) {
                          loadCustomerMeasurements(e.target.value);
                        }
                      }}
                      className={`flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.customerId ? 'border-red-500' : 'border-gray-300'
                      }`}
                    >
                      <option value="">Select Customer</option>
                      {customers.map(customer => (
                        <option key={customer.id} value={customer.id}>
                          {customer.name} - {customer.phone}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => setShowNewCustomer(true)}
                      className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  {errors.customerId && <p className="text-red-500 text-sm mt-1">{errors.customerId}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Order Details Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Package className="w-5 h-5 text-green-600" />
                <h3 className="text-lg font-medium text-gray-900">Order Details</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Order Type <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, type: 'new_stitching' }))}
                      className={`flex-1 px-4 py-2 rounded-md border transition-colors ${
                        formData.type === 'new_stitching'
                          ? 'bg-blue-50 border-blue-500 text-blue-700'
                          : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <Plus className="w-4 h-4 inline mr-2" />
                      New Stitching
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
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.garmentType ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.garmentType && <p className="text-red-500 text-sm mt-1">{errors.garmentType}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fabric Type</label>
                  <input
                    type="text"
                    value={formData.fabricType}
                    onChange={(e) => setFormData(prev => ({ ...prev, fabricType: e.target.value }))}
                    placeholder="e.g., Silk, Cotton, etc."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fabric Color</label>
                  <input
                    type="text"
                    value={formData.fabricColor}
                    onChange={(e) => setFormData(prev => ({ ...prev, fabricColor: e.target.value }))}
                    placeholder="e.g., Red, Blue, etc."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Total Amount <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-gray-500">₹</span>
                    <input
                      type="number"
                      min="0"
                      value={formData.totalAmount}
                      onChange={(e) => setFormData(prev => ({ ...prev, totalAmount: parseFloat(e.target.value) || 0 }))}
                      className={`w-full pl-8 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.totalAmount ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                  </div>
                  {errors.totalAmount && <p className="text-red-500 text-sm mt-1">{errors.totalAmount}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Advance Paid</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-gray-500">₹</span>
                    <input
                      type="number"
                      min="0"
                      max={formData.totalAmount}
                      value={formData.advancePaid}
                      onChange={(e) => setFormData(prev => ({ ...prev, advancePaid: parseFloat(e.target.value) || 0 }))}
                      className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Balance Amount</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-gray-500">₹</span>
                    <input
                      type="text"
                      value={(formData.totalAmount - formData.advancePaid).toFixed(2)}
                      readOnly
                      className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Expected Delivery <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                    <input
                      type="date"
                      value={formData.expectedDeliveryDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, expectedDeliveryDate: e.target.value }))}
                      min={formatDate(new Date())}
                      className={`w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.expectedDeliveryDate ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                  </div>
                  {errors.expectedDeliveryDate && <p className="text-red-500 text-sm mt-1">{errors.expectedDeliveryDate}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Special Instructions</label>
                <textarea
                  value={formData.specialInstructions}
                  onChange={(e) => setFormData(prev => ({ ...prev, specialInstructions: e.target.value }))}
                  placeholder="Any special requirements or notes..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Customer Measurements Section */}
            <div className="space-y-4">
              <div className="border-t border-gray-200 pt-6">
                <button
                  type="button"
                  onClick={() => setMeasurementsExpanded(!measurementsExpanded)}
                  className="flex items-center justify-between w-full p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Ruler className="w-5 h-5 text-purple-600" />
                    <div className="text-left">
                      <h3 className="text-lg font-medium text-gray-900">Customer Measurements</h3>
                      <p className="text-sm text-gray-600">
                        {completedMeasurements} of {totalMeasurements} measurements completed
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${progressPercentage}%` }}
                      />
                    </div>
                    {measurementsExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </div>
                </button>

                {measurementsExpanded && (
                  <div className="mt-4 space-y-6">
                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-2">
                      {existingMeasurements && (
                        <button
                          type="button"
                          onClick={copyFromPreviousMeasurements}
                          className="flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 transition-colors"
                        >
                          <Copy className="w-4 h-4" />
                          Copy from Previous Order
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={saveMeasurementsOnly}
                        disabled={!formData.customerId || loading}
                        className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${
                          measurementsSaved
                            ? 'bg-green-50 text-green-700'
                            : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        <Save className="w-4 h-4" />
                        {measurementsSaved ? 'Measurements Saved!' : 'Save Measurements'}
                      </button>
                    </div>

                    {/* Measurement Groups */}
                    {Object.entries(measurementGroups).map(([groupKey, group]) => (
                      <div key={groupKey} className="space-y-4">
                        <div className="border-b border-gray-200 pb-2">
                          <h4 className="text-md font-medium text-gray-800">{group.title}</h4>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {group.fields.map((field) => (
                            <div key={field.key} className="space-y-1">
                              <label className="block text-sm font-medium text-gray-700">
                                <span className="mr-2">{field.icon}</span>
                                {field.label}
                                <span className="text-gray-500 ml-1">({field.unit})</span>
                              </label>
                              <div className="relative group">
                                <input
                                  type="number"
                                  step="0.1"
                                  min={field.min}
                                  max={field.max}
                                  value={measurements[field.key] || ''}
                                  onChange={(e) => handleMeasurementChange(field, e.target.value)}
                                  className={`w-full px-3 py-2 pr-12 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                                    measurementErrors[field.key] ? 'border-red-500' : 'border-gray-300'
                                  }`}
                                  placeholder={`${field.min}-${field.max}`}
                                />
                                <span className="absolute right-3 top-2 text-gray-500 text-sm">
                                  {field.unit}
                                </span>
                                
                                {/* Tooltip */}
                                <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block z-10">
                                  <div className="bg-gray-800 text-white text-xs rounded-md px-3 py-2 max-w-xs">
                                    <div className="flex items-start gap-2">
                                      <Info className="w-3 h-3 mt-0.5 flex-shrink-0" />
                                      <span>{field.tooltip}</span>
                                    </div>
                                    <div className="absolute top-full left-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
                                  </div>
                                </div>
                              </div>
                              {measurementErrors[field.key] && (
                                <p className="text-red-500 text-xs">{measurementErrors[field.key]}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}

                    {/* Additional Notes */}
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Additional Measurement Notes
                      </label>
                      <textarea
                        value={measurements.notes || ''}
                        onChange={(e) => setMeasurements(prev => ({ ...prev, notes: e.target.value }))}
                        placeholder="Any additional measurement notes or special requirements..."
                        maxLength={500}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                      <p className="text-xs text-gray-500">
                        {(measurements.notes || '').length}/500 characters
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
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

        {/* New Customer Modal */}
        {showNewCustomer && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-10">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Add New Customer</h3>
                <button
                  onClick={() => setShowNewCustomer(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <form onSubmit={handleCreateCustomer} className="p-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newCustomer.name}
                    onChange={(e) => setNewCustomer(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={newCustomer.phone}
                    onChange={(e) => setNewCustomer(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={newCustomer.email}
                    onChange={(e) => setNewCustomer(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowNewCustomer(false)}
                    className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    {loading ? 'Adding...' : 'Add Customer'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}