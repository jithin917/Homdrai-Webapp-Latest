import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle, AlertCircle, User, Award, TrendingUp } from 'lucide-react';
import { assignmentService } from '../../services/assignment-service';
import { tailorService } from '../../services/tailor-service';
import { useAuth } from '../../hooks/useAuth';
import { AssignmentCard } from './components/AssignmentCard';

export function TailorDashboard() {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState<any[]>([]);
  const [tailorProfile, setTailorProfile] = useState<any>(null);
  const [performance, setPerformance] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Get tailor profile
      const profile = await tailorService.getTailorByUserId(user!.id);
      setTailorProfile(profile);

      // Get current assignments
      const assignmentData = await assignmentService.getTailorAssignments(profile.id);
      setAssignments(assignmentData);

      // Get current month performance
      const currentMonth = new Date().toISOString().slice(0, 7) + '-01';
      const performanceData = await tailorService.getTailorPerformance(profile.id, currentMonth);
      setPerformance(performanceData[0] || null);

    } catch (err) {
      console.error('Error loading dashboard data:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleStartWork = async (assignmentId: string) => {
    try {
      await assignmentService.startAssignment(assignmentId);
      await loadDashboardData();
    } catch (err) {
      console.error('Error starting work:', err);
      setError('Failed to start work on assignment');
    }
  };

  const handleCompleteWork = async (assignmentId: string, notes?: string) => {
    try {
      await assignmentService.completeStitching(assignmentId, notes);
      await loadDashboardData();
    } catch (err) {
      console.error('Error completing work:', err);
      setError('Failed to complete work');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!tailorProfile) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="mx-auto h-12 w-12 text-red-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">Profile Not Found</h3>
        <p className="mt-1 text-sm text-gray-500">Your tailor profile could not be found. Please contact the administrator.</p>
      </div>
    );
  }

  const assignedOrders = assignments.filter(a => a.status === 'assigned');
  const inProgressOrders = assignments.filter(a => a.status === 'in_progress');
  const urgentOrders = assignments.filter(a => a.order.priority === 'urgent');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Welcome, {user?.username}</h1>
            <p className="text-gray-600">Tailor Code: {tailorProfile.tailor_code}</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{tailorProfile.current_order_count}</div>
              <div className="text-sm text-gray-500">Active Orders</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{tailorProfile.total_orders_completed}</div>
              <div className="text-sm text-gray-500">Completed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{tailorProfile.quality_rating.toFixed(1)}</div>
              <div className="text-sm text-gray-500">Quality Rating</div>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-center">
            <Clock className="h-8 w-8 text-blue-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-blue-600">New Assignments</p>
              <p className="text-2xl font-bold text-blue-900">{assignedOrders.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg">
          <div className="flex items-center">
            <User className="h-8 w-8 text-yellow-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-yellow-600">In Progress</p>
              <p className="text-2xl font-bold text-yellow-900">{inProgressOrders.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-red-50 p-4 rounded-lg">
          <div className="flex items-center">
            <AlertCircle className="h-8 w-8 text-red-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-red-600">Urgent Orders</p>
              <p className="text-2xl font-bold text-red-900">{urgentOrders.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="flex items-center">
            <Award className="h-8 w-8 text-green-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-green-600">This Month</p>
              <p className="text-2xl font-bold text-green-900">{performance?.orders_completed || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Current Assignments */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Current Assignments</h2>
        </div>
        <div className="p-6">
          {assignments.length > 0 ? (
            <div className="space-y-4">
              {assignments.map((assignment) => (
                <AssignmentCard
                  key={assignment.id}
                  assignment={assignment}
                  onStartWork={handleStartWork}
                  onCompleteWork={handleCompleteWork}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <CheckCircle className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No current assignments</h3>
              <p className="mt-1 text-sm text-gray-500">You have no active assignments at the moment.</p>
            </div>
          )}
        </div>
      </div>

      {/* Performance Summary */}
      {performance && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">This Month's Performance</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{performance.orders_completed}</div>
              <div className="text-sm text-gray-500">Orders Completed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{performance.quality_score?.toFixed(1) || 'N/A'}</div>
              <div className="text-sm text-gray-500">Quality Score</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">₹{performance.total_earnings?.toFixed(2) || '0.00'}</div>
              <div className="text-sm text-gray-500">Total Earnings</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}