import React, { useState, useEffect } from 'react';
import { X, Calendar, User, Package, MapPin, Phone, Mail, Ruler, Edit3, Save, AlertCircle } from 'lucide-react';
import { Order, Customer, OrderStatus } from '../../../types/oms';
import { customerService } from '../../../services/customer-service';
import { orderService } from '../../../services/order-service';
import { measurementsService } from '../../../services/measurements-service';

interface OrderDetailsModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  onOrderUpdated?: (updatedOrder: Order) => void;
}

interface CustomerMeasurements {
  id: string;
  customer_id: string;
  unit: 'cm' | 'inches';
  top_fl?: number;
  top_sh?: number;
  top_sl?: number;
  top_sr?: number;
  top_mr?: number;
  top_ah?: number;
  top_ch?: number;
  top_br?: number;
  top_wr?: number;
  top_hip?: number;
  top_slit?: number;
  top_fn?: number;
  top_bn?: number;
  top_dp?: number;
  top_pp?: number;
  bottom_fl?: number;
  bottom_wr?: number;
  bottom_sr?: number;
  bottom_tr?: number;
  bottom_lr?: number;
  bottom_ar?: number;
  notes?: string;
}

interface OrderMeasurements {
  id: string;
  order_id: string;
  unit: 'cm' | 'inches';
  top_fl?: number;
  top_sh?: number;
  top_sl?: number;
  top_sr?: number;
  top_mr?: number;
  top_ah?: number;
  top_ch?: number;
  top_br?: number;
  top_wr?: number;
  top_hip?: number;
  top_slit?: number;
  top_fn?: number;
  top_bn?: number;
  top_dp?: number;
  top_pp?: number;
  bottom_fl?: number;
  bottom_wr?: number;
  bottom_sr?: number;
  bottom_tr?: number;
  bottom_lr?: number;
  bottom_ar?: number;
  custom_measurements?: any;
  notes?: string;
}

