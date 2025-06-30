import React, { useState } from 'react';
import { X, CheckCircle, AlertTriangle, Star } from 'lucide-react';
import { assignmentService } from '../../../services/assignment-service';

interface QualityCheckModalProps {
  order: any;
  onClose: () => void;
  onCompleted: () => void;
}

export function QualityCheckModal({ order, onClose, onCompleted }: QualityCheckModalProps) {
  const [formData, setFormData] = useState({
    overall_quality: 'good',
    stitching_quality: 4,
    finishing_quality: 4,
    measurement_accuracy: 4,
    design_adherence: 4,
    defects_found: [] as string[],
    corrective_actions: '',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const qualityOptions = [
    { value: 'excellent', label: 'Excellent', color: 'text-green-600' },
    { value: 'good', label: 'Good', color: 'text-blue-600' },
    { value: 'satisfactory', label: 'Satisfactory', color: 'text-yellow-600' },
    { value: 'needs_improvement', label: 'Needs Improvement', color: 'text-orange-600' },
    { value: 'rejected', label: 'Rejected', color: 'text-red-600' }
  ];

  const defectOptions = [
    'Uneven stitching',
    'Loose threads',
    'Measurement issues',
    'Color mismatch',
    'Fabric defects',
    'Button/zipper issues',
    'Finishing problems',
    'Design deviation'
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name.includes('_quality') || name.includes('_accuracy') || name.includes('_adherence') 
        ? Number(value) 
        : value
    }));
  };

  const handleDefectChange = (defect: string) => {
    setFormData(prev => ({
      ...prev,
      defects_found: prev.defects_found.includes(defect)
        ? prev.defects_found.filter(d => d !== defect)
        : [...prev.defects_found, defect]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const currentUser = JSON.parse(localStorage.getItem('oms_user') || '{}');
      
      await assignmentService.performQualityCheck({
        order_id: order.id,
        checked_by: currentUser.id,
        ...formData
      });

      onCompleted();
      onClose();
    } catch (err: any) {
      console.error('Error performing quality check:', err);
      setError(err.message || 'Failed to perform quality check');
    } finally {
      setLoading(false);
    }
  };

  const renderStarRating = (name: string, value: number) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setFormData(prev => ({ ...prev, [name]: star }))}
            className={`${
              star <= value ? 'text-yellow-400' : 'text-gray-300'
            } hover:text-yellow-400`}
          >
            <Star className="h-5 w-5 fill-current" />
          </button>
        ))}
        <span className="ml-2 text-sm text-gray-600">{value}/5</span>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Quality Check</h2>
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

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Overall Quality */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Overall Quality Assessment *
            </label>
            <select
              name="overall_quality"
              value={formData.overall_quality}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {qualityOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Quality Ratings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Stitching Quality
              </label>
              {renderStarRating('stitching_quality', formData.stitching_quality)}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Finishing Quality
              </label>
              {renderStarRating('finishing_quality', formData.finishing_quality)}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Measurement Accuracy
              </label>
              {renderStarRating('measurement_accuracy', formData.measurement_accuracy)}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Design Adherence
              </label>
              {renderStarRating('design_adherence', formData.design_adherence)}
            </div>
          </div>

          {/* Defects Found */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Defects Found (if any)
            </label>
            <div className="grid grid-cols-2 gap-2">
              {defectOptions.map((defect) => (
                <label key={defect} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.defects_found.includes(defect)}
                    onChange={() => handleDefectChange(defect)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">{defect}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Corrective Actions */}
          {formData.defects_found.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Corrective Actions Required
              </label>
              <textarea
                name="corrective_actions"
                value={formData.corrective_actions}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Describe what needs to be corrected..."
              />
            </div>
          )}

          {/* Additional Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Additional Notes
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Any additional observations or comments..."
            />
          </div>

          {/* Quality Check Result Preview */}
          <div className={`p-4 rounded-lg border ${
            formData.overall_quality === 'rejected' || 
            formData.stitching_quality < 3 || 
            formData.finishing_quality < 3
              ? 'bg-red-50 border-red-200'
              : 'bg-green-50 border-green-200'
          }`}>
            <div className="flex items-center">
              {formData.overall_quality === 'rejected' || 
               formData.stitching_quality < 3 || 
               formData.finishing_quality < 3 ? (
                <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
              ) : (
                <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
              )}
              <span className="font-medium">
                {formData.overall_quality === 'rejected' || 
                 formData.stitching_quality < 3 || 
                 formData.finishing_quality < 3
                  ? 'Quality Check Failed - Order will be returned for corrections'
                  : 'Quality Check Passed - Order approved for completion'
                }
              </span>
            </div>
          </div>

          {/* Action Buttons */}
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
              {loading ? 'Submitting...' : 'Submit Quality Check'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}