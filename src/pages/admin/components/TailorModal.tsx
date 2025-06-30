import React, { useState, useEffect } from 'react';
import { X, Eye, EyeOff } from 'lucide-react';
import { tailorService } from '../../../services/tailor-service';
import { authService } from '../../../services/auth-service';

interface TailorModalProps {
  tailor?: any;
  onClose: () => void;
}

export function TailorModal({ tailor, onClose }: TailorModalProps) {
  const [formData, setFormData] = useState({
    // User data
    username: '',
    email: '',
    phone: '',
    password: '',
    // Tailor data
    specializations: [] as string[],
    skill_level: 'beginner',
    hourly_rate: 0,
    max_concurrent_orders: 5,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedCredentials, setGeneratedCredentials] = useState<{username: string, password: string} | null>(null);

  const specializationOptions = [
    'Shirts', 'Pants', 'Suits', 'Dresses', 'Blouses', 'Skirts', 
    'Jackets', 'Coats', 'Traditional Wear', 'Formal Wear', 'Casual Wear'
  ];

  useEffect(() => {
    if (tailor) {
      setFormData({
        username: tailor.user.username,
        email: tailor.user.email,
        phone: tailor.user.phone,
        password: '',
        specializations: tailor.specializations || [],
        skill_level: tailor.skill_level,
        hourly_rate: tailor.hourly_rate,
        max_concurrent_orders: tailor.max_concurrent_orders,
      });
    } else {
      // Generate credentials for new tailor
      generateCredentials();
    }
  }, [tailor]);

  const generateCredentials = () => {
    const username = `tailor_${Math.random().toString(36).substr(2, 6)}`;
    const password = Math.random().toString(36).substr(2, 10);
    setFormData(prev => ({ ...prev, username, password }));
    setGeneratedCredentials({ username, password });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'hourly_rate' || name === 'max_concurrent_orders' ? Number(value) : value
    }));
  };

  const handleSpecializationChange = (specialization: string) => {
    setFormData(prev => ({
      ...prev,
      specializations: prev.specializations.includes(specialization)
        ? prev.specializations.filter(s => s !== specialization)
        : [...prev.specializations, specialization]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (tailor) {
        // Update existing tailor
        await authService.updateUser(tailor.user_id, {
          username: formData.username,
          email: formData.email,
          phone: formData.phone,
          ...(formData.password && { password: formData.password })
        });

        await tailorService.updateTailor(tailor.id, {
          specializations: formData.specializations,
          skill_level: formData.skill_level,
          hourly_rate: formData.hourly_rate,
          max_concurrent_orders: formData.max_concurrent_orders,
        });
      } else {
        // Create new tailor
        const user = await authService.createUser({
          username: formData.username,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
          role: 'tailor'
        });

        const tailorCode = await tailorService.generateTailorCode();

        await tailorService.createTailor({
          user_id: user.id,
          tailor_code: tailorCode,
          specializations: formData.specializations,
          skill_level: formData.skill_level,
          hourly_rate: formData.hourly_rate,
          max_concurrent_orders: formData.max_concurrent_orders,
        });
      }

      onClose();
    } catch (err: any) {
      console.error('Error saving tailor:', err);
      setError(err.message || 'Failed to save tailor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">
            {tailor ? 'Edit Tailor' : 'Add New Tailor'}
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

        {generatedCredentials && !tailor && (
          <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg mb-4">
            <p className="font-medium">Generated Login Credentials:</p>
            <p>Username: <span className="font-mono">{generatedCredentials.username}</span></p>
            <p>Password: <span className="font-mono">{generatedCredentials.password}</span></p>
            <p className="text-sm mt-2">Please save these credentials and share them with the tailor.</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* User Information */}
          <div className="border-b border-gray-200 pb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">User Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  Password {!tailor && '*'}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required={!tailor}
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
                {tailor && (
                  <p className="text-sm text-gray-500 mt-1">Leave blank to keep current password</p>
                )}
              </div>
            </div>
          </div>

          {/* Tailor Information */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Tailor Information</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Specializations
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {specializationOptions.map((spec) => (
                    <label key={spec} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.specializations.includes(spec)}
                        onChange={() => handleSpecializationChange(spec)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">{spec}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Skill Level
                  </label>
                  <select
                    name="skill_level"
                    value={formData.skill_level}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                    <option value="expert">Expert</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Hourly Rate (₹)
                  </label>
                  <input
                    type="number"
                    name="hourly_rate"
                    value={formData.hourly_rate}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Max Concurrent Orders
                  </label>
                  <input
                    type="number"
                    name="max_concurrent_orders"
                    value={formData.max_concurrent_orders}
                    onChange={handleInputChange}
                    min="1"
                    max="20"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
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
              {loading ? 'Saving...' : (tailor ? 'Update Tailor' : 'Create Tailor')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}