import React, { useState, useEffect } from 'react';
import { X, Package, Clock, CheckCircle, Truck, MapPin, Phone, Mail, Calendar, DollarSign, User, Ruler, Printer } from 'lucide-react';
import { orderAPI } from '../../../lib/oms-api';
import { customerService } from '../../../services/customer-service';
import type { Order, Customer } from '../../../types/oms';
import OrderSlipPrint from './OrderSlipPrint';

interface OrderDetailsModalProps {
  order: Order;
  onClose: () => void;
  onStatusUpdate: (status: Order['status']) => void;
}

const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({ order, onClose, onStatusUpdate }) => {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusUpdateLoading, setStatusUpdateLoading] = useState(false);
  const [newStatus, setNewStatus] = useState<Order['status']>(order.status);
  const [statusNote, setStatusNote] = useState('');
  const [showPrintModal, setShowPrintModal] = useState(false);

  useEffect(() => {
    const fetchCustomer = async () => {
      try {
        const customerData = await customerService.getById(order.customerId);
        setCustomer(customerData);
      } catch (error) {
        console.error('Error fetching customer:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomer();
  }, [order.customerId]);

  const handleStatusUpdate = async () => {
    setStatusUpdateLoading(true);
    try {
      await orderAPI.updateStatus(order.id, newStatus, statusNote);
      onStatusUpdate(newStatus);
    } catch (error) {
      console.error('Error updating status:', error);
    } finally {
      setStatusUpdateLoading(false);
    }
  };

  const getStatusSteps = (currentStatus: Order['status']) => {
    const steps = [
      { key: 'pending', label: 'Order Placed', icon: Package },
      { key: 'confirmed', label: 'Confirmed', icon: CheckCircle },
      { key: 'in_progress', label: 'In Progress', icon: Clock },
      { key: 'fitting_scheduled', label: 'Fitting Scheduled', icon: MapPin },
      { key: 'ready', label: 'Ready for Pickup', icon: CheckCircle },
      { key: 'delivered', label: 'Delivered', icon: Truck }
    ];

    const currentIndex = steps.findIndex(step => step.key === currentStatus);
    
    return steps.map((step, index) => ({
      ...step,
      completed: index <= currentIndex,
      current: index === currentIndex
    }));
  };

  const formatDate = (date: Date | string | null | undefined) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount: number | null | undefined) => {
    if (amount === null || amount === undefined) return '₹0';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const safeToLocaleString = (value: number | null | undefined) => {
    if (value === null || value === undefined) return '0';
    return value.toLocaleString('en-IN');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Order Details</h2>
            <p className="text-gray-600">{order.id}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-8">
          {/* Order Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center space-x-3 mb-3">
                <Package className="w-5 h-5 text-blue-600" />
                <h3 className="font-medium text-blue-900">Order Info</h3>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Type:</span>
                  <span className="font-medium capitalize">{order.type?.replace('_', ' ') || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className="font-medium capitalize">{order.status?.replace('_', ' ') || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Priority:</span>
                  <span className="font-medium capitalize">{order.priority || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Created:</span>
                  <span className="font-medium">{formatDate(order.createdAt)}</span>
                </div>
              </div>
            </div>

            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center space-x-3 mb-3">
                <DollarSign className="w-5 h-5 text-green-600" />
                <h3 className="font-medium text-green-900">Payment Info</h3>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Amount:</span>
                  <span className="font-medium">₹{safeToLocaleString(order.totalAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Advance Paid:</span>
                  <span className="font-medium">₹{safeToLocaleString(order.advancePaid)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Balance Due:</span>
                  <span className="font-medium">₹{safeToLocaleString(order.balanceAmount)}</span>
                </div>
                {order.advancePaidDate && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Advance Date:</span>
                    <span className="font-medium">{formatDate(order.advancePaidDate)}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-purple-50 rounded-lg p-4">
              <div className="flex items-center space-x-3 mb-3">
                <Calendar className="w-5 h-5 text-purple-600" />
                <h3 className="font-medium text-purple-900">Timeline</h3>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Order Date:</span>
                  <span className="font-medium">{formatDate(order.orderDate)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Expected Delivery:</span>
                  <span className="font-medium">{formatDate(order.expectedDeliveryDate)}</span>
                </div>
                {order.fittingDate && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Fitting Date:</span>
                    <span className="font-medium">{formatDate(order.fittingDate)}</span>
                  </div>
                )}
                {order.actualDeliveryDate && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Actual Delivery:</span>
                    <span className="font-medium">{formatDate(order.actualDeliveryDate)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Customer Information */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <User className="w-5 h-5 mr-2 text-gray-700" />
              Customer Information
            </h3>
            
            {loading ? (
              <div className="flex justify-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              </div>
            ) : customer ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Name</p>
                  <p className="font-medium">{customer.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Customer ID</p>
                  <p className="font-medium">{customer.id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Phone</p>
                  <div className="flex items-center">
                    <Phone className="w-4 h-4 mr-1 text-gray-500" />
                    <p className="font-medium">{customer.phone}</p>
                  </div>
                </div>
                {customer.email && (
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Email</p>
                    <div className="flex items-center">
                      <Mail className="w-4 h-4 mr-1 text-gray-500" />
                      <p className="font-medium">{customer.email}</p>
                    </div>
                  </div>
                )}
                {customer.address?.city && (
                  <div className="md:col-span-2">
                    <p className="text-sm text-gray-500 mb-1">Address</p>
                    <div className="flex items-start">
                      <MapPin className="w-4 h-4 mr-1 text-gray-500 mt-1 flex-shrink-0" />
                      <p>
                        {customer.address?.street && `${customer.address.street}, `}
                        {customer.address.city}, {customer.address.state}
                        {customer.address?.pinCode && ` - ${customer.address.pinCode}`}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-gray-500">Customer information not available</p>
            )}
          </div>

          {/* Garment Details */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Garment Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-500 mb-1">Garment Type</p>
                <p className="font-medium">{order.garmentType || 'N/A'}</p>
              </div>
              {order.fabricDetails?.type && (
                <div>
                  <p className="text-sm text-gray-500 mb-1">Fabric</p>
                  <p className="font-medium">
                    {order.fabricDetails.type}
                    {order.fabricDetails.color && ` - ${order.fabricDetails.color}`}
                  </p>
                </div>
              )}
              {order.fabricDetails?.quantity && order.fabricDetails.quantity > 0 && (
                <div>
                  <p className="text-sm text-gray-500 mb-1">Fabric Quantity</p>
                  <p className="font-medium">{order.fabricDetails.quantity} {order.fabricDetails.unit}</p>
                </div>
              )}
              {order.specialInstructions && (
                <div className="md:col-span-2">
                  <p className="text-sm text-gray-500 mb-1">Special Instructions</p>
                  <p className="bg-white p-3 rounded border border-gray-200">{order.specialInstructions}</p>
                </div>
              )}
            </div>
          </div>

          {/* Status History */}
          {order.statusHistory && order.statusHistory.length > 0 && (
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Status History</h3>
              <div className="space-y-4">
                {order.statusHistory.slice().reverse().map((history) => (
                  <div key={history.id} className="flex items-start space-x-4 p-4 bg-white rounded-lg border border-gray-200">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium text-gray-900 capitalize">
                          {history.status?.replace('_', ' ') || 'N/A'}
                        </h3>
                        <span className="text-sm text-gray-500">
                          {history.timestamp ? new Date(history.timestamp).toLocaleString('en-IN') : 'N/A'}
                        </span>
                      </div>
                      {history.notes && (
                        <p className="text-gray-600 mt-1">{history.notes}</p>
                      )}
                      <p className="text-sm text-gray-500 mt-1">Updated by: {history.updatedBy || 'N/A'}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Update Status */}
          <div className="bg-blue-50 rounded-lg p-6">
            <h3 className="text-lg font-medium text-blue-900 mb-4">Update Order Status</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="newStatus" className="block text-sm font-medium text-gray-700 mb-2">
                  New Status
                </label>
                <select
                  id="newStatus"
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as Order['status'])}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="in_progress">In Progress</option>
                  <option value="fitting_scheduled">Fitting Scheduled</option>
                  <option value="ready">Ready</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <div>
                <label htmlFor="statusNote" className="block text-sm font-medium text-gray-700 mb-2">
                  Status Note
                </label>
                <input
                  type="text"
                  id="statusNote"
                  value={statusNote}
                  onChange={(e) => setStatusNote(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Add a note about this status change"
                />
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <button
                onClick={handleStatusUpdate}
                disabled={statusUpdateLoading || newStatus === order.status}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {statusUpdateLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Updating...</span>
                  </>
                ) : (
                  <span>Update Status</span>
                )}
              </button>
            </div>
          </div>

          {/* Order Progress */}
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-6">Order Progress</h3>
            
            <div className="relative">
              {getStatusSteps(order.status).map((step, index) => {
                const Icon = step.icon;
                return (
                  <div key={step.key} className="relative flex items-center mb-8 last:mb-0">
                    {/* Connector Line */}
                    {index < getStatusSteps(order.status).length - 1 && (
                      <div className={`absolute left-6 top-12 w-0.5 h-16 ${
                        step.completed ? 'bg-green-500' : 'bg-gray-300'
                      }`} />
                    )}
                    
                    {/* Step Icon */}
                    <div className={`relative z-10 flex items-center justify-center w-12 h-12 rounded-full border-2 ${
                      step.completed 
                        ? 'bg-green-500 border-green-500 text-white' 
                        : step.current
                        ? 'bg-blue-500 border-blue-500 text-white'
                        : 'bg-white border-gray-300 text-gray-400'
                    }`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    
                    {/* Step Content */}
                    <div className="ml-6">
                      <h3 className={`text-lg font-semibold ${
                        step.completed || step.current ? 'text-gray-900' : 'text-gray-400'
                      }`}>
                        {step.label}
                      </h3>
                      {step.current && (
                        <p className="text-blue-600 font-medium">Current Status</p>
                      )}
                      {step.completed && step.key !== order.status && (
                        <p className="text-green-600">Completed</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 flex justify-end">
          <button
            onClick={() => setShowPrintModal(true)}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mr-3 flex items-center space-x-2"
          >
            <Printer className="w-4 h-4" />
            <span>Print Order Slip</span>
          </button>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Close
          </button>
        </div>

        {/* Print Modal */}
        {showPrintModal && (
          <OrderSlipPrint 
            order={order} 
            customer={customer} 
            onClose={() => setShowPrintModal(false)} 
          />
        )}
      </div>
    </div>
  );
};

export default OrderDetailsModal;