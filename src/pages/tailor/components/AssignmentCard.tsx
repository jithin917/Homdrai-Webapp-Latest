import React, { useState } from 'react';
import { Clock, Play, CheckCircle, AlertTriangle, Calendar, Ruler } from 'lucide-react';

interface AssignmentCardProps {
  assignment: any;
  onStartWork: (assignmentId: string) => void;
  onCompleteWork: (assignmentId: string, notes?: string) => void;
}

export function AssignmentCard({ assignment, onStartWork, onCompleteWork }: AssignmentCardProps) {
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [completionNotes, setCompletionNotes] = useState('');

  const { order } = assignment;
  const dueDate = new Date(order.expected_delivery_date);
  const isUrgent = order.priority === 'urgent';
  const isOverdue = dueDate < new Date();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'assigned': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'in_progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleCompleteWork = () => {
    onCompleteWork(assignment.id, completionNotes);
    setShowCompleteModal(false);
    setCompletionNotes('');
  };

  return (
    <>
      <div className={`border rounded-lg p-4 ${getStatusColor(assignment.status)}`}>
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Order #{order.id}</h3>
            <p className="text-gray-600">{order.garment_type}</p>
          </div>
          <div className="flex items-center space-x-2">
            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(order.priority)}`}>
              {order.priority}
            </span>
            {isUrgent && <AlertTriangle className="h-4 w-4 text-red-500" />}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="flex items-center text-sm text-gray-600">
            <Calendar className="h-4 w-4 mr-2" />
            <span>Due: {dueDate.toLocaleDateString()}</span>
            {isOverdue && <span className="ml-2 text-red-600 font-medium">(Overdue)</span>}
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <Clock className="h-4 w-4 mr-2" />
            <span>Assigned: {new Date(assignment.assigned_at).toLocaleDateString()}</span>
          </div>
        </div>

        {/* Order Details */}
        <div className="bg-white bg-opacity-50 rounded p-3 mb-4">
          <h4 className="font-medium text-gray-900 mb-2">Order Details</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
            {order.fabric_type && (
              <div>
                <span className="font-medium">Fabric:</span> {order.fabric_type}
                {order.fabric_color && ` (${order.fabric_color})`}
              </div>
            )}
            {order.special_instructions && (
              <div className="md:col-span-2">
                <span className="font-medium">Instructions:</span> {order.special_instructions}
              </div>
            )}
          </div>
        </div>

        {/* Measurements */}
        {order.measurement && (
          <div className="bg-white bg-opacity-50 rounded p-3 mb-4">
            <h4 className="font-medium text-gray-900 mb-2 flex items-center">
              <Ruler className="h-4 w-4 mr-2" />
              Measurements ({order.measurement.unit})
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
              {order.measurement.top_fl && (
                <div><span className="font-medium">Full Length:</span> {order.measurement.top_fl}</div>
              )}
              {order.measurement.top_ch && (
                <div><span className="font-medium">Chest:</span> {order.measurement.top_ch}</div>
              )}
              {order.measurement.top_wr && (
                <div><span className="font-medium">Waist:</span> {order.measurement.top_wr}</div>
              )}
              {order.measurement.top_sl && (
                <div><span className="font-medium">Sleeve:</span> {order.measurement.top_sl}</div>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end space-x-2">
          {assignment.status === 'assigned' && (
            <button
              onClick={() => onStartWork(assignment.id)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <Play className="h-4 w-4" />
              Start Work
            </button>
          )}
          {assignment.status === 'in_progress' && (
            <button
              onClick={() => setShowCompleteModal(true)}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2"
            >
              <CheckCircle className="h-4 w-4" />
              Mark Complete
            </button>
          )}
        </div>
      </div>

      {/* Complete Work Modal */}
      {showCompleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Complete Stitching</h3>
            <p className="text-gray-600 mb-4">
              Mark Order #{order.id} as stitching complete. Add any notes about the work done.
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Completion Notes (Optional)
              </label>
              <textarea
                value={completionNotes}
                onChange={(e) => setCompletionNotes(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Any notes about the completed work..."
              />
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowCompleteModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleCompleteWork}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Mark Complete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}