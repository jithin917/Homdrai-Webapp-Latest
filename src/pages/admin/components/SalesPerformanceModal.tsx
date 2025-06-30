import React, { useState, useEffect } from 'react';
import { X, TrendingUp, DollarSign, CheckCircle, Users } from 'lucide-react';

interface SalesPerformanceModalProps {
  staff: any;
  onClose: () => void;
}

export function SalesPerformanceModal({ staff, onClose }: SalesPerformanceModalProps) {
  const [performance, setPerformance] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPerformanceData();
  }, [staff.id]);

  const loadPerformanceData = async () => {
    try {
      setLoading(true);
      // This would be implemented with actual performance data fetching
      // For now, showing placeholder data structure
      setPerformance([]);
    } catch (err) {
      console.error('Error loading performance data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Sales Performance - {staff.username}
            </h2>
            <p className="text-gray-600">Performance metrics and analytics</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Performance Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-blue-600">Orders Created</p>
                <p className="text-2xl font-bold text-blue-900">0</p>
              </div>
            </div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-green-600">Orders Completed</p>
                <p className="text-2xl font-bold text-green-900">0</p>
              </div>
            </div>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-yellow-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-yellow-600">Total Revenue</p>
                <p className="text-2xl font-bold text-yellow-900">₹0</p>
              </div>
            </div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-purple-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-purple-600">Quality Score</p>
                <p className="text-2xl font-bold text-purple-900">N/A</p>
              </div>
            </div>
          </div>
        </div>

        {/* Performance History */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Performance History</h3>
          <div className="text-center py-8">
            <TrendingUp className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No performance data available</h3>
            <p className="mt-1 text-sm text-gray-500">
              Performance metrics will appear here once the staff member starts creating and managing orders.
            </p>
          </div>
        </div>

        <div className="flex justify-end pt-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}