export const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({ 
  order, 
  isOpen, 
  onClose, 
  onOrderUpdated 
}) => {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [customerMeasurements, setCustomerMeasurements] = useState<CustomerMeasurements | null>(null);
  const [orderMeasurements, setOrderMeasurements] = useState<OrderMeasurements | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEditingStatus, setIsEditingStatus] = useState(false);
  const [newStatus, setNewStatus] = useState<OrderStatus>('pending');

  useEffect(() => {
    if (order && isOpen) {
      fetchCustomer();
      fetchMeasurements();
    }
  }, [order, isOpen]);

  const fetchCustomer = async () => {
    if (!order?.customer_id) return;
    
    try {
      setLoading(true);
      const customerData = await customerService.getById(order.customer_id);
      setCustomer(customerData);
    } catch (err) {
      console.error('Error fetching customer:', err);
      setError('Failed to load customer information');
    } finally {
      setLoading(false);
    }
  };

  const fetchMeasurements = async () => {
    if (!order) return;

    try {
      // Fetch customer's default measurements
      if (order.customer_id) {
        const customerMeas = await measurementsService.getByCustomerId(order.customer_id);
        setCustomerMeasurements(customerMeas);
      }

      // Fetch order-specific measurements
      const orderMeas = await measurementsService.getByOrderId(order.id);
      setOrderMeasurements(orderMeas);
    } catch (err) {
      console.error('Error fetching measurements:', err);
    }
  };

  const handleStatusUpdate = async () => {
    if (!order || !onOrderUpdated) return;

    try {
      const updatedOrder = await orderService.updateStatus(order.id, newStatus);
      if (typeof onOrderUpdated === 'function') {
        onOrderUpdated(updatedOrder);
      }
      setIsEditingStatus(false);
    } catch (err) {
      console.error('Error updating status:', err);
      setError('Failed to update order status');
    }
  };

  const formatCurrency = (amount: number | undefined) => {
    if (amount === undefined || amount === null) return '₹0.00';
    return `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
  };

  const formatDate = (date: string | undefined) => {
    if (!date) return 'Not set';
    return new Date(date).toLocaleDateString('en-IN');
  };

  const getStatusColor = (status: OrderStatus) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      in_progress: 'bg-purple-100 text-purple-800',
      fitting_scheduled: 'bg-orange-100 text-orange-800',
      ready: 'bg-green-100 text-green-800',
      delivered: 'bg-gray-100 text-gray-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const renderMeasurementField = (label: string, value: number | undefined, unit: string) => {
    if (value === undefined || value === null) return null;
    
    return (
      <div className="flex justify-between py-1">
        <span className="text-gray-600">{label}:</span>
        <span className="font-medium">{value} {unit}</span>
      </div>
    );
  };

  const renderMeasurementsSection = (measurements: CustomerMeasurements | OrderMeasurements | null, title: string) => {
    if (!measurements) return null;

    const unit = measurements.unit || 'cm';

    return (
      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
          <Ruler className="w-4 h-4 mr-2" />
          {title}
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Top Measurements */}
          <div>
            <h5 className="font-medium text-gray-700 mb-2">Top Measurements</h5>
            <div className="space-y-1 text-sm">
              {renderMeasurementField('Full Length', measurements.top_fl, unit)}
              {renderMeasurementField('Shoulder', measurements.top_sh, unit)}
              {renderMeasurementField('Sleeve Length', measurements.top_sl, unit)}
              {renderMeasurementField('Sleeve Round', measurements.top_sr, unit)}
              {renderMeasurementField('Muscle Round', measurements.top_mr, unit)}
              {renderMeasurementField('Armhole', measurements.top_ah, unit)}
              {renderMeasurementField('Chest', measurements.top_ch, unit)}
              {renderMeasurementField('Belly Round', measurements.top_br, unit)}
              {renderMeasurementField('Waist Round', measurements.top_wr, unit)}
              {renderMeasurementField('Hip', measurements.top_hip, unit)}
              {renderMeasurementField('Slit', measurements.top_slit, unit)}
              {renderMeasurementField('Front Neck', measurements.top_fn, unit)}
              {renderMeasurementField('Back Neck', measurements.top_bn, unit)}
              {renderMeasurementField('Deep', measurements.top_dp, unit)}
              {renderMeasurementField('Plate', measurements.top_pp, unit)}
            </div>
          </div>

          {/* Bottom Measurements */}
          <div>
            <h5 className="font-medium text-gray-700 mb-2">Bottom Measurements</h5>
            <div className="space-y-1 text-sm">
              {renderMeasurementField('Full Length', measurements.bottom_fl, unit)}
              {renderMeasurementField('Waist Round', measurements.bottom_wr, unit)}
              {renderMeasurementField('Seat Round', measurements.bottom_sr, unit)}
              {renderMeasurementField('Thigh Round', measurements.bottom_tr, unit)}
              {renderMeasurementField('Leg Round', measurements.bottom_lr, unit)}
              {renderMeasurementField('Ankle Round', measurements.bottom_ar, unit)}
            </div>
          </div>
        </div>

        {/* Custom Measurements for Order */}
        {'custom_measurements' in measurements && measurements.custom_measurements && (
          <div className="mt-4">
            <h5 className="font-medium text-gray-700 mb-2">Custom Measurements</h5>
            <div className="text-sm text-gray-600">
              <pre className="whitespace-pre-wrap">{JSON.stringify(measurements.custom_measurements, null, 2)}</pre>
            </div>
          </div>
        )}

        {/* Notes */}
        {measurements.notes && (
          <div className="mt-4">
            <h5 className="font-medium text-gray-700 mb-2">Notes</h5>
            <p className="text-sm text-gray-600">{measurements.notes}</p>
          </div>
        )}
      </div>
    );
  };

  if (!isOpen || !order) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Order Details</h2>
            <p className="text-sm text-gray-500">Order ID: {order.id}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {error && (
          <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-center">
            <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
            <span className="text-red-700">{error}</span>
          </div>
        )}

        <div className="p-6 space-y-6">
          {/* Order Status */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="text-sm font-medium text-gray-700">Status:</span>
              {isEditingStatus ? (
                <div className="flex items-center space-x-2">
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as OrderStatus)}
                    className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="in_progress">In Progress</option>
                    <option value="fitting_scheduled">Fitting Scheduled</option>
                    <option value="ready">Ready</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                  <button
                    onClick={handleStatusUpdate}
                    className="p-1 text-green-600 hover:text-green-800"
                  >
                    <Save className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setIsEditingStatus(false)}
                    className="p-1 text-gray-600 hover:text-gray-800"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                    {order.status.replace('_', ' ').toUpperCase()}
                  </span>
                  <button
                    onClick={() => {
                      setNewStatus(order.status);
                      setIsEditingStatus(true);
                    }}
                    className="p-1 text-gray-600 hover:text-gray-800"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Customer Information */}
          {loading ? (
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          ) : customer ? (
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                <User className="w-5 h-5 mr-2" />
                Customer Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Name</p>
                  <p className="font-medium">{customer.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Phone</p>
                  <p className="font-medium flex items-center">
                    <Phone className="w-4 h-4 mr-1" />
                    {customer.phone}
                  </p>
                </div>
                {customer.email && (
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-medium flex items-center">
                      <Mail className="w-4 h-4 mr-1" />
                      {customer.email}
                    </p>
                  </div>
                )}
                {customer.address_street && (
                  <div className="md:col-span-2">
                    <p className="text-sm text-gray-600">Address</p>
                    <p className="font-medium flex items-start">
                      <MapPin className="w-4 h-4 mr-1 mt-0.5" />
                      {customer.address_street}, {customer.address_city}, {customer.address_state} {customer.address_pin_code}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ) : null}

          {/* Order Details */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
              <Package className="w-5 h-5 mr-2" />
              Order Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Type</p>
                <p className="font-medium capitalize">{order.type.replace('_', ' ')}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Priority</p>
                <p className="font-medium capitalize">{order.priority}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Garment Type</p>
                <p className="font-medium">{order.garment_type}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Order Date</p>
                <p className="font-medium flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  {formatDate(order.order_date)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Expected Delivery</p>
                <p className="font-medium flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  {formatDate(order.expected_delivery_date)}
                </p>
              </div>
              {order.fitting_date && (
                <div>
                  <p className="text-sm text-gray-600">Fitting Date</p>
                  <p className="font-medium flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    {formatDate(order.fitting_date)}
                  </p>
                </div>
              )}
            </div>

            {/* Fabric Details */}
            {(order.fabric_type || order.fabric_color || order.fabric_quantity) && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <h4 className="font-medium text-gray-900 mb-2">Fabric Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {order.fabric_type && (
                    <div>
                      <p className="text-sm text-gray-600">Type</p>
                      <p className="font-medium">{order.fabric_type}</p>
                    </div>
                  )}
                  {order.fabric_color && (
                    <div>
                      <p className="text-sm text-gray-600">Color</p>
                      <p className="font-medium">{order.fabric_color}</p>
                    </div>
                  )}
                  {order.fabric_quantity && (
                    <div>
                      <p className="text-sm text-gray-600">Quantity</p>
                      <p className="font-medium">{order.fabric_quantity} {order.fabric_unit || 'meters'}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Special Instructions */}
            {order.special_instructions && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <h4 className="font-medium text-gray-900 mb-2">Special Instructions</h4>
                <p className="text-gray-700">{order.special_instructions}</p>
              </div>
            )}
          </div>

          {/* Measurements */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900 flex items-center">
              <Ruler className="w-5 h-5 mr-2" />
              Measurements
            </h3>
            
            {/* Order-specific measurements take priority */}
            {orderMeasurements ? (
              renderMeasurementsSection(orderMeasurements, "Order Measurements")
            ) : customerMeasurements ? (
              renderMeasurementsSection(customerMeasurements, "Customer Default Measurements")
            ) : (
              <div className="bg-yellow-50 p-4 rounded-lg">
                <p className="text-yellow-800 flex items-center">
                  <AlertCircle className="w-5 h-5 mr-2" />
                  No measurements found for this order or customer.
                </p>
              </div>
            )}
          </div>

          {/* Payment Information */}
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-3">Payment Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-600">Total Amount</p>
                <p className="font-bold text-lg">{formatCurrency(order.total_amount)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Advance Paid</p>
                <p className="font-medium text-green-600">{formatCurrency(order.advance_paid)}</p>
                {order.advance_paid_date && (
                  <p className="text-xs text-gray-500">on {formatDate(order.advance_paid_date)}</p>
                )}
              </div>
              <div>
                <p className="text-sm text-gray-600">Balance Amount</p>
                <p className="font-medium text-red-600">{formatCurrency(order.balance_amount)}</p>
                {order.balance_paid_date && (
                  <p className="text-xs text-gray-500">paid on {formatDate(order.balance_paid_date)}</p>
                )}
              </div>
            </div>
          </div>

          {/* Notes */}
          {order.notes && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">Notes</h3>
              <p className="text-gray-700">{order.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};