import React, { useState } from 'react';
import { X, User, Mail, Phone, MapPin } from 'lucide-react';
import { createCustomer } from '../../../services/customer-service';
import { generateCustomerId } from '../../../utils/id-generators';

interface NewCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCustomerCreated: (customer: any) => void;
}

export const NewCustomerModal: React.FC<NewCustomerModalProps> = ({
  isOpen,
  onClose,
  onCustomerCreated,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address_street: '',
    address_city: '',
    address_state: '',
    address_pin_code: '',
    address_country: 'India',
    communication_email: true,
    communication_sms: true,
    communication_whatsapp: true,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Validate required fields
      if (!formData.name.trim()) {
        throw new Error('Customer name is required');
      }
      if (!formData.phone.trim()) {
        throw new Error('Phone number is required');
      }

      // Generate customer ID
      const customerId = generateCustomerId();
      
      const customerData = {
        id: customerId,
        ...formData,
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim() || null,
        address_street: formData.address_street.trim() || null,
        address_city: formData.address_city.trim() || null,
        address_state: formData.address_state.trim() || null,
        address_pin_code: formData.address_pin_code.trim() || null,
      };

      console.log('Creating customer with data:', customerData);
      
      const newCustomer = await createCustomer(customerData);
      console.log('Customer created successfully:', newCustomer);
      
      onCustomerCreated(newCustomer);
      onClose();
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        address_street: '',
        address_city: '',
        address_state: '',
        address_pin_code: '',
        address_country: 'India',
        communication_email: true,
        communication_sms: true,
        communication_whatsapp: true,
      });
    } catch (err) {
      console.error('Error creating customer:', err);
      setError(err instanceof Error ? err.message : 'Failed to create customer');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <User className="w-5 h-5 mr-2" />
            Add New Customer
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

          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Basic Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter customer name"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number *
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter phone number"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter email address"
                  disabled={isLoading}
                />
              </div>
            </div>
          </div>

          {/* Address Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <MapPin className="w-5 h-5 mr-2" />
              Address Information
            </h3>
            
            <div>
              <label htmlFor="address_street" className="block text-sm font-medium text-gray-700 mb-1">
                Street Address
              </label>
              <input
                type="text"
                id="address_street"
                name="address_street"
                value={formData.address_street}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter street address"
                disabled={isLoading}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="address_city" className="block text-sm font-medium text-gray-700 mb-1">
                  City
                </label>
                <input
                  type="text"
                  id="address_city"
                  name="address_city"
                  value={formData.address_city}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter city"
                  disabled={isLoading}
                />
              </div>

              <div>
                <label htmlFor="address_state" className="block text-sm font-medium text-gray-700 mb-1">
                  State
                </label>
                <input
                  type="text"
                  id="address_state"
                  name="address_state"
                  value={formData.address_state}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter state"
                  disabled={isLoading}
                />
              </div>

              <div>
                <label htmlFor="address_pin_code" className="block text-sm font-medium text-gray-700 mb-1">
                  PIN Code
                </label>
                <input
                  type="text"
                  id="address_pin_code"
                  name="address_pin_code"
                  value={formData.address_pin_code}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter PIN code"
                  disabled={isLoading}
                />
              </div>
            </div>
          </div>

          {/* Communication Preferences */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Communication Preferences</h3>
            
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="communication_email"
                  checked={formData.communication_email}
                  onChange={handleInputChange}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  disabled={isLoading}
                />
                <span className="ml-2 text-sm text-gray-700">Email notifications</span>
              </label>
              
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="communication_sms"
                  checked={formData.communication_sms}
                  onChange={handleInputChange}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  disabled={isLoading}
                />
                <span className="ml-2 text-sm text-gray-700">SMS notifications</span>
              </label>
              
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="communication_whatsapp"
                  checked={formData.communication_whatsapp}
                  onChange={handleInputChange}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  disabled={isLoading}
                />
                <span className="ml-2 text-sm text-gray-700">WhatsApp notifications</span>
              </label>
            </div>
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
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating...
                </>
              ) : (
                'Create Customer'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewCustomerModal;