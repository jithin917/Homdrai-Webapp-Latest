import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, User, TrendingUp, DollarSign } from 'lucide-react';
import { authService } from '../../services/auth-service';
import { SalesStaffModal } from './components/SalesStaffModal';
import { SalesPerformanceModal } from './components/SalesPerformanceModal';

interface SalesStaff {
  id: string;
  username: string;
  email: string;
  phone: string;
  role: string;
  store_id: string;
  is_active: boolean;
  created_at: string;
  store?: {
    name: string;
    code: string;
  };
}

export function SalesStaffManagement() {
  const [salesStaff, setSalesStaff] = useState<SalesStaff[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showPerformanceModal, setShowPerformanceModal] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<SalesStaff | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSalesStaff();
  }, []);

  const loadSalesStaff = async () => {
    try {
      setLoading(true);
      const data = await authService.getUsersByRole('sales_staff');
      setSalesStaff(data);
    } catch (err) {
      console.error('Error loading sales staff:', err);
      setError('Failed to load sales staff');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateStaff = () => {
    setSelectedStaff(null);
    setShowModal(true);
  };

  const handleEditStaff = (staff: SalesStaff) => {
    setSelectedStaff(staff);
    setShowModal(true);
  };

  const handleDeleteStaff = async (staffId: string) => {
    if (!confirm('Are you sure you want to delete this sales staff member?')) return;

    try {
      await authService.deleteUser(staffId);
      await loadSalesStaff();
    } catch (err) {
      console.error('Error deleting sales staff:', err);
      setError('Failed to delete sales staff');
    }
  };

  const handleViewPerformance = (staff: SalesStaff) => {
    setSelectedStaff(staff);
    setShowPerformanceModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setSelectedStaff(null);
    loadSalesStaff();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sales Staff Management</h1>
          <p className="text-gray-600">Manage sales staff profiles and track performance</p>
        </div>
        <button
          onClick={handleCreateStaff}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Sales Staff
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Staff Member
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Store
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Joined
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {salesStaff.map((staff) => (
                <tr key={staff.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                          <User className="h-5 w-5 text-green-600" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {staff.username}
                        </div>
                        <div className="text-sm text-gray-500">
                          {staff.email}
                        </div>
                        <div className="text-sm text-gray-500">
                          {staff.phone}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {staff.store?.name || 'Not assigned'}
                    </div>
                    <div className="text-sm text-gray-500">
                      {staff.store?.code || ''}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                      {staff.role.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      staff.is_active 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {staff.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(staff.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleViewPerformance(staff)}
                        className="text-green-600 hover:text-green-900"
                        title="View Performance"
                      >
                        <TrendingUp className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleEditStaff(staff)}
                        className="text-indigo-600 hover:text-indigo-900"
                        title="Edit Staff"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteStaff(staff.id)}
                        className="text-red-600 hover:text-red-900"
                        title="Delete Staff"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {salesStaff.length === 0 && !loading && (
        <div className="text-center py-12">
          <User className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No sales staff found</h3>
          <p className="mt-1 text-sm text-gray-500">Get started by adding a new sales staff member.</p>
          <div className="mt-6">
            <button
              onClick={handleCreateStaff}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 mx-auto"
            >
              <Plus className="h-4 w-4" />
              Add Sales Staff
            </button>
          </div>
        </div>
      )}

      {showModal && (
        <SalesStaffModal
          staff={selectedStaff}
          onClose={handleModalClose}
        />
      )}

      {showPerformanceModal && selectedStaff && (
        <SalesPerformanceModal
          staff={selectedStaff}
          onClose={() => setShowPerformanceModal(false)}
        />
      )}
    </div>
  );
}