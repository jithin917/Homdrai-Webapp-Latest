import React, { useState, useEffect } from 'react';
import { 
  X, 
  FileText, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Eye, 
  Download,
  Clock,
  User,
  Calendar
} from 'lucide-react';
import { api, type PartnerDocument, type DocumentReview } from '../../../lib/supabase';

interface DocumentReviewModalProps {
  document: PartnerDocument;
  partnershipData: any;
  isOpen: boolean;
  onClose: () => void;
  onReviewComplete: () => void;
}

const DocumentReviewModal: React.FC<DocumentReviewModalProps> = ({
  document,
  partnershipData,
  isOpen,
  onClose,
  onReviewComplete
}) => {
  const [reviewStatus, setReviewStatus] = useState<'approved' | 'rejected' | 'needs_revision'>('approved');
  const [comments, setComments] = useState('');
  const [loading, setLoading] = useState(false);
  const [reviewHistory, setReviewHistory] = useState<DocumentReview[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  useEffect(() => {
    if (isOpen && document.id) {
      fetchReviewHistory();
    }
  }, [isOpen, document.id]);

  const fetchReviewHistory = async () => {
    try {
      setLoadingHistory(true);
      const history = await api.getDocumentReviews(document.id);
      setReviewHistory(history);
    } catch (error) {
      console.error('Error fetching review history:', error);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.reviewPartnerDocument(document.id, {
        status: reviewStatus,
        comments: comments.trim(),
        reviewer_name: 'Admin User', // In production, get from auth context
        partnership_id: document.partnership_id
      });

      onReviewComplete();
      onClose();
      
      // Reset form
      setComments('');
      setReviewStatus('approved');
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Error submitting review. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'needs_revision':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'needs_revision':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-center space-x-3">
              <FileText className="w-8 h-8 text-primary-600" />
              <div>
                <h2 className="text-xl font-bold text-gray-900">Document Review</h2>
                <p className="text-gray-600">{document.document_name}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Partnership Info */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-gray-900 mb-2">Partnership Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Unit Name:</span>
                <span className="ml-2 font-medium">{partnershipData.unit_name}</span>
              </div>
              <div>
                <span className="text-gray-600">Owner:</span>
                <span className="ml-2 font-medium">{partnershipData.owner_name}</span>
              </div>
              <div>
                <span className="text-gray-600">Email:</span>
                <span className="ml-2 font-medium">{partnershipData.email}</span>
              </div>
              <div>
                <span className="text-gray-600">Location:</span>
                <span className="ml-2 font-medium">{partnershipData.city}, {partnershipData.state}</span>
              </div>
            </div>
          </div>

          {/* Document Details */}
          <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-gray-900 mb-4">Document Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Document Type</label>
                <p className="text-sm text-gray-900 capitalize">
                  {document.document_type.replace('_', ' ')}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Required</label>
                <p className="text-sm text-gray-900">
                  {document.is_required ? 'Yes' : 'No'}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Submission Date</label>
                <p className="text-sm text-gray-900">
                  {document.submission_date 
                    ? new Date(document.submission_date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })
                    : 'Not submitted'
                  }
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">File Size</label>
                <p className="text-sm text-gray-900">
                  {document.file_size ? formatFileSize(document.file_size) : 'Unknown'}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Current Status</label>
                <div className="flex items-center space-x-2">
                  {getStatusIcon(document.admin_review_status)}
                  <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(document.admin_review_status)}`}>
                    {document.admin_review_status.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">File Type</label>
                <p className="text-sm text-gray-900">
                  {document.mime_type || 'Unknown'}
                </p>
              </div>
            </div>

            {/* Document Actions */}
            {document.document_url && (
              <div className="mt-4 flex space-x-3">
                <a
                  href={document.document_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Eye className="w-4 h-4" />
                  <span>View Document</span>
                </a>
                <a
                  href={document.document_url}
                  download
                  className="inline-flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>Download</span>
                </a>
              </div>
            )}

            {/* Previous Comments */}
            {document.admin_comments && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h4 className="font-medium text-yellow-800 mb-1">Previous Review Comments</h4>
                <p className="text-sm text-yellow-700">{document.admin_comments}</p>
                {document.reviewed_by && document.reviewed_at && (
                  <div className="mt-2 text-xs text-yellow-600">
                    Reviewed by {document.reviewed_by} on{' '}
                    {new Date(document.reviewed_at).toLocaleDateString()}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Review History */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 mb-4">Review History</h3>
            {loadingHistory ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600 mx-auto"></div>
              </div>
            ) : reviewHistory.length > 0 ? (
              <div className="space-y-3">
                {reviewHistory.map((review) => (
                  <div key={review.id} className="border border-gray-200 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(review.review_status)}
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(review.review_status)}`}>
                          {review.review_status.replace('_', ' ').toUpperCase()}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <User className="w-4 h-4" />
                        <span>{review.reviewer_name}</span>
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(review.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    {review.comments && (
                      <p className="text-sm text-gray-700">{review.comments}</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No review history available.</p>
            )}
          </div>

          {/* Review Form */}
          <form onSubmit={handleSubmitReview} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Review Decision
              </label>
              <div className="space-y-2">
                <label className="flex items-center space-x-3">
                  <input
                    type="radio"
                    name="reviewStatus"
                    value="approved"
                    checked={reviewStatus === 'approved'}
                    onChange={(e) => setReviewStatus(e.target.value as any)}
                    className="w-4 h-4 text-green-600 focus:ring-green-500"
                  />
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm font-medium text-gray-900">Approve</span>
                  </div>
                </label>
                <label className="flex items-center space-x-3">
                  <input
                    type="radio"
                    name="reviewStatus"
                    value="needs_revision"
                    checked={reviewStatus === 'needs_revision'}
                    onChange={(e) => setReviewStatus(e.target.value as any)}
                    className="w-4 h-4 text-yellow-600 focus:ring-yellow-500"
                  />
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="w-4 h-4 text-yellow-500" />
                    <span className="text-sm font-medium text-gray-900">Needs Revision</span>
                  </div>
                </label>
                <label className="flex items-center space-x-3">
                  <input
                    type="radio"
                    name="reviewStatus"
                    value="rejected"
                    checked={reviewStatus === 'rejected'}
                    onChange={(e) => setReviewStatus(e.target.value as any)}
                    className="w-4 h-4 text-red-600 focus:ring-red-500"
                  />
                  <div className="flex items-center space-x-2">
                    <XCircle className="w-4 h-4 text-red-500" />
                    <span className="text-sm font-medium text-gray-900">Reject</span>
                  </div>
                </label>
              </div>
            </div>

            <div>
              <label htmlFor="comments" className="block text-sm font-medium text-gray-700 mb-2">
                Review Comments
                {reviewStatus !== 'approved' && <span className="text-red-500 ml-1">*</span>}
              </label>
              <textarea
                id="comments"
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                required={reviewStatus !== 'approved'}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder={
                  reviewStatus === 'approved' 
                    ? 'Optional: Add any additional comments...'
                    : reviewStatus === 'needs_revision'
                    ? 'Please specify what needs to be revised...'
                    : 'Please explain why this document is being rejected...'
                }
              />
            </div>

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || (reviewStatus !== 'approved' && !comments.trim())}
                className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Submitting...</span>
                  </>
                ) : (
                  <span>Submit Review</span>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default DocumentReviewModal;