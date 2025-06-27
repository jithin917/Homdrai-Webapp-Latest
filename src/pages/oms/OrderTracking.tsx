import React, { useState } from 'react';
import { Search, Package, Clock, CheckCircle, Truck, MapPin, Phone, Mail, Calendar, ArrowLeft } from 'lucide-react';
import { orderAPI, customerAPI } from '../../lib/oms-api';
import type { Order, Customer } from '../../types/oms';
import { Link } from 'react-router-dom';

const OrderTracking = () => {
  const [orderId, setOrderId] = useState('');
  const [phone, setPhone] = useState('');
  const [order, setOrder] = useState<Order | null>(null);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleTrackOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setOrder(null);
    setCustomer(null);

    try {
      const response = await orderAPI.trackByOrderAndPhone(orderId.trim(), phone.trim());
      
      if (response.success && response.data) {
        setOrder(response.data);
        
        // Fetch customer details
        const customerResponse = await customerAPI.getById(response.data.customerId);
        if (customerResponse.success) {
          setCustomer(customerResponse.data);
        }
      } else {
        setError(response.error || 'Order not found or invalid phone number');
      }
    } catch (err: any) {
      setError('An error occurred while tracking your order');
      console.error(err);
    } finally {
      setLoading(false);
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

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  // Helper function to check if measurements exist
  const hasMeasurements = (order: Order) => {
    return order.measurements && (
      Object.values(order.measurements.top).some(v => v) || 
      (order.measurements.bottom && Object.values(order.measurements.bottom).some(v => v))
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Track Your Order</h1>
          <p className="text-xl text-gray-600">
            Enter your order details to check the current status
          </p>
        </div>

        {/* Tracking Form */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <form onSubmit={handleTrackOrder} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="orderId" className="block text-sm font-medium text-gray-700 mb-2">
                  Order Number
                </label>
                <input
                  type="text"
                  id="orderId"
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value)}
                  required
                  placeholder="e.g., ORD-KCH-20250117-001"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                  Registered Phone Number
                </label>
                <input
                  type="tel"
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  placeholder="+91 98765 43210"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:shadow-lg transition-all duration-300 disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Tracking...</span>
                </>
              ) : (
                <>
                  <Search className="w-5 h-5" />
                  <span>Track Order</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Order Details */}
        {order && (
          <div className="space-y-8">
            {/* Order Summary */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Order Details</h2>
                <span className={`px-4 py-2 rounded-full text-sm font-medium ${
                  order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                  order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                  'bg-blue-100 text-blue-800'
                }`}>
                  {order.status.replace('_', ' ').toUpperCase()}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Order ID</h3>
                  <p className="text-lg font-semibold text-gray-900">{order.id}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Order Date</h3>
                  <p className="text-lg text-gray-900">{formatDate(order.orderDate)}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Expected Delivery</h3>
                  <p className="text-lg text-gray-900">{formatDate(order.expectedDeliveryDate)}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Order Type</h3>
                  <p className="text-lg text-gray-900 capitalize">{order.type.replace('_', ' ')}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Total Amount</h3>
                  <p className="text-lg font-semibold text-gray-900">{formatCurrency(order.totalAmount)}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Balance Due</h3>
                  <p className="text-lg font-semibold text-gray-900">{formatCurrency(order.balanceAmount)}</p>
                </div>
              </div>

              {order.specialInstructions && (
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Special Instructions</h3>
                  <p className="text-gray-600">{order.specialInstructions}</p>
                </div>
              )}
            </div>
            
            {/* Measurements Section (if available) */}
            {order.measurements && hasMeasurements(order) && (
              <div className="bg-white rounded-2xl shadow-lg p-8 mt-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Measurements</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Top Measurements */}
                  {Object.values(order.measurements.top).some(v => v) && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="font-medium text-gray-900 mb-3">Top Measurements ({order.measurements.unit})</h3>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {Object.entries(order.measurements.top).map(([key, value]) => (
                          value && (
                            <div key={key} className="flex justify-between p-2 bg-white rounded border border-gray-100">
                              <span className="text-gray-600 text-sm">{key}:</span>
                              <span className="font-medium text-sm">{value} {order.measurements.unit}</span>
                            </div>
                          )
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Bottom Measurements */}
                  {Object.values(order.measurements.bottom).some(v => v) && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="font-medium text-gray-900 mb-3">Bottom Measurements ({order.measurements.unit})</h3>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {Object.entries(order.measurements.bottom).map(([key, value]) => (
                          value && (
                            <div key={key} className="flex justify-between p-2 bg-white rounded border border-gray-100">
                              <span className="text-gray-600 text-sm">{key}:</span>
                              <span className="font-medium text-sm">{value} {order.measurements.unit}</span>
                            </div>
                          )
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Measurement Notes */}
                {order.measurements.notes && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-medium text-gray-700 mb-2">Measurement Notes</h3>
                    <p className="text-gray-600">{order.measurements.notes}</p>
                  </div>
                )}
              </div>
            )}

            {/* Customer Information */}
            {customer && (
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Customer Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Name</h3>
                    <p className="text-lg text-gray-900">{customer.name}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Phone</h3>
                    <div className="flex items-center">
                      <Phone className="w-4 h-4 mr-2 text-gray-500" />
                      <p className="text-lg text-gray-900">{customer.phone}</p>
                    </div>
                  </div>
                  {customer.email && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-1">Email</h3>
                      <div className="flex items-center">
                        <Mail className="w-4 h-4 mr-2 text-gray-500" />
                        <p className="text-lg text-gray-900">{customer.email}</p>
                      </div>
                    </div>
                  )}
                  {customer.address.city && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-1">Location</h3>
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-2 text-gray-500" />
                        <p className="text-lg text-gray-900">{customer.address.city}, {customer.address.state}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Order Progress */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-8">Order Progress</h2>
              
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

            {/* Status History */}
            {order.statusHistory && order.statusHistory.length > 0 && (
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Status History</h2>
                <div className="space-y-4">
                  {order.statusHistory.slice().reverse().map((history) => (
                    <div key={history.id} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium text-gray-900 capitalize">
                            {history.status.replace('_', ' ')}
                          </h3>
                          <span className="text-sm text-gray-500">
                            {new Date(history.timestamp).toLocaleString('en-IN')}
                          </span>
                        </div>
                        {history.notes && (
                          <p className="text-gray-600 mt-1">{history.notes}</p>
                        )}
                        <p className="text-sm text-gray-500 mt-1">Updated by: {history.updatedBy}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Contact Information */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Need Help?</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Phone className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Call Us</h3>
                    <p className="text-gray-600">+91 95671 99924</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <Mail className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Email Us</h3>
                    <p className="text-gray-600">support@homdrai.com</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Back to Home */}
            <div className="flex justify-center">
              <Link to="/" className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 transition-colors">
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Home</span>
              </Link>
            </div>
          </div>
        )}

        {/* Demo Instructions */}
        {!order && (
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-8">
            <h3 className="text-lg font-semibold text-blue-900 mb-4">Demo Instructions</h3>
            <p className="text-blue-800 mb-4">
              To test the order tracking system, you can use these sample order details:
            </p>
            <div className="bg-white rounded-lg p-4 space-y-2">
              <p><strong>Order ID:</strong> ORD-KCH-20250117-001</p>
              <p><strong>Phone:</strong> +919876543210</p>
            </div>
            <p className="text-blue-700 text-sm mt-4">
              Note: In a production environment, customers would receive their actual order ID and use their registered phone number.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderTracking;