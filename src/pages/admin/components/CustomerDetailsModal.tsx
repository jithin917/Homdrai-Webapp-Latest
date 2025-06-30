import React, { useState, useEffect } from 'react';
import { X, User, Phone, Mail, MapPin, Calendar, Package, CreditCard } from 'lucide-react';
import { userManagementService } from '../../../services/user-management-service';

interface CustomerDetailsModalProps {
  customer: any;
  onClose: () => void;
}

export function CustomerDetailsModal({ customer, onClose }: CustomerDetailsModalProps) {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCustomerOrders();
  }, [customer.id]);

  const loadCustomerOrders = async () => {
    try {
      setLoading(true);
      const ordersData = await userManagementService.getCustomerOrders(customer.id);
      setOrders(ordersData);
    } catch (error) {
      console.error('Error loading customer orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-purple-100 text-purple-800';
      case 'ready': return 'bg-green-100 text-green-800';
      case 'delivered': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const totalSpent = orders.reduce((sum, order) => sum + parseFloat(order.total_amount || 0), 0);
  const totalPaid = orders.reduce((sum, order) => sum + parseFloat(order.advance_paid || 0), 0);
  const totalBalance = totalSpent - totalPaid;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold">Customer Details</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Customer Information */}
          <div className="lg:col-span-1">
            <div className="bg-gray-50 rounded-lg p-4 space-y-4">
              <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                <User className="h-5 w-5" />
                Customer Information
              </h3>
              
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-500">Name</label>
                  <p className="text-gray-900">{customer.name}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500">Customer ID</label>
                  <p className="text-gray-900 font-mono text-sm">{customer.id}</p>
                </div>
                
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-900">{customer.phone}</span>
                </div>
                
                {customer.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-900">{customer.email}</span>
                  </div>
                )}
                
                {(customer.address_street || customer.address_city) && (
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-gray-400 mt-1" />
                    <div className="text-gray-900">
                      {customer.address_street && <div>{customer.address_street}</div>}
                      {customer.address_city && customer.address_state && (
                        <div>{customer.address_city}, {customer.address_state}</div>
                      )}
                      {customer.address_pin_code && <div>{customer.address_pin_code}</div>}
                    </div>
                  </div>
                )}
                
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-900">
                    Joined {new Date(customer.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* Communication Preferences */}
              <div className="pt-4 border-t border-gray-200">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Communication Preferences</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Email:</span>
                    <span className={customer.communication_email ? 'text-green-600' : 'text-red-600'}>
                      {customer.communication_email ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>SMS:</span>
                    <span className={customer.communication_sms ? 'text-green-600' : 'text-red-600'}>
                      {customer.communication_sms ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>WhatsApp:</span>
                    <span className={customer.communication_whatsapp ? 'text-green-600' : 'text-red-600'}>
                      {customer.communication_whatsapp ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="bg-blue-50 rounded-lg p-4 mt-4">
              <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2 mb-4">
                <CreditCard className="h-5 w-5" />
                Order Summary
              </h3>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Total Orders:</span>
                  <span className="font-medium">{orders.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Spent:</span>
                  <span className="font-medium">₹{totalSpent.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Paid:</span>
                  <span className="font-medium text-green-600">₹{totalPaid.toFixed(2)}</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span>Outstanding Balance:</span>
                  <span className={`font-medium ${totalBalance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    ₹{totalBalance.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Orders List */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <Package className="h-5 w-5" />
              <h3 className="text-lg font-medium text-gray-900">Order History</h3>
            </div>

            {loading ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No orders found for this customer.
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div key={order.id} className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-medium text-gray-900">Order #{order.id}</h4>
                        <p className="text-sm text-gray-500">
                          {order.store?.name} ({order.store?.code})
                        </p>
                      </div>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                        {order.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Garment:</span>
                        <span className="ml-2 text-gray-900">{order.garment_type}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Type:</span>
                        <span className="ml-2 text-gray-900">{order.type.replace('_', ' ')}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Order Date:</span>
                        <span className="ml-2 text-gray-900">
                          {new Date(order.order_date).toLocaleDateString()}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">Delivery Date:</span>
                        <span className="ml-2 text-gray-900">
                          {new Date(order.expected_delivery_date).toLocaleDateString()}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">Total Amount:</span>
                        <span className="ml-2 text-gray-900 font-medium">₹{order.total_amount}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Advance Paid:</span>
                        <span className="ml-2 text-green-600 font-medium">₹{order.advance_paid}</span>
                      </div>
                    </div>
                    
                    {order.assigned_user && (
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <span className="text-sm text-gray-500">Assigned to:</span>
                        <span className="ml-2 text-sm text-gray-900">{order.assigned_user.username}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}