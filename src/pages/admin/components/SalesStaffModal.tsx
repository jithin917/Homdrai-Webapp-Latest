import React, { useState, useEffect } from 'react';
import { X, Eye, EyeOff } from 'lucide-react';
import { authService } from '../../../services/auth-service';
import { storeService } from '../../../services/store-service';

interface SalesStaffModalProps {
  staff?: any;
  onClose: () => void;
}

export function SalesStaffModal({ staff, onClose }: SalesStaffModalProps) {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    phone: '',
    password: '',
    role: 'sales_staff',
    store_id: '',
  });
  const [stores, setStores] = useState<any[]>([]);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedCredentials, setGeneratedCredentials] = useState<{username: string, password: string} | null>(null);

  useEffect(() => {
    loadStores();
    if (staff) {
      setFormData({
        username: staff.username,
        email: staff.email,
        phone: staff.phone,
        password: '',
        role: staff.role,
        store_id: staff.store_id || '',
      });
    } else {
      generateCredentials();
    }
  }, [staff]);

  const loadStores = async () => {
    try {
      const storeData = await storeService.getAllStores();
      setStores(storeData);
    } catch (err) {
      console.error('Error loading stores:', err);
    }
  };

  const generateCredentials = () => {
    const username = `staff_${Math.random().toString(36).substr(2, 6)}`;
    const password = Math.random().toString(36).substr(2, 10);
    setFormData(prev => ({ ...prev, username, password }));
    setGeneratedCredentials({ username, password });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (staff) {
        // Update existing staff
        await authService.updateUser(staff.id, {
          username: formData.username,
          email: formData.email,
          phone: formData.phone,
          store_id: formData.store_id || null,
          ...(formData.password && { password: formData.password })
        });
      } else {
        // Create new staff
        await authService.createUser({
          username: formData.username,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
          role: formData.role as any,
          store_id: formData.store_id || null
        });
      }

      onClose();
    } catch (err: any) {
      console.error('Error saving sales staff:', err);
      setError(err.message || 'Failed to save sales staff');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">
            {staff ? 'Edit Sales Staff' : 'Add New Sales Staff'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        {generatedCredentials && !staff && (
          <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg mb-4">
            <p className="font-medium">Generated Login Credentials:</p>
            <p>Username: <span className="font-mono">{generatedCredentials.username}</span></p>
            <p>Password: <span className="font-mono">{generatedCredentials.password}</span></p>
            <p className="text-sm mt-2">Please save these credentials and share them with the staff member.</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Username *
            </label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email *
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone *
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password {!staff && '*'}
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                required={!staff}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-gray-400" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-400" />
                )}
              </button>
            </div>
            {staff && (
              <p className="text-sm text-gray-500 mt-1">Leave blank to keep current password</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Role
            </label>
            <select
              name="role"
              value={formData.role}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="sales_staff">Sales Staff</option>
              <option value="store_manager">Store Manager</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Assigned Store
            </label>
            <select
              name="store_id"
              value={formData.store_id}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">No store assigned</option>
              {stores.map((store) => (
                <option key={store.id} value={store.id}>
                  {store.name} ({store.code})
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Saving...' : (staff ? 'Update Staff' : 'Create Staff')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}