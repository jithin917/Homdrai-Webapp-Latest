import React, { useState, useEffect } from 'react';
import { X, User, Clock, Award } from 'lucide-react';
import { tailorService } from '../../../services/tailor-service';
import { assignmentService } from '../../../services/assignment-service';

interface OrderAssignmentModalProps {
  order: any;
  onClose: () => void;
  onAssigned: () => void;
}

export function OrderAssignmentModal({ order, onClose, onAssigned }: OrderAssignmentModalProps) {
  const [availableTailors, setAvailableTailors] = useState<any[]>([]);
  const [selectedTailor, setSelectedTailor] = useState<string>('');
  const [estimatedTime, setEstimatedTime] = useState('');
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAvailableTailors();
  }, []);

  const loadAvailableTailors = async () => {
    try {
      setLoading(true);
      const tailors = await tailorService.getAvailableTailors();
      setAvailableTailors(tailors);
    } catch (err) {
      console.error('Error loading tailors:', err);
      setError('Failed to load available tailors');
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async () => {
    if (!selectedTailor) {
      setError('Please select a tailor');
      return;
    }

    try {
      setAssigning(true);
      setError(null);

      // Get current user ID (assuming it's available in context)
      const currentUser = JSON.parse(localStorage.getItem('oms_user') || '{}');
      
      await assignmentService.assignOrderToTailor(
        order.id,
        selectedTailor,
        currentUser.id,
        estimatedTime || undefined
      );

      onAssigned();
      onClose();
    } catch (err: any) {
      console.error('Error assigning order:', err);
      setError(err.message || 'Failed to assign order');
    } finally {
      setAssigning(false);
    }
  };

  const getSkillLevelColor = (level: string) => {
    switch (level) {
      case 'expert': return 'bg-purple-100 text-purple-800';
      case 'advanced': return 'bg-blue-100 text-blue-800';
      case 'intermediate': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Assign Order to Tailor</h2>
            <p className="text-gray-600">Order #{order.id} - {order.garment_type}</p>
          </div>
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

        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Available Tailors */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Available Tailors</h3>
              {availableTailors.length > 0 ? (
                <div className="space-y-3">
                  {availableTailors.map((tailor) => (
                    <div
                      key={tailor.id}
                      className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                        selectedTailor === tailor.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setSelectedTailor(tailor.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <input
                            type="radio"
                            checked={selectedTailor === tailor.id}
                            onChange={() => setSelectedTailor(tailor.id)}
                            className="mr-3"
                          />
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                              <User className="h-5 w-5 text-blue-600" />
                            </div>
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900">
                              {tailor.user.username}
                            </div>
                            <div className="text-sm text-gray-500">
                              Code: {tailor.tailor_code}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="text-center">
                            <div className="text-sm font-medium text-gray-900">
                              {tailor.current_order_count}/{tailor.max_concurrent_orders}
                            </div>
                            <div className="text-xs text-gray-500">Current Orders</div>
                          </div>
                          <div className="text-center">
                            <div className="flex items-center">
                              <Award className="h-4 w-4 text-yellow-500 mr-1" />
                              <span className="text-sm font-medium text-gray-900">
                                {tailor.quality_rating.toFixed(1)}
                              </span>
                            </div>
                            <div className="text-xs text-gray-500">Quality</div>
                          </div>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getSkillLevelColor(tailor.skill_level)}`}>
                            {tailor.skill_level}
                          </span>
                        </div>
                      </div>
                      
                      {/* Specializations */}
                      {tailor.specializations.length > 0 && (
                        <div className="mt-2 ml-16">
                          <div className="flex flex-wrap gap-1">
                            {tailor.specializations.map((spec: string) => (
                              <span
                                key={spec}
                                className="inline-flex px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded"
                              >
                                {spec}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <User className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No available tailors</h3>
                  <p className="mt-1 text-sm text-gray-500">All tailors are currently at capacity.</p>
                </div>
              )}
            </div>

            {/* Estimated Completion Time */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estimated Completion Time (Optional)
              </label>
              <div className="flex items-center">
                <Clock className="h-4 w-4 text-gray-400 mr-2" />
                <input
                  type="text"
                  value={estimatedTime}
                  onChange={(e) => setEstimatedTime(e.target.value)}
                  placeholder="e.g., 2 days, 1 week"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleAssign}
                disabled={!selectedTailor || assigning}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {assigning ? 'Assigning...' : 'Assign Order'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}