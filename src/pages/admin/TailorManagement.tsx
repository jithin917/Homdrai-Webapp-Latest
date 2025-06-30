import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, User, Award, Clock, CheckCircle } from 'lucide-react';
import { tailorService } from '../../services/tailor-service';
import { authService } from '../../services/auth-service';
import { TailorModal } from './components/TailorModal';
import { TailorPerformanceModal } from './components/TailorPerformanceModal';

interface Tailor {
  id: string;
  user_id: string;
  tailor_code: string;
  specializations: string[];
  skill_level: string;
  hourly_rate: number;
  is_available: boolean;
  max_concurrent_orders: number;
  current_order_count: number;
  total_orders_completed: number;
  quality_rating: number;
  user: {
    id: string;
    username: string;
    email: string;
    phone: string;
    is_active: boolean;
  };
}

export function TailorManagement() {
  const [tailors, setTailors] = useState<Tailor[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showPerformanceModal, setShowPerformanceModal] = useState(false);
  const [selectedTailor, setSelectedTailor] = useState<Tailor | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadTailors();
  }, []);

  const loadTailors = async () => {
    try {
      setLoading(true);
      const data = await tailorService.getAllTailors();
      setTailors(data);
    } catch (err) {
      console.error('Error loading tailors:', err);
      setError('Failed to load tailors');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTailor = () => {
    setSelectedTailor(null);
    setShowModal(true);
  };

  const handleEditTailor = (tailor: Tailor) => {
    setSelectedTailor(tailor);
    setShowModal(true);
  };

  const handleDeleteTailor = async (tailorId: string) => {
    if (!confirm('Are you sure you want to delete this tailor?')) return;

    try {
      await tailorService.deleteTailor(tailorId);
      await loadTailors();
    } catch (err) {
      console.error('Error deleting tailor:', err);
      setError('Failed to delete tailor');
    }
  };

  const handleViewPerformance = (tailor: Tailor) => {
    setSelectedTailor(tailor);
    setShowPerformanceModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setSelectedTailor(null);
    loadTailors();
  };

  const getSkillLevelColor = (level: string) => {
    switch (level) {
      case 'expert': return 'bg-purple-100 text-purple-800';
      case 'advanced': return 'bg-blue-100 text-blue-800';
      case 'intermediate': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getAvailabilityColor = (isAvailable: boolean) => {
    return isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
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
          <h1 className="text-2xl font-bold text-gray-900">Tailor Management</h1>
          <p className="text-gray-600">Manage tailor profiles, credentials, and performance</p>
        </div>
        <button
          onClick={handleCreateTailor}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Tailor
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
                  Tailor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Code
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Skill Level
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Availability
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Current Orders
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Performance
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {tailors.map((tailor) => (
                <tr key={tailor.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <User className="h-5 w-5 text-blue-600" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {tailor.user.username}
                        </div>
                        <div className="text-sm text-gray-500">
                          {tailor.user.email}
                        </div>
                        <div className="text-sm text-gray-500">
                          {tailor.user.phone}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-mono text-gray-900">
                      {tailor.tailor_code}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getSkillLevelColor(tailor.skill_level)}`}>
                      {tailor.skill_level}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getAvailabilityColor(tailor.is_available)}`}>
                      {tailor.is_available ? 'Available' : 'Busy'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {tailor.current_order_count} / {tailor.max_concurrent_orders}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                        <span className="text-sm text-gray-900">{tailor.total_orders_completed}</span>
                      </div>
                      <div className="flex items-center">
                        <Award className="h-4 w-4 text-yellow-500 mr-1" />
                        <span className="text-sm text-gray-900">{tailor.quality_rating.toFixed(1)}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleViewPerformance(tailor)}
                        className="text-blue-600 hover:text-blue-900"
                        title="View Performance"
                      >
                        <Award className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleEditTailor(tailor)}
                        className="text-indigo-600 hover:text-indigo-900"
                        title="Edit Tailor"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteTailor(tailor.id)}
                        className="text-red-600 hover:text-red-900"
                        title="Delete Tailor"
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

      {tailors.length === 0 && !loading && (
        <div className="text-center py-12">
          <User className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No tailors found</h3>
          <p className="mt-1 text-sm text-gray-500">Get started by adding a new tailor.</p>
          <div className="mt-6">
            <button
              onClick={handleCreateTailor}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 mx-auto"
            >
              <Plus className="h-4 w-4" />
              Add Tailor
            </button>
          </div>
        </div>
      )}

      {showModal && (
        <TailorModal
          tailor={selectedTailor}
          onClose={handleModalClose}
        />
      )}

      {showPerformanceModal && selectedTailor && (
        <TailorPerformanceModal
          tailor={selectedTailor}
          onClose={() => setShowPerformanceModal(false)}
        />
      )}
    </div>
  );
}