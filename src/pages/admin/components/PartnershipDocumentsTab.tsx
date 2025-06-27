import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Clock, 
  Eye,
  Building2,
  User,
  MapPin,
  Calendar,
  RefreshCw,
  Filter,
  ExternalLink
} from 'lucide-react';
import { api } from '../../../lib/supabase';
import DocumentReviewModal from './DocumentReviewModal';
import DocumentViewerModal from './DocumentViewerModal';

const PartnershipDocumentsTab = () => {
  const [partnerships, setPartnerships] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDocument, setSelectedDocument] = useState<any>(null);
  const [selectedPartnership, setSelectedPartnership] = useState<any>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showViewerModal, setShowViewerModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    fetchPartnershipsWithDocuments();
  }, []);

  const fetchPartnershipsWithDocuments = async () => {
    try {
      setLoading(true);
      const data = await api.getPartnershipsWithDocuments();
      setPartnerships(data);
    } catch (error) {
      console.error('Error fetching partnerships with documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDocumentReview = (document: any, partnership: any) => {
    setSelectedDocument(document);
    setSelectedPartnership(partnership);
    setShowReviewModal(true);
  };

  const handleDocumentView = (document: any, partnership: any) => {
    setSelectedDocument(document);
    setSelectedPartnership(partnership);
    setShowViewerModal(true);
  };

  const handleReviewComplete = () => {
    fetchPartnershipsWithDocuments();
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'needs_revision':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
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

  const getDocumentStats = (documents: any[]) => {
    const total = documents.length;
    const submitted = documents.filter(doc => doc.is_submitted).length;
    const approved = documents.filter(doc => doc.admin_review_status === 'approved').length;
    const pending = documents.filter(doc => doc.admin_review_status === 'pending' && doc.is_submitted).length;
    const needsRevision = documents.filter(doc => doc.admin_review_status === 'needs_revision').length;
    const rejected = documents.filter(doc => doc.admin_review_status === 'rejected').length;
    
    return { total, submitted, approved, pending, needsRevision, rejected };
  };

  const filteredPartnerships = partnerships.filter(partnership => {
    if (statusFilter === 'all') return true;
    
    const documents = partnership.partner_documents || [];
    const stats = getDocumentStats(documents);
    
    switch (statusFilter) {
      case 'pending_review':
        return stats.pending > 0;
      case 'needs_revision':
        return stats.needsRevision > 0;
      case 'completed':
        return stats.total > 0 && stats.approved === stats.total;
      case 'no_documents':
        return stats.submitted === 0;
      default:
        return true;
    }
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading partnership documents...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Stats and Filters */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Partnership Documents Review</h2>
          <button
            onClick={fetchPartnershipsWithDocuments}
            className="flex items-center space-x-2 text-gray-600 hover:text-primary-600 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center space-x-2">
              <Building2 className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">Total Partnerships</span>
            </div>
            <p className="text-2xl font-bold text-blue-900 mt-1">{partnerships.length}</p>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg">
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-yellow-600" />
              <span className="text-sm font-medium text-yellow-800">Pending Review</span>
            </div>
            <p className="text-2xl font-bold text-yellow-900 mt-1">
              {partnerships.reduce((acc, p) => {
                const docs = p.partner_documents || [];
                return acc + docs.filter(doc => doc.admin_review_status === 'pending' && doc.is_submitted).length;
              }, 0)}
            </p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="text-sm font-medium text-green-800">Approved</span>
            </div>
            <p className="text-2xl font-bold text-green-900 mt-1">
              {partnerships.reduce((acc, p) => {
                const docs = p.partner_documents || [];
                return acc + docs.filter(doc => doc.admin_review_status === 'approved').length;
              }, 0)}
            </p>
          </div>
          <div className="bg-red-50 p-4 rounded-lg">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <span className="text-sm font-medium text-red-800">Needs Action</span>
            </div>
            <p className="text-2xl font-bold text-red-900 mt-1">
              {partnerships.reduce((acc, p) => {
                const docs = p.partner_documents || [];
                return acc + docs.filter(doc => 
                  doc.admin_review_status === 'needs_revision' || doc.admin_review_status === 'rejected'
                ).length;
              }, 0)}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center space-x-4">
          <Filter className="w-4 h-4 text-gray-500" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="all">All Partnerships</option>
            <option value="pending_review">Pending Review</option>
            <option value="needs_revision">Needs Revision</option>
            <option value="completed">Review Completed</option>
            <option value="no_documents">No Documents Submitted</option>
          </select>
        </div>
      </div>

      {/* Partnerships List */}
      <div className="space-y-6">
        {filteredPartnerships.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No partnerships found matching the selected filter.</p>
          </div>
        ) : (
          filteredPartnerships.map((partnership) => {
            const documents = partnership.partner_documents || [];
            const stats = getDocumentStats(documents);
            const loginInfo = partnership.partner_logins?.[0];

            return (
              <div key={partnership.id} className="bg-white rounded-lg shadow-sm border border-gray-200">
                {/* Partnership Header */}
                <div className="p-6 border-b border-gray-200">
                  <div className="flex justify-between items-start">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
                        <Building2 className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{partnership.unit_name}</h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                          <div className="flex items-center space-x-1">
                            <User className="w-4 h-4" />
                            <span>{partnership.owner_name}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <MapPin className="w-4 h-4" />
                            <span>{partnership.city}, {partnership.state}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-4 h-4" />
                            <span>Applied {new Date(partnership.submission_date).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                        partnership.status === 'documents_approved' 
                          ? 'bg-green-100 text-green-800'
                          : partnership.status === 'documents_submitted'
                          ? 'bg-blue-100 text-blue-800'
                          : partnership.status === 'documents_requested'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {partnership.status.replace('_', ' ').toUpperCase()}
                      </span>
                      {loginInfo && (
                        <div className="text-xs text-gray-500 mt-1">
                          {loginInfo.credentials_sent ? 'Credentials sent' : 'No credentials'}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Document Stats */}
                  <div className="mt-4 grid grid-cols-2 md:grid-cols-6 gap-4">
                    <div className="text-center">
                      <p className="text-lg font-bold text-gray-900">{stats.total}</p>
                      <p className="text-xs text-gray-600">Total</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold text-blue-600">{stats.submitted}</p>
                      <p className="text-xs text-gray-600">Submitted</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold text-green-600">{stats.approved}</p>
                      <p className="text-xs text-gray-600">Approved</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold text-yellow-600">{stats.pending}</p>
                      <p className="text-xs text-gray-600">Pending</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold text-orange-600">{stats.needsRevision}</p>
                      <p className="text-xs text-gray-600">Revision</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold text-red-600">{stats.rejected}</p>
                      <p className="text-xs text-gray-600">Rejected</p>
                    </div>
                  </div>
                </div>

                {/* Documents List */}
                <div className="p-6">
                  {documents.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">No documents found for this partnership.</p>
                  ) : (
                    <div className="space-y-3">
                      {documents.map((document: any) => (
                        <div key={document.id} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <FileText className="w-5 h-5 text-gray-400" />
                              <div>
                                <h4 className="font-medium text-gray-900">{document.document_name}</h4>
                                <div className="flex items-center space-x-4 text-sm text-gray-600">
                                  <span className="capitalize">{document.document_type.replace('_', ' ')}</span>
                                  <span>{document.is_required ? 'Required' : 'Optional'}</span>
                                  {document.submission_date && (
                                    <span>Submitted {new Date(document.submission_date).toLocaleDateString()}</span>
                                  )}
                                  {document.total_versions > 1 && (
                                    <span className="text-blue-600">v{document.total_versions}</span>
                                  )}
                                  {document.view_count > 0 && (
                                    <span className="text-gray-500">{document.view_count} views</span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-3">
                              <div className="flex items-center space-x-2">
                                {getStatusIcon(document.admin_review_status)}
                                <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(document.admin_review_status)}`}>
                                  {document.admin_review_status.replace('_', ' ').toUpperCase()}
                                </span>
                              </div>
                              {document.is_submitted && (
                                <div className="flex items-center space-x-2">
                                  <button
                                    onClick={() => handleDocumentView(document, partnership)}
                                    className="flex items-center space-x-1 px-3 py-1 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"
                                  >
                                    <ExternalLink className="w-4 h-4" />
                                    <span>View</span>
                                  </button>
                                  <button
                                    onClick={() => handleDocumentReview(document, partnership)}
                                    className="flex items-center space-x-1 px-3 py-1 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm"
                                  >
                                    <Eye className="w-4 h-4" />
                                    <span>Review</span>
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                          {document.admin_comments && (
                            <div className="mt-2 p-2 bg-gray-50 rounded text-sm text-gray-700">
                              <strong>Comments:</strong> {document.admin_comments}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Document Review Modal */}
      {showReviewModal && selectedDocument && selectedPartnership && (
        <DocumentReviewModal
          document={selectedDocument}
          partnershipData={selectedPartnership}
          isOpen={showReviewModal}
          onClose={() => {
            setShowReviewModal(false);
            setSelectedDocument(null);
            setSelectedPartnership(null);
          }}
          onReviewComplete={handleReviewComplete}
        />
      )}

      {/* Document Viewer Modal */}
      {showViewerModal && selectedDocument && selectedPartnership && (
        <DocumentViewerModal
          document={selectedDocument}
          partnershipData={selectedPartnership}
          isOpen={showViewerModal}
          onClose={() => {
            setShowViewerModal(false);
            setSelectedDocument(null);
            setSelectedPartnership(null);
          }}
        />
      )}
    </div>
  );
};

export default PartnershipDocumentsTab;