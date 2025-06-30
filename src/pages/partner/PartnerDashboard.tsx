import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LogOut, 
  Upload, 
  FileText, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertCircle,
  Download,
  Eye,
  Building2
} from 'lucide-react';
import { api, type PartnerDocument } from '../../lib/supabase';

export const PartnerDashboard = () => {
  const [partner, setPartner] = useState<any>(null);
  const [documents, setDocuments] = useState<PartnerDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('partnerToken');
    const partnerData = localStorage.getItem('partnerData');
    
    if (!token || !partnerData) {
      navigate('/partner/login');
      return;
    }
    
    try {
      const parsedPartner = JSON.parse(partnerData);
      setPartner(parsedPartner);
      fetchDocuments(parsedPartner.partnership_id);
    } catch (error) {
      console.error('Error parsing partner data:', error);
      navigate('/partner/login');
    }
  }, [navigate]);

  const fetchDocuments = async (partnershipId: string) => {
    try {
      setLoading(true);
      const docs = await api.getPartnerDocuments(partnershipId);
      setDocuments(docs);
    } catch (error) {
      console.error('Error fetching documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('partnerToken');
    localStorage.removeItem('partnerData');
    navigate('/partner/login');
  };

  const handleFileUpload = async (documentId: string, file: File) => {
    setUploading(documentId);
    try {
      // Simulate file upload (in production, use actual file storage)
      const documentUrl = `https://example.com/uploads/${file.name}`;
      
      await api.submitPartnerDocument(documentId, {
        document_url: documentUrl,
        file_size: file.size,
        mime_type: file.type
      });
      
      // Refresh documents
      await fetchDocuments(partner.partnership_id);
      
      alert('Document uploaded successfully!');
    } catch (error) {
      console.error('Error uploading document:', error);
      alert('Error uploading document. Please try again.');
    } finally {
      setUploading(null);
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

  if (loading) {
    return (
      <div className="pt-16 min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const requiredDocs = documents.filter(doc => doc.is_required);
  const optionalDocs = documents.filter(doc => !doc.is_required);
  const submittedCount = documents.filter(doc => doc.is_submitted).length;
  const approvedCount = documents.filter(doc => doc.admin_review_status === 'approved').length;

  return (
    <div className="pt-16 min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-secondary-500 rounded-lg flex items-center justify-center">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {partner?.stitching_partnerships?.unit_name}
                </h1>
                <p className="text-gray-600">Partner Dashboard</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 text-gray-600 hover:text-red-600 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <FileText className="w-8 h-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Documents</p>
                <p className="text-2xl font-bold text-gray-900">{documents.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <Upload className="w-8 h-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Submitted</p>
                <p className="text-2xl font-bold text-gray-900">{submittedCount}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <CheckCircle className="w-8 h-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Approved</p>
                <p className="text-2xl font-bold text-gray-900">{approvedCount}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <Clock className="w-8 h-8 text-gray-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending Review</p>
                <p className="text-2xl font-bold text-gray-900">
                  {documents.filter(doc => doc.admin_review_status === 'pending').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Partnership Status */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Partnership Status</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-gray-600 mb-1">Current Status</p>
              <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                partner?.stitching_partnerships?.status === 'documents_requested' 
                  ? 'bg-yellow-100 text-yellow-800' 
                  : 'bg-blue-100 text-blue-800'
              }`}>
                {partner?.stitching_partnerships?.status?.replace('_', ' ').toUpperCase()}
              </span>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Owner</p>
              <p className="font-medium text-gray-900">{partner?.stitching_partnerships?.owner_name}</p>
            </div>
          </div>
        </div>

        {/* Required Documents */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Required Documents</h2>
          <div className="space-y-4">
            {requiredDocs.map((doc) => (
              <div key={doc.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(doc.admin_review_status)}
                    <div>
                      <h3 className="font-medium text-gray-900">{doc.document_name}</h3>
                      <p className="text-sm text-gray-600">{doc.document_type.replace('_', ' ').toUpperCase()}</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(doc.admin_review_status)}`}>
                    {doc.admin_review_status.replace('_', ' ').toUpperCase()}
                  </span>
                </div>

                {doc.admin_comments && (
                  <div className="mb-3 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-700">
                      <strong>Admin Comments:</strong> {doc.admin_comments}
                    </p>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    {doc.is_submitted ? (
                      <span>Submitted on {new Date(doc.submission_date!).toLocaleDateString()}</span>
                    ) : (
                      <span>Not submitted</span>
                    )}
                  </div>
                  
                  {!doc.is_submitted || doc.admin_review_status === 'needs_revision' ? (
                    <div>
                      <input
                        type="file"
                        id={`file-${doc.id}`}
                        className="hidden"
                        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            handleFileUpload(doc.id, file);
                          }
                        }}
                      />
                      <label
                        htmlFor={`file-${doc.id}`}
                        className={`cursor-pointer inline-flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                          uploading === doc.id
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : 'bg-primary-600 text-white hover:bg-primary-700'
                        }`}
                      >
                        {uploading === doc.id ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            <span>Uploading...</span>
                          </>
                        ) : (
                          <>
                            <Upload className="w-4 h-4" />
                            <span>{doc.is_submitted ? 'Re-upload' : 'Upload'}</span>
                          </>
                        )}
                      </label>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      {doc.document_url && (
                        <a
                          href={doc.document_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center space-x-1 text-primary-600 hover:text-primary-700"
                        >
                          <Eye className="w-4 h-4" />
                          <span>View</span>
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Optional Documents */}
        {optionalDocs.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Optional Documents</h2>
            <div className="space-y-4">
              {optionalDocs.map((doc) => (
                <div key={doc.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(doc.admin_review_status)}
                      <div>
                        <h3 className="font-medium text-gray-900">{doc.document_name}</h3>
                        <p className="text-sm text-gray-600">{doc.document_type.replace('_', ' ').toUpperCase()}</p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(doc.admin_review_status)}`}>
                      {doc.admin_review_status.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>

                  {doc.admin_comments && (
                    <div className="mb-3 p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-700">
                        <strong>Admin Comments:</strong> {doc.admin_comments}
                      </p>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                      {doc.is_submitted ? (
                        <span>Submitted on {new Date(doc.submission_date!).toLocaleDateString()}</span>
                      ) : (
                        <span>Not submitted</span>
                      )}
                    </div>
                    
                    {!doc.is_submitted || doc.admin_review_status === 'needs_revision' ? (
                      <div>
                        <input
                          type="file"
                          id={`file-${doc.id}`}
                          className="hidden"
                          accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              handleFileUpload(doc.id, file);
                            }
                          }}
                        />
                        <label
                          htmlFor={`file-${doc.id}`}
                          className={`cursor-pointer inline-flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                            uploading === doc.id
                              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                              : 'bg-primary-600 text-white hover:bg-primary-700'
                          }`}
                        >
                          {uploading === doc.id ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                              <span>Uploading...</span>
                            </>
                          ) : (
                            <>
                              <Upload className="w-4 h-4" />
                              <span>{doc.is_submitted ? 'Re-upload' : 'Upload'}</span>
                            </>
                          )}
                        </label>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        {doc.document_url && (
                          <a
                            href={doc.document_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center space-x-1 text-primary-600 hover:text-primary-700"
                          >
                            <Eye className="w-4 h-4" />
                            <span>View</span>
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PartnerDashboard